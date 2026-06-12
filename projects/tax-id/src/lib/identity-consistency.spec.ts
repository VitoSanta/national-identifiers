import { taxIdIdentityCapability, validateTaxIdIdentity } from './identity-consistency';

describe('identity consistency', () => {
  const identity = {
    firstName: 'Mario',
    lastName: 'Rossi',
    birthDate: '1985-12-10',
    gender: 'M',
    birthPlaceCode: 'A562',
  } as const;

  it('matches a fiscal code derived from compatible data', () => {
    const result = validateTaxIdIdentity({
      country: 'IT',
      taxId: 'RSSMRA85T10A562S',
      identity,
    });

    expect(result.status).toBe('match');
    expect(result.taxIdValid).toBeTrue();
    expect(result.mismatchedFields).toEqual([]);
  });

  it('decodes omocodia substitutions before comparing', () => {
    const result = validateTaxIdIdentity({
      country: 'IT',
      taxId: 'RSSMRA85T10A56NH',
      identity,
    });

    expect(result.status).toBe('match');
  });

  it('reports the mismatching field without echoing values', () => {
    const result = validateTaxIdIdentity({
      country: 'IT',
      taxId: 'RSSMRA85T10A562S',
      identity: { ...identity, birthDate: '1985-12-11' },
    });

    expect(result.status).toBe('mismatch');
    expect(result.mismatchedFields).toEqual(['birthDate']);
  });

  it('returns partial_match when required fields are missing', () => {
    const result = validateTaxIdIdentity({
      country: 'IT',
      taxId: 'RSSMRA85T10A562S',
      identity: { birthDate: '1985-12-10', gender: 'M' },
    });

    expect(result.status).toBe('partial_match');
    expect(result.missingFields).toEqual(['firstName', 'lastName', 'birthPlaceCode']);
  });

  it('reports insufficient_data for an invalid identifier', () => {
    const result = validateTaxIdIdentity({
      country: 'IT',
      taxId: 'RSSMRA85',
      identity,
    });

    expect(result.status).toBe('insufficient_data');
    expect(result.taxIdValid).toBeFalse();
  });

  it('declares capabilities per country', () => {
    expect(taxIdIdentityCapability('IT')?.level).toBe('full');
    expect(taxIdIdentityCapability('DE')).toBeNull();
    expect(
      validateTaxIdIdentity({ country: 'DE', taxId: '12345678911', identity }).status,
    ).toBe('not_supported');
  });
});
