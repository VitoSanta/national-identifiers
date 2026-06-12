import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  SUPPORTED_TAX_ID_COUNTRIES,
  normalizeTaxId,
  validateTaxId,
} from '../../dist/tax-id/fesm2022/tax-id.mjs';

function generatedValues(count) {
  let state = 0x5eed1234;
  const alphabet = ' abcdefghijklmnopqrstuvwxyz0123456789-./_';

  return Array.from({ length: count }, () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    const length = state % 30;
    let value = '';

    for (let index = 0; index < length; index += 1) {
      state = (state * 1664525 + 1013904223) >>> 0;
      value += alphabet[state % alphabet.length];
    }

    return value;
  });
}

test('keeps normalization idempotent for generated inputs', () => {
  for (const value of generatedValues(1_000)) {
    const normalized = normalizeTaxId(value);
    assert.equal(normalizeTaxId(normalized), normalized);
  }
});

test('never throws while validating generated input across supported countries', () => {
  const values = generatedValues(200);

  for (const country of SUPPORTED_TAX_ID_COUNTRIES) {
    for (const value of values) {
      assert.doesNotThrow(() => validateTaxId(country, value), `${country}: ${value}`);
    }
  }
});

test('never throws while checking identity consistency for generated input', async () => {
  const { validateTaxIdIdentity } = await import('../../dist/tax-id/fesm2022/tax-id.mjs');
  const identity = { firstName: 'Mario', lastName: 'Rossi', birthDate: '1985-12-10', gender: 'M', birthPlaceCode: 'A562' };

  for (const value of generatedValues(300)) {
    assert.doesNotThrow(
      () => validateTaxIdIdentity({ country: 'IT', taxId: value, identity }),
      `IT: ${value}`,
    );
  }
});
