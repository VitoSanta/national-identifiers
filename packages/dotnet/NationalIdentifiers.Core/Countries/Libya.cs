using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Libya
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("LY", n, ValidationErrorCode.Empty);
        if (n.Length != 12) return ValidationResult.Fail("LY", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[12]\d{11}$"))
            return ValidationResult.Fail("LY", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("LY", n, ValidationLevel.Format);
    }
}
