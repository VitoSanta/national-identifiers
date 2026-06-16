# Rule Source Policy

Every validation rule must be traceable to an institutional source.
The public interpretation of each validation level is documented in
[Coverage Depth](COVERAGE-DEPTH.md).

## Accepted sources

Preferred, in order:

1. national tax, civil-registry or social-security authority;
2. legislation or official technical specifications;
3. OECD Tax Identification Number country documentation;
4. an official government form or registration portal.

Community packages, blog posts and generated examples can support research but
cannot be the sole authority for a checksum rule.

## Structured catalogue

Every supported personal, territory, VAT and company identifier has one record in
[`tests/fixtures/rule-sources.json`](../tests/fixtures/rule-sources.json),
validated against
[`rule-sources.schema.json`](../tests/fixtures/rule-sources.schema.json).

```json
{
  "country": "AE",
  "jurisdictionType": "state",
  "identifierType": "vat",
  "identifierName": "Tax Registration Number (TRN)",
  "validationLevel": "format",
  "authority": "UAE Federal Tax Authority",
  "sourceUrl": "https://tax.gov.ae/en/taxes/Vat/vat.topics/registration.for.vat.aspx",
  "sourceType": "tax_authority",
  "accessedAt": "2026-06-15",
  "lastReviewedAt": "2026-06-15",
  "provenanceStatus": "verified",
  "limitations": [
    "Offline validation checks only the documented 15-digit structure."
  ]
}
```

The catalogue uses three terminal evidence states:

- `verified`: the linked institutional source directly supports the implemented
  offline validation level;
- `corroborated`: the rule is cross-runtime tested and supported by the
  repository evidence audit, but the full primary algorithm publication was
  not publicly located;
- `documented_limit`: only a documented format, non-applicability decision or
  jurisdiction mapping is claimed.

`corroborated` and `documented_limit` are closed evidence decisions, not hidden
verification claims. They can be upgraded when a stronger source appears.

## Review rules

- Record the date on which the source was accessed.
- Re-review checksum rules at least annually.
- Re-review immediately after a government announces a numbering change.
- Preserve historical formats when official documentation says they remain valid.
- Downgrade to format-only when a checksum cannot be supported institutionally.
- Never include production user data in fixtures.

The Node.js and .NET suites enforce all 252 current registry combinations,
unique jurisdiction/country/family keys, institutional HTTPS sources, registry
validation-level parity, terminal evidence decisions and a review date no
older than one year. No rule can enter either runtime without a catalogue
record.
