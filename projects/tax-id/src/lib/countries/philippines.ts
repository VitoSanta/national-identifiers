import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validatePhilippineTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'PH', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 9 && normalizedValue.length !== 12) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{9}(\d{3})?$/.test(normalizedValue) || /^0{9}/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}
