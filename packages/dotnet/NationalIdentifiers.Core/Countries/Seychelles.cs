using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Seychelles
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("SC", n, ValidationErrorCode.Empty);
        if (n.Length != 9) return ValidationResult.Fail("SC", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{2}2\d{6}$") || n == "002000000")
            return ValidationResult.Fail("SC", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("SC", n, ValidationLevel.Format);
    }
}
