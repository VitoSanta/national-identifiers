using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class NewZealand
{
    private static readonly int[] PW = { 3, 2, 7, 6, 5, 4, 3, 2 };
    private static readonly int[] SW = { 7, 4, 3, 2, 5, 2, 7, 6 };
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("NZ", n, ValidationErrorCode.Empty);
        if (n.Length < 8 || n.Length > 9) return ValidationResult.Fail("NZ", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{8,9}$")) return ValidationResult.Fail("NZ", n, ValidationErrorCode.InvalidFormat);
        long num = long.Parse(n);
        if (num < 10_000_000L || num > 150_000_000L) return ValidationResult.Fail("NZ", n, ValidationErrorCode.InvalidFormat);
        string padded = n.PadLeft(9, '0');
        int[] b = padded.Take(8).Select(c => c - '0').ToArray();
        int checkDigit = padded[8] - '0';
        int exp = CalcCheck(b, PW);
        if (exp == 10) exp = CalcCheck(b, SW);
        if (exp == 10 || checkDigit != exp) return ValidationResult.Fail("NZ", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("NZ", n, ValidationLevel.Checksum);
    }
    private static int CalcCheck(int[] b, int[] w)
    {
        int sum = b.Select((v, i) => v * w[i]).Sum();
        int rem = sum % 11;
        return rem == 0 ? 0 : 11 - rem;
    }
}
