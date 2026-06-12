import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateHungarianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'HU', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 10) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^8\d{9}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const digits = [...normalizedValue].map(Number);
  const remainder = digits
    .slice(0, 9)
    .reduce((total, digit, index) => total + digit * (index + 1), 0) % 11;

  if (remainder === 10 || digits[9] !== remainder) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}
