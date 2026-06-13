import { TaxIdCountry, TaxIdValidationResult } from './models';
import { normalizeTaxId } from './normalize';
import { TAX_ID_VALIDATION_REGISTRY } from './country-registry';
import { TAX_ID_TERRITORY_REGISTRY, TaxIdTerritory } from './territory-registry';

export function validateTaxId(
  country: TaxIdCountry | TaxIdTerritory | string | null | undefined,
  value: unknown,
): TaxIdValidationResult {
  const normalizedCountry =
    typeof country === 'string' ? country.trim().toUpperCase() : '';

  const entry = TAX_ID_VALIDATION_REGISTRY[
    normalizedCountry as TaxIdCountry
  ];

  if (entry) {
    const result = entry.validate(value);

    if (result.valid && !result.validationLevel && entry.validationLevel) {
      return { ...result, validationLevel: entry.validationLevel };
    }

    return result;
  }

  // Territories and autonomous tax jurisdictions outside the 195 UN states.
  const territory = TAX_ID_TERRITORY_REGISTRY[normalizedCountry as TaxIdTerritory];
  if (territory) {
    const result = territory.validate(value);

    if (result.valid && !result.validationLevel && territory.validationLevel) {
      return { ...result, validationLevel: territory.validationLevel };
    }

    return result;
  }

  return {
    valid: false,
    country: normalizedCountry,
    normalizedValue: normalizeTaxId(value),
    error: 'unsupported_country',
  };
}
