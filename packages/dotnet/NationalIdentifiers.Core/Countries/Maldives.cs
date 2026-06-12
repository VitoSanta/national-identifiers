using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Maldives
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("MV", n, ValidationErrorCode.Empty);
        if (n.Length != 7) return ValidationResult.Fail("MV", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{7}$") || n == "0000000")
            return ValidationResult.Fail("MV", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("MV", n, ValidationLevel.Format);
    }
}
