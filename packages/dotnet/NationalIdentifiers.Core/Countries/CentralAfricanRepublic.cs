using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class CentralAfricanRepublic
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("CF", n, ValidationErrorCode.Empty);
        if (n.Length != 8) return ValidationResult.Fail("CF", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{7}[A-Z]$"))
            return ValidationResult.Fail("CF", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("CF", n, ValidationLevel.Format);
    }
}
