import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

// Individuals use the Ghanacard PIN (ISO country code, 8-9 digits and a check
// character); entities and non-residents keep the 11-character GRA TIN.
export function validateGhanaianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'GH', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length < 11 || normalizedValue.length > 13) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (normalizedValue.length === 11) {
    if (!/^[A-Z]\d{10}$/.test(normalizedValue)) {
      return { ...base, valid: false, error: 'invalid_format' };
    }

    return { ...base, valid: true, validationLevel: 'format' };
  }

  if (!/^[A-Z]{3}\d{8,9}[0-9A-Z]$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}
