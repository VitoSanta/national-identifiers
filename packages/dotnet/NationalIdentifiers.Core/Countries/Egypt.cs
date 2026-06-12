using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Egypt
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("EG", n, ValidationErrorCode.Empty);
        if (n.Length != 9) return ValidationResult.Fail("EG", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{9}$") || n == "000000000")
            return ValidationResult.Fail("EG", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("EG", n, ValidationLevel.Format);
    }
}
