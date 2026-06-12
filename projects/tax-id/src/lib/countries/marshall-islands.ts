import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

// Source: OECD AEOI sheet for the Republic of the Marshall Islands.
// The personal employee identification number has the form 04-XXXXXX.
export function validateMarshalleseTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'MH', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }
  if (normalizedValue.length !== 8) {
    return { ...base, valid: false, error: 'invalid_length' };
  }
  if (!/^04\d{6}$/.test(normalizedValue) || normalizedValue === '04000000') {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}
