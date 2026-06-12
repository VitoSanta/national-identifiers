import { TaxIdValidationResult } from '../models';
export function validateSwissTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeSwissTaxId(value);
  const base = { country: 'CH', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 13) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^756\d{10}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const digits = [...normalizedValue].map(Number);
  const sum = digits
    .slice(0, 12)
    .reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 1 : 3), 0);
  const expectedCheckDigit = (10 - (sum % 10)) % 10;

  if (digits[12] !== expectedCheckDigit) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}

function normalizeSwissTaxId(value: unknown): string {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return '';
  }

  return String(value).trim().replace(/[\s.\-]+/g, '');
}
