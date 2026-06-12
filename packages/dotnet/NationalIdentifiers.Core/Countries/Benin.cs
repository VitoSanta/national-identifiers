using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Benin
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("BJ", n, ValidationErrorCode.Empty);
        if (n.Length != 13) return ValidationResult.Fail("BJ", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{13}$") || n == "0000000000000")
            return ValidationResult.Fail("BJ", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("BJ", n, ValidationLevel.Format);
    }
}
