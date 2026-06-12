using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Jamaica
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("JM", n, ValidationErrorCode.Empty);
        if (n.Length != 9) return ValidationResult.Fail("JM", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{9}$") || n == "000000000")
            return ValidationResult.Fail("JM", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("JM", n, ValidationLevel.Format);
    }
}
