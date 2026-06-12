using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Australia
{
    private static readonly int[] W = { 1, 4, 3, 7, 5, 8, 6, 9, 10 };
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("AU", n, ValidationErrorCode.Empty);
        if (n.Length != 9) return ValidationResult.Fail("AU", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{9}$") || n == "000000000")
            return ValidationResult.Fail("AU", n, ValidationErrorCode.InvalidFormat);
        int sum = n.Select((c, i) => (c - '0') * W[i]).Sum();
        if (sum % 11 != 0) return ValidationResult.Fail("AU", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("AU", n, ValidationLevel.Checksum);
    }
}
