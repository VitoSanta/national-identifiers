# Changelog

All notable changes to this project are documented in this file. The project
follows Semantic Versioning.

## [Unreleased]

### Added

- Identity consistency validation (docs/IDENTITY-CONSISTENCY.md, steps 1-3):
  `validateTaxIdIdentity` and `taxIdIdentityCapability` in TypeScript,
  `TaxIdIdentityValidator` in .NET. The Italian first slice compares a
  Codice Fiscale with first name, last name, birth date, sex and Belfiore
  birthplace code, handling omocodia, diacritics and the female day offset.
  Partial birth-date, gender or administrative-code consistency is also
  available for 36 additional countries.
  Results carry status and field names only — personal values are never
  echoed back. Shared fixtures keep both runtimes aligned.

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
