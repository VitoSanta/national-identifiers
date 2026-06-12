using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Iraq
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("IQ", n, ValidationErrorCode.Empty);
        if (n.Length != 9) return ValidationResult.Fail("IQ", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{9}$") || n == "000000000")
            return ValidationResult.Fail("IQ", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("IQ", n, ValidationLevel.Format);
    }
}
