using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Japan
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("JP", n, ValidationErrorCode.Empty);
        if (n.Length != 12) return ValidationResult.Fail("JP", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{12}$")) return ValidationResult.Fail("JP", n, ValidationErrorCode.InvalidFormat);
        int[] d = n.Select(c => c - '0').ToArray();
        int sum = 0;
        for (int pos = 1; pos <= 11; pos++)
        { int w = pos <= 6 ? pos + 1 : pos - 5; sum += d[11 - pos] * w; }
        int rem = sum % 11;
        int exp = rem <= 1 ? 0 : 11 - rem;
        if (d[11] != exp) return ValidationResult.Fail("JP", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("JP", n, ValidationLevel.Checksum);
    }
}
