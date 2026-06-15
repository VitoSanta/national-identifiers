import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import {
  taxIdCheckOutcome,
  validateIdentifier,
} from '../../dist/tax-id/fesm2022/national-identifiers.mjs';

const fixtures = JSON.parse(
  await readFile(
    new URL('../fixtures/identifier-family-contract.json', import.meta.url),
    'utf8',
  ),
);

test('matches the shared identifier-family contract', () => {
  for (const fixture of fixtures) {
    const result = validateIdentifier(fixture);
    const context = `${fixture.country}/${fixture.type}`;

    assert.equal(result.identifierType, fixture.type, `${context} identifier type`);
    assert.equal(result.valid, fixture.valid, `${context} validity`);
    assert.equal(result.error, fixture.error, `${context} error`);
    assert.equal(result.validationLevel, fixture.validationLevel, `${context} level`);
    assert.equal(taxIdCheckOutcome(result), fixture.outcome, `${context} outcome`);
  }
});
