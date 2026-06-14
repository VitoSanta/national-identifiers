import {
  SUPPORTED_TAX_ID_COUNTRIES,
  isSupportedTaxIdCountry,
} from './supported-countries';
import {
  SUPPORTED_TAX_ID_TERRITORIES,
  isSupportedTaxIdTerritory,
} from './territory-registry';
import { SUPPORTED_VAT_COUNTRIES, isSupportedVatCountry } from './vat-registry';
import {
  SUPPORTED_COMPANY_TAX_COUNTRIES,
  isSupportedCompanyTaxCountry,
} from './validate-identifier';

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

  it('keeps supported territories in a separate immutable list', () => {
    expect(SUPPORTED_TAX_ID_TERRITORIES).toEqual(['FO', 'GG', 'GL', 'HK', 'JE', 'PR', 'TW']);
    expect(Object.isFrozen(SUPPORTED_TAX_ID_TERRITORIES)).toBe(true);
    expect(isSupportedTaxIdTerritory('HK')).toBe(true);
    expect(isSupportedTaxIdTerritory('IT')).toBe(false);
    expect(isSupportedTaxIdCountry('HK')).toBe(false);
  });

  it('exposes dedicated VAT coverage separately', () => {
    expect(SUPPORTED_VAT_COUNTRIES).toEqual([
      'AR', 'AT', 'AU', 'BE', 'BG', 'CH', 'CL', 'CO', 'CY', 'CZ',
      'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GB', 'GR', 'HR', 'HU',
      'IE', 'IL', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'NO', 'PL',
      'PT', 'RO', 'RU', 'SE', 'SI', 'SK',
    ]);
    expect(Object.isFrozen(SUPPORTED_VAT_COUNTRIES)).toBe(true);
    expect(isSupportedVatCountry('FR')).toBe(true);
    expect(isSupportedVatCountry('ES')).toBe(true);
    expect(isSupportedVatCountry('US')).toBe(false);
  });

  it('exposes dedicated company tax coverage separately', () => {
    expect(SUPPORTED_COMPANY_TAX_COUNTRIES).toEqual(['AU', 'BR', 'CN', 'IN', 'NO', 'NZ']);
    expect(Object.isFrozen(SUPPORTED_COMPANY_TAX_COUNTRIES)).toBe(true);
    expect(isSupportedCompanyTaxCountry('BR')).toBe(true);
    expect(isSupportedCompanyTaxCountry('DE')).toBe(false);
  });
});
