import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateFrenchTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = {
    country: 'FR',
    normalizedValue,
  } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 13) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^[0-3]\d{12}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const firstTenDigits = Number(normalizedValue.slice(0, 10));
  const expectedCheckDigits = String(firstTenDigits % 511).padStart(3, '0');

  if (normalizedValue.slice(10) !== expectedCheckDigits) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true };
}
