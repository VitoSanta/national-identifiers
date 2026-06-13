using System.Text.Json;
using NationalIdentifiers.Core;
using NationalIdentifiers.Core.Countries;

namespace NationalIdentifiers.Tests;

public class IdentityConsistencyTests
{
    [Fact]
    public void Matches_Shared_Identity_Consistency_Contract()
    {
        var path = Path.Combine(AppContext.BaseDirectory, "identity-consistency-contract.json");
        var fixtures = JsonSerializer.Deserialize<List<IdentityFixture>>(
            File.ReadAllText(path),
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(fixtures);

        foreach (var fixture in fixtures)
        {
            var identity = new TaxIdIdentity(
                fixture.Identity.FirstName,
                fixture.Identity.LastName,
                fixture.Identity.BirthDate is null ? null : DateOnly.Parse(fixture.Identity.BirthDate),
                fixture.Identity.Gender?[0],
                fixture.Identity.BirthPlaceCode);

            var result = TaxIdIdentityValidator.Validate(fixture.Country, fixture.TaxId, identity);

            var context = $"{fixture.Country} '{fixture.TaxId}'";
            Assert.True(
                ParseStatus(fixture.Status) == result.Status,
                $"{context}: expected {fixture.Status}, got {result.Status}.");
            Assert.True(
                fixture.TaxIdValid == result.TaxIdValid,
                $"{context}: expected taxIdValid={fixture.TaxIdValid}.");
            Assert.Equal(fixture.CheckedFields, result.CheckedFields);
            Assert.Equal(fixture.MismatchedFields, result.MismatchedFields);
            Assert.Equal(fixture.MissingFields, result.MissingFields);
        }
    }

    [Fact]
    public void Capability_Is_Declared_Per_Country()
    {
        var capability = TaxIdIdentityValidator.Capability("IT");

        Assert.NotNull(capability);
        Assert.Equal("full", capability.Level);
        Assert.Equal(5, capability.RequiredFields.Count);
        Assert.Null(TaxIdIdentityValidator.Capability("DE"));
        Assert.Null(TaxIdIdentityValidator.Capability(null));
    }

    [Fact]
    public void Declares_All_Encoded_Identity_Capabilities()
    {
        string[] expectedCountries =
        [
            "AL", "BA", "BE", "BG", "CN", "CU", "CZ", "DK", "EE", "FI", "HU",
            "ID", "IS", "IT", "KG", "KR", "KZ", "LK", "LT", "LV", "ME", "MK",
            "MN", "MX", "MY", "NI", "NO", "PK", "PL", "RO", "RS", "SE", "SK",
            "SV", "UA", "UZ", "ZA",
        ];

        Assert.All(expectedCountries, country =>
            Assert.NotNull(TaxIdIdentityValidator.Capability(country)));
        Assert.Equal(37, expectedCountries.Length);
    }

    [Fact]
    public void Matches_Encoded_Identity_Data_For_Every_Non_Italian_Country()
    {
        var path = Path.Combine(
            AppContext.BaseDirectory,
            "identity-consistency-country-cases.json");
        var fixtures = JsonSerializer.Deserialize<List<IdentityCountryCase>>(
            File.ReadAllText(path),
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(fixtures);
        Assert.Equal(36, fixtures.Count);

        foreach (var fixture in fixtures)
        {
            var identity = new TaxIdIdentity(
                fixture.Identity.FirstName,
                fixture.Identity.LastName,
                fixture.Identity.BirthDate is null
                    ? null
                    : DateOnly.Parse(fixture.Identity.BirthDate),
                fixture.Identity.Gender?[0],
                fixture.Identity.BirthPlaceCode);
            var result = TaxIdIdentityValidator.Validate(
                fixture.Country,
                fixture.TaxId,
                identity);

            Assert.NotNull(TaxIdIdentityValidator.Capability(fixture.Country));
            Assert.True(
                result.Status == IdentityConsistencyStatus.Match,
                $"{fixture.Country} '{fixture.TaxId}': expected Match, got {result.Status}.");
            Assert.True(result.TaxIdValid);
            Assert.Empty(result.MismatchedFields);
            Assert.Empty(result.MissingFields);
        }
    }

    [Theory]
    [InlineData("Rossi", "RSS")]
    [InlineData("Fo", "FOX")]
    [InlineData("D'Angelo", "DNG")]
    [InlineData("Bianchì", "BNC")]
    public void Encodes_Surnames(string surname, string expected) =>
        Assert.Equal(expected, ItalyIdentity.EncodeSurname(surname));

    [Theory]
    [InlineData("Mario", "MRA")]
    [InlineData("Gianfranco", "GFR")]
    [InlineData("Vito", "VTI")]
    [InlineData("Nicolò", "NCL")]
    public void Encodes_Given_Names(string name, string expected) =>
        Assert.Equal(expected, ItalyIdentity.EncodeGivenName(name));

    [Fact]
    public void Decodes_Omocodia_Substitutions() =>
        Assert.Equal("RSSMRA85T10A562H", ItalyIdentity.DecodeOmocodia("RSSMRA85T10A56NH"));

    private static IdentityConsistencyStatus ParseStatus(string value) =>
        value switch
        {
            "match" => IdentityConsistencyStatus.Match,
            "partial_match" => IdentityConsistencyStatus.PartialMatch,
            "mismatch" => IdentityConsistencyStatus.Mismatch,
            "insufficient_data" => IdentityConsistencyStatus.InsufficientData,
            "not_supported" => IdentityConsistencyStatus.NotSupported,
            _ => throw new InvalidOperationException($"Unknown status fixture value '{value}'."),
        };

    private sealed record IdentityFixture(
        string Country,
        string TaxId,
        IdentityFields Identity,
        string Status,
        bool TaxIdValid,
        List<string> CheckedFields,
        List<string> MismatchedFields,
        List<string> MissingFields);

    private sealed record IdentityFields(
        string? FirstName,
        string? LastName,
        string? BirthDate,
        string? Gender,
        string? BirthPlaceCode);

    private sealed record IdentityCountryCase(
        string Country,
        string TaxId,
        IdentityFields Identity);
}
