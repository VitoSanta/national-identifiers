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
            "AE", "AL", "BA", "BD", "BE", "BG", "BH", "CN", "CU", "CZ", "DK",
            "EE", "EG", "FI", "FR", "HU", "ID", "IS", "IT", "KG", "KR", "KW",
            "KZ", "LK", "LT", "LU", "LV", "ME", "MK", "MN", "MX", "MY", "NI",
            "NO", "PK", "PL", "QA", "RO", "RS", "SE", "SK", "SV", "TW", "UA",
            "UZ", "VN", "ZA",
        ];

        Assert.All(expectedCountries, country =>
            Assert.NotNull(TaxIdIdentityValidator.Capability(country)));
        Assert.Equal(47, expectedCountries.Length);
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
        Assert.Equal(46, fixtures.Count);

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

    [Fact]
    public void Validates_National_Identity_Documents()
    {
        // Mexican CURP: full date + sex + state.
        var curp = TaxIdIdentityValidator.Validate("MX", "HEGG560427MVZRRL04",
            new TaxIdIdentity(BirthDate: new DateOnly(1956, 4, 27), Gender: 'F', BirthPlaceCode: "VZ"));
        Assert.Equal(IdentityConsistencyStatus.Match, curp.Status);
        Assert.Equal(new[] { "birthDate", "gender", "birthPlaceCode" }, curp.CheckedFields);

        // Mexican RFC fallback: date only → partial.
        var rfc = TaxIdIdentityValidator.Validate("MX", "GODE561231GR8",
            new TaxIdIdentity(BirthDate: new DateOnly(1956, 12, 31), Gender: 'M', BirthPlaceCode: "VZ"));
        Assert.Equal(IdentityConsistencyStatus.PartialMatch, rfc.Status);
        Assert.Equal(new[] { "gender", "birthPlaceCode" }, rfc.MissingFields);

        // French NIR: year + month, no day.
        Assert.Equal(IdentityConsistencyStatus.Match, TaxIdIdentityValidator.Validate(
            "FR", "269054958815780",
            new TaxIdIdentity(BirthDate: new DateOnly(1969, 5, 30), Gender: 'F')).Status);
        Assert.Equal(IdentityConsistencyStatus.Mismatch, TaxIdIdentityValidator.Validate(
            "FR", "269054958815780",
            new TaxIdIdentity(BirthDate: new DateOnly(1969, 7, 30), Gender: 'F')).Status);

        // Egyptian National ID: sex mismatch.
        var eg = TaxIdIdentityValidator.Validate("EG", "29501150101238",
            new TaxIdIdentity(BirthDate: new DateOnly(1995, 1, 15), Gender: 'F', BirthPlaceCode: "01"));
        Assert.Equal(IdentityConsistencyStatus.Mismatch, eg.Status);
        Assert.Equal(new[] { "gender" }, eg.MismatchedFields);

        // Structurally invalid document → insufficient_data.
        Assert.Equal(IdentityConsistencyStatus.InsufficientData, TaxIdIdentityValidator.Validate(
            "FR", "269054958815700",
            new TaxIdIdentity(BirthDate: new DateOnly(1969, 5, 30), Gender: 'F')).Status);
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
