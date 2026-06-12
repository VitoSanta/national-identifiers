import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateKiribatiTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'KI', normalizedValue } as const;

  if (!normalizedValue) return { ...base, valid: false, error: 'empty' };
  if (normalizedValue.length < 4 || normalizedValue.length > 16) return { ...base, valid: false, error: 'invalid_length' };
  if (!/^[A-Z0-9]{4,16}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }
  return { ...base, valid: true, validationLevel: 'format' };
}
