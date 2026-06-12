using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Mongolia
{
    internal static ValidationResult Validate(object? value)
    {
        var n = value is string s ? s.Trim().ToUpperInvariant() : string.Empty;
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("MN", n, ValidationErrorCode.Empty);
        if (n.Length != 10) return ValidationResult.Fail("MN", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[А-ЯЁӨҮ]{2}\d{8}$"))
            return ValidationResult.Fail("MN", n, ValidationErrorCode.InvalidFormat);
        int yp = int.Parse(n[2..4]); int mo = int.Parse(n[4..6]); int dy = int.Parse(n[6..8]);
        int curYp = DateTime.UtcNow.Year % 100;
        int yr = yp > curYp ? 1900 + yp : 2000 + yp;
        if (!DateValidator.IsValidDate(yr, mo, dy)) return ValidationResult.Fail("MN", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("MN", n, ValidationLevel.Format);
    }
}
