using System.Text.RegularExpressions;

namespace NationalIdentifiers.Core.Countries;

internal static class Germany
{
    private static readonly Regex Pattern = new(@"^\d{11}$", RegexOptions.Compiled);

    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("DE", n, ValidationErrorCode.Empty);
        if (n.Length != 11) return ValidationResult.Fail("DE", n, ValidationErrorCode.InvalidLength);
        if (!Pattern.IsMatch(n) || n[0] == '0') return ValidationResult.Fail("DE", n, ValidationErrorCode.InvalidFormat);
        if (!HasValidDistribution(n[..10])) return ValidationResult.Fail("DE", n, ValidationErrorCode.InvalidFormat);

        int product = 10;
        foreach (char c in n[..10])
        {
            int s = (int.Parse(c.ToString()) + product) % 10;
            if (s == 0) s = 10;
            product = (s * 2) % 11;
        }
        int remainder = 11 - product;
        int expected  = remainder == 10 ? 0 : remainder;
        if (n[10] - '0' != expected) return ValidationResult.Fail("DE", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("DE", n, ValidationLevel.Checksum);
    }

    private static bool HasValidDistribution(string s)
    {
        int[] counts = new int[10];
        foreach (char c in s) counts[c - '0']++;
        int twice = counts.Count(x => x == 2);
        int thrice = counts.Count(x => x == 3);
        int missing = counts.Count(x => x == 0);
        int single = counts.Count(x => x == 1);
        return (twice == 1 && thrice == 0 && missing == 1 && single == 8) ||
               (twice == 0 && thrice == 1 && missing == 2 && single == 7);
    }
}
