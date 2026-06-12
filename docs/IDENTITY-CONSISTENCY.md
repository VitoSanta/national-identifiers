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

Other countries may expose `partial` support when only birth date, sex or
region can be checked.

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
4. Add Angular and ASP.NET integration only after the core contract stabilizes.
5. Expand country by country where official semantics make meaningful checks
   possible.

Steps 1-3 shipped ahead of the identifier-families work; the API is additive
and does not touch the stable `validateTaxId` contract. Historical
municipality catalogues and official name-collision edge cases remain open
items for the Italian slice.
