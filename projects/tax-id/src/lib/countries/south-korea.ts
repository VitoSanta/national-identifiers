import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateSouthKoreanTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'KR', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 13) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{13}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const shortYear = Number(normalizedValue.slice(0, 2));
  const month = Number(normalizedValue.slice(2, 4));
  const day = Number(normalizedValue.slice(4, 6));
  const centuryDigit = Number(normalizedValue[6]);
  const year = resolveRrnYear(shortYear, centuryDigit);

  if (!isValidDate(year, month, day)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  // Since October 2020 the individual portion of new RRNs is randomized and the
  // historical modulus-11 check digit is no longer guaranteed.
  return { ...base, valid: true, validationLevel: 'format' };
}

function resolveRrnYear(shortYear: number, centuryDigit: number): number {
  if (centuryDigit === 9 || centuryDigit === 0) {
    return 1800 + shortYear;
  }

  if (centuryDigit === 1 || centuryDigit === 2 || centuryDigit === 5 || centuryDigit === 6) {
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
