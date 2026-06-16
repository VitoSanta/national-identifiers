# Integration Recipes

These recipes show how to wire National Identifiers into common application
flows. They keep the same trust boundary throughout:

- frontend validation improves UX;
- backend validation makes the application decision;
- `warn` means store, flag or route to review;
- `block` means the local rule found a definitive failure;
- no recipe performs live government or registry lookup.

## Angular Sign-Up Form

Use policy mode for international onboarding when the backend can review
warnings. This blocks checksum-grade failures while avoiding false hard stops
for format-only jurisdictions.

```ts
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { taxIdValidator } from 'national-identifiers/angular';

const country = new FormControl('IT', { nonNullable: true });
const taxId = new FormControl('', {
  validators: [
    Validators.required,
    taxIdValidator(() => country.value),
  ],
});

const form = new FormGroup({
  country,
  taxId,
});

country.valueChanges.subscribe(() => {
  taxId.updateValueAndValidity();
});
```

Show messages only after the field has been edited. The adapter returns a
structured `taxId` error for blocked results.

```ts
function taxIdMessage(error: string): string {
  switch (error) {
    case 'invalid_checksum':
      return 'The check digit is not valid.';
    case 'invalid_format':
      return 'The identifier format is not recognised for this country.';
    case 'invalid_length':
      return 'The identifier length is not valid for this country.';
    case 'unsupported_country':
      return 'This country is not supported yet.';
    case 'not_applicable':
      return 'This country does not use a general personal tax identifier.';
    default:
      return 'The identifier could not be validated.';
  }
}
```

Use strict mode only when every local failure must block submission:

```ts
taxIdValidator(() => form.controls.country.value, { mode: 'strict' });
```

## TypeScript Backend Policy

Run the same rule on the server even if the frontend already validated the
field.

```ts
import { taxIdCheckOutcome, validateTaxId } from 'national-identifiers';

export function classifyTaxId(country: string, taxId: string) {
  const result = validateTaxId(country, taxId);
  const outcome = taxIdCheckOutcome(result);

  if (outcome === 'block') {
    return { status: 422, result };
  }

  if (outcome === 'warn') {
    return { status: 202, result, reviewRequired: true };
  }

  return { status: 200, result };
}
```

## B2B VAT Checkout

Use the explicit identifier-family API when a field is definitely VAT, company
tax or personal tax id.

```ts
import { taxIdCheckOutcome, validateIdentifier } from 'national-identifiers';

const result = validateIdentifier({
  country: 'IT',
  type: 'vat',
  value: '00743110157',
});

switch (taxIdCheckOutcome(result)) {
  case 'accept':
    // Continue the checkout.
    break;
  case 'warn':
    // Store and request later verification, such as VIES for EU VAT.
    break;
  case 'block':
    // Ask the user to correct the value.
    break;
}
```

## ASP.NET Core Minimal API

Use dependency injection for application code. Keep `[Required]` or endpoint
request validation responsible for blank fields; the validator focuses on tax
identifier semantics.

```csharp
using NationalIdentifiers.AspNetCore;
using NationalIdentifiers.Core;

builder.Services.AddNationalIdentifiers();

app.MapPost("/customers", (
    CustomerRequest request,
    ITaxIdValidator validator) =>
{
    var result = validator.Validate(request.Country, request.TaxId);
    var outcome = TaxIdPolicy.Evaluate(result);

    return outcome switch
    {
        TaxIdCheckOutcome.Accept => Results.Ok(new { result.NormalizedValue }),
        TaxIdCheckOutcome.Warn => Results.Accepted(
            value: new { result.NormalizedValue, ReviewRequired = true }),
        TaxIdCheckOutcome.Block => Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["taxId"] = [$"Invalid tax identifier: {result.Error}"]
        }),
        _ => Results.ValidationProblem()
    };
});

public sealed record CustomerRequest(string Country, string TaxId);
```

## ASP.NET Core Model Validation

Use the attribute when model binding should populate `ModelState`.

```csharp
using System.ComponentModel.DataAnnotations;
using NationalIdentifiers.AspNetCore;

public sealed class RegisterCustomerRequest
{
    [Required]
    public string Country { get; init; } = string.Empty;

    [Required]
    [ValidTaxId(nameof(Country))]
    public string TaxId { get; init; } = string.Empty;
}
```

The default mode follows the same policy as Angular: definitive failures block,
format-only advisory failures do not. Use strict mode for hard local rejection:

```csharp
[ValidTaxId(nameof(Country), Mode = TaxIdValidationMode.Strict)]
public string TaxId { get; init; } = string.Empty;
```

## Service-Layer Pattern

Keep validation policy close to the workflow decision, not inside UI code.

```csharp
using NationalIdentifiers.Core;

public sealed class CustomerOnboardingService
{
    private readonly ITaxIdValidator validator;

    public CustomerOnboardingService(ITaxIdValidator validator)
    {
        this.validator = validator;
    }

    public OnboardingDecision Evaluate(string country, string taxId)
    {
        var result = validator.Validate(country, taxId);
        var outcome = TaxIdPolicy.Evaluate(result);

        return outcome switch
        {
            TaxIdCheckOutcome.Accept => OnboardingDecision.Accept(result.NormalizedValue),
            TaxIdCheckOutcome.Warn => OnboardingDecision.Review(result.NormalizedValue),
            TaxIdCheckOutcome.Block => OnboardingDecision.Reject(result.Error?.ToString()),
            _ => OnboardingDecision.Reject("unknown")
        };
    }
}

public sealed record OnboardingDecision(
    string Status,
    string? NormalizedValue,
    string? Reason)
{
    public static OnboardingDecision Accept(string normalizedValue) =>
        new("accept", normalizedValue, null);

    public static OnboardingDecision Review(string normalizedValue) =>
        new("review", normalizedValue, null);

    public static OnboardingDecision Reject(string? reason) =>
        new("reject", null, reason);
}
```

## Tourist Smart-Mobility Onboarding

For tourism-heavy applications, do not assume that every user has a local
checksum-backed identifier.

Recommended flow:

1. Collect `country`, `identifier type` and `identifier value`.
2. Use `validateIdentifier` when the field is VAT or company tax; use
   `validateTaxId` for personal tax identifiers.
3. Block only `block` outcomes.
4. Store `warn` outcomes with `validationLevel`, `error` and country for review.
5. Route high-risk operations to official registry checks or manual review.

This keeps sign-up inclusive for foreign users while preserving a backend audit
trail for values that cannot be strongly checked offline.
