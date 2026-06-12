import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateBelizeanTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'BZ', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 6) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{6}$/.test(normalizedValue) || /^0{6}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}
