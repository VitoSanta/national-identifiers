import { TaxIdValidationResult } from '../models';

export function validatePeruvianTaxId(value: unknown): TaxIdValidationResult {
  const normalized = typeof value === 'string' ? value.replace(/[-.\s]/g, '').trim().toUpperCase() : '';

  if (!normalized) {
    return { valid: false, country: 'PE', normalizedValue: normalized, error: 'empty' };
  }

  if (normalized.length !== 8 && normalized.length !== 9 && normalized.length !== 11) {
    return { valid: false, country: 'PE', normalizedValue: normalized, error: 'invalid_length' };
  }

  // DNI without check digit (8 digits) -> format only
  if (normalized.length === 8) {
    if (!/^[0-9]{8}$/.test(normalized)) {
      return { valid: false, country: 'PE', normalizedValue: normalized, error: 'invalid_format' };
    }
    return { valid: true, country: 'PE', normalizedValue: normalized, validationLevel: 'format' };
  }

  // DNI with check digit (9 chars)
  if (normalized.length === 9) {
    if (!/^[0-9]{8}[0-9A-Z]$/.test(normalized)) {
      return { valid: false, country: 'PE', normalizedValue: normalized, error: 'invalid_format' };
    }

    const base = normalized.substring(0, 8);
    const actualCheckDigit = normalized[8];

    const weights = [3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 8; i++) {
      sum += parseInt(base[i], 10) * weights[i];
    }

    const remainder = sum % 11;
    const calc = 11 - remainder;
    let expectedNumber: number;

    if (calc === 10) {
      expectedNumber = 0;
    } else if (calc === 11) {
      expectedNumber = 1;
    } else {
      expectedNumber = calc;
    }

    // Sometimes DNI check digits are letters. We'll map the number to the historical letter.
    const letterMap = ['K', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const expectedLetter = letterMap[expectedNumber];

    if (actualCheckDigit !== expectedNumber.toString() && actualCheckDigit !== expectedLetter) {
      return { valid: false, country: 'PE', normalizedValue: normalized, error: 'invalid_checksum' };
    }

    return { valid: true, country: 'PE', normalizedValue: normalized };
  }

  // RUC (11 digits)
  if (!/^[0-9]{11}$/.test(normalized)) {
    return { valid: false, country: 'PE', normalizedValue: normalized, error: 'invalid_format' };
  }

  const base = normalized.substring(0, 10);
  const actualCheckDigit = parseInt(normalized[10], 10);

  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(base[i], 10) * weights[i];
  }

  const remainder = sum % 11;
  const calc = 11 - remainder;
  let expectedNumber: number;

  if (calc === 10) {
    expectedNumber = 0;
  } else if (calc === 11) {
    expectedNumber = 1;
  } else {
    expectedNumber = calc;
  }

  if (actualCheckDigit !== expectedNumber) {
    return { valid: false, country: 'PE', normalizedValue: normalized, error: 'invalid_checksum' };
  }

  return { valid: true, country: 'PE', normalizedValue: normalized };
}
