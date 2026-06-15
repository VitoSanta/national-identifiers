# Jurisdiction Audit (pre-1.0)

A systematic pass over the world's jurisdictions to establish, honestly and
per axis, what is **implemented**, what is **implementable but not yet done**
(a public algorithm and a verifiable example exist), and what is **not
possible** (no public algorithm / no encoded data). This is the evidence base
for the claim "we are at the verifiable ceiling" — or the exact list of what
remains.

Scope: ISO 3166-1 has 249 codes — 195 UN states + ~54 territories.
Sources: OECD AEOI TIN sheets, national authorities, legislation, official
technical specifications and government registries. Discovery sources may
suggest a lead but cannot authorize an implementation. A rule is
"implementable" only when an institutional source establishes its accepted
structure or algorithm; otherwise it remains a documented limit.

Date of this pass: 2026-06-15.

> **Backlog progress (2026-06-15):** VAT now covers 38 jurisdictions and
> company identifiers cover 12. The structured catalogue distinguishes
> primary-source provenance from executable examples. **AU ABN** is verified
> against the official ABR modulus-89 specification and example; **JP**
> Corporate Number is verified against Article 2 of Ministry of Finance
> Ordinance No. 70. The following implemented checks still have executable
> examples and are classified `corroborated` because their exact primary
> algorithm publication was not publicly located: **TR** VKN
> (`4540536920`), **RS** PIB (`101134702`, ISO 7064 MOD 11-10) and **KR** BRN
> (`1348672683`). Format-level UAE TRN, French SIREN and US EIN are separately
> primary-source verified.
> **Still pending** (documented, not implemented): Singapore
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

## Axis 3 — VAT / GST (38 implemented)

- **Implemented: 38** — all 27 EU countries plus AE, AR, AU, CH, CL, CO, GB,
  IL, NO, RS and RU.
- **Source-gaps:** CA, JP qualified-invoice numbers, SA, SG, TW and ZA.
  These remain out until a primary offline format/check specification is
  archived. Registry-only verification belongs in an optional online adapter.

**Verdict: at the current official-source ceiling.**

## Axis 4 — Company / entity tax id (12 implemented)

- **Implemented: 12** — AU, BR, CN, FR, IN, JP, KR, NO, NZ, RS, TR and US.
- **Promotion candidates:** AR, CL, CO, EC, MX, PE, PY and VE already have
  related personal/VAT logic, but legal-entity applicability must be proven
  by a primary source before registry wiring.
- **Source-gaps:** SG UEN and other company-registration families whose
  subtype/check rules are not yet institutionally documented in the source
  catalogue.

**Verdict: substantial coverage; further expansion remains evidence-gated.**

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

## Evidence-gated future work

The current registry has no unresolved provenance workflow records. Future
expansion remains optional and evidence-gated:

1. Promote `corroborated` records only when an exact primary algorithm document
   is found.
2. Add related entity identifiers only after primary-source applicability
   review.
3. Keep authoritative issuance/activity checks in optional online adapters.
4. Revisit reuse-based territories only when an institutional source confirms
   applicability to individuals.

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

## Historical research notes (not source authority)

These notes preserve implementation context but do not establish provenance.
The machine-readable status and institutional source for every implemented VAT
and company rule are authoritative in `tests/fixtures/rule-sources.json`.

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

### Remaining provenance work

1. Replace third-party implementation references with exact primary algorithm
   documents before changing a catalogue record to `verified`.
2. Leave SG, SA, TW, BY and MU as documented limits until an institutional
   source appears.
3. Keep release readiness separate from official issuance verification, which
   remains outside the offline core.

## Sources

- [Brønnøysund Register Centre — organisation number](https://www.brreg.no/en/about-us-2/our-registers/about-the-central-coordinating-register-for-legal-entities-ccr/about-the-organisation-number/)
- OECD AEOI/CRS TIN country sheets (per jurisdiction).
