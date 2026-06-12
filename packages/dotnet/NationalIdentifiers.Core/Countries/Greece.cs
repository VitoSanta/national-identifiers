using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Greece
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("GR", n, ValidationErrorCode.Empty);
        if (n.Length != 9) return ValidationResult.Fail("GR", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{9}$")) return ValidationResult.Fail("GR", n, ValidationErrorCode.InvalidFormat);
        int sum = 0;
        for (int i = 0; i < 8; i++) sum += (n[i] - '0') * (int)Math.Pow(2, 8 - i);
        int exp = (sum % 11) % 10;
        if (n[8] - '0' != exp) return ValidationResult.Fail("GR", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("GR", n, ValidationLevel.Checksum);
    }
}
