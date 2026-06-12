using System.Text.RegularExpressions;

namespace NationalIdentifiers.Core.Countries;

internal static class SaintVincentAndTheGrenadines
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n))
            return ValidationResult.Fail("VC", n, ValidationErrorCode.Empty);
        if (!Regex.IsMatch(n, @"^\d+$") || Regex.IsMatch(n, @"^0+$"))
            return ValidationResult.Fail("VC", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("VC", n, ValidationLevel.Format);
    }
}
