import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateUzbekTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'UZ', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 14) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^[1-6]\d{13}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const centuryDigit = Number(normalizedValue[0]);
  const day = Number(normalizedValue.slice(1, 3));
  const month = Number(normalizedValue.slice(3, 5));
  const shortYear = Number(normalizedValue.slice(5, 7));
  const year = (17 + Math.ceil(centuryDigit / 2)) * 100 + shortYear;

  if (!isValidDate(year, month, day)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}

function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
