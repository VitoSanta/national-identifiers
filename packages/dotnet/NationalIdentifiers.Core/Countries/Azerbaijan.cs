using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Azerbaijan
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("AZ", n, ValidationErrorCode.Empty);
        if (n.Length != 10) return ValidationResult.Fail("AZ", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{10}$") || n == "0000000000")
            return ValidationResult.Fail("AZ", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("AZ", n, ValidationLevel.Format);
    }
}
