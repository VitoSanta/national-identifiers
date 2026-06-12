using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class UnitedStates
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("US", n, ValidationErrorCode.Empty);
        if (n.Length != 9) return ValidationResult.Fail("US", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{9}$")) return ValidationResult.Fail("US", n, ValidationErrorCode.InvalidFormat);
        string area = n[..3]; string group = n[3..5]; string serial = n[5..];
        if (area == "000" || area == "666" || int.Parse(area) >= 900 || group == "00" || serial == "0000")
            return ValidationResult.Fail("US", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("US", n, ValidationLevel.Format);
    }
}
