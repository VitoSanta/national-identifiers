import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  SUPPORTED_COMPANY_TAX_COUNTRIES,
  SUPPORTED_TAX_ID_COUNTRIES,
  SUPPORTED_TAX_ID_TERRITORIES,
  SUPPORTED_VAT_COUNTRIES,
  normalizeTaxId,
  validateIdentifier,
  validateTaxId,
} from '../../dist/tax-id/fesm2022/national-identifiers.mjs';

function generatedValues(count) {
  let state = 0x5eed1234;
  const alphabet = ' abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-./_\t\n\r\u00a0\u200b\u200d\u202f\uFEFFàèìòùÇÑΩЖ中🙂';

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

function edgeValues() {
  return [
    null,
    undefined,
    true,
    false,
    0,
    1234567890,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    {},
    [],
    ['RSSMRA85T10A562S'],
    ' '.repeat(512),
    'A'.repeat(2_048),
    '\u0000\u0001\u0002',
    '１２３４５６７８９０',
    'א-ب-中-🙂',
    'RSS\u200bMRA\uFEFF85T10A562S',
  ];
}

function fuzzValues(count) {
  return [...generatedValues(count), ...edgeValues()];
}

test('keeps normalization idempotent for generated inputs', () => {
  for (const value of fuzzValues(1_000)) {
    const normalized = normalizeTaxId(value);
    assert.equal(typeof normalized, 'string');
    assert.equal(normalizeTaxId(normalized), normalized);
  }
});

test('never throws while validating generated input across supported countries', () => {
  const values = fuzzValues(200);

  for (const country of SUPPORTED_TAX_ID_COUNTRIES) {
    for (const value of values) {
      assert.doesNotThrow(() => validateTaxId(country, value), `${country}: ${value}`);
    }
  }
});

test('never throws while validating generated input across supported territories', () => {
  const values = fuzzValues(200);

  for (const territory of SUPPORTED_TAX_ID_TERRITORIES) {
    for (const value of values) {
      assert.doesNotThrow(() => validateTaxId(territory, value), `${territory}: ${value}`);
    }
  }
});

test('never throws for malformed country input', () => {
  const countries = [null, undefined, '', ' ', 'it', ' usa ', '1T', '🏳️', '\u0000US'];

  for (const country of countries) {
    for (const value of fuzzValues(100)) {
      assert.doesNotThrow(() => validateTaxId(country, value), `${country}: ${value}`);
    }
  }
});

test('never throws while validating generated VAT and company identifiers', () => {
  const values = fuzzValues(120);
  const requests = [
    ...SUPPORTED_VAT_COUNTRIES.map((country) => ({ country, type: 'vat' })),
    ...SUPPORTED_COMPANY_TAX_COUNTRIES.map((country) => ({
      country,
      type: 'tax_id_company',
    })),
  ];

  for (const request of requests) {
    for (const value of values) {
      assert.doesNotThrow(
        () => validateIdentifier({ ...request, value }),
        `${request.country}/${request.type}: ${value}`,
      );
    }
  }
});

test('never throws while checking identity consistency for generated input', async () => {
  const { validateTaxIdIdentity } = await import('../../dist/tax-id/fesm2022/national-identifiers.mjs');
  const identity = { firstName: 'Mario', lastName: 'Rossi', birthDate: '1985-12-10', gender: 'M', birthPlaceCode: 'A562' };

  for (const value of fuzzValues(300)) {
    assert.doesNotThrow(
      () => validateTaxIdIdentity({ country: 'IT', taxId: value, identity }),
      `IT: ${value}`,
    );
  }
});
