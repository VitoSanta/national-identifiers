import { TaxIdValidationResult } from '../models';

export function validateTunisianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTunisianTaxId(value);
  const base = { country: 'TN', normalizedValue } as const;

  if (!normalizedValue) return { ...base, valid: false, error: 'empty' };
  if (normalizedValue.length !== 12) return { ...base, valid: false, error: 'invalid_length' };
  if (!/^\d{7}[A-Z]{2}\d{3}$/.test(normalizedValue) || /^0{7}/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}

function normalizeTunisianTaxId(value: unknown): string {
  if (typeof value !== 'string' && typeof value !== 'number') return '';
  return String(value).trim().replace(/[\s\-/]+/g, '').toUpperCase();
}
