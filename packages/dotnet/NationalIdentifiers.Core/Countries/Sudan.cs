using System.Text.RegularExpressions;

namespace NationalIdentifiers.Core.Countries;

internal static class Sudan
{
    internal static ValidationResult Validate(object? value)
    {
        var normalized = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(normalized))
            return ValidationResult.Fail("SD", normalized, ValidationErrorCode.Empty);
        if (!Regex.IsMatch(normalized, @"^[0-9A-Z]+$"))
            return ValidationResult.Fail("SD", normalized, ValidationErrorCode.InvalidFormat);

        return ValidationResult.Ok("SD", normalized, ValidationLevel.Format);
    }
}
