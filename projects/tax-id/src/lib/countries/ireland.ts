import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

const CONTROL_CHARACTERS = 'WABCDEFGHIJKLMNOPQRSTUV';
export function validateIrishTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'IE', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length < 8 || normalizedValue.length > 9) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{7}[A-W][AHW]?$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const weightedSum = [...normalizedValue.slice(0, 7)].reduce(
    (sum, digit, index) => sum + Number(digit) * (8 - index),
    0,
  );
  const secondLetter = normalizedValue[8];
  const secondLetterValue = secondLetter ? secondLetter.charCodeAt(0) - 64 : 0;
  const expectedControlCharacter =
    CONTROL_CHARACTERS[(weightedSum + secondLetterValue * 9) % 23];

  if (normalizedValue[7] !== expectedControlCharacter) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}
