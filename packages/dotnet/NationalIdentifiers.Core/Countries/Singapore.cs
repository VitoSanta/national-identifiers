using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Singapore
{
    private static readonly int[] W = { 2, 7, 6, 5, 4, 3, 2 };
    private const string StChars = "JZIHGFEDCBA";
    private const string FgChars = "XWUTRQPNMLK";
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("SG", n, ValidationErrorCode.Empty);
        if (n.Length != 9) return ValidationResult.Fail("SG", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[STFGM]\d{7}[A-Z]$"))
            return ValidationResult.Fail("SG", n, ValidationErrorCode.InvalidFormat);
        char prefix = n[0];
        if (prefix == 'M') return ValidationResult.Ok("SG", n, ValidationLevel.Format);
        int sum = n.Skip(1).Take(7).Select((c, i) => (c - '0') * W[i]).Sum();
        if (prefix == 'T' || prefix == 'G') sum += 4;
        string table = prefix == 'S' || prefix == 'T' ? StChars : FgChars;
        if (n[8] != table[sum % 11]) return ValidationResult.Fail("SG", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("SG", n, ValidationLevel.Checksum);
    }
}
