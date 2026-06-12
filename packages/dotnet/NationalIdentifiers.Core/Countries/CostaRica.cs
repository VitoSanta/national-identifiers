using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class CostaRica
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("CR", n, ValidationErrorCode.Empty);
        if (n.Length != 9) return ValidationResult.Fail("CR", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[1-9]\d{8}$"))
            return ValidationResult.Fail("CR", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("CR", n, ValidationLevel.Format);
    }
}
