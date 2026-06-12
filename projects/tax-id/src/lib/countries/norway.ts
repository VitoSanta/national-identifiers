import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

const FIRST_WEIGHTS = [3, 7, 6, 1, 8, 9, 4, 5, 2] as const;
const SECOND_WEIGHTS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2] as const;

export function validateNorwegianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'NO', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 11) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{11}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const digits = [...normalizedValue].map(Number);
  const encodedDay = Number(normalizedValue.slice(0, 2));
  const encodedMonth = Number(normalizedValue.slice(2, 4));

  if (!isValidEncodedDate(encodedDay, encodedMonth)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const firstCheckDigit = calculateMod11Digit(digits.slice(0, 9), FIRST_WEIGHTS);
  const secondCheckDigit = calculateMod11Digit(digits.slice(0, 10), SECOND_WEIGHTS);

  if (
    firstCheckDigit === null ||
    secondCheckDigit === null ||
    digits[9] !== firstCheckDigit ||
    digits[10] !== secondCheckDigit
  ) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}

function calculateMod11Digit(digits: number[], weights: readonly number[]): number | null {
  const sum = digits.reduce((total, digit, index) => total + digit * weights[index], 0);
  const result = 11 - (sum % 11);

  if (result === 10) {
    return null;
  }

  return result === 11 ? 0 : result;
}

function isValidEncodedDate(encodedDay: number, encodedMonth: number): boolean {
  const day = encodedDay > 40 ? encodedDay - 40 : encodedDay;
  const month = encodedMonth > 40 ? encodedMonth - 40 : encodedMonth;

  return month >= 1 && month <= 12 && day >= 1 && day <= 31;
}
