# Roadmap

## Status (2026-06-15)

- **1.0.0 ready:** 195-state personal validation, seven territories, 38 VAT
  jurisdictions, 12 company/entity jurisdictions and identity consistency for
  47 jurisdictions (Italy and Mexico full; 45 partial).
- **Release scope frozen:** the identifier-family API, provenance catalogue,
  cross-runtime contracts and policy behavior are included in 1.0.0.
- **Detailed, step-by-step expansion checklist:**
  [docs/COUNTRY-COVERAGE.md → Expansion roadmap](docs/COUNTRY-COVERAGE.md#expansion-roadmap-beyond-the-195-states)
  (Workstream A: territories with public algorithms — HK/TW/GL/FO/MO/…;
  Workstream B: VAT & business identifiers / families; Workstream C: Mexico
  full identity via CURP name).
- **Evidence-gated next countries:** the country-by-country research and
  implementation queue lives in
  [docs/OFFICIAL-SOURCE-BACKLOG.md](docs/OFFICIAL-SOURCE-BACKLOG.md).
  Only entries marked `ready` may move into code.
- **Current family coverage:** 38 VAT jurisdictions and 12 company/entity
  tax-id jurisdictions, aligned across TypeScript and .NET.
- **Rule provenance complete:** all 252 current registry combinations have
  machine-readable source records and cross-runtime completeness/staleness
  tests. Evidence is classified explicitly as `verified`, `corroborated` or
  `documented_limit`; no unresolved workflow status remains.

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

- [x] Complete the structured source catalogue for personal, territory, VAT
  and company identifiers.
- [x] Record authority, source URL, review date and known limitations.
- [x] Add automated completeness and stale-review enforcement.
- [x] Classify rules without a public primary algorithm as `corroborated` or
  `documented_limit`, without overstating verification.
- [x] Expand the shared provenance fixture to every supported registry entry.

## Post-0.2 - Identity consistency

- Add capability metadata for identifiers that encode biographical data.
- Introduce a separate cross-runtime identity-consistency API.
- Implement Italy first, including omocodia and historical birthplace codes.
- Never represent local consistency as proof of identity or official issuance.

See [the design proposal](docs/IDENTITY-CONSISTENCY.md).

## 1.0 - Compatibility commitment

- Freeze the core result and error contracts.
- Publish a deprecation policy and supported-runtime matrix.
- Require complete source metadata and cross-runtime coverage fixtures for
  every rule. **Done for the current registry.**
- Add property-based tests for normalization and checksum invariants.

Authoritative online verification remains outside the offline core. It may be
provided later through optional integrations such as VIES.
