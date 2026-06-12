import { TaxIdValidationResult } from '../models';
import { normalizeTaxId } from '../normalize';

export function validateGermanTaxId(value: unknown): TaxIdValidationResult {
  const normalizedValue = normalizeTaxId(value);
  const base = { country: 'DE', normalizedValue } as const;

  if (!normalizedValue) {
    return { ...base, valid: false, error: 'empty' };
  }

  if (normalizedValue.length !== 11) {
    return { ...base, valid: false, error: 'invalid_length' };
  }

  if (!/^\d{11}$/.test(normalizedValue) || normalizedValue[0] === '0') {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  if (!hasValidDigitDistribution(normalizedValue.slice(0, 10))) {
    return { ...base, valid: false, error: 'invalid_format' };
  }

  let product = 10;

  for (const character of normalizedValue.slice(0, 10)) {
    let sum = (Number(character) + product) % 10;
    sum = sum === 0 ? 10 : sum;
    product = (sum * 2) % 11;
  }

  const remainder = 11 - product;
  const expectedCheckDigit = remainder === 10 ? 0 : remainder;

  if (Number(normalizedValue[10]) !== expectedCheckDigit) {
    return { ...base, valid: false, error: 'invalid_checksum' };
  }

  return { ...base, valid: true, validationLevel: 'checksum' };
}

function hasValidDigitDistribution(value: string): boolean {
  const counts = Array.from({ length: 10 }, () => 0);

  for (const character of value) {
    counts[Number(character)] += 1;
  }

  const repeatedTwice = counts.filter((count) => count === 2).length;
  const repeatedThreeTimes = counts.filter((count) => count === 3).length;
  const missing = counts.filter((count) => count === 0).length;
  const remaining = counts.filter((count) => count === 1).length;

  return (
    (repeatedTwice === 1 && repeatedThreeTimes === 0 && missing === 1 && remaining === 8) ||
    (repeatedTwice === 0 && repeatedThreeTimes === 1 && missing === 2 && remaining === 7)
  );
}
