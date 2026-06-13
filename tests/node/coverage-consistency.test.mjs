import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const files = {
  checkOutcome: 'projects/tax-id/src/lib/check-outcome.ts',
  csharpDispatcher: 'packages/dotnet/NationalIdentifiers.Core/TaxIdValidator.cs',
  csharpPolicy: 'packages/dotnet/NationalIdentifiers.Core/TaxIdPolicy.cs',
  manualDemo: 'projects/manual-test/src/app/app.ts',
  readme: 'README.md',
  coverage: 'docs/COUNTRY-COVERAGE.md',
  tsRegistry: 'projects/tax-id/src/lib/country-registry.ts',
  tsModel: 'projects/tax-id/src/lib/models.ts',
  tsSupportedCountries: 'projects/tax-id/src/lib/supported-countries.ts',
  csharpSupportedCountries: 'packages/dotnet/NationalIdentifiers.Core/TaxIdCountries.cs',
  csharpTerritoryDispatcher: 'packages/dotnet/NationalIdentifiers.Core/TaxIdTerritoryValidator.cs',
  csharpSupportedTerritories: 'packages/dotnet/NationalIdentifiers.Core/TaxIdTerritories.cs',
  tsTerritoryRegistry: 'projects/tax-id/src/lib/territory-registry.ts',
  tsVatRegistry: 'projects/tax-id/src/lib/vat-registry.ts',
  csharpVatCountries: 'packages/dotnet/NationalIdentifiers.Core/VatCountries.cs',
};

async function read(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), 'utf8');
}

function matches(source, pattern) {
  return [...source.matchAll(pattern)].map((match) => match[1]);
}

function uniqueSet(name, values) {
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
  assert.deepEqual(duplicates, [], `${name} contains duplicate country codes`);
  return new Set(values);
}

function assertSameCountries(expectedName, expected, actualName, actual) {
  const missing = [...expected].filter((country) => !actual.has(country)).sort();
  const unexpected = [...actual].filter((country) => !expected.has(country)).sort();

  assert.deepEqual(
    { missing, unexpected },
    { missing: [], unexpected: [] },
    `${actualName} is out of sync with ${expectedName}`,
  );
}

