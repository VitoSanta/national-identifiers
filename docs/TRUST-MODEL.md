# Trust Model

National Identifiers is an offline pre-validation library. Its purpose is to
reduce input errors and keep frontend/backend validation semantics aligned. It
is not an identity verification service.

## Boundary summary

| Layer | Role | Trust level |
|---|---|---|
| Browser or mobile UI | Helps the user correct typos and formatting mistakes. | UX signal only |
| Backend application | Re-runs validation and makes the application decision. | Authoritative for the product workflow |
| Government or official registry | Confirms issuance, status, ownership or legal existence. | Authoritative for real-world validity |

The frontend result must never be trusted as a security control. Any API that
accepts an identifier must validate it again server-side.

## What the library proves

Depending on the jurisdiction and identifier family, the library can prove:

- the value can be normalized into the documented local shape;
- the value matches a documented length, prefix or pattern;
- an encoded date or administrative field is structurally valid;
- a public check digit algorithm passes;
- an optional identity-consistency comparison matches data encoded in the
  identifier.

## What the library does not prove

The library does not prove:

- issuance by a public authority;
- current activity or tax registration status;
- ownership by the submitted user;
- legal identity;
- legal entity existence;
- sanctions, fraud or compliance status.

Those require official online services, regulated identity verification or
business-specific review.

## Privacy posture

The core validators are pure local functions:

- no network calls;
- no persistence;
- no logging;
- no telemetry;
- no background cache;
- no dependency on remote configuration.

Identity-consistency helpers return status and field names. They must not be
used to log or echo submitted personal data.

## Recommended application flow

1. Validate in the frontend for immediate UX feedback.
2. Submit the raw user-entered value and country/family fields to the backend.
3. Normalize and validate again on the backend.
4. Use `accept`, `warn` or `block` policy semantics to decide the workflow.
5. Use official registries only when the product requires registry-level
   verification.

## Recommended handling of `warn`

`warn` means the value could not be verified with high confidence offline. It
does not necessarily mean the user is wrong.

Common handling patterns:

- store and flag for review;
- ask for another identifier type;
- allow low-risk onboarding but restrict high-risk operations;
- defer to a registry lookup in a later workflow step.

Do not silently convert every warning into a hard rejection unless your domain
requires that tradeoff.
