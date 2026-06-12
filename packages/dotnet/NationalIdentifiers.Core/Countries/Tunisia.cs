using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Tunisia
{
    internal static ValidationResult Validate(object? value)
    {
        var n = value is string s
            ? Regex.Replace(s.Trim().ToUpperInvariant(), @"[\s\-/]+", "")
            : string.Empty;
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("TN", n, ValidationErrorCode.Empty);
        if (n.Length != 12) return ValidationResult.Fail("TN", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{7}[A-Z]{2}\d{3}$") || n[..7] == "0000000")
            return ValidationResult.Fail("TN", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("TN", n, ValidationLevel.Format);
    }
}
