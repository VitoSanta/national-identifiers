import { TaxIdValidationResult } from '../models';

export function validateBelgianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeBelgianTaxId(value);
  const base = {
    country: 'BE',
    normalizedValue,
  } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 11) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{11}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const firstNineDigits = Number(normalizedValue.slice(0, 9));
  const checkDigits = Number(normalizedValue.slice(9));
  const pre2000Check = 97 - (firstNineDigits % 97);
  const post2000Check = 97 - ((2_000_000_000 + firstNineDigits) % 97);

  if (checkDigits !== pre2000Check && checkDigits !== post2000Check) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}

function normalizeBelgianTaxId(value: unknown): string {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return '';
  }

  return String(value).trim().replace(/[\s.\-/]+/g, '');
}
