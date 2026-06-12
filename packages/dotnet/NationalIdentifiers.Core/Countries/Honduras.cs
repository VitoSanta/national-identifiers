using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Honduras
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("HN", n, ValidationErrorCode.Empty);
        if (n.Length != 14) return ValidationResult.Fail("HN", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{14}$") || n == "00000000000000")
            return ValidationResult.Fail("HN", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("HN", n, ValidationLevel.Format);
    }
}
