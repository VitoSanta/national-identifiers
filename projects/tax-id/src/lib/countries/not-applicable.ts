import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function taxIdNotApplicable(country: string, value: unknown): TaxIdValidationResult {
  return {
    valid: false,
    country,
    normalizedValue: normalizeTaxId(value),
    error: 'not_applicable',
  };
}
