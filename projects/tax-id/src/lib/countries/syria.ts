import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateSyrianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'SY', normalizedValue } as const;

  if (!normalizedValue) return { ...base, valid: false, error: 'empty' };
  if (normalizedValue.length !== 11) return { ...base, valid: false, error: 'invalid_length' };
  if (!/^\d{11}$/.test(normalizedValue) || /^0{11}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }
  return { ...base, valid: true, validationLevel: 'format' };
}
