using System.Collections.ObjectModel;

namespace NationalIdentifiers.Core;

/// <summary>Provides country codes with dedicated company/entity tax validation.</summary>
public static class CompanyTaxCountries
{
    private static readonly ReadOnlyCollection<string> Codes = Array.AsReadOnly(
    [
        "AU", "BR", "CN", "IN", "JP", "KR", "NO", "NZ", "RS", "TR"
    ]);

    private static readonly HashSet<string> CodeSet = new(Codes, StringComparer.OrdinalIgnoreCase);

    /// <summary>Gets supported company tax country codes in alphabetical order.</summary>
    public static IReadOnlyList<string> Supported => Codes;

    /// <summary>Returns whether dedicated company tax validation is available.</summary>
    public static bool IsSupported(string? country) =>
        country is not null && CodeSet.Contains(country.Trim());
}
