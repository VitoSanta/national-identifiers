using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Indonesia
{
    internal static ValidationResult Validate(object? value)
    {
        string n = value is string s
            ? Regex.Replace(s.Trim(), @"[\s.\-/]+", "")
            : TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("ID", n, ValidationErrorCode.Empty);
        if (n.Length != 15 && n.Length != 16) return ValidationResult.Fail("ID", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d+$") || Regex.IsMatch(n, @"^0+$"))
            return ValidationResult.Fail("ID", n, ValidationErrorCode.InvalidFormat);
        if (n.Length == 15)
        {
            // NPWP: Luhn on first 9 digits
            if (!Checksums.Luhn.Validate(n[..9]))
                return ValidationResult.Fail("ID", n, ValidationErrorCode.InvalidChecksum);
            return ValidationResult.Ok("ID", n, ValidationLevel.Checksum);
        }
        // NIK (16 digits): date in positions 6-10, first digit != 0
        int rawDay = int.Parse(n[6..8]);
        int day = rawDay > 40 ? rawDay - 40 : rawDay;
        int month = int.Parse(n[8..10]);
        if (n[0] == '0' || day < 1 || day > 31 || month < 1 || month > 12 || n[12..] == "0000")
            return ValidationResult.Fail("ID", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("ID", n, ValidationLevel.Format);
    }
}
