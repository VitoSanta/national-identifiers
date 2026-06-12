using System.Text.RegularExpressions;

namespace NationalIdentifiers.Core.Countries;

internal static class Suriname
{
    internal static ValidationResult Validate(object? value)
    {
        var normalized = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(normalized))
            return ValidationResult.Fail("SR", normalized, ValidationErrorCode.Empty);

        var compact = value?.ToString()?.Trim() ?? string.Empty;
        if (!Regex.IsMatch(compact, @"^\d+$"))
            return ValidationResult.Fail("SR", normalized, ValidationErrorCode.InvalidFormat);

        if (compact.Length > 10)
            return ValidationResult.Fail("SR", normalized, ValidationErrorCode.InvalidLength);

        return ValidationResult.Ok("SR", normalized, ValidationLevel.Format);
    }
}
