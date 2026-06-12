using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Algeria
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("DZ", n, ValidationErrorCode.Empty);
        if (n.Length != 15 && n.Length != 20) return ValidationResult.Fail("DZ", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d+$")) return ValidationResult.Fail("DZ", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("DZ", n, ValidationLevel.Format);
    }
}
