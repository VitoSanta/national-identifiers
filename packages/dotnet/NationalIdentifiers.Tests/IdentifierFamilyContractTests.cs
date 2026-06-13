using System.Text.Json;
using NationalIdentifiers.Core;

namespace NationalIdentifiers.Tests;

public class IdentifierFamilyContractTests
{
    private static readonly TaxIdValidator Validator = new();

    [Fact]
    public void Matches_Shared_Identifier_Family_Contract()
    {
        var path = Path.Combine(AppContext.BaseDirectory, "identifier-family-contract.json");
        var fixtures = JsonSerializer.Deserialize<List<Fixture>>(
            File.ReadAllText(path),
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(fixtures);

        foreach (var fixture in fixtures)
        {
            var type = ParseType(fixture.Type);
            var result = Validator.Validate(fixture.Country, type, fixture.Value);
            var context = $"{fixture.Country}/{fixture.Type} '{fixture.Value}'";

            Assert.True(fixture.Valid == result.IsValid, context);
            Assert.Equal(type, result.IdentifierType);
            Assert.Equal(ParseError(fixture.Error), result.Error);
            Assert.Equal(ParseLevel(fixture.ValidationLevel), result.ValidationLevel);
            Assert.Equal(ParseOutcome(fixture.Outcome), TaxIdPolicy.Evaluate(result));
        }
    }

    private static IdentifierType ParseType(string value) => value switch
    {
        "tax_id_person" => IdentifierType.TaxIdPerson,
        "vat" => IdentifierType.Vat,
        "tax_id_company" => IdentifierType.TaxIdCompany,
        _ => throw new InvalidOperationException($"Unknown identifier type '{value}'."),
    };

    private static ValidationErrorCode? ParseError(string? value) => value switch
    {
        null => null,
        "invalid_length" => ValidationErrorCode.InvalidLength,
        "invalid_format" => ValidationErrorCode.InvalidFormat,
        "invalid_checksum" => ValidationErrorCode.InvalidChecksum,
        "unsupported_country" => ValidationErrorCode.UnsupportedCountry,
        "unsupported_identifier_type" => ValidationErrorCode.UnsupportedIdentifierType,
        _ => throw new InvalidOperationException($"Unknown error '{value}'."),
    };

    private static ValidationLevel? ParseLevel(string? value) => value switch
    {
        null => null,
        "format" => ValidationLevel.Format,
        "checksum" => ValidationLevel.Checksum,
        _ => throw new InvalidOperationException($"Unknown level '{value}'."),
    };

    private static TaxIdCheckOutcome ParseOutcome(string value) => value switch
    {
        "accept" => TaxIdCheckOutcome.Accept,
        "warn" => TaxIdCheckOutcome.Warn,
        "block" => TaxIdCheckOutcome.Block,
        _ => throw new InvalidOperationException($"Unknown outcome '{value}'."),
    };

    private sealed record Fixture(
        string Country,
        string Type,
        string Value,
        bool Valid,
        string? Error,
        string? ValidationLevel,
        string Outcome);
}
