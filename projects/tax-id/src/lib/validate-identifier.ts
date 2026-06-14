import type {
  IdentifierType,
  TaxIdValidationResult,
} from './models';
import { normalizeTaxId } from './normalize';
import { isSupportedTaxIdCountry } from './supported-countries';
import { isSupportedTaxIdTerritory } from './territory-registry';
import { validateTaxId } from './validate-tax-id';
import { VAT_VALIDATION_REGISTRY } from './vat-registry';
import {
  validateBrazilianCnpj,
  validateIndianGstin,
  validateAustralianAcn,
  validateChineseUscc,
  validateJapaneseCorporateNumber,
  validateTurkishVkn,
} from './countries/company-tax-id';
import { validateNewZealandTaxId } from './countries/new-zealand';
import { validateNorwegianVat } from './countries/european-vat';

export interface IdentifierValidationRequest {
  readonly country: string | null | undefined;
  readonly type: IdentifierType;
  readonly value: unknown;
}

type IdentifierValidator = (value: unknown) => TaxIdValidationResult;

const COMPANY_TAX_ID_REGISTRY: Readonly<Record<string, IdentifierValidator>> = {
  AU: validateAustralianAcn,
  BR: validateBrazilianCnpj,
  CN: validateChineseUscc,
  IN: validateIndianGstin,
  JP: validateJapaneseCorporateNumber,
  TR: validateTurkishVkn,
  // Norway's organisation number and New Zealand's IRD number identify the
  // registered entity and reuse the same checksum as their tax-id rules.
  NO: validateNorwegianVat,
  NZ: validateNewZealandTaxId,
};

export const SUPPORTED_COMPANY_TAX_COUNTRIES = Object.freeze(
  Object.keys(COMPANY_TAX_ID_REGISTRY).sort(),
);

const supportedCompanyTaxCountries = new Set<string>(SUPPORTED_COMPANY_TAX_COUNTRIES);

export function isSupportedCompanyTaxCountry(country: unknown): boolean {
  return typeof country === 'string' && supportedCompanyTaxCountries.has(country);
}

export const SUPPORTED_IDENTIFIER_TYPES = Object.freeze([
  'tax_id_person',
  'vat',
  'tax_id_company',
] as const satisfies readonly IdentifierType[]);

/**
 * Validates an identifier family explicitly.
 *
 * `validateTaxId(country, value)` remains the backward-compatible personal
 * tax-id entry point. This API adds family metadata and never performs live
 * registry lookups.
 */
export function validateIdentifier(
  request: IdentifierValidationRequest,
): TaxIdValidationResult {
  const country =
    typeof request.country === 'string' ? request.country.trim().toUpperCase() : '';
  const type = request.type;

  if (type === 'tax_id_person') {
    return { ...validateTaxId(country, request.value), identifierType: type };
  }

  const registry = type === 'vat' ? VAT_VALIDATION_REGISTRY : COMPANY_TAX_ID_REGISTRY;
  const validator = registry[country as keyof typeof registry];
  if (validator) {
    return { ...validator(request.value), identifierType: type };
  }

  const countryKnown =
    isSupportedTaxIdCountry(country) || isSupportedTaxIdTerritory(country);

  return {
    valid: false,
    country,
    normalizedValue: normalizeTaxId(request.value),
    identifierType: type,
    error: countryKnown ? 'unsupported_identifier_type' : 'unsupported_country',
  };
}
