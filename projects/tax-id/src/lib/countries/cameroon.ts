import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateCameroonianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'CM', normalizedValue } as const;

  if (!normalizedValue) return { ...base, valid: false, error: 'empty' };
  if (normalizedValue.length !== 14) return { ...base, valid: false, error: 'invalid_length' };
  if (!/^P\d{12}[A-Z]$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }
  return { ...base, valid: true, validationLevel: 'format' };
}
