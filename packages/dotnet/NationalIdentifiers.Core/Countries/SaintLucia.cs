using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class SaintLucia
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("LC", n, ValidationErrorCode.Empty);
        if (n.Length < 1 || n.Length > 6) return ValidationResult.Fail("LC", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d+$") || Regex.IsMatch(n, @"^0+$"))
            return ValidationResult.Fail("LC", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("LC", n, ValidationLevel.Format);
    }
}
