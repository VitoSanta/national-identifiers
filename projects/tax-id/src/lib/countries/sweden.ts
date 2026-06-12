import { TaxIdValidationResult } from '../models';

export function validateSwedishTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeSwedishTaxId(value);
  const base = { country: 'SE', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 10 && normalizedValue.length !== 12) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d+$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const shortValue = normalizedValue.slice(-10);
  const month = Number(shortValue.slice(2, 4));
  const encodedDay = Number(shortValue.slice(4, 6));
  const day = encodedDay > 60 ? encodedDay - 60 : encodedDay;

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const digits = [...shortValue].map(Number);
  const sum = digits.slice(0, 9).reduce((total, digit, index) => {
    const product = digit * (index % 2 === 0 ? 2 : 1);
    return total + Math.floor(product / 10) + (product % 10);
  }, 0);
  const expectedCheckDigit = (10 - (sum % 10)) % 10;

  if (digits[9] !== expectedCheckDigit) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}

function normalizeSwedishTaxId(value: unknown): string {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return '';
  }

  return String(value).trim().replace(/[\s+\-]+/g, '');
}
