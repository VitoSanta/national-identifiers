using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Guinea
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("GN", n, ValidationErrorCode.Empty);
        if (n.Length != 9) return ValidationResult.Fail("GN", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{9}$")) return ValidationResult.Fail("GN", n, ValidationErrorCode.InvalidFormat);
        if (!Checksums.Luhn.Validate(n)) return ValidationResult.Fail("GN", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("GN", n, ValidationLevel.Checksum);
    }
}
