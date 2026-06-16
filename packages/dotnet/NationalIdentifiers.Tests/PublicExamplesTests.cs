using System.Text.Json;
using NationalIdentifiers.Core;

namespace NationalIdentifiers.Tests;

public class PublicExamplesTests
{
    private static readonly TaxIdValidator Validator = new();

    [Fact]
    public void Public_Examples_Match_Documented_Validation_Contract()
    {
        var path = Path.Combine(AppContext.BaseDirectory, "public-examples.json");
        var examples = JsonSerializer.Deserialize<List<PublicExample>>(
            File.ReadAllText(path),
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(examples);

        foreach (var example in examples)
        {
            var type = ParseType(example.Type);
            var result = Validator.Validate(example.Country, type, example.Value);
            var context = $"{example.Id} ({example.Country}/{example.Type})";

            Assert.True(example.Valid == result.IsValid, context);
            Assert.Equal(type, result.IdentifierType);
            Assert.Equal(ParseError(example.Error), result.Error);
            Assert.Equal(ParseLevel(example.ValidationLevel), result.ValidationLevel);
            Assert.Equal(ParseOutcome(example.Outcome), TaxIdPolicy.Evaluate(result));
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
        "empty" => ValidationErrorCode.Empty,
        "invalid_length" => ValidationErrorCode.InvalidLength,
        "invalid_format" => ValidationErrorCode.InvalidFormat,
        "invalid_checksum" => ValidationErrorCode.InvalidChecksum,
        "not_applicable" => ValidationErrorCode.NotApplicable,
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

    private sealed record PublicExample(
        string Id,
        string Country,
        string Type,
        string Value,
        bool Valid,
        string? Error,
        string? ValidationLevel,
        string Outcome,
        string ExampleType,
        string Source,
        string Notes);
}
