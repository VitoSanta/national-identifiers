import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

const WEIGHTS = [2, 7, 6, 5, 4, 3, 2];
const ST_CHECK_CHARACTERS = 'JZIHGFEDCBA';
const FG_CHECK_CHARACTERS = 'XWUTRQPNMLK';

export function validateSingaporeanTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'SG', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 9) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^[STFGM]\d{7}[A-Z]$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const prefix = normalizedValue[0];

  // The check-letter table for the M series (issued from 2022) is not published
  // by an institutional source, so M-prefixed FINs are validated as format-only.
  if (prefix === 'M') {
    return { ...base, valid: true, validationLevel: 'format' };
  }

  const weightedSum =
    [...normalizedValue.slice(1, 8)].reduce(
      (sum, digit, index) => sum + Number(digit) * WEIGHTS[index],
      0,
    ) + (prefix === 'T' || prefix === 'G' ? 4 : 0);

  const checkCharacters = prefix === 'S' || prefix === 'T' ? ST_CHECK_CHARACTERS : FG_CHECK_CHARACTERS;

  if (normalizedValue[8] !== checkCharacters[weightedSum % 11]) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}
