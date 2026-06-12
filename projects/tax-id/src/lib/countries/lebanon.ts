import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

// Source: OECD AEOI "Lebanon - Information on Tax Identification Numbers".
// Lebanese TINs are numeric serials. VAT registrations may append one of the
// documented purpose codes 601, 603 or 604 after a hyphen.
export function validateLebaneseTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'LB', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  const compactValue =
    typeof value === 'string' || typeof value === 'number'
      ? String(value).trim().replace(/\s+/g, '')
      : '';

  if (!/^\d+(?:-(?:601|603|604))?$/.test(compactValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}
