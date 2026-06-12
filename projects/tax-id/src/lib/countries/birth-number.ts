import { TaxIdValidationResult } from '../models';

export function validateBirthNumber(country: 'CZ' | 'SK', value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeBirthNumber(value);
  const base = { country, normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 9 && normalizedValue.length !== 10) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d+$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  if (!hasValidEncodedDate(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  if (normalizedValue.length === 9) {
    return { ...base, valid: true, validationLevel: 'format' };
  }

  if (BigInt(normalizedValue) % 11n !== 0n) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}

function normalizeBirthNumber(value: unknown): string {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return '';
  }

  return String(value).trim().replace(/[\s/]+/g, '');
}

function hasValidEncodedDate(value: string): boolean {
  const shortYear = Number(value.slice(0, 2));
  const encodedMonth = Number(value.slice(2, 4));
  const day = Number(value.slice(4, 6));
  const month = encodedMonth > 70 ? encodedMonth - 70 : encodedMonth > 50
    ? encodedMonth - 50
    : encodedMonth > 20
      ? encodedMonth - 20
      : encodedMonth;
  const year = (shortYear >= 54 ? 1900 : 2000) + shortYear;
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
