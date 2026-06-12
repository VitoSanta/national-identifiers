import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateTurkishTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'TR', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 11) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^[1-9]\d{10}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const digits = [...normalizedValue].map(Number);
  const oddPositionSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenPositionSum = digits[1] + digits[3] + digits[5] + digits[7];
  const expectedTenthDigit = ((oddPositionSum * 7 - evenPositionSum) % 10 + 10) % 10;
  const expectedEleventhDigit = digits.slice(0, 10).reduce((sum, digit) => sum + digit, 0) % 10;

  if (digits[9] !== expectedTenthDigit || digits[10] !== expectedEleventhDigit) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}
