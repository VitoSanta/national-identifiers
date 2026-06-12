import { TaxIdValidationResult } from '../models';

export function validateMexicanTaxId(value: unknown): TaxIdValidationResult {
  const normalized = typeof value === 'string' ? value.replace(/[- ]/g, '').trim().toUpperCase() : '';

  if (!normalized) {
    return { valid: false, country: 'MX', normalizedValue: normalized, error: 'empty' };
  }

  // Personal RFC is 13 characters: 4 letters, 6 numbers, 3 alphanumeric.
  // We'll also accept 12 characters for entities if it happens (3 letters, 6 numbers, 3 alphanumeric).
  if (normalized.length !== 12 && normalized.length !== 13) {
    return { valid: false, country: 'MX', normalizedValue: normalized, error: 'invalid_length' };
  }

  const rfcFormat = /^([A-ZÑ&]{3,4})([0-9]{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12][0-9]|3[01]))([A-Z0-9]{2})([A-Z0-9])$/;
  if (!rfcFormat.test(normalized)) {
    return { valid: false, country: 'MX', normalizedValue: normalized, error: 'invalid_format' };
  }

  // Dictionary mapping for RFC check digit
  const charValues: Record<string, number> = {
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15, 'G': 16, 'H': 17, 'I': 18, 'J': 19,
    'K': 20, 'L': 21, 'M': 22, 'N': 23, 'O': 25, 'P': 26, 'Q': 27, 'R': 28, 'S': 29, 'T': 30,
    'U': 31, 'V': 32, 'W': 33, 'X': 34, 'Y': 35, 'Z': 36, '&': 24, 'Ñ': 38, ' ': 37
  };

  // The actual weights differ slightly depending on length.
  // For 13 chars, the 1st char has weight 13.
  // For 12 chars, the string is padded with a space at the beginning, so weight 14 is a space, etc.
  // A universal way to calculate:
  let strToCalculate = normalized;
  if (strToCalculate.length === 12) {
    strToCalculate = ' ' + strToCalculate;
  }

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const char = strToCalculate[i];
    const value = charValues[char] ?? 0;
    sum += value * (13 - i);
  }

  const remainder = sum % 11;
  let expectedCheckDigit: string;

  if (remainder === 0) {
    expectedCheckDigit = '0';
  } else {
    const calc = 11 - remainder;
    if (calc === 10) {
      expectedCheckDigit = 'A';
    } else {
      expectedCheckDigit = calc.toString();
    }
  }

  const actualCheckDigit = normalized[normalized.length - 1];

  if (actualCheckDigit !== expectedCheckDigit) {
    return { valid: false, country: 'MX', normalizedValue: normalized, error: 'invalid_checksum' };
  }

  return { valid: true, country: 'MX', normalizedValue: normalized };
}
