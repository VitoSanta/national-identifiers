import { TaxIdValidationResult } from '../models';

// Taiwan ROC National ID, used as the individual tax identifier.
// Region letter + sex digit (1/2) + 7 serial digits + check digit, mod-10.
// Letter maps to a two-digit code; weights 8..1 then 1 for the check digit.
const LETTER_CODES: Readonly<Record<string, number>> = {
  A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, I: 34, J: 18,
  K: 19, L: 20, M: 21, N: 22, O: 35, P: 23, Q: 24, R: 25, S: 26, T: 27,
  U: 28, V: 29, W: 32, X: 30, Y: 31, Z: 33,
};
const PATTERN = /^[A-Z][12]\d{8}$/;

export function validateTaiwanTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue =
    typeof value === 'string' || typeof value === 'number'
      ? String(value).trim().replace(/[\s-]+/g, '').toUpperCase()
      : '';
  const base = { country: 'TW', normalizedValue } as const;

  if (!normalizedValue) return { ...base, valid: false, error: 'empty' };
  if (normalizedValue.length !== 10) return { ...base, valid: false, error: 'invalid_length' };
  if (!PATTERN.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const code = LETTER_CODES[normalizedValue[0]];
  if (code === undefined) return { ...base, valid: false, error: 'invalid_format' };

  const weights = [8, 7, 6, 5, 4, 3, 2, 1, 1];
  let sum = Math.floor(code / 10) + (code % 10) * 9;
  for (let i = 1; i < 10; i += 1) sum += (normalizedValue.charCodeAt(i) - 48) * weights[i - 1];

  if (sum % 10 !== 0) return { ...base, valid: false, error: 'invalid_checksum' };
  return { ...base, valid: true, validationLevel: 'checksum' };
}
