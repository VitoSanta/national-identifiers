using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Belarus
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("BY", n, ValidationErrorCode.Empty);
        if (n.Length != 9) return ValidationResult.Fail("BY", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{9}$") && !Regex.IsMatch(n, @"^[A-Z]{2}\d{7}$"))
            return ValidationResult.Fail("BY", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("BY", n, ValidationLevel.Format);
    }
}
