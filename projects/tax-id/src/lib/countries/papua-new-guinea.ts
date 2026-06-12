import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validatePapuaNewGuineanTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'PG', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 9) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{9}$/.test(normalizedValue) || /^0{9}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}
