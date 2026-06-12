import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

const CHECKSUM_WEIGHTS = [2, 4, 8, 5, 10, 9, 7, 3, 6] as const;

export function validateBulgarianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'BG', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 10) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{10}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const yearPart = Number(normalizedValue.slice(0, 2));
  const encodedMonth = Number(normalizedValue.slice(2, 4));
  const day = Number(normalizedValue.slice(4, 6));
  const dateParts = decodeBirthDate(yearPart, encodedMonth);

  if (!dateParts || !isValidDate(dateParts.year, dateParts.month, day)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const digits = [...normalizedValue].map(Number);
  const remainder = digits
    .slice(0, 9)
    .reduce((total, digit, index) => total + digit * CHECKSUM_WEIGHTS[index], 0) % 11;
  const expectedCheckDigit = remainder === 10 ? 0 : remainder;

  if (digits[9] !== expectedCheckDigit) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}

function decodeBirthDate(
  yearPart: number,
  encodedMonth: number,
): { year: number; month: number } | null {
  if (encodedMonth >= 1 && encodedMonth <= 12) {
    return { year: 1900 + yearPart, month: encodedMonth };
  }

  if (encodedMonth >= 21 && encodedMonth <= 32) {
    return { year: 1800 + yearPart, month: encodedMonth - 20 };
  }

  if (encodedMonth >= 41 && encodedMonth <= 52) {
    return { year: 2000 + yearPart, month: encodedMonth - 40 };
  }

  return null;
}

function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
