import { TaxIdValidationResult } from '../models';

export function validateVenezuelanTaxId(value: unknown): TaxIdValidationResult {
  const normalized = typeof value === 'string' ? value.replace(/[-.\s]/g, '').trim().toUpperCase() : '';

  if (!normalized) {
    return { valid: false, country: 'VE', normalizedValue: normalized, error: 'empty' };
  }

  if (normalized.length !== 10) {
    return { valid: false, country: 'VE', normalizedValue: normalized, error: 'invalid_length' };
  }

  if (!/^[VEJPG][0-9]{9}$/.test(normalized) && !/^[C][0-9]{9}$/.test(normalized)) {
    return { valid: false, country: 'VE', normalizedValue: normalized, error: 'invalid_format' };
  }

  const letterMap: Record<string, number> = {
    V: 1,
    E: 2,
    J: 3,
    C: 3, // C was introduced for Communal Councils and uses the same value as J
    P: 4,
    G: 5,
  };

  const letterValue = letterMap[normalized[0]];
  const baseDigits = normalized.substring(1, 9);
  const actualCheckDigit = parseInt(normalized[9], 10);

  const weights = [4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = letterValue * weights[0];

  for (let i = 0; i < 8; i++) {
    sum += parseInt(baseDigits[i], 10) * weights[i + 1];
  }

  const remainder = sum % 11;
  let expectedCheckDigit: number;

  if (remainder <= 1) {
    expectedCheckDigit = 0;
  } else {
    expectedCheckDigit = 11 - remainder;
  }

  if (actualCheckDigit !== expectedCheckDigit) {
    return { valid: false, country: 'VE', normalizedValue: normalized, error: 'invalid_checksum' };
  }

  return { valid: true, country: 'VE', normalizedValue: normalized };
}
