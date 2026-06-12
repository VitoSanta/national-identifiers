using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Switzerland
{
    internal static ValidationResult Validate(object? value)
    {
        string n = value is string s
            ? Regex.Replace(s.Trim(), @"[\s.\-]+", "")
            : TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("CH", n, ValidationErrorCode.Empty);
        if (n.Length != 13) return ValidationResult.Fail("CH", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^756\d{10}$")) return ValidationResult.Fail("CH", n, ValidationErrorCode.InvalidFormat);
        int sum = 0;
        for (int i = 0; i < 12; i++) sum += (n[i] - '0') * (i % 2 == 0 ? 1 : 3);
        int exp = (10 - sum % 10) % 10;
        if (n[12] - '0' != exp) return ValidationResult.Fail("CH", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("CH", n, ValidationLevel.Checksum);
    }
}
