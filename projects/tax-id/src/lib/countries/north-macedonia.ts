import { TaxIdValidationResult } from '../models';
import { validateJmbg } from './jmbg';

export function validateNorthMacedonianTaxId(value: unknown): TaxIdValidationResult {
  return validateJmbg('MK', value, (region) => region === 4 || (region >= 40 && region <= 49));
}
