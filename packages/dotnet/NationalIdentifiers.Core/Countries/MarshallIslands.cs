using System.Text.RegularExpressions;

namespace NationalIdentifiers.Core.Countries;

internal static class MarshallIslands
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n))
            return ValidationResult.Fail("MH", n, ValidationErrorCode.Empty);
        if (n.Length != 8)
            return ValidationResult.Fail("MH", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^04\d{6}$") || n == "04000000")
            return ValidationResult.Fail("MH", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("MH", n, ValidationLevel.Format);
    }
}
