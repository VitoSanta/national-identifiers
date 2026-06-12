import { TaxIdValidationResult } from '../models';

export function validateUnitedStatesTaxId(value: unknown): TaxIdValidationResult {
  const normalized = typeof value === 'string' ? value.replace(/[- ]/g, '').trim() : '';

  if (!normalized) {
    return { valid: false, country: 'US', normalizedValue: normalized, error: 'empty' };
  }

  if (normalized.length !== 9) {
    return { valid: false, country: 'US', normalizedValue: normalized, error: 'invalid_length' };
  }

  if (!/^[0-9]{9}$/.test(normalized)) {
    return { valid: false, country: 'US', normalizedValue: normalized, error: 'invalid_format' };
  }

  const area = normalized.substring(0, 3);
  const group = normalized.substring(3, 5);
  const serial = normalized.substring(5, 9);

  if (
    area === '000' ||
    area === '666' ||
    parseInt(area, 10) >= 900 ||
    group === '00' ||
    serial === '0000'
  ) {
    return { valid: false, country: 'US', normalizedValue: normalized, error: 'invalid_format' };
  }

  return { valid: true, country: 'US', normalizedValue: normalized, validationLevel: 'format' };
}
