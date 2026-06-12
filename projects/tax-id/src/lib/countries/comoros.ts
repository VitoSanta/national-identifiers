import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateComorianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'KM', normalizedValue } as const;

  if (!normalizedValue) return { ...base, valid: false, error: 'empty' };
  if (normalizedValue.length < 8 || normalizedValue.length > 10)
    return { ...base, valid: false, error: 'invalid_length' };
  if (!/^\d{8,10}$/.test(normalizedValue) || /^0+$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }
  return { ...base, valid: true, validationLevel: 'format' };
}
