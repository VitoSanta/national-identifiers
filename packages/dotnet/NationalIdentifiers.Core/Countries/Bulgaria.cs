using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Bulgaria
{
    private static readonly int[] W = { 2,4,8,5,10,9,7,3,6 };
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("BG", n, ValidationErrorCode.Empty);
        if (n.Length != 10) return ValidationResult.Fail("BG", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{10}$")) return ValidationResult.Fail("BG", n, ValidationErrorCode.InvalidFormat);
        int yp = int.Parse(n[..2]);
        int em = int.Parse(n[2..4]);
        int dy = int.Parse(n[4..6]);
        int yr, mo;
        if      (em >= 1  && em <= 12) { yr = 1900 + yp; mo = em; }
        else if (em >= 21 && em <= 32) { yr = 1800 + yp; mo = em - 20; }
        else if (em >= 41 && em <= 52) { yr = 2000 + yp; mo = em - 40; }
        else return ValidationResult.Fail("BG", n, ValidationErrorCode.InvalidFormat);
        if (!DateValidator.IsValidDate(yr, mo, dy))
            return ValidationResult.Fail("BG", n, ValidationErrorCode.InvalidFormat);
        int sum = 0;
        for (int i = 0; i < 9; i++) sum += (n[i] - '0') * W[i];
        int exp = sum % 11 == 10 ? 0 : sum % 11;
        if (n[9] - '0' != exp) return ValidationResult.Fail("BG", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("BG", n, ValidationLevel.Checksum);
    }
}
