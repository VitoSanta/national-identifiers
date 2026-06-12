import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateSaintLucianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'LC', normalizedValue } as const;

  if (!normalizedValue) return { ...base, valid: false, error: 'empty' };
  if (normalizedValue.length < 1 || normalizedValue.length > 6)
    return { ...base, valid: false, error: 'invalid_length' };
  if (!/^\d+$/.test(normalizedValue) || /^0+$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }
  return { ...base, valid: true, validationLevel: 'format' };
}
