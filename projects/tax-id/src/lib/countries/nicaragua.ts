import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateNicaraguanTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'NI', normalizedValue } as const;

  if (!normalizedValue) return { ...base, valid: false, error: 'empty' };
  if (normalizedValue.length !== 14) return { ...base, valid: false, error: 'invalid_length' };
  if (!/^\d{13}[A-Z]$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const day = Number(normalizedValue.slice(3, 5));
  const month = Number(normalizedValue.slice(5, 7));
  const yearPart = Number(normalizedValue.slice(7, 9));
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
