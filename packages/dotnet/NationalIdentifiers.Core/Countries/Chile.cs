using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Chile
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value).Replace(".", string.Empty, StringComparison.Ordinal);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("CL", n, ValidationErrorCode.Empty);
        if (n.Length < 8 || n.Length > 9) return ValidationResult.Fail("CL", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[0-9]+[0-9K]$")) return ValidationResult.Fail("CL", n, ValidationErrorCode.InvalidFormat);
        string b = n[..^1]; char actual = n[^1];
        int sum = 0; int mul = 2;
        for (int i = b.Length - 1; i >= 0; i--)
        { sum += (b[i] - '0') * mul; mul = mul == 7 ? 2 : mul + 1; }
        int res = 11 - (sum % 11);
        char exp = res == 11 ? '0' : res == 10 ? 'K' : (char)('0' + res);
        if (actual != exp) return ValidationResult.Fail("CL", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("CL", n, ValidationLevel.Checksum);
    }
}
