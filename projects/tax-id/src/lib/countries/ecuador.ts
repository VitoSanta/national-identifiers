import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateEcuadorianTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'EC', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 10 && normalizedValue.length !== 13) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d+$/.test(normalizedValue)) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  // A personal RUC is the cedula followed by a three-digit establishment code.
  if (normalizedValue.length === 13 && normalizedValue.slice(10) === '000') {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const cedula = normalizedValue.slice(0, 10);
  const province = Number(cedula.slice(0, 2));
  const thirdDigit = Number(cedula[2]);

  if (((province < 1 || province > 24) && province !== 30) || thirdDigit > 5) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  const weightedSum = [...cedula.slice(0, 9)].reduce((sum, digit, index) => {
    const product = Number(digit) * (index % 2 === 0 ? 2 : 1);
    return sum + (product > 9 ? product - 9 : product);
  }, 0);
  const expectedCheckDigit = (10 - (weightedSum % 10)) % 10;

  if (Number(cedula[9]) !== expectedCheckDigit) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}
