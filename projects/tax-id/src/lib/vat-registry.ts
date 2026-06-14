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
  | 'AR' | 'AT' | 'AU' | 'BE' | 'BG' | 'CH' | 'CL' | 'CO' | 'CY' | 'CZ'
  | 'DE' | 'DK' | 'EE' | 'ES' | 'FI' | 'FR' | 'GB' | 'GR' | 'HR' | 'HU'
  | 'IE' | 'IL' | 'IT' | 'LT' | 'LU' | 'LV' | 'MT' | 'NL' | 'NO' | 'PL'
  | 'PT' | 'RO' | 'RU' | 'SE' | 'SI' | 'SK';

export const VAT_VALIDATION_REGISTRY: Readonly<
  Record<VatCountry, (value: unknown) => TaxIdValidationResult>
> = {
  AR: (value) => withChecksumLevel(validateArgentineTaxId(value)),
  AT: validateAustrianVat,
  AU: validateAustralianVat,
  BE: validateBelgianVat,
  BG: validateBulgarianVat,
  CH: validateSwissVat,
  CL: (value) => withChecksumLevel(validateChileanTaxId(value)),
  CO: (value) => withChecksumLevel(validateColombianTaxId(value)),
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
  IL: (value) => withChecksumLevel(validateIsraeliTaxId(value)),
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
  RU: (value) => withChecksumLevel(validateRussianTaxId(value)),
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
