import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

const PRIMARY_WEIGHTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const SECONDARY_WEIGHTS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2];

export function validateKazakhTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'KZ', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 12) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{6}[1-6]\d{5}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const shortYear = Number(normalizedValue.slice(0, 2));
  const month = Number(normalizedValue.slice(2, 4));
  const day = Number(normalizedValue.slice(4, 6));
  const centuryDigit = Number(normalizedValue[6]);
  const year = (17 + Math.ceil(centuryDigit / 2)) * 100 + shortYear;

  if (!isValidDate(year, month, day)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const digits = [...normalizedValue].map(Number);
  let expectedCheckDigit = calculateCheckDigit(digits, PRIMARY_WEIGHTS);

  if (expectedCheckDigit === 10) {
    expectedCheckDigit = calculateCheckDigit(digits, SECONDARY_WEIGHTS);
  }

  if (expectedCheckDigit === 10 || digits[11] !== expectedCheckDigit) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}

function calculateCheckDigit(digits: readonly number[], weights: readonly number[]): number {
  return digits.slice(0, 11).reduce((sum, digit, index) => sum + digit * weights[index], 0) % 11;
}

function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
