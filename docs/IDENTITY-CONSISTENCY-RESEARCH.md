# Identity Consistency — Expansion Research

Research pass for extending `validateTaxIdIdentity` beyond the current 38
countries. Goal of the feature: given a person's data (name, surname, birth
date, place of birth) check whether an identifier is **structurally
consistent** with it. This file classifies the 195 states by what their
identifiers actually encode, so implementation never claims more than the
number contains.

Date of this pass: 2026-06-13. Entries are marked:

- ✅ **verified** — encoding confirmed by a cited source this pass;
- 🟡 **known, verify offsets** — encoding is well established but exact digit
  positions/conventions must be confirmed against an institutional source
  before coding;
- ⚠️ **needs research** — could not confirm; do not implement yet;
- ❌ **no personal data** — identifier is random/sequential; nothing to check.

## The hard ceiling (why this is not "all 195")

To check a birth date against an identifier, the identifier must **contain**
the birth date. For most countries the personal/tax identifier is a random or
sequential number with zero biographical content (Germany IdNr, US SSN,
Netherlands BSN, Brazil CPF, Spain DNI, Japan My Number, India Aadhaar,
Iran, Israel, Turkey, most Latin American cédulas, most of the Gulf tax
numbers). For these the only honest result is `not_supported`. The reachable
set is "countries whose identity document encodes a birth date", realistically
in the **mid‑40s to ~50s**, not 195.

## Central architectural note

Every expansion candidate below encodes data in a **national identity
document that the library does not currently validate** (e.g. France encodes
nothing in the fiscal SPI but everything in the NIR). The current identity API
runs `validateTaxId(country, value)` first and only then decodes, so these
documents fail validation and return `insufficient_data`.

Implementing the candidates therefore requires one of:

1. **Add the identity document as a recognized identifier** (own validator +
   `validationLevel`), then let the identity decoder run on it; or
2. **Decouple identity-consistency from tax validation** — let
   `validateTaxIdIdentity` accept and structurally validate the relevant
   document independently, while `validateTaxId` stays focused on tax codes.

Recommendation: option 2 with an explicit `documentType` on the identity
request (e.g. `'tax_id' | 'national_id'`), so we never blur the two. This also
cleanly handles countries where the tax id and the identity doc differ.

A second cross-cutting need: **partial-date matching**. France (year+month,
no day) and Vietnam (year only) encode incomplete dates. The current matcher
requires year+month+day together. Extend `DecodedIdentity` handling so a
decoder can assert only the components it has, and `birthDate` is compared
component-by-component.

---

## Group A — already covered (38)

Full: IT. Partial: AL, BA, BE, BG, CN, CU, CZ, DK, EE, FI, HU, ID, IS, KG,
KR, KZ, LK, LT, LU, LV, ME, MK, MN, MX (RFC, date only), MY, NI, NO, PK, PL,
RO, RS, SE, SK, SV, UA, UZ, ZA. See `IDENTITY-CONSISTENCY.md` for the field
matrix.

---

## Group B — implementable expansion (data in another document)

### High value, ✅ verified this pass

| Country | Document | Encodes | Offsets (verified) | Notes |
|---|---|---|---|---|
| **FR** | NIR / numéro INSEE (15) | sex, birth year, birth **month**, department, commune | `s yy mm dd? …` → `s`=sex (1 M/2 F), `yy` year, `mm` month, then department(2)+commune(3). **No day.** | Library validates the SPI (no data). Needs partial-date (year+month) matching. Department/commune = place proxy. |
| **EG** | National ID (14) | century, full DOB, governorate, sex | digit 0 century; 1–6 `YYMMDD`; 7–8 governorate; 13th digit sex (odd M / even F) | Library validates the 9-digit TIN. Full date + place + sex → near-full once name is excluded. |
| **MX** | CURP (18) | **name+surname letters**, full DOB, sex, state | 0–3 name letters; 4–9 `YYMMDD`; 10 sex (H/M); 11–12 state; 13–15 internal consonants; 16 diff; 17 check | Richer than the RFC we use now. Could make MX a **second `full`** country (name+date+sex+place). |
| **VN** | CCCD (12) | province, sex, birth century, birth **year** | 0–2 province; 3 century+sex (0 M/1 F 1900s, 2 M/3 F 2000s…); 4–5 year. **No month/day.** | Library treats 10/12/13-digit forms generically. Year-only date → partial-date matching. |
| **KW** | Civil ID (12) | century, full DOB, serial, check | digit 0 century; 1–6 `YYMMDD`; 7–10 serial; 11 check | Library returns `not_applicable` for KW tax. Sex parity in serial — 🟡 verify before claiming sex. |

