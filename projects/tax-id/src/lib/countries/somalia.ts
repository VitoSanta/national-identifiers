import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateSomaliTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'SO', normalizedValue } as const;

  if (!normalizedValue) return { ...base, valid: false, error: 'empty' };
  if (normalizedValue.length < 4 || normalizedValue.length > 12)
    return { ...base, valid: false, error: 'invalid_length' };
  if (!/^\d{4,12}$/.test(normalizedValue) || /^0+$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }
  return { ...base, valid: true, validationLevel: 'format' };
}
