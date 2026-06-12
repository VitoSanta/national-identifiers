using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Latvia
{
    private static readonly int[] W = { 1,6,3,7,9,10,5,8,4,2 };
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("LV", n, ValidationErrorCode.Empty);
        if (n.Length != 11) return ValidationResult.Fail("LV", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{11}$")) return ValidationResult.Fail("LV", n, ValidationErrorCode.InvalidFormat);
        if (!n.StartsWith("32"))
        {
            int day = int.Parse(n[..2]); int mo = int.Parse(n[2..4]);
            if (day < 1 || day > 31 || mo < 1 || mo > 12)
                return ValidationResult.Fail("LV", n, ValidationErrorCode.InvalidFormat);
        }
        int[] d = n.Select(c => c - '0').ToArray();
        int ws = d.Take(10).Select((v, i) => v * W[i]).Sum();
        int exp = (((1101 - ws) % 11) + 11) % 11 % 10;
        if (d[10] != exp) return ValidationResult.Fail("LV", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("LV", n, ValidationLevel.Checksum);
    }
}
