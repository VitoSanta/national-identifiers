import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateCroatianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = {
    country: 'HR',
    normalizedValue,
  } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 11) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{11}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  let remainder = 10;

  for (const character of normalizedValue.slice(0, 10)) {
    remainder = (remainder + Number(character)) % 10;
    remainder = remainder === 0 ? 10 : remainder;
    remainder = (remainder * 2) % 11;
  }

  const expectedCheckDigit = (11 - remainder) % 10;

  if (Number(normalizedValue[10]) !== expectedCheckDigit) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}
