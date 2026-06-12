using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Lesotho
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("LS", n, ValidationErrorCode.Empty);
        if (n.Length != 8) return ValidationResult.Fail("LS", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{8}$") || n == "00000000")
            return ValidationResult.Fail("LS", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("LS", n, ValidationLevel.Format);
    }
}
