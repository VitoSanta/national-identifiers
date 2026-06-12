import { TaxIdValidationResult } from '../models';

export function validateRussianTaxId(value: unknown): TaxIdValidationResult {
  const normalized = typeof value === 'string' ? value.trim() : '';

  if (!normalized) {
    return { valid: false, country: 'RU', normalizedValue: normalized, error: 'empty' };
  }

  const length = normalized.length;
  if (length !== 10 && length !== 12) {
    return { valid: false, country: 'RU', normalizedValue: normalized, error: 'invalid_length' };
  }

  if (!/^[0-9]+$/.test(normalized)) {
    return { valid: false, country: 'RU', normalizedValue: normalized, error: 'invalid_format' };
  }

  if (length === 10) {
    const weights = [2, 4, 10, 3, 5, 9, 4, 6, 8];
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(normalized[i], 10) * weights[i];
    }
    const checkDigit = (sum % 11) % 10;
    if (parseInt(normalized[9], 10) !== checkDigit) {
      return { valid: false, country: 'RU', normalizedValue: normalized, error: 'invalid_checksum' };
    }
  } else {
    const weights11 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
    let sum11 = 0;
    for (let i = 0; i < 10; i++) {
      sum11 += parseInt(normalized[i], 10) * weights11[i];
    }
    const checkDigit11 = (sum11 % 11) % 10;

    const weights12 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
    let sum12 = 0;
    for (let i = 0; i < 11; i++) {
      sum12 += parseInt(normalized[i], 10) * weights12[i];
    }
    const checkDigit12 = (sum12 % 11) % 10;

    if (parseInt(normalized[10], 10) !== checkDigit11 || parseInt(normalized[11], 10) !== checkDigit12) {
      return { valid: false, country: 'RU', normalizedValue: normalized, error: 'invalid_checksum' };
    }
  }

  return { valid: true, country: 'RU', normalizedValue: normalized };
}
