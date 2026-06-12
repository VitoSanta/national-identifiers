import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

const FIRST_WEIGHTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1] as const;
const SECOND_WEIGHTS = [3, 4, 5, 6, 7, 8, 9, 1, 2, 3] as const;

export function validateLithuanianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'LT', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 11) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^[1-8]\d{10}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const digits = [...normalizedValue].map(Number);
  const century = 1800 + Math.floor((digits[0] - 1) / 2) * 100;
  const year = century + Number(normalizedValue.slice(1, 3));
  const month = Number(normalizedValue.slice(3, 5));
  const day = Number(normalizedValue.slice(5, 7));

  if (!isValidDate(year, month, day)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  let expectedCheckDigit = weightedRemainder(digits, FIRST_WEIGHTS);

  if (expectedCheckDigit === 10) {
    expectedCheckDigit = weightedRemainder(digits, SECOND_WEIGHTS);
  }

  if (expectedCheckDigit === 10) {
    expectedCheckDigit = 0;
  }

  if (digits[10] !== expectedCheckDigit) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}

function weightedRemainder(digits: number[], weights: readonly number[]): number {
  return digits
    .slice(0, 10)
    .reduce((total, digit, index) => total + digit * weights[index], 0) % 11;
}

function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
