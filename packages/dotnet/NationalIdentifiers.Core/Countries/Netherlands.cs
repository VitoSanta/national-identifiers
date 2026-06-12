using System.Text.RegularExpressions;

namespace NationalIdentifiers.Core.Countries;

internal static class Netherlands
{
    internal static ValidationResult Validate(object? value)
    {
        var raw = TaxIdNormalizer.Normalize(value);
        var n   = raw.Length == 8 ? "0" + raw : raw;
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("NL", n, ValidationErrorCode.Empty);
        if (n.Length != 9) return ValidationResult.Fail("NL", n, ValidationErrorCode.InvalidLength);
        if (!System.Text.RegularExpressions.Regex.IsMatch(n, @"^\d{9}$"))
            return ValidationResult.Fail("NL", n, ValidationErrorCode.InvalidFormat);

        int sum = 0;
        for (int i = 0; i < 9; i++)
            sum += (n[i] - '0') * (i == 8 ? -1 : 9 - i);
        if (sum == 0 || sum % 11 != 0) return ValidationResult.Fail("NL", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("NL", n, ValidationLevel.Checksum);
    }
}
