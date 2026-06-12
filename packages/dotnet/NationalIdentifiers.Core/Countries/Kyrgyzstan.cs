using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Kyrgyzstan
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("KG", n, ValidationErrorCode.Empty);
        if (n.Length != 14) return ValidationResult.Fail("KG", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[12]\d{13}$")) return ValidationResult.Fail("KG", n, ValidationErrorCode.InvalidFormat);
        int dy = int.Parse(n[1..3]); int mo = int.Parse(n[3..5]); int yr = int.Parse(n[5..9]);
        if (!DateValidator.IsValidDate(yr, mo, dy)) return ValidationResult.Fail("KG", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("KG", n, ValidationLevel.Format);
    }
}
