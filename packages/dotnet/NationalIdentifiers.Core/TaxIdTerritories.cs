using System.Collections.ObjectModel;

namespace NationalIdentifiers.Core;

/// <summary>
/// Provides supported ISO 3166-1 territory codes with autonomous or linked
/// personal tax identifier systems. These are separate from the 195 states.
/// </summary>
public static class TaxIdTerritories
{
    private static readonly ReadOnlyCollection<string> Codes = Array.AsReadOnly(
    [
        "FO", "GG", "GL", "HK", "JE", "PR", "TW"
    ]);

    private static readonly HashSet<string> CodeSet = new(Codes, StringComparer.OrdinalIgnoreCase);

    /// <summary>Gets supported territory codes in alphabetical order.</summary>
    public static IReadOnlyList<string> Supported => Codes;

    /// <summary>Returns whether a territory code is supported.</summary>
    public static bool IsSupported(string? territory) =>
        territory is not null && CodeSet.Contains(territory.Trim());
}
