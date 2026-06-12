using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Vietnam
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("VN", n, ValidationErrorCode.Empty);
        if (n.Length != 10 && n.Length != 12 && n.Length != 13)
            return ValidationResult.Fail("VN", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d+$") || Regex.IsMatch(n, @"^0+$"))
            return ValidationResult.Fail("VN", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("VN", n, ValidationLevel.Format);
    }
}
