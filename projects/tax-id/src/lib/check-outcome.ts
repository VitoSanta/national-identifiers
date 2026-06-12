import { TaxIdValidationResult } from './models';
import { TAX_ID_VALIDATION_REGISTRY } from './country-registry';

export type TaxIdCheckOutcome = 'accept' | 'warn' | 'block';

/**
 * Maps a validation result to a registration policy decision.
 *
 * - `accept`: the value passed every available check.
 * - `block`: the value is definitively wrong (failed checksum, empty, or
 *   broke the rules of a country with checksum-grade validation). Reject it.
 * - `warn`: the value could not be verified with confidence — the country has
 *   loose format-only rules, no personal TIN at all, or is not supported.
 *   Store the value and flag it instead of turning the user away.
 */
export function taxIdCheckOutcome(result: TaxIdValidationResult): TaxIdCheckOutcome {
  if (result.valid) {
    return 'accept';
  }

  switch (result.error) {
    case 'empty':
    case 'invalid_checksum':
      return 'block';
    case 'not_applicable':
    case 'unsupported_country':
      return 'warn';
    default: {
      const entry = TAX_ID_VALIDATION_REGISTRY[
        result.country as keyof typeof TAX_ID_VALIDATION_REGISTRY
      ];
      const validationLevel =
        entry?.policyValidationLevel?.(result.normalizedValue) ?? entry?.validationLevel;

      return validationLevel === 'checksum' ? 'block' : 'warn';
    }
  }
}
