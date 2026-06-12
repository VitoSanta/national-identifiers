using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Guatemala
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("GT", n, ValidationErrorCode.Empty);
        if (n.Length < 3 || n.Length > 9) return ValidationResult.Fail("GT", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{2,8}[\dK]$") || Regex.IsMatch(n, @"^0+K?$"))
            return ValidationResult.Fail("GT", n, ValidationErrorCode.InvalidFormat);
        string b = n[..^1];
        int sum = 0;
        for (int i = b.Length - 1, idx = 0; i >= 0; i--, idx++) sum += (b[i] - '0') * (idx + 2);
        int expVal = (11 - (sum % 11)) % 11;
        char exp = expVal == 10 ? 'K' : (char)('0' + expVal);
        if (n[^1] != exp) return ValidationResult.Fail("GT", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("GT", n, ValidationLevel.Checksum);
    }
}
