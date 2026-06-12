using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Monaco
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("MC", n, ValidationErrorCode.Empty);
        if (!Regex.IsMatch(n, @"^[A-Z0-9]{5,15}$"))
            return ValidationResult.Fail("MC", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("MC", n, ValidationLevel.Format);
    }
}
