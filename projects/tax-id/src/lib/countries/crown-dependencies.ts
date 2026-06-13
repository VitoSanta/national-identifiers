import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

// Format-only validators for Crown Dependency tax identifiers. Structures are
// documented by the OECD AEOI TIN sheets; no public check digit is defined,
// so these confirm structure only. See docs/COUNTRY-COVERAGE.md.
function formatOnly(
  country: string,
  normalizedValue: string,
  pattern: RegExp,
): TaxIdValidationResult {
  if (!normalizedValue) return { valid: false, country, normalizedValue, error: 'empty' };
  return pattern.test(normalizedValue)
    ? { valid: true, country, normalizedValue, validationLevel: 'format' }
    : { valid: false, country, normalizedValue, error: 'invalid_format' };
}

// Jersey TIN: social-security number, `JY` + 6 digits + a final letter.
export function validateJerseyTaxId(value: unknown): TaxIdValidationResult {
  return formatOnly('JE', normalizeTaxId(value), /^JY\d{6}[A-Z]$/);
}

// Guernsey TIN: a single digit + two letters + six digits + optional letter.
export function validateGuernseyTaxId(value: unknown): TaxIdValidationResult {
  return formatOnly('GG', normalizeTaxId(value), /^\d[A-Z]{2}\d{6}[A-Z]?$/);
}
