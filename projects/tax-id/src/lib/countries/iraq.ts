import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

// Iraqi tax card number: 9 digits, no public check algorithm.
// Source: Iraq eRegulations Baghdad procedure 101/106; OECD AEOI portal.
export function validateIraqiTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'IQ', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 9) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{9}$/.test(normalizedValue) || /^0{9}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}
