import { TaxIdValidationResult } from '../models';

export function validateBelarusianTaxId(value: unknown): TaxIdValidationResult {
  const normalized = typeof value === 'string' ? value.trim().toUpperCase() : '';

  if (!normalized) {
    return { valid: false, country: 'BY', normalizedValue: normalized, error: 'empty' };
  }

  if (normalized.length !== 9) {
    return { valid: false, country: 'BY', normalizedValue: normalized, error: 'invalid_length' };
  }

  // Legal entities: 9 digits. Individuals: 2 letters + 7 digits.
  if (!/^[0-9]{9}$/.test(normalized) && !/^[A-Z]{2}[0-9]{7}$/.test(normalized)) {
    return { valid: false, country: 'BY', normalizedValue: normalized, error: 'invalid_format' };
  }

  return { valid: true, country: 'BY', normalizedValue: normalized, validationLevel: 'format' };
}
