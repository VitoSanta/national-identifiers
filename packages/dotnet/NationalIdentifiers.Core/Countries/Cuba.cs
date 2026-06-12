using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Cuba
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("CU", n, ValidationErrorCode.Empty);
        if (n.Length != 11) return ValidationResult.Fail("CU", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{11}$")) return ValidationResult.Fail("CU", n, ValidationErrorCode.InvalidFormat);
        int sy = int.Parse(n[..2]); int mo = int.Parse(n[2..4]); int dy = int.Parse(n[4..6]);
        int cd = n[6] - '0';
        int yr = cd == 9 ? 1800 + sy : cd <= 5 ? 1900 + sy : 2000 + sy;
        if (!DateValidator.IsValidDate(yr, mo, dy)) return ValidationResult.Fail("CU", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("CU", n, ValidationLevel.Format);
    }
}
