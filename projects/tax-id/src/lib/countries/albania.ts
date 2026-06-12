import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateAlbanianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'AL', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 10) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^(?:\d{2}|[A-T]\d)\d{7}[A-W]$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const year = decodeYear(normalizedValue.slice(0, 2));
  const encodedMonth = Number(normalizedValue.slice(2, 4));
  const month = decodeMonth(encodedMonth);
  const day = Number(normalizedValue.slice(4, 6));
  const serial = Number(normalizedValue.slice(6, 9));

  if (year === null || month === null || serial === 0 || !isValidDate(year, month, day)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}

function decodeYear(value: string): number | null {
  if (/^\d{2}$/.test(value)) {
    return 1800 + Number(value);
  }

  const decade = value.charCodeAt(0) - 'A'.charCodeAt(0);
  const yearInDecade = Number(value[1]);

  if (decade >= 0 && decade <= 9) {
    return 1900 + decade * 10 + yearInDecade;
  }

  if (decade >= 10 && decade <= 19) {
    return 2000 + (decade - 10) * 10 + yearInDecade;
  }

  return null;
}

function decodeMonth(value: number): number | null {
  for (const offset of [0, 30, 50, 80]) {
    const month = value - offset;
    if (month >= 1 && month <= 12) {
      return month;
    }
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
