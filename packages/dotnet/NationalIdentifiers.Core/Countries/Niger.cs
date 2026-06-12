using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Niger
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("NE", n, ValidationErrorCode.Empty);
        if (n.Length < 4 || n.Length > 16) return ValidationResult.Fail("NE", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{4,16}$") || Regex.IsMatch(n, @"^0+$"))
            return ValidationResult.Fail("NE", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("NE", n, ValidationLevel.Format);
    }
}
