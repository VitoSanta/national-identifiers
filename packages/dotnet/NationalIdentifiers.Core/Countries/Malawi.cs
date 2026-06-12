using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Malawi
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("MW", n, ValidationErrorCode.Empty);
        if (n.Length != 10) return ValidationResult.Fail("MW", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^TP\d{8}$"))
            return ValidationResult.Fail("MW", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("MW", n, ValidationLevel.Format);
    }
}
