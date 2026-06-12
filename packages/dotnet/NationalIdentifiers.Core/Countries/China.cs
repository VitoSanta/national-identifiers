using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class China
{
    private static readonly int[] W = { 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 };
    private const string CC = "10X98765432";
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("CN", n, ValidationErrorCode.Empty);
        if (n.Length != 18) return ValidationResult.Fail("CN", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[1-9]\d{5}(18|19|20)\d{9}[\dX]$"))
            return ValidationResult.Fail("CN", n, ValidationErrorCode.InvalidFormat);
        int yr = int.Parse(n[6..10]); int mo = int.Parse(n[10..12]); int dy = int.Parse(n[12..14]);
        if (!DateValidator.IsValidDate(yr, mo, dy)) return ValidationResult.Fail("CN", n, ValidationErrorCode.InvalidFormat);
        int sum = n.Take(17).Select((c, i) => (c - '0') * W[i]).Sum();
        if (n[17] != CC[sum % 11]) return ValidationResult.Fail("CN", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("CN", n, ValidationLevel.Checksum);
    }
}
