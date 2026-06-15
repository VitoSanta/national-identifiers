import { TaxIdValidationResult } from '../models';

// UAE Tax Registration Number: the Federal Tax Authority verifier requires a
// 15-character TRN. VAT TRNs are numeric; issuance/activity still requires
// the authoritative online verifier, so this rule is format-only.
export function validateEmiratiVat(value: unknown): TaxIdValidationResult {
  const normalizedValue =
    typeof value === 'string' || typeof value === 'number'
      ? String(value).trim().replace(/[\s-]+/g, '')
      : '';
  const base = { country: 'AE', normalizedValue } as const;

  if (!normalizedValue) return { ...base, valid: false, error: 'empty' };
  if (normalizedValue.length !== 15) {
    return { ...base, valid: false, error: 'invalid_length' };
  }
  if (!/^\d{15}$/.test(normalizedValue) || normalizedValue === '000000000000000') {
    return { ...base, valid: false, error: 'invalid_format' };
  }
  return { ...base, valid: true, validationLevel: 'format' };
}
