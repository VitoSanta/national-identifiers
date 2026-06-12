import {
  SUPPORTED_TAX_ID_COUNTRIES,
  isSupportedTaxIdCountry,
} from './supported-countries';

describe('supported countries', () => {
  it('exposes an alphabetically sorted immutable list', () => {
    expect(SUPPORTED_TAX_ID_COUNTRIES.length).toBe(195);
    expect([...SUPPORTED_TAX_ID_COUNTRIES].sort()).toEqual([...SUPPORTED_TAX_ID_COUNTRIES]);
    expect(SUPPORTED_TAX_ID_COUNTRIES).toContain('IT');
    expect(SUPPORTED_TAX_ID_COUNTRIES).toContain('TJ');
    expect(SUPPORTED_TAX_ID_COUNTRIES).toContain('VC');
    expect(SUPPORTED_TAX_ID_COUNTRIES).toContain('PW');
    expect(SUPPORTED_TAX_ID_COUNTRIES).toContain('PA');
    expect(SUPPORTED_TAX_ID_COUNTRIES).toContain('FM');
    expect(SUPPORTED_TAX_ID_COUNTRIES).toContain('SD');
    expect(SUPPORTED_TAX_ID_COUNTRIES).toContain('LB');
    expect(SUPPORTED_TAX_ID_COUNTRIES).toContain('SR');
    expect(SUPPORTED_TAX_ID_COUNTRIES).toContain('CD');
    expect(Object.isFrozen(SUPPORTED_TAX_ID_COUNTRIES)).toBe(true);
  });

  it('recognises exact uppercase ISO country codes', () => {
    expect(isSupportedTaxIdCountry('IT')).toBe(true);
    expect(isSupportedTaxIdCountry('it')).toBe(false);
    expect(isSupportedTaxIdCountry('TD')).toBe(true);
    expect(isSupportedTaxIdCountry('XX')).toBe(false);
    expect(isSupportedTaxIdCountry(null)).toBe(false);
  });
});
