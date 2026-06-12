using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Peru
{
    private static readonly int[] DniW = { 3, 2, 7, 6, 5, 4, 3, 2 };
    private static readonly int[] RucW = { 5, 4, 3, 2, 7, 6, 5, 4, 3, 2 };
    private static readonly char[] LetterMap = { 'K', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J' };

    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value).Replace(".", string.Empty, StringComparison.Ordinal);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("PE", n, ValidationErrorCode.Empty);
        if (n.Length != 8 && n.Length != 9 && n.Length != 11)
            return ValidationResult.Fail("PE", n, ValidationErrorCode.InvalidLength);

        if (n.Length == 8)
        {
            if (!Regex.IsMatch(n, @"^\d{8}$")) return ValidationResult.Fail("PE", n, ValidationErrorCode.InvalidFormat);
            return ValidationResult.Ok("PE", n, ValidationLevel.Format);
        }

        if (n.Length == 9)
        {
            if (!Regex.IsMatch(n, @"^\d{8}[0-9A-Z]$")) return ValidationResult.Fail("PE", n, ValidationErrorCode.InvalidFormat);
            int sum = n.Take(8).Select((c, i) => (c - '0') * DniW[i]).Sum();
            int rem = sum % 11; int calc = 11 - rem;
            int expNum = calc == 10 ? 0 : calc == 11 ? 1 : calc;
            char expLetter = LetterMap[expNum];
            if (n[8] != ('0' + expNum) && n[8] != expLetter)
                return ValidationResult.Fail("PE", n, ValidationErrorCode.InvalidChecksum);
            return ValidationResult.Ok("PE", n, ValidationLevel.Checksum);
        }

        // 11-digit RUC
        if (!Regex.IsMatch(n, @"^\d{11}$")) return ValidationResult.Fail("PE", n, ValidationErrorCode.InvalidFormat);
        int rucSum = n.Take(10).Select((c, i) => (c - '0') * RucW[i]).Sum();
        int rucRem = rucSum % 11; int rucCalc = 11 - rucRem;
        int rucExp = rucCalc == 10 ? 0 : rucCalc == 11 ? 1 : rucCalc;
        if (n[10] - '0' != rucExp) return ValidationResult.Fail("PE", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("PE", n, ValidationLevel.Checksum);
    }
}
