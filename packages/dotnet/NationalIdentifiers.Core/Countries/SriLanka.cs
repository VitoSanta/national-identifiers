using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class SriLanka
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("LK", n, ValidationErrorCode.Empty);
        if (n.Length != 10 && n.Length != 12) return ValidationResult.Fail("LK", n, ValidationErrorCode.InvalidLength);
        int dayOfYear;
        if (n.Length == 10)
        {
            if (!Regex.IsMatch(n, @"^\d{9}[VX]$")) return ValidationResult.Fail("LK", n, ValidationErrorCode.InvalidFormat);
            dayOfYear = int.Parse(n[2..5]);
        }
        else
        {
            if (!Regex.IsMatch(n, @"^(19|20)\d{10}$")) return ValidationResult.Fail("LK", n, ValidationErrorCode.InvalidFormat);
            dayOfYear = int.Parse(n[4..7]);
        }
        int normalizedDay = dayOfYear > 500 ? dayOfYear - 500 : dayOfYear;
        if (normalizedDay < 1 || normalizedDay > 366)
            return ValidationResult.Fail("LK", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("LK", n, ValidationLevel.Format);
    }
}
