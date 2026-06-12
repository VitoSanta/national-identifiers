using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Tanzania
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("TZ", n, ValidationErrorCode.Empty);
        if (n.Length != 9 && n.Length != 10) return ValidationResult.Fail("TZ", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d+$") || Regex.IsMatch(n, @"^0+$"))
            return ValidationResult.Fail("TZ", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("TZ", n, ValidationLevel.Format);
    }
}
