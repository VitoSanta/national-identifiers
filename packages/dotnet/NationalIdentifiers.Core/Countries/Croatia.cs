using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Croatia
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("HR", n, ValidationErrorCode.Empty);
        if (n.Length != 11) return ValidationResult.Fail("HR", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{11}$")) return ValidationResult.Fail("HR", n, ValidationErrorCode.InvalidFormat);
        int rem = 10;
        foreach (char c in n[..10])
        {
            rem = (rem + (c - '0')) % 10;
            if (rem == 0) rem = 10;
            rem = (rem * 2) % 11;
        }
        int exp = (11 - rem) % 10;
        if (n[10] - '0' != exp) return ValidationResult.Fail("HR", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("HR", n, ValidationLevel.Checksum);
    }
}
