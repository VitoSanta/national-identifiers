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
