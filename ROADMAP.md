# Roadmap

## 0.1 - Stable validation foundation

- 195-country coverage in TypeScript and .NET.
- Explicit format/checksum confidence.
- Policy-aware Angular and ASP.NET Core integrations.
- Shared cross-runtime contract fixtures.
- Reproducible npm and NuGet release gate.

## 0.2 - Identifier families

- Introduce `validateIdentifier({ country, type, value })`.
- Keep `validateTaxId(country, value)` as the compatibility API.
- Model personal and business tax IDs, VAT numbers, national IDs,
  social-security identifiers and foreign-resident identifiers separately.
- Expose supported identifier families per country.

## 0.3 - Rule provenance

- Complete the structured source catalogue for every identifier family.
- Expose authority, source URL, review date and known limitations.
- Add automated stale-review reporting.
- Expand shared fixtures to every supported country and identifier family.

## 1.0 - Compatibility commitment

- Freeze the core result and error contracts.
- Publish a deprecation policy and supported-runtime matrix.
- Require complete source metadata and cross-runtime fixtures for every rule.
- Add property-based tests for normalization and checksum invariants.

Authoritative online verification remains outside the offline core. It may be
provided later through optional integrations such as VIES.
