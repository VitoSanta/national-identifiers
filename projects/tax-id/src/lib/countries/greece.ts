import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateGreekTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = {
    country: 'GR',
    normalizedValue,
  } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 9) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{9}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const digits = [...normalizedValue].map(Number);
  const sum = digits
    .slice(0, 8)
    .reduce((total, digit, index) => total + digit * 2 ** (8 - index), 0);
  const expectedCheckDigit = (sum % 11) % 10;

  if (digits[8] !== expectedCheckDigit) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true };
}
