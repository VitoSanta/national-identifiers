import type { TaxIdValidationEntry } from './country-registry';
import type { TaxIdValidationResult } from './models';
import {
  validateAustrianVat,
  validateAustralianVat,
  validateBelgianVat,
  validateBulgarianVat,
  validateCypriotVat,
  validateCzechVat,
  validateDanishVat,
  validateDutchVat,
  validateEstonianVat,
  validateFinnishVat,
  validateFrenchVat,
  validateGermanVat,
  validateBritishVat,
  validateHungarianVat,
  validateLuxembourgVat,
  validateLatvianVat,
  validateLithuanianVat,
  validateMalteseVat,
  validateNorwegianVat,
  validatePolishVat,
  validateRomanianVat,
  validateSpanishVat,
  validateSlovakVat,
  validateSlovenianVat,
  validateSwedishVat,
  validateSwissVat,
} from './countries/european-vat';
import { validateCroatianTaxId } from './countries/croatia';
import { validateGreekTaxId } from './countries/greece';
import { validateItalianVatNumber } from './countries/italy';
import { validateIrishTaxId } from './countries/ireland';
import { validatePortugueseTaxId } from './countries/portugal';
// Non-EU VAT reusing the same checksummed identifier as the registered entity.
import { validateChileanTaxId } from './countries/chile';
import { validateColombianTaxId } from './countries/colombia';
import { validateArgentineTaxId } from './countries/argentina';
import { validateRussianTaxId } from './countries/russia';
import { validateIsraeliTaxId } from './countries/israel';
import { validateSerbianPib } from './countries/company-tax-id';
import { validateEmiratiVat } from './countries/non-european-vat';

function withoutPrefix(
  value: unknown,
  prefixes: readonly string[],
): unknown {
  if (typeof value !== 'string') return value;
  const normalized = value.trim().toUpperCase();
  const prefix = prefixes.find((candidate) => normalized.startsWith(candidate));
  return prefix ? normalized.slice(prefix.length) : value;
}

function withChecksumLevel(
  result: TaxIdValidationResult,
): TaxIdValidationResult {
  return result.valid && !result.validationLevel
    ? { ...result, validationLevel: 'checksum' }
    : result;
}

export type VatCountry =
  | 'AE' | 'AR' | 'AT' | 'AU' | 'BE' | 'BG' | 'CH' | 'CL' | 'CO' | 'CY' | 'CZ'
  | 'DE' | 'DK' | 'EE' | 'ES' | 'FI' | 'FR' | 'GB' | 'GR' | 'HR' | 'HU'
  | 'IE' | 'IL' | 'IT' | 'LT' | 'LU' | 'LV' | 'MT' | 'NL' | 'NO' | 'PL'
  | 'PT' | 'RO' | 'RS' | 'RU' | 'SE' | 'SI' | 'SK';

export const VAT_VALIDATION_REGISTRY: Readonly<
  Record<VatCountry, TaxIdValidationEntry>
> = {
  AE: { validate: validateEmiratiVat, validationLevel: 'format' },
  AR: { validate: (value) => withChecksumLevel(validateArgentineTaxId(value)), validationLevel: 'checksum' },
  AT: { validate: validateAustrianVat, validationLevel: 'checksum' },
  AU: { validate: validateAustralianVat, validationLevel: 'checksum' },
  BE: { validate: validateBelgianVat, validationLevel: 'checksum' },
  BG: { validate: validateBulgarianVat, validationLevel: 'checksum' },
  CH: { validate: validateSwissVat, validationLevel: 'checksum' },
  CL: { validate: (value) => withChecksumLevel(validateChileanTaxId(value)), validationLevel: 'checksum' },
  CO: { validate: (value) => withChecksumLevel(validateColombianTaxId(value)), validationLevel: 'checksum' },
  CY: { validate: validateCypriotVat, validationLevel: 'checksum' },
  CZ: { validate: validateCzechVat, validationLevel: 'checksum' },
  DE: { validate: validateGermanVat, validationLevel: 'checksum' },
  DK: { validate: validateDanishVat, validationLevel: 'checksum' },
  EE: { validate: validateEstonianVat, validationLevel: 'checksum' },
  ES: { validate: validateSpanishVat, validationLevel: 'checksum' },
  FI: { validate: validateFinnishVat, validationLevel: 'checksum' },
  FR: { validate: validateFrenchVat, validationLevel: 'checksum' },
  GB: {
    validate: validateBritishVat,
    validationLevel: 'checksum',
    policyValidationLevel: (value) => /^(GD|HA)/.test(value) ? 'format' : 'checksum',
  },
  GR: {
    validate: (value) => withChecksumLevel(
      validateGreekTaxId(withoutPrefix(value, ['EL', 'GR'])),
    ),
    validationLevel: 'checksum',
  },
  HR: {
    validate: (value) => withChecksumLevel(
      validateCroatianTaxId(withoutPrefix(value, ['HR'])),
    ),
    validationLevel: 'checksum',
  },
  HU: { validate: validateHungarianVat, validationLevel: 'checksum' },
  IE: {
    validate: (value) => withChecksumLevel(
      validateIrishTaxId(withoutPrefix(value, ['IE'])),
    ),
    validationLevel: 'checksum',
  },
  IL: {
    validate: (value) => withChecksumLevel(validateIsraeliTaxId(value)),
    validationLevel: 'checksum',
  },
  IT: {
    validate: (value) => withChecksumLevel(
      validateItalianVatNumber(withoutPrefix(value, ['IT'])),
    ),
    validationLevel: 'checksum',
  },
  LT: { validate: validateLithuanianVat, validationLevel: 'checksum' },
  LU: { validate: validateLuxembourgVat, validationLevel: 'checksum' },
  LV: { validate: validateLatvianVat, validationLevel: 'checksum' },
  MT: { validate: validateMalteseVat, validationLevel: 'checksum' },
  NL: { validate: validateDutchVat, validationLevel: 'checksum' },
  NO: { validate: validateNorwegianVat, validationLevel: 'checksum' },
  PL: { validate: validatePolishVat, validationLevel: 'checksum' },
  PT: {
    validate: (value) => withChecksumLevel(
      validatePortugueseTaxId(withoutPrefix(value, ['PT'])),
    ),
    validationLevel: 'checksum',
  },
  RO: { validate: validateRomanianVat, validationLevel: 'checksum' },
  RS: { validate: validateSerbianPib, validationLevel: 'checksum' },
  RU: {
    validate: (value) => withChecksumLevel(validateRussianTaxId(value)),
    validationLevel: 'checksum',
  },
  SE: { validate: validateSwedishVat, validationLevel: 'checksum' },
  SI: { validate: validateSlovenianVat, validationLevel: 'checksum' },
  SK: { validate: validateSlovakVat, validationLevel: 'checksum' },
};

export const SUPPORTED_VAT_COUNTRIES = Object.freeze(
  Object.keys(VAT_VALIDATION_REGISTRY).sort() as VatCountry[],
);

const supportedVatCountries = new Set<string>(SUPPORTED_VAT_COUNTRIES);

export function isSupportedVatCountry(country: unknown): country is VatCountry {
  return typeof country === 'string' && supportedVatCountries.has(country);
}
