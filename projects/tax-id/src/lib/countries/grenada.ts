import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

// Source: OECD AEOI sheet for Grenada. The TIN is a six-digit unique number.
export function validateGrenadianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'GD', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }
  if (normalizedValue.length !== 6) {
    return { ...base, valid: false, error: 'invalid_length' };
  }
  if (!/^\d{6}$/.test(normalizedValue) || normalizedValue === '000000') {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}
