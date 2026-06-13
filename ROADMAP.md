# Roadmap

## Status (2026-06-13)

- **Shipped:** 195-state validation (npm 0.1.0; NuGet 0.2.0). Identity
  consistency for 47 jurisdictions (Italy full; 46 partial) is implemented
  and **unreleased**.
- **Next release is on hold by decision.** It will bundle the expansion below
  and ship as **1.0.0** if the identifier-family API lands, else 0.3.0. npm
  must be caught up from 0.1.0 at the same time.
- **Detailed, step-by-step expansion checklist:**
  [docs/COUNTRY-COVERAGE.md → Expansion roadmap](docs/COUNTRY-COVERAGE.md#expansion-roadmap-beyond-the-195-states)
  (Workstream A: territories with public algorithms — HK/TW/GL/FO/MO/…;
  Workstream B: VAT & business identifiers / families; Workstream C: Mexico
  full identity via CURP name).

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

## Post-0.2 - Identity consistency

- Add capability metadata for identifiers that encode biographical data.
- Introduce a separate cross-runtime identity-consistency API.
- Implement Italy first, including omocodia and historical birthplace codes.
- Never represent local consistency as proof of identity or official issuance.

See [the design proposal](docs/IDENTITY-CONSISTENCY.md).

## 1.0 - Compatibility commitment

- Freeze the core result and error contracts.
- Publish a deprecation policy and supported-runtime matrix.
- Require complete source metadata and cross-runtime fixtures for every rule.
- Add property-based tests for normalization and checksum invariants.

Authoritative online verification remains outside the offline core. It may be
provided later through optional integrations such as VIES.
