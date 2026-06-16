import { gzipSync } from 'node:zlib';
import { readFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';

import {
  validateIdentifier,
  validateTaxId,
  validateTaxIdIdentity,
} from '../dist/tax-id/fesm2022/national-identifiers.mjs';

const files = [
  {
    label: 'Core FESM',
    path: 'dist/tax-id/fesm2022/national-identifiers.mjs',
  },
  {
    label: 'Angular FESM',
    path: 'dist/tax-id/fesm2022/national-identifiers-angular.mjs',
  },
];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(2)} KiB`;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function measure(label, fn) {
  for (let index = 0; index < 10_000; index += 1) fn();

  const batches = [];
  const iterations = 100_000;

  for (let batch = 0; batch < 25; batch += 1) {
    const start = performance.now();
    for (let index = 0; index < iterations; index += 1) fn();
    const elapsed = performance.now() - start;
    batches.push((elapsed * 1_000_000) / iterations);
  }

  return {
    label,
    medianNs: median(batches),
  };
}

const identity = {
  firstName: 'Mario',
  lastName: 'Rossi',
  birthDate: '1985-12-10',
  gender: 'M',
  birthPlaceCode: 'A562',
};

const footprint = [];
for (const file of files) {
  const content = await readFile(file.path);
  footprint.push({
    label: file.label,
    raw: content.length,
    gzip: gzipSync(content, { level: 9 }).length,
  });
}

const benchmarks = [
  measure('tax_id_person checksum (IT)', () => validateTaxId('IT', 'RSSMRA85T10A562S')),
  measure('tax_id_person format (US)', () => validateTaxId('US', '123-45-6789')),
  measure('vat checksum (IT)', () =>
    validateIdentifier({ country: 'IT', type: 'vat', value: '00743110157' })),
  measure('company format (US)', () =>
    validateIdentifier({ country: 'US', type: 'tax_id_company', value: '12-3456789' })),
  measure('identity consistency (IT)', () =>
    validateTaxIdIdentity({ country: 'IT', taxId: 'RSSMRA85T10A562S', identity })),
];

console.log('# National Identifiers JavaScript measurements\n');
console.log(`Node.js: ${process.version}`);
console.log('');
console.log('## Footprint\n');
console.log('| Artifact | Raw | gzip -9 |');
console.log('|---|---:|---:|');
for (const item of footprint) {
  console.log(`| ${item.label} | ${formatBytes(item.raw)} | ${formatBytes(item.gzip)} |`);
}
console.log('');
console.log('## Throughput\n');
console.log('| Case | Median per call |');
console.log('|---|---:|');
for (const item of benchmarks) {
  console.log(`| ${item.label} | ${(item.medianNs / 1_000).toFixed(2)} us |`);
}
