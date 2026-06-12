using System.Text.RegularExpressions;

namespace NationalIdentifiers.Core.Countries;

internal static class Grenada
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n))
            return ValidationResult.Fail("GD", n, ValidationErrorCode.Empty);
        if (n.Length != 6)
            return ValidationResult.Fail("GD", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{6}$") || n == "000000")
            return ValidationResult.Fail("GD", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("GD", n, ValidationLevel.Format);
    }
}
