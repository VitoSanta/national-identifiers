import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateMalianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'ML', normalizedValue } as const;

  if (!normalizedValue) return { ...base, valid: false, error: 'empty' };
  if (normalizedValue.length !== 10) return { ...base, valid: false, error: 'invalid_length' };
  if (!/^\d{9}[A-Z]$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }
  return { ...base, valid: true, validationLevel: 'format' };
}
