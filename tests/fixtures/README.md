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

`rule-sources.json` is the machine-readable provenance catalogue for all 252
current registry combinations: 195 personal state identifiers, seven
territories, 38 VAT rules and 12 company/entity rules. Its shape is documented
by `rule-sources.schema.json`. Node.js and .NET tests require exact registry
coverage, institutional HTTPS sources and a review date no older than one year.

`provenanceStatus: "verified"` means that the recorded source directly supports
the implemented offline validation level. `"corroborated"` means the rule is
cross-runtime tested but its complete primary algorithm publication was not
publicly located. `"documented_limit"` is used for format-only,
non-applicability and bounded jurisdiction-mapping decisions.

Run `node scripts/generate-rule-source-catalogue.mjs` after changing the
personal or territory registries. The generator preserves explicit VAT/company
records and regenerates registry-derived personal coverage deterministically.
