using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Nicaragua
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("NI", n, ValidationErrorCode.Empty);
        if (n.Length != 14) return ValidationResult.Fail("NI", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{13}[A-Z]$")) return ValidationResult.Fail("NI", n, ValidationErrorCode.InvalidFormat);
        int dy = int.Parse(n[3..5]); int mo = int.Parse(n[5..7]); int yp = int.Parse(n[7..9]);
        int yr = yp > DateTime.UtcNow.Year % 100 ? 1900 + yp : 2000 + yp;
        if (!DateValidator.IsValidDate(yr, mo, dy)) return ValidationResult.Fail("NI", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("NI", n, ValidationLevel.Format);
    }
}
