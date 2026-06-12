import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

const ODD_VALUES: Readonly<Record<string, number>> = {
  '0': 1,
  '1': 0,
  '2': 5,
  '3': 7,
  '4': 9,
  '5': 13,
  '6': 15,
  '7': 17,
  '8': 19,
  '9': 21,
  A: 1,
  B: 0,
  C: 5,
  D: 7,
  E: 9,
  F: 13,
  G: 15,
  H: 17,
  I: 19,
  J: 21,
  K: 2,
  L: 4,
  M: 18,
  N: 20,
  O: 11,
  P: 3,
  Q: 6,
  R: 8,
  S: 12,
  T: 14,
  U: 16,
  V: 10,
  W: 22,
  X: 25,
  Y: 24,
  Z: 23,
};

const PERSONAL_TAX_ID_PATTERN =
  /^[A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]$/;

export function validateItalianFiscalCode(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = {
    country: 'IT',
    normalizedValue,
  } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length === 11) {
    return validateItalianVatNumber(normalizedValue, base);
  }

  if (normalizedValue.length !== 16) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!PERSONAL_TAX_ID_PATTERN.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const expectedCheckCharacter = calculateItalianFiscalCodeCheckCharacter(
    normalizedValue.slice(0, 15),
  );

  if (normalizedValue[15] !== expectedCheckCharacter) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true };
}

// Numeric tax IDs (partita IVA and the fiscal code assigned to legal
// entities) share the same 11-digit layout and Luhn-style check digit.
function validateItalianVatNumber(
  normalizedValue: string,
  base: { readonly country: string; readonly normalizedValue: string },
): TaxIdValidationResult {
  if (!/^\d{11}$/.test(normalizedValue) || normalizedValue === '00000000000') {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  let sum = 0;

  for (let index = 0; index < 11; index += 1) {
    const digit = normalizedValue.charCodeAt(index) - 48;

    if (index % 2 === 0) {
      sum += digit;
      continue;
    }

    const doubled = digit * 2;
    sum += doubled > 9 ? doubled - 9 : doubled;
  }

  if (sum % 10 !== 0) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true };
}

export function calculateItalianFiscalCodeCheckCharacter(first15Characters: string): string {
  const value = first15Characters.toUpperCase();

  if (!/^[A-Z0-9]{15}$/.test(value)) {
    throw new Error('The Italian fiscal code checksum requires exactly 15 alphanumeric characters.');
  }

  let sum = 0;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];

    if (index % 2 === 0) {
      sum += ODD_VALUES[character];
      continue;
    }

    sum += character >= '0' && character <= '9'
      ? Number(character)
      : character.charCodeAt(0) - 65;
  }

  return String.fromCharCode(65 + (sum % 26));
}
