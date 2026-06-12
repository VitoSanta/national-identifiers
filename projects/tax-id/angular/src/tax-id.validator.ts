import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import {
  TaxIdCountry,
  TaxIdValidationResult,
  taxIdCheckOutcome,
  validateTaxId,
} from 'tax-id';

export interface TaxIdValidationError {
  readonly taxId: TaxIdValidationResult;
}

export type TaxIdValidatorMode = 'policy' | 'strict';

export interface TaxIdValidatorOptions {
  /**
   * `policy` blocks only definitive failures and allows advisory warnings.
   * `strict` rejects every non-valid result.
   */
  readonly mode?: TaxIdValidatorMode;
}

export function taxIdValidator(
  country: TaxIdCountry | string | (() => TaxIdCountry | string),
  options: TaxIdValidatorOptions = {},
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === undefined || control.value === '') {
      return null;
    }

    const selectedCountry = typeof country === 'function' ? country() : country;
    const result = validateTaxId(selectedCountry, control.value);

    if (result.valid) {
      return null;
    }

    const shouldBlock =
      options.mode === 'strict' || taxIdCheckOutcome(result) === 'block';

    return shouldBlock
      ? ({ taxId: result } satisfies TaxIdValidationError)
      : null;
  };
}
