import type { TaxIdValidationEntry } from './country-registry';
import { TaxIdValidationResult } from './models';
import { validateHongKongTaxId } from './countries/hong-kong';
import { validateTaiwanTaxId } from './countries/taiwan';
import { validateDanishTaxId } from './countries/denmark';
import { validateUnitedStatesTaxId } from './countries/united-states';
import { validateJerseyTaxId, validateGuernseyTaxId } from './countries/crown-dependencies';

/**
 * ISO 3166-1 codes for jurisdictions and territories with autonomous tax
 * systems, outside the 195 UN-recognised states. Validated through the same
 * `validateTaxId` entry point but tracked in a separate set so the 195-state
 * coverage invariant stays exact. See docs/COUNTRY-COVERAGE.md.
 */
export type TaxIdTerritory = 'FO' | 'GG' | 'GL' | 'HK' | 'JE' | 'PR' | 'TW';

function withCountry(
  result: TaxIdValidationResult,
  country: TaxIdTerritory,
): TaxIdValidationResult {
  return { ...result, country };
}

// Greenland and the Faroe Islands use the Danish CPR system.
function validateGreenlandTaxId(value: unknown): TaxIdValidationResult {
  return withCountry(validateDanishTaxId(value), 'GL');
}

function validateFaroeTaxId(value: unknown): TaxIdValidationResult {
  return withCountry(validateDanishTaxId(value), 'FO');
}

// Puerto Rico individuals use the US SSN / ITIN.
function validatePuertoRicoTaxId(value: unknown): TaxIdValidationResult {
  return withCountry(validateUnitedStatesTaxId(value), 'PR');
}

export const TAX_ID_TERRITORY_REGISTRY: Readonly<
  Record<TaxIdTerritory, TaxIdValidationEntry>
> = {
  FO: { validate: validateFaroeTaxId },
  GG: { validate: validateGuernseyTaxId },
  GL: { validate: validateGreenlandTaxId },
  HK: { validate: validateHongKongTaxId, validationLevel: 'checksum' },
  JE: { validate: validateJerseyTaxId },
  PR: { validate: validatePuertoRicoTaxId },
  TW: { validate: validateTaiwanTaxId, validationLevel: 'checksum' },
};

export const SUPPORTED_TAX_ID_TERRITORIES = Object.freeze(
  Object.keys(TAX_ID_TERRITORY_REGISTRY).sort() as TaxIdTerritory[],
);

const supportedTerritories = new Set<string>(SUPPORTED_TAX_ID_TERRITORIES);

export function isSupportedTaxIdTerritory(territory: unknown): territory is TaxIdTerritory {
  return typeof territory === 'string' && supportedTerritories.has(territory);
}
