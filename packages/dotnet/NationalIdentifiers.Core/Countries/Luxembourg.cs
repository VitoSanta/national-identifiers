using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Luxembourg
{
    private static readonly int[][] VM = {
        new[]{0,1,2,3,4,5,6,7,8,9},new[]{1,2,3,4,0,6,7,8,9,5},
        new[]{2,3,4,0,1,7,8,9,5,6},new[]{3,4,0,1,2,8,9,5,6,7},
        new[]{4,0,1,2,3,9,5,6,7,8},new[]{5,9,8,7,6,0,4,3,2,1},
        new[]{6,5,9,8,7,1,0,4,3,2},new[]{7,6,5,9,8,2,1,0,4,3},
        new[]{8,7,6,5,9,3,2,1,0,4},new[]{9,8,7,6,5,4,3,2,1,0}};
    private static readonly int[][] VP = {
        new[]{0,1,2,3,4,5,6,7,8,9},new[]{1,5,7,6,2,8,3,0,9,4},
        new[]{5,8,0,3,7,9,6,1,4,2},new[]{8,9,1,6,0,4,3,5,2,7},
        new[]{9,4,5,3,1,2,6,8,7,0},new[]{4,2,8,6,5,7,3,9,0,1},
        new[]{2,7,9,3,8,0,6,4,1,5},new[]{7,0,4,6,9,1,3,2,5,8}};
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("LU", n, ValidationErrorCode.Empty);
        if (n.Length != 13) return ValidationResult.Fail("LU", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{13}$")) return ValidationResult.Fail("LU", n, ValidationErrorCode.InvalidFormat);
        int yr = int.Parse(n[..4]); int mo = int.Parse(n[4..6]); int dy = int.Parse(n[6..8]);
        if (!DateValidator.IsValidDate(yr,mo,dy)) return ValidationResult.Fail("LU", n, ValidationErrorCode.InvalidFormat);
        if (!LuhnCheck(n[..12])) return ValidationResult.Fail("LU", n, ValidationErrorCode.InvalidChecksum);
        if (!VerhoeffCheck(n)) return ValidationResult.Fail("LU", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("LU", n, ValidationLevel.Checksum);
    }
    private static bool LuhnCheck(string v)
    {
        int sum = 0;
        for (int i = v.Length-1, pos = 0; i >= 0; i--, pos++)
        { int d = v[i]-'0'; if (pos%2==1){d*=2; if(d>9)d-=9;} sum+=d; }
        return sum % 10 == 0;
    }
    private static bool VerhoeffCheck(string v)
    {
        int c = 0;
        for (int i = v.Length-1, pos = 0; i >= 0; i--, pos++)
            c = VM[c][VP[pos%8][v[i]-'0']];
        return c == 0;
    }
}
