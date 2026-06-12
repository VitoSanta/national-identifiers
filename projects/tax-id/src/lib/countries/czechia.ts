import { TaxIdValidationResult } from '../models';
import { validateBirthNumber } from './birth-number';

export function validateCzechTaxId(value: unknown): TaxIdValidationResult {
  return validateBirthNumber('CZ', value);
}
