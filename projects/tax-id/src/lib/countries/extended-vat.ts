import type { TaxIdValidationResult } from '../models';

// VAT / tax-number validators for jurisdictions outside the EU/EFTA core.
// Every algorithm is sourced from an institutional reference and cross-checked
// against a verifiable example from python-stdnum's test suite (the example is
// recorded next to each validator). Format-only countries are not added here:
// each validator below performs a real check-digit verification.

function compact(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number'
    ? String(value).trim().replace(/[\s./-]+/g, '').toUpperCase()
    : '';
}

function ok(country: string, n: string): TaxIdValidationResult {
  return { country, normalizedValue: n, valid: true, validationLevel: 'checksum' };
}

function bad(
  country: string,
  n: string,
  error: 'empty' | 'invalid_length' | 'invalid_format' | 'invalid_checksum',
): TaxIdValidationResult {
  return { country, normalizedValue: n, valid: false, error };
}

// Standard Luhn (ISO/IEC 7812) mod-10 check over a digit string.
function luhnValid(num: string): boolean {
  let sum = 0;
  let alternate = false;
  for (let i = num.length - 1; i >= 0; i -= 1) {
    let d = Number(num[i]);
    if (alternate) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

// Streaming modulo for long digit strings (avoids 2^53 precision loss).
function modString(digits: string, modulus: number): number {
  let r = 0;
  for (const ch of digits) r = (r * 10 + Number(ch)) % modulus;
  return r;
}

// Azerbaijan VÖEN: 10 digits, weighted mod-11 check at position 9; the trailing
// digit encodes legal status (1 legal / 2 natural). Verified: 1401555071.
export function validateAzerbaijaniVoen(value: unknown): TaxIdValidationResult {
  let n = compact(value);
  if (n.length === 9) n = `0${n}`;
  if (!n) return bad('AZ', n, 'empty');
  if (n.length !== 10) return bad('AZ', n, 'invalid_length');
  if (!/^\d{10}$/.test(n)) return bad('AZ', n, 'invalid_format');
  if (n[9] !== '1' && n[9] !== '2') return bad('AZ', n, 'invalid_format');
  const weights = [4, 1, 8, 6, 2, 7, 5, 3];
  let sum = 0;
  for (let i = 0; i < 8; i += 1) sum += Number(n[i]) * weights[i];
  return Number(n[8]) === sum % 11 ? ok('AZ', n) : bad('AZ', n, 'invalid_checksum');
}

// Dominican Republic RNC: 9 digits, weighted mod-11 check. Verified: 101850043.
const DO_RNC_WHITELIST = new Set([
  '101581601', '101582245', '101595422', '101595785', '10233317', '131188691',
  '401007374', '501341601', '501378067', '501620371', '501651319', '501651823',
  '501651845', '501651926', '501656006', '501658167', '501670785', '501676936',
  '501680158', '504654542', '504680029', '504681442', '505038691',
]);

export function validateDominicanRnc(value: unknown): TaxIdValidationResult {
  const n = compact(value);
  if (!n) return bad('DO', n, 'empty');
  if (!/^\d+$/.test(n)) return bad('DO', n, 'invalid_format');
  if (DO_RNC_WHITELIST.has(n)) return ok('DO', n);
  if (n.length !== 9) return bad('DO', n, 'invalid_length');
  const weights = [7, 9, 8, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 8; i += 1) sum += Number(n[i]) * weights[i];
  const expected = ((10 - (sum % 11)) % 9) + 1;
  return Number(n[8]) === expected ? ok('DO', n) : bad('DO', n, 'invalid_checksum');
}

// Ecuador cédula checksum (mod-10 with alternating 2,1 coefficients).
function ecCedulaValid(number: string): boolean {
  if (!/^\d{10}$/.test(number)) return false;
  const province = number.slice(0, 2);
  if ((province < '01' || province > '24') && province !== '30' && province !== '50') {
    return false;
  }
  if (number[2] > '6') return false;
  let sum = 0;
  for (let i = 0; i < 10; i += 1) {
    const coefficient = i % 2 === 0 ? 2 : 1;
    let product = coefficient * Number(number[i]);
    if (product > 9) product -= 9;
    sum += product;
  }
  return sum % 10 === 0;
}

function ecWeightedZero(number: string, weights: readonly number[]): boolean {
  let sum = 0;
  for (let i = 0; i < weights.length; i += 1) sum += weights[i] * Number(number[i]);
  return sum % 11 === 0;
}

// Ecuador RUC: 13 digits. Natural (3rd digit 0-5) reuses the cédula check plus a
// non-zero establishment; public (6) and juridical (9) use their own mod-11
// checks. Verified: 1792060346001.
export function validateEcuadorianRuc(value: unknown): TaxIdValidationResult {
  const n = compact(value);
  if (!n) return bad('EC', n, 'empty');
  if (n.length !== 13) return bad('EC', n, 'invalid_length');
  if (!/^\d{13}$/.test(n)) return bad('EC', n, 'invalid_format');
  const province = n.slice(0, 2);
  if ((province < '01' || province > '24') && province !== '30' && province !== '50') {
    return bad('EC', n, 'invalid_format');
  }
  const third = n[2];
  const natural = (): boolean => n.slice(10) !== '000' && ecCedulaValid(n.slice(0, 10));
  const publicEntity = (): boolean =>
    n.slice(9) !== '0000' && ecWeightedZero(n.slice(0, 9), [3, 2, 7, 6, 5, 4, 3, 2, 1]);
  const juridical = (): boolean =>
    n.slice(10) !== '000' &&
    ecWeightedZero(n.slice(0, 10), [4, 3, 2, 7, 6, 5, 4, 3, 2, 1]);

  let valid: boolean;
  if (third < '6') valid = natural();
  else if (third === '6') valid = publicEntity() || natural();
  else if (third === '9') valid = publicEntity() || juridical();
  else return bad('EC', n, 'invalid_format');
  return valid ? ok('EC', n) : bad('EC', n, 'invalid_checksum');
}

// Ghana TIN: prefix letter + 10 chars, weighted mod-11 check ('X' for 10).
// Verified: C0000803561.
export function validateGhanaTin(value: unknown): TaxIdValidationResult {
  const n = compact(value);
  if (!n) return bad('GH', n, 'empty');
  if (n.length !== 11) return bad('GH', n, 'invalid_length');
  if (!/^[PCGQV]00[A-Z0-9]{8}$/.test(n)) return bad('GH', n, 'invalid_format');
  const body = n.slice(1, 10);
  if (!/^\d{9}$/.test(body)) return bad('GH', n, 'invalid_format');
  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += (i + 1) * Number(body[i]);
  const remainder = sum % 11;
  const expected = remainder === 10 ? 'X' : String(remainder);
  return n[10] === expected ? ok('GH', n) : bad('GH', n, 'invalid_checksum');
}

// Guinea NIFp: 9 digits, Luhn check. Verified: 693770885.
export function validateGuineaNifp(value: unknown): TaxIdValidationResult {
  const n = compact(value);
  if (!n) return bad('GN', n, 'empty');
  if (n.length !== 9) return bad('GN', n, 'invalid_length');
  if (!/^\d{9}$/.test(n)) return bad('GN', n, 'invalid_format');
  return luhnValid(n) ? ok('GN', n) : bad('GN', n, 'invalid_checksum');
}

// Guatemala NIT: up to 12 chars, mod-11 check digit ('K' for 10), leading zeros
// dropped. Verified: 576937K and 71080.
export function validateGuatemalanNit(value: unknown): TaxIdValidationResult {
  const n = compact(value).replace(/^0+/, '');
  if (!n) return bad('GT', n, 'empty');
  if (n.length < 2 || n.length > 12) return bad('GT', n, 'invalid_length');
  const body = n.slice(0, -1);
  const check = n[n.length - 1];
  if (!/^\d+$/.test(body) || !/^[0-9K]$/.test(check)) return bad('GT', n, 'invalid_format');
  let sum = 0;
  for (let k = 0; k < body.length; k += 1) {
    sum += (k + 2) * Number(body[body.length - 1 - k]);
  }
  const c = (((-sum % 11) + 11) % 11);
  const expected = c === 10 ? 'K' : String(c);
  return check === expected ? ok('GT', n) : bad('GT', n, 'invalid_checksum');
}

// Morocco ICE: 15 digits, ISO 7064 MOD 97-10 (whole number divisible by 97).
// Verified: 001561191000066.
export function validateMoroccanIce(value: unknown): TaxIdValidationResult {
  const n = compact(value);
  if (!n) return bad('MA', n, 'empty');
  if (n.length !== 15) return bad('MA', n, 'invalid_length');
  if (!/^\d{15}$/.test(n)) return bad('MA', n, 'invalid_format');
  return modString(n, 97) === 0 ? ok('MA', n) : bad('MA', n, 'invalid_checksum');
}

// Monaco VAT: treated as a French TVA number whose SIREN block starts with 000.
// Verified: FR53000004605 (from 53 0000 04605).
export function validateMonacoVat(value: unknown): TaxIdValidationResult {
  let n = compact(value);
  if (n.startsWith('FR') || n.startsWith('MC')) n = n.slice(2);
  const normalized = `FR${n}`;
  if (!n) return bad('MC', normalized, 'empty');
  if (n.length !== 11) return bad('MC', normalized, 'invalid_length');
  if (!/^\d{11}$/.test(n)) return bad('MC', normalized, 'invalid_format');
  const key = n.slice(0, 2);
  const siren = n.slice(2);
  if (siren.slice(0, 3) !== '000') return bad('MC', normalized, 'invalid_format');
  const expected = (12 + 3 * (modString(siren, 97))) % 97;
  return Number(key) === expected
    ? ok('MC', normalized)
    : bad('MC', normalized, 'invalid_checksum');
}

// Montenegro PIB: 8 digits, weighted mod-11 check. Verified: 02655284.
export function validateMontenegrinPib(value: unknown): TaxIdValidationResult {
  const n = compact(value);
  if (!n) return bad('ME', n, 'empty');
  if (n.length !== 8) return bad('ME', n, 'invalid_length');
  if (!/^\d{8}$/.test(n)) return bad('ME', n, 'invalid_format');
  const weights = [8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 7; i += 1) sum += weights[i] * Number(n[i]);
  const expected = (((-sum % 11) + 11) % 11) % 10;
  return Number(n[7]) === expected ? ok('ME', n) : bad('ME', n, 'invalid_checksum');
}

// North Macedonia ЕДБ: 13 digits (optional MK prefix), weighted mod-11 check.
// Verified: 4030000375897.
export function validateMacedonianEdb(value: unknown): TaxIdValidationResult {
  let n = compact(value);
  if (n.startsWith('MK') || n.startsWith('МК')) n = n.slice(2);
  if (!n) return bad('MK', n, 'empty');
  if (n.length !== 13) return bad('MK', n, 'invalid_length');
  if (!/^\d{13}$/.test(n)) return bad('MK', n, 'invalid_format');
  const weights = [7, 6, 5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i += 1) sum += weights[i] * Number(n[i]);
  const expected = (((-sum % 11) + 11) % 11) % 10;
  return Number(n[12]) === expected ? ok('MK', n) : bad('MK', n, 'invalid_checksum');
}

// Mozambique NUIT: 9 digits, weighted mod-11 check. Verified: 400339910.
export function validateMozambiqueNuit(value: unknown): TaxIdValidationResult {
  const n = compact(value);
  if (!n) return bad('MZ', n, 'empty');
  if (n.length !== 9) return bad('MZ', n, 'invalid_length');
  if (!/^\d{9}$/.test(n)) return bad('MZ', n, 'invalid_format');
  const weights = [8, 9, 4, 5, 6, 7, 8, 9];
  let sum = 0;
  for (let i = 0; i < 8; i += 1) sum += weights[i] * Number(n[i]);
  const expected = '01234567891'[sum % 11];
  return n[8] === expected ? ok('MZ', n) : bad('MZ', n, 'invalid_checksum');
}

// Peru RUC: 11 digits, type prefix + weighted mod-11 check. Verified: 20512333797.
export function validatePeruvianRuc(value: unknown): TaxIdValidationResult {
  const n = compact(value);
  if (!n) return bad('PE', n, 'empty');
  if (n.length !== 11) return bad('PE', n, 'invalid_length');
  if (!/^\d{11}$/.test(n)) return bad('PE', n, 'invalid_format');
  const prefix = n.slice(0, 2);
  if (!['10', '15', '17', '20'].includes(prefix)) return bad('PE', n, 'invalid_format');
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 10; i += 1) sum += weights[i] * Number(n[i]);
  const expected = (11 - (sum % 11)) % 10;
  return Number(n[10]) === expected ? ok('PE', n) : bad('PE', n, 'invalid_checksum');
}

// Paraguay RUC: up to 9 digits, trailing mod-11 check. Verified: 800280610.
export function validateParaguayanRuc(value: unknown): TaxIdValidationResult {
  const n = compact(value);
  if (!n) return bad('PY', n, 'empty');
  if (n.length > 9) return bad('PY', n, 'invalid_length');
  if (!/^\d+$/.test(n)) return bad('PY', n, 'invalid_format');
  const body = n.slice(0, -1);
  let sum = 0;
  for (let k = 0; k < body.length; k += 1) sum += (k + 2) * Number(body[body.length - 1 - k]);
  const expected = (((-sum % 11) + 11) % 11) % 10;
  return Number(n[n.length - 1]) === expected ? ok('PY', n) : bad('PY', n, 'invalid_checksum');
}

// Senegal NINEA: 7 or 9 digits (+ optional 3-char COFI), weighted mod-10 check.
// Verified: 3067221.
const SN_COFI_CENTRES = 'ABCDEFGHJKLMNPQRSTUVWZ';

export function validateSenegalNinea(value: unknown): TaxIdValidationResult {
  const raw = compact(value).replace(/,/g, '');
  let n = raw;
  let cofi = '';
  if (n.length > 9) {
    cofi = n.slice(-3);
    n = n.slice(0, -3);
  }
  if (!raw) return bad('SN', raw, 'empty');
  if (n.length !== 7 && n.length !== 9) return bad('SN', raw, 'invalid_length');
  if (!/^\d+$/.test(n)) return bad('SN', raw, 'invalid_format');
  if (cofi) {
    const valid =
      '012'.includes(cofi[0]) && SN_COFI_CENTRES.includes(cofi[1]) && /^\d$/.test(cofi[2]);
    if (!valid) return bad('SN', raw, 'invalid_format');
  }
  const padded = n.padStart(9, '0');
  const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1];
  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += weights[i] * Number(padded[i]);
  return sum % 10 === 0 ? ok('SN', n + cofi) : bad('SN', raw, 'invalid_checksum');
}

