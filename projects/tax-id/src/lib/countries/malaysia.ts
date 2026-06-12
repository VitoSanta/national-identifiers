import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateMalaysianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'MY', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 12) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{12}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const month = Number(normalizedValue.slice(2, 4));
  const day = Number(normalizedValue.slice(4, 6));

  // The two-digit year does not encode the century, so only the day and month
  // ranges can be verified.
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}
