using System.Globalization;
using System.Text.Json;
using NationalIdentifiers.Core;

namespace NationalIdentifiers.Tests;

public class RuleSourceCatalogueTests
{
    private static readonly HashSet<string> SourceTypes =
    [
        "tax_authority",
        "legislation",
        "official_specification",
        "intergovernmental",
        "government_registry",
        "government_portal",
    ];

    private static readonly string[] ForbiddenSourceHosts =
    [
        "wikipedia.org",
        "github.com",
        "npmjs.com",
        "stackoverflow.com",
    ];

    [Fact]
    public void Covers_All_Registries_With_Closed_Provenance_Decisions()
    {
        var path = Path.Combine(AppContext.BaseDirectory, "rule-sources.json");
        var catalogue = JsonSerializer.Deserialize<List<RuleSource>>(
            File.ReadAllText(path),
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(catalogue);
        Assert.Equal(252, catalogue.Count);
        Assert.Equal(
            TaxIdCountries.Supported,
            CountriesFor(catalogue, "tax_id_person", "state"));
        Assert.Equal(
            TaxIdTerritories.Supported,
            CountriesFor(catalogue, "tax_id_person", "territory"));
        Assert.Equal(
            VatCountries.Supported,
            CountriesFor(catalogue, "vat", "state"));
        Assert.Equal(
            CompanyTaxCountries.Supported,
            CountriesFor(catalogue, "tax_id_company", "state"));
        Assert.Equal(
            catalogue.Count,
            catalogue
                .Select(entry => $"{entry.JurisdictionType}:{entry.Country}:{entry.IdentifierType}")
                .Distinct()
                .Count());

        foreach (var entry in catalogue)
        {
            var context = $"{entry.Country}/{entry.IdentifierType}";
            Assert.Matches("^[A-Z]{2}$", entry.Country);
            Assert.True(entry.IdentifierName.Length >= 2, context);
            Assert.True(entry.Authority.Length >= 3, context);
            Assert.Contains(entry.JurisdictionType, new[] { "state", "territory" });
            Assert.Contains(entry.ValidationLevel, new[] { "format", "checksum", "not_applicable" });
            Assert.Contains(entry.SourceType, SourceTypes);
            Assert.Contains(
                entry.ProvenanceStatus,
                new[] { "verified", "corroborated", "documented_limit" });

            Assert.True(Uri.TryCreate(entry.SourceUrl, UriKind.Absolute, out var sourceUrl), context);
            Assert.Equal(Uri.UriSchemeHttps, sourceUrl!.Scheme);
            Assert.DoesNotContain(
                ForbiddenSourceHosts,
                host => sourceUrl.Host.Equals(host, StringComparison.OrdinalIgnoreCase)
                    || sourceUrl.Host.EndsWith($".{host}", StringComparison.OrdinalIgnoreCase));

            var accessedAt = ParseDate(entry.AccessedAt, context);
            var reviewedAt = ParseDate(entry.LastReviewedAt, context);
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            Assert.True(reviewedAt >= accessedAt, context);
            Assert.True(reviewedAt <= today.AddDays(1), context);
            Assert.True(today.DayNumber - reviewedAt.DayNumber <= 366, context);

            if (entry.ProvenanceStatus != "verified")
            {
                Assert.Contains(entry.Limitations, limitation => limitation.Length >= 3);
            }
        }
    }

    private static IReadOnlyList<string> CountriesFor(
        IEnumerable<RuleSource> catalogue,
        string identifierType,
        string jurisdictionType) =>
        catalogue
            .Where(entry =>
                entry.IdentifierType == identifierType
                && entry.JurisdictionType == jurisdictionType)
            .Select(entry => entry.Country)
            .Order()
            .ToArray();

    private static DateOnly ParseDate(string value, string context)
    {
        Assert.True(
            DateOnly.TryParseExact(
                value,
                "yyyy-MM-dd",
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var parsed),
            context);
        return parsed;
    }

    private sealed record RuleSource(
        string Country,
        string JurisdictionType,
        string IdentifierType,
        string IdentifierName,
        string ValidationLevel,
        string Authority,
        string SourceUrl,
        string SourceType,
        string AccessedAt,
        string LastReviewedAt,
        string ProvenanceStatus,
        IReadOnlyList<string> Limitations);
}
