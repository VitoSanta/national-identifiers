using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Uzbekistan
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("UZ", n, ValidationErrorCode.Empty);
        if (n.Length != 14) return ValidationResult.Fail("UZ", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[1-6]\d{13}$")) return ValidationResult.Fail("UZ", n, ValidationErrorCode.InvalidFormat);
        int cd = n[0] - '0'; int dy = int.Parse(n[1..3]);
        int mo = int.Parse(n[3..5]); int sy = int.Parse(n[5..7]);
        int yr = (17 + (int)Math.Ceiling(cd / 2.0)) * 100 + sy;
        if (!DateValidator.IsValidDate(yr, mo, dy)) return ValidationResult.Fail("UZ", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("UZ", n, ValidationLevel.Format);
    }
}
