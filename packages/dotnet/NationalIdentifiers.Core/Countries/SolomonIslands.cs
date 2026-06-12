using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class SolomonIslands
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("SB", n, ValidationErrorCode.Empty);
        if (n.Length != 9) return ValidationResult.Fail("SB", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{9}$") || n == "000000000")
            return ValidationResult.Fail("SB", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("SB", n, ValidationLevel.Format);
    }
}
