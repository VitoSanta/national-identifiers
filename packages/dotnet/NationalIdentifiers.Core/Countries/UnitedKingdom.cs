using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class UnitedKingdom
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("GB", n, ValidationErrorCode.Empty);
        // NINO: 2 letters (restricted set), 6 digits, optional A-D suffix
        bool isNino = Regex.IsMatch(n, @"^[A-CEGHJ-PR-TW-Z]{2}\d{6}[A-D]?$");
        // UTR: 10 digits
        bool isUtr = Regex.IsMatch(n, @"^\d{10}$");
        if (!isNino && !isUtr) return ValidationResult.Fail("GB", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("GB", n, ValidationLevel.Format);
    }
}
