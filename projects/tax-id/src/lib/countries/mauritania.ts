import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateMauritanianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'MR', normalizedValue } as const;

  if (!normalizedValue) return { ...base, valid: false, error: 'empty' };
  if (normalizedValue.length !== 8) return { ...base, valid: false, error: 'invalid_length' };
  if (!/^\d{8}$/.test(normalizedValue) || /^0{8}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }
  return { ...base, valid: true, validationLevel: 'format' };
}
