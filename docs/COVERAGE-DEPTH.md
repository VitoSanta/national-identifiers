# Coverage Depth

National Identifiers covers a broad jurisdiction set, but coverage is not a
single yes/no claim. Every supported rule has an explicit validation depth and
source status.

The library performs local pre-validation only. It does not confirm that an
identifier was issued, is active, belongs to a person or belongs to a company.

## Current scope

| Scope | Count | Notes |
|---|---:|---|
| Personal state identifiers | 195 | 193 UN members, Palestine and Vatican City |
| Separate ISO territories | 7 | FO, GL, GG, HK, JE, PR, TW |
| VAT identifiers | 38 | Offline VAT format/checksum rules only |
| Company/entity tax identifiers | 12 | Offline company-tax format/checksum rules only |
| Identity consistency jurisdictions | 47 | Optional metadata comparison, not identity verification |
| Source catalogue records | 252 | Personal states, territories, VAT and company-tax entries |

## Validation depth

| Level | Meaning | Runtime result |
|---|---|---|
| `checksum` | A public check algorithm is applied after normalization and format checks. A failed checksum is treated as definitively wrong for local policy. | `validationLevel: 'checksum'` |
| `format` | Only documented structure, length, prefix, date or similar offline rules are checked. No unpublished checksum is inferred. | `validationLevel: 'format'` |
| `not_applicable` | The jurisdiction is represented, but no generalized personal tax identifier is issued for this scope. | `error: 'not_applicable'` |
| `unsupported` | The requested country/family combination is outside the implemented scope. | `unsupported_country` or `unsupported_identifier_type` |

Important: `format` may include an encoded-date check when the identifier
officially carries a birth date. It still remains format-level validation
unless a public check digit is also applied.

## Catalogue counts

The machine-readable source catalogue currently contains:

| Validation level | Records |
|---|---:|
| `checksum` | 109 |
| `format` | 128 |
| `not_applicable` | 15 |

By identifier family:

| Family | Checksum | Format | Not applicable | Total |
|---|---:|---:|---:|---:|
| `tax_id_person` | 62 | 125 | 15 | 202 |
| `vat` | 37 | 1 | 0 | 38 |
| `tax_id_company` | 10 | 2 | 0 | 12 |

By evidence status:

| Source status | Records | Meaning |
|---|---:|---|
| `verified` | 5 | The linked institutional source directly supports the implemented offline validation level. |
| `corroborated` | 107 | Cross-runtime tested and supported by repository audit, but the full primary algorithm publication was not publicly located. |
| `documented_limit` | 140 | Only a documented format, non-applicability decision or jurisdiction mapping is claimed. |

`corroborated` is not a hidden claim of primary-source verification. It is an
explicit evidence state that can be upgraded when a stronger source becomes
available.

## What coverage does not mean

Coverage does not mean:

- the identifier exists in a government registry;
- the identifier is active;
- the identifier belongs to the submitted user;
- the submitted company is registered or tax-compliant;
- a remote government service was queried.

Use official registries, VIES or authority-specific APIs when a workflow needs
registry-level verification.

## Policy mapping

The policy helpers translate validation depth into product behavior:

| Situation | Suggested policy |
|---|---|
| Valid checksum or valid format-level result | `accept` |
| Failed checksum-grade rule | `block` |
| Failed format-only rule where the country has no stronger offline check | `warn` |
| No generalized personal TIN exists | `warn` or route to an alternate field |
| Unsupported country/family combination | collect another identifier type or handle manually |

The key product decision is that format-only jurisdictions should not be treated
like checksum-backed jurisdictions. A format-only failure may still be useful,
but it is weaker evidence than a failed public check digit.

## Related documents

- [Country coverage](COUNTRY-COVERAGE.md)
- [Known limitations](KNOWN-LIMITATIONS.md)
- [Rule source policy](RULE-SOURCE-POLICY.md)
- [Trust model](TRUST-MODEL.md)
- [Identity consistency](IDENTITY-CONSISTENCY.md)
