import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

// Source: Republic of Palau Bureau of Revenue and Taxation, Tax-100.
// The form records the ROP Social Security Number as a 3-digit citizen code
// followed by the individual's last 6 digits. No checksum is documented.
export function validatePalauanTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'PW', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }
  if (normalizedValue.length !== 9) {
    return { ...base, valid: false, error: 'invalid_length' };
  }
  if (!/^\d{9}$/.test(normalizedValue) || /^0{9}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}
