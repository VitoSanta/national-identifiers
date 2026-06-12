import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateSriLankanTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'LK', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 10 && normalizedValue.length !== 12) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  let dayOfYear: number;

  if (normalizedValue.length === 10) {
    if (!/^\d{9}[VX]$/.test(normalizedValue)) {
      return { ...base, valid: false, error: 'invalid_format' };
    }

    dayOfYear = Number(normalizedValue.slice(2, 5));
  } else {
    if (!/^(19|20)\d{10}$/.test(normalizedValue)) {
      return { ...base, valid: false, error: 'invalid_format' };
    }

    dayOfYear = Number(normalizedValue.slice(4, 7));
  }

  // Days 1-366 encode males; 501-866 encode females.
  const normalizedDay = dayOfYear > 500 ? dayOfYear - 500 : dayOfYear;

  if (normalizedDay < 1 || normalizedDay > 366) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}
