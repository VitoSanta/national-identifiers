import { TaxIdValidationResult } from '../models';

export function validateIndonesianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeIndonesianTaxId(value);
  const base = { country: 'ID', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 15 && normalizedValue.length !== 16) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d+$/.test(normalizedValue) || /^0+$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  if (normalizedValue.length === 15) {
    return validateNpwp(base, normalizedValue);
  }

  return validateNik(base, normalizedValue);
}

function validateNpwp(
  base: { readonly country: string; readonly normalizedValue: string },
  normalizedValue: string,
): TaxIdValidationResult {
  const luhnSum = [...normalizedValue.slice(0, 9)].reverse().reduce((sum, digit, index) => {
    const product = Number(digit) * (index % 2 === 0 ? 1 : 2);
    return sum + (product > 9 ? product - 9 : product);
  }, 0);

  if (luhnSum % 10 !== 0) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}

function validateNik(
  base: { readonly country: string; readonly normalizedValue: string },
  normalizedValue: string,
): TaxIdValidationResult {
  const rawDay = Number(normalizedValue.slice(6, 8));
  const day = rawDay > 40 ? rawDay - 40 : rawDay;
  const month = Number(normalizedValue.slice(8, 10));

  if (
    normalizedValue[0] === '0' ||
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12 ||
    normalizedValue.slice(12) === '0000'
  ) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}

function normalizeIndonesianTaxId(value: unknown): string {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return '';
  }

  return String(value).trim().replace(/[\s.\-]+/g, '');
}
