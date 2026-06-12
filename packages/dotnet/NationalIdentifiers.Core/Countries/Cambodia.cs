using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Cambodia
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("KH", n, ValidationErrorCode.Empty);
        if (n.Length != 9 && n.Length != 10) return ValidationResult.Fail("KH", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d+$") || Regex.IsMatch(n, @"^0+$"))
            return ValidationResult.Fail("KH", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("KH", n, ValidationLevel.Format);
    }
}
