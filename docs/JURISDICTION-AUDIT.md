# Jurisdiction Audit (pre-1.0)

A systematic pass over the world's jurisdictions to establish, honestly and
per axis, what is **implemented**, what is **implementable but not yet done**
(a public algorithm and a verifiable example exist), and what is **not
possible** (no public algorithm / no encoded data). This is the evidence base
for the claim "we are at the verifiable ceiling" — or the exact list of what
remains.

Scope: ISO 3166-1 has 249 codes — 195 UN states + ~54 territories.
Sources: OECD AEOI TIN sheets, Wikipedia "VAT identification number" and
"National identification number", official registries. Rule: an item is
"implementable" only if a public check algorithm **and** a verifiable example
are available; otherwise it is a documented limit.

Date of this pass: 2026-06-14.

---

## Axis 1 — Personal tax identifier (195 states)

- **Implemented: 195 / 195.** Breakdown: 60 checksum-grade, 120 format-only,
  15 `not_applicable` (no personal TIN). See `COUNTRY-COVERAGE.md`.
- **Implementable but not done (format → checksum upgrades):** none identified
  with high confidence. The 120 format-only countries are format-only because
  no public personal-TIN check algorithm could be sourced; spot re-checks did
  not surface hidden public algorithms. To revisit only if an official spec
  appears for a specific country.
- **Not possible:** the random/serial personal identifiers (most of the 120)
  and the 15 `not_applicable` jurisdictions.

**Verdict: at the ceiling.**

## Axis 2 — Identity consistency (47 jurisdictions)

- **Implemented: 47** (Italy + Mexico full; 45 partial).
- **Implementable but not done:** Belarus (personal number) and Mauritius
  (NIC) — structure suspected (DDMMYY-based) but not confirmed by an
  institutional source; **not implemented by rule**.
- **Not possible:** ~150 states whose personal identifier encodes no
  biographical data (serial/random). This is a property of the numbers.

**Verdict: at the ceiling, modulo Belarus/Mauritius pending sources.**

## Axis 3 — VAT / GST (31 implemented)

- **Implemented: 31** — all 27 EU + AU (ABN), CH (UID), GB, NO (MVA).
- **Implementable but not done (public check digit confirmed this pass):**

  | Country | Number | Check | Source |
  |---|---|---|---|
  | **RU** Russia | INN 10/12 | MOD 11-10 | Wikipedia VAT |
  | **RS** Serbia | PIB 9 | ISO 7064 MOD 11-10 | Wikipedia VAT |
  | **IL** Israel | 9 digits | Luhn | Wikipedia VAT |
  | **JP** Japan | 13 digits | leading check digit | Wikipedia VAT |
  | **CL** Chile | RUT 8+1 | modulo 11 (already a personal validator) | Wikipedia VAT |
  | **CO** Colombia | NIT 10 | modulo 11 (already a personal validator) | Wikipedia VAT |
  | **TW** Taiwan | business 8 | custom checksum | Wikipedia VAT |
  | **SA** Saudi Arabia | 15 digits | check at 10th position | Wikipedia VAT (verify) |

  CL/CO can largely reuse the existing personal RUT/NIT checksum logic.

- **No check digit (format-only at best, lower value):** CA, CN, ID, MX, NZ,
  NG, UA, IS, AR (table says none; CUIT mod-11 exists — verify), TR (table
  says none; VKN check exists — verify).

**Verdict: NOT at the ceiling. ~6–8 sourced VAT countries remain.**

## Axis 4 — Company / entity tax id (3 implemented)

- **Implemented: 3** — Brazil (CNPJ), India (GSTIN), Australia (ACN).
- **Implementable but not done (public check digit confirmed this pass):**

  | Country | Number | Check | Source |
  |---|---|---|---|
  | **SG** Singapore | UEN | trailing check letter | ACRA / search |
  | **JP** Japan | Corporate Number 13 | leading check digit | National Tax Agency |
  | **IL** Israel | H.P. company 9 | Luhn mod-10 | search |
  | **CN** China | USCC 18 | ISO 7064 MOD 31-3 | search |
  | **NO** Norway | Organisasjonsnummer 9 | MOD 11 (already used for NO VAT) | Brønnøysund |
  | **NZ** New Zealand | NZBN / IRD | IRD check digit (already a personal validator) | search |

- **Lower confidence / verify:** most EU countries also have a company
  registration number with a check; to be added only where the algorithm and
  an example are confirmed per country.

**Verdict: NOT at the ceiling. ~6 sourced company identifiers remain, plus a
long EU tail to verify case by case.**

## Axis 5 — Territories (7 implemented)

- **Implemented: 7** — HK, TW (checksum); GL, FO (Danish CPR); PR (US SSN);
  JE, GG (format-only, OECD).
- **Documented limits (no public structure/checksum):** GI, IM, MO, AW, CW, SX
  (see `KNOWN-LIMITATIONS.md`).
- **Not examined in depth / likely no personal TIN:** the no-income-tax
  territories (Bermuda BM, Cayman KY, BVI VG, Turks & Caicos TC, Anguilla AI)
  generally issue no personal TIN. French overseas collectivities (NC, PF, WF,
  BL, MF, PM) and Åland (AX), Svalbard (SJ) fall under FR/FI/NO systems
  respectively — candidates to map by reuse, to be verified.

**Verdict: partially at the ceiling; a few reuse-based territories may remain.**

---

## Actionable implementable backlog (sourced)

Ordered by value/confidence:

1. **VAT, reuse-friendly:** CL, CO (reuse personal checksum) — quick wins.
2. **VAT, new checksum:** RU, RS, IL, JP (+ SA/TW to verify).
3. **Company, new checksum:** SG, JP, IL, CN (+ NO/NZ reuse).
4. **Territories by reuse:** French collectivities + Åland (verify the linked
   system applies to individuals).

Each item still requires: confirm the exact algorithm against an institutional
source **and** a verifiable example, then implement TS + .NET, add a shared
fixture, update docs, and pass the full gate. Items that fail sourcing become
documented limits.

## Conclusion

- **Personal tax-id and identity consistency: at the verifiable ceiling**
  (modulo Belarus/Mauritius).
- **VAT, company and a few territories: NOT at the ceiling** — there is a
  concrete, bounded, sourced backlog (~12–16 identifiers) above. The honest
  statement is therefore: the *personal* scope is complete; the *business and
  territory* scope is a curated subset with a known remaining list.

## Sources

- [Wikipedia — VAT identification number](https://en.wikipedia.org/wiki/VAT_identification_number)
- [Wikipedia — National identification number](https://en.wikipedia.org/wiki/National_identification_number)
- [Wikipedia — Corporate Number (Japan)](https://en.wikipedia.org/wiki/Corporate_Number)
- [Brønnøysund Register Centre — organisation number](https://www.brreg.no/en/about-us-2/our-registers/about-the-central-coordinating-register-for-legal-entities-ccr/about-the-organisation-number/)
- OECD AEOI/CRS TIN country sheets (per jurisdiction).
