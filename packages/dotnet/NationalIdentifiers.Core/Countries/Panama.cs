using System.Text.RegularExpressions;

namespace NationalIdentifiers.Core.Countries;

internal static class Panama
{
    private static readonly Regex IdPattern = new(
        @"^(?:(?:(?:E|N|PE|AV|PI|SB|EE)-\d{1,2})|(?:\d{1,2}(?:-(?:E|N|PE|AV|PI|SB|EE))?))-\d{1,4}-\d{1,6}$",
        RegexOptions.Compiled);

    internal static ValidationResult Validate(object? value)
    {
        var normalized = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(normalized))
            return ValidationResult.Fail("PA", normalized, ValidationErrorCode.Empty);

        var raw = value is string text
            ? Regex.Replace(text.Trim(), @"\s+", string.Empty).ToUpperInvariant()
            : string.Empty;

        if (!IdPattern.IsMatch(raw) || !normalized.Any(c => c is >= '1' and <= '9'))
            return ValidationResult.Fail("PA", normalized, ValidationErrorCode.InvalidFormat);

        return ValidationResult.Ok("PA", normalized, ValidationLevel.Format);
    }
}
