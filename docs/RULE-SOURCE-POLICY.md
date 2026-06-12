# Rule Source Policy

Every validation rule must be traceable to an institutional source.

## Accepted sources

Preferred, in order:

1. national tax, civil-registry or social-security authority;
2. legislation or official technical specifications;
3. OECD Tax Identification Number country documentation;
4. an official government form or registration portal.

Community packages, blog posts and generated examples can support research but
cannot be the sole authority for a checksum rule.

## Required record

Each identifier family should eventually have:

```json
{
  "country": "SG",
  "identifierType": "foreign_resident_id",
  "validationLevel": "format",
  "authority": "Immigration & Checkpoints Authority",
  "sourceUrl": "https://example.gov/official-document",
  "accessedAt": "2026-06-12",
  "lastReviewedAt": "2026-06-12",
  "limitations": [
    "The M-series check-letter table is not institutionally published."
  ]
}
```

## Review rules

- Record the date on which the source was accessed.
- Re-review checksum rules at least annually.
- Re-review immediately after a government announces a numbering change.
- Preserve historical formats when official documentation says they remain valid.
- Downgrade to format-only when a checksum cannot be supported institutionally.
- Never include production user data in fixtures.

The structured catalogue is a 0.3 roadmap deliverable. Until complete, source
comments and package documentation must state known limitations explicitly.
