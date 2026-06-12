using System.Text.RegularExpressions;

namespace NationalIdentifiers.Core;

/// <summary>
/// Normalises raw identifier input into a canonical string for validation.
/// Strips leading/trailing whitespace, internal whitespace and hyphens, then uppercases.
/// </summary>
public static class TaxIdNormalizer
{
    private static readonly Regex StripPattern = new(@"[\s\-]+", RegexOptions.Compiled);

    /// <summary>
    /// Returns the normalised form of <paramref name="value"/>.
    /// Returns an empty string for null, non-string and non-numeric input.
    /// Never throws.
    /// </summary>
    public static string Normalize(object? value)
    {
        if (value is null)
            return string.Empty;

        string? str = value switch
        {
            string s => s,
            int i    => i.ToString(),
            long l   => l.ToString(),
            double d => d.ToString(),
            float f  => f.ToString(),
            decimal m => m.ToString(),
            _        => null,
        };

        if (str is null)
            return string.Empty;

        return StripPattern.Replace(str.Trim(), string.Empty).ToUpperInvariant();
    }
}
