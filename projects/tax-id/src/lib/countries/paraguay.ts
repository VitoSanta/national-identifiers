import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

// Source: DNIT (former SET) "Digito Verificador" technical note - modulus 11
// over the base number with weights 2, 3, 4, ... from the rightmost digit;
// remainders 0 and 1 map to check digit 0.
export function validateParaguayanTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'PY', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length < 5 || normalizedValue.length > 9) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d+$/.test(normalizedValue) || /^0+$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const baseDigits = normalizedValue.slice(0, -1);
  const weightedSum = [...baseDigits]
    .reverse()
    .reduce((sum, digit, index) => sum + Number(digit) * (index + 2), 0);
  const remainder = weightedSum % 11;
  const expectedCheckDigit = remainder > 1 ? 11 - remainder : 0;

  if (Number(normalizedValue.slice(-1)) !== expectedCheckDigit) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}
