import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

const PRIMARY_WEIGHTS = [3, 2, 7, 6, 5, 4, 3, 2];
const SECONDARY_WEIGHTS = [7, 4, 3, 2, 5, 2, 7, 6];

export function validateNewZealandTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'NZ', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length < 8 || normalizedValue.length > 9) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{8,9}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const numericValue = Number(normalizedValue);

  if (numericValue < 10000000 || numericValue > 150000000) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const padded = normalizedValue.padStart(9, '0');
  const baseDigits = [...padded.slice(0, 8)].map(Number);
  const checkDigit = Number(padded[8]);

  const primaryCheckDigit = calculateCheckDigit(baseDigits, PRIMARY_WEIGHTS);
  const expectedCheckDigit =
    primaryCheckDigit === 10 ? calculateCheckDigit(baseDigits, SECONDARY_WEIGHTS) : primaryCheckDigit;

  if (expectedCheckDigit === 10 || checkDigit !== expectedCheckDigit) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}

function calculateCheckDigit(digits: readonly number[], weights: readonly number[]): number {
  const weightedSum = digits.reduce((sum, digit, index) => sum + digit * weights[index], 0);
  const remainder = weightedSum % 11;
  return remainder === 0 ? 0 : 11 - remainder;
}
