using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Tonga
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("TO", n, ValidationErrorCode.Empty);
        if (n.Length < 4 || n.Length > 16) return ValidationResult.Fail("TO", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[A-Z0-9]{4,16}$"))
            return ValidationResult.Fail("TO", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("TO", n, ValidationLevel.Format);
    }
}
