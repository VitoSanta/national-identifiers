using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class CapeVerde
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("CV", n, ValidationErrorCode.Empty);
        if (n.Length != 9) return ValidationResult.Fail("CV", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{9}$") || n == "000000000")
            return ValidationResult.Fail("CV", n, ValidationErrorCode.InvalidFormat);
        int sum = n.Take(8).Select((c, i) => (c - '0') * (9 - i)).Sum();
        int rem = sum % 11;
        int exp = rem < 2 ? 0 : 11 - rem;
        if (n[8] - '0' != exp) return ValidationResult.Fail("CV", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("CV", n, ValidationLevel.Checksum);
    }
}
