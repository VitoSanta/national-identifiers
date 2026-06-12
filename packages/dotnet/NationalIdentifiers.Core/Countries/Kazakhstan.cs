using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Kazakhstan
{
    private static readonly int[] PW = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 };
    private static readonly int[] SW = { 3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2 };
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("KZ", n, ValidationErrorCode.Empty);
        if (n.Length != 12) return ValidationResult.Fail("KZ", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{6}[1-6]\d{5}$")) return ValidationResult.Fail("KZ", n, ValidationErrorCode.InvalidFormat);
        int sy = int.Parse(n[..2]); int mo = int.Parse(n[2..4]); int dy = int.Parse(n[4..6]);
        int cd = n[6] - '0';
        int yr = (17 + (int)Math.Ceiling(cd / 2.0)) * 100 + sy;
        if (!DateValidator.IsValidDate(yr, mo, dy)) return ValidationResult.Fail("KZ", n, ValidationErrorCode.InvalidFormat);
        int[] d = n.Select(c => c - '0').ToArray();
        int exp = d.Take(11).Select((v, i) => v * PW[i]).Sum() % 11;
        if (exp == 10) exp = d.Take(11).Select((v, i) => v * SW[i]).Sum() % 11;
        if (exp == 10 || d[11] != exp) return ValidationResult.Fail("KZ", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("KZ", n, ValidationLevel.Checksum);
    }
}
