using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Ghana
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("GH", n, ValidationErrorCode.Empty);
        if (n.Length < 11 || n.Length > 13) return ValidationResult.Fail("GH", n, ValidationErrorCode.InvalidLength);
        if (n.Length == 11)
        {
            if (!Regex.IsMatch(n, @"^[A-Z]\d{10}$"))
                return ValidationResult.Fail("GH", n, ValidationErrorCode.InvalidFormat);
        }
        else
        {
            if (!Regex.IsMatch(n, @"^[A-Z]{3}\d{8,9}[0-9A-Z]$"))
                return ValidationResult.Fail("GH", n, ValidationErrorCode.InvalidFormat);
        }
        return ValidationResult.Ok("GH", n, ValidationLevel.Format);
    }
}
