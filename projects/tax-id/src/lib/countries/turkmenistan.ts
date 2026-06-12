import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateTurkmenTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'TM', normalizedValue } as const;

  if (!normalizedValue) return { ...base, valid: false, error: 'empty' };
  if (normalizedValue.length !== 12) return { ...base, valid: false, error: 'invalid_length' };
  if (!/^\d{12}$/.test(normalizedValue) || /^0{12}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }
  return { ...base, valid: true, validationLevel: 'format' };
}
