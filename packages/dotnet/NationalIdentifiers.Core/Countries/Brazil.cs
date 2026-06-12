using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Brazil
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value).Replace(".", string.Empty, StringComparison.Ordinal);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("BR", n, ValidationErrorCode.Empty);
        if (n.Length != 11) return ValidationResult.Fail("BR", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{11}$")) return ValidationResult.Fail("BR", n, ValidationErrorCode.InvalidFormat);
        if (Regex.IsMatch(n, @"^(\d)\1{10}$")) return ValidationResult.Fail("BR", n, ValidationErrorCode.InvalidFormat);
        int s1 = n.Take(9).Select((c, i) => (c - '0') * (10 - i)).Sum();
        int r1 = s1 % 11; int d1 = r1 < 2 ? 0 : 11 - r1;
        int s2 = n.Take(10).Select((c, i) => (c - '0') * (11 - i)).Sum();
        int r2 = s2 % 11; int d2 = r2 < 2 ? 0 : 11 - r2;
        if (n[9] - '0' != d1 || n[10] - '0' != d2)
            return ValidationResult.Fail("BR", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("BR", n, ValidationLevel.Checksum);
    }
}
