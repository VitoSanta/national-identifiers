using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class SouthKorea
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("KR", n, ValidationErrorCode.Empty);
        if (n.Length != 13) return ValidationResult.Fail("KR", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{13}$")) return ValidationResult.Fail("KR", n, ValidationErrorCode.InvalidFormat);
        int sy = int.Parse(n[..2]); int mo = int.Parse(n[2..4]); int dy = int.Parse(n[4..6]);
        int cd = n[6] - '0';
        int yr;
        if (cd == 9 || cd == 0) yr = 1800 + sy;
        else if (cd == 1 || cd == 2 || cd == 5 || cd == 6) yr = 1900 + sy;
        else yr = 2000 + sy;
        if (!DateValidator.IsValidDate(yr, mo, dy)) return ValidationResult.Fail("KR", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("KR", n, ValidationLevel.Format);
    }
}
