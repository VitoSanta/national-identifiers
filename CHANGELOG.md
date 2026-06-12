# Changelog

All notable changes to this project are documented in this file. The project
follows Semantic Versioning.

## [Unreleased]

### Added

- Shared cross-runtime contract fixtures consumed by Node.js and xUnit.
- Configurable policy and strict modes for Angular and ASP.NET Core adapters.
- Repository, issue tracker and provenance metadata for npm and NuGet.
- CI, contribution, security and rule-source maintenance documentation.

### Changed

- Successful TypeScript results inherit their validation level from registry
  metadata when the country validator does not set it explicitly.
- TypeScript validation results are now a discriminated union.
- Brazilian .NET validation accepts the canonical punctuated CPF form.

## [0.1.0] - Unreleased

- Initial 195-country validation coverage.
- TypeScript core, Angular adapter, .NET core and ASP.NET Core integration.
- Format/checksum confidence levels and accept/warn/block policy helpers.
