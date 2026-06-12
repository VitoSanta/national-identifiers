import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

const LETTER_SERIES = '(?:E|N|PE|AV|PI|SB|EE)';
const PANAMANIAN_ID_PATTERN = new RegExp(
  `^(?:(?:${LETTER_SERIES}-\\d{1,2})|(?:\\d{1,2}(?:-${LETTER_SERIES})?))-\\d{1,4}-\\d{1,6}$`,
);

// Source: Panama DGI, RUC and Digito Verificador guidance.
// For natural persons the RUC is the personal identity-card number. The DGI
// input separates province, optional letter series, folio/image and
// asiento/ficha. The separately assigned DV is not calculated here.
export function validatePanamanianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'PA', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  const rawValue =
    typeof value === 'string' ? value.trim().replace(/\s+/g, '').toUpperCase() : '';

  if (!PANAMANIAN_ID_PATTERN.test(rawValue) || !/[1-9]/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  return { ...base, valid: true, validationLevel: 'format' };
}
