import { TaxIdValidationResult } from '../models';

const CONTROL_CHARACTERS = '0123456789ABCDEFHJKLMNPRSTUVWXY';
const CENTURY_BY_MARKER: Readonly<Record<string, number>> = {
  '+': 1800,
  '-': 1900,
  U: 1900,
  V: 1900,
  W: 1900,
  X: 1900,
  Y: 1900,
  A: 2000,
  B: 2000,
  C: 2000,
  D: 2000,
  E: 2000,
  F: 2000,
};

export function validateFinnishTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeFinnishTaxId(value);
  const base = {
    country: 'FI',
    normalizedValue,
  } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 11) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{6}[+\-ABCDEFUVWXY]\d{3}[0-9ABCDEFHJKLMNPRSTUVWXY]$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const day = Number(normalizedValue.slice(0, 2));
  const month = Number(normalizedValue.slice(2, 4));
  const year = CENTURY_BY_MARKER[normalizedValue[6]] + Number(normalizedValue.slice(4, 6));
  const individualNumber = Number(normalizedValue.slice(7, 10));

  if (!isValidDate(year, month, day) || individualNumber < 2) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const checksumInput = Number(normalizedValue.slice(0, 6) + normalizedValue.slice(7, 10));
  const expectedControlCharacter = CONTROL_CHARACTERS[checksumInput % 31];

  if (normalizedValue[10] !== expectedControlCharacter) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}

function normalizeFinnishTaxId(value: unknown): string {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return '';
  }

  return String(value).trim().replace(/\s+/g, '').toUpperCase();
}

function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
