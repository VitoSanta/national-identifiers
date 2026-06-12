using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Cameroon
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("CM", n, ValidationErrorCode.Empty);
        if (n.Length != 14) return ValidationResult.Fail("CM", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^P\d{12}[A-Z]$"))
            return ValidationResult.Fail("CM", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("CM", n, ValidationLevel.Format);
    }
}
