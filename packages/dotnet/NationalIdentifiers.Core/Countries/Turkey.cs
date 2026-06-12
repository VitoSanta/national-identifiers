using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Turkey
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("TR", n, ValidationErrorCode.Empty);
        if (n.Length != 11) return ValidationResult.Fail("TR", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[1-9]\d{10}$")) return ValidationResult.Fail("TR", n, ValidationErrorCode.InvalidFormat);
        int[] d = n.Select(c => c - '0').ToArray();
        int odd  = d[0]+d[2]+d[4]+d[6]+d[8];
        int even = d[1]+d[3]+d[5]+d[7];
        int exp10 = ((odd*7 - even) % 10 + 10) % 10;
        int exp11 = d[..10].Sum() % 10;
        if (d[9] != exp10 || d[10] != exp11) return ValidationResult.Fail("TR", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("TR", n, ValidationLevel.Checksum);
    }
}
