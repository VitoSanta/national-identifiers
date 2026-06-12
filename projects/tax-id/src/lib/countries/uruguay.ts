import { TaxIdValidationResult } from '../models';

export function validateUruguayanTaxId(value: unknown): TaxIdValidationResult {
  const normalized = typeof value === 'string' ? value.replace(/[-.\s]/g, '').trim() : '';

  if (!normalized) {
    return { valid: false, country: 'UY', normalizedValue: normalized, error: 'empty' };
  }

  // Cédula de Identidad uses up to 8 digits, padded with leading zeros if necessary
  if (normalized.length > 8 || normalized.length < 2) {
    return { valid: false, country: 'UY', normalizedValue: normalized, error: 'invalid_length' };
  }

  if (!/^[0-9]+$/.test(normalized)) {
    return { valid: false, country: 'UY', normalizedValue: normalized, error: 'invalid_format' };
  }

  const padded = normalized.padStart(8, '0');
  const base = padded.substring(0, 7);
  const actualCheckDigit = parseInt(padded[7], 10);

  const weights = [2, 9, 8, 7, 6, 3, 4];
  let sum = 0;

  for (let i = 0; i < 7; i++) {
    sum += parseInt(base[i], 10) * weights[i];
  }

  const remainder = sum % 10;
  let expectedCheckDigit = 10 - remainder;

  if (expectedCheckDigit === 10) {
    expectedCheckDigit = 0;
  }

  if (actualCheckDigit !== expectedCheckDigit) {
    // Return original normalized string, not padded, since that's what was passed
    return { valid: false, country: 'UY', normalizedValue: normalized, error: 'invalid_checksum' };
  }

  return { valid: true, country: 'UY', normalizedValue: normalized };
}
