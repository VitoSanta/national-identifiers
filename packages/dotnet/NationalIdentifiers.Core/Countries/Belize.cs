using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Belize
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("BZ", n, ValidationErrorCode.Empty);
        if (n.Length != 6) return ValidationResult.Fail("BZ", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{6}$") || n == "000000")
            return ValidationResult.Fail("BZ", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("BZ", n, ValidationLevel.Format);
    }
}
