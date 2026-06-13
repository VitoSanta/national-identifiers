using System.Text.RegularExpressions;

namespace NationalIdentifiers.Core.Countries;

/// <summary>
/// Format-only validators for Crown Dependency tax identifiers. Structures are
/// documented by the OECD AEOI TIN sheets; no public check digit is defined,
/// so these confirm structure only. See docs/COUNTRY-COVERAGE.md.
/// </summary>
internal static class CrownDependencies
{
    private static readonly Regex Jersey = new(@"^JY\d{6}[A-Z]$", RegexOptions.Compiled);
    private static readonly Regex Guernsey = new(@"^\d[A-Z]{2}\d{6}[A-Z]?$", RegexOptions.Compiled);

    internal static ValidationResult ValidateJersey(object? value) => Format("JE", value, Jersey);

    internal static ValidationResult ValidateGuernsey(object? value) => Format("GG", value, Guernsey);

    private static ValidationResult Format(string country, object? value, Regex pattern)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail(country, n, ValidationErrorCode.Empty);
        return pattern.IsMatch(n)
            ? ValidationResult.Ok(country, n, ValidationLevel.Format)
            : ValidationResult.Fail(country, n, ValidationErrorCode.InvalidFormat);
    }
}
