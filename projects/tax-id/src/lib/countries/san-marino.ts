import { TaxIdValidationResult } from '../models';

export function validateSammarineseTaxId(value: unknown): TaxIdValidationResult {
  const normalized = typeof value === 'string' ? value.trim().toUpperCase() : '';

  if (!normalized) {
    return { valid: false, country: 'SM', normalizedValue: normalized, error: 'empty' };
  }

  // ISS code (9 digits) or COE (5 digits)
  if (!/^[0-9]{5}$/.test(normalized) && !/^[0-9]{9}$/.test(normalized) && !/^SM[0-9]{5}$/.test(normalized)) {
    return { valid: false, country: 'SM', normalizedValue: normalized, error: 'invalid_format' };
  }

  return { valid: true, country: 'SM', normalizedValue: normalized, validationLevel: 'format' };
}
