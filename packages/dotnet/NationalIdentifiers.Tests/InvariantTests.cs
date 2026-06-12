using NationalIdentifiers.Core;

namespace NationalIdentifiers.Tests;

public class InvariantTests
{
    [Fact]
    public void Normalization_Is_Idempotent_For_Generated_Inputs()
    {
        foreach (var value in GenerateValues(1_000))
        {
            var normalized = TaxIdNormalizer.Normalize(value);
            Assert.Equal(normalized, TaxIdNormalizer.Normalize(normalized));
        }
    }

    [Fact]
    public void Validation_Does_Not_Throw_For_Generated_Inputs()
    {
        var validator = new TaxIdValidator();
        var values = GenerateValues(200);

        foreach (var country in validator.SupportedCountries)
        foreach (var value in values)
        {
            var exception = Record.Exception(() => validator.Validate(country, value));
            Assert.Null(exception);
        }
    }

    private static IReadOnlyList<string> GenerateValues(int count)
    {
        const string alphabet = " abcdefghijklmnopqrstuvwxyz0123456789-./_";
        var random = new Random(0x5eed123);

        return Enumerable.Range(0, count)
            .Select(_ => new string(
                Enumerable.Range(0, random.Next(30))
                    .Select(_ => alphabet[random.Next(alphabet.Length)])
                    .ToArray()))
            .ToArray();
    }
}
