import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

const WEIGHTS = [1, 6, 3, 7, 9, 10, 5, 8, 4, 2] as const;

export function validateLatvianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'LV', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 11) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{11}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  if (!normalizedValue.startsWith('32') && !hasValidHistoricalDate(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const digits = [...normalizedValue].map(Number);
  const weightedSum = digits
    .slice(0, 10)
    .reduce((total, digit, index) => total + digit * WEIGHTS[index], 0);
  const expectedCheckDigit = (((1101 - weightedSum) % 11) + 11) % 11 % 10;

  if (digits[10] !== expectedCheckDigit) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}

function hasValidHistoricalDate(value: string): boolean {
  const day = Number(value.slice(0, 2));
  const month = Number(value.slice(2, 4));

  return day >= 1 && day <= 31 && month >= 1 && month <= 12;
}
