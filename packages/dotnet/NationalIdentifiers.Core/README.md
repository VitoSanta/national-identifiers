# NationalIdentifiers.Core

Validation of national tax identifiers for **195 countries** — every commonly
recognised state (193 UN members, Palestine, Vatican City). Pure .NET, no
dependencies, targets .NET 8 and .NET 10.

```csharp
using NationalIdentifiers.Core;

var result = TaxIdValidator.Validate("IT", "RSSMRA85T10A562S");
// result.IsValid          → true
// result.NormalizedValue  → "RSSMRA85T10A562S"
// result.ValidationLevel  → ValidationLevel.Checksum

TaxIdValidator.Validate("IT", "00743110157");  // Partita IVA: also valid
TaxIdValidator.Validate("BR", "111.444.777-35"); // CPF: normalized and checked
```

## What you get

- **60 countries with check-digit validation** — Italy (Codice Fiscale and
  Partita IVA), Spain, France, Germany, Brazil, Argentina, China, Japan,
  South Africa and more. A failed checksum means the value is definitively
  wrong.
- **Format/structure validation for the rest** — length and pattern rules
  from institutional sources (OECD AEOI, national tax authorities).
- **Explicit confidence levels** — every successful result carries
  `ValidationLevel.Checksum` or `ValidationLevel.Format`, so you always know
  how strong the check was.
- **Graceful handling of edge cases** — countries without a personal TIN
  (UAE, Qatar, Kuwait…) return `NotApplicable` instead of failing; unknown
  country codes return `UnsupportedCountry` instead of throwing.

### Confidence semantics

The core package reports validation level explicitly. Use `ValidationLevel.Checksum`
when a public check-digit algorithm is available and has passed, or
`ValidationLevel.Format` when only structure/date rules are enforced.
This distinction is useful for downstream decision logic and aligns with the
JS package's `taxIdCheckOutcome` policy helper.

This release also aligns the .NET policy semantics with the JS/TS registry-driven validation model, so `TaxIdPolicy.Evaluate` and `taxIdCheckOutcome` now make consistent accept/warn/block decisions across runtimes.

Policy is evaluated per identifier family where a country mixes validation levels. Historical 9-digit Czech and Slovak birth numbers, Indonesian NIK values and Singapore `M` FIN values remain format-only and therefore produce `Warn` for non-empty format failures; their checksum-backed variants produce `Block`.

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
services (e.g. VIES for EU VAT numbers).

## Related packages

- `NationalIdentifiers.AspNetCore` — DI extensions, validation attribute and
  action filter for ASP.NET Core.
- `tax-id` on npm — the same rules for TypeScript/JavaScript, with an
  Angular adapter.

## License

MIT
