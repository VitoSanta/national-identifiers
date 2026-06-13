import type { TaxIdValidationResult } from '../models';
import { validateBirthNumber } from './birth-number';

function compactVat(value: unknown, prefixes: readonly string[]): string {
  if (typeof value !== 'string' && typeof value !== 'number') return '';
  let normalized = String(value).trim().replace(/[\s./-]+/g, '').toUpperCase();
  const prefix = prefixes.find((candidate) => normalized.startsWith(candidate));
  if (prefix) normalized = normalized.slice(prefix.length);
  return normalized;
}

function failure(
  country: string,
  normalizedValue: string,
  error: 'empty' | 'invalid_length' | 'invalid_format' | 'invalid_checksum',
): TaxIdValidationResult {
  return { valid: false, country, normalizedValue, error };
}

function success(country: string, normalizedValue: string): TaxIdValidationResult {
  return { valid: true, country, normalizedValue, validationLevel: 'checksum' };
}

function weightedSum(value: string, weights: readonly number[]): number {
  return [...value].reduce(
    (sum, digit, index) => sum + Number(digit) * weights[index],
    0,
  );
}

export function validateAustrianVat(value: unknown): TaxIdValidationResult {
  const n = compactVat(value, ['AT']);
  const digits = n.startsWith('U') ? n.slice(1) : n;
  if (!digits) return failure('AT', digits, 'empty');
  if (digits.length !== 8) return failure('AT', digits, 'invalid_length');
  if (!/^\d{8}$/.test(digits)) return failure('AT', digits, 'invalid_format');
  const sum = [...digits.slice(0, 7)].reduce((total, digit, index) => {
    const product = Number(digit) * (index % 2 === 0 ? 1 : 2);
    return total + Math.floor(product / 10) + (product % 10);
  }, 0);
  const expected = (10 - ((sum + 4) % 10)) % 10;
  return Number(digits[7]) === expected
    ? success('AT', `U${digits}`)
    : failure('AT', `U${digits}`, 'invalid_checksum');
}

export function validateBelgianVat(value: unknown): TaxIdValidationResult {
  const n = compactVat(value, ['BE']);
  if (!n) return failure('BE', n, 'empty');
  if (n.length !== 10) return failure('BE', n, 'invalid_length');
  if (!/^[01]\d{9}$/.test(n)) return failure('BE', n, 'invalid_format');
  const expected = 97 - (Number(n.slice(0, 8)) % 97);
  return Number(n.slice(8)) === expected
    ? success('BE', n)
    : failure('BE', n, 'invalid_checksum');
}

export function validateBulgarianVat(value: unknown): TaxIdValidationResult {
  const n = compactVat(value, ['BG']);
  if (!n) return failure('BG', n, 'empty');
  if (n.length !== 9 && n.length !== 10) return failure('BG', n, 'invalid_length');
  if (!/^\d+$/.test(n)) return failure('BG', n, 'invalid_format');

  if (n.length === 9) {
    // EIK / Bulstat (legal entity): two-pass modulo 11.
    let check = weightedSum(n.slice(0, 8), [1, 2, 3, 4, 5, 6, 7, 8]) % 11;
    if (check === 10) {
      check = weightedSum(n.slice(0, 8), [3, 4, 5, 6, 7, 8, 9, 10]) % 11;
      if (check === 10) check = 0;
    }
    return Number(n[8]) === check
      ? success('BG', n)
      : failure('BG', n, 'invalid_checksum');
  }

  // 10-digit sole trader: the check digit is the EGN check. Foreigner (PNF)
  // and miscellaneous 10-digit variants are not covered (see KNOWN-LIMITATIONS).
  let egn = weightedSum(n.slice(0, 9), [2, 4, 8, 5, 10, 9, 7, 3, 6]) % 11;
  if (egn === 10) egn = 0;
  return Number(n[9]) === egn
    ? success('BG', n)
    : failure('BG', n, 'invalid_checksum');
}

