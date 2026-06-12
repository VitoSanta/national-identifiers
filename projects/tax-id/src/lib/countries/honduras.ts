import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateHonduranTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'HN', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 14) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{14}$/.test(normalizedValue) || /^0{14}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}
