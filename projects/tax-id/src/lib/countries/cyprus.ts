import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateCypriotTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'CY', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 9) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{8}[A-Z]$/.test(normalizedValue) || /^0{8}[A-Z]$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}
