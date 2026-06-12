using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Madagascar
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("MG", n, ValidationErrorCode.Empty);
        if (n.Length != 10) return ValidationResult.Fail("MG", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{10}$") || n == "0000000000")
            return ValidationResult.Fail("MG", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("MG", n, ValidationLevel.Format);
    }
}
