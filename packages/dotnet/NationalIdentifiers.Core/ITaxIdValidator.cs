namespace NationalIdentifiers.Core;

/// <summary>
/// Validates national tax identifiers and personal identification numbers.
/// </summary>
public interface ITaxIdValidator
{
    /// <summary>Gets the supported ISO 3166-1 alpha-2 country codes.</summary>
    IReadOnlyList<string> SupportedCountries { get; }

    /// <summary>Gets supported territory codes, kept separate from the 195 states.</summary>
    IReadOnlyList<string> SupportedTerritories { get; }

    /// <summary>Gets countries with dedicated offline VAT validation.</summary>
    IReadOnlyList<string> SupportedVatCountries { get; }

    /// <summary>Gets countries with dedicated company/entity tax validation.</summary>
    IReadOnlyList<string> SupportedCompanyTaxCountries { get; }

    /// <summary>
    /// Validates <paramref name="value"/> as a national identifier for <paramref name="country"/>.
    /// </summary>
    /// <param name="country">ISO 3166-1 alpha-2 country code (case-insensitive).</param>
    /// <param name="value">Identifier to validate. Accepts string or numeric types; all others return <see cref="ValidationErrorCode.Empty"/>.</param>
    ValidationResult Validate(string? country, object? value);

    /// <summary>Validates an explicitly selected identifier family.</summary>
    ValidationResult Validate(string? country, IdentifierType type, object? value);
}
