import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { validateTaxIdIdentity } from '../../dist/tax-id/fesm2022/tax-id.mjs';

const fixtures = JSON.parse(
  await readFile(
    new URL('../fixtures/identity-consistency-contract.json', import.meta.url),
    'utf8',
  ),
);

test('matches the shared identity-consistency contract', () => {
  for (const fixture of fixtures) {
    const result = validateTaxIdIdentity({
      country: fixture.country,
      taxId: fixture.taxId,
      identity: fixture.identity,
    });

    const context = `${fixture.country} ${fixture.taxId}`;
    assert.equal(result.status, fixture.status, `${context} status`);
    assert.equal(result.taxIdValid, fixture.taxIdValid, `${context} taxIdValid`);
    assert.deepEqual([...result.checkedFields], fixture.checkedFields, `${context} checked`);
    assert.deepEqual([...result.mismatchedFields], fixture.mismatchedFields, `${context} mismatched`);
    assert.deepEqual([...result.missingFields], fixture.missingFields, `${context} missing`);
  }
});
