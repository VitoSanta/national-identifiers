import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateJmbg(
  country: 'BA' | 'ME' | 'MK' | 'RS',
  value: unknown,
  isAllowedRegion: (region: number) => boolean,
): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country, normalizedValue };

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 13) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{13}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const day = Number(normalizedValue.slice(0, 2));
  const month = Number(normalizedValue.slice(2, 4));
  const yearPart = Number(normalizedValue.slice(4, 7));
  const region = Number(normalizedValue.slice(7, 9));
  const year = yearPart >= 800 ? 1000 + yearPart : 2000 + yearPart;

  if (!isValidDate(year, month, day) || !isAllowedRegion(region)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const digits = [...normalizedValue].map(Number);
  const weightedSum =
    7 * (digits[0] + digits[6]) +
    6 * (digits[1] + digits[7]) +
    5 * (digits[2] + digits[8]) +
    4 * (digits[3] + digits[9]) +
    3 * (digits[4] + digits[10]) +
    2 * (digits[5] + digits[11]);
  const control = 11 - (weightedSum % 11);
  const expectedCheckDigit = control >= 10 ? 0 : control;

  if (digits[12] !== expectedCheckDigit) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}

function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
