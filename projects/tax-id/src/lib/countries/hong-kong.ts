import { TaxIdValidationResult } from '../models';

// Hong Kong Identity Card (HKID), used as the individual tax reference.
// 1–2 letters + 6 digits + check character (0–9 or A), mod-11.
// Letters A=10…Z=35; a missing leading letter counts as 36.
// Source: confirmed public mod-11 algorithm (weights 9..2, check weight 1).
const PATTERN = /^[A-Z]{1,2}\d{6}[0-9A]$/;

export function validateHongKongTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue =
    typeof value === 'string' || typeof value === 'number'
      ? String(value).trim().replace(/[\s()-]+/g, '').toUpperCase()
      : '';
  const base = { country: 'HK', normalizedValue } as const;

  if (!normalizedValue) return { ...base, valid: false, error: 'empty' };
  if (normalizedValue.length !== 8 && normalizedValue.length !== 9) {
    return { ...base, valid: false, error: 'invalid_length' };
  }
  if (!PATTERN.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const padded = normalizedValue.length === 8 ? ` ${normalizedValue}` : normalizedValue;
  const charValue = (c: string): number =>
    c === ' ' ? 36 : c >= 'A' ? c.charCodeAt(0) - 55 : c.charCodeAt(0) - 48;

  let sum = 0;
  for (let i = 0; i < 8; i += 1) sum += charValue(padded[i]) * (9 - i);
  sum += charValue(padded[8]); // check character, weight 1

  if (sum % 11 !== 0) return { ...base, valid: false, error: 'invalid_checksum' };
  return { ...base, valid: true, validationLevel: 'checksum' };
}
