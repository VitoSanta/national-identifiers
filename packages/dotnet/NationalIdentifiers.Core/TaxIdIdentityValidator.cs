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

    private static readonly IReadOnlyList<string> ItalianFields =
        ["firstName", "lastName", "birthDate", "gender", "birthPlaceCode"];

    private static readonly IReadOnlyList<string> DateAndGenderFields =
        ["birthDate", "gender"];

    private static readonly IReadOnlyList<string> DateGenderAndPlaceFields =
        ["birthDate", "gender", "birthPlaceCode"];

    private static readonly IReadOnlyList<string> DateFields = ["birthDate"];

    private static readonly IReadOnlyList<string> GenderFields = ["gender"];

    private static readonly IReadOnlyList<string> GenderAndPlaceFields =
        ["gender", "birthPlaceCode"];

    private static readonly IReadOnlyDictionary<string, TaxIdIdentityCapability> Capabilities =
        BuildCapabilities();

    /// <summary>Returns the declared capability for a country, or <c>null</c>.</summary>
    public static TaxIdIdentityCapability? Capability(string? country)
    {
        var normalizedCountry = country?.Trim().ToUpperInvariant() ?? string.Empty;
        return Capabilities.GetValueOrDefault(normalizedCountry);
    }

    /// <summary>Checks whether <paramref name="taxId"/> is structurally consistent with <paramref name="identity"/>.</summary>
    public static TaxIdIdentityConsistencyResult Validate(
        string? country,
        object? taxId,
        TaxIdIdentity identity)
    {
        ArgumentNullException.ThrowIfNull(identity);

        var normalizedCountry = country?.Trim().ToUpperInvariant() ?? string.Empty;
        var capability = Capability(normalizedCountry);

        if (capability is null)
        {
            var validation = Validator.Validate(country, taxId);
            return new TaxIdIdentityConsistencyResult(
                IdentityConsistencyStatus.NotSupported,
                validation.Country,
                validation.IsValid,
                [], [], []);
        }

        var normalized = Resolve(normalizedCountry, taxId);

        if (normalized is null)
        {
            return new TaxIdIdentityConsistencyResult(
                IdentityConsistencyStatus.InsufficientData,
                normalizedCountry,
                false,
                [], [],
                capability.RequiredFields.ToArray());
        }

        var (checkedFields, mismatchedFields) = Check(normalizedCountry, normalized, identity);

        var missingFields = capability.RequiredFields
            .Where(field => !checkedFields.Contains(field))
            .ToArray();

        var status = checkedFields.Count == 0 ? IdentityConsistencyStatus.InsufficientData
            : mismatchedFields.Count > 0 ? IdentityConsistencyStatus.Mismatch
            : missingFields.Length > 0 ? IdentityConsistencyStatus.PartialMatch
            : IdentityConsistencyStatus.Match;

        return new TaxIdIdentityConsistencyResult(
            status,
            normalizedCountry,
            true,
            checkedFields,
            mismatchedFields,
            missingFields);
    }

    /// <summary>Validates and normalizes the supplied identifier, or returns null.</summary>
    private static string? Resolve(string country, object? taxId)
    {
        // Mexico accepts the CURP (national ID) or the RFC (tax id).
        if (country == "MX")
        {
            return IdentityDocuments.All["MX"].Resolve(taxId) ?? ViaTaxId("MX", taxId);
        }

        if (IdentityDocuments.All.TryGetValue(country, out var document))
        {
            return document.Resolve(taxId);
        }

        return ViaTaxId(country, taxId);
    }

    private static string? ViaTaxId(string country, object? taxId)
    {
        var result = Validator.Validate(country, taxId);
        return result.IsValid ? result.NormalizedValue : null;
    }

    private static (IReadOnlyList<string>, IReadOnlyList<string>) Check(
        string country,
        string normalized,
        TaxIdIdentity identity)
    {
        if (country == "IT")
            return ItalyIdentity.Check(normalized, identity);

        if (country == "MX")
        {
            var decoder = normalized.Length == 18
                ? IdentityDocuments.All["MX"].Decode
                : EncodedIdentity.Decoders["MX"];
            var encodedCheck = EncodedIdentity.Check(decoder, normalized, identity);
            if (normalized.Length != 18)
                return encodedCheck;
            var nameCheck = MexicoIdentity.Check(normalized, identity);
            return (
                nameCheck.Checked.Concat(encodedCheck.Item1).ToArray(),
                nameCheck.Mismatched.Concat(encodedCheck.Item2).ToArray());
        }

        if (IdentityDocuments.All.TryGetValue(country, out var document))
            return EncodedIdentity.Check(document.Decode, normalized, identity);

        if (EncodedIdentity.Decoders.TryGetValue(country, out var encoded))
            return EncodedIdentity.Check(encoded, normalized, identity);

        return ([], []);
    }

    private static IReadOnlyDictionary<string, TaxIdIdentityCapability> BuildCapabilities()
    {
        var capabilities =
            new Dictionary<string, TaxIdIdentityCapability>(StringComparer.Ordinal)
            {
                ["IT"] = new("full", ItalianFields),
                ["MX"] = new("full", ItalianFields),
            };

        Add(
            capabilities,
            DateAndGenderFields,
            "BA", "BE", "BG", "CZ", "DK", "EE", "FI", "FR", "KR", "KZ", "LK",
            "LT", "ME", "MK", "NO", "PL", "RO", "RS", "SE", "SK", "UA", "UZ", "ZA");
        Add(capabilities, DateGenderAndPlaceFields, "CN", "EG", "ID", "MY", "VN");
        Add(
            capabilities,
            DateFields,
            "AE", "AL", "BD", "BH", "CU", "HU", "IS", "KG", "KW", "LU", "LV",
            "MN", "NI", "QA", "SV");
        Add(capabilities, GenderFields, "PK");
        Add(capabilities, GenderAndPlaceFields, "TW");

        return capabilities;
    }

    private static void Add(
        IDictionary<string, TaxIdIdentityCapability> capabilities,
        IReadOnlyList<string> requiredFields,
        params string[] countries)
    {
        foreach (var country in countries)
            capabilities[country] = new TaxIdIdentityCapability("partial", requiredFields);
    }
}
