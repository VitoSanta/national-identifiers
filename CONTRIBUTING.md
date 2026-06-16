# Contributing

Thank you for improving National Identifiers.

## Ground rules

- Use institutional sources. Do not infer an undocumented checksum from examples.
- Distinguish format validation from checksum validation.
- Local validation never proves that an identifier was issued or remains active.
- Keep TypeScript and .NET behavior aligned.
- Do not include real personal identifiers unless an authority publishes them as examples.

## Adding or changing a rule

1. Add or update the candidate in `docs/OFFICIAL-SOURCE-BACKLOG.md` using the
   candidate intake checklist.
2. Add the institutional source and review details described in
   `docs/RULE-SOURCE-POLICY.md`.
3. Implement or update both TypeScript and .NET validators.
4. Run `npm run sources:generate` after changing personal or territory
   registry coverage; edit VAT/company source records explicitly.
5. Add positive, format-error, length-error and checksum-error cases where applicable.
6. Add representative cases to `tests/fixtures/cross-runtime-contract.json`.
7. Update the country documentation and validation limitations.
8. Run `npm run sources:check` and the complete release gate from the root README.

Do not submit a rule implemented in only one runtime. Public behavior must stay
aligned across TypeScript and .NET in the same change.

Coverage belongs in `docs/COUNTRY-COVERAGE.md`; reduced or intentionally
unsupported behavior belongs in `docs/KNOWN-LIMITATIONS.md`.

## Pull requests

Describe the affected country and identifier family, source authority, source
URL, validation depth, historical formats, known exceptions and compatibility
impact. All checks must pass and new public APIs require documentation.
