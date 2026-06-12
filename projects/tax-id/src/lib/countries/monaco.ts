import { TaxIdValidationResult } from '../models';

export function validateMonegasqueTaxId(value: unknown): TaxIdValidationResult {
  const normalized = typeof value === 'string' ? value.trim().toUpperCase() : '';

  if (!normalized) {
    return { valid: false, country: 'MC', normalizedValue: normalized, error: 'empty' };
  }

  if (!/^[A-Z0-9]{5,15}$/.test(normalized)) {
    return { valid: false, country: 'MC', normalizedValue: normalized, error: 'invalid_format' };
  }

  return { valid: true, country: 'MC', normalizedValue: normalized, validationLevel: 'format' };
}
