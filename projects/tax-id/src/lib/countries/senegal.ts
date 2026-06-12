import { TaxIdValidationResult } from '../models';

const COFI_PATTERN = /^[012][ABCDEFGHJKLMNPQRSTUVWZ]\d$/;
const CHECKSUM_WEIGHTS = [1, 2, 1, 2, 1, 2, 1, 2, 1] as const;

export function validateSenegaleseTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeSenegaleseTaxId(value);
  const base = { country: 'SN', normalizedValue } as const;

  if (!normalizedValue) return { ...base, valid: false, error: 'empty' };

  const hasCofi = normalizedValue.length === 10 || normalizedValue.length === 12;
  const ninea = hasCofi ? normalizedValue.slice(0, -3) : normalizedValue;
  const cofi = hasCofi ? normalizedValue.slice(-3) : '';

  if (ninea.length !== 7 && ninea.length !== 9) {
    return { ...base, valid: false, error: 'invalid_length' };
  }
  if (!/^\d+$/.test(ninea) || (cofi && !COFI_PATTERN.test(cofi))) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const paddedNinea = ninea.padStart(9, '0');
  const checksum = [...paddedNinea].reduce(
    (sum, digit, index) => sum + Number(digit) * CHECKSUM_WEIGHTS[index],
    0,
  );

  if (checksum % 10 !== 0) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}

function normalizeSenegaleseTaxId(value: unknown): string {
  if (typeof value !== 'string' && typeof value !== 'number') return '';
  return String(value).trim().replace(/[\s\-/ ,]+/g, '').toUpperCase();
}
