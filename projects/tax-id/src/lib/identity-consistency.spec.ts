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

  describe('national identity documents', () => {
    it('checks the Mexican CURP for date, sex and state', () => {
      const result = validateTaxIdIdentity({
        country: 'MX',
        taxId: 'HEGG560427MVZRRL04',
        identity: { birthDate: '1956-04-27', gender: 'F', birthPlaceCode: 'VZ' },
      });
      expect(result.status).toBe('match');
      expect([...result.checkedFields]).toEqual(['birthDate', 'gender', 'birthPlaceCode']);
    });

    it('falls back to the Mexican RFC as a date-only partial check', () => {
      const result = validateTaxIdIdentity({
        country: 'MX',
        taxId: 'GODE561231GR8',
        identity: { birthDate: '1956-12-31', gender: 'M', birthPlaceCode: 'VZ' },
      });
      expect(result.status).toBe('partial_match');
      expect([...result.checkedFields]).toEqual(['birthDate']);
      expect([...result.missingFields]).toEqual(['gender', 'birthPlaceCode']);
    });

    it('matches the French NIR on year and month, ignoring the absent day', () => {
      const match = validateTaxIdIdentity({
        country: 'FR',
        taxId: '269054958815780',
        identity: { birthDate: '1969-05-30', gender: 'F' },
      });
      expect(match.status).toBe('match');

      const wrongMonth = validateTaxIdIdentity({
        country: 'FR',
        taxId: '269054958815780',
        identity: { birthDate: '1969-07-30', gender: 'F' },
      });
      expect(wrongMonth.status).toBe('mismatch');
    });

    it('reports a mismatch on the Egyptian National ID sex digit', () => {
      const result = validateTaxIdIdentity({
        country: 'EG',
        taxId: '29501150101238',
        identity: { birthDate: '1995-01-15', gender: 'F', birthPlaceCode: '01' },
      });
      expect(result.status).toBe('mismatch');
      expect([...result.mismatchedFields]).toEqual(['gender']);
    });

    it('returns insufficient_data for a structurally invalid document', () => {
      expect(
        validateTaxIdIdentity({
          country: 'FR',
          taxId: '269054958815700',
          identity: { birthDate: '1969-05-30', gender: 'F' },
        }).status,
      ).toBe('insufficient_data');
    });
  });
});
