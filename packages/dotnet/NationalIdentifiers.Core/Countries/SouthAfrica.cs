using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class SouthAfrica
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("ZA", n, ValidationErrorCode.Empty);
        if (n.Length != 10 && n.Length != 13) return ValidationResult.Fail("ZA", n, ValidationErrorCode.InvalidLength);
        if (n.Length == 10)
        {
            if (!Regex.IsMatch(n, @"^[0-39]\d{9}$"))
                return ValidationResult.Fail("ZA", n, ValidationErrorCode.InvalidFormat);
        }
        else
        {
            if (!Regex.IsMatch(n, @"^\d{13}$")) return ValidationResult.Fail("ZA", n, ValidationErrorCode.InvalidFormat);
            int mo = int.Parse(n[2..4]); int dy = int.Parse(n[4..6]); int cd = n[10] - '0';
            if (mo < 1 || mo > 12 || dy < 1 || dy > 31 || cd > 2)
                return ValidationResult.Fail("ZA", n, ValidationErrorCode.InvalidFormat);
        }
        if (!Checksums.Luhn.Validate(n)) return ValidationResult.Fail("ZA", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("ZA", n, ValidationLevel.Checksum);
    }
}
