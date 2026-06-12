import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateMongolianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'MN', normalizedValue } as const;

  if (!normalizedValue) return { ...base, valid: false, error: 'empty' };
  if (normalizedValue.length !== 10) return { ...base, valid: false, error: 'invalid_length' };
  if (!/^[А-ЯЁӨҮ]{2}\d{8}$/u.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const yearPart = Number(normalizedValue.slice(2, 4));
  const month = Number(normalizedValue.slice(4, 6));
  const day = Number(normalizedValue.slice(6, 8));
  const currentYearPart = new Date().getUTCFullYear() % 100;
  const year = yearPart > currentYearPart ? 1900 + yearPart : 2000 + yearPart;

  if (!isValidDate(year, month, day)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}

function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
