using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Zambia
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("ZM", n, ValidationErrorCode.Empty);
        if (n.Length != 10) return ValidationResult.Fail("ZM", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{10}$") || n == "0000000000")
            return ValidationResult.Fail("ZM", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("ZM", n, ValidationLevel.Format);
    }
}
