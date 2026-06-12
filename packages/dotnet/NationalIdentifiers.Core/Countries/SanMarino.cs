using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class SanMarino
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("SM", n, ValidationErrorCode.Empty);
        if (!Regex.IsMatch(n, @"^\d{5}$") && !Regex.IsMatch(n, @"^\d{9}$") && !Regex.IsMatch(n, @"^SM\d{5}$"))
            return ValidationResult.Fail("SM", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("SM", n, ValidationLevel.Format);
    }
}
