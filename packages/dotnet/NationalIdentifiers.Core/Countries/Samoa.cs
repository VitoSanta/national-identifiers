using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Samoa
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("WS", n, ValidationErrorCode.Empty);
        if (n.Length < 5 || n.Length > 9) return ValidationResult.Fail("WS", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d+$") || Regex.IsMatch(n, @"^0+$"))
            return ValidationResult.Fail("WS", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("WS", n, ValidationLevel.Format);
    }
}
