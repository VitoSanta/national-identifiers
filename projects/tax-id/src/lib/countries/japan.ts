import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateJapaneseTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'JP', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 12) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{12}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const digits = [...normalizedValue].map(Number);
  let weightedSum = 0;

  for (let position = 1; position <= 11; position++) {
    const digit = digits[11 - position];
    const weight = position <= 6 ? position + 1 : position - 5;
    weightedSum += digit * weight;
  }

  const remainder = weightedSum % 11;
  const expectedCheckDigit = remainder <= 1 ? 0 : 11 - remainder;

  if (digits[11] !== expectedCheckDigit) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}
