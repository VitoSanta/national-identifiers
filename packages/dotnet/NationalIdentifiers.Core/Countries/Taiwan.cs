using System.Text.RegularExpressions;

namespace NationalIdentifiers.Core.Countries;

internal static class Taiwan
{
    private static readonly Regex Pattern = new(
        @"^[A-Z][12]\d{8}$",
        RegexOptions.Compiled | RegexOptions.CultureInvariant);

    private static readonly IReadOnlyDictionary<char, int> LetterCodes =
        new Dictionary<char, int>
        {
            ['A'] = 10, ['B'] = 11, ['C'] = 12, ['D'] = 13, ['E'] = 14,
            ['F'] = 15, ['G'] = 16, ['H'] = 17, ['I'] = 34, ['J'] = 18,
            ['K'] = 19, ['L'] = 20, ['M'] = 21, ['N'] = 22, ['O'] = 35,
            ['P'] = 23, ['Q'] = 24, ['R'] = 25, ['S'] = 26, ['T'] = 27,
            ['U'] = 28, ['V'] = 29, ['W'] = 32, ['X'] = 30, ['Y'] = 31,
            ['Z'] = 33,
        };

    private static readonly int[] Weights = [8, 7, 6, 5, 4, 3, 2, 1, 1];

    internal static ValidationResult Validate(object? value)
    {
        var normalized = Normalize(value);
        if (string.IsNullOrEmpty(normalized))
            return ValidationResult.Fail("TW", normalized, ValidationErrorCode.Empty);
        if (normalized.Length != 10)
            return ValidationResult.Fail("TW", normalized, ValidationErrorCode.InvalidLength);
        if (!Pattern.IsMatch(normalized))
            return ValidationResult.Fail("TW", normalized, ValidationErrorCode.InvalidFormat);

        var code = LetterCodes[normalized[0]];
        var sum = code / 10 + code % 10 * 9;
        for (var index = 1; index < normalized.Length; index++)
            sum += (normalized[index] - '0') * Weights[index - 1];

        return sum % 10 == 0
            ? ValidationResult.Ok("TW", normalized, ValidationLevel.Checksum)
            : ValidationResult.Fail("TW", normalized, ValidationErrorCode.InvalidChecksum);
    }

    private static string Normalize(object? value) =>
        value is string or sbyte or byte or short or ushort or int or uint or long or ulong
            ? Regex.Replace(Convert.ToString(value, System.Globalization.CultureInfo.InvariantCulture)!
                .Trim().ToUpperInvariant(), @"[\s-]+", string.Empty)
            : string.Empty;
}
