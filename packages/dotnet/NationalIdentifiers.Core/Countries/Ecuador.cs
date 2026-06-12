using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Ecuador
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("EC", n, ValidationErrorCode.Empty);
        if (n.Length != 10 && n.Length != 13) return ValidationResult.Fail("EC", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d+$")) return ValidationResult.Fail("EC", n, ValidationErrorCode.InvalidFormat);
        if (n.Length == 13 && n[10..] == "000") return ValidationResult.Fail("EC", n, ValidationErrorCode.InvalidFormat);
        string cedula = n[..10];
        int province = int.Parse(cedula[..2]);
        int thirdDigit = cedula[2] - '0';
        if ((province < 1 || province > 24) && province != 30)
            return ValidationResult.Fail("EC", n, ValidationErrorCode.InvalidFormat);
        if (thirdDigit > 5) return ValidationResult.Fail("EC", n, ValidationErrorCode.InvalidFormat);
        if (!Checksums.Luhn.Validate(cedula)) return ValidationResult.Fail("EC", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("EC", n, ValidationLevel.Checksum);
    }
}
