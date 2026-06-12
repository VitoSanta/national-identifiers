import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

const WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
const CHECK_CHARACTERS = '10X98765432';

export function validateChineseTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'CN', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 18) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^[1-9]\d{5}(18|19|20)\d{9}[\dX]$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const year = Number(normalizedValue.slice(6, 10));
  const month = Number(normalizedValue.slice(10, 12));
  const day = Number(normalizedValue.slice(12, 14));

  if (!isValidDate(year, month, day)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const weightedSum = [...normalizedValue.slice(0, 17)].reduce(
    (sum, digit, index) => sum + Number(digit) * WEIGHTS[index],
    0,
  );

  if (normalizedValue[17] !== CHECK_CHARACTERS[weightedSum % 11]) {
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
