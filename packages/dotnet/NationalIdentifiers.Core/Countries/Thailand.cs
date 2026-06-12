using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Thailand
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("TH", n, ValidationErrorCode.Empty);
        if (n.Length != 13) return ValidationResult.Fail("TH", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[1-8]\d{12}$")) return ValidationResult.Fail("TH", n, ValidationErrorCode.InvalidFormat);
        int sum = n.Take(12).Select((c, i) => (c - '0') * (13 - i)).Sum();
        int exp = (11 - (sum % 11)) % 10;
        if (n[12] - '0' != exp) return ValidationResult.Fail("TH", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("TH", n, ValidationLevel.Checksum);
    }
}
