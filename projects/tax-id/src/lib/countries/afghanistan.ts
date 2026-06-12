import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

// The Afghan e-Tazkira national identification number contains 13 digits.
// No public checksum algorithm is claimed by this validator.
export function validateAfghanNationalId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'AF', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 13) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{13}$/.test(normalizedValue) || /^0{13}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}
