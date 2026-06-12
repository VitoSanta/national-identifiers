import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

const WEIGHTS = [1, 4, 3, 7, 5, 8, 6, 9, 10];

export function validateAustralianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'AU', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 9) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{9}$/.test(normalizedValue) || /^0{9}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const weightedSum = [...normalizedValue].reduce(
    (sum, digit, index) => sum + Number(digit) * WEIGHTS[index],
    0,
  );

  if (weightedSum % 11 !== 0) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}
