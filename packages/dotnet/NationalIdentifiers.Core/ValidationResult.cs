namespace NationalIdentifiers.Core;

/// <summary>
/// Result of a national identifier validation call.
/// </summary>
public sealed record ValidationResult(
    bool IsValid,
    string Country,
    string NormalizedValue,
    ValidationErrorCode? Error = null,
    ValidationLevel? ValidationLevel = null,
    IdentifierType? IdentifierType = null)
{
    /// <summary>Creates a successful result.</summary>
    internal static ValidationResult Ok(string country, string normalizedValue, ValidationLevel level)
        => new(true, country, normalizedValue, null, level);

    /// <summary>Creates a failed result.</summary>
    internal static ValidationResult Fail(string country, string normalizedValue, ValidationErrorCode error)
        => new(false, country, normalizedValue, error, null);
}
