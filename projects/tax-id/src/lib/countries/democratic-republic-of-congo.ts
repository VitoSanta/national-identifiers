import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

// Source: DGI RDC public e-NIF portal and its official usage guide.
// The guide's public NIF search result shows A1011126F; the portal also
// enforces a minimum of nine characters. No checksum is publicly documented.
export function validateCongoleseDrcTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'CD', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 9) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^[A-Z]\d{7}[A-Z]$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}
