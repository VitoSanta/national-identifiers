import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

// Source: OECD AEOI sheet "South Africa - Information on Tax Identification
// Numbers" (SARS): 10-digit reference number starting 0-3 or 9 with modulus-10
// (Luhn) check digit; the 13-digit identity number is a functional equivalent.
export function validateSouthAfricanTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'ZA', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 10 && normalizedValue.length !== 13) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (normalizedValue.length === 10) {
    if (!/^[0-39]\d{9}$/.test(normalizedValue)) {
      return { ...base, valid: false, error: 'invalid_format' };
    }
  } else {
    const month = Number(normalizedValue.slice(2, 4));
    const day = Number(normalizedValue.slice(4, 6));
    const citizenshipDigit = Number(normalizedValue[10]);

    if (
      !/^\d{13}$/.test(normalizedValue) ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31 ||
      citizenshipDigit > 2
    ) {
      return { ...base, valid: false, error: 'invalid_format' };
    }
  }

  if (!passesLuhn(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}

function passesLuhn(digits: string): boolean {
  const sum = [...digits].reverse().reduce((total, digit, index) => {
    const product = Number(digit) * (index % 2 === 0 ? 1 : 2);
    return total + (product > 9 ? product - 9 : product);
  }, 0);

  return sum % 10 === 0;
}
