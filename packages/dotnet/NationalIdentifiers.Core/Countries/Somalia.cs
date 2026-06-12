using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Somalia
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("SO", n, ValidationErrorCode.Empty);
        if (n.Length < 4 || n.Length > 12) return ValidationResult.Fail("SO", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{4,12}$") || Regex.IsMatch(n, @"^0+$"))
            return ValidationResult.Fail("SO", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("SO", n, ValidationLevel.Format);
    }
}
