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

> **Backlog progress (2026-06-14):** the solid, source-verified items are now
> implemented — VAT for AR, CL, CO, IL and RU (reusing the registered entity's
> checksummed identifier), and company tax id for China (USCC, ISO 7064 MOD
> 31-3, verified against the Tencent USCC), Norway and New Zealand (reuse).
> VAT now covers 37 jurisdictions; company covers 10. Newly implemented and
> each verified against a real example from an authoritative library test
> suite: **JP** Corporate Number (`5835678256246`), **TR** VKN
> (`4540536920`), **RS** PIB (`101134702`, ISO 7064 MOD 11-10) and **KR** BRN
> (`1348672683`). **Still pending** (documented, not implemented): Singapore
> UEN, Saudi Arabia VAT, Taiwan business number (algorithm not officially
> published or example not yet confirmed), the broader EU company-registration
> tail, and identity for Belarus / Mauritius.

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

## Detailed implementation backlog (meticulous, 2026-06-14 deep pass)

Per-candidate spec to follow when finalizing. Status legend: **READY** =
public algorithm + a verifiable example in hand; **EXAMPLE PENDING** =
algorithm public/standard but no confirmed real example yet; **LIMIT** =
algorithm not officially published / not confirmable.

### Company / business tax id

- **JP — Corporate Number (Houjin Bangō), 13 digits — DONE.**
  - Algorithm (MOF Ordinance No.70 of 2014): the 13-digit number is a 1-digit
    check digit followed by the 12-digit base. Check = `9 − ((Σ Pn·Qn) mod 9)`
    where `Pn` is the n-th base digit counting from the **right** (n=1 is the
    rightmost) and `Qn` = 1 if n is odd, 2 if n is even.
  - Verifiable example (python-stdnum `jp.cn`): **5835678256246** is valid;
    **2835678256246** is invalid (same base, wrong check digit).
  - Family: `tax_id_company`. Source: MOF ordinance; python-stdnum.

- **TR — VKN (Vergi Kimlik Numarası), 10 digits — DONE.**
  - Algorithm (python-stdnum `tr.vkn`): for i=0..8, `c1=(d_i + 9 − i) mod 10`;
    `c2=(c1 · 2^(9−i)) mod 9`, and if `c1≠0 and c2==0` then `c2=9`; the check
    digit (10th) = `(10 − (Σ c2) mod 10) mod 10`.
  - Verifiable example (python-stdnum): **4540536920** is valid.
  - Family: `tax_id_company` (also the company VAT base). Source: python-stdnum.

- **RS — PIB, 9 digits — DONE.**
  - Algorithm: ISO 7064 MOD 11-10 (a valid full number checksums to 1).
  - Verified example (python-stdnum `rs.pib`): **101134702** valid;
    **101134703** invalid. Family: `vat` + `tax_id_company`.

- **KR — Business Registration Number, 10 digits — DONE.**
  - Algorithm (NTS): weights `[1,3,7,1,3,7,1,3,5]` over digits 1-9; add
    `floor(d9 · 5 / 10)`; check (digit 10) = `(10 − (sum mod 10)) mod 10`.
  - Verified example (DataPrep `kr_brn`): **1348672683** valid.
    Family: `tax_id_company`.

- **SG — UEN — LIMIT.** The trailing check-letter algorithm is not officially
  published by ACRA and the format varies by entity type. Documented limit.

### VAT

- **RS, KR** as above (shared identifier with the company number).
- **SA — VAT, 15 digits — LIMIT.** A check digit exists ("10th position") but
  no clean public algorithm was found. Documented limit pending a source.
- **TW — business number (BAN), 8 digits — EXAMPLE PENDING.** Custom weighted
  checksum referenced by several libraries; confirm the exact weights and a
  real example before implementing.

### Identity consistency (data encoded in the personal code)

- **BY — Belarus personal number — LIMIT.** Structure (century/sex char +
  DDMMYY + region…) is suspected but not confirmed by an institutional source.
- **MU — Mauritius NIC — LIMIT.** Suspected `letter + DDMMYY + serial + check`
  but neither the positions nor the check algorithm are officially documented.
- No other state was found whose **personal** tax code encodes biographical
  data beyond the 47 already covered; this axis remains at the ceiling.

### Plan to finalize before publishing

1. Implement the **READY** items now: JP Corporate Number, TR VKN
   (`tax_id_company`), each verified against the example above.
2. Source a verifiable example for **RS PIB** and **KR BRN**; implement on
   confirmation, else leave as documented limits.
3. Leave SG, SA, TW, BY, MU as documented limits until an official source
   appears.
4. Then bump versions and publish 1.0.0.

## Sources

- [Wikipedia — VAT identification number](https://en.wikipedia.org/wiki/VAT_identification_number)
- [Wikipedia — National identification number](https://en.wikipedia.org/wiki/National_identification_number)
- [Wikipedia — Corporate Number (Japan)](https://en.wikipedia.org/wiki/Corporate_Number)
- [Brønnøysund Register Centre — organisation number](https://www.brreg.no/en/about-us-2/our-registers/about-the-central-coordinating-register-for-legal-entities-ccr/about-the-organisation-number/)
- OECD AEOI/CRS TIN country sheets (per jurisdiction).
