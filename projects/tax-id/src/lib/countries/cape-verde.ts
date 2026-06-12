import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateCapeVerdeanTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'CV', normalizedValue } as const;

  if (!normalizedValue) return { ...base, valid: false, error: 'empty' };
  if (normalizedValue.length !== 9) return { ...base, valid: false, error: 'invalid_length' };
  if (!/^\d{9}$/.test(normalizedValue) || /^0{9}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const sum = [...normalizedValue.slice(0, 8)].reduce(
    (total, digit, index) => total + Number(digit) * (9 - index),
    0,
  );
  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? 0 : 11 - remainder;

  if (checkDigit !== Number(normalizedValue[8])) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}
