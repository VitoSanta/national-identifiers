namespace NationalIdentifiers.Core;

/// <summary>
/// Validates national tax identifiers and personal identification numbers.
/// </summary>
public interface ITaxIdValidator
{
    /// <summary>Gets the supported ISO 3166-1 alpha-2 country codes.</summary>
    IReadOnlyList<string> SupportedCountries { get; }

    /// <summary>
    /// Validates <paramref name="value"/> as a national identifier for <paramref name="country"/>.
    /// </summary>
    /// <param name="country">ISO 3166-1 alpha-2 country code (case-insensitive).</param>
    /// <param name="value">Identifier to validate. Accepts string or numeric types; all others return <see cref="ValidationErrorCode.Empty"/>.</param>
    ValidationResult Validate(string? country, object? value);
}
