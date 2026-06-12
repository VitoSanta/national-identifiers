import { TaxIdValidationResult } from '../models';
import { validateJmbg } from './jmbg';

export function validateBosnianTaxId(value: unknown): TaxIdValidationResult {
  return validateJmbg('BA', value, (region) => region === 1 || (region >= 10 && region <= 19));
}
