import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateVietnameseTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'VN', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (
    normalizedValue.length !== 10 &&
    normalizedValue.length !== 12 &&
    normalizedValue.length !== 13
  ) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d+$/.test(normalizedValue) || /^0+$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}
