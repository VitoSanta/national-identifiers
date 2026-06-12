import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateBeninTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'BJ', normalizedValue } as const;

  if (!normalizedValue) return { ...base, valid: false, error: 'empty' };
  if (normalizedValue.length !== 13) return { ...base, valid: false, error: 'invalid_length' };
  if (!/^\d{13}$/.test(normalizedValue) || /^0{13}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }
  return { ...base, valid: true, validationLevel: 'format' };
}
