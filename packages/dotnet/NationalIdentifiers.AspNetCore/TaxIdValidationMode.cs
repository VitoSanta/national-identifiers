namespace NationalIdentifiers.AspNetCore;

/// <summary>Controls how advisory validation failures are handled.</summary>
public enum TaxIdValidationMode
{
    /// <summary>
    /// Rejects only definitive failures according to <c>TaxIdPolicy</c>.
    /// Format-only, unsupported and not-applicable results are accepted.
    /// </summary>
    Policy,

    /// <summary>Rejects every failed validation result.</summary>
    Strict,
}
