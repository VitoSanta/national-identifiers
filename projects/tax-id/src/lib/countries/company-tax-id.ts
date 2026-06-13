import { TaxIdValidationResult } from '../models';

// Company / entity tax identifiers with public check-digit algorithms.
// Each is sourced from official documentation; see docs/COUNTRY-COVERAGE.md.

function compact(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number'
    ? String(value).trim().replace(/[\s./-]+/g, '').toUpperCase()
    : '';
}

// Brazil CNPJ: 14 digits, two modulo-11 check digits over the first 12.
export function validateBrazilianCnpj(value: unknown): TaxIdValidationResult {
  const n = compact(value);
  const base = { country: 'BR', normalizedValue: n } as const;
  if (!n) return { ...base, valid: false, error: 'empty' };
  if (n.length !== 14) return { ...base, valid: false, error: 'invalid_length' };
  if (!/^\d{14}$/.test(n) || /^(\d)\1{13}$/.test(n)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }
  const checkDigit = (length: number): number => {
    let weight = length - 7;
    let sum = 0;
    for (let i = 0; i < length; i += 1) {
      sum += Number(n[i]) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  return Number(n[12]) === checkDigit(12) && Number(n[13]) === checkDigit(13)
    ? { ...base, valid: true, validationLevel: 'checksum' }
    : { ...base, valid: false, error: 'invalid_checksum' };
}

// India GSTIN: 15 chars (state + PAN + entity + 'Z' + check), modulo-36 check.
const GSTIN_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const GSTIN_PATTERN = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export function validateIndianGstin(value: unknown): TaxIdValidationResult {
  const n = compact(value);
  const base = { country: 'IN', normalizedValue: n } as const;
  if (!n) return { ...base, valid: false, error: 'empty' };
  if (n.length !== 15) return { ...base, valid: false, error: 'invalid_length' };
  if (!GSTIN_PATTERN.test(n)) return { ...base, valid: false, error: 'invalid_format' };

  let factor = 2;
  let sum = 0;
  for (let i = 13; i >= 0; i -= 1) {
    const codePoint = GSTIN_ALPHABET.indexOf(n[i]);
    const addend = factor * codePoint;
    factor = factor === 2 ? 1 : 2;
    sum += Math.floor(addend / 36) + (addend % 36);
  }
  const expected = GSTIN_ALPHABET[(36 - (sum % 36)) % 36];
  return n[14] === expected
    ? { ...base, valid: true, validationLevel: 'checksum' }
    : { ...base, valid: false, error: 'invalid_checksum' };
}

// Australia ACN: 9-digit company number, modulo-10 weighted check (ASIC).
export function validateAustralianAcn(value: unknown): TaxIdValidationResult {
  const n = compact(value);
  const base = { country: 'AU', normalizedValue: n } as const;
  if (!n) return { ...base, valid: false, error: 'empty' };
  if (n.length !== 9) return { ...base, valid: false, error: 'invalid_length' };
  if (!/^\d{9}$/.test(n)) return { ...base, valid: false, error: 'invalid_format' };

  const weights = [8, 7, 6, 5, 4, 3, 2, 1];
  const sum = weights.reduce((total, weight, i) => total + Number(n[i]) * weight, 0);
  const expected = (10 - (sum % 10)) % 10;
  return Number(n[8]) === expected
    ? { ...base, valid: true, validationLevel: 'checksum' }
    : { ...base, valid: false, error: 'invalid_checksum' };
}
