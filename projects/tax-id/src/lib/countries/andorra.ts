import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateAndorranTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'AD', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 8) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^[A-Z]\d{6}[A-Z]$/.test(normalizedValue) || normalizedValue.slice(1, 7) === '000000') {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}
