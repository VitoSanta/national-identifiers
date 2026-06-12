import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

// Maldives personal TIN: 7-digit Business Partner number issued by MIRA.
// The last digit may serve as a control digit but the algorithm is not public.
// Source: OECD AEOI sheet for Maldives; MIRA official portal.
export function validateMaldivianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'MV', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 7) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{7}$/.test(normalizedValue) || /^0{7}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}
