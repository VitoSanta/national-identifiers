using NationalIdentifiers.Core;

namespace NationalIdentifiers.Tests;

public class InvariantTests
{
    [Fact]
    public void Normalization_Is_Idempotent_For_Generated_Inputs()
    {
        foreach (var value in GenerateValues(1_000).Concat(EdgeValues()))
        {
            var normalized = TaxIdNormalizer.Normalize(value);
            Assert.NotNull(normalized);
            Assert.Equal(normalized, TaxIdNormalizer.Normalize(normalized));
        }
    }

    [Fact]
    public void Validation_Does_Not_Throw_For_Generated_Inputs()
    {
        var validator = new TaxIdValidator();
        var values = GenerateValues(200).Concat(EdgeValues()).ToArray();

        foreach (var country in validator.SupportedCountries)
        foreach (var value in values)
        {
            var exception = Record.Exception(() => validator.Validate(country, value));
            Assert.Null(exception);
        }
    }

    [Fact]
    public void Territory_Validation_Does_Not_Throw_For_Generated_Inputs()
    {
        var validator = new TaxIdValidator();
        var values = GenerateValues(200).Concat(EdgeValues()).ToArray();

        foreach (var territory in validator.SupportedTerritories)
        foreach (var value in values)
        {
            var exception = Record.Exception(() => validator.Validate(territory, value));
            Assert.Null(exception);
        }
    }

    [Fact]
    public void Validation_Does_Not_Throw_For_Malformed_Country_Input()
    {
        var validator = new TaxIdValidator();
        string?[] countries = [null, "", " ", "it", " usa ", "1T", "🏳️", "\0US"];
        var values = GenerateValues(100).Concat(EdgeValues()).ToArray();

        foreach (var country in countries)
        foreach (var value in values)
        {
            var exception = Record.Exception(() => validator.Validate(country, value));
            Assert.Null(exception);
        }
    }

    [Fact]
    public void Identifier_Family_Validation_Does_Not_Throw_For_Generated_Inputs()
    {
        var validator = new TaxIdValidator();
        var values = GenerateValues(120).Concat(EdgeValues()).ToArray();

        foreach (var country in validator.SupportedVatCountries)
        foreach (var value in values)
        {
            var exception = Record.Exception(
                () => validator.Validate(country, IdentifierType.Vat, value));
            Assert.Null(exception);
        }

        foreach (var country in validator.SupportedCompanyTaxCountries)
        foreach (var value in values)
        {
            var exception = Record.Exception(
                () => validator.Validate(country, IdentifierType.TaxIdCompany, value));
            Assert.Null(exception);
        }
    }

    [Fact]
    public void Identity_Consistency_Does_Not_Throw_For_Generated_Inputs()
    {
        var identity = new TaxIdIdentity("Mario", "Rossi", new DateOnly(1985, 12, 10), 'M', "A562");

        foreach (var value in GenerateValues(300).Concat(EdgeValues()))
        {
            var exception = Record.Exception(
                () => TaxIdIdentityValidator.Validate("IT", value, identity));
            Assert.Null(exception);
        }
    }

    private static IReadOnlyList<object?> EdgeValues() =>
    [
        null,
        true,
        false,
        0,
        1234567890,
        double.NaN,
        double.PositiveInfinity,
        new object(),
        Array.Empty<string>(),
        new[] { "RSSMRA85T10A562S" },
        new string(' ', 512),
        new string('A', 2_048),
        "\0\u0001\u0002",
        "１２３４５６７８９０",
        "א-ب-中-🙂",
        "RSS\u200bMRA\uFEFF85T10A562S",
    ];

    private static IReadOnlyList<object?> GenerateValues(int count)
    {
        const string alphabet = " abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-./_\t\n\r\u00a0\u200b\u200d\u202f\uFEFFàèìòùÇÑΩЖ中🙂";
        var random = new Random(0x5eed123);

        return Enumerable.Range(0, count)
            .Select(_ => new string(
                Enumerable.Range(0, random.Next(30))
                    .Select(_ => alphabet[random.Next(alphabet.Length)])
                    .ToArray()))
            .ToArray();
    }
}
