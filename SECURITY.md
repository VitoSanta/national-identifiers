# Security Policy

## Supported versions

Until version 1.0, only the latest published release receives fixes.

## Reporting a vulnerability

Do not open a public issue for a vulnerability involving package integrity,
dependency compromise, denial of service or sensitive-data exposure.

Use GitHub private vulnerability reporting for
`https://github.com/VitoSanta/CF`. Include reproduction steps, affected
versions and expected impact. You should receive an acknowledgement within
seven days.

## Scope

This library performs local structural and checksum validation. It is not an
identity-verification, sanctions-screening or anti-fraud service. Applications
must not treat a successful result as proof that an identifier was issued,
belongs to a person or is currently active.
