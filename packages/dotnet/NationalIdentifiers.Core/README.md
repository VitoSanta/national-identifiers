# NationalIdentifiers.Core

Validation of national tax identifiers for **195 countries**, plus 7
separately tracked ISO territories (FO, GL, GG, HK, JE, PR, TW). Pure .NET,
no dependencies, targets .NET 8 and .NET 10.

```csharp
using NationalIdentifiers.Core;

var result = TaxIdValidator.Validate("IT", "RSSMRA85T10A562S");
// result.IsValid          → true
// result.NormalizedValue  → "RSSMRA85T10A562S"
// result.ValidationLevel  → ValidationLevel.Checksum

TaxIdValidator.Validate("IT", "00743110157");  // Partita IVA: also valid
TaxIdValidator.Validate("IT", IdentifierType.Vat, "00743110157");
TaxIdValidator.Validate("BR", "111.444.777-35"); // CPF: normalized and checked
TaxIdValidator.Validate("HK", "A123456(3)"); // HKID: checksum validated

var vatCountries = new TaxIdValidator().SupportedVatCountries;
var companyCountries = new TaxIdValidator().SupportedCompanyTaxCountries;
// 38 VAT and 12 company-tax countries; both lists are immutable
```

The official usage style for one-off validation is the static
`TaxIdValidator.Validate(...)` API. Create an instance only when you need
discovery properties such as `SupportedCountries`, `SupportedTerritories`,
`SupportedVatCountries` or `SupportedCompanyTaxCountries`, or when consuming
`ITaxIdValidator` through dependency injection.

## What you get

- **60 countries with check-digit validation** — Italy (Codice Fiscale and
  Partita IVA), Spain, France, Germany, Brazil, Argentina, China, Japan,
  South Africa and more. A failed checksum means the value is definitively
  wrong.
- **Format/structure validation for the rest** — length and pattern rules
  from institutional sources (OECD AEOI, national tax authorities).
- **Dedicated VAT validation for 38 countries** — all EU countries plus
  sourced non-EU VAT/GST identifiers, discoverable through
  `SupportedVatCountries`, with the same coverage as the TypeScript package.
- **Dedicated company-tax validation for 12 countries**, discoverable through
  `SupportedCompanyTaxCountries`.
- **Explicit confidence levels** — every successful result carries
  `ValidationLevel.Checksum` or `ValidationLevel.Format`, so you always know
  how strong the check was.
- **Graceful handling of edge cases** — countries without a personal TIN
  (UAE, Qatar, Kuwait…) return `NotApplicable` instead of failing; unknown
  country codes return `UnsupportedCountry` instead of throwing.
- **Optional identity consistency for 47 jurisdictions** — compares encoded
  birth date, gender or administrative place codes; Italy and Mexico also
  check name-derived characters. This remains a local consistency check, not
  identity verification.

Additional families are admitted only through the public
[official-source backlog](https://github.com/VitoSanta/national-identifiers/blob/main/docs/OFFICIAL-SOURCE-BACKLOG.md).
Coverage depth is documented in
[docs/COVERAGE-DEPTH.md](https://github.com/VitoSanta/national-identifiers/blob/main/docs/COVERAGE-DEPTH.md), including the
difference between checksum-backed validation, format-only validation and
`NotApplicable` jurisdictions.

### Confidence semantics

The core package reports validation level explicitly. Use `ValidationLevel.Checksum`
when a public check-digit algorithm is available and has passed, or
`ValidationLevel.Format` when only structure/date rules are enforced.
This distinction is useful for downstream decision logic and aligns with the
JS package's `taxIdCheckOutcome` policy helper.

This release also aligns the .NET policy semantics with the JS/TS registry-driven validation model, so `TaxIdPolicy.Evaluate` and `taxIdCheckOutcome` now make consistent accept/warn/block decisions across runtimes.

Policy is evaluated per identifier family where a country mixes validation levels. Historical 9-digit Czech and Slovak birth numbers, Indonesian NIK values, Peruvian 8-digit DNI values without a check digit and Singapore `M` FIN values remain format-only and therefore produce `Warn` for non-empty format failures; their checksum-backed variants produce `Block`.

## Registration policy helper

For sign-up flows where one field may hold a domestic tax code, a VAT number
or a foreign TIN:

```csharp
var outcome = TaxIdPolicy.Evaluate(TaxIdValidator.Validate(country, input));

switch (outcome)
{
    case TaxIdCheckOutcome.Accept: // passed every available check
    case TaxIdCheckOutcome.Block:  // definitively wrong (bad check digit) — reject
    case TaxIdCheckOutcome.Warn:   // cannot verify with confidence — store and flag
}
```

## Validation pipeline

1. Normalize (strip spaces and dashes, uppercase)
2. Empty check
3. Length check
4. Format/pattern check
5. Check-digit verification (when a public algorithm exists)

Local validation confirms the value is *well-formed*, not that it was
actually *issued* to someone. For registry-level verification use official
services (e.g. VIES for EU VAT numbers). Live lookups are intentionally not
part of the offline core.
The broader frontend/backend trust boundary is documented in
[docs/TRUST-MODEL.md](https://github.com/VitoSanta/national-identifiers/blob/main/docs/TRUST-MODEL.md).

## Related packages

- `NationalIdentifiers.AspNetCore` — DI extensions, validation attribute and
  action filter for ASP.NET Core.
- `national-identifiers` on npm — the same rules for TypeScript/JavaScript, with an
  Angular adapter.
- [API stability](https://github.com/VitoSanta/national-identifiers/blob/main/docs/API-STABILITY.md) — SemVer and breaking-change
  policy.

## License

MIT
