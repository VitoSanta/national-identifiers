using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Mauritius
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("MU", n, ValidationErrorCode.Empty);
        if (n.Length != 8) return ValidationResult.Fail("MU", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{8}$") || n == "00000000")
            return ValidationResult.Fail("MU", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("MU", n, ValidationLevel.Format);
    }
}
