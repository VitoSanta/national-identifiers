import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import {
  taxIdCheckOutcome,
  validateIdentifier,
} from '../../dist/tax-id/fesm2022/national-identifiers.mjs';

const examples = JSON.parse(
  await readFile(
    new URL('../fixtures/public-examples.json', import.meta.url),
    'utf8',
  ),
);

test('public examples match the documented validation contract', () => {
  for (const example of examples) {
    const result = validateIdentifier(example);
    const context = `${example.id} (${example.country}/${example.type})`;

    assert.equal(result.identifierType, example.type, `${context} identifier type`);
    assert.equal(result.valid, example.valid, `${context} validity`);
    assert.equal(result.error, example.error, `${context} error`);
    assert.equal(
      result.validationLevel,
      example.validationLevel,
      `${context} validation level`,
    );
    assert.equal(taxIdCheckOutcome(result), example.outcome, `${context} outcome`);
  }
});
