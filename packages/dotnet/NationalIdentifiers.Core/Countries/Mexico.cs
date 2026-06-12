using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Mexico
{
    private static readonly Dictionary<char, int> CV = new()
    {
        ['0']=0,['1']=1,['2']=2,['3']=3,['4']=4,['5']=5,['6']=6,['7']=7,['8']=8,['9']=9,
        ['A']=10,['B']=11,['C']=12,['D']=13,['E']=14,['F']=15,['G']=16,['H']=17,['I']=18,['J']=19,
        ['K']=20,['L']=21,['M']=22,['N']=23,['O']=25,['P']=26,['Q']=27,['R']=28,['S']=29,['T']=30,
        ['U']=31,['V']=32,['W']=33,['X']=34,['Y']=35,['Z']=36,['&']=24,['Ñ']=38,[' ']=37
    };
    private static readonly Regex RfcFormat = new(
        @"^([A-ZÑ&]{3,4})([0-9]{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12][0-9]|3[01]))([A-Z0-9]{2})([A-Z0-9])$",
        RegexOptions.CultureInvariant);

    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("MX", n, ValidationErrorCode.Empty);
        if (n.Length != 12 && n.Length != 13) return ValidationResult.Fail("MX", n, ValidationErrorCode.InvalidLength);
        if (!RfcFormat.IsMatch(n)) return ValidationResult.Fail("MX", n, ValidationErrorCode.InvalidFormat);
        string s = n.Length == 12 ? " " + n : n;
        int sum = 0;
        for (int i = 0; i < 12; i++) sum += (CV.TryGetValue(s[i], out int v) ? v : 0) * (13 - i);
        int rem = sum % 11;
        char exp = rem == 0 ? '0' : (11 - rem) == 10 ? 'A' : (char)('0' + (11 - rem));
        if (n[^1] != exp) return ValidationResult.Fail("MX", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("MX", n, ValidationLevel.Checksum);
    }
}
