using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Togo
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("TG", n, ValidationErrorCode.Empty);
        if (n.Length != 13) return ValidationResult.Fail("TG", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[0-3]\d{12}$"))
            return ValidationResult.Fail("TG", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("TG", n, ValidationLevel.Format);
    }
}
