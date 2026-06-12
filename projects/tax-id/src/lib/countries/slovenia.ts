import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

const WEIGHTS = [8, 7, 6, 5, 4, 3, 2] as const;

export function validateSlovenianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'SI', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 8) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{8}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const digits = [...normalizedValue].map(Number);
  const sum = digits
    .slice(0, 7)
    .reduce((total, digit, index) => total + digit * WEIGHTS[index], 0);
  const remainder = 11 - (sum % 11);
  const expectedCheckDigit = remainder === 10 || remainder === 11 ? 0 : remainder;

  if (digits[7] !== expectedCheckDigit) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}
