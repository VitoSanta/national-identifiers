import { TaxIdValidationResult } from '../models';

export function validateBrazilianTaxId(value: unknown): TaxIdValidationResult {
  const normalized = typeof value === 'string' ? value.replace(/[-.\s]/g, '').trim() : '';

  if (!normalized) {
    return { valid: false, country: 'BR', normalizedValue: normalized, error: 'empty' };
  }

  if (normalized.length !== 11) {
    return { valid: false, country: 'BR', normalizedValue: normalized, error: 'invalid_length' };
  }

  if (!/^[0-9]{11}$/.test(normalized)) {
    return { valid: false, country: 'BR', normalizedValue: normalized, error: 'invalid_format' };
  }

  // CPFs with all identical digits are mathematically valid but practically invalid.
  if (/^(\d)\1{10}$/.test(normalized)) {
    return { valid: false, country: 'BR', normalizedValue: normalized, error: 'invalid_format' };
  }

  // First check digit
  let sum1 = 0;
  for (let i = 0; i < 9; i++) {
    sum1 += parseInt(normalized[i], 10) * (10 - i);
  }
  let rem1 = sum1 % 11;
  const checkDigit1 = rem1 < 2 ? 0 : 11 - rem1;

  // Second check digit
  let sum2 = 0;
  for (let i = 0; i < 10; i++) {
    sum2 += parseInt(normalized[i], 10) * (11 - i);
  }
  let rem2 = sum2 % 11;
  const checkDigit2 = rem2 < 2 ? 0 : 11 - rem2;

  if (
    parseInt(normalized[9], 10) !== checkDigit1 ||
    parseInt(normalized[10], 10) !== checkDigit2
  ) {
    return { valid: false, country: 'BR', normalizedValue: normalized, error: 'invalid_checksum' };
  }

  return { valid: true, country: 'BR', normalizedValue: normalized };
}
