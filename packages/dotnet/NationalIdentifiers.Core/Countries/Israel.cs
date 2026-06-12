using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Israel
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("IL", n, ValidationErrorCode.Empty);
        if (n.Length != 9) return ValidationResult.Fail("IL", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{9}$") || n == "000000000")
            return ValidationResult.Fail("IL", n, ValidationErrorCode.InvalidFormat);
        if (!Checksums.Luhn.Validate(n)) return ValidationResult.Fail("IL", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("IL", n, ValidationLevel.Checksum);
    }
}