// El Salvador NIT: 14 digits, weighted mod-11 check (old/new schemes by serial).
// Verified: 06140507071048.
export function validateSalvadoranNit(value: unknown): TaxIdValidationResult {
  let n = compact(value);
  if (n.startsWith('SV')) n = n.slice(2);
  if (!n) return bad('SV', n, 'empty');
  if (n.length !== 14) return bad('SV', n, 'invalid_length');
  if (!/^\d{14}$/.test(n)) return bad('SV', n, 'invalid_format');
  const body = n.slice(0, 13);
  let expected: number;
  if (n.slice(10, 13) <= '100') {
    const weights = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 13; i += 1) sum += weights[i] * Number(body[i]);
    expected = (sum % 11) % 10;
  } else {
    const weights = [2, 7, 6, 5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 13; i += 1) sum += weights[i] * Number(body[i]);
    expected = (((-sum % 11) + 11) % 11) % 10;
  }
  return Number(n[13]) === expected ? ok('SV', n) : bad('SV', n, 'invalid_checksum');
}

// Thailand TIN: 13 digits (company MOA or personal PIN), standard mod-11 check.
// Verified: 0994000617721 and 1234545678781.
export function validateThaiTin(value: unknown): TaxIdValidationResult {
  const n = compact(value);
  if (!n) return bad('TH', n, 'empty');
  if (n.length !== 13) return bad('TH', n, 'invalid_length');
  if (!/^\d{13}$/.test(n)) return bad('TH', n, 'invalid_format');
  if (n[0] === '9') return bad('TH', n, 'invalid_format');
  let sum = 0;
  for (let i = 0; i < 12; i += 1) sum += (13 - i) * Number(n[i]);
  const expected = (11 - (sum % 11)) % 10;
  return Number(n[12]) === expected ? ok('TH', n) : bad('TH', n, 'invalid_checksum');
}

