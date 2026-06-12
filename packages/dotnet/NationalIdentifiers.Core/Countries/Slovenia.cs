using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Slovenia
{
    private static readonly int[] W = { 8,7,6,5,4,3,2 };
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("SI", n, ValidationErrorCode.Empty);
        if (n.Length != 8) return ValidationResult.Fail("SI", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{8}$")) return ValidationResult.Fail("SI", n, ValidationErrorCode.InvalidFormat);
        int sum = n.Take(7).Select((c,i)=>(c-'0')*W[i]).Sum();
        int rem = 11 - (sum % 11);
        int exp = rem is 10 or 11 ? 0 : rem;
        if (n[7]-'0' != exp) return ValidationResult.Fail("SI", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("SI", n, ValidationLevel.Checksum);
    }
}
