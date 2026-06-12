namespace NationalIdentifiers.Core;

/// <summary>
/// Describes how deeply an identifier was validated.
/// </summary>
public enum ValidationLevel
{
    /// <summary>Only structure and length were verified; no checksum was computed.</summary>
    Format,

    /// <summary>A publicly documented check-digit algorithm was applied and passed.</summary>
    Checksum,
}
