import type { DecodedIdentity, IdentityDecoder } from './encoded-identity';

/**
 * National identity documents that encode biographical data but are NOT the
 * tax identifier the library validates via `validateTaxId`. Each document
 * carries its own structural validator (`resolve`) plus a decoder, so the
 * identity-consistency layer can check them without polluting the tax-id
 * contract. See docs/IDENTITY-CONSISTENCY-RESEARCH.md.
 */
export interface IdentityDocument {
  /** Returns the normalized document if structurally valid, otherwise null. */
  readonly resolve: (value: unknown) => string | null;
  readonly decode: IdentityDecoder;
}

function compact(value: unknown): string {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return '';
  }
  return String(value).trim().replace(/[\s\-/.]+/g, '').toUpperCase();
}

function isValidYmd(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

const num = (v: string, start: number, end: number): number => Number(v.slice(start, end));

// Mexico CURP (18). Encodes name letters, full birth date, sex and state.
// We verify date, sex and state here; reproducing RENAPO's name algorithm
// (with its profanity filter) is deferred, so name is not asserted.
const CURP_PATTERN = /^[A-Z]{4}\d{6}[HM][A-Z]{2}[A-Z]{3}[0-9A-Z]\d$/;
const curp: IdentityDocument = {
  resolve: (value) => {
    const n = compact(value);
    if (!CURP_PATTERN.test(n)) return null;
    // Century from the homonym character: digit => 1900s, letter => 2000s.
    const century = /\d/.test(n[16]) ? 1900 : 2000;
    if (!isValidYmd(century + num(n, 4, 6), num(n, 6, 8), num(n, 8, 10))) return null;
    return n;
  },
  decode: (n): DecodedIdentity => ({
    yearMod100: num(n, 4, 6),
    month: num(n, 6, 8),
    day: num(n, 8, 10),
    gender: n[10] === 'H' ? 'M' : 'F',
    birthPlaceCode: n.slice(11, 13),
  }),
};

// Egypt National ID (14). Century + YYMMDD + governorate + serial(sex) + check.
const egyptNationalId: IdentityDocument = {
  resolve: (value) => {
    const n = compact(value);
    if (!/^\d{14}$/.test(n)) return null;
    const century = n[0] === '3' ? 2000 : n[0] === '2' ? 1900 : n[0] === '1' ? 1800 : 0;
    if (!century) return null;
    if (!isValidYmd(century + num(n, 1, 3), num(n, 3, 5), num(n, 5, 7))) return null;
    return n;
  },
  decode: (n): DecodedIdentity => {
    const century = n[0] === '3' ? 2000 : n[0] === '2' ? 1900 : 1800;
    return {
      year: century + num(n, 1, 3),
      month: num(n, 3, 5),
      day: num(n, 5, 7),
      gender: (n.charCodeAt(12) - 48) % 2 === 1 ? 'M' : 'F',
      birthPlaceCode: n.slice(7, 9),
    };
  },
};

// France NIR / INSEE (13 or 15). Sex + birth year + month + place. No day.
const franceNir: IdentityDocument = {
  resolve: (value) => {
    const n = compact(value);
    if (!/^[1-4]\d{12}(\d{2})?$/.test(n)) return null;
    if (n.length === 15) {
      const key = num(n, 13, 15);
      const expected = 97 - (Number(n.slice(0, 13)) % 97);
      if (key !== expected) return null;
    }
    return n;
  },
  decode: (n): DecodedIdentity => {
    const month = num(n, 3, 5);
    return {
      yearMod100: num(n, 1, 3),
      month: month >= 1 && month <= 12 ? month : undefined,
      gender: n[0] === '1' || n[0] === '3' ? 'M' : 'F',
    };
  },
};

// Vietnam CCCD (12). Province + century/sex code + birth year. No month/day.
const vietnamCccd: IdentityDocument = {
  resolve: (value) => {
    const n = compact(value);
    return /^\d{12}$/.test(n) ? n : null;
  },
  decode: (n): DecodedIdentity => ({
    yearMod100: num(n, 4, 6),
    gender: (n.charCodeAt(3) - 48) % 2 === 0 ? 'M' : 'F',
    birthPlaceCode: n.slice(0, 3),
  }),
};

// Kuwait Civil ID (12). Century + YYMMDD + serial + check. Date only; the sex
// convention in the serial is not institutionally confirmed.
const kuwaitCivilId: IdentityDocument = {
  resolve: (value) => {
    const n = compact(value);
    if (!/^\d{12}$/.test(n)) return null;
    const century = n[0] === '3' ? 2000 : n[0] === '2' ? 1900 : 0;
    if (!century) return null;
    if (!isValidYmd(century + num(n, 1, 3), num(n, 3, 5), num(n, 5, 7))) return null;
    return n;
  },
  decode: (n): DecodedIdentity => {
    const century = n[0] === '3' ? 2000 : 1900;
    return {
      year: century + num(n, 1, 3),
      month: num(n, 3, 5),
      day: num(n, 5, 7),
    };
  },
};

const currentYear = new Date().getUTCFullYear();
const plausibleYear = (year: number): boolean => year >= 1900 && year <= currentYear;

// UAE Emirates ID (15): 784 + full birth year + serial + check. Year only.
const uaeEmiratesId: IdentityDocument = {
  resolve: (value) => {
    const n = compact(value);
    if (!/^784\d{12}$/.test(n)) return null;
    return plausibleYear(num(n, 3, 7)) ? n : null;
  },
  decode: (n): DecodedIdentity => ({ year: num(n, 3, 7) }),
};

// Bahrain CPR (9): YYMM + serial + check. Birth year (2-digit) and month.
const bahrainCpr: IdentityDocument = {
  resolve: (value) => {
    const n = compact(value);
    if (!/^\d{9}$/.test(n)) return null;
    const month = num(n, 2, 4);
    return month >= 1 && month <= 12 ? n : null;
  },
  decode: (n): DecodedIdentity => ({ yearMod100: num(n, 0, 2), month: num(n, 2, 4) }),
};

// Qatar QID (11): century + birth year + nationality + serial. Year only.
const qatarQid: IdentityDocument = {
  resolve: (value) => {
    const n = compact(value);
    return /^[23]\d{10}$/.test(n) ? n : null;
  },
  decode: (n): DecodedIdentity => ({
    year: (n[0] === '3' ? 2000 : 1900) + num(n, 1, 3),
  }),
};

// Bangladesh NID, 17-digit form: full birth year + registration codes. Year only.
const bangladeshNid: IdentityDocument = {
  resolve: (value) => {
    const n = compact(value);
    if (!/^\d{17}$/.test(n)) return null;
    return plausibleYear(num(n, 0, 4)) ? n : null;
  },
  decode: (n): DecodedIdentity => ({ year: num(n, 0, 4) }),
};

// Taiwan National ID: region letter + sex digit + 7 serial + check digit.
// Encodes sex and registration region, no birth date. Beyond the 195 UN
// states (a jurisdiction), supported for identity consistency only.
const TW_LETTER_CODES: Readonly<Record<string, number>> = {
  A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, I: 34, J: 18,
  K: 19, L: 20, M: 21, N: 22, O: 35, P: 23, Q: 24, R: 25, S: 26, T: 27,
  U: 28, V: 29, W: 32, X: 30, Y: 31, Z: 33,
};
const taiwanNationalId: IdentityDocument = {
  resolve: (value) => {
    const n = compact(value);
    if (!/^[A-Z][12]\d{8}$/.test(n)) return null;
    const code = TW_LETTER_CODES[n[0]];
    if (code === undefined) return null;
    const weights = [8, 7, 6, 5, 4, 3, 2, 1, 1];
    let sum = Math.floor(code / 10) + (code % 10) * 9;
    for (let i = 1; i < 10; i += 1) sum += (n.charCodeAt(i) - 48) * weights[i - 1];
    return sum % 10 === 0 ? n : null;
  },
  decode: (n): DecodedIdentity => ({
    gender: n[1] === '1' ? 'M' : 'F',
    birthPlaceCode: n[0],
  }),
};

export const IDENTITY_DOCUMENTS: Readonly<Record<string, IdentityDocument>> = {
  AE: uaeEmiratesId,
  TW: taiwanNationalId,
  BD: bangladeshNid,
  BH: bahrainCpr,
  EG: egyptNationalId,
  FR: franceNir,
  KW: kuwaitCivilId,
  MX: curp,
  QA: qatarQid,
  VN: vietnamCccd,
};
