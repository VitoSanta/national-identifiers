using System.Text.RegularExpressions;

namespace NationalIdentifiers.Core.Countries;

internal static class Micronesia
{
    internal static ValidationResult Validate(object? value)
    {
        var normalized = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(normalized))
            return ValidationResult.Fail("FM", normalized, ValidationErrorCode.Empty);
        if (normalized.Length != 8)
            return ValidationResult.Fail("FM", normalized, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(normalized, @"^\d{8}$") || Regex.IsMatch(normalized, @"^0{8}$"))
            return ValidationResult.Fail("FM", normalized, ValidationErrorCode.InvalidFormat);

        return ValidationResult.Ok("FM", normalized, ValidationLevel.Format);
    }
}
