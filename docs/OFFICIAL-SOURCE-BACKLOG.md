# Official-source implementation backlog

Last reviewed: 2026-06-15.

This document is the public implementation queue for identifier families that
are not yet supported. It deliberately excludes rules already implemented in
TypeScript and .NET:

- personal tax identifiers for 195 states and 7 separately modelled
  territories;
- identity consistency for 47 jurisdictions;
- offline VAT validation for 38 countries;
- company/entity tax-id validation for 12 countries.

The backlog contains only information found in an institutional source. A
widely copied algorithm is not enough. If an authority documents only the
shape of an identifier, the maximum honest implementation is
`validationLevel: 'format'`.

## Status vocabulary

| Status | Meaning |
|---|---|
| `ready` | The cited official source is sufficient for the stated validation level. |
| `source-gap` | The identifier exists, but the public primary source does not yet describe enough of its structure or checksum. |
| `not-actionable` | The identifier has no offline semantic relation to user data, or validation requires an authoritative online registry. |

Every `ready` item must still ship in TypeScript and .NET together, with
shared fixtures, positive and negative cases, README counts, limitations and
changelog entries.

## Completed from the official-source queue

These entries have now shipped in both runtimes with shared fixtures.

| Country | Family | Implemented rule | Level | Institutional evidence | Status |
|---|---|---|---|---|---|
| US | `tax_id_company` | EIN: normalize `XX-XXXXXXX` to nine digits; no invented checksum. | format | IRS Publication 1635 defines the nine-digit EIN and printed form. | `done` |
| JP | `tax_id_company` | Corporate Number: 13 digits with the statutory leading check digit. | checksum | NTA/MOF Corporate Number specification and ordinance. | `done` |
| FR | `tax_id_company` | SIREN: nine digits, excluding the all-zero sentinel. | format | INSEE defines nine digits and identifies the ninth as a control digit; the cited page does not publish its calculation. | `done` |
| AE | `vat` | TRN: normalized 15-digit structure; issuance remains an online check. | format | UAE Federal Tax Authority exposes an official verifier requiring a 15-character TRN. | `done` |

### Sources for completed items

