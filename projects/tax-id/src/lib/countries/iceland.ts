import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

const WEIGHTS = [3, 2, 7, 6, 5, 4, 3, 2] as const;

export function validateIcelandicTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'IS', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 10) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{10}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const digits = [...normalizedValue].map(Number);
  const day = Number(normalizedValue.slice(0, 2));
  const month = Number(normalizedValue.slice(2, 4));
  const shortYear = Number(normalizedValue.slice(4, 6));
  const century = digits[9] === 0 ? 2000 : digits[9] === 9 ? 1900 : 1800;

  if (!isValidDate(century + shortYear, month, day)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const sum = digits
    .slice(0, 8)
    .reduce((total, digit, index) => total + digit * WEIGHTS[index], 0);
  const remainder = 11 - (sum % 11);
  const expectedCheckDigit = remainder === 11 ? 0 : remainder;

  if (expectedCheckDigit === 10 || digits[8] !== expectedCheckDigit) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}

function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
