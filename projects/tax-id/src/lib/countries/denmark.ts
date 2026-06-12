import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateDanishTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = {
    country: 'DK',
    normalizedValue,
  } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 10) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{10}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const day = Number(normalizedValue.slice(0, 2));
  const month = Number(normalizedValue.slice(2, 4));
  const shortYear = Number(normalizedValue.slice(4, 6));
  const centuryDigit = Number(normalizedValue[6]);
  const year = resolveCprYear(shortYear, centuryDigit);

  if (!isValidDate(year, month, day)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}

function resolveCprYear(shortYear: number, centuryDigit: number): number {
  if (centuryDigit <= 3) {
    return 1900 + shortYear;
  }

  if (centuryDigit === 4 || centuryDigit === 9) {
    return (shortYear <= 36 ? 2000 : 1900) + shortYear;
  }

  return (shortYear <= 57 ? 2000 : 1800) + shortYear;
}

function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
