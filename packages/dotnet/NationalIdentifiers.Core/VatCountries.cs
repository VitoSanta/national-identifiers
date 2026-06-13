using System.Collections.ObjectModel;

namespace NationalIdentifiers.Core;

/// <summary>Provides country codes with dedicated offline VAT validation.</summary>
public static class VatCountries
{
    private static readonly ReadOnlyCollection<string> Codes = Array.AsReadOnly(
    [
        "AT", "AU", "BE", "BG", "CH", "CY", "CZ", "DE", "DK", "EE",
        "ES", "FI", "FR", "GB", "GR", "HR", "HU", "IE", "IT", "LT",
        "LU", "LV", "MT", "NL", "NO", "PL", "PT", "RO", "SE", "SI", "SK"
    ]);

    private static readonly HashSet<string> CodeSet = new(Codes, StringComparer.OrdinalIgnoreCase);

    /// <summary>Gets supported VAT country codes in alphabetical order.</summary>
    public static IReadOnlyList<string> Supported => Codes;

    /// <summary>Returns whether dedicated VAT validation is available.</summary>
    public static bool IsSupported(string? country) =>
        country is not null && CodeSet.Contains(country.Trim());
}
