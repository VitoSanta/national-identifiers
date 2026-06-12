import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

// Modulus 11 with weights 2, 3, 4, ... from the rightmost base digit; a
// remainder mapping to 10 is written as the letter K (SAT validation rule).
export function validateGuatemalanTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'GT', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length < 3 || normalizedValue.length > 9) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{2,8}[\dK]$/.test(normalizedValue) || /^0+K?$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const baseDigits = normalizedValue.slice(0, -1);
  const weightedSum = [...baseDigits]
    .reverse()
    .reduce((sum, digit, index) => sum + Number(digit) * (index + 2), 0);
  const expectedValue = (11 - (weightedSum % 11)) % 11;
  const expectedCharacter = expectedValue === 10 ? 'K' : String(expectedValue);

  if (normalizedValue.slice(-1) !== expectedCharacter) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}