export function validateGermanVat(value: unknown): TaxIdValidationResult {
  const n = compactVat(value, ['DE']);
  if (!n) return failure('DE', n, 'empty');
  if (n.length !== 9) return failure('DE', n, 'invalid_length');
  if (!/^[1-9]\d{8}$/.test(n)) return failure('DE', n, 'invalid_format');

  let product = 10;
  for (let index = 0; index < 8; index += 1) {
    let sum = (Number(n[index]) + product) % 10;
    if (sum === 0) sum = 10;
    product = (2 * sum) % 11;
  }
  let expected = 11 - product;
  if (expected === 10) expected = 0;

  return Number(n[8]) === expected
    ? success('DE', n)
    : failure('DE', n, 'invalid_checksum');
}

export function validateFrenchVat(value: unknown): TaxIdValidationResult {
  const n = compactVat(value, ['FR']);
  if (!n) return failure('FR', n, 'empty');
  if (n.length !== 11) return failure('FR', n, 'invalid_length');
  if (!/^\d{11}$/.test(n)) return failure('FR', n, 'invalid_format');
  const siren = Number(n.slice(2));
  if (siren === 0) return failure('FR', n, 'invalid_format');
  const expected = (12 + 3 * (siren % 97)) % 97;
  return Number(n.slice(0, 2)) === expected
    ? success('FR', n)
    : failure('FR', n, 'invalid_checksum');
}

export function validateDutchVat(value: unknown): TaxIdValidationResult {
  const n = compactVat(value, ['NL']);
  if (!n) return failure('NL', n, 'empty');
  if (n.length !== 12) return failure('NL', n, 'invalid_length');
  if (!/^\d{9}B\d{2}$/.test(n)) return failure('NL', n, 'invalid_format');
  const weighted = [...n.slice(0, 9)].reduce(
    (sum, digit, index) => sum + Number(digit) * (index === 8 ? -1 : 9 - index),
    0,
  );
  return weighted !== 0 && weighted % 11 === 0
    ? success('NL', n)
    : failure('NL', n, 'invalid_checksum');
}

export function validatePolishVat(value: unknown): TaxIdValidationResult {
  const n = compactVat(value, ['PL']);
  if (!n) return failure('PL', n, 'empty');
  if (n.length !== 10) return failure('PL', n, 'invalid_length');
  if (!/^\d{10}$/.test(n) || n === '0000000000') return failure('PL', n, 'invalid_format');
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  const expected = [...n.slice(0, 9)].reduce(
    (sum, digit, index) => sum + Number(digit) * weights[index],
    0,
  ) % 11;
  return expected !== 10 && Number(n[9]) === expected
    ? success('PL', n)
    : failure('PL', n, 'invalid_checksum');
}

export function validateDanishVat(value: unknown): TaxIdValidationResult {
  const n = compactVat(value, ['DK']);
  if (!n) return failure('DK', n, 'empty');
  if (n.length !== 8) return failure('DK', n, 'invalid_length');
  if (!/^\d{8}$/.test(n) || n === '00000000') return failure('DK', n, 'invalid_format');
  return weightedSum(n, [2, 7, 6, 5, 4, 3, 2, 1]) % 11 === 0
    ? success('DK', n)
    : failure('DK', n, 'invalid_checksum');
}

export function validateEstonianVat(value: unknown): TaxIdValidationResult {
  const n = compactVat(value, ['EE']);
  if (!n) return failure('EE', n, 'empty');
  if (n.length !== 9) return failure('EE', n, 'invalid_length');
  if (!/^\d{9}$/.test(n) || n === '000000000') return failure('EE', n, 'invalid_format');
  return weightedSum(n, [3, 7, 1, 3, 7, 1, 3, 7, 1]) % 10 === 0
    ? success('EE', n)
    : failure('EE', n, 'invalid_checksum');
}

export function validateFinnishVat(value: unknown): TaxIdValidationResult {
  const n = compactVat(value, ['FI']);
  if (!n) return failure('FI', n, 'empty');
  if (n.length !== 8) return failure('FI', n, 'invalid_length');
  if (!/^\d{8}$/.test(n) || n === '00000000') return failure('FI', n, 'invalid_format');
  const remainder = weightedSum(n.slice(0, 7), [7, 9, 10, 5, 8, 4, 2]) % 11;
  if (remainder === 1) return failure('FI', n, 'invalid_checksum');
  const expected = remainder === 0 ? 0 : 11 - remainder;
  return Number(n[7]) === expected
    ? success('FI', n)
    : failure('FI', n, 'invalid_checksum');
}

