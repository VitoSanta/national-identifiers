using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Russia
{
    private static readonly int[] W10 = { 2,4,10,3,5,9,4,6,8 };
    private static readonly int[] W12a = { 7,2,4,10,3,5,9,4,6,8 };
    private static readonly int[] W12b = { 3,7,2,4,10,3,5,9,4,6,8 };
    internal static ValidationResult Validate(object? value)
    {
        string n = value is string s ? s.Trim() : string.Empty;
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("RU", n, ValidationErrorCode.Empty);
        if (n.Length != 10 && n.Length != 12) return ValidationResult.Fail("RU", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d+$")) return ValidationResult.Fail("RU", n, ValidationErrorCode.InvalidFormat);
        if (n.Length == 10)
        {
            int sum = 0; for (int i=0;i<9;i++) sum += (n[i]-'0')*W10[i];
            if ((n[9]-'0') != (sum%11)%10) return ValidationResult.Fail("RU", n, ValidationErrorCode.InvalidChecksum);
        }
        else
        {
            int s1=0; for(int i=0;i<10;i++) s1+=(n[i]-'0')*W12a[i];
            int s2=0; for(int i=0;i<11;i++) s2+=(n[i]-'0')*W12b[i];
            if ((n[10]-'0')!=(s1%11)%10 || (n[11]-'0')!=(s2%11)%10)
                return ValidationResult.Fail("RU", n, ValidationErrorCode.InvalidChecksum);
        }
        return ValidationResult.Ok("RU", n, ValidationLevel.Checksum);
    }
}
