import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateCubanTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'CU', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 11) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{11}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const shortYear = Number(normalizedValue.slice(0, 2));
  const month = Number(normalizedValue.slice(2, 4));
  const day = Number(normalizedValue.slice(4, 6));
  const centuryDigit = Number(normalizedValue[6]);
  const year = resolveCubanYear(shortYear, centuryDigit);

  if (!isValidDate(year, month, day)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}

function resolveCubanYear(shortYear: number, centuryDigit: number): number {
  if (centuryDigit === 9) {
    return 1800 + shortYear;
  }

  if (centuryDigit <= 5) {
    return 1900 + shortYear;
  }

  return 2000 + shortYear;
}

function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
