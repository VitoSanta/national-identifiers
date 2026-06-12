import { TaxIdValidationResult } from '../models';

export function validateUnitedKingdomTaxId(value: unknown): TaxIdValidationResult {
  const normalized = typeof value === 'string' ? value.trim().toUpperCase() : '';

  if (!normalized) {
    return { valid: false, country: 'GB', normalizedValue: normalized, error: 'empty' };
  }

  // NINO: 2 letters, 6 numbers, 1 optional letter
  const ninoRegex = /^[A-CEGHJ-PR-TW-Z]{2}[0-9]{6}[A-D]?$/;

  // UTR: 10 digits
  const utrRegex = /^[0-9]{10}$/;

  if (!ninoRegex.test(normalized) && !utrRegex.test(normalized)) {
    return { valid: false, country: 'GB', normalizedValue: normalized, error: 'invalid_format' };
  }

  return { valid: true, country: 'GB', normalizedValue: normalized, validationLevel: 'format' };
}
