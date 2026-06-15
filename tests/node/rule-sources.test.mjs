import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import {
  COMPANY_TAX_ID_REGISTRY,
  SUPPORTED_COMPANY_TAX_COUNTRIES,
  SUPPORTED_TAX_ID_COUNTRIES,
  SUPPORTED_TAX_ID_TERRITORIES,
  SUPPORTED_VAT_COUNTRIES,
  VAT_VALIDATION_REGISTRY,
} from '../../dist/tax-id/fesm2022/tax-id.mjs';

const [catalogue, countryRegistrySource, territoryRegistrySource] =
  await Promise.all([
    readFile(
      new URL('../fixtures/rule-sources.json', import.meta.url),
      'utf8',
    ).then(JSON.parse),
    readFile(
      new URL('../../projects/tax-id/src/lib/country-registry.ts', import.meta.url),
      'utf8',
    ),
    readFile(
      new URL('../../projects/tax-id/src/lib/territory-registry.ts', import.meta.url),
      'utf8',
    ),
  ]);

const sourceTypes = new Set([
  'tax_authority',
  'legislation',
  'official_specification',
  'intergovernmental',
  'government_registry',
  'government_portal',
]);
const provenanceStatuses = new Set([
  'verified',
  'corroborated',
  'documented_limit',
]);
const forbiddenSourceHosts = [
  'wikipedia.org',
  'github.com',
  'npmjs.com',
  'stackoverflow.com',
];
const millisecondsPerDay = 24 * 60 * 60 * 1000;

function countriesFor(identifierType, jurisdictionType = 'state') {
  return catalogue
    .filter(
      (entry) =>
        entry.identifierType === identifierType &&
        entry.jurisdictionType === jurisdictionType,
    )
    .map((entry) => entry.country)
    .sort();
}

function sourceRegistryLevel(source, country) {
  const block = source.match(
    new RegExp(
      `^  ${country}: (?<body>[\\s\\S]*?)(?=^  [A-Z]{2}: |^};)`,
      'm',
    ),
  )?.groups?.body ?? '';
  assert.ok(block, `${country} source registry entry`);
  if (block.includes(`notApplicable('${country}')`)) return 'not_applicable';
  return block.includes("validationLevel: 'checksum'") ? 'checksum' : 'format';
}

function assertDate(value, field, context) {
  assert.match(value, /^\d{4}-\d{2}-\d{2}$/, `${context} ${field}`);
  const parsed = Date.parse(`${value}T00:00:00Z`);
  assert.ok(Number.isFinite(parsed), `${context} ${field} must be a valid date`);
  return parsed;
}

test('covers every supported registry entry exactly once', () => {
  assert.equal(catalogue.length, 252);
  assert.deepEqual(
    countriesFor('tax_id_person'),
    [...SUPPORTED_TAX_ID_COUNTRIES],
  );
  assert.deepEqual(
    countriesFor('tax_id_person', 'territory'),
    [...SUPPORTED_TAX_ID_TERRITORIES],
  );
  assert.deepEqual(countriesFor('vat'), [...SUPPORTED_VAT_COUNTRIES]);
  assert.deepEqual(
    countriesFor('tax_id_company'),
    [...SUPPORTED_COMPANY_TAX_COUNTRIES],
  );

  const keys = catalogue.map(
    (entry) =>
      `${entry.jurisdictionType}:${entry.country}:${entry.identifierType}`,
  );
  assert.equal(new Set(keys).size, keys.length, 'catalogue keys must be unique');
});

test('matches registry validation metadata and source-policy requirements', () => {
  const now = Date.now();

  for (const entry of catalogue) {
    const context = `${entry.country}/${entry.identifierType}`;
    assert.match(entry.country, /^[A-Z]{2}$/, `${context} country`);
    assert.ok(
      entry.jurisdictionType === 'state' ||
        entry.jurisdictionType === 'territory',
      `${context} jurisdiction type`,
    );
    assert.ok(entry.identifierName.length >= 2, `${context} identifier name`);
    assert.ok(entry.authority.length >= 3, `${context} authority`);
    assert.ok(
      sourceTypes.has(entry.sourceType),
      `${context} source type '${entry.sourceType}'`,
    );
    assert.ok(
      provenanceStatuses.has(entry.provenanceStatus),
      `${context} provenance status '${entry.provenanceStatus}'`,
    );
    assert.ok(Array.isArray(entry.limitations), `${context} limitations`);

    const sourceUrl = new URL(entry.sourceUrl);
    assert.equal(sourceUrl.protocol, 'https:', `${context} source URL protocol`);
    assert.ok(
      forbiddenSourceHosts.every(
        (host) =>
          sourceUrl.hostname !== host &&
          !sourceUrl.hostname.endsWith(`.${host}`),
      ),
      `${context} must use an institutional source`,
    );

    const accessedAt = assertDate(entry.accessedAt, 'accessedAt', context);
    const reviewedAt = assertDate(
      entry.lastReviewedAt,
      'lastReviewedAt',
      context,
    );
    assert.ok(
      reviewedAt >= accessedAt,
      `${context} cannot be reviewed before source access`,
    );
    assert.ok(
      reviewedAt <= now + millisecondsPerDay,
      `${context} review date cannot be in the future`,
    );
    assert.ok(
      now - reviewedAt <= 366 * millisecondsPerDay,
      `${context} source review is older than one year`,
    );

    if (entry.provenanceStatus !== 'verified') {
      assert.ok(
        entry.limitations.some((limitation) => limitation.length >= 3),
        `${context} must explain its evidence boundary`,
      );
    }

    if (entry.identifierType === 'tax_id_person') {
      const source =
        entry.jurisdictionType === 'territory'
          ? territoryRegistrySource
          : countryRegistrySource;
      assert.equal(
        entry.validationLevel,
        sourceRegistryLevel(source, entry.country),
        `${context} validation level`,
      );
      continue;
    }

    const registry =
      entry.identifierType === 'vat'
        ? VAT_VALIDATION_REGISTRY
        : COMPANY_TAX_ID_REGISTRY;
    const registryEntry = registry[entry.country];
    assert.ok(registryEntry, `${context} registry entry`);
    assert.equal(
      entry.validationLevel,
      registryEntry.validationLevel,
      `${context} validation level`,
    );
  }
});

test('contains no unresolved provenance workflow states', () => {
  assert.equal(
    catalogue.some((entry) => entry.provenanceStatus === 'needs_review'),
    false,
  );
});
