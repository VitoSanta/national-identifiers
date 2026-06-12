using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class BurkinaFaso
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("BF", n, ValidationErrorCode.Empty);
        if (n.Length != 9) return ValidationResult.Fail("BF", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{8}[A-Z]$"))
            return ValidationResult.Fail("BF", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("BF", n, ValidationLevel.Format);
    }
}
