import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateEritreanTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'ER', normalizedValue } as const;

  if (!normalizedValue) return { ...base, valid: false, error: 'empty' };
  if (normalizedValue.length > 16) return { ...base, valid: false, error: 'invalid_length' };
  if (!/^[A-Z0-9]{1,16}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }
  return { ...base, valid: true, validationLevel: 'format' };
}
