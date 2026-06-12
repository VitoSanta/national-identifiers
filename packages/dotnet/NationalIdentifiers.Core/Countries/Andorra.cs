using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Andorra
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("AD", n, ValidationErrorCode.Empty);
        if (n.Length != 8) return ValidationResult.Fail("AD", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[A-Z]\d{6}[A-Z]$") || n[1..7] == "000000")
            return ValidationResult.Fail("AD", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("AD", n, ValidationLevel.Format);
    }
}
