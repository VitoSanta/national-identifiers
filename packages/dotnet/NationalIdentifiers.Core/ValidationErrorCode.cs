namespace NationalIdentifiers.Core;

/// <summary>
/// Error codes returned by a failed validation.
/// </summary>
public enum ValidationErrorCode
{
    /// <summary>Input was null, empty, or not a string/number.</summary>
    Empty,

    /// <summary>Input length does not match any accepted length for the country rule.</summary>
    InvalidLength,

    /// <summary>Input does not match the canonical format pattern.</summary>
    InvalidFormat,

    /// <summary>Format is valid but the check digit is incorrect.</summary>
    InvalidChecksum,

    /// <summary>The jurisdiction does not issue a generalized personal tax identifier.</summary>
    NotApplicable,

    /// <summary>No rule is registered for the given country code.</summary>
    UnsupportedCountry,

    /// <summary>The country is supported, but no rule exists for the requested identifier family.</summary>
    UnsupportedIdentifierType,
}