export function validateHungarianVat(value: unknown): TaxIdValidationResult {
  const n = compactVat(value, ['HU']);
  if (!n) return failure('HU', n, 'empty');
  if (n.length !== 8) return failure('HU', n, 'invalid_length');
  if (!/^\d{8}$/.test(n) || n === '00000000') return failure('HU', n, 'invalid_format');
  const expected = (10 - (weightedSum(n.slice(0, 7), [9, 7, 3, 1, 9, 7, 3]) % 10)) % 10;
  return Number(n[7]) === expected
    ? success('HU', n)
    : failure('HU', n, 'invalid_checksum');
}

export function validateLuxembourgVat(value: unknown): TaxIdValidationResult {
  const n = compactVat(value, ['LU']);
  if (!n) return failure('LU', n, 'empty');
  if (n.length !== 8) return failure('LU', n, 'invalid_length');
  if (!/^\d{8}$/.test(n) || n === '00000000') return failure('LU', n, 'invalid_format');
  return Number(n.slice(6)) === Number(n.slice(0, 6)) % 89
    ? success('LU', n)
    : failure('LU', n, 'invalid_checksum');
}

export function validateSwedishVat(value: unknown): TaxIdValidationResult {
  const n = compactVat(value, ['SE']);
  if (!n) return failure('SE', n, 'empty');
  if (n.length !== 12) return failure('SE', n, 'invalid_length');
  if (!/^\d{10}01$/.test(n) || /^0{10}/.test(n)) return failure('SE', n, 'invalid_format');
  const sum = [...n.slice(0, 10)].reduce((total, digit, index) => {
    const product = Number(digit) * (index % 2 === 0 ? 2 : 1);
    return total + (product > 9 ? product - 9 : product);
  }, 0);
  return sum % 10 === 0
    ? success('SE', n)
    : failure('SE', n, 'invalid_checksum');
}

export function validateSlovenianVat(value: unknown): TaxIdValidationResult {
  const n = compactVat(value, ['SI']);
  if (!n) return failure('SI', n, 'empty');
  if (n.length !== 8) return failure('SI', n, 'invalid_length');
  if (!/^[1-9]\d{7}$/.test(n)) return failure('SI', n, 'invalid_format');
  const remainder = 11 - (weightedSum(n.slice(0, 7), [8, 7, 6, 5, 4, 3, 2]) % 11);
  if (remainder === 11) return failure('SI', n, 'invalid_checksum');
  const expected = remainder === 10 ? 0 : remainder;
  return Number(n[7]) === expected
    ? success('SI', n)
    : failure('SI', n, 'invalid_checksum');
}

export function validateSlovakVat(value: unknown): TaxIdValidationResult {
  const n = compactVat(value, ['SK']);
  if (!n) return failure('SK', n, 'empty');
  if (n.length !== 10) return failure('SK', n, 'invalid_length');
  if (!/^[1-9]\d{9}$/.test(n)) return failure('SK', n, 'invalid_format');
  return BigInt(n) % 11n === 0n
    ? success('SK', n)
    : failure('SK', n, 'invalid_checksum');
}

export function validateCypriotVat(value: unknown): TaxIdValidationResult {
  const n = compactVat(value, ['CY']);
  if (!n) return failure('CY', n, 'empty');
  if (n.length !== 9) return failure('CY', n, 'invalid_length');
  if (!/^\d{8}[A-Z]$/.test(n) || /^0{8}/.test(n)) return failure('CY', n, 'invalid_format');
  const substitutions = [1, 0, 5, 7, 9, 13, 15, 17, 19, 21];
  const sum = [...n.slice(0, 8)].reduce(
    (total, digit, index) =>
      total + (index % 2 === 0 ? substitutions[Number(digit)] : Number(digit)),
    0,
  );
  const expected = String.fromCharCode(65 + (sum % 26));
  return n[8] === expected
    ? success('CY', n)
    : failure('CY', n, 'invalid_checksum');
}

