using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Nigeria
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("NG", n, ValidationErrorCode.Empty);
        if (n.Length != 10 && n.Length != 12) return ValidationResult.Fail("NG", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d+$") || Regex.IsMatch(n, @"^0+$"))
            return ValidationResult.Fail("NG", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("NG", n, ValidationLevel.Format);
    }
}
