import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

const CHECKSUM_KEY = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9] as const;

export function validateRomanianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'RO', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 13) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^[1-9]\d{12}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const digits = [...normalizedValue].map(Number);
  const century = resolveCentury(digits[0]);
  const year = century + Number(normalizedValue.slice(1, 3));
  const month = Number(normalizedValue.slice(3, 5));
  const day = Number(normalizedValue.slice(5, 7));
  const county = Number(normalizedValue.slice(7, 9));

  if (!isValidDate(year, month, day) || county > 52) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const sum = digits
    .slice(0, 12)
    .reduce((total, digit, index) => total + digit * CHECKSUM_KEY[index], 0);
  const remainder = sum % 11;
  const expectedCheckDigit = remainder === 10 ? 1 : remainder;

  if (digits[12] !== expectedCheckDigit) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}

function resolveCentury(firstDigit: number): number {
  if (firstDigit === 1 || firstDigit === 2) {
    return 1900;
  }
  if (firstDigit === 3 || firstDigit === 4) {
    return 1800;
  }
  if (firstDigit === 5 || firstDigit === 6 || firstDigit === 7 || firstDigit === 8) {
    return 2000;
  }
  return 1900;
}

function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
