# Contributing

Thank you for improving National Identifiers.

## Ground rules

- Use institutional sources. Do not infer an undocumented checksum from examples.
- Distinguish format validation from checksum validation.
- Local validation never proves that an identifier was issued or remains active.
- Keep TypeScript and .NET behavior aligned.
- Do not include real personal identifiers unless an authority publishes them as examples.

## Adding or changing a rule

1. Add the institutional source and review details described in
   `docs/RULE-SOURCE-POLICY.md`.
2. Implement or update both TypeScript and .NET validators.
3. Add positive, format-error, length-error and checksum-error cases where applicable.
4. Add representative cases to `tests/fixtures/cross-runtime-contract.json`.
5. Update the country documentation and validation limitations.
6. Run the complete release gate from the root README.

## Pull requests

Describe the affected country and identifier family, source authority, source
URL, validation depth, historical formats, known exceptions and compatibility
impact. All checks must pass and new public APIs require documentation.
