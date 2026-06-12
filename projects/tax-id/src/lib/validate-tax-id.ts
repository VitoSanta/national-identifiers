import { TaxIdCountry, TaxIdValidationResult } from './models';
import { normalizeTaxId } from './normalize';
import { TAX_ID_VALIDATION_REGISTRY } from './country-registry';

export function validateTaxId(
  country: TaxIdCountry | string | null | undefined,
  value: unknown,
): TaxIdValidationResult {
  const normalizedCountry =
    typeof country === 'string' ? country.trim().toUpperCase() : '';

  const entry = TAX_ID_VALIDATION_REGISTRY[
    normalizedCountry as TaxIdCountry
  ];

  if (entry) {
    return entry.validate(value);
  }

  return {
    valid: false,
    country: normalizedCountry,
    normalizedValue: normalizeTaxId(value),
    error: 'unsupported_country',
  };
}
