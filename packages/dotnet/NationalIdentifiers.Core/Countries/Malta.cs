using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Malta
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("MT", n, ValidationErrorCode.Empty);
        if (n.Length != 8) return ValidationResult.Fail("MT", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{7}[ABGHLMPZ]$"))
            return ValidationResult.Fail("MT", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("MT", n, ValidationLevel.Format);
    }
}
