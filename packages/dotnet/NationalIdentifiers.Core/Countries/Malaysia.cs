using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Malaysia
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("MY", n, ValidationErrorCode.Empty);
        if (n.Length != 12) return ValidationResult.Fail("MY", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{12}$")) return ValidationResult.Fail("MY", n, ValidationErrorCode.InvalidFormat);
        int mo = int.Parse(n[2..4]); int dy = int.Parse(n[4..6]);
        if (mo < 1 || mo > 12 || dy < 1 || dy > 31)
            return ValidationResult.Fail("MY", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("MY", n, ValidationLevel.Format);
    }
}
