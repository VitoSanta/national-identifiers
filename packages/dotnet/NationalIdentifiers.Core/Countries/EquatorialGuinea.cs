using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class EquatorialGuinea
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("GQ", n, ValidationErrorCode.Empty);
        if (n.Length < 7 || n.Length > 9) return ValidationResult.Fail("GQ", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[A-Z0-9]{7,9}$"))
            return ValidationResult.Fail("GQ", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("GQ", n, ValidationLevel.Format);
    }
}
