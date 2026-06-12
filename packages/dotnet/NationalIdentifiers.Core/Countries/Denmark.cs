using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Denmark
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("DK", n, ValidationErrorCode.Empty);
        if (n.Length != 10) return ValidationResult.Fail("DK", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{10}$")) return ValidationResult.Fail("DK", n, ValidationErrorCode.InvalidFormat);
        int dy = int.Parse(n[..2]); int mo = int.Parse(n[2..4]);
        int sy = int.Parse(n[4..6]); int cd = n[6] - '0';
        int yr = ResolveCprYear(sy, cd);
        if (!DateValidator.IsValidDate(yr, mo, dy)) return ValidationResult.Fail("DK", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("DK", n, ValidationLevel.Format);
    }
    private static int ResolveCprYear(int sy, int cd)
    {
        if (cd <= 3) return 1900 + sy;
        if (cd == 4 || cd == 9) return (sy <= 36 ? 2000 : 1900) + sy;
        return (sy <= 57 ? 2000 : 1800) + sy;
    }
}
