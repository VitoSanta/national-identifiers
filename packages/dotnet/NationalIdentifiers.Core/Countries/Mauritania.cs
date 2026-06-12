using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Mauritania
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("MR", n, ValidationErrorCode.Empty);
        if (n.Length != 8) return ValidationResult.Fail("MR", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{8}$") || n == "00000000")
            return ValidationResult.Fail("MR", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("MR", n, ValidationLevel.Format);
    }
}
