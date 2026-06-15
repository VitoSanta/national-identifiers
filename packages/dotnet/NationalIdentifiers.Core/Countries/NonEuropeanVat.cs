using System.Text.RegularExpressions;

namespace NationalIdentifiers.Core.Countries;

internal static class NonEuropeanVat
{
    // UAE Tax Registration Number: the Federal Tax Authority verifier requires
    // 15 characters. VAT TRNs are numeric; issuance/activity requires the
    // authoritative online verifier, so this rule is format-only.
    internal static ValidationResult UnitedArabEmirates(object? value)
    {
        var normalized = value switch
        {
            string s => Regex.Replace(s.Trim(), @"[\s-]+", string.Empty),
            int or long or double or float or decimal => value.ToString() ?? string.Empty,
            _ => string.Empty,
        };

        if (string.IsNullOrEmpty(normalized))
            return ValidationResult.Fail("AE", normalized, ValidationErrorCode.Empty);
        if (normalized.Length != 15)
            return ValidationResult.Fail("AE", normalized, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(normalized, @"^\d{15}$") || normalized == "000000000000000")
            return ValidationResult.Fail("AE", normalized, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("AE", normalized, ValidationLevel.Format);
    }
}
