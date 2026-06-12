import type { TaxIdIdentity, TaxIdIdentityField } from '../identity-consistency';

const VOWELS = 'AEIOU';
const MONTH_LETTERS = 'ABCDEHLMPRST';

// Omocodia substitution table (digit -> letter), inverted for decoding.
const OMOCODIA_DECODE: Readonly<Record<string, string>> = {
  L: '0', M: '1', N: '2', P: '3', Q: '4',
  R: '5', S: '6', T: '7', U: '8', V: '9',
};

// Positions that hold digits in a non-omocodic fiscal code.
const NUMERIC_POSITIONS = [6, 7, 9, 10, 12, 13, 14] as const;

function normalizeNamePart(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}

function splitLetters(value: string): { consonants: string; vowels: string } {
  let consonants = '';
  let vowels = '';

  for (const letter of value) {
    if (VOWELS.includes(letter)) {
      vowels += letter;
    } else {
      consonants += letter;
    }
  }

  return { consonants, vowels };
}

export function encodeItalianSurname(surname: string): string {
  const { consonants, vowels } = splitLetters(normalizeNamePart(surname));
  return (consonants + vowels).slice(0, 3).padEnd(3, 'X');
}

export function encodeItalianGivenName(givenName: string): string {
  const { consonants, vowels } = splitLetters(normalizeNamePart(givenName));

  if (consonants.length >= 4) {
    return consonants[0] + consonants[2] + consonants[3];
  }

  return (consonants + vowels).slice(0, 3).padEnd(3, 'X');
}

/** Restores the digits replaced by omocodia substitutions. */
export function decodeItalianOmocodia(fiscalCode: string): string {
  const characters = fiscalCode.split('');

  for (const position of NUMERIC_POSITIONS) {
    const decoded = OMOCODIA_DECODE[characters[position]];
    if (decoded !== undefined) {
      characters[position] = decoded;
    }
  }

  return characters.join('');
}

export function checkItalianIdentity(
  normalizedTaxId: string,
  identity: TaxIdIdentity,
): { checked: TaxIdIdentityField[]; mismatched: TaxIdIdentityField[] } {
  // Biographical data is encoded only in the 16-character personal fiscal
  // code; an 11-digit partita IVA carries none, so nothing is checkable.
  if (normalizedTaxId.length !== 16) {
    return { checked: [], mismatched: [] };
  }

  const checked: TaxIdIdentityField[] = [];
  const mismatched: TaxIdIdentityField[] = [];
  const code = decodeItalianOmocodia(normalizedTaxId);

  const encodedDay = Number(code.slice(9, 11));
  const dayOfBirth = encodedDay > 40 ? encodedDay - 40 : encodedDay;

  if (identity.lastName) {
    checked.push('lastName');
    if (encodeItalianSurname(identity.lastName) !== code.slice(0, 3)) {
      mismatched.push('lastName');
    }
  }

  if (identity.firstName) {
    checked.push('firstName');
    if (encodeItalianGivenName(identity.firstName) !== code.slice(3, 6)) {
      mismatched.push('firstName');
    }
  }

  const birthDate = parseIsoDate(identity.birthDate);
  if (birthDate) {
    checked.push('birthDate');
    const yearMatches = code.slice(6, 8) === String(birthDate.year % 100).padStart(2, '0');
    const monthMatches = code[8] === MONTH_LETTERS[birthDate.month - 1];
    const dayMatches = dayOfBirth === birthDate.day;
    if (!yearMatches || !monthMatches || !dayMatches) {
      mismatched.push('birthDate');
    }
  }

  if (identity.gender === 'M' || identity.gender === 'F') {
    checked.push('gender');
    const encodedGender = encodedDay > 40 ? 'F' : 'M';
    if (identity.gender !== encodedGender) {
      mismatched.push('gender');
    }
  }

  if (identity.birthPlaceCode) {
    checked.push('birthPlaceCode');
    if (identity.birthPlaceCode.trim().toUpperCase() !== code.slice(11, 15)) {
      mismatched.push('birthPlaceCode');
    }
  }

  return { checked, mismatched };
}

function parseIsoDate(
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
