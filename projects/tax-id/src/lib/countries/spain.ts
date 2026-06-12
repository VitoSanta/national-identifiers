import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

const CONTROL_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';
const NIF_PATTERN = /^(\d{8}|[XYZ]\d{7})[A-Z]$/;

export function validateSpanishTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = {
    country: 'ES',
    normalizedValue,
  } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 9) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!NIF_PATTERN.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const numericPart = normalizedValue
    .slice(0, 8)
    .replace('X', '0')
    .replace('Y', '1')
    .replace('Z', '2');
  const expectedLetter = CONTROL_LETTERS[Number(numericPart) % 23];

  if (normalizedValue[8] !== expectedLetter) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true };
}
