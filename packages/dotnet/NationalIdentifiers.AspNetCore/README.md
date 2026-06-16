# NationalIdentifiers.AspNetCore

ASP.NET Core integration for
[NationalIdentifiers.Core](https://www.nuget.org/packages/NationalIdentifiers.Core):
validation of national tax identifiers for 195 countries in web APIs.
It also supports the same 7 separately tracked ISO territories as
`NationalIdentifiers.Core`. Targets .NET 8 and .NET 10.

## Setup

```csharp
builder.Services.AddNationalIdentifiers();
```

## Validation attribute

```csharp
public sealed record RegisterRequest(
    string Country,
    [ValidTaxId(nameof(Country))] string TaxId);
```

The attribute validates the tax ID against the rules of the country named by
the companion property, so a single field can hold an Italian Codice
Fiscale, a Partita IVA or any foreign TIN depending on the user.

`[ValidTaxId]` skips `null`, empty and whitespace-only values, leaving required
field checks to `[Required]` and matching the Angular validator's behavior.
It also returns a structured failure message rather than throwing, which is
compatible with ASP.NET Core `ModelState` and problem-detail payloads.

The default policy mode rejects only definitive failures. Use strict mode when
every failed local check must block the request:

```csharp
[ValidTaxId(nameof(Country), Mode = TaxIdValidationMode.Strict)]
public string? TaxId { get; init; }
```

## Action filter

`TaxIdValidationFilter` validates incoming requests centrally and produces
RFC 7807 problem details for failures.

## Policy decisions

Combine with `TaxIdPolicy.Evaluate` from the core package to map results to
accept/warn/block decisions — block on failed check digits, warn (store and
flag) for countries with format-only rules instead of rejecting users.

For one-off validation outside MVC filters or attributes, use the core package
static API: `TaxIdValidator.Validate(...)`. Resolve `ITaxIdValidator` from
dependency injection when you want the same behavior behind an application
service or endpoint filter.

This package now shares the same policy semantics as the JS helper `taxIdCheckOutcome`, making warning and blocking behavior consistent between backend and frontend validation.

## License

MIT
