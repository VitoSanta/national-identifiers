using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Argentina
{
    private static readonly int[] W = { 5, 4, 3, 2, 7, 6, 5, 4, 3, 2 };
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("AR", n, ValidationErrorCode.Empty);
        if (n.Length != 11) return ValidationResult.Fail("AR", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{11}$")) return ValidationResult.Fail("AR", n, ValidationErrorCode.InvalidFormat);
        int sum = n.Take(10).Select((c, i) => (c - '0') * W[i]).Sum();
        int rem = sum % 11;
        int exp = 11 - rem;
        if (exp == 11) exp = 0;
        else if (exp == 10) exp = 9;
        if (n[10] - '0' != exp) return ValidationResult.Fail("AR", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("AR", n, ValidationLevel.Checksum);
    }
}
