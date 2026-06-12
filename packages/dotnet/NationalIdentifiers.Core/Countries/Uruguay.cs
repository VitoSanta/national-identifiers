using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Uruguay
{
    private static readonly int[] W = { 2, 9, 8, 7, 6, 3, 4 };
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value).Replace(".", string.Empty, StringComparison.Ordinal);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("UY", n, ValidationErrorCode.Empty);
        if (n.Length < 2 || n.Length > 8) return ValidationResult.Fail("UY", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d+$")) return ValidationResult.Fail("UY", n, ValidationErrorCode.InvalidFormat);
        string padded = n.PadLeft(8, '0');
        int sum = padded.Take(7).Select((c, i) => (c - '0') * W[i]).Sum();
        int rem = sum % 10;
        int exp = (10 - rem) % 10;
        if (padded[7] - '0' != exp) return ValidationResult.Fail("UY", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("UY", n, ValidationLevel.Checksum);
    }
}
