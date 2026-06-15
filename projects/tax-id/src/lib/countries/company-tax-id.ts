import { TaxIdValidationResult } from '../models';

// Company / entity tax identifiers with public check-digit algorithms.
// Each is sourced from official documentation; see docs/COUNTRY-COVERAGE.md.

function compact(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number'
    ? String(value).trim().replace(/[\s./-]+/g, '').toUpperCase()
    : '';
}

// Brazil CNPJ: 14 digits, two modulo-11 check digits over the first 12.
export function validateBrazilianCnpj(value: unknown): TaxIdValidationResult {
  const n = compact(value);
  const base = { country: 'BR', normalizedValue: n } as const;
  if (!n) return { ...base, valid: false, error: 'empty' };
  if (n.length !== 14) return { ...base, valid: false, error: 'invalid_length' };
  if (!/^\d{14}$/.test(n) || /^(\d)\1{13}$/.test(n)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }
  const checkDigit = (length: number): number => {
    let weight = length - 7;
    let sum = 0;
    for (let i = 0; i < length; i += 1) {
      sum += Number(n[i]) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  return Number(n[12]) === checkDigit(12) && Number(n[13]) === checkDigit(13)
    ? { ...base, valid: true, validationLevel: 'checksum' }
    : { ...base, valid: false, error: 'invalid_checksum' };
}

// India GSTIN: 15 chars (state + PAN + entity + 'Z' + check), modulo-36 check.
const GSTIN_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const GSTIN_PATTERN = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export function validateIndianGstin(value: unknown): TaxIdValidationResult {
  const n = compact(value);
  const base = { country: 'IN', normalizedValue: n } as const;
  if (!n) return { ...base, valid: false, error: 'empty' };
  if (n.length !== 15) return { ...base, valid: false, error: 'invalid_length' };
  if (!GSTIN_PATTERN.test(n)) return { ...base, valid: false, error: 'invalid_format' };

  let factor = 2;
  let sum = 0;
  for (let i = 13; i >= 0; i -= 1) {
    const codePoint = GSTIN_ALPHABET.indexOf(n[i]);
    const addend = factor * codePoint;
    factor = factor === 2 ? 1 : 2;
    sum += Math.floor(addend / 36) + (addend % 36);
  }
  const expected = GSTIN_ALPHABET[(36 - (sum % 36)) % 36];
  return n[14] === expected
    ? { ...base, valid: true, validationLevel: 'checksum' }
    : { ...base, valid: false, error: 'invalid_checksum' };
}

// ISO 7064 MOD 11,10 checksum: a valid number (incl. its check digit) yields 1.
function iso7064Mod11_10(digits: string): number {
  let check = 5;
  for (const ch of digits) check = (((check || 10) * 2) % 11 + Number(ch)) % 10;
  return check;
}

// Serbia PIB: 9 digits, ISO 7064 MOD 11,10 check digit.
// Source: Serbian Tax Administration; python-stdnum. Verified: 101134702.
export function validateSerbianPib(value: unknown): TaxIdValidationResult {
  const n = compact(value);
  const base = { country: 'RS', normalizedValue: n } as const;
  if (!n) return { ...base, valid: false, error: 'empty' };
  if (n.length !== 9) return { ...base, valid: false, error: 'invalid_length' };
  if (!/^\d{9}$/.test(n)) return { ...base, valid: false, error: 'invalid_format' };
  return iso7064Mod11_10(n) === 1
    ? { ...base, valid: true, validationLevel: 'checksum' }
    : { ...base, valid: false, error: 'invalid_checksum' };
}

// South Korea Business Registration Number: 10 digits, NTS weighted check.
// Source: NTS; DataPrep. Verified: 1348672683.
export function validateKoreanBrn(value: unknown): TaxIdValidationResult {
  const n = compact(value);
  const base = { country: 'KR', normalizedValue: n } as const;
  if (!n) return { ...base, valid: false, error: 'empty' };
  if (n.length !== 10) return { ...base, valid: false, error: 'invalid_length' };
  if (!/^\d{10}$/.test(n)) return { ...base, valid: false, error: 'invalid_format' };

  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = weights.reduce((total, w, i) => total + Number(n[i]) * w, 0);
  sum += Math.floor((Number(n[8]) * 5) / 10);
  const expected = (10 - (sum % 10)) % 10;
  return Number(n[9]) === expected
    ? { ...base, valid: true, validationLevel: 'checksum' }
    : { ...base, valid: false, error: 'invalid_checksum' };
}

// Japan Corporate Number (Houjin Bangō): 13 digits = 1 check digit + 12-digit
// base. Check = 9 - ((Σ Pn·Qn) mod 9), Pn from the right, Qn = 1 (odd) / 2 (even).
// Source: MOF Ordinance No. 70 of 2014. Verified: 5835678256246 valid.
export function validateJapaneseCorporateNumber(value: unknown): TaxIdValidationResult {
  const n = compact(value);
  const base = { country: 'JP', normalizedValue: n } as const;
  if (!n) return { ...base, valid: false, error: 'empty' };
  if (n.length !== 13) return { ...base, valid: false, error: 'invalid_length' };
  if (!/^[1-9]\d{12}$/.test(n)) return { ...base, valid: false, error: 'invalid_format' };

  const body = n.slice(1);
  let sum = 0;
  for (let i = 0; i < 12; i += 1) {
    const positionFromRight = 12 - i; // n=1 is the rightmost base digit
    const weight = positionFromRight % 2 === 1 ? 1 : 2;
    sum += Number(body[i]) * weight;
  }
  const expected = 9 - (sum % 9);
  return Number(n[0]) === expected
    ? { ...base, valid: true, validationLevel: 'checksum' }
    : { ...base, valid: false, error: 'invalid_checksum' };
}

// Turkey VKN (Vergi Kimlik Numarası): 10 digits, NTA weighted algorithm.
// Source: python-stdnum tr.vkn. Verified: 4540536920 valid.
export function validateTurkishVkn(value: unknown): TaxIdValidationResult {
  const n = compact(value);
  const base = { country: 'TR', normalizedValue: n } as const;
  if (!n) return { ...base, valid: false, error: 'empty' };
  if (n.length !== 10) return { ...base, valid: false, error: 'invalid_length' };
  if (!/^\d{10}$/.test(n)) return { ...base, valid: false, error: 'invalid_format' };

  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    const c1 = (Number(n[i]) + 9 - i) % 10;
    let c2 = (c1 * 2 ** (9 - i)) % 9;
    if (c1 !== 0 && c2 === 0) c2 = 9;
    sum += c2;
  }
  const expected = (10 - (sum % 10)) % 10;
  return Number(n[9]) === expected
    ? { ...base, valid: true, validationLevel: 'checksum' }
    : { ...base, valid: false, error: 'invalid_checksum' };
}

// China USCC (Unified Social Credit Code): 18 chars, ISO 7064 MOD 31-3.
// Charset excludes I, O, S, V, Z. Source: GB 32100-2015.
const USCC_ALPHABET = '0123456789ABCDEFGHJKLMNPQRTUWXY';
const USCC_WEIGHTS = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28];
const USCC_PATTERN = /^[0-9ABCDEFGHJKLMNPQRTUWXY]{18}$/;

