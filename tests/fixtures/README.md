# Cross-runtime fixtures

`cross-runtime-contract.json` is consumed unchanged by the Node.js and .NET
test suites. It protects normalization, validation level, error code and policy
outcome parity across runtimes.

Add a fixture whenever:

- a new country or identifier family is introduced;
- normalization differs from the generic normalizer;
- a country mixes format-only and checksum-backed identifiers;
- a regression is found in only one runtime.

The fixture set is representative in 0.1 and will expand to every supported
identifier family before 1.0.

`identifier-family-contract.json` protects the explicit
`tax_id_person`/`vat`/`tax_id_company` API and unsupported-family semantics.

`identity-consistency-country-cases.json` contains one matching example for
every non-Italian country that declares encoded identity data. Both runtimes
consume the same file so capability and decoding changes cannot drift silently.
