using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Mali
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("ML", n, ValidationErrorCode.Empty);
        if (n.Length != 10) return ValidationResult.Fail("ML", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{9}[A-Z]$"))
            return ValidationResult.Fail("ML", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("ML", n, ValidationLevel.Format);
    }
}
