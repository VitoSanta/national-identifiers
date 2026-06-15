import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import {
  taxIdCheckOutcome,
  validateTaxId,
} from '../../dist/tax-id/fesm2022/national-identifiers.mjs';

const fixtures = JSON.parse(
  await readFile(
    new URL('../fixtures/cross-runtime-contract.json', import.meta.url),
    'utf8',
  ),
);

test('matches the shared cross-runtime validation contract', () => {
  for (const fixture of fixtures) {
    const result = validateTaxId(fixture.country, fixture.value);

    assert.equal(result.valid, fixture.valid, `${fixture.country} validity`);
    assert.equal(result.error, fixture.error, `${fixture.country} error`);
    assert.equal(
      result.validationLevel,
      fixture.validationLevel,
      `${fixture.country} validation level`,
    );
    assert.equal(
      taxIdCheckOutcome(result),
      fixture.outcome,
      `${fixture.country} policy outcome`,
    );
  }
});
