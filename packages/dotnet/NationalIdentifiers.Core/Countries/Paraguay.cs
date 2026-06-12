using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Paraguay
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("PY", n, ValidationErrorCode.Empty);
        if (n.Length < 5 || n.Length > 9) return ValidationResult.Fail("PY", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d+$") || Regex.IsMatch(n, @"^0+$"))
            return ValidationResult.Fail("PY", n, ValidationErrorCode.InvalidFormat);
        string b = n[..^1]; int actual = n[^1] - '0';
        int sum = 0;
        for (int i = b.Length - 1, idx = 0; i >= 0; i--, idx++) sum += (b[i] - '0') * (idx + 2);
        int rem = sum % 11;
        int exp = rem > 1 ? 11 - rem : 0;
        if (actual != exp) return ValidationResult.Fail("PY", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("PY", n, ValidationLevel.Checksum);
    }
}