// Taiwan UBN: 8 digits, weighted digit-sum mod-10 (special rule when 7th = 7).
// Verified: 00501503.
export function validateTaiwanUbn(value: unknown): TaxIdValidationResult {
  const n = compact(value);
  if (!n) return bad('TW', n, 'empty');
  if (n.length !== 8) return bad('TW', n, 'invalid_length');
  if (!/^\d{8}$/.test(n)) return bad('TW', n, 'invalid_format');
  const weights = [1, 2, 1, 2, 1, 2, 4, 1];
  let total = 0;
  for (let i = 0; i < 8; i += 1) {
    const product = weights[i] * Number(n[i]);
    total += Math.floor(product / 10) + (product % 10);
  }
  total %= 10;
  return total === 0 || (total === 9 && n[6] === '7')
    ? ok('TW', n)
    : bad('TW', n, 'invalid_checksum');
}

// Uruguay RUT: 12 digits (NN + serial + 001 + check), weighted mod-11 check.
// Verified: 211003420017.
export function validateUruguayanRut(value: unknown): TaxIdValidationResult {
  let n = compact(value);
  if (n.startsWith('UY')) n = n.slice(2);
  if (!n) return bad('UY', n, 'empty');
  if (n.length !== 12) return bad('UY', n, 'invalid_length');
  if (!/^\d{12}$/.test(n)) return bad('UY', n, 'invalid_format');
  const prefix = n.slice(0, 2);
  if (prefix < '01' || prefix > '22') return bad('UY', n, 'invalid_format');
  if (n.slice(2, 8) === '000000') return bad('UY', n, 'invalid_format');
  if (n.slice(8, 11) !== '001') return bad('UY', n, 'invalid_format');
  const weights = [4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 11; i += 1) sum += weights[i] * Number(n[i]);
  const expected = ((-sum % 11) + 11) % 11;
  return Number(n[11]) === expected ? ok('UY', n) : bad('UY', n, 'invalid_checksum');
}