test('keeps supported country coverage aligned across every runtime and the demo', async () => {
  const [
    coverage,
    tsModel,
    tsRegistry,
    tsSupportedCountries,
    csharpDispatcher,
    csharpSupportedCountries,
    manualDemo,
    readme,
  ] =
    await Promise.all([
      read(files.coverage),
      read(files.tsModel),
      read(files.tsRegistry),
      read(files.tsSupportedCountries),
      read(files.csharpDispatcher),
      read(files.csharpSupportedCountries),
      read(files.manualDemo),
      read(files.readme),
    ]);

  const checkedCountries = uniqueSet(
    'country coverage checked countries',
    matches(coverage, /^- \[x\] ([A-Z]{2}) -/gm),
  );
  const allTodoCountries = uniqueSet(
    'country coverage countries',
    matches(coverage, /^- \[[ x]\] ([A-Z]{2}) -/gm),
  );
  const modelCountries = uniqueSet(
    'TaxIdCountry',
    matches(tsModel, /^\s*\| '([A-Z]{2})'/gm),
  );
  const tsRegistryCountries = uniqueSet(
    'TypeScript registry',
    matches(tsRegistry, /^\s*([A-Z]{2}):/gm),
  );
  const csharpDispatcherCountries = uniqueSet(
    '.NET dispatcher',
    matches(csharpDispatcher, /^\s*"([A-Z]{2})"\s*=>/gm),
  );
  const tsSupportedCountryBlock = tsSupportedCountries.match(
    /SUPPORTED_TAX_ID_COUNTRIES = Object\.freeze\(\[(?<countries>[\s\S]*?)\]\s+as const/,
  )?.groups?.countries;
  assert.ok(tsSupportedCountryBlock, 'TypeScript supported countries list was not found');
  const tsSupportedCountryCodes = uniqueSet(
    'TypeScript supported countries API',
    matches(tsSupportedCountryBlock, /'([A-Z]{2})'/g),
  );
  const csharpSupportedCountryBlock = csharpSupportedCountries.match(
    /Array\.AsReadOnly\(\s*\[(?<countries>[\s\S]*?)\]\);/,
  )?.groups?.countries;
  assert.ok(csharpSupportedCountryBlock, '.NET supported countries list was not found');
  const csharpSupportedCountryCodes = uniqueSet(
    '.NET supported countries API',
    matches(csharpSupportedCountryBlock, /"([A-Z]{2})"/g),
  );
  const countriesBlock = manualDemo.match(
    /protected readonly countries = \[(?<countries>[\s\S]*?)\n  \];\n\n  protected readonly territories/,
  )?.groups?.countries;
  assert.ok(countriesBlock, 'manual-test countries list was not found');
  const manualCountries = uniqueSet(
    'manual-test country selector',
    matches(countriesBlock, /\{ code: '([A-Z]{2})', label:/g),
  );

  assert.equal(allTodoCountries.size, 195, 'country coverage must list all 195 target countries');
  assertSameCountries('country coverage', checkedCountries, 'TaxIdCountry', modelCountries);
  assertSameCountries('country coverage', checkedCountries, 'TypeScript registry', tsRegistryCountries);
  assertSameCountries(
    'country coverage',
    checkedCountries,
    'TypeScript supported countries API',
    tsSupportedCountryCodes,
  );
  assertSameCountries('country coverage', checkedCountries, '.NET dispatcher', csharpDispatcherCountries);
  assertSameCountries(
    'country coverage',
    checkedCountries,
    '.NET supported countries API',
    csharpSupportedCountryCodes,
  );
  assertSameCountries('country coverage', checkedCountries, 'manual-test selector', manualCountries);

  assert.deepEqual(
    [...tsSupportedCountryCodes],
    [...tsSupportedCountryCodes].sort(),
    'TypeScript supported countries API must be alphabetically sorted',
  );
  assert.deepEqual(
    [...csharpSupportedCountryCodes],
    [...csharpSupportedCountryCodes].sort(),
    '.NET supported countries API must be alphabetically sorted',
  );

  const documentedReadmeCount = Number(
    readme.match(/same (\d+) country codes/)?.[1],
  );
  const documentedCsharpCount = Number(
    csharpDispatcher.match(/for (\d+) countries/)?.[1],
  );
  assert.equal(documentedReadmeCount, checkedCountries.size, 'README country count is stale');
  assert.equal(documentedCsharpCount, checkedCountries.size, '.NET XML summary count is stale');
});

test('keeps territory coverage separate and aligned across runtimes', async () => {
  const [
    coverage,
    tsRegistry,
    csharpDispatcher,
    csharpSupportedTerritories,
    manualDemo,
  ] = await Promise.all([
    read(files.coverage),
    read(files.tsTerritoryRegistry),
    read(files.csharpTerritoryDispatcher),
    read(files.csharpSupportedTerritories),
    read(files.manualDemo),
  ]);

  const territoryCoverageSection = coverage.match(
    /### Workstream A[\s\S]*?(?=### Workstream B)/,
  )?.[0] ?? '';
  const documentedTerritories = uniqueSet(
    'checked territory coverage',
    [...territoryCoverageSection.matchAll(/^- \[x\] (?<line>.*)$/gm)]
      .flatMap((match) => matches(match.groups?.line ?? '', /\*\*([A-Z]{2})\*\*/g)),
  );
  const tsRegistryTerritories = uniqueSet(
    'TypeScript territory registry',
    matches(tsRegistry, /^\s{2}([A-Z]{2}): \{/gm),
  );
  const csharpDispatcherTerritories = uniqueSet(
    '.NET territory dispatcher',
    matches(csharpDispatcher, /^\s*"([A-Z]{2})"\s*=>/gm),
  );
  const csharpSupportedBlock = csharpSupportedTerritories.match(
    /Array\.AsReadOnly\(\s*\[(?<territories>[\s\S]*?)\]\);/,
  )?.groups?.territories;
  assert.ok(csharpSupportedBlock, '.NET supported territories list was not found');
  const csharpSupportedCodes = uniqueSet(
    '.NET supported territories API',
    matches(csharpSupportedBlock, /"([A-Z]{2})"/g),
  );
  const manualTerritoryBlock = manualDemo.match(
    /protected readonly territories = \[(?<territories>[\s\S]*?)\n  \];\n\n  protected readonly testCases/,
  )?.groups?.territories;
  assert.ok(manualTerritoryBlock, 'manual-test territories list was not found');
  const manualTerritories = uniqueSet(
    'manual-test territory selector',
    matches(manualTerritoryBlock, /\{ code: '([A-Z]{2})', label:/g),
  );

  assert.equal(documentedTerritories.size, 5, 'territory coverage count is stale');
  assertSameCountries(
    'territory coverage',
    documentedTerritories,
    'TypeScript territory registry',
    tsRegistryTerritories,
  );
  assertSameCountries(
    'territory coverage',
    documentedTerritories,
    '.NET territory dispatcher',
    csharpDispatcherTerritories,
  );
  assertSameCountries(
    'territory coverage',
    documentedTerritories,
    '.NET supported territories API',
    csharpSupportedCodes,
  );
  assertSameCountries(
    'territory coverage',
    documentedTerritories,
    'manual-test territory selector',
    manualTerritories,
  );
  assert.deepEqual([...csharpSupportedCodes], [...csharpSupportedCodes].sort());
});

test('keeps VAT coverage separate and aligned across runtimes', async () => {
  const [tsRegistry, csharpDispatcher, csharpVatCountries] = await Promise.all([
    read(files.tsVatRegistry),
    read(files.csharpDispatcher),
    read(files.csharpVatCountries),
  ]);

  const tsVatCountries = uniqueSet(
    'TypeScript VAT registry',
    matches(tsRegistry, /^\s{2}([A-Z]{2}):/gm),
  );
  const csharpVatBlock = csharpVatCountries.match(
    /Array\.AsReadOnly\(\s*\[(?<countries>[\s\S]*?)\]\);/,
  )?.groups?.countries;
  assert.ok(csharpVatBlock, '.NET supported VAT countries list was not found');
  const csharpSupportedVatCountries = uniqueSet(
    '.NET supported VAT countries API',
    matches(csharpVatBlock, /"([A-Z]{2})"/g),
  );
  const csharpVatDispatcherCountries = uniqueSet(
    '.NET VAT dispatcher',
    matches(csharpDispatcher, /\("([A-Z]{2})", IdentifierType\.Vat\)/g),
  );

  assert.equal(tsVatCountries.size, 31, 'VAT coverage count is stale');
  assertSameCountries(
    'TypeScript VAT registry',
    tsVatCountries,
    '.NET supported VAT countries API',
    csharpSupportedVatCountries,
  );
  assertSameCountries(
    'TypeScript VAT registry',
    tsVatCountries,
    '.NET VAT dispatcher',
    csharpVatDispatcherCountries,
  );
  assert.deepEqual([...tsVatCountries], [...tsVatCountries].sort());
  assert.deepEqual(
    [...csharpSupportedVatCountries],
    [...csharpSupportedVatCountries].sort(),
  );
});

test('keeps checksum policy metadata aligned across TypeScript and .NET', async () => {
  const [tsRegistry, tsTerritoryRegistry, checkOutcome, csharpPolicy] = await Promise.all([
    read(files.tsRegistry),
    read(files.tsTerritoryRegistry),
    read(files.checkOutcome),
    read(files.csharpPolicy),
  ]);

  const registryEntries = [...tsRegistry.matchAll(
    /^  ([A-Z]{2}): (?<body>[\s\S]*?)(?=^  [A-Z]{2}: |^\};)/gm,
  )];
  const tsChecksumCountries = uniqueSet(
    'TypeScript checksum metadata',
    registryEntries
      .filter((entry) => entry.groups?.body.includes("validationLevel: 'checksum'"))
      .map((entry) => entry[1]),
  );
  const csharpChecksumBlock = csharpPolicy.match(
    /ChecksumGradeCountries = new\(StringComparer\.Ordinal\)\s*\{(?<countries>[\s\S]*?)\};/,
  )?.groups?.countries;
  assert.ok(csharpChecksumBlock, '.NET checksum policy metadata was not found');
  const csharpChecksumCountries = uniqueSet(
    '.NET checksum policy metadata',
    matches(csharpChecksumBlock, /"([A-Z]{2})"/g),
  );

  assert.equal(tsChecksumCountries.size, 60, 'TypeScript checksum metadata count is stale');
  assertSameCountries(
    'TypeScript checksum metadata',
    tsChecksumCountries,
    '.NET checksum policy metadata',
    csharpChecksumCountries,
  );
  assert.doesNotMatch(
    checkOutcome,
    /CHECKSUM_TAX_ID_COUNTRIES/,
    'check-outcome.ts must derive policy from registry metadata',
  );

  const tsChecksumTerritories = uniqueSet(
    'TypeScript territory checksum metadata',
    [...tsTerritoryRegistry.matchAll(
      /^  ([A-Z]{2}): (?<body>[\s\S]*?)(?=^  [A-Z]{2}: |^\};)/gm,
    )]
      .filter((entry) => entry.groups?.body.includes("validationLevel: 'checksum'"))
      .map((entry) => entry[1]),
  );
  const csharpTerritoryChecksumBlock = csharpPolicy.match(
    /ChecksumGradeTerritories = new\(StringComparer\.Ordinal\)\s*\{(?<territories>[\s\S]*?)\};/,
  )?.groups?.territories;
  assert.ok(csharpTerritoryChecksumBlock, '.NET territory checksum metadata was not found');
  const csharpChecksumTerritories = uniqueSet(
    '.NET territory checksum metadata',
    matches(csharpTerritoryChecksumBlock, /"([A-Z]{2})"/g),
  );
  assertSameCountries(
    'TypeScript territory checksum metadata',
    tsChecksumTerritories,
    '.NET territory checksum metadata',
    csharpChecksumTerritories,
  );

  for (const country of ['CZ', 'ID', 'SG', 'SK']) {
    const registryEntry = tsRegistry.match(
      new RegExp(`^  ${country}: \\{[\\s\\S]*?^  \\},`, 'm'),
    )?.[0];
    assert.ok(registryEntry, `${country} registry entry was not found`);
    assert.match(
      registryEntry,
      /policyValidationLevel:/,
      `${country} must declare value-specific TypeScript policy metadata`,
    );
    assert.match(
      csharpPolicy,
      new RegExp(`"${country}"`),
      `${country} must be covered by .NET policy metadata`,
    );
  }
});
