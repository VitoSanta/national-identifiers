using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Romania
{
    private static readonly int[] K = { 2,7,9,1,4,6,3,5,8,2,7,9 };
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("RO", n, ValidationErrorCode.Empty);
        if (n.Length != 13) return ValidationResult.Fail("RO", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[1-9]\d{12}$")) return ValidationResult.Fail("RO", n, ValidationErrorCode.InvalidFormat);
        int fd = n[0] - '0';
        int century = fd == 1 || fd == 2 ? 1900
                    : fd == 3 || fd == 4 ? 1800
                    : fd >= 5 && fd <= 8 ? 2000 : 1900;
        int yr = century + int.Parse(n[1..3]);
        int mo = int.Parse(n[3..5]);
        int dy = int.Parse(n[5..7]);
        int county = int.Parse(n[7..9]);
        if (!DateValidator.IsValidDate(yr, mo, dy) || county > 52)
            return ValidationResult.Fail("RO", n, ValidationErrorCode.InvalidFormat);
        int sum = 0;
        for (int i = 0; i < 12; i++) sum += (n[i] - '0') * K[i];
        int rem = sum % 11;
        int exp = rem == 10 ? 1 : rem;
        if (n[12] - '0' != exp) return ValidationResult.Fail("RO", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("RO", n, ValidationLevel.Checksum);
    }
}
