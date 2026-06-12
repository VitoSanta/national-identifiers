import { TaxIdValidationResult } from '../models';

export function validateArgentineTaxId(value: unknown): TaxIdValidationResult {
  const normalized = typeof value === 'string' ? value.replace(/[-.\s]/g, '').trim() : '';

  if (!normalized) {
    return { valid: false, country: 'AR', normalizedValue: normalized, error: 'empty' };
  }

  if (normalized.length !== 11) {
    return { valid: false, country: 'AR', normalizedValue: normalized, error: 'invalid_length' };
  }

  if (!/^[0-9]{11}$/.test(normalized)) {
    return { valid: false, country: 'AR', normalizedValue: normalized, error: 'invalid_format' };
  }

  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(normalized[i], 10) * weights[i];
  }

  const remainder = sum % 11;
  let checkDigit = 11 - remainder;

  if (checkDigit === 11) {
    checkDigit = 0;
  } else if (checkDigit === 10) {
    checkDigit = 9;
  }

  if (parseInt(normalized[10], 10) !== checkDigit) {
    return { valid: false, country: 'AR', normalizedValue: normalized, error: 'invalid_checksum' };
  }

  return { valid: true, country: 'AR', normalizedValue: normalized };
}
