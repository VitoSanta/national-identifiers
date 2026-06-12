import { TaxIdValidationResult } from '../models';
import { validateBirthNumber } from './birth-number';

export function validateSlovakTaxId(value: unknown): TaxIdValidationResult {
  return validateBirthNumber('SK', value);
}
