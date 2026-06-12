using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Philippines
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("PH", n, ValidationErrorCode.Empty);
        if (n.Length != 9 && n.Length != 12) return ValidationResult.Fail("PH", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{9}(\d{3})?$") || n[..9] == "000000000")
            return ValidationResult.Fail("PH", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("PH", n, ValidationLevel.Format);
    }
}
