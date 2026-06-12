import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

const CHECKSUM_WEIGHTS = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3] as const;

export function validatePolishTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = {
    country: 'PL',
    normalizedValue,
  } as const;

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

  if (!hasValidPeselDate(digits)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const sum = digits
    .slice(0, 10)
    .reduce((total, digit, index) => total + digit * CHECKSUM_WEIGHTS[index], 0);
  const expectedCheckDigit = (10 - (sum % 10)) % 10;

  if (digits[10] !== expectedCheckDigit) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}

function hasValidPeselDate(digits: number[]): boolean {
  const year = digits[0] * 10 + digits[1];
  const encodedMonth = digits[2] * 10 + digits[3];
  const day = digits[4] * 10 + digits[5];
  let century: number;
  let month: number;

  if (encodedMonth >= 81 && encodedMonth <= 92) {
    century = 1800;
    month = encodedMonth - 80;
  } else if (encodedMonth >= 1 && encodedMonth <= 12) {
    century = 1900;
    month = encodedMonth;
  } else if (encodedMonth >= 21 && encodedMonth <= 32) {
    century = 2000;
    month = encodedMonth - 20;
  } else if (encodedMonth >= 41 && encodedMonth <= 52) {
    century = 2100;
    month = encodedMonth - 40;
  } else if (encodedMonth >= 61 && encodedMonth <= 72) {
    century = 2200;
    month = encodedMonth - 60;
  } else {
    return false;
  }

  return isValidDate(century + year, month, day);
}

function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
