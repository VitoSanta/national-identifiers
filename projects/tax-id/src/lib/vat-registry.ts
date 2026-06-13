import type { TaxIdValidationResult } from './models';
import {
  validateAustrianVat,
  validateAustralianVat,
  validateBelgianVat,
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
  | 'AT' | 'AU' | 'BE' | 'CH' | 'CY' | 'CZ' | 'DE' | 'DK' | 'EE'
  | 'ES' | 'FI' | 'FR' | 'GB' | 'GR' | 'HR' | 'HU' | 'IE' | 'IT'
  | 'LT' | 'LU' | 'LV' | 'MT' | 'NL' | 'NO' | 'PL' | 'PT' | 'RO'
  | 'SE' | 'SI' | 'SK';

export const VAT_VALIDATION_REGISTRY: Readonly<
  Record<VatCountry, (value: unknown) => TaxIdValidationResult>
> = {
  AT: validateAustrianVat,
  AU: validateAustralianVat,
  BE: validateBelgianVat,
  CH: validateSwissVat,
  CY: validateCypriotVat,
  CZ: validateCzechVat,
  DE: validateGermanVat,
  DK: validateDanishVat,
  EE: validateEstonianVat,
  ES: validateSpanishVat,
  FI: validateFinnishVat,
  FR: validateFrenchVat,
  GB: validateBritishVat,
  GR: (value) => withChecksumLevel(
    validateGreekTaxId(withoutPrefix(value, ['EL', 'GR'])),
  ),
  HR: (value) => withChecksumLevel(
    validateCroatianTaxId(withoutPrefix(value, ['HR'])),
  ),
  HU: validateHungarianVat,
  IE: (value) => withChecksumLevel(
    validateIrishTaxId(withoutPrefix(value, ['IE'])),
  ),
  IT: (value) => withChecksumLevel(
    validateItalianVatNumber(withoutPrefix(value, ['IT'])),
  ),
  LT: validateLithuanianVat,
  LU: validateLuxembourgVat,
  LV: validateLatvianVat,
  MT: validateMalteseVat,
  NL: validateDutchVat,
  NO: validateNorwegianVat,
  PL: validatePolishVat,
  PT: (value) => withChecksumLevel(
    validatePortugueseTaxId(withoutPrefix(value, ['PT'])),
  ),
  RO: validateRomanianVat,
  SE: validateSwedishVat,
  SI: validateSlovenianVat,
  SK: validateSlovakVat,
};

export const SUPPORTED_VAT_COUNTRIES = Object.freeze(
  Object.keys(VAT_VALIDATION_REGISTRY).sort() as VatCountry[],
);

const supportedVatCountries = new Set<string>(SUPPORTED_VAT_COUNTRIES);

export function isSupportedVatCountry(country: unknown): country is VatCountry {
  return typeof country === 'string' && supportedVatCountries.has(country);
}
