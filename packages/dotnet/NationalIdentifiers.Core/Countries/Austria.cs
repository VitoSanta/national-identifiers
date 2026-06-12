using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Austria
{
    internal static ValidationResult Validate(object? value)
    {
        string n = value is string s
            ? Regex.Replace(s.Trim(), @"[\s.\-/]+", "").ToUpperInvariant()
            : TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("AT", n, ValidationErrorCode.Empty);
        if (n.Length != 9) return ValidationResult.Fail("AT", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{9}$")) return ValidationResult.Fail("AT", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("AT", n, ValidationLevel.Format);
    }
}
