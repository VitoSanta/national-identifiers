import { TaxIdValidationResult } from '../models';
import { validateJmbg } from './jmbg';

export function validateMontenegrinTaxId(value: unknown): TaxIdValidationResult {
  return validateJmbg('ME', value, (region) => region === 2 || (region >= 20 && region <= 29));
}
