using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Bolivia
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("BO", n, ValidationErrorCode.Empty);
        if (n.Length < 7 || n.Length > 10) return ValidationResult.Fail("BO", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d+$") || Regex.IsMatch(n, @"^0+$"))
            return ValidationResult.Fail("BO", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("BO", n, ValidationLevel.Format);
    }
}
