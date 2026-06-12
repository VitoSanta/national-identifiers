import { TaxIdValidationResult } from '../models';

export function validateAustrianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeAustrianTaxId(value);
  const base = { country: 'AT', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 9) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{9}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}

function normalizeAustrianTaxId(value: unknown): string {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return '';
  }

  return String(value).trim().replace(/[\s\-/]+/g, '');
}
