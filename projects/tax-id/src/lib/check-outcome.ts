import { TaxIdValidationResult } from './models';

export type TaxIdCheckOutcome = 'accept' | 'warn' | 'block';

/**
 * Countries whose rules are institutionally verified up to the check digit.
 * For these, a length or format failure is definitive and worth blocking on.
 */
export const CHECKSUM_TAX_ID_COUNTRIES: ReadonlySet<string> = new Set([
  'AR', 'AU', 'BA', 'BE', 'BG', 'BR', 'CA', 'CH', 'CL', 'CN', 'CO', 'CV',
  'CZ', 'DE', 'DO', 'EC', 'EE', 'ES', 'FI', 'FR', 'GN', 'GR', 'GT', 'HR',
  'HU', 'ID', 'IE', 'IL', 'IR', 'IS', 'IT', 'JP', 'KZ', 'LT', 'LU', 'LV',
  'ME', 'MK', 'MX', 'NL', 'NO', 'NZ', 'PE', 'PL', 'PS', 'PT', 'PY', 'RO',
  'RS', 'RU', 'SE', 'SG', 'SI', 'SK', 'SN', 'TH', 'TR', 'UY', 'VE', 'ZA',
]);

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
    default:
      return CHECKSUM_TAX_ID_COUNTRIES.has(result.country) ? 'block' : 'warn';
  }
}
