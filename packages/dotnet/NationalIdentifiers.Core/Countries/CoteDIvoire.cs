using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class CoteDIvoire
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("CI", n, ValidationErrorCode.Empty);
        if (n.Length != 8) return ValidationResult.Fail("CI", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{7}[A-Z]$"))
            return ValidationResult.Fail("CI", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("CI", n, ValidationLevel.Format);
    }
}
