using System.Text.RegularExpressions;

namespace NationalIdentifiers.Core.Countries;

internal static class Palau
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n))
            return ValidationResult.Fail("PW", n, ValidationErrorCode.Empty);
        if (n.Length != 9)
            return ValidationResult.Fail("PW", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{9}$") || Regex.IsMatch(n, @"^0{9}$"))
            return ValidationResult.Fail("PW", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("PW", n, ValidationLevel.Format);
    }
}
