export function normalizeTaxId(value: unknown): string {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return '';
  }

  return String(value).trim().replace(/[\s-]+/g, '').toUpperCase();
}
