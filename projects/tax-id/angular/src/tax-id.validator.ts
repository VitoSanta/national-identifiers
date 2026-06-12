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
   * `policy` (default) blocks only definitive failures (`block` outcome of
   * `taxIdCheckOutcome`). Advisory `warn` results — format or length errors
   * in countries with format-only rules, unsupported countries, countries
   * without a personal TIN — return `null`: the control stays valid and the
   * user sees no error. Handle the `warn` signal server-side by storing and
   * flagging the value.
   *
   * `strict` rejects every non-valid result, including advisory warnings.
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
