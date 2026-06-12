using System.Text.RegularExpressions;

namespace NationalIdentifiers.Core.Countries;

internal static class Norway
{
    private static readonly int[] W1 = { 3,7,6,1,8,9,4,5,2 };
    private static readonly int[] W2 = { 5,4,3,2,7,6,5,4,3,2 };

    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("NO", n, ValidationErrorCode.Empty);
        if (n.Length != 11) return ValidationResult.Fail("NO", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{11}$")) return ValidationResult.Fail("NO", n, ValidationErrorCode.InvalidFormat);

        int encDay   = int.Parse(n[..2]);
        int encMonth = int.Parse(n[2..4]);
        int day   = encDay   > 40 ? encDay   - 40 : encDay;
        int month = encMonth > 40 ? encMonth - 40 : encMonth;
        if (month < 1 || month > 12 || day < 1 || day > 31)
            return ValidationResult.Fail("NO", n, ValidationErrorCode.InvalidFormat);

        int[] d = n.Select(c => c - '0').ToArray();
        int? c1 = Mod11Digit(d[..9], W1);
        int? c2 = Mod11Digit(d[..10], W2);
        if (c1 == null || c2 == null || d[9] != c1 || d[10] != c2)
            return ValidationResult.Fail("NO", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("NO", n, ValidationLevel.Checksum);
    }

    private static int? Mod11Digit(int[] digits, int[] weights)
    {
        int sum = digits.Select((d, i) => d * weights[i]).Sum();
        int r = 11 - (sum % 11);
        if (r == 10) return null;
        return r == 11 ? 0 : r;
    }
}
