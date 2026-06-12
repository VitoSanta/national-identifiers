using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Iran
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("IR", n, ValidationErrorCode.Empty);
        if (n.Length != 10) return ValidationResult.Fail("IR", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{10}$") || Regex.IsMatch(n, @"^(\d)\1{9}$"))
            return ValidationResult.Fail("IR", n, ValidationErrorCode.InvalidFormat);
        int sum = n.Take(9).Select((c, i) => (c - '0') * (10 - i)).Sum();
        int rem = sum % 11;
        int exp = rem < 2 ? rem : 11 - rem;
        if (n[9] - '0' != exp) return ValidationResult.Fail("IR", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("IR", n, ValidationLevel.Checksum);
    }
}