export function validateChineseUscc(value: unknown): TaxIdValidationResult {
  const n = compact(value);
  const base = { country: 'CN', normalizedValue: n } as const;
  if (!n) return { ...base, valid: false, error: 'empty' };
  if (n.length !== 18) return { ...base, valid: false, error: 'invalid_length' };
  if (!USCC_PATTERN.test(n)) return { ...base, valid: false, error: 'invalid_format' };

  let sum = 0;
  for (let i = 0; i < 17; i += 1) sum += USCC_ALPHABET.indexOf(n[i]) * USCC_WEIGHTS[i];
  const remainder = 31 - (sum % 31);
  const expected = USCC_ALPHABET[remainder === 31 ? 0 : remainder];
  return n[17] === expected
    ? { ...base, valid: true, validationLevel: 'checksum' }
    : { ...base, valid: false, error: 'invalid_checksum' };
}

// Australia ACN: 9-digit company number, modulo-10 weighted check (ASIC).
export function validateAustralianAcn(value: unknown): TaxIdValidationResult {
  const n = compact(value);
  const base = { country: 'AU', normalizedValue: n } as const;
  if (!n) return { ...base, valid: false, error: 'empty' };
  if (n.length !== 9) return { ...base, valid: false, error: 'invalid_length' };
  if (!/^\d{9}$/.test(n)) return { ...base, valid: false, error: 'invalid_format' };

  const weights = [8, 7, 6, 5, 4, 3, 2, 1];
  const sum = weights.reduce((total, weight, i) => total + Number(n[i]) * weight, 0);
  const expected = (10 - (sum % 10)) % 10;
  return Number(n[8]) === expected
    ? { ...base, valid: true, validationLevel: 'checksum' }
    : { ...base, valid: false, error: 'invalid_checksum' };
}

// France SIREN: nine digits identifying a legal unit. INSEE documents the
// ninth digit as a control digit but does not publish its calculation on the
// cited definition page, so the public rule deliberately remains format-only.
export function validateFrenchSiren(value: unknown): TaxIdValidationResult {
  const n = compact(value);
  const base = { country: 'FR', normalizedValue: n } as const;
  if (!n) return { ...base, valid: false, error: 'empty' };
  if (n.length !== 9) return { ...base, valid: false, error: 'invalid_length' };
  if (!/^\d{9}$/.test(n) || n === '000000000') {
    return { ...base, valid: false, error: 'invalid_format' };
  }
  return { ...base, valid: true, validationLevel: 'format' };
}

// United States EIN: IRS Publication 1635 defines a nine-digit identifier
// printed as XX-XXXXXXX. No offline checksum is claimed.
export function validateUnitedStatesEin(value: unknown): TaxIdValidationResult {
  const n = compact(value);
  const base = { country: 'US', normalizedValue: n } as const;
  if (!n) return { ...base, valid: false, error: 'empty' };
  if (n.length !== 9) return { ...base, valid: false, error: 'invalid_length' };
  if (!/^\d{9}$/.test(n) || n === '000000000') {
    return { ...base, valid: false, error: 'invalid_format' };
  }
  return { ...base, valid: true, validationLevel: 'format' };
}
