import { TaxIdValidationResult } from '../models';
import { validateJmbg } from './jmbg';

export function validateSerbianTaxId(value: unknown): TaxIdValidationResult {
  return validateJmbg('RS', value, (region) => region <= 9 || region >= 70);
}
