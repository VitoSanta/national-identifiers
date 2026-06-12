using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Laos
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("LA", n, ValidationErrorCode.Empty);
        if (n.Length != 11) return ValidationResult.Fail("LA", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{11}$") || n == "00000000000")
            return ValidationResult.Fail("LA", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("LA", n, ValidationLevel.Format);
    }
}
