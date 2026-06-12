using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Kiribati
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("KI", n, ValidationErrorCode.Empty);
        if (n.Length > 16) return ValidationResult.Fail("KI", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[A-Z0-9]{1,16}$"))
            return ValidationResult.Fail("KI", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("KI", n, ValidationLevel.Format);
    }
}
