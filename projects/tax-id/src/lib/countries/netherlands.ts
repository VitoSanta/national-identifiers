import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateDutchTaxId(value: unknown): TaxIdValidationResult {
  const rawValue = normalizeTaxId(value);
  const normalizedValue = rawValue.length === 8 ? `0${rawValue}` : rawValue;
  const base = { country: 'NL', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 9) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{9}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const digits = [...normalizedValue].map(Number);
  const weightedSum = digits.reduce(
    (total, digit, index) => total + digit * (index === 8 ? -1 : 9 - index),
    0,
  );

  if (weightedSum === 0 || weightedSum % 11 !== 0) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}
