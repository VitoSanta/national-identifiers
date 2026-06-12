import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

// KRA PIN: A (individuals) or P (entities), nine digits and a check letter
// whose algorithm is not public (OECD AEOI sheet for Kenya).
export function validateKenyanTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'KE', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 11) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^[AP]\d{9}[A-Z]$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}
