import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateSeychelloisTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'SC', normalizedValue } as const;

  if (!normalizedValue) return { ...base, valid: false, error: 'empty' };
  if (normalizedValue.length !== 9) return { ...base, valid: false, error: 'invalid_length' };
  if (!/^\d{2}2\d{6}$/.test(normalizedValue) || normalizedValue === '002000000') {
    return { ...base, valid: false, error: 'invalid_format' };
  }
  return { ...base, valid: true, validationLevel: 'format' };
}
