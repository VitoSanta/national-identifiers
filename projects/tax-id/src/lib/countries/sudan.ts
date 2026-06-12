import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

// Source: Sudan Taxation Chamber public taxpayer-registration portal. When
// "National I.D." is selected, its client-side validator accepts ASCII
// letters and digits only. No length or checksum is published.
export function validateSudaneseTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'SD', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }
  if (!/^[0-9A-Z]+$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}
