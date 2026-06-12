import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateRepublicOfCongoTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'CG', normalizedValue } as const;

  if (!normalizedValue) return { ...base, valid: false, error: 'empty' };
  if (normalizedValue.length !== 17) return { ...base, valid: false, error: 'invalid_length' };
  if (!/^[A-Z]\d{16}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }
  return { ...base, valid: true, validationLevel: 'format' };
}
