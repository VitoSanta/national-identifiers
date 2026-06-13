using System.Text.RegularExpressions;

namespace NationalIdentifiers.Core.Countries;

internal static class HongKong
{
    private static readonly Regex Pattern = new(
        @"^[A-Z]{1,2}\d{6}[0-9A]$",
        RegexOptions.Compiled | RegexOptions.CultureInvariant);

    internal static ValidationResult Validate(object? value)
    {
        var normalized = Normalize(value);
        if (string.IsNullOrEmpty(normalized))
            return ValidationResult.Fail("HK", normalized, ValidationErrorCode.Empty);
        if (normalized.Length is not (8 or 9))
            return ValidationResult.Fail("HK", normalized, ValidationErrorCode.InvalidLength);
        if (!Pattern.IsMatch(normalized))
            return ValidationResult.Fail("HK", normalized, ValidationErrorCode.InvalidFormat);

        var padded = normalized.Length == 8 ? $" {normalized}" : normalized;
        var sum = 0;
        for (var index = 0; index < 8; index++)
            sum += CharacterValue(padded[index]) * (9 - index);
        sum += CharacterValue(padded[8]);

        return sum % 11 == 0
            ? ValidationResult.Ok("HK", normalized, ValidationLevel.Checksum)
            : ValidationResult.Fail("HK", normalized, ValidationErrorCode.InvalidChecksum);
    }

    private static string Normalize(object? value) =>
        value is string or sbyte or byte or short or ushort or int or uint or long or ulong
            ? Regex.Replace(Convert.ToString(value, System.Globalization.CultureInfo.InvariantCulture)!
                .Trim().ToUpperInvariant(), @"[\s()-]+", string.Empty)
            : string.Empty;

    private static int CharacterValue(char value) =>
        value switch
        {
            ' ' => 36,
            >= 'A' and <= 'Z' => value - 'A' + 10,
            _ => value - '0'
        };
}
