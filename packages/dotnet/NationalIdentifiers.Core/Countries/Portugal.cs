using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Portugal
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("PT", n, ValidationErrorCode.Empty);
        if (n.Length != 9) return ValidationResult.Fail("PT", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[1235689]\d{8}$")) return ValidationResult.Fail("PT", n, ValidationErrorCode.InvalidFormat);
        int sum = 0;
        for (int i = 0; i < 8; i++) sum += (n[i] - '0') * (9 - i);
        int rem = 11 - (sum % 11);
        int exp = rem >= 10 ? 0 : rem;
        if (n[8] - '0' != exp) return ValidationResult.Fail("PT", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("PT", n, ValidationLevel.Checksum);
    }
}
