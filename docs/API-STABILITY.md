# API Stability and SemVer

The public API is considered stable from `1.0.1` onward.

National Identifiers follows Semantic Versioning for the TypeScript/Angular and
.NET packages.

## Stable public surfaces

The stable public API includes:

- exported TypeScript functions, constants and types from `national-identifiers`;
- the Angular secondary entry point `national-identifiers/angular`;
- .NET public classes, records, enums and extension methods in
  `NationalIdentifiers.Core`;
- .NET public integration APIs in `NationalIdentifiers.AspNetCore`;
- result model fields and error codes;
- `accept`, `warn` and `block` policy semantics.

## Breaking changes

The following require a major release, for example `2.0.0`:

- removing or renaming an exported function, type, class, record or enum;
- changing a function signature in a source-incompatible way;
- changing the shape of validation result objects;
- removing or renaming an error code;
- changing the meaning of `validationLevel`;
- changing `accept`, `warn` or `block` policy behavior for an existing result
  category;
- dropping a supported runtime target without a replacement path;
- moving the Angular secondary entry point.

## Minor changes

The following can be minor releases:

- adding a new checksum-backed jurisdiction or identifier family;
- adding a new public helper without changing existing behavior;
- adding optional metadata to successful results;
- adding an optional integration package.

## Patch changes

The following can be patch releases:

- documentation fixes;
- source catalogue corrections that do not change runtime behavior;
- adding or correcting format-only rules;
- adding stricter tests for already documented behavior;
- fixing a bug where current behavior contradicts documented semantics;
- improving package metadata.

## Runtime behavior and policy

Policy behavior is part of the public contract. In particular:

- failed checksum-grade rules are definitive local failures and should map to
  `block`;
- format-only limitations should remain visible to callers and usually map to
  `warn`;
- `not_applicable` must remain distinct from `unsupported_country`;
- unsupported identifier families must not be silently routed through personal
  tax-id rules.

Any change that weakens these distinctions needs explicit release notes and may
require a major version.

## Naming

The canonical npm package is `national-identifiers`.

The legacy `tax-id` package remains deprecated as a migration path. It should
not receive new features.
