using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Colombia
{
    private static readonly int[] Primes = { 3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71 };
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value).Replace(".", string.Empty, StringComparison.Ordinal);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("CO", n, ValidationErrorCode.Empty);
        if (n.Length < 2 || n.Length > 15) return ValidationResult.Fail("CO", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d+$")) return ValidationResult.Fail("CO", n, ValidationErrorCode.InvalidFormat);
        string b = n[..^1]; int actual = n[^1] - '0';
        int sum = 0;
        for (int i = 0; i < b.Length; i++) sum += (b[b.Length - 1 - i] - '0') * Primes[i];
        int rem = sum % 11;
        int exp = rem <= 1 ? rem : 11 - rem;
        if (actual != exp) return ValidationResult.Fail("CO", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("CO", n, ValidationLevel.Checksum);
    }
}
