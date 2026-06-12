import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validatePalestinianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'PS', normalizedValue } as const;

  if (!normalizedValue) return { ...base, valid: false, error: 'empty' };
  if (normalizedValue.length !== 9) return { ...base, valid: false, error: 'invalid_length' };
  if (!/^\d{9}$/.test(normalizedValue) || /^0{9}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const weightedSum = [...normalizedValue].reduce((sum, digit, index) => {
    const product = Number(digit) * (index % 2 === 0 ? 1 : 2);
    return sum + (product > 9 ? product - 9 : product);
  }, 0);

  if (weightedSum % 10 !== 0) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}
