using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Poland
{
    private static readonly int[] W = { 1,3,7,9,1,3,7,9,1,3 };
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("PL", n, ValidationErrorCode.Empty);
        if (n.Length != 11) return ValidationResult.Fail("PL", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{11}$")) return ValidationResult.Fail("PL", n, ValidationErrorCode.InvalidFormat);
        if (!HasValidPeselDate(n)) return ValidationResult.Fail("PL", n, ValidationErrorCode.InvalidFormat);
        int sum = 0;
        for (int i = 0; i < 10; i++) sum += (n[i] - '0') * W[i];
        int exp = (10 - sum % 10) % 10;
        if (n[10] - '0' != exp) return ValidationResult.Fail("PL", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("PL", n, ValidationLevel.Checksum);
    }
    private static bool HasValidPeselDate(string n)
    {
        int y = int.Parse(n[..2]);
        int em = int.Parse(n[2..4]);
        int d  = int.Parse(n[4..6]);
        int century, month;
        if      (em >= 81 && em <= 92) { century = 1800; month = em - 80; }
        else if (em >= 1  && em <= 12) { century = 1900; month = em; }
        else if (em >= 21 && em <= 32) { century = 2000; month = em - 20; }
        else if (em >= 41 && em <= 52) { century = 2100; month = em - 40; }
        else if (em >= 61 && em <= 72) { century = 2200; month = em - 60; }
        else return false;
        return DateValidator.IsValidDate(century + y, month, d);
    }
}