// Venezuela RIF: type letter + 9 digits, weighted mod-11 check. Verified: V114702834.
const VE_TYPES: Readonly<Record<string, number>> = { V: 4, E: 8, J: 12, P: 16, G: 20 };

export function validateVenezuelanRif(value: unknown): TaxIdValidationResult {
  const n = compact(value);
  if (!n) return bad('VE', n, 'empty');
  if (n.length !== 10) return bad('VE', n, 'invalid_length');
  if (!(n[0] in VE_TYPES) || !/^\d{9}$/.test(n.slice(1))) return bad('VE', n, 'invalid_format');
  const weights = [3, 2, 7, 6, 5, 4, 3, 2];
  let c = VE_TYPES[n[0]];
  for (let i = 0; i < 8; i += 1) c += weights[i] * Number(n[1 + i]);
  const expected = '00987654321'[c % 11];
  return n[9] === expected ? ok('VE', n) : bad('VE', n, 'invalid_checksum');
}

// Vietnam MST: 10 digits (optional 3-digit branch), weighted mod-11 check.
// Verified: 0100233488.
export function validateVietnameseMst(value: unknown): TaxIdValidationResult {
  const n = compact(value);
  if (!n) return bad('VN', n, 'empty');
  if (n.length !== 10 && n.length !== 13) return bad('VN', n, 'invalid_length');
  if (!/^\d+$/.test(n)) return bad('VN', n, 'invalid_format');
  if (n.slice(2, 9) === '0000000') return bad('VN', n, 'invalid_format');
  if (n.length === 13 && n.slice(10) === '000') return bad('VN', n, 'invalid_format');
  const weights = [31, 29, 23, 19, 17, 13, 7, 5, 3];
  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += weights[i] * Number(n[i]);
  const expected = 10 - (sum % 11);
  return Number(n[9]) === expected ? ok('VN', n) : bad('VN', n, 'invalid_checksum');
}

// South Africa tax reference number: 10 digits, leading digit 0/1/2/3/9, Luhn.
// Verified: 0001339050.
export function validateSouthAfricanTin(value: unknown): TaxIdValidationResult {
  const n = compact(value);
  if (!n) return bad('ZA', n, 'empty');
  if (n.length !== 10) return bad('ZA', n, 'invalid_length');
  if (!/^\d{10}$/.test(n)) return bad('ZA', n, 'invalid_format');
  if (!'01239'.includes(n[0])) return bad('ZA', n, 'invalid_format');
  return luhnValid(n) ? ok('ZA', n) : bad('ZA', n, 'invalid_checksum');
}

// Indonesia NPWP: 15 digits, Luhn over the first 9. Verified: 013121660091000.
export function validateIndonesianNpwp(value: unknown): TaxIdValidationResult {
  const n = compact(value);
  if (!n) return bad('ID', n, 'empty');
  if (n.length !== 15) return bad('ID', n, 'invalid_length');
  if (!/^\d{15}$/.test(n)) return bad('ID', n, 'invalid_format');
  return luhnValid(n.slice(0, 9)) ? ok('ID', n) : bad('ID', n, 'invalid_checksum');
}
