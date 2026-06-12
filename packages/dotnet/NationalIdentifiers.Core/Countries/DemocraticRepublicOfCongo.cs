using System.Text.RegularExpressions;

namespace NationalIdentifiers.Core.Countries;

internal static class DemocraticRepublicOfCongo
{
    internal static ValidationResult Validate(object? value)
    {
        var normalized = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(normalized))
            return ValidationResult.Fail("CD", normalized, ValidationErrorCode.Empty);

        if (normalized.Length != 9)
            return ValidationResult.Fail("CD", normalized, ValidationErrorCode.InvalidLength);

        if (!Regex.IsMatch(normalized, @"^[A-Z]\d{7}[A-Z]$"))
            return ValidationResult.Fail("CD", normalized, ValidationErrorCode.InvalidFormat);

        return ValidationResult.Ok("CD", normalized, ValidationLevel.Format);
    }
}
