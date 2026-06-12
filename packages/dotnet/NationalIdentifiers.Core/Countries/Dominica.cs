using System.Text.RegularExpressions;

namespace NationalIdentifiers.Core.Countries;

internal static class Dominica
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n))
            return ValidationResult.Fail("DM", n, ValidationErrorCode.Empty);
        if (n.Length > 6)
            return ValidationResult.Fail("DM", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{1,6}$") || Regex.IsMatch(n, @"^0+$"))
            return ValidationResult.Fail("DM", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("DM", n, ValidationLevel.Format);
    }
}
