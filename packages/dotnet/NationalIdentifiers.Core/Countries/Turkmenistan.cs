using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Turkmenistan
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("TM", n, ValidationErrorCode.Empty);
        if (n.Length != 12) return ValidationResult.Fail("TM", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{12}$") || n == "000000000000")
            return ValidationResult.Fail("TM", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("TM", n, ValidationLevel.Format);
    }
}