export function validateSpanishVat(value: unknown): TaxIdValidationResult {
  const n = compactVat(value, ['ES']);
  if (!n) return failure('ES', n, 'empty');
  if (n.length !== 9) return failure('ES', n, 'invalid_length');

  if (/^(\d{8}|[XYZ]\d{7})[A-Z]$/.test(n)) {
    const numeric = n.slice(0, 8).replace('X', '0').replace('Y', '1').replace('Z', '2');
    const expected = 'TRWAGMYFPDXBNJZSQVHLCKE'[Number(numeric) % 23];
    return n[8] === expected
      ? success('ES', n)
      : failure('ES', n, 'invalid_checksum');
  }

  if (!/^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/.test(n)) {
    return failure('ES', n, 'invalid_format');
  }
  let sum = 0;
  for (let index = 1; index <= 7; index += 1) {
    const digit = Number(n[index]);
    if (index % 2 === 0) {
      sum += digit;
    } else {
      const doubled = digit * 2;
      sum += Math.floor(doubled / 10) + (doubled % 10);
    }
  }
  const controlDigit = (10 - (sum % 10)) % 10;
  const controlLetter = 'JABCDEFGHI'[controlDigit];
  const actual = n[8];
  const valid = /^[ABEH]$/.test(n[0])
    ? actual === String(controlDigit)
    : /^[KPQS]$/.test(n[0])
      ? actual === controlLetter
      : actual === String(controlDigit) || actual === controlLetter;
  return valid
    ? success('ES', n)
    : failure('ES', n, 'invalid_checksum');
}

export function validateLithuanianVat(value: unknown): TaxIdValidationResult {
  const n = compactVat(value, ['LT']);
  if (!n) return failure('LT', n, 'empty');
  if (n.length !== 9 && n.length !== 12) return failure('LT', n, 'invalid_length');
  if (!/^\d+$/.test(n) || /^0+$/.test(n)) return failure('LT', n, 'invalid_format');
  const firstWeights = n.length === 9
    ? [1, 2, 3, 4, 5, 6, 7, 8]
    : [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2];
  const secondWeights = n.length === 9
    ? [3, 4, 5, 6, 7, 8, 9, 1]
    : [3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4];
  const base = n.slice(0, -1);
  let expected = weightedSum(base, firstWeights) % 11;
  if (expected === 10) expected = weightedSum(base, secondWeights) % 11;
  if (expected === 10) expected = 0;
  return Number(n[n.length - 1]) === expected
    ? success('LT', n)
    : failure('LT', n, 'invalid_checksum');
}

export function validateLatvianVat(value: unknown): TaxIdValidationResult {
  const n = compactVat(value, ['LV']);
  if (!n) return failure('LV', n, 'empty');
  if (n.length !== 11) return failure('LV', n, 'invalid_length');
  if (!/^\d{11}$/.test(n) || Number(n.slice(0, 2)) <= 31) {
    return failure('LV', n, 'invalid_format');
  }
  const sum = weightedSum(n.slice(0, 10), [9, 1, 4, 8, 3, 10, 2, 5, 7, 6]);
  let expected = 3 - (sum % 11);
  if (expected < -1) expected += 11;
  if (expected === -1) expected = 0;
  return Number(n[10]) === expected
    ? success('LV', n)
    : failure('LV', n, 'invalid_checksum');
}

export function validateMalteseVat(value: unknown): TaxIdValidationResult {
  const n = compactVat(value, ['MT']);
  if (!n) return failure('MT', n, 'empty');
  if (n.length !== 8) return failure('MT', n, 'invalid_length');
  if (!/^[1-9]\d{7}$/.test(n)) return failure('MT', n, 'invalid_format');
  const expected = 37 - (weightedSum(n.slice(0, 6), [3, 4, 6, 7, 8, 9]) % 37);
  return Number(n.slice(6)) === expected
    ? success('MT', n)
    : failure('MT', n, 'invalid_checksum');
}

export function validateRomanianVat(value: unknown): TaxIdValidationResult {
  const n = compactVat(value, ['RO']);
  if (!n) return failure('RO', n, 'empty');
  if (n.length < 2 || n.length > 10) return failure('RO', n, 'invalid_length');
  if (!/^[1-9]\d+$/.test(n)) return failure('RO', n, 'invalid_format');
  const padded = n.padStart(10, '0');
  let expected = (weightedSum(padded.slice(0, 9), [7, 5, 3, 2, 1, 7, 5, 3, 2]) * 10) % 11;
  if (expected === 10) expected = 0;
  return Number(padded[9]) === expected
    ? success('RO', n)
    : failure('RO', n, 'invalid_checksum');
}

