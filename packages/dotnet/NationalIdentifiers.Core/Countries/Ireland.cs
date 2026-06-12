using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Ireland
{
    private const string CtrlChars = "WABCDEFGHIJKLMNOPQRSTUV";
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("IE", n, ValidationErrorCode.Empty);
        if (n.Length < 8 || n.Length > 9) return ValidationResult.Fail("IE", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{7}[A-W][AHW]?$")) return ValidationResult.Fail("IE", n, ValidationErrorCode.InvalidFormat);
        int ws = n[..7].Select((c, i) => (c - '0') * (8 - i)).Sum();
        int sl = n.Length > 8 ? n[8] - 64 : 0;
        char exp = CtrlChars[(ws + sl * 9) % 23];
        if (n[7] != exp) return ValidationResult.Fail("IE", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("IE", n, ValidationLevel.Checksum);
    }
}
