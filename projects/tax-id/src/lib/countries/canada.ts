import { TaxIdValidationResult } from '../models';

export function validateCanadianTaxId(value: unknown): TaxIdValidationResult {
  const normalized = typeof value === 'string' ? value.replace(/[- ]/g, '').trim() : '';

  if (!normalized) {
    return { valid: false, country: 'CA', normalizedValue: normalized, error: 'empty' };
  }

  if (normalized.length !== 9) {
    return { valid: false, country: 'CA', normalizedValue: normalized, error: 'invalid_length' };
  }

  if (!/^[0-9]{9}$/.test(normalized)) {
    return { valid: false, country: 'CA', normalizedValue: normalized, error: 'invalid_format' };
  }

  const weights = [1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;

  for (let i = 0; i < 8; i++) {
    let product = parseInt(normalized[i], 10) * weights[i];
    if (product > 9) {
      product = product - 9;
    }
    sum += product;
  }

  const checkDigit = parseInt(normalized[8], 10);
  if ((sum + checkDigit) % 10 !== 0) {
    return { valid: false, country: 'CA', normalizedValue: normalized, error: 'invalid_checksum' };
  }

  return { valid: true, country: 'CA', normalizedValue: normalized };
}
