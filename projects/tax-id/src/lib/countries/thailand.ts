import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateThaiTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'TH', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 13) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^[1-8]\d{12}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const weightedSum = [...normalizedValue.slice(0, 12)].reduce(
    (sum, digit, index) => sum + Number(digit) * (13 - index),
    0,
  );
  const expectedCheckDigit = (11 - (weightedSum % 11)) % 10;

  if (Number(normalizedValue[12]) !== expectedCheckDigit) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}