- US: [IRS Publication 1635 - Understanding Your
  EIN](https://www.irs.gov/pub/irs-pdf/p1635.pdf)
- JP: [Japan National Tax Agency - About Corporate
  Numbers](https://www.houjin-bangou.nta.go.jp/en/setsumei/)
- FR: [INSEE - Numero
  SIREN](https://www.insee.fr/fr/metadonnees/definition/c2047)
- AE: [Federal Tax Authority - VAT registration and TRN
  verification](https://tax.gov.ae/en/taxes/Vat/vat.topics/registration.for.vat.aspx)

## Existing algorithms that may be promoted to a new family

The core already contains related checksum code for the identifiers below.
Promotion is not an automatic alias: the repository source record must prove
that the accepted subtypes apply to legal entities.

| Country | Existing validator | Candidate family | Required source decision |
|---|---|---|---|
| AR | CUIT/CUIL | `tax_id_company` | VAT reuse is implemented; confirm entity CUIT prefixes before company promotion. |
| CL | RUT/RUN | `tax_id_company` | VAT reuse is implemented; confirm entity subtype coverage. |
| CO | NIT | `tax_id_company` | VAT reuse is implemented; lock the DIAN legal-entity definition. |
| EC | cedula/personal RUC | `tax_id_company`, possibly `vat` | Add the distinct public- and private-entity RUC branches; do not reuse the personal branch. |
| MX | RFC, including the 12-character entity form | `tax_id_company` | Record the SAT entity RFC grammar and check-digit table as a primary source. |
| PE | RUC | `tax_id_company`, possibly `vat` | Confirm legal-entity prefixes and accepted RUC classes. |
| PY | RUC | `tax_id_company`, possibly `vat` | Confirm that the DNIT modulus-11 note applies unchanged to entity RUCs. |
| VE | RIF | `tax_id_company`, possibly `vat` | Confirm entity prefixes and the SENIAT checksum rule. |

Until each row has its primary link and reviewed date in the structured source
catalogue, it remains `source-gap` and must not be wired into a family
registry.

## VAT and company candidates held for stronger sources

The following identifiers are real and commonly documented, but this pass did
not find a public institutional source sufficient to implement the advertised
checksum safely. They are intentionally not implementation tasks yet.

| Country | Candidate | What is officially established | Missing before coding | Status |
|---|---|---|---|---|
| BR | future alphanumeric CNPJ | Receita Federal has announced the future format while numeric CNPJ is already supported. | Final effective specification and migration date before widening the current numeric rule. | `source-gap` |
| CA | BN / GST-HST account | CRA confirms that GST/HST registration uses a Business Number and program account. | A primary format specification and any public check rule. | `source-gap` |
| JP | qualified-invoice registration number | NTA provides an authoritative invoice-register lookup. | Primary offline grammar for all issuer categories and its relationship to Corporate Number. | `source-gap` |
| SA | VAT/TIN | ZATCA provides official registration and verification services. | Primary offline layout and checksum specification. | `source-gap` |
| SG | UEN / GST registration number | Government and IRAS registries are authoritative. | Official subtype grammar and checksum rules for every accepted UEN generation. | `source-gap` |
| TW | Uniform Business Number | Ministry of Finance lookup services are authoritative. | Primary published checksum specification and treatment of exceptional seventh digit values. | `source-gap` |
| ZA | VAT number | SARS provides registration and online tax services. | Official offline grammar/checksum specification. | `source-gap` |

General official references:

- [European Commission - VAT identification
  numbers](https://taxation-customs.ec.europa.eu/taxation/vat/vat-directive/vat-identification-numbers_en)
- [European Commission - VIES](https://ec.europa.eu/taxation_customs/vies/)
- [Canada Revenue Agency - Register for a GST/HST
  account](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/gst-hst-account/register-account.html)
- [OECD AEOI portal - Tax identification
  numbers](https://www.oecd.org/en/networks/global-forum-tax-transparency/resources/aeoi-implementation-portal/tax-identification-numbers.html)

An official online lookup proves registry status at query time; it does not
automatically provide a reusable offline algorithm. Online checks belong in
optional integrations and must never be silently performed by the core.

## Identity-consistency research

No additional country reached `ready` in this pass.

The current 47-jurisdiction set is close to the practical offline ceiling.
Most remaining tax identifiers are random or sequential and therefore cannot
be compared with name, birth date, gender or birthplace. The following open
claims were checked again but remain gated because an institutional source
for exact offsets and conventions was not found:

| Country / territory | Candidate document | Unverified claim | Decision |
|---|---|---|---|
| BY | personal number | Encoded birth date and sex. | Keep unsupported. |
| GT | CUI | Administrative birthplace/registration code in the final digits. | Keep unsupported until RENAP publishes the exact semantics. |
| HN | national identity number | Possible encoded place/date components. | Keep unsupported. |
| MU | NIC | Suspected encoded `DDMMYY` segment. | Keep unsupported. |
| NA | national identity number | Suspected encoded birth date. | Keep unsupported. |
| TH | national ID | Issuing-office and citizenship-class fields, but no verified birth-date encoding. | Not useful for the current user-data model; keep unsupported. |
| MO | resident identity card | Numbering series is documented informally, but no biographical payload or official checksum rule was confirmed. | Keep unsupported. |

These rows must not be implemented from Wikipedia, blogs, validator packages
or generated examples. A future pass may promote one only after recording an
official civil-registry specification or legislation with exact offsets.

## Country-by-country sweep outcome

The remaining states not named above do not currently produce a new offline
task:

- their personal identifier is already represented in the 195-state registry;
- their identifier does not encode additional biographical fields;
- no distinct company/VAT identifier with a public primary offline rule was
  found; or
- the only stronger check is an authoritative registry query.

This is an evidence boundary, not a permanent assertion that no rule exists.
When a new official source is found, add the country to this file with the
source URL, source date, identifier family, accepted subtypes and maximum
honest validation level before writing code.

## Evidence-gated expansion order

The current registry contains no unresolved provenance workflow state.
Candidates below are optional future expansion rather than release blockers.

1. Promote a `corroborated` catalogue record only after preserving the exact
   institutional algorithm URL and review date.
2. Promote existing algorithms to `tax_id_company` only after the entity
   applicability source is locked.
3. Revisit checksum candidates one country at a time. Never copy a de facto
   algorithm into the public API without a primary source.
4. Keep registry/issuance verification in optional online adapters.
