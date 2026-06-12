using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Comoros
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("KM", n, ValidationErrorCode.Empty);
        if (n.Length < 8 || n.Length > 10) return ValidationResult.Fail("KM", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{8,10}$") || Regex.IsMatch(n, @"^0+$"))
            return ValidationResult.Fail("KM", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("KM", n, ValidationLevel.Format);
    }
}
