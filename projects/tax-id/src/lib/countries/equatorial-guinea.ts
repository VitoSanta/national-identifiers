import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateEquatorialGuineanTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'GQ', normalizedValue } as const;

  if (!normalizedValue) return { ...base, valid: false, error: 'empty' };
  if (normalizedValue.length < 7 || normalizedValue.length > 9)
    return { ...base, valid: false, error: 'invalid_length' };
  if (!/^[A-Z0-9]{7,9}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }
  return { ...base, valid: true, validationLevel: 'format' };
}
