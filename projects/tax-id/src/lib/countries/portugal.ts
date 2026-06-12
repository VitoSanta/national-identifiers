import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validatePortugueseTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = {
    country: 'PT',
    normalizedValue,
  } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 9) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^[1235689]\d{8}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const digits = [...normalizedValue].map(Number);
  const sum = digits
    .slice(0, 8)
    .reduce((total, digit, index) => total + digit * (9 - index), 0);
  const remainder = 11 - (sum % 11);
  const expectedCheckDigit = remainder >= 10 ? 0 : remainder;

  if (digits[8] !== expectedCheckDigit) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true };
}
