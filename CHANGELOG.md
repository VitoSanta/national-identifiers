# Changelog

All notable changes to this project are documented in this file. The project
follows Semantic Versioning.

## [Unreleased]

## [0.2.0] - 2026-06-13

### Added

- Identity consistency validation (docs/IDENTITY-CONSISTENCY.md):
  `validateTaxIdIdentity` and `taxIdIdentityCapability` in TypeScript,
  `TaxIdIdentityValidator` in .NET. A new optional API compares an
  identifier with user-supplied biographical data where the format encodes
  it, returning `match`, `partial_match`, `mismatch`, `insufficient_data`
  or `not_supported`. It never claims registry-level verification.
- Full Italian Codice Fiscale slice: first name, last name, birth date,
  sex and Belfiore birthplace code, handling omocodia, diacritics and the
  female day offset.
- Partial consistency for 37 additional countries (38 in total) whose
  identifiers institutionally encode biographical data: birth date and sex
  for 22 (PESEL, CNP, EGN, JMBG family, Nordic codes, RRN, Baltic codes,
  KZ, UA, UZ, ZA, …), birth date plus an administrative place code for
  CN/ID/MY, birth date only for 11 (including the Luxembourg matricule and
  the Mexican RFC), and sex only for PK.
- Per-country capabilities are declared explicitly; identifiers with random
  or serial structure (DE, US, NL, FR SPI, BR, …) remain `not_supported`
  with no fabricated checks.
- Shared `identity-consistency-country-cases.json` fixture, consumed
  unchanged by the Node.js and xUnit suites, derived from canonical
  published examples rather than decoder output.

### Security

- Identity-consistency results carry status and field names only; submitted
  identifiers and biographical attributes are never logged or echoed back.

## [0.1.0] - 2026-06-12

Initial public release.

### Added

- 195-country validation coverage: TypeScript core (`tax-id`), Angular
  adapter (`tax-id/angular`), .NET core (`NationalIdentifiers.Core`) and
  ASP.NET Core integration (`NationalIdentifiers.AspNetCore`).
- Format/checksum confidence levels and accept/warn/block policy helpers.
- Shared cross-runtime contract fixtures consumed by Node.js and xUnit.
- Configurable policy and strict modes for Angular and ASP.NET Core adapters.
- Repository, issue tracker and provenance metadata for npm and NuGet.
- CI, contribution, security and rule-source maintenance documentation.

### Fixed

- .NET validators for Argentina, Chile, Colombia, Peru, Uruguay and Venezuela
  now strip dots like their TypeScript counterparts, restoring cross-runtime
  parity for canonical punctuated forms such as the Chilean RUT
  `12.345.678-5`, the Colombian NIT `890.321.567-0` and the Uruguayan CI
  `1.234.567-2`.

### Changed

- Successful TypeScript results inherit their validation level from registry
  metadata when the country validator does not set it explicitly.
- TypeScript validation results are now a discriminated union.
- Brazilian .NET validation accepts the canonical punctuated CPF form.
- The Peruvian 8-digit DNI (no check digit) is evaluated as a format-only
  family by the policy helpers in both runtimes, consistent with the
  CZ/SK/ID/SG handling.
- Chad, Djibouti, Eritrea, Kiribati and Tonga validators now require at
  least 4 characters instead of accepting any single alphanumeric.
- Cross-runtime contract fixtures expanded from 18 to 41 cases, covering
  every country with custom normalization (punctuated canonical forms).
- The README documents that the Angular adapter's default `policy` mode
  silences advisory warnings, and no longer describes the unreleased async
  validator API.
