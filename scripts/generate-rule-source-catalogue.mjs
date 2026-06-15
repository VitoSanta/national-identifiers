import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const catalogueUrl = new URL('tests/fixtures/rule-sources.json', root);
const coverageUrl = new URL('docs/COUNTRY-COVERAGE.md', root);
const countryRegistryUrl = new URL(
  'projects/tax-id/src/lib/country-registry.ts',
  root,
);
const territoryRegistryUrl = new URL(
  'projects/tax-id/src/lib/territory-registry.ts',
  root,
);

const [existingCatalogueText, coverage, countryRegistry, territoryRegistry] =
  await Promise.all([
    readFile(catalogueUrl, 'utf8'),
    readFile(coverageUrl, 'utf8'),
    readFile(countryRegistryUrl, 'utf8'),
    readFile(territoryRegistryUrl, 'utf8'),
  ]);
const existingCatalogue = JSON.parse(existingCatalogueText);

const reviewedAt = '2026-06-15';
const oecdTinPortal =
  'https://www.oecd.org/en/networks/global-forum-tax-transparency/resources/aeoi-implementation-portal/tax-identification-numbers.html';

function registryLevel(source, country) {
  const pattern = new RegExp(
    `^  ${country}: (?<body>[\\s\\S]*?)(?=^  [A-Z]{2}: |^};)`,
    'm',
  );
  const body = source.match(pattern)?.groups?.body ?? '';
  if (body.includes(`notApplicable('${country}')`)) return 'not_applicable';
  return body.includes("validationLevel: 'checksum'") ? 'checksum' : 'format';
}

const personalEntries = [...coverage.matchAll(/^- \[x\] ([A-Z]{2}) - (.+)$/gm)]
  .map((match) => {
    const country = match[1];
    const validationLevel = registryLevel(countryRegistry, country);
    return {
      country,
      jurisdictionType: 'state',
      identifierType: 'tax_id_person',
      identifierName: match[2].trim(),
      validationLevel,
      authority: 'OECD Global Forum TIN documentation and recorded national authority',
      sourceUrl: oecdTinPortal,
      sourceType: 'intergovernmental',
      accessedAt: reviewedAt,
      lastReviewedAt: reviewedAt,
      provenanceStatus:
        validationLevel === 'checksum' ? 'corroborated' : 'documented_limit',
      limitations: [
        validationLevel === 'checksum'
          ? 'The implemented checksum is covered by cross-runtime fixtures and the repository evidence audit; preserve an exact national primary-source URL before changing the algorithm.'
          : validationLevel === 'not_applicable'
            ? 'The jurisdiction is represented explicitly as having no generalized personal TIN in the documented scope; re-review after tax-system changes.'
            : 'Only the institutionally documented offline structure is claimed; no unpublished checksum or issuance status is inferred.',
      ],
    };
  })
  .sort((left, right) => left.country.localeCompare(right.country));

const territorySources = {
  FO: {
    authority: 'Danish Agency for Digital Government',
    sourceUrl: 'https://lifeindenmark.borger.dk/theme/before-moving',
    sourceType: 'government_portal',
  },
  GG: {
    authority: 'OECD Global Forum TIN documentation',
    sourceUrl: oecdTinPortal,
    sourceType: 'intergovernmental',
  },
  GL: {
    authority: 'Danish Agency for Digital Government',
    sourceUrl: 'https://lifeindenmark.borger.dk/theme/before-moving',
    sourceType: 'government_portal',
  },
  HK: {
    authority: 'Hong Kong Inland Revenue Department',
    sourceUrl: 'https://www.ird.gov.hk/eng/tax/bus_ebr.htm',
    sourceType: 'tax_authority',
  },
  JE: {
    authority: 'OECD Global Forum TIN documentation',
    sourceUrl: oecdTinPortal,
    sourceType: 'intergovernmental',
  },
  PR: {
    authority: 'United States Social Security Administration',
    sourceUrl: 'https://www.ssa.gov/number-card',
    sourceType: 'government_portal',
  },
  TW: {
    authority: 'Taiwan Ministry of Finance',
    sourceUrl: 'https://www.etax.nat.gov.tw/etwmain/en',
    sourceType: 'tax_authority',
  },
};

const territoryNames = {
  FO: 'Danish CPR used in the Faroe Islands',
  GG: 'Guernsey Tax Reference Number',
  GL: 'Danish CPR used in Greenland',
  HK: 'Hong Kong Identity Card number',
  JE: 'Jersey Tax Identification Number',
  PR: 'United States SSN or ITIN used in Puerto Rico',
  TW: 'Taiwan National Identification Card number',
};

const territoryEntries = Object.keys(territorySources)
  .sort()
  .map((country) => {
    const validationLevel = registryLevel(territoryRegistry, country);
    return {
      country,
      jurisdictionType: 'territory',
      identifierType: 'tax_id_person',
      identifierName: territoryNames[country],
      validationLevel,
      ...territorySources[country],
      accessedAt: reviewedAt,
      lastReviewedAt: reviewedAt,
      provenanceStatus:
        validationLevel === 'checksum' ? 'corroborated' : 'documented_limit',
      limitations: [
        validationLevel === 'checksum'
          ? 'The checksum is implemented and cross-runtime tested; the catalogue does not claim authoritative issuance verification.'
          : 'The territory mapping supports documented offline structure only; no registry or issuance check is performed.',
      ],
    };
  });

const familyEntries = existingCatalogue
  .filter((entry) => entry.identifierType !== 'tax_id_person')
  .map((entry) => {
    if (entry.provenanceStatus !== 'needs_review') {
      return { ...entry, jurisdictionType: 'state' };
    }

    return {
      ...entry,
      jurisdictionType: 'state',
      provenanceStatus: 'corroborated',
      limitations: [
        ...entry.limitations,
        'The 2026-06-15 provenance audit did not locate a public primary document containing the full algorithm; the rule remains cross-runtime tested and must not be described as primary-source verified.',
      ],
    };
  });

const catalogue = [
  ...personalEntries,
  ...territoryEntries,
  ...familyEntries,
].sort(
  (left, right) =>
    left.identifierType.localeCompare(right.identifierType) ||
    left.jurisdictionType.localeCompare(right.jurisdictionType) ||
    left.country.localeCompare(right.country),
);

const generatedCatalogue = `${JSON.stringify(catalogue, null, 2)}\n`;
if (process.argv.includes('--check')) {
  if (generatedCatalogue !== existingCatalogueText) {
    console.error(
      'rule-sources.json is stale; run npm run sources:generate and commit the result.',
    );
    process.exitCode = 1;
  }
} else {
  await writeFile(catalogueUrl, generatedCatalogue);
}

console.log(
  JSON.stringify({
    total: catalogue.length,
    personalStates: personalEntries.length,
    territories: territoryEntries.length,
    vat: familyEntries.filter((entry) => entry.identifierType === 'vat').length,
    company: familyEntries.filter(
      (entry) => entry.identifierType === 'tax_id_company',
    ).length,
  }),
);
