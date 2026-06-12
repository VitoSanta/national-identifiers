using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Lithuania
{
    private static readonly int[] W1 = { 1,2,3,4,5,6,7,8,9,1 };
    private static readonly int[] W2 = { 3,4,5,6,7,8,9,1,2,3 };
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("LT", n, ValidationErrorCode.Empty);
        if (n.Length != 11) return ValidationResult.Fail("LT", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[1-8]\d{10}$")) return ValidationResult.Fail("LT", n, ValidationErrorCode.InvalidFormat);
        int[] d = n.Select(c => c - '0').ToArray();
        int century = 1800 + ((d[0]-1)/2)*100;
        int yr = century + int.Parse(n[1..3]); int mo = int.Parse(n[3..5]); int dy = int.Parse(n[5..7]);
        if (!DateValidator.IsValidDate(yr,mo,dy)) return ValidationResult.Fail("LT", n, ValidationErrorCode.InvalidFormat);
        int exp = WeightedRem(d, W1);
        if (exp == 10) exp = WeightedRem(d, W2);
        if (exp == 10) exp = 0;
        if (d[10] != exp) return ValidationResult.Fail("LT", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("LT", n, ValidationLevel.Checksum);
    }
    private static int WeightedRem(int[] d, int[] w) => d.Take(10).Select((v,i)=>v*w[i]).Sum() % 11;
}