### Lower value / partial signal

| Country | Document | Encodes | Mark |
|---|---|---|---|
| **AE** | Emirates ID (784-…) | birth **year** only (+ country prefix) | 🟡 verify; year-only → weak |
| **TW** | National ID | region of birth + sex (no DOB) | 🟡 sex+region only, like a region-aware PK |
| **TH** | National ID (13) | citizenship type + region + sex (no DOB) | 🟡 sex/region only |

---

## Group C — no biographical data (return `not_supported`, by design)

Confirmed or strongly established as random/sequential, **nothing to verify**:

- **Europe**: DE, NL, AT, HR (OIB), GE, GR, ES, PT, FR-SPI, IE, GB, RU (INN),
  MD, BY, SM, MC, AD, LI, CY, MT, CH, SK-DIČ.
- **Americas**: US, CA, BR, AR, CL, CO (NUIP sequential), PE (DNI sequential),
  UY, VE (sequential), BO, PY, GT, HN, DO (sequential), EC (province+sequential,
  no DOB), JM, TT, BB, BS, BZ, GY, SR, PA, CR, plus the Caribbean micro-states.
- **Asia**: JP, IN (Aadhaar), IR, IL, IQ, TR, SG-tax (NRIC has no DOB), PH, NP,
  BD, MM, KH, LA, LK-tax, the Gulf tax numbers, SA, QA, BH-tax, OM, JO, LB, SY.
- **Africa**: NG, KE, GH, TZ, UG, RW, ET, ZM, MW, most West/Central African
  NIF/IFU (sequential), MA, TN, DZ, AO, MZ, etc.
- **Oceania**: AU (TFN), NZ (IRD), PG, FJ, and the Pacific micro-states.

These are not gaps. The product is "complete and honest" precisely by
declaring them unverifiable rather than fabricating a check.

---

## Realistic outcome

- Solid additions (✅): **FR, EG, MX→full, VN, KW** → ~5 countries, all
  high-traffic for travel/tourism.
- Possible weak additions (🟡, verify first): AE, TW, TH, plus any national ID
  found to encode DOB during a deeper per-country pass.
- New ceiling after Group B: roughly **43–48 countries**, then a long honest
  tail of `not_supported`.

## Recommended implementation order

1. **MX via CURP** — biggest single win (a second `full` country: name + date
   + sex + state). Reuses the Italian name-encoding approach conceptually.
2. **EG National ID** — full date + governorate + sex; clean offsets.
3. **FR NIR** — needs partial-date (year+month) support; very high traffic.
4. **VN CCCD** + **KW Civil ID** — year-only / full-date respectively.
5. Decide the `documentType` architecture (option 2 above) before #1, since
   all of these are non-tax documents.

## Open verification items before coding

- KW/AE sex encoding (serial parity) — confirm against an institutional source.
- EG check-digit algorithm (if we also want to validate, not just decode).
- TW/TH exact region/sex offsets and whether they are worth a sex-only checker.
- MX CURP check-digit algorithm and the homonym differentiator rules.
- Confirm no day-of-birth in FR NIR (year+month only) before shipping the
  partial-date matcher.

## Sources

- [Wikipedia — National identification number](https://en.wikipedia.org/wiki/National_identification_number)
- [Wikipedia / INSEE code — French NIR structure](https://en.wikipedia.org/wiki/INSEE_code)
- [Egyptian National Identity Card — Wikipedia](https://en.wikipedia.org/wiki/Egyptian_National_Identity_Card)
- [Unique Population Registry Code (CURP) — Wikipedia](https://en.wikipedia.org/wiki/Unique_Population_Registry_Code)
- [Vietnamese identity card — Wikipedia](https://en.wikipedia.org/wiki/Vietnamese_identity_card)
- [Kuwait Civil ID format](https://kuwaitsvcinfo.com/kuwait-civil-id-format/)
- [National Identity Card (Dominican Republic) — Wikipedia](https://en.wikipedia.org/wiki/National_Identity_Card_(Dominican_Republic))
</content>
