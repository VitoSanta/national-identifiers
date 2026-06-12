using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class SierraLeone
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("SL", n, ValidationErrorCode.Empty);
        if (n.Length != 8) return ValidationResult.Fail("SL", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{8}$") || n == "00000000")
            return ValidationResult.Fail("SL", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("SL", n, ValidationLevel.Format);
    }
}
