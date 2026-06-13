# National Identifiers

A multi-target platform for local pre-validation of national tax identifiers,
personal identification numbers and related government-issued codes across 195
jurisdictions.

Validation covers format, checksum, and encoded metadata (birth date, region, century) where rules are institutionally documented. The platform does not confirm that an identifier was issued or is currently active.

The core product promise is precise: reduce input errors, normalize identifiers
and communicate how confidently a value was checked. It is not an identity,
ownership or registry-verification service.

---

## Table of Contents

- [Project Architecture](#project-architecture)
- [Validation Engine](#validation-engine)
- [Supported Identifier Types](#supported-identifier-types)
- [Country Coverage](#country-coverage)
- [Future Expansion Opportunities](#future-expansion-opportunities)
- [JavaScript / TypeScript Package](#javascript--typescript-package)
- [Angular Integration](#angular-integration)
- [.NET Package](#net-package)
- [Packaging and Distribution](#packaging-and-distribution)
- [CI/CD](#cicd)
- [Quality and Reliability](#quality-and-reliability)
- [Security](#security)
- [Technical Roadmap](#technical-roadmap)
- [Development](#development)
- [Roadmap](ROADMAP.md)
- [Country coverage](docs/COUNTRY-COVERAGE.md)
- [Known limitations](docs/KNOWN-LIMITATIONS.md)
- [Identity consistency proposal](docs/IDENTITY-CONSISTENCY.md)
- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Changelog](CHANGELOG.md)

---

## Project Architecture

The repository is organised as a monorepo hosting packages for multiple
runtimes. TypeScript and .NET currently maintain equivalent implementations,
protected by shared contract fixtures and consistency tests. Platform-specific
layers add reactive-forms, dependency-injection and HTTP integration.

```
national-identifiers/
│
├── projects/
│   ├── tax-id/                # TypeScript package and Angular entry point
│   └── manual-test/           # Interactive Angular test application
├── packages/dotnet/
│   ├── NationalIdentifiers.Core/
│   ├── NationalIdentifiers.AspNetCore/
│   └── NationalIdentifiers.Tests/
├── docs/                      # Coverage, limitations and design proposals
└── tests/
    ├── fixtures/              # Shared cross-runtime contracts
    └── node/                  # Node.js integration and consistency tests
```

### Package responsibilities

| Package | Responsibility |
|---|---|
| `tax-id` | Normalisation, validation registry, checksums, result model and policy helper. |
| `tax-id/angular` | Synchronous `ValidatorFn` with policy and strict modes. |
| `NationalIdentifiers.Core` | .NET validation engine targeting `net8.0` and `net10.0`. |
| `NationalIdentifiers.AspNetCore` | Dependency injection, `ValidationAttribute` and action filter integration. |

### Application enforcement model

Frontend validation is UX assistance, not a security control. The canonical decision on whether an identifier is valid must come from the backend. Any form that submits a national identifier to an API must revalidate server-side; the frontend result is discarded. The client and server share the same result model so validation behavior is consistent across runtimes.
This makes the backend authoritative for the application's decision, but does
not turn local format or checksum validation into proof that an authority
issued the identifier.

```
User input
    │
    ▼
[tax-id] ───────── realtime UX feedback (format errors, checksum errors)
    │
    ▼
HTTP request
    │
    ▼
[NationalIdentifiers.AspNetCore] ── server-side policy enforcement
    │
    ▼
Business logic / storage
```

---

## Validation Engine

### Processing pipeline

Each call to `validate` passes through a fixed pipeline regardless of target platform:

```
raw input
    │
    ▼  1. Type guard        reject non-string / non-numeric input → empty
    │
    ▼  2. Normalisation     strip whitespace, hyphens; uppercase; canonical form
    │
    ▼  3. Length check      compare against allowed length(s) for the country rule
    │
    ▼  4. Format (regex)    match against the canonical pattern
    │
    ▼  5. Metadata          extract and validate encoded date / region / century
    │
    ▼  6. Checksum          compute and compare where algorithm is public
    │
    ▼
TaxIdValidationResult
```

Steps 5 and 6 are skipped when the country rule does not define them.

### Result model

```ts
interface TaxIdValidationResult {
  readonly valid: boolean;
  readonly country: string;           // ISO 3166-1 alpha-2
  readonly normalizedValue: string;
  readonly error?: TaxIdErrorCode;
  readonly validationLevel?: 'format' | 'checksum';
}

type TaxIdErrorCode =
  | 'empty'
  | 'invalid_length'
  | 'invalid_format'
  | 'invalid_checksum'
  | 'not_applicable'
  | 'unsupported_country';
```

`validationLevel` is set only on `valid: true` results. `'checksum'` means a public algorithm was applied; `'format'` means only the structure was verified.

`not_applicable` is a distinct terminal state for jurisdictions that do not issue a generalized personal tax identifier (e.g. UAE, Qatar, Vatican City). It is not an error in the same sense as `invalid_format`.

`unsupported_country` means the supplied country code is not part of the current coverage set. Both `unsupported_country` and `not_applicable` are returned as structured results rather than throwing exceptions.

### Country rule schema

Rules are expressed as structured objects. The current TypeScript implementation uses compiled rule modules; a JSON serialisation is planned for cross-platform sharing.

```json
{
  "country": "IT",
  "identifierType": "tax_id_person",
  "label": "Codice Fiscale",
  "normalization": ["strip_whitespace", "strip_hyphens", "uppercase"],
  "lengths": [16],
  "pattern": "^[A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST]{1}[0-9LMNPQRSTUV]{2}[A-Z]{1}[0-9LMNPQRSTUV]{3}[A-Z]{1}$",
  "checksum": {
    "algorithm": "italian_fiscal_code",
    "positions": "all",
    "publicSource": "DPR 605/1973, allegato B"
  },
  "metadata": {
    "encodedDate": true,
    "encodedGender": true,
    "encodedMunicipality": true
  },
  "limitations": []
}
```

```json
{
  "country": "DK",
  "identifierType": "personal_id",
  "label": "CPR-nummer",
  "normalization": ["strip_whitespace", "strip_hyphens"],
  "lengths": [10],
  "pattern": "^\\d{10}$",
  "checksum": null,
  "metadata": {
    "encodedDate": true
  },
  "limitations": [
    "Modulus-11 rule not mandatory for CPR numbers issued after 2007"
  ]
}
```

### Extensibility

The JS/TS package uses the centralized `TAX_ID_VALIDATION_REGISTRY` for validation dispatch and policy metadata. `validateTaxId` resolves validators from this registry, while `taxIdCheckOutcome` derives `block` or `warn` decisions from the same entries. Countries with multiple identifier families can provide value-specific policy metadata, so format-only variants are not treated as checksum failures.

Adding a new country currently requires:

1. A rule object (or JSON definition) specifying pattern, lengths, and optionally checksum algorithm and metadata extraction.
2. A validator function calling `normalizeTaxId` then applying the rule steps.
3. An entry in `country-registry.ts` and the equivalent mapping in the .NET validator.
4. At least two positive and two negative test cases.

No changes to the pipeline or result model are needed for standard countries.

---

## Supported Identifier Types

The platform validates the following identifier categories. Not every country implements every type.

| Type constant | Description | Examples |
|---|---|---|
| `tax_id_person` | Personal tax identification number | IT Codice Fiscale, DE Steuer-IdNr., US SSN |
| `tax_id_company` | Company or entity tax number | FR SIREN/SIRET, DE Steuernummer |
| `national_id` | Civil / personal identity number | CN 居民身份证, IN Aadhaar (scope-limited) |
| `personal_id` | Integrated personal identifier used as functional TIN | DK CPR, SE Personnummer, MY NRIC |
| `vat_number` | Value-added tax registration number | EU VAT numbers (prefix + base) |
| `social_security` | Social insurance / pension number | US SSN, CA SIN, FR NIR |
| `company_registration` | Commercial registry entry number | UK Companies House, DE Handelsregister |

The current release focuses on `tax_id_person` and `personal_id`. Company and VAT validation is on the roadmap.

---

## Country Coverage

The current scope represents all 195 commonly recognised states: 193 UN
members, Palestine and Vatican City. Every entry is classified as checksum,
format-level or `not_applicable`; coverage does not imply equal confidence.

See the [country catalogue](docs/COUNTRY-COVERAGE.md), the
[known limitations](docs/KNOWN-LIMITATIONS.md), and the package-specific
[coverage details](projects/tax-id/README.md).

A `checksum` result means a publicly documented algorithm was applied. `format + date` means the identifier encodes a birth date that is validated in addition to the regex. `format only` means structure is checked but no algorithm is claimed.

### Future expansion opportunities

- Add support for additional identifier categories beyond `tax_id_person` and `personal_id`, such as `vat_number`, `tax_id_company`, `company_registration`, and `national_id`.
- Expose metadata extraction for countries that encode birth date, gender or issuing region.
- Use shared JSON rule definitions as the single source of truth for both JS and .NET packages.
- Add helper functions that answer "what level of confidence is available for this country?" and "what identifier type is expected?".
- Consider a centralised validation API or SaaS offering with rate limiting, audit-safe result codes, and no persistence of submitted values.
- Investigate semi-automated rule generation from official source documents to speed coverage growth.

---

## JavaScript / TypeScript Package

**Package:** `tax-id`

### Installation

```bash
npm install tax-id
```

### Basic usage

```ts
import { validateTaxId } from 'tax-id';

const result = validateTaxId('IT', 'RSSMRA85T10A562S');

if (result.valid) {
  console.log(result.validationLevel); // 'checksum'
  console.log(result.normalizedValue); // 'RSSMRA85T10A562S'
} else {
  console.log(result.error); // 'invalid_checksum' | 'invalid_format' | …
}
```

### Batch validation

```ts
import { validateTaxId } from 'tax-id';

const entries = [
  { country: 'IT', value: 'RSSMRA85T10A562S' },
  { country: 'DE', value: '86095742719' },
  { country: 'FR', value: '1 89 05 49 588 157 80' },
];

const results = entries.map(({ country, value }) =>
  validateTaxId(country, value)
);
```

### TypeScript types

All types are exported from the package root:

```ts
import type {
  TaxIdCountry,
  TaxIdValidationResult,
  TaxIdErrorCode,
  TaxIdValidationLevel,
} from 'tax-id';
```

`TaxIdCountry` is a string union of all supported ISO 3166-1 alpha-2 codes. Passing an unrecognised code does not throw; it returns `error: 'unsupported_country'`.
Null, undefined and whitespace-only country values are handled the same way and
never throw.

The package expects uppercase country codes. The runtime helper `isSupportedTaxIdCountry` is strict: `isSupportedTaxIdCountry('IT')` is true, while `isSupportedTaxIdCountry('it')` is false. Call `country.toUpperCase()` before validation when your source data may use lowercase.

The supported codes can also be queried at runtime:

```ts
import {
  SUPPORTED_TAX_ID_COUNTRIES,
  isSupportedTaxIdCountry,
} from 'tax-id';

SUPPORTED_TAX_ID_COUNTRIES.length; // 195
isSupportedTaxIdCountry('IT');     // true
isSupportedTaxIdCountry('it');     // false: ISO codes are uppercase
```

For Italy the validator accepts both the 16-character personal Codice
Fiscale and the 11-digit Partita IVA / numeric fiscal code assigned to
legal entities, each with its own check-digit algorithm.

### Registration policy helper

`taxIdCheckOutcome` translates a validation result into a policy decision
for sign-up flows where the country is known but rule quality varies:

```ts
import { taxIdCheckOutcome, validateTaxId } from 'tax-id';

taxIdCheckOutcome(validateTaxId('IT', 'RSSMRA85T10A562A')); // 'block'  — failed checksum, definitely wrong
taxIdCheckOutcome(validateTaxId('SO', '12'));               // 'warn'   — format-only country, store and flag
taxIdCheckOutcome(validateTaxId('AE', '123456789'));        // 'warn'   — no personal TIN exists
taxIdCheckOutcome(validateTaxId('IT', 'RSSMRA85T10A562S')); // 'accept'
```

`block` means the value is definitively wrong (failed check digit, empty,
or broke a checksum-grade rule). `warn` means the value could not be
verified with confidence; store it and flag it rather than rejecting the
user. Policy metadata can vary by identifier family within one country.
The same logic is available in .NET as `TaxIdPolicy.Evaluate(result)`
returning a `TaxIdCheckOutcome` enum.

This helper is useful when the country is supported but only format-level
validation exists, or when the identifier belongs to a jurisdiction without a
general personal TIN.

### Normalisation

`normalizeTaxId` is exported for use without full validation:

```ts
import { normalizeTaxId } from 'tax-id';

normalizeTaxId('RSSM RA85-T10A562S'); // 'RSSMRA85T10A562S'
normalizeTaxId(null);                  // ''
normalizeTaxId(42);                    // '42'
```

The function strips leading/trailing whitespace, internal whitespace, and hyphens, then uppercases the result. It never throws.

---

## Angular Integration

**Package:** `tax-id/angular`

### Installation

```bash
npm install tax-id
```

### Reactive Forms — static country

```ts
import { FormControl, Validators } from '@angular/forms';
import { taxIdValidator } from 'tax-id/angular';

const taxId = new FormControl('', [
  Validators.required,
  taxIdValidator('IT'),
]);
```

### Reactive Forms — dynamic country

```ts
import { FormControl, FormGroup } from '@angular/forms';
import { taxIdValidator } from 'tax-id/angular';

const form = new FormGroup({
  country: new FormControl('IT', { nonNullable: true }),
  taxId: new FormControl(''),
});

form.controls.taxId.addValidators(
  taxIdValidator(() => form.controls.country.value)
);

form.controls.country.valueChanges.subscribe(() =>
  form.controls.taxId.updateValueAndValidity()
);
```

### Error shape

The validator attaches a structured error object to the control:

```ts
// control.errors when invalid
{
  taxId: {
    valid: false,
    country: 'IT',
    normalizedValue: 'RSSMRA85T10A562A',
    error: 'invalid_checksum'   // TaxIdErrorCode
  }
}
```

Access in a template:

```html
<mat-error *ngIf="taxId.errors?.['taxId']?.error === 'invalid_checksum'">
  Check digit incorrect.
</mat-error>
<mat-error *ngIf="taxId.errors?.['taxId']?.error === 'invalid_format'">
  Format not recognised for {{ country.value }}.
</mat-error>
```

### Empty value handling

`taxIdValidator` returns `null` (valid) on empty input. Combine with `Validators.required` when the field is mandatory. This separation avoids double error messages when a required field is simply blank.

### Policy mode and silent warnings

The default mode is `policy`, which follows `taxIdCheckOutcome`: only
definitive failures (`block`) invalidate the control. **Advisory `warn`
results return `null`, so the form shows no error at all** — a user entering
a wrong-length identifier for a format-only country (for example `12` for
Somalia) sees a perfectly valid field. The `warn` signal is intended to be
acted on server-side, where the value can be stored and flagged for review;
the form adapter has no channel to surface it.

If you prefer the form to reject every failed local check, pass
`{ mode: 'strict' }`:

```ts
taxIdValidator(() => form.controls.country.value, { mode: 'strict' })
```

Choose `strict` when there is no backend review queue and silent acceptance
of unverifiable input is worse than occasionally blocking an unusual but
legitimate identifier.

### Async validation and lazy loading

Not available yet: an async `ValidatorFn` with lazy country-rule loading is
planned (see `ROADMAP.md`). Today the bundle ships all rules; the core entry
point is tree-shakable and has no Angular dependency.

### UX guidelines

- Show validation feedback only after the control is `dirty` and `touched`, not on initial render.
- Use the `error` code for user-facing messages. `validationLevel` is present only on successful results; use `taxIdCheckOutcome` when the UI needs an `accept`/`warn`/`block` decision.
- Do not disable form submission based solely on frontend validation; always validate server-side.
- For country selectors with many options, pre-load rules for the default country on init and lazy-load others on `country` change.

---

## .NET Package

**Package:** `NationalIdentifiers.Core` (NuGet)  
**Integration package:** `NationalIdentifiers.AspNetCore`

Both packages currently cover the same 195 country codes as the
JavaScript/TypeScript implementation and target .NET 8 and .NET 10.

### Installation

```bash
dotnet add package NationalIdentifiers.Core
dotnet add package NationalIdentifiers.AspNetCore
```

### Core validation

```csharp
using NationalIdentifiers.Core;

var validator = new TaxIdValidator();

ValidationResult result = validator.Validate("IT", "RSSMRA85T10A562S");
IReadOnlyList<string> countries = validator.SupportedCountries;
bool supportsItaly = TaxIdCountries.IsSupported("it"); // true

if (result.IsValid)
{
    Console.WriteLine(result.ValidationLevel); // Checksum
    Console.WriteLine(result.NormalizedValue); // RSSMRA85T10A562S
}
else
{
    Console.WriteLine(result.Error); // InvalidChecksum
}
```

### Dependency injection (ASP.NET Core)

```csharp
// Program.cs
builder.Services.AddNationalIdentifiers();
```

This registers `ITaxIdValidator` as a singleton. The validator is thread-safe and stateless.

```csharp
// Service layer
public class CustomerService
{
    private readonly ITaxIdValidator _validator;

    public CustomerService(ITaxIdValidator validator)
    {
        _validator = validator;
    }

    public void RegisterCustomer(string country, string taxId)
    {
        var result = _validator.Validate(country, taxId);

        if (!result.IsValid)
            throw new ValidationException($"Invalid tax identifier: {result.Error}");

        // …
    }
}
```

### Model validation attribute

```csharp
using NationalIdentifiers.AspNetCore;

public class CustomerRequest
{
    [Required]
    public string Country { get; set; } = string.Empty;

    [Required]
    [ValidTaxId(nameof(Country))]
    public string TaxId { get; set; } = string.Empty;
}
```

`[ValidTaxId]` reads the country from the named sibling property. It skips `null`, empty and whitespace-only values so that required-field validation remains the responsibility of `[Required]`, matching the Angular validator behavior. The attribute participates in standard model validation and populates `ModelState` on failure.

### Controller usage

```csharp
[ApiController]
[Route("customers")]
public class CustomersController : ControllerBase
{
    [HttpPost]
    public IActionResult Create([FromBody] CustomerRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        // request.TaxId is validated at this point
        return Ok();
    }
}
```

### Action filter (global)

To apply validation globally without per-endpoint attributes:

```csharp
builder.Services.AddControllers(options =>
{
    options.Filters.Add<TaxIdValidationFilter>();
});
```

The filter inspects request bodies for properties decorated with `[ValidTaxId]` and short-circuits with `400 Bad Request` before the action executes.

### Validation result model (.NET)

```csharp
public record ValidationResult(
    bool IsValid,
    string Country,
    string NormalizedValue,
    ValidationErrorCode? Error = null,
    ValidationLevel? ValidationLevel = null
);

public enum ValidationErrorCode
{
    Empty,
    InvalidLength,
    InvalidFormat,
    InvalidChecksum,
    NotApplicable,
    UnsupportedCountry
}

public enum ValidationLevel { Format, Checksum }
```

---

## Packaging and Distribution

### npm (`tax-id`, `tax-id/angular`)

**Build outputs**

The Angular package builder emits ESM bundles and TypeScript declarations for
the root API and both secondary entry points. The supported runtime baseline is
Node.js 20.19 or newer.

The package has one small runtime dependency (`tslib`). Angular is declared as
an optional peer dependency (`^20.3.0`) and is required only when importing the
`tax-id/angular` entry point.

**Versioning:** semantic versioning. A new country with checksum validation is a minor release. A new country format-only is a patch release. Any change to the result model shape or error codes is a major release.

**Publishing**

```bash
npm run build
npm publish ./dist/tax-id --access public
```

The Angular adapter is published as the `tax-id/angular` secondary entry point
of the same package.

### NuGet (`NationalIdentifiers.Core`, `NationalIdentifiers.AspNetCore`)

**Build and pack**

```bash
dotnet build -c Release
dotnet pack -c Release --no-build \
  -p:PackageVersion=$(git describe --tags --abbrev=0)
```

**Naming conventions**

- `NationalIdentifiers.Core` — base library, no framework dependencies
- `NationalIdentifiers.AspNetCore` — ASP.NET Core integration, depends on `Core`
- Future: `NationalIdentifiers.EntityFramework`, `NationalIdentifiers.FluentValidation`

**Target frameworks**

```xml
<TargetFrameworks>net8.0;net10.0</TargetFrameworks>
```

The packages target `net8.0` and `net10.0`. Framework-specific ASP.NET Core
integration is provided by `NationalIdentifiers.AspNetCore`, while the core
validator remains independent from ASP.NET Core.

**Publishing**

```bash
dotnet nuget push artifacts/*.nupkg \
  --source https://api.nuget.org/v3/index.json \
  --api-key $NUGET_API_KEY \
  --skip-duplicate
```

---

## CI/CD

### Recommended release gate

```
npm ci
        ├── npm test
        ├── npm run test:angular
        ├── npm run build:demo
        ├── dotnet test -c Release
        ├── npm pack --dry-run ./dist/tax-id
        └── dotnet pack -c Release
```

Automate this gate in the CI provider before publishing npm or NuGet packages.

**Required repository secrets**

| Secret | Used by |
|---|---|
| `NPM_TOKEN` | `npm publish` |
| `NUGET_API_KEY` | `dotnet nuget push` |
| `CODECOV_TOKEN` | Coverage upload |

---

## Quality and Reliability

### Test strategy

Every supported country has:

| Test class | Description |
|---|---|
| Valid identifier | At least one known-good value; must return `valid: true` |
| Invalid checksum | A structurally correct value with a wrong check digit; must return `invalid_checksum` |
| Invalid format | A value violating the regex; must return `invalid_format` |
| Invalid length | A value of wrong length; must return `invalid_length` |
| Empty | `''` and `null`; must return `empty` |
| Normalisation | Input with spaces/hyphens normalises to the canonical form |

Countries with only format-level validation omit the invalid-checksum test class.

### Snapshot tests

The full country matrix is snapshot-tested against a fixed input set. Any change to validation output for an existing country surfaces as a snapshot diff and requires an explicit update commit, preventing silent regressions.

```ts
it('snapshot: IT valid identifier', () => {
  expect(validateTaxId('IT', 'RSSMRA85T10A562S')).toMatchSnapshot();
});
```

### Regression test corpus

Known edge cases collected from production reports are stored in `tests/corpus/`. These are not grouped by country but by failure mode: all-zero inputs, omocodia characters, identifiers at boundary lengths, leap-day birth dates, identifiers from decommissioned regions.

### Checksum verification

For countries with published checksum algorithms, the test suite includes an independent reference implementation checked against the library. Any divergence is a test failure regardless of which side changed.

### Performance

Validation is synchronous and O(n) in identifier length. Benchmarks run in CI using `vitest bench` (JS) and `BenchmarkDotNet` (.NET).

Current baselines (single-call, warm JIT):

| Platform | Median per call |
|---|---|
| Node.js 22 | < 0.05 ms |
| .NET 9 | < 0.02 ms |

Batch throughput is limited by the calling loop, not the validator. No internal caching is applied; results are not memoised.

### Fallback handling

An unrecognised country code returns `{ valid: false, error: 'unsupported_country' }`. The dispatcher never throws. A `null`, `undefined`, or non-string/non-number input produces `{ valid: false, error: 'empty' }`.

---

## Security

### Input sanitisation

All input passes through `normalizeTaxId` before any processing. The function accepts only `string` and `number`; any other type returns an empty string immediately. No external parsing libraries are involved.

### ReDoS prevention

All regular expressions are anchored (`^…$`) and use only fixed-width quantifiers or bounded repetition (`{n}`, `{n,m}`). Catastrophic backtracking is not possible with single-pass anchored patterns. New country patterns are reviewed against this constraint before merge.

### Malformed input

The pipeline terminates at the first failing step. A 100,000-character string fails at the length check and does not reach the regex engine. Length limits per country are set to a maximum of 20 characters for all current rules.

### No state, no side effects

The validator is a pure function. It reads no configuration at runtime, writes nothing, and makes no network calls. There is no cache that could be poisoned.

### Frontend trust boundary

Frontend validation is classified as UX assistance, not a security control. The backend must never trust a frontend validation result passed in a request payload. Any API accepting a national identifier must validate it independently server-side regardless of client-reported validity.

### Future API rate limiting

If a hosted validation API is introduced in a future release, the following
controls will apply:

- Per-IP and per-authenticated-key rate limits via token bucket
- Request size limit (identifier field max 64 bytes)
- No identifier value logged in access logs; only country code and result code
- HTTPS enforced; HTTP rejected at the load balancer
- No persistence of submitted identifier values

---

## Technical Roadmap

The maintained roadmap lives in [ROADMAP.md](ROADMAP.md). Optional matching
between encoded identifier data and user-supplied biographical attributes is
documented in [Identity Consistency Validation](docs/IDENTITY-CONSISTENCY.md);
the cross-runtime contract and the Italian first slice are implemented:

```ts
import { validateTaxIdIdentity } from 'tax-id';

const result = validateTaxIdIdentity({
  country: 'IT',
  taxId: 'RSSMRA85T10A562S',
  identity: {
    firstName: 'Mario',
    lastName: 'Rossi',
    birthDate: '1985-12-10',
    gender: 'M',
    birthPlaceCode: 'A562',
  },
});
// result.status: 'match' | 'partial_match' | 'mismatch'
//              | 'insufficient_data' | 'not_supported'
```

The .NET equivalent is `TaxIdIdentityValidator.Validate(country, taxId, new
TaxIdIdentity(...))`. Capabilities are declared per country through
`taxIdIdentityCapability` and `TaxIdIdentityValidator.Capability`.

The current implementation covers 42 countries: Italy has full name, date,
gender and place consistency, while 41 additional formats expose partial
checks for encoded birth date, gender or administrative place code. Five of
these (EG, FR, KW, MX, VN) decode a **national identity document** — the
Egyptian National ID, the French NIR, the Kuwaiti Civil ID, the Mexican CURP
and the Vietnamese CCCD — which is validated independently of the country's
tax identifier. See the [capability matrix](docs/IDENTITY-CONSISTENCY.md) and
[expansion research](docs/IDENTITY-CONSISTENCY-RESEARCH.md). A `match` is not
identity verification, and no personal value is logged or echoed back.

---

## Development

### Prerequisites

- Node.js 22.22.3 or newer
- .NET SDK 8.0 or newer (for .NET packages)

### Commands

```bash
# JavaScript / Angular
npm install
npm test                  # build package + Node.js integration/consistency suite
npm run test:angular      # Angular Karma suite in Chrome
npm run build             # compile the library
npm run demo              # start the interactive manual-test application on :4200

# .NET
dotnet restore
dotnet test packages/dotnet/NationalIdentifiers.Tests/NationalIdentifiers.Tests.csproj -c Release
dotnet build packages/dotnet/NationalIdentifiers.Core/NationalIdentifiers.Core.csproj -c Release
dotnet build packages/dotnet/NationalIdentifiers.AspNetCore/NationalIdentifiers.AspNetCore.csproj -c Release
```

### Adding a new country

1. Create `projects/tax-id/src/lib/countries/{country-code}.ts`.
2. Implement `validateXxxTaxId(value: unknown): TaxIdValidationResult` using `normalizeTaxId` and the rule steps.
3. Add the validator import and metadata entry in `country-registry.ts`.
4. Add the country code to `TaxIdCountry` in `models.ts`.
5. Export from `public-api.ts`.
6. Add test cases in `validate-tax-id.spec.ts` and `tests/node/tax-id.test.mjs`.
7. Add an entry in `projects/manual-test/src/app/app.ts`.
8. Update `docs/COUNTRY-COVERAGE.md` and `docs/KNOWN-LIMITATIONS.md`.
9. Update `projects/tax-id/README.md` with the new entry and its validation level.

A country implementation is only merged when all nine steps are complete and tests pass.

### Validation level policy

| Level | Condition |
|---|---|
| `checksum` | A check-digit algorithm is published in an institutional source (government authority, OECD AEOI sheet, ISO standard) and implemented with at least one verified example. |
| `format` | Only structure and length are validated. The word "checksum" does not appear in the result unless the above condition is met. |

Do not implement an undocumented algorithm inferred from examples. Document the limitation in the README and in the rule's `limitations` array.
