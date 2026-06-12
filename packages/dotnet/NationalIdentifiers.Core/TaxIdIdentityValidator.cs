using NationalIdentifiers.Core.Countries;

namespace NationalIdentifiers.Core;

/// <summary>
/// Outcome of a local structural-consistency check between an identifier and
/// user-supplied biographical data. A match never proves that an authority
/// issued the identifier or that it belongs to the person.
/// </summary>
public enum IdentityConsistencyStatus
{
    /// <summary>Every capability-required field was provided and is consistent.</summary>
    Match,

    /// <summary>Every provided field is consistent, but required fields are missing.</summary>
    PartialMatch,

    /// <summary>At least one provided field is not consistent with the identifier.</summary>
    Mismatch,

    /// <summary>No evaluable field was provided, or the identifier itself is invalid.</summary>
    InsufficientData,

    /// <summary>The country does not declare identity-consistency support.</summary>
    NotSupported,
}

/// <summary>Biographical attributes to compare with an identifier. All fields optional.</summary>
public sealed record TaxIdIdentity(
    string? FirstName = null,
    string? LastName = null,
    DateOnly? BirthDate = null,
    char? Gender = null,
    string? BirthPlaceCode = null);

/// <summary>Declared identity-consistency capability for a country.</summary>
public sealed record TaxIdIdentityCapability(
    string Level,
    IReadOnlyList<string> RequiredFields);

/// <summary>
/// Result of an identity-consistency check. Field collections carry the
/// camelCase field names shared with the TypeScript package; personal values
/// are never echoed back.
/// </summary>
public sealed record TaxIdIdentityConsistencyResult(
    IdentityConsistencyStatus Status,
    string Country,
    bool TaxIdValid,
    IReadOnlyList<string> CheckedFields,
    IReadOnlyList<string> MismatchedFields,
    IReadOnlyList<string> MissingFields);

/// <summary>
/// Compares identifiers with biographical data where the identifier format
/// encodes it. Local and offline: nothing is logged or persisted.
/// </summary>
public static class TaxIdIdentityValidator
{
    private static readonly TaxIdValidator Validator = new();

    private static readonly IReadOnlyList<string> ItalianRequiredFields =
        ["firstName", "lastName", "birthDate", "gender", "birthPlaceCode"];

    /// <summary>Returns the declared capability for a country, or <c>null</c>.</summary>
    public static TaxIdIdentityCapability? Capability(string? country) =>
        country?.Trim().ToUpperInvariant() switch
        {
            "IT" => new TaxIdIdentityCapability("full", ItalianRequiredFields),
            _ => null,
        };

    /// <summary>Checks whether <paramref name="taxId"/> is structurally consistent with <paramref name="identity"/>.</summary>
    public static TaxIdIdentityConsistencyResult Validate(
        string? country,
        object? taxId,
        TaxIdIdentity identity)
    {
        ArgumentNullException.ThrowIfNull(identity);

        var validation = Validator.Validate(country, taxId);
        var capability = Capability(validation.Country);

        if (capability is null)
        {
            return new TaxIdIdentityConsistencyResult(
                IdentityConsistencyStatus.NotSupported,
                validation.Country,
                validation.IsValid,
                [], [], []);
        }

        if (!validation.IsValid)
        {
            return new TaxIdIdentityConsistencyResult(
                IdentityConsistencyStatus.InsufficientData,
                validation.Country,
                false,
                [], [],
                capability.RequiredFields.ToArray());
        }

        var (checkedFields, mismatchedFields) =
            ItalyIdentity.Check(validation.NormalizedValue, identity);
        var missingFields = capability.RequiredFields
            .Where(field => !checkedFields.Contains(field))
            .ToArray();

        var status = checkedFields.Count == 0 ? IdentityConsistencyStatus.InsufficientData
            : mismatchedFields.Count > 0 ? IdentityConsistencyStatus.Mismatch
            : missingFields.Length > 0 ? IdentityConsistencyStatus.PartialMatch
            : IdentityConsistencyStatus.Match;

        return new TaxIdIdentityConsistencyResult(
            status,
            validation.Country,
            true,
            checkedFields,
            mismatchedFields,
            missingFields);
    }
}
