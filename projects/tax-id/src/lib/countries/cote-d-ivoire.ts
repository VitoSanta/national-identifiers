import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateIvorianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'CI', normalizedValue } as const;

  if (!normalizedValue) return { ...base, valid: false, error: 'empty' };
  if (normalizedValue.length !== 8) return { ...base, valid: false, error: 'invalid_length' };
  if (!/^\d{7}[A-Z]$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }
  return { ...base, valid: true, validationLevel: 'format' };
}
