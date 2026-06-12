using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Barbados
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("BB", n, ValidationErrorCode.Empty);
        if (n.Length != 13) return ValidationResult.Fail("BB", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{13}$") || n == "0000000000000")
            return ValidationResult.Fail("BB", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("BB", n, ValidationLevel.Format);
    }
}
