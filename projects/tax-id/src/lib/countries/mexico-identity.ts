import type { TaxIdIdentity, TaxIdIdentityField } from '../identity-consistency';

const VOWELS = 'AEIOU';
const SURNAME_PARTICLES = new Set([
  'DA', 'DAS', 'DE', 'DEL', 'DER', 'DI', 'DIE', 'DD', 'EL', 'LA', 'LAS',
  'LE', 'LES', 'LOS', 'MAC', 'MC', 'VAN', 'VON', 'Y',
]);
const COMMON_FIRST_NAMES = new Set(['JOSE', 'J', 'MARIA', 'MA']);
const INCONVENIENT_WORDS = new Set([
  'BACA', 'BAKA', 'BUEI', 'BUEY', 'CACA', 'CACO', 'CAGA', 'CAGO', 'CAKA',
  'CAKO', 'COGE', 'COGI', 'COJA', 'COJE', 'COJI', 'COJO', 'COLA', 'CULO',
  'FALO', 'FETO', 'GETA', 'GUEI', 'GUEY', 'JETA', 'JOTO', 'KACA', 'KACO',
  'KAGA', 'KAGO', 'KAKA', 'KAKO', 'KOGE', 'KOGI', 'KOJA', 'KOJE', 'KOJI',
  'KOJO', 'KOLA', 'KULO', 'LILO', 'LOCA', 'LOCO', 'LOKA', 'LOKO', 'MAME',
  'MAMO', 'MEAR', 'MEAS', 'MEON', 'MION', 'MOCO', 'MOKO', 'MULA', 'MULO',
  'NACA', 'NACO', 'PEDA', 'PEDO', 'PENE', 'PIPI', 'PITO', 'POPO', 'PUTA',
  'PUTO', 'QULO', 'RATA', 'ROBA', 'ROBE', 'ROBO', 'RUIN', 'SENO', 'TETA',
  'VACA', 'VAGA', 'VAGO', 'VAKA', 'VUEI', 'VUEY', 'WUEI', 'WUEY',
]);

function words(value: string): string[] {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/Ñ/g, 'X')
    .split(/[^A-Z]+/)
    .filter(Boolean);
}

function firstInternal(value: string, alphabet: string): string {
  for (const letter of value.slice(1)) {
    if (alphabet.includes(letter)) return letter;
  }
  return 'X';
}

function effectiveGivenName(value: string): string {
  const parts = words(value);
  return parts.length > 1 && COMMON_FIRST_NAMES.has(parts[0]) ? parts[1] : parts[0] ?? '';
}

function surnames(value: string): [string, string] {
  const parts = words(value).filter((part) => !SURNAME_PARTICLES.has(part));
  return [parts[0] ?? '', parts[1] ?? ''];
}

export function encodeMexicanCurpName(
  firstName: string,
  lastName: string,
): { prefix: string; internalConsonants: string } {
  const givenName = effectiveGivenName(firstName);
  const [paternal, maternal] = surnames(lastName);

  let prefix =
    (paternal[0] ?? 'X') +
    firstInternal(paternal, VOWELS) +
    (maternal[0] ?? 'X') +
    (givenName[0] ?? 'X');
  if (INCONVENIENT_WORDS.has(prefix)) {
    prefix = `${prefix[0]}X${prefix.slice(2)}`;
  }

  return {
    prefix,
    internalConsonants:
      firstInternal(paternal, 'BCDFGHJKLMNPQRSTVWXYZ') +
      firstInternal(maternal, 'BCDFGHJKLMNPQRSTVWXYZ') +
      firstInternal(givenName, 'BCDFGHJKLMNPQRSTVWXYZ'),
  };
}

export function checkMexicanCurpIdentity(
  curp: string,
  identity: TaxIdIdentity,
): { checked: TaxIdIdentityField[]; mismatched: TaxIdIdentityField[] } {
  const checked: TaxIdIdentityField[] = [];
  const mismatched: TaxIdIdentityField[] = [];

  if (identity.lastName) {
    checked.push('lastName');
    const encoded = encodeMexicanCurpName(identity.firstName ?? '', identity.lastName);
    if (encoded.prefix.slice(0, 3) !== curp.slice(0, 3)
      || encoded.internalConsonants.slice(0, 2) !== curp.slice(13, 15)) {
      mismatched.push('lastName');
    }
  }

  if (identity.firstName) {
    checked.push('firstName');
    const encoded = encodeMexicanCurpName(identity.firstName, identity.lastName ?? '');
    if (encoded.prefix[3] !== curp[3] || encoded.internalConsonants[2] !== curp[15]) {
      mismatched.push('firstName');
    }
  }

  return { checked, mismatched };
}
