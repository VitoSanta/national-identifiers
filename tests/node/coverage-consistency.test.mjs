import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const files = {
  csharpDispatcher: 'packages/dotnet/NationalIdentifiers.Core/TaxIdValidator.cs',
  manualDemo: 'projects/manual-test/src/app/app.ts',
  readme: 'README.md',
  todo: 'TODO.md',
  tsDispatcher: 'projects/tax-id/src/lib/validate-tax-id.ts',
  tsModel: 'projects/tax-id/src/lib/models.ts',
  tsSupportedCountries: 'projects/tax-id/src/lib/supported-countries.ts',
  csharpSupportedCountries: 'packages/dotnet/NationalIdentifiers.Core/TaxIdCountries.cs',
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
    todo,
    tsModel,
    tsDispatcher,
    tsSupportedCountries,
    csharpDispatcher,
    csharpSupportedCountries,
    manualDemo,
    readme,
  ] =
    await Promise.all([
      read(files.todo),
      read(files.tsModel),
      read(files.tsDispatcher),
      read(files.tsSupportedCountries),
      read(files.csharpDispatcher),
      read(files.csharpSupportedCountries),
      read(files.manualDemo),
      read(files.readme),
    ]);

  const checkedCountries = uniqueSet(
    'TODO.md checked countries',
    matches(todo, /^- \[x\] ([A-Z]{2}) -/gm),
  );
  const allTodoCountries = uniqueSet(
    'TODO.md countries',
    matches(todo, /^- \[[ x]\] ([A-Z]{2}) -/gm),
  );
  const modelCountries = uniqueSet(
    'TaxIdCountry',
    matches(tsModel, /^\s*\| '([A-Z]{2})'/gm),
  );
  const tsDispatcherCountries = uniqueSet(
    'TypeScript dispatcher',
    matches(tsDispatcher, /^\s*case '([A-Z]{2})':/gm),
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
    /protected readonly countries = \[(?<countries>[\s\S]*?)\n  \];\n\n  protected readonly testCases/,
  )?.groups?.countries;
  assert.ok(countriesBlock, 'manual-test countries list was not found');
  const manualCountries = uniqueSet(
    'manual-test country selector',
    matches(countriesBlock, /\{ code: '([A-Z]{2})', label:/g),
  );

  assert.equal(allTodoCountries.size, 195, 'TODO.md must list all 195 target countries');
  assertSameCountries('TODO.md', checkedCountries, 'TaxIdCountry', modelCountries);
  assertSameCountries('TODO.md', checkedCountries, 'TypeScript dispatcher', tsDispatcherCountries);
  assertSameCountries(
    'TODO.md',
    checkedCountries,
    'TypeScript supported countries API',
    tsSupportedCountryCodes,
  );
  assertSameCountries('TODO.md', checkedCountries, '.NET dispatcher', csharpDispatcherCountries);
  assertSameCountries(
    'TODO.md',
    checkedCountries,
    '.NET supported countries API',
    csharpSupportedCountryCodes,
  );
  assertSameCountries('TODO.md', checkedCountries, 'manual-test selector', manualCountries);

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
