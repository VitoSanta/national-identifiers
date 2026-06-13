import type { TaxIdIdentity, TaxIdIdentityField } from '../identity-consistency';

/**
 * Biographical data decoded from an identifier. Every property is optional:
 * a country contributes only what its format institutionally encodes, and a
 * decoder returns `null` when the specific value variant encodes nothing
 * (for example a 15-digit Indonesian NPWP or a modern Latvian code).
 */
export interface DecodedIdentity {
  /** Full birth year, present only when the format encodes the century. */
  readonly year?: number;
  /** Birth year modulo 100, when the century is not encoded. */
  readonly yearMod100?: number;
  readonly month?: number;
  readonly day?: number;
  readonly gender?: 'M' | 'F';
  readonly birthPlaceCode?: string;
}

export type IdentityDecoder = (normalizedValue: string) => DecodedIdentity | null;

export function parseIsoDate(
  value: string | undefined,
): { year: number; month: number; day: number } | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const candidate = new Date(Date.UTC(year, month - 1, day));

  const isRealDate =
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day;

  return isRealDate ? { year, month, day } : null;
}

/**
 * Builds an identity check from a decoder. Only fields that are both
 * provided by the caller and encoded in the identifier are evaluated.
 */
export function buildEncodedIdentityCheck(decoder: IdentityDecoder) {
  return (
    normalizedTaxId: string,
    identity: TaxIdIdentity,
  ): { checked: TaxIdIdentityField[]; mismatched: TaxIdIdentityField[] } => {
    const decoded = decoder(normalizedTaxId);
    const checked: TaxIdIdentityField[] = [];
    const mismatched: TaxIdIdentityField[] = [];

    if (!decoded) {
      return { checked, mismatched };
    }

    const birthDate = parseIsoDate(identity.birthDate);
    // The birth date is checked to whatever granularity the format encodes.
    // Some identifiers carry only year (+ month); month and day are compared
    // only when the decoder supplies them.
    const hasDecodedYear =
      decoded.year !== undefined || decoded.yearMod100 !== undefined;

    if (birthDate && hasDecodedYear) {
      checked.push('birthDate');
      const yearMatches =
        decoded.year !== undefined
          ? decoded.year === birthDate.year
          : decoded.yearMod100 === birthDate.year % 100;
      const monthMatches =
        decoded.month === undefined || decoded.month === birthDate.month;
      const dayMatches =
        decoded.day === undefined || decoded.day === birthDate.day;
      if (!yearMatches || !monthMatches || !dayMatches) {
        mismatched.push('birthDate');
      }
    }

    if ((identity.gender === 'M' || identity.gender === 'F') && decoded.gender) {
      checked.push('gender');
      if (identity.gender !== decoded.gender) {
        mismatched.push('gender');
      }
    }

    if (identity.birthPlaceCode && decoded.birthPlaceCode) {
      checked.push('birthPlaceCode');
      if (identity.birthPlaceCode.trim().toUpperCase() !== decoded.birthPlaceCode) {
        mismatched.push('birthPlaceCode');
      }
    }

    return { checked, mismatched };
  };
}

const digitAt = (value: string, index: number): number => value.charCodeAt(index) - 48;
const numberAt = (value: string, start: number, end: number): number =>
  Number(value.slice(start, end));
const parityGender = (digit: number): 'M' | 'F' => (digit % 2 === 1 ? 'M' : 'F');

