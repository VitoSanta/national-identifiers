import { TaxIdValidationResult } from '../models';

export function validateChileanTaxId(value: unknown): TaxIdValidationResult {
  const normalized = typeof value === 'string' ? value.replace(/[-.\s]/g, '').trim().toUpperCase() : '';

  if (!normalized) {
    return { valid: false, country: 'CL', normalizedValue: normalized, error: 'empty' };
  }

  // Length should be 8 or 9 characters.
  if (normalized.length < 8 || normalized.length > 9) {
    return { valid: false, country: 'CL', normalizedValue: normalized, error: 'invalid_length' };
  }

  // Format: numbers followed by a digit or 'K'
  if (!/^[0-9]+[0-9K]$/.test(normalized)) {
    return { valid: false, country: 'CL', normalizedValue: normalized, error: 'invalid_format' };
  }

  const base = normalized.substring(0, normalized.length - 1);
  const actualCheckDigit = normalized[normalized.length - 1];

  let sum = 0;
  let multiplier = 2;

  // Iterate from right to left
  for (let i = base.length - 1; i >= 0; i--) {
    sum += parseInt(base[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = sum % 11;
  let expectedCheckDigit: string;

  const result = 11 - remainder;
  if (result === 11) {
    expectedCheckDigit = '0';
  } else if (result === 10) {
    expectedCheckDigit = 'K';
  } else {
    expectedCheckDigit = result.toString();
  }

  if (actualCheckDigit !== expectedCheckDigit) {
    return { valid: false, country: 'CL', normalizedValue: normalized, error: 'invalid_checksum' };
  }

  return { valid: true, country: 'CL', normalizedValue: normalized };
}
