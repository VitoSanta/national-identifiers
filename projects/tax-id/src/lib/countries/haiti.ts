import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

// Haitian NIF: 10 digits. No public checksum algorithm is claimed.
// Source: DGI decree on the Carte d'Identification Fiscale.
export function validateHaitianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'HT', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 10) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{10}$/.test(normalizedValue) || /^0{10}$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}
