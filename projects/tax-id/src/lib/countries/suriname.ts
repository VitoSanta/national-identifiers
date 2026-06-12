import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

// Source: Belastingdienst Suriname online registration portal, public
// AccountAanmaken contribution schema (version 1.7.87, 2026-05-05).
// The mandatory FIN field accepts digits only and has a maximum length of 10.
export function validateSurinameseTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'SR', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  const compactValue =
    typeof value === 'string' || typeof value === 'number'
      ? String(value).trim()
      : '';

  if (!/^\d+$/.test(compactValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  if (compactValue.length > 10) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}
