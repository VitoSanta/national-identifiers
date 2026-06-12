import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateIranianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'IR', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 10) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{10}$/.test(normalizedValue) || /^(\d)\1{9}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const weightedSum = [...normalizedValue.slice(0, 9)].reduce(
    (sum, digit, index) => sum + Number(digit) * (10 - index),
    0,
  );
  const remainder = weightedSum % 11;
  const expectedCheckDigit = remainder < 2 ? remainder : 11 - remainder;

  if (Number(normalizedValue[9]) !== expectedCheckDigit) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}
