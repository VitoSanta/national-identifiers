import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateSalvadoranTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'SV', normalizedValue } as const;

  if (!normalizedValue) return { ...base, valid: false, error: 'empty' };
  if (normalizedValue.length !== 14) return { ...base, valid: false, error: 'invalid_length' };
  if (!/^\d{14}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const day = Number(normalizedValue.slice(4, 6));
  const month = Number(normalizedValue.slice(6, 8));
  const yearPart = Number(normalizedValue.slice(8, 10));
  const year = yearPart > new Date().getUTCFullYear() % 100 ? 1900 + yearPart : 2000 + yearPart;

  if (!isValidDate(year, month, day)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}

function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
