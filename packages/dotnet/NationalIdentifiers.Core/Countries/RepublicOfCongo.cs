using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class RepublicOfCongo
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("CG", n, ValidationErrorCode.Empty);
        if (n.Length != 17) return ValidationResult.Fail("CG", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[A-Z]\d{16}$"))
            return ValidationResult.Fail("CG", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("CG", n, ValidationLevel.Format);
    }
}
