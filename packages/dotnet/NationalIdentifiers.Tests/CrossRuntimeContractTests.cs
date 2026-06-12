using System.Text.Json;
using NationalIdentifiers.Core;

namespace NationalIdentifiers.Tests;

public class CrossRuntimeContractTests
{
    private static readonly TaxIdValidator Validator = new();

    [Fact]
    public void Matches_Shared_Cross_Runtime_Contract()
    {
        var path = Path.Combine(AppContext.BaseDirectory, "cross-runtime-contract.json");
        var fixtures = JsonSerializer.Deserialize<List<ContractFixture>>(
            File.ReadAllText(path),
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(fixtures);

        foreach (var fixture in fixtures)
        {
            var result = Validator.Validate(fixture.Country, fixture.Value);

            var context = $"{fixture.Country} '{fixture.Value}'";
            Assert.True(
                fixture.Valid == result.IsValid,
                $"{context}: expected valid={fixture.Valid}, got {result.IsValid} ({result.Error}).");
            Assert.True(
                ParseError(fixture.Error) == result.Error,
                $"{context}: expected error={fixture.Error}, got {result.Error}.");
            Assert.True(
                ParseLevel(fixture.ValidationLevel) == result.ValidationLevel,
                $"{context}: expected level={fixture.ValidationLevel}, got {result.ValidationLevel}.");
            Assert.True(
                ParseOutcome(fixture.Outcome) == TaxIdPolicy.Evaluate(result),
                $"{context}: expected outcome={fixture.Outcome}, got {TaxIdPolicy.Evaluate(result)}.");
        }
    }

    private static ValidationErrorCode? ParseError(string? value) =>
        value switch
        {
            null => null,
            "empty" => ValidationErrorCode.Empty,
            "invalid_length" => ValidationErrorCode.InvalidLength,
            "invalid_format" => ValidationErrorCode.InvalidFormat,
            "invalid_checksum" => ValidationErrorCode.InvalidChecksum,
            "not_applicable" => ValidationErrorCode.NotApplicable,
            "unsupported_country" => ValidationErrorCode.UnsupportedCountry,
            _ => throw new InvalidOperationException($"Unknown error fixture value '{value}'."),
        };

    private static ValidationLevel? ParseLevel(string? value) =>
        value switch
        {
            null => null,
            "format" => ValidationLevel.Format,
            "checksum" => ValidationLevel.Checksum,
            _ => throw new InvalidOperationException($"Unknown level fixture value '{value}'."),
        };

    private static TaxIdCheckOutcome ParseOutcome(string value) =>
        value switch
        {
            "accept" => TaxIdCheckOutcome.Accept,
            "warn" => TaxIdCheckOutcome.Warn,
            "block" => TaxIdCheckOutcome.Block,
            _ => throw new InvalidOperationException($"Unknown outcome fixture value '{value}'."),
        };

    private sealed record ContractFixture(
        string Country,
        string Value,
        bool Valid,
        string? Error,
        string? ValidationLevel,
        string Outcome);
}
