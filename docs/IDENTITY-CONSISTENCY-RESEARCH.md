# Identity consistency - research status

Last reviewed: 2026-06-14.

The implemented capability matrix is maintained in
[IDENTITY-CONSISTENCY.md](IDENTITY-CONSISTENCY.md). This file records only the
remaining research boundary.

## Current result

Identity consistency is implemented for 47 jurisdictions:

- Italy and Mexico provide full checks including name-derived characters;
- 45 further jurisdictions provide partial checks for the biographical fields
  actually encoded by the identifier;
- ten jurisdictions validate a national identity document independently from
  the personal tax-id validator.

A local `match` is not proof of identity, issuance or ownership. The feature
compares user-supplied data only with deterministic information encoded in the
identifier.

## Why coverage cannot reach every country

Most tax and national identifiers are random or sequential. If a number does
not encode a name, date, gender or place code, an offline library cannot
compare those fields honestly. An official online registry may be able to
confirm ownership, but that is a different capability and belongs in an
optional integration.

The 47-jurisdiction set is therefore close to the practical offline ceiling,
not an incomplete attempt to force one algorithm onto 195 countries.

## Remaining source-gaps

No additional jurisdiction reached implementation-ready status in the
2026-06-14 official-source pass.

| Country / territory | Candidate document | Claim still needing a primary source | Decision |
|---|---|---|---|
| BY | personal number | Exact birth-date and gender offsets. | Keep unsupported. |
| GT | CUI | Exact meaning of the final administrative code. | Keep unsupported until RENAP publishes the semantics. |
| HN | national identity number | Any encoded date or place components. | Keep unsupported. |
| MU | NIC | Suspected encoded `DDMMYY` segment and its exceptions. | Keep unsupported. |
| NA | national identity number | Exact birth-date offsets and historical variants. | Keep unsupported. |
| TH | national ID | The official number describes citizenship/issuing-office classes, but no verified birth-date payload useful to the current API. | Keep unsupported. |
| MO | resident identity card | No official biographical payload or public checksum rule was confirmed. | Keep unsupported. |

Wikipedia, blogs, generated examples and third-party validator packages may
help discover a lead, but they cannot be the authority used to ship a rule.
Promotion requires legislation, a civil-registry specification or another
institutional document with exact offsets and conventions.

## Research workflow

1. Record the authority, primary URL, publication/review date and identifier
   version.
2. Confirm that the identifier itself encodes a supported field.
3. Document century rules, partial dates, administrative-code semantics and
   historical exceptions.
4. Add a structurally valid resolver and decoder in TypeScript and .NET.
5. Add shared positive, mismatch, partial-data and invalid-identifier fixtures.
6. Update the capability matrix, README counts, limitations and changelog.

The shared evidence-gated queue for identity, VAT and company identifiers is
[OFFICIAL-SOURCE-BACKLOG.md](OFFICIAL-SOURCE-BACKLOG.md).
