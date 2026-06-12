using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class India
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("IN", n, ValidationErrorCode.Empty);
        if (n.Length != 10) return ValidationResult.Fail("IN", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[A-Z]{3}[ABCFGHJLPT][A-Z]\d{4}[A-Z]$"))
            return ValidationResult.Fail("IN", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("IN", n, ValidationLevel.Format);
    }
}
