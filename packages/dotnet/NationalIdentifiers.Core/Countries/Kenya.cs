using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Kenya
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("KE", n, ValidationErrorCode.Empty);
        if (n.Length != 11) return ValidationResult.Fail("KE", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[AP]\d{9}[A-Z]$"))
            return ValidationResult.Fail("KE", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("KE", n, ValidationLevel.Format);
    }
}
