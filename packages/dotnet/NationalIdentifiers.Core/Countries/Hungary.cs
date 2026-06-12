using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Hungary
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("HU", n, ValidationErrorCode.Empty);
        if (n.Length != 10) return ValidationResult.Fail("HU", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^8\d{9}$")) return ValidationResult.Fail("HU", n, ValidationErrorCode.InvalidFormat);
        int[] d = n.Select(c => c - '0').ToArray();
        int rem = d.Take(9).Select((v, i) => v * (i + 1)).Sum() % 11;
        if (rem == 10 || d[9] != rem) return ValidationResult.Fail("HU", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("HU", n, ValidationLevel.Checksum);
    }
}
