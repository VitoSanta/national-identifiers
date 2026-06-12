using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Belgium
{
    internal static ValidationResult Validate(object? value)
    {
        string n = value is string s
            ? Regex.Replace(s.Trim(), @"[\s.\-/]+", "")
            : TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("BE", n, ValidationErrorCode.Empty);
        if (n.Length != 11) return ValidationResult.Fail("BE", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{11}$")) return ValidationResult.Fail("BE", n, ValidationErrorCode.InvalidFormat);
        long first9 = long.Parse(n[..9]);
        int check = int.Parse(n[9..]);
        int pre2000  = (int)(97 - first9 % 97);
        int post2000 = (int)(97 - (2_000_000_000L + first9) % 97);
        if (check != pre2000 && check != post2000) return ValidationResult.Fail("BE", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("BE", n, ValidationLevel.Checksum);
    }
}
