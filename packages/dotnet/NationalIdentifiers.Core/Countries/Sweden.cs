using System.Text.RegularExpressions;

namespace NationalIdentifiers.Core.Countries;

internal static class Sweden
{
    internal static ValidationResult Validate(object? value)
    {
        string n = value is string s
            ? Regex.Replace(s.Trim(), @"[\s+\-]+", "").ToUpperInvariant()
            : TaxIdNormalizer.Normalize(value);

        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("SE", n, ValidationErrorCode.Empty);
        if (n.Length != 10 && n.Length != 12) return ValidationResult.Fail("SE", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d+$")) return ValidationResult.Fail("SE", n, ValidationErrorCode.InvalidFormat);

        string s10 = n[^10..];
        int month    = int.Parse(s10[2..4]);
        int encDay   = int.Parse(s10[4..6]);
        int day      = encDay > 60 ? encDay - 60 : encDay;
        if (month < 1 || month > 12 || day < 1 || day > 31)
            return ValidationResult.Fail("SE", n, ValidationErrorCode.InvalidFormat);

        int[] d = s10.Select(c => c - '0').ToArray();
        int sum = 0;
        for (int i = 0; i < 9; i++)
        {
            int p = d[i] * (i % 2 == 0 ? 2 : 1);
            sum += p / 10 + p % 10;
        }
        int expected = (10 - sum % 10) % 10;
        if (d[9] != expected) return ValidationResult.Fail("SE", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("SE", n, ValidationLevel.Checksum);
    }
}
