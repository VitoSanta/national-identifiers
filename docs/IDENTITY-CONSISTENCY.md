# Identity Consistency Validation

## Purpose

National Identifiers may eventually offer optional checks that compare an
identifier with user-supplied biographical data. This capability answers:

> Is this identifier structurally consistent with these attributes?

It must never claim:

> This identifier exists, was issued by an authority, or belongs to this user.

Authoritative verification requires an official registry or provider and
remains outside the offline core.

## Why It Is Optional

Identifier semantics differ by country. Some identifiers encode birth date,
sex, birthplace or fragments of a name; others are random serial numbers or
expose only a checksum. A universal full-identity check is therefore neither
possible nor honest.

Support must be capability-based and declared per country and identifier
family. Possible outcomes are:

```ts
type IdentityConsistencyStatus =
  | 'match'
  | 'partial_match'
  | 'mismatch'
  | 'insufficient_data'
  | 'not_supported';
```

## Proposed API

Identity consistency should use a separate API so the stable
`validateTaxId(country, value)` contract remains focused:

```ts
const result = validateTaxIdIdentity({
  country: 'IT',
  taxId: 'SNTVTI00E18A662I',
  identity: {
    firstName: 'Vito',
    lastName: 'Santanelli',
    birthDate: '2000-05-18',
    gender: 'M',
    birthPlaceCode: 'A662',
  },
});
```

The result should report the overall status, evaluated fields, mismatches,
missing fields and confidence level without returning unnecessary personal
data.

## Italian First Slice

The Italian Codice Fiscale is a suitable first implementation because it
encodes:

- consonant and vowel sequences derived from surname and given name;
- year, month, day and sex;
- municipality or foreign-state birth code;
- final check character.

Implementation must also account for omocodia, historical municipality codes,
suppressed municipalities, foreign birthplaces, diacritics and official
name-normalization rules.

A local match means only that the code can be derived from compatible data.
Synthetic but internally consistent data can still produce a valid code.

## Registry Metadata

Capabilities should be explicit:

```ts
identityConsistency: {
  level: 'full',
  requiredFields: [
    'firstName',
    'lastName',
    'birthDate',
    'gender',
    'birthPlaceCode',
  ],
}
```

The current implementation exposes 42 countries:

- full name, birth date, gender and birthplace: IT;
- birth date and gender: BA, BE, BG, CZ, DK, EE, FI, FR, KR, KZ, LK, LT, ME,
  MK, NO, PL, RO, RS, SE, SK, UA, UZ and ZA;
- birth date, gender and an encoded administrative place code: CN, EG, ID, MX,
  MY and VN;
- birth date only: AL, CU, HU, IS, KG, KW, LU, LV, MN, NI and SV;
- gender only: PK.

Five countries decode a **national identity document** rather than the tax
identifier: EG (National ID), FR (NIR), KW (Civil ID), MX (CURP) and VN
(CCCD). These are validated structurally inside the identity layer, so the
`validateTaxId` contract is untouched. Mexico also accepts the RFC tax id as a
fallback, which yields a date-only (`partial_match`) check.

Some formats encode an incomplete date: FR encodes birth year and month (no
day) and VN encodes only the birth year. For these, the birth date is compared
to the available granularity and the result still reports `birthDate` as
checked. For formats that encode only a two-digit year, consistency compares
the final two digits and does not infer a century. Administrative codes are
compared as encoded values; they are not presented as proof of birthplace
unless the country specification defines them that way.

## Privacy and Security

- Do not log or persist identifiers or biographical attributes.
- Do not include real user data in fixtures.
- Return field names and result codes, not echoed personal values.
- Keep remote registry integrations in separate optional packages.
- Document the lawful basis and retention policy in consuming applications.
- Never label local consistency as identity verification.

## Delivery Plan

1. ~~Define cross-runtime request, result and capability models.~~ Done:
   `validateTaxIdIdentity` / `taxIdIdentityCapability` (TS) and
   `TaxIdIdentityValidator.Validate` / `.Capability` (.NET) share the same
   status, field-name and result semantics.
2. ~~Implement Italy in TypeScript and .NET from institutional rules.~~ Done:
   surname/given-name encoding with diacritic folding, birth date, sex via
   the +40 day offset, Belfiore birthplace code and omocodia decoding.
3. ~~Add shared fixtures for ordinary, omocodic and historical cases.~~ Done:
   `tests/fixtures/identity-consistency-contract.json` is consumed unchanged
   by the Node.js and xUnit suites (ordinary, omocodic, female, diacritic,
   mismatch, partial, insufficient-data and not-supported cases).
4. ~~Expand countries where the existing identifier rules encode meaningful
   attributes.~~ Done for 37 additional countries, protected by
   `identity-consistency-country-cases.json` in both runtimes.
5. Add Angular and ASP.NET integration only after the core contract stabilizes.
6. Extend support only where institutional specifications make additional
   comparisons meaningful.

Steps 1-4 shipped ahead of the identifier-families work; the API is additive
and does not touch the stable `validateTaxId` contract. Historical
municipality catalogues and official name-collision edge cases remain open
items for the Italian slice.
