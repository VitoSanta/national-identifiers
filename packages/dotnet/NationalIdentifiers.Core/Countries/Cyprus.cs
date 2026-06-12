using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Cyprus
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("CY", n, ValidationErrorCode.Empty);
        if (n.Length != 9) return ValidationResult.Fail("CY", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{8}[A-Z]$") || n[..8] == "00000000")
            return ValidationResult.Fail("CY", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("CY", n, ValidationLevel.Format);
    }
}