export function validateCzechVat(value: unknown): TaxIdValidationResult {
  const n = compactVat(value, ['CZ']);
  if (!n) return failure('CZ', n, 'empty');
  if (![8, 9, 10].includes(n.length)) return failure('CZ', n, 'invalid_length');
  if (!/^\d+$/.test(n) || /^0+$/.test(n)) return failure('CZ', n, 'invalid_format');

  if (n.length === 8) {
    const sum = weightedSum(n.slice(0, 7), [8, 7, 6, 5, 4, 3, 2]);
    const expected = (11 - (sum % 11)) % 10;
    return Number(n[7]) === expected
      ? success('CZ', n)
      : failure('CZ', n, 'invalid_checksum');
  }

  return validateBirthNumber('CZ', n);
}

export function validateAustralianVat(value: unknown): TaxIdValidationResult {
  const n = compactVat(value, ['AU']);
  if (!n) return failure('AU', n, 'empty');
  if (n.length !== 11) return failure('AU', n, 'invalid_length');
  if (!/^[1-9]\d{10}$/.test(n)) return failure('AU', n, 'invalid_format');
  const digits = [...n].map(Number);
  digits[0] -= 1;
  const valid = weightedSum(digits.join(''), [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19]) % 89 === 0;
  return valid
    ? success('AU', n)
    : failure('AU', n, 'invalid_checksum');
}

export function validateSwissVat(value: unknown): TaxIdValidationResult {
  let n = compactVat(value, ['CHE', 'CH']);
  for (const suffix of ['MWST', 'TVA', 'IVA']) {
    if (n.endsWith(suffix)) n = n.slice(0, -suffix.length);
  }
  if (!n) return failure('CH', n, 'empty');
  if (n.length !== 9) return failure('CH', n, 'invalid_length');
  if (!/^[1-9]\d{8}$/.test(n)) return failure('CH', n, 'invalid_format');
  let expected = 11 - (weightedSum(n.slice(0, 8), [5, 4, 3, 2, 7, 6, 5, 4]) % 11);
  if (expected === 11) expected = 0;
  if (expected === 10) return failure('CH', n, 'invalid_checksum');
  return Number(n[8]) === expected
    ? success('CH', `CHE${n}`)
    : failure('CH', `CHE${n}`, 'invalid_checksum');
}

export function validateNorwegianVat(value: unknown): TaxIdValidationResult {
  let n = compactVat(value, ['NO']);
  if (n.endsWith('MVA')) n = n.slice(0, -3);
  if (!n) return failure('NO', n, 'empty');
  if (n.length !== 9) return failure('NO', n, 'invalid_length');
  if (!/^[1-9]\d{8}$/.test(n)) return failure('NO', n, 'invalid_format');
  let expected = 11 - (weightedSum(n.slice(0, 8), [3, 2, 7, 6, 5, 4, 3, 2]) % 11);
  if (expected === 11) expected = 0;
  if (expected === 10) return failure('NO', n, 'invalid_checksum');
  return Number(n[8]) === expected
    ? success('NO', n)
    : failure('NO', n, 'invalid_checksum');
}

export function validateBritishVat(value: unknown): TaxIdValidationResult {
  const n = compactVat(value, ['GB']);
  if (!n) return failure('GB', n, 'empty');

  if (/^GD\d{3}$/.test(n)) {
    return Number(n.slice(2)) <= 499
      ? { valid: true, country: 'GB', normalizedValue: n, validationLevel: 'format' }
      : failure('GB', n, 'invalid_format');
  }
  if (/^HA\d{3}$/.test(n)) {
    const authority = Number(n.slice(2));
    return authority >= 500
      ? { valid: true, country: 'GB', normalizedValue: n, validationLevel: 'format' }
      : failure('GB', n, 'invalid_format');
  }
  if (n.length !== 9 && n.length !== 12) return failure('GB', n, 'invalid_length');
  if (!/^\d+$/.test(n)) return failure('GB', n, 'invalid_format');
  const base = n.slice(0, 9);
  const sum = weightedSum(base.slice(0, 7), [8, 7, 6, 5, 4, 3, 2])
    + Number(base.slice(7));
  return sum % 97 === 0 || (sum + 55) % 97 === 0
    ? success('GB', n)
    : failure('GB', n, 'invalid_checksum');
}
