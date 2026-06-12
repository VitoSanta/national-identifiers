import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

// Source: OECD AEOI sheet for the Commonwealth of Dominica.
// The taxpayer number used for tax and customs purposes is the first 1-6
// digits of the TIN. The proprietary check digit is not validated.
export function validateDominicaTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'DM', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }
  if (normalizedValue.length > 6) {
    return { ...base, valid: false, error: 'invalid_length' };
  }
  if (!/^\d{1,6}$/.test(normalizedValue) || /^0+$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}
