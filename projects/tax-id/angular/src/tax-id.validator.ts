import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { TaxIdCountry, TaxIdValidationResult, validateTaxId } from 'tax-id';

export interface TaxIdValidationError {
  readonly taxId: TaxIdValidationResult;
}

export function taxIdValidator(
  country: TaxIdCountry | string | (() => TaxIdCountry | string),
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === undefined || control.value === '') {
      return null;
    }

    const selectedCountry = typeof country === 'function' ? country() : country;
    const result = validateTaxId(selectedCountry, control.value);

    return result.valid ? null : ({ taxId: result } satisfies TaxIdValidationError);
  };
}