function epochDate(baseUtcMs: number, days: number): { year: number; month: number; day: number } {
  const date = new Date(baseUtcMs + days * 86_400_000);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

const UA_EPOCH = Date.UTC(1899, 11, 31);
const HU_EPOCH = Date.UTC(1867, 0, 1);

// Fixed-month calendar used by Sri Lankan NIC day-of-year values (February
// always counts 29 days regardless of leap years).
const LK_MONTH_LENGTHS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

function lkDayOfYearToMonthDay(dayOfYear: number): { month: number; day: number } | null {
  let remaining = dayOfYear;
  for (let month = 0; month < 12; month += 1) {
    if (remaining <= LK_MONTH_LENGTHS[month]) {
      return { month: month + 1, day: remaining };
    }
    remaining -= LK_MONTH_LENGTHS[month];
  }
  return null;
}

/**
 * Per-country decoders. Each mirrors the date/gender conventions already
 * enforced (or institutionally documented) by the corresponding validator,
 * so a value that passes validation always decodes without throwing.
 */
export const ENCODED_IDENTITY_DECODERS: Readonly<Record<string, IdentityDecoder>> = {
  PL: (v) => {
    const encodedMonth = numberAt(v, 2, 4);
    const offsets: ReadonlyArray<readonly [number, number, number]> = [
      [81, 92, 1800], [1, 12, 1900], [21, 32, 2000], [41, 52, 2100], [61, 72, 2200],
    ];
    for (const [min, max, century] of offsets) {
      if (encodedMonth >= min && encodedMonth <= max) {
        return {
          year: century + numberAt(v, 0, 2),
          month: encodedMonth - min + 1,
          day: numberAt(v, 4, 6),
          gender: parityGender(digitAt(v, 9)),
        };
      }
    }
    return null;
  },

  RO: (v) => {
    const first = digitAt(v, 0);
    const century = first <= 2 ? 1900 : first <= 4 ? 1800 : first <= 8 ? 2000 : 1900;
    return {
      year: century + numberAt(v, 1, 3),
      month: numberAt(v, 3, 5),
      day: numberAt(v, 5, 7),
      gender: parityGender(first),
    };
  },

  BG: (v) => {
    const encodedMonth = numberAt(v, 2, 4);
    const decoded =
      encodedMonth >= 1 && encodedMonth <= 12 ? { century: 1900, month: encodedMonth }
      : encodedMonth >= 21 && encodedMonth <= 32 ? { century: 1800, month: encodedMonth - 20 }
      : encodedMonth >= 41 && encodedMonth <= 52 ? { century: 2000, month: encodedMonth - 40 }
      : null;
    if (!decoded) return null;
    return {
      year: decoded.century + numberAt(v, 0, 2),
      month: decoded.month,
      day: numberAt(v, 4, 6),
      // EGN: the ninth digit is even for men and odd for women.
      gender: digitAt(v, 8) % 2 === 0 ? 'M' : 'F',
    };
  },

  CZ: (v) => birthNumberIdentity(v),
  SK: (v) => birthNumberIdentity(v),

  SE: (v) => {
    const short = v.slice(-10);
    const encodedDay = numberAt(short, 4, 6);
    const base = {
      month: numberAt(short, 2, 4),
      day: encodedDay > 60 ? encodedDay - 60 : encodedDay,
      gender: parityGender(digitAt(short, 8)),
    };
    return v.length === 12
      ? { ...base, year: numberAt(v, 0, 4) }
      : { ...base, yearMod100: numberAt(short, 0, 2) };
  },

  NO: (v) => {
    const encodedDay = numberAt(v, 0, 2);
    const encodedMonth = numberAt(v, 2, 4);
    return {
      yearMod100: numberAt(v, 4, 6),
      month: encodedMonth > 40 ? encodedMonth - 40 : encodedMonth,
      day: encodedDay > 40 ? encodedDay - 40 : encodedDay,
      gender: parityGender(digitAt(v, 8)),
    };
  },

  DK: (v) => {
    const shortYear = numberAt(v, 4, 6);
    const centuryDigit = digitAt(v, 6);
    const year =
      centuryDigit <= 3 ? 1900 + shortYear
      : centuryDigit === 4 || centuryDigit === 9 ? (shortYear <= 36 ? 2000 : 1900) + shortYear
      : (shortYear <= 57 ? 2000 : 1800) + shortYear;
    return {
      year,
      month: numberAt(v, 2, 4),
      day: numberAt(v, 0, 2),
      gender: parityGender(digitAt(v, 9)),
    };
  },

  FI: (v) => {
    const centuries: Readonly<Record<string, number>> = {
      '+': 1800, '-': 1900, U: 1900, V: 1900, W: 1900, X: 1900, Y: 1900,
      A: 2000, B: 2000, C: 2000, D: 2000, E: 2000, F: 2000,
    };
    const century = centuries[v[6]];
    if (century === undefined) return null;
    return {
      year: century + numberAt(v, 4, 6),
      month: numberAt(v, 2, 4),
      day: numberAt(v, 0, 2),
      gender: parityGender(numberAt(v, 7, 10)),
    };
  },

  IS: (v) => {
    const centuryDigit = digitAt(v, 9);
    const century = centuryDigit === 0 ? 2000 : centuryDigit === 9 ? 1900 : 1800;
    return {
      year: century + numberAt(v, 4, 6),
      month: numberAt(v, 2, 4),
      day: numberAt(v, 0, 2),
    };
  },

  // Luxembourg matricule: yyyymmdd + serial + check digits. Full birth date,
  // no sex marker.
  LU: (v) => ({
    year: numberAt(v, 0, 4),
    month: numberAt(v, 4, 6),
    day: numberAt(v, 6, 8),
  }),

  EE: (v) => balticIdentity(v),
  LT: (v) => balticIdentity(v),

  LV: (v) => {
    if (v.startsWith('32')) return null;
    const centuryDigit = digitAt(v, 6);
    const base = { month: numberAt(v, 2, 4), day: numberAt(v, 0, 2) };
    if (centuryDigit <= 2) {
      return { ...base, year: 1800 + centuryDigit * 100 + numberAt(v, 4, 6) };
    }
    return { ...base, yearMod100: numberAt(v, 4, 6) };
  },

  BE: (v) => {
    const firstNine = Number(v.slice(0, 9));
    const checkDigits = Number(v.slice(9));
    const isPost2000 = checkDigits === 97 - ((2_000_000_000 + firstNine) % 97);
    const month = numberAt(v, 2, 4);
    const day = numberAt(v, 4, 6);
    const gender = parityGender(digitAt(v, 8));
    // Unknown birth dates are registered with zeroed month/day components.
    if (month === 0 || day === 0) return { gender };
    return {
      year: (isPost2000 ? 2000 : 1900) + numberAt(v, 0, 2),
      month,
      day,
      gender,
    };
  },

  UA: (v) => ({
    ...epochDate(UA_EPOCH, numberAt(v, 0, 5)),
    gender: parityGender(digitAt(v, 8)),
  }),

  HU: (v) => epochDate(HU_EPOCH, numberAt(v, 1, 6)),

  AL: (v) => {
    let year: number;
    if (/^\d{2}/.test(v)) {
      year = 1800 + numberAt(v, 0, 2);
    } else {
      const decade = v.charCodeAt(0) - 65;
      const inDecade = digitAt(v, 1);
      year = decade <= 9 ? 1900 + decade * 10 + inDecade : 2000 + (decade - 10) * 10 + inDecade;
    }
    const encodedMonth = numberAt(v, 2, 4);
    let month: number | undefined;
    for (const offset of [0, 30, 50, 80]) {
      const candidate = encodedMonth - offset;
      if (candidate >= 1 && candidate <= 12) {
        month = candidate;
        break;
      }
    }
    if (month === undefined) return null;
    return { year, month, day: numberAt(v, 4, 6) };
  },

  BA: (v) => jmbgIdentity(v),
  ME: (v) => jmbgIdentity(v),
  MK: (v) => jmbgIdentity(v),
  RS: (v) => jmbgIdentity(v),

  KR: (v) => {
    const centuryDigit = digitAt(v, 6);
    const century =
      centuryDigit === 9 || centuryDigit === 0 ? 1800
      : centuryDigit <= 2 || centuryDigit === 5 || centuryDigit === 6 ? 1900
      : 2000;
    return {
      year: century + numberAt(v, 0, 2),
      month: numberAt(v, 2, 4),
      day: numberAt(v, 4, 6),
      gender: parityGender(centuryDigit),
    };
  },

  CN: (v) => ({
    year: numberAt(v, 6, 10),
    month: numberAt(v, 10, 12),
    day: numberAt(v, 12, 14),
    gender: parityGender(digitAt(v, 16)),
    birthPlaceCode: v.slice(0, 6),
  }),

  KZ: (v) => centuryDigitIdentity(v, 0, 6, digitAt(v, 6)),

  UZ: (v) => {
    const first = digitAt(v, 0);
    return {
      year: (17 + Math.ceil(first / 2)) * 100 + numberAt(v, 5, 7),
      month: numberAt(v, 3, 5),
      day: numberAt(v, 1, 3),
      gender: parityGender(first),
    };
  },

  KG: (v) => ({
    year: numberAt(v, 5, 9),
    month: numberAt(v, 3, 5),
    day: numberAt(v, 1, 3),
  }),

  MN: (v) => {
    return {
      yearMod100: numberAt(v, 2, 4),
      month: numberAt(v, 4, 6),
      day: numberAt(v, 6, 8),
    };
  },

  CU: (v) => {
    const centuryDigit = digitAt(v, 6);
    const century = centuryDigit === 9 ? 1800 : centuryDigit <= 5 ? 1900 : 2000;
    return {
      year: century + numberAt(v, 0, 2),
      month: numberAt(v, 2, 4),
      day: numberAt(v, 4, 6),
    };
  },

  LK: (v) => {
    const isLegacy = v.length === 10;
    const year = isLegacy ? 1900 + numberAt(v, 0, 2) : numberAt(v, 0, 4);
    const dayOfYear = isLegacy ? numberAt(v, 2, 5) : numberAt(v, 4, 7);
    const normalizedDay = dayOfYear > 500 ? dayOfYear - 500 : dayOfYear;
    const monthDay = lkDayOfYearToMonthDay(normalizedDay);
    if (!monthDay) return null;
    return {
      year,
      month: monthDay.month,
      day: monthDay.day,
      gender: dayOfYear > 500 ? 'F' : 'M',
    };
  },

  MY: (v) => ({
    yearMod100: numberAt(v, 0, 2),
    month: numberAt(v, 2, 4),
    day: numberAt(v, 4, 6),
    gender: parityGender(digitAt(v, 11)),
    birthPlaceCode: v.slice(6, 8),
  }),

  ID: (v) => {
    if (v.length !== 16) return null;
    const rawDay = numberAt(v, 6, 8);
    return {
      yearMod100: numberAt(v, 10, 12),
      month: numberAt(v, 8, 10),
      day: rawDay > 40 ? rawDay - 40 : rawDay,
      gender: rawDay > 40 ? 'F' : 'M',
      birthPlaceCode: v.slice(0, 6),
    };
  },

  MX: (v) => {
    if (v.length !== 13) return null;
    return {
      yearMod100: numberAt(v, 4, 6),
      month: numberAt(v, 6, 8),
      day: numberAt(v, 8, 10),
    };
  },

  ZA: (v) => {
    if (v.length !== 13) return null;
    return {
      yearMod100: numberAt(v, 0, 2),
      month: numberAt(v, 2, 4),
      day: numberAt(v, 4, 6),
      gender: digitAt(v, 6) >= 5 ? 'M' : 'F',
    };
  },

  NI: (v) => pivotDateIdentity(v, 3),
  SV: (v) => pivotDateIdentity(v, 4),

  PK: (v) => {
    if (v.length !== 13) return null;
    return { gender: parityGender(digitAt(v, 12)) };
  },
};

function birthNumberIdentity(v: string): DecodedIdentity {
  const shortYear = numberAt(v, 0, 2);
  const encodedMonth = numberAt(v, 2, 4);
  const month =
    encodedMonth > 70 ? encodedMonth - 70
    : encodedMonth > 50 ? encodedMonth - 50
    : encodedMonth > 20 ? encodedMonth - 20
    : encodedMonth;
  const year =
    v.length === 10 ? (shortYear >= 54 ? 1900 : 2000) + shortYear : 1900 + shortYear;
  return {
    year,
    month,
    day: numberAt(v, 4, 6),
    gender: encodedMonth > 50 && encodedMonth <= 62 || encodedMonth > 70 ? 'F' : 'M',
  };
}

function balticIdentity(v: string): DecodedIdentity {
  const first = digitAt(v, 0);
  return {
    year: 1800 + Math.floor((first - 1) / 2) * 100 + numberAt(v, 1, 3),
    month: numberAt(v, 3, 5),
    day: numberAt(v, 5, 7),
    gender: parityGender(first),
  };
}

function jmbgIdentity(v: string): DecodedIdentity {
  const yearPart = numberAt(v, 4, 7);
  return {
    year: yearPart >= 800 ? 1000 + yearPart : 2000 + yearPart,
    month: numberAt(v, 2, 4),
    day: numberAt(v, 0, 2),
    gender: numberAt(v, 9, 12) < 500 ? 'M' : 'F',
  };
}

function centuryDigitIdentity(
  v: string,
  dateStart: number,
  centuryIndex: number,
  centuryDigit: number,
): DecodedIdentity {
  return {
    year: (17 + Math.ceil(centuryDigit / 2)) * 100 + numberAt(v, dateStart, dateStart + 2),
    month: numberAt(v, dateStart + 2, dateStart + 4),
    day: numberAt(v, dateStart + 4, dateStart + 6),
    gender: parityGender(centuryDigit),
  };
}

function pivotDateIdentity(v: string, dayStart: number): DecodedIdentity {
  return {
    yearMod100: numberAt(v, dayStart + 4, dayStart + 6),
    month: numberAt(v, dayStart + 2, dayStart + 4),
    day: numberAt(v, dayStart, dayStart + 2),
  };
}
