using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class ElSalvador
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("SV", n, ValidationErrorCode.Empty);
        if (n.Length != 14) return ValidationResult.Fail("SV", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{14}$")) return ValidationResult.Fail("SV", n, ValidationErrorCode.InvalidFormat);
        int dy = int.Parse(n[4..6]); int mo = int.Parse(n[6..8]); int yp = int.Parse(n[8..10]);
        int yr = yp > DateTime.UtcNow.Year % 100 ? 1900 + yp : 2000 + yp;
        if (!DateValidator.IsValidDate(yr, mo, dy)) return ValidationResult.Fail("SV", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("SV", n, ValidationLevel.Format);
    }
}
