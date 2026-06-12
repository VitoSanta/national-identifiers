import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validatePakistaniTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'PK', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 7 && normalizedValue.length !== 13) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (normalizedValue.length === 7) {
    if (!/^\d{7}$/.test(normalizedValue) || /^0{7}$/.test(normalizedValue)) {
      return { ...base, valid: false, error: 'invalid_format' };
    }

    return { ...base, valid: true, validationLevel: 'format' };
  }

  if (!/^[1-9]\d{12}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}
