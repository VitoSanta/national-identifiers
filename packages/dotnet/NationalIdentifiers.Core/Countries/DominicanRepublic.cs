using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class DominicanRepublic
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("DO", n, ValidationErrorCode.Empty);
        if (n.Length != 11) return ValidationResult.Fail("DO", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{11}$") || n == "00000000000")
            return ValidationResult.Fail("DO", n, ValidationErrorCode.InvalidFormat);
        if (!Checksums.Luhn.Validate(n)) return ValidationResult.Fail("DO", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("DO", n, ValidationLevel.Checksum);
    }
}
