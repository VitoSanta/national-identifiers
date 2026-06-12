using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Djibouti
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("DJ", n, ValidationErrorCode.Empty);
        if (n.Length < 4 || n.Length > 16) return ValidationResult.Fail("DJ", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[A-Z0-9]{4,16}$"))
            return ValidationResult.Fail("DJ", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("DJ", n, ValidationLevel.Format);
    }
}
