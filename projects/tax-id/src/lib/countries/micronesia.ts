import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

// Source: FSM Social Security Administration, Application for a FSM Social
// Security Number. The form prints the identifier as 2 digits, a hyphen and
// 6 digits. No checksum is documented.
export function validateMicronesianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'FM', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }
  if (normalizedValue.length !== 8) {
    return { ...base, valid: false, error: 'invalid_length' };
  }
  if (!/^\d{8}$/.test(normalizedValue) || /^0{8}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}
