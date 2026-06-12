namespace NationalIdentifiers.Core;

/// <summary>Registration policy decision derived from a validation result.</summary>
public enum TaxIdCheckOutcome
{
    /// <summary>The value passed every available check.</summary>
    Accept,

    /// <summary>The value could not be verified with confidence (format-only
    /// country, no personal TIN, or unsupported country). Store and flag it
    /// instead of turning the user away.</summary>
    Warn,

    /// <summary>The value is definitively wrong. Reject it.</summary>
    Block,
}

/// <summary>Maps validation results to registration policy decisions.</summary>
public static class TaxIdPolicy
{
    /// <summary>
    /// Countries whose rules are institutionally verified up to the check
    /// digit. For these, a length or format failure is definitive.
    /// </summary>
    private static readonly HashSet<string> ChecksumGradeCountries = new(StringComparer.Ordinal)
    {
        "AR", "AU", "BA", "BE", "BG", "BR", "CA", "CH", "CL", "CN", "CO", "CV",
        "CZ", "DE", "DO", "EC", "EE", "ES", "FI", "FR", "GN", "GR", "GT", "HR",
        "HU", "ID", "IE", "IL", "IR", "IS", "IT", "JP", "KZ", "LT", "LU", "LV",
        "ME", "MK", "MX", "NL", "NO", "NZ", "PE", "PL", "PS", "PT", "PY", "RO",
        "RS", "RU", "SE", "SG", "SI", "SK", "SN", "TH", "TR", "UY", "VE", "ZA",
    };

    public static TaxIdCheckOutcome Evaluate(ValidationResult result)
    {
        if (result.IsValid) return TaxIdCheckOutcome.Accept;

        return result.Error switch
        {
            ValidationErrorCode.Empty => TaxIdCheckOutcome.Block,
            ValidationErrorCode.InvalidChecksum => TaxIdCheckOutcome.Block,
            ValidationErrorCode.NotApplicable => TaxIdCheckOutcome.Warn,
            ValidationErrorCode.UnsupportedCountry => TaxIdCheckOutcome.Warn,
            _ => ChecksumGradeCountries.Contains(result.Country)
                ? TaxIdCheckOutcome.Block
                : TaxIdCheckOutcome.Warn,
        };
    }
}
