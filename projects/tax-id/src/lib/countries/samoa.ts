import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

// Samoa TIN: sequential numeric identifier, 5–9 digits. Issuance started at
// 70004 with no fixed structure or check digit (Tax Administration Act 2012).
// Source: OECD AEOI sheet for Samoa; Ministry of Customs and Revenue (MCR).
export function validateSamoanTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'WS', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length < 5 || normalizedValue.length > 9) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d+$/.test(normalizedValue) || /^0+$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}
