import { TaxIdValidationResult } from '../models';

export function validateColombianTaxId(value: unknown): TaxIdValidationResult {
  const normalized = typeof value === 'string' ? value.replace(/[-.\s]/g, '').trim() : '';

  if (!normalized) {
    return { valid: false, country: 'CO', normalizedValue: normalized, error: 'empty' };
  }

  if (normalized.length > 15 || normalized.length < 2) {
    return { valid: false, country: 'CO', normalizedValue: normalized, error: 'invalid_length' };
  }

  if (!/^[0-9]+$/.test(normalized)) {
    return { valid: false, country: 'CO', normalizedValue: normalized, error: 'invalid_format' };
  }

  const base = normalized.substring(0, normalized.length - 1);
  const actualCheckDigit = parseInt(normalized[normalized.length - 1], 10);

  const primes = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
  let sum = 0;

  for (let i = 0; i < base.length; i++) {
    // primes are mapped from right to left of the base
    const weightIndex = base.length - 1 - i;
    // But wait, the primes sequence applies right to left. 
    // So the right-most digit of base gets primes[0], next gets primes[1]...
    // Thus `primes[i]` corresponds to the `base.length - 1 - i` digit.
    sum += parseInt(base[weightIndex], 10) * primes[i];
  }

  const remainder = sum % 11;
  let expectedCheckDigit: number;

  if (remainder <= 1) {
    expectedCheckDigit = remainder;
  } else {
    expectedCheckDigit = 11 - remainder;
  }

  if (actualCheckDigit !== expectedCheckDigit) {
    return { valid: false, country: 'CO', normalizedValue: normalized, error: 'invalid_checksum' };
  }

  return { valid: true, country: 'CO', normalizedValue: normalized };
}
