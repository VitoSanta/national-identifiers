using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Finland
{
    private const string CtrlChars = "0123456789ABCDEFHJKLMNPRSTUVWXY";
    private static readonly Dictionary<char, int> CenturyMap = new()
    {
        {'+',1800},{'-',1900},{'U',1900},{'V',1900},{'W',1900},{'X',1900},{'Y',1900},
        {'A',2000},{'B',2000},{'C',2000},{'D',2000},{'E',2000},{'F',2000}
    };
    internal static ValidationResult Validate(object? value)
    {
        string n = value is string s
            ? Regex.Replace(s.Trim(), @"\s+", "").ToUpperInvariant()
            : TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("FI", n, ValidationErrorCode.Empty);
        if (n.Length != 11) return ValidationResult.Fail("FI", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{6}[+\-ABCDEFUVWXY]\d{3}[0-9ABCDEFHJKLMNPRSTUVWXY]$"))
            return ValidationResult.Fail("FI", n, ValidationErrorCode.InvalidFormat);
        int dy = int.Parse(n[..2]); int mo = int.Parse(n[2..4]); int sy = int.Parse(n[4..6]);
        int yr = CenturyMap[n[6]] + sy;
        int ind = int.Parse(n[7..10]);
        if (!DateValidator.IsValidDate(yr, mo, dy) || ind < 2)
            return ValidationResult.Fail("FI", n, ValidationErrorCode.InvalidFormat);
        long csInput = long.Parse(n[..6] + n[7..10]);
        char exp = CtrlChars[(int)(csInput % 31)];
        if (n[10] != exp) return ValidationResult.Fail("FI", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("FI", n, ValidationLevel.Checksum);
    }
}
