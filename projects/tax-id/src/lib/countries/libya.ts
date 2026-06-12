import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateLibyanTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'LY', normalizedValue } as const;

  if (!normalizedValue) return { ...base, valid: false, error: 'empty' };
  if (normalizedValue.length !== 12) return { ...base, valid: false, error: 'invalid_length' };
  if (!/^[12]\d{11}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }
  return { ...base, valid: true, validationLevel: 'format' };
}
