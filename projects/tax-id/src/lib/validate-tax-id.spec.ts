import { FormControl, Validators } from '@angular/forms';

import { calculateItalianFiscalCodeCheckCharacter, validateItalianFiscalCode } from './countries/italy';
import { taxIdValidator } from 'tax-id/angular';
import { taxIdCheckOutcome } from './check-outcome';
import { normalizeTaxId } from './normalize';
import { validateTaxId } from './validate-tax-id';

describe('tax ID validation', () => {
  it('normalizes spaces, hyphens and letter casing', () => {
    expect(normalizeTaxId(' rssmra-85t10 a562s ')).toBe('RSSMRA85T10A562S');
  });

  it('calculates the Italian fiscal code check character', () => {
    expect(calculateItalianFiscalCodeCheckCharacter('RSSMRA85T10A562')).toBe('S');
  });

  it('validates an Italian fiscal code', () => {
    expect(validateItalianFiscalCode('rssmra85t10a562s')).toEqual({
      valid: true,
      country: 'IT',
      normalizedValue: 'RSSMRA85T10A562S',
    });
  });

  it('reports a checksum error', () => {
    expect(validateItalianFiscalCode('RSSMRA85T10A562A').error).toBe('invalid_checksum');
  });

  it('reports unsupported countries', () => {
    expect(validateTaxId('XX', '123').error).toBe('unsupported_country');
    expect(validateTaxId(null, '123')).toEqual({
      valid: false,
      country: '',
      normalizedValue: '123',
      error: 'unsupported_country',
    });
    expect(validateTaxId('  ', '123').error).toBe('unsupported_country');
  });

  it('uses value-specific policy metadata for mixed validation levels', () => {
    expect(taxIdCheckOutcome(validateTaxId('CZ', '531332/123'))).toBe('warn');
    expect(taxIdCheckOutcome(validateTaxId('CZ', '800101/0007'))).toBe('block');
    expect(taxIdCheckOutcome(validateTaxId('ID', '3173013213990001'))).toBe('warn');
    expect(taxIdCheckOutcome(validateTaxId('ID', '123456789012345'))).toBe('block');
    expect(taxIdCheckOutcome(validateTaxId('SG', 'M1234567!'))).toBe('warn');
    expect(taxIdCheckOutcome(validateTaxId('SG', 'S1234567A'))).toBe('block');
  });

  it('validates Spanish DNI and NIE identifiers', () => {
    expect(validateTaxId('ES', '12345678Z').valid).toBe(true);
    expect(validateTaxId('ES', 'X1234567L').valid).toBe(true);
    expect(validateTaxId('ES', '12345678A').error).toBe('invalid_checksum');
  });

  it('validates French SPI identifiers', () => {
    expect(validateTaxId('FR', '3023217600053').valid).toBe(true);
    expect(validateTaxId('FR', '3023217600054').error).toBe('invalid_checksum');
  });

  it('validates Portuguese NIF identifiers', () => {
    expect(validateTaxId('PT', '123456789').valid).toBe(true);
    expect(validateTaxId('PT', '123456788').error).toBe('invalid_checksum');
  });

  it('validates Greek AFM identifiers', () => {
    expect(validateTaxId('GR', '094259216').valid).toBe(true);
    expect(validateTaxId('GR', '094259217').error).toBe('invalid_checksum');
  });

  it('validates Belgian national register numbers', () => {
    expect(validateTaxId('BE', '85.07.30-033.28').valid).toBe(true);
    expect(validateTaxId('BE', '85073003329').error).toBe('invalid_checksum');
  });

  it('validates Croatian OIB identifiers', () => {
    expect(validateTaxId('HR', '12345678903').valid).toBe(true);
    expect(validateTaxId('HR', '12345678904').error).toBe('invalid_checksum');
  });

  it('validates Polish PESEL identifiers', () => {
    expect(validateTaxId('PL', '44051401458').valid).toBe(true);
    expect(validateTaxId('PL', '44051401459').error).toBe('invalid_checksum');
  });

  it('validates Finnish personal identity codes', () => {
    expect(validateTaxId('FI', '131052-308T').valid).toBe(true);
    expect(validateTaxId('FI', '131052-308A').error).toBe('invalid_checksum');
  });

  it('validates Danish CPR structure without claiming a checksum', () => {
    expect(validateTaxId('DK', '010101-1234')).toEqual({
      valid: true,
      country: 'DK',
      normalizedValue: '0101011234',
      validationLevel: 'format',
    });
    expect(validateTaxId('DK', '310299-1234').error).toBe('invalid_format');
  });

  it('validates Norwegian national identity numbers', () => {
    expect(validateTaxId('NO', '01010100050').valid).toBe(true);
    expect(validateTaxId('NO', '01010100051').error).toBe('invalid_checksum');
  });

  it('validates Swedish personal identity numbers', () => {
    expect(validateTaxId('SE', '811228-9874').valid).toBe(true);
    expect(validateTaxId('SE', '811228-9875').error).toBe('invalid_checksum');
  });

  it('validates Icelandic kennitala identifiers', () => {
    expect(validateTaxId('IS', '120174-0029').valid).toBe(true);
    expect(validateTaxId('IS', '120174-0039').error).toBe('invalid_checksum');
  });

  it('validates Estonian personal identification codes', () => {
    expect(validateTaxId('EE', '37605030299').valid).toBe(true);
    expect(validateTaxId('EE', '37605030298').error).toBe('invalid_checksum');
  });

  it('validates historical and opaque Latvian personal codes', () => {
    expect(validateTaxId('LV', '010190-12349').valid).toBe(true);
    expect(validateTaxId('LV', '320000-12340').valid).toBe(true);
    expect(validateTaxId('LV', '320000-12341').error).toBe('invalid_checksum');
  });

  it('validates Lithuanian personal codes', () => {
    expect(validateTaxId('LT', '38409152012').valid).toBe(true);
    expect(validateTaxId('LT', '38409152013').error).toBe('invalid_checksum');
  });

  it('validates Dutch BSN identifiers', () => {
    expect(validateTaxId('NL', '123456782').valid).toBe(true);
    expect(validateTaxId('NL', '123456783').error).toBe('invalid_checksum');
  });

  it('validates Czech and Slovak birth numbers', () => {
    expect(validateTaxId('CZ', '800101/0006').valid).toBe(true);
    expect(validateTaxId('SK', '800101/0006').valid).toBe(true);
    expect(validateTaxId('CZ', '800101/0007').error).toBe('invalid_checksum');
  });

  it('accepts historical Czech birth numbers as format-only', () => {
    expect(validateTaxId('CZ', '530101/123')).toEqual({
      valid: true,
      country: 'CZ',
      normalizedValue: '530101123',
      validationLevel: 'format',
    });
  });

  it('validates Slovenian tax numbers', () => {
    expect(validateTaxId('SI', '12345679').valid).toBe(true);
    expect(validateTaxId('SI', '12345678').error).toBe('invalid_checksum');
  });

  it('validates Austrian TIN structure without claiming a checksum', () => {
    expect(validateTaxId('AT', '12-345/6789')).toEqual({
      valid: true,
      country: 'AT',
      normalizedValue: '123456789',
      validationLevel: 'format',
    });
  });

  it('validates German tax identification numbers', () => {
    expect(validateTaxId('DE', '12345678911').valid).toBe(true);
    expect(validateTaxId('DE', '12345678912').error).toBe('invalid_checksum');
  });

  it('validates Swiss AHV identifiers', () => {
    expect(validateTaxId('CH', '756.1234.5678.97').valid).toBe(true);
    expect(validateTaxId('CH', '756.1234.5678.98').error).toBe('invalid_checksum');
  });

  it('validates Hungarian tax identification signs', () => {
    expect(validateTaxId('HU', '8123456786').valid).toBe(true);
    expect(validateTaxId('HU', '8123456787').error).toBe('invalid_checksum');
  });

  it('validates Romanian CNP identifiers', () => {
    expect(validateTaxId('RO', '1960523420017').valid).toBe(true);
    expect(validateTaxId('RO', '1960523420018').error).toBe('invalid_checksum');
  });

  it('validates Bulgarian EGN identifiers', () => {
    expect(validateTaxId('BG', '0041010002').valid).toBe(true);
    expect(validateTaxId('BG', '0041010003').error).toBe('invalid_checksum');
    expect(validateTaxId('BG', '0053010000').error).toBe('invalid_format');
  });

  it('validates Serbian JMBG identifiers', () => {
    expect(validateTaxId('RS', '0101006710000').valid).toBe(true);
    expect(validateTaxId('RS', '0101006710001').error).toBe('invalid_checksum');
    expect(validateTaxId('RS', '0101006210008').error).toBe('invalid_format');
  });

  it('validates Montenegrin JMBG identifiers', () => {
    expect(validateTaxId('ME', '0101006210008').valid).toBe(true);
    expect(validateTaxId('ME', '0101006210009').error).toBe('invalid_checksum');
  });

  it('validates North Macedonian EMBG identifiers', () => {
    expect(validateTaxId('MK', '0101006410007').valid).toBe(true);
    expect(validateTaxId('MK', '0101006410008').error).toBe('invalid_checksum');
  });

  it('validates Albanian personal numbers as format-only', () => {
    expect(validateTaxId('AL', 'K30315001A')).toEqual({
      valid: true,
      country: 'AL',
      normalizedValue: 'K30315001A',
      validationLevel: 'format',
    });
    expect(validateTaxId('AL', 'K30230001A').error).toBe('invalid_format');
  });

  it('validates Bosnian JMBG identifiers', () => {
    expect(validateTaxId('BA', '0101006170006').valid).toBe(true);
    expect(validateTaxId('BA', '0101006170007').error).toBe('invalid_checksum');
    expect(validateTaxId('BA', '0101006210008').error).toBe('invalid_format');
  });

  it('validates Turkish identity numbers', () => {
    expect(validateTaxId('TR', '10000000146').valid).toBe(true);
    expect(validateTaxId('TR', '10000000147').error).toBe('invalid_checksum');
    expect(validateTaxId('TR', '00000000146').error).toBe('invalid_format');
  });

  it('validates Moldovan IDNP identifiers as format-only', () => {
    expect(validateTaxId('MD', '2002001000001')).toEqual({
      valid: true,
      country: 'MD',
      normalizedValue: '2002001000001',
      validationLevel: 'format',
    });
    expect(validateTaxId('MD', '0000000000000').error).toBe('invalid_format');
  });

  it('validates Ukrainian taxpayer numbers as format-only', () => {
    expect(validateTaxId('UA', '1234567890')).toEqual({
      valid: true,
      country: 'UA',
      normalizedValue: '1234567890',
      validationLevel: 'format',
    });
    expect(validateTaxId('UA', '123456789A').error).toBe('invalid_format');
  });

  it('validates Cypriot TIN identifiers as format-only', () => {
    expect(validateTaxId('CY', '12345678T')).toEqual({
      valid: true,
      country: 'CY',
      normalizedValue: '12345678T',
      validationLevel: 'format',
    });
    expect(validateTaxId('CY', '123456789').error).toBe('invalid_format');
  });

  it('validates Irish PPS numbers', () => {
    expect(validateTaxId('IE', '1234567T').valid).toBe(true);
    expect(validateTaxId('IE', '1234567TW').valid).toBe(true);
    expect(validateTaxId('IE', '1234567A').error).toBe('invalid_checksum');
  });

  it('validates Luxembourg national identification numbers', () => {
    expect(validateTaxId('LU', '2000010100125').valid).toBe(true);
    expect(validateTaxId('LU', '2000010100126').error).toBe('invalid_checksum');
    expect(validateTaxId('LU', '2000023000125').error).toBe('invalid_format');
  });

  it('validates Maltese TIN identifiers as format-only', () => {
    expect(validateTaxId('MT', '1234567M')).toEqual({
      valid: true,
      country: 'MT',
      normalizedValue: '1234567M',
      validationLevel: 'format',
    });
    expect(validateTaxId('MT', '1234567X').error).toBe('invalid_format');
  });

  it('validates Liechtenstein PEID identifiers as format-only', () => {
    expect(validateTaxId('LI', '000247681888')).toEqual({
      valid: true,
      country: 'LI',
      normalizedValue: '000247681888',
      validationLevel: 'format',
    });
    expect(validateTaxId('LI', '000000000000').error).toBe('invalid_format');
  });

  it('validates Andorran NRT identifiers as format-only', () => {
    expect(validateTaxId('AD', 'F123456Z')).toEqual({
      valid: true,
      country: 'AD',
      normalizedValue: 'F123456Z',
      validationLevel: 'format',
    });
    expect(validateTaxId('AD', 'F000000Z').error).toBe('invalid_format');
  });

  it('validates UK tax identifiers as format-only', () => {
    expect(validateTaxId('GB', 'AB123456C')).toEqual({
      valid: true,
      country: 'GB',
      normalizedValue: 'AB123456C',
      validationLevel: 'format',
    });
    expect(validateTaxId('GB', '1234567890')).toEqual({
      valid: true,
      country: 'GB',
      normalizedValue: '1234567890',
      validationLevel: 'format',
    });
    expect(validateTaxId('GB', 'AB123456E').error).toBe('invalid_format');
  });

  it('validates Russian tax identifiers', () => {
    expect(validateTaxId('RU', '7728168971').valid).toBe(true);
    expect(validateTaxId('RU', '7728168972').error).toBe('invalid_checksum');
    expect(validateTaxId('RU', '500100732259').valid).toBe(true);
    expect(validateTaxId('RU', '500100732258').error).toBe('invalid_checksum');
  });

  it('validates Belarusian tax identifiers as format-only', () => {
    expect(validateTaxId('BY', '123456789')).toEqual({
      valid: true,
      country: 'BY',
      normalizedValue: '123456789',
      validationLevel: 'format',
    });
    expect(validateTaxId('BY', 'AB1234567')).toEqual({
      valid: true,
      country: 'BY',
      normalizedValue: 'AB1234567',
      validationLevel: 'format',
    });
    expect(validateTaxId('BY', '12345678').error).toBe('invalid_length');
  });

  it('validates San Marino tax identifiers as format-only', () => {
    expect(validateTaxId('SM', '123456789')).toEqual({
      valid: true,
      country: 'SM',
      normalizedValue: '123456789',
      validationLevel: 'format',
    });
    expect(validateTaxId('SM', '12345')).toEqual({
      valid: true,
      country: 'SM',
      normalizedValue: '12345',
      validationLevel: 'format',
    });
    expect(validateTaxId('SM', 'SM12345')).toEqual({
      valid: true,
      country: 'SM',
      normalizedValue: 'SM12345',
      validationLevel: 'format',
    });
    expect(validateTaxId('SM', '1234').error).toBe('invalid_format');
  });

  it('validates Monaco tax identifiers as format-only', () => {
    expect(validateTaxId('MC', 'FR12345678901')).toEqual({
      valid: true,
      country: 'MC',
      normalizedValue: 'FR12345678901',
      validationLevel: 'format',
    });
    expect(validateTaxId('MC', '123456789')).toEqual({
      valid: true,
      country: 'MC',
      normalizedValue: '123456789',
      validationLevel: 'format',
    });
    expect(validateTaxId('MC', '1234').error).toBe('invalid_format');
  });

  it('validates US tax identifiers as format-only', () => {
    expect(validateTaxId('US', '123456789')).toEqual({
      valid: true,
      country: 'US',
      normalizedValue: '123456789',
      validationLevel: 'format',
    });
    expect(validateTaxId('US', '000456789').error).toBe('invalid_format');
  });

  it('validates Canadian tax identifiers', () => {
    expect(validateTaxId('CA', '046454286').valid).toBe(true);
    expect(validateTaxId('CA', '046454287').error).toBe('invalid_checksum');
  });

  it('validates Brazilian tax identifiers', () => {
    expect(validateTaxId('BR', '11144477735').valid).toBe(true);
    expect(validateTaxId('BR', '11144477736').error).toBe('invalid_checksum');
    expect(validateTaxId('BR', '00000000000').error).toBe('invalid_format');
  });

  it('validates Mexican tax identifiers', () => {
    expect(validateTaxId('MX', 'GODE561231GR8').valid).toBe(true);
    expect(validateTaxId('MX', 'GODE561231GR9').error).toBe('invalid_checksum');
  });

  it('validates Argentine tax identifiers', () => {
    expect(validateTaxId('AR', '20267565393').valid).toBe(true);
    expect(validateTaxId('AR', '20267565394').error).toBe('invalid_checksum');
  });

  it('validates Chilean tax identifiers', () => {
    expect(validateTaxId('CL', '123456785').valid).toBe(true);
    expect(validateTaxId('CL', '1111122K').valid).toBe(true);
    expect(validateTaxId('CL', '123456786').error).toBe('invalid_checksum');
  });

  it('validates Colombian tax identifiers', () => {
    expect(validateTaxId('CO', '8903215670').valid).toBe(true);
    expect(validateTaxId('CO', '8903215671').error).toBe('invalid_checksum');
  });

  it('validates Peruvian tax identifiers', () => {
    expect(validateTaxId('PE', '100000008').valid).toBe(true); // DNI
    expect(validateTaxId('PE', '20100000009').valid).toBe(true); // RUC
    expect(validateTaxId('PE', '20100000008').error).toBe('invalid_checksum');
  });

  it('validates Uruguayan tax identifiers', () => {
    expect(validateTaxId('UY', '12345672').valid).toBe(true);
    expect(validateTaxId('UY', '12345673').error).toBe('invalid_checksum');
  });

  it('validates Venezuelan tax identifiers', () => {
    expect(validateTaxId('VE', 'J070133805').valid).toBe(true);
    expect(validateTaxId('VE', 'J070133806').error).toBe('invalid_checksum');
  });

  it('validates Australian tax file numbers', () => {
    expect(validateTaxId('AU', '123456782').valid).toBe(true);
    expect(validateTaxId('AU', '123456783').error).toBe('invalid_checksum');
    expect(validateTaxId('AU', '000000000').error).toBe('invalid_format');
  });

  it('validates Chinese resident identity numbers', () => {
    expect(validateTaxId('CN', '11010519491231002X').valid).toBe(true);
    expect(validateTaxId('CN', '110105194912310021').error).toBe('invalid_checksum');
    expect(validateTaxId('CN', '110105194913310029').error).toBe('invalid_format');
  });

  it('validates Indian PAN identifiers as format-only', () => {
    expect(validateTaxId('IN', 'ABCPE1234F')).toEqual({
      valid: true,
      country: 'IN',
      normalizedValue: 'ABCPE1234F',
      validationLevel: 'format',
    });
    expect(validateTaxId('IN', 'ABCXE1234F').error).toBe('invalid_format');
  });

  it('validates Israeli identity numbers', () => {
    expect(validateTaxId('IL', '123456782').valid).toBe(true);
    expect(validateTaxId('IL', '123456783').error).toBe('invalid_checksum');
  });

  it('validates Japanese My Number identifiers', () => {
    expect(validateTaxId('JP', '123456789018').valid).toBe(true);
    expect(validateTaxId('JP', '123456789019').error).toBe('invalid_checksum');
  });

  it('validates South Korean RRN identifiers as format-only', () => {
    expect(validateTaxId('KR', '900101-1234567')).toEqual({
      valid: true,
      country: 'KR',
      normalizedValue: '9001011234567',
      validationLevel: 'format',
    });
    expect(validateTaxId('KR', '901301-1234567').error).toBe('invalid_format');
  });

  it('validates New Zealand IRD numbers', () => {
    expect(validateTaxId('NZ', '49-091-850').valid).toBe(true);
    expect(validateTaxId('NZ', '49091851').error).toBe('invalid_checksum');
    expect(validateTaxId('NZ', '999999999').error).toBe('invalid_format');
  });

  it('validates Singaporean NRIC and FIN identifiers', () => {
    expect(validateTaxId('SG', 'S1234567D').valid).toBe(true);
    expect(validateTaxId('SG', 'S1234567A').error).toBe('invalid_checksum');
    expect(validateTaxId('SG', 'M1234567X')).toEqual({
      valid: true,
      country: 'SG',
      normalizedValue: 'M1234567X',
      validationLevel: 'format',
    });
  });

  it('validates Thai national identification numbers', () => {
    expect(validateTaxId('TH', '1101700230708').valid).toBe(true);
    expect(validateTaxId('TH', '1101700230709').error).toBe('invalid_checksum');
    expect(validateTaxId('TH', '0101700230708').error).toBe('invalid_format');
  });

  it('validates Georgian personal numbers as format-only', () => {
    expect(validateTaxId('GE', '12345678901')).toEqual({
      valid: true,
      country: 'GE',
      normalizedValue: '12345678901',
      validationLevel: 'format',
    });
    expect(validateTaxId('GE', '1234567890').error).toBe('invalid_length');
  });

  it('validates Indonesian NPWP and NIK identifiers', () => {
    expect(validateTaxId('ID', '01.300.066.6-091.000').valid).toBe(true);
    expect(validateTaxId('ID', '013000667091000').error).toBe('invalid_checksum');
    expect(validateTaxId('ID', '3171011708450001')).toEqual({
      valid: true,
      country: 'ID',
      normalizedValue: '3171011708450001',
      validationLevel: 'format',
    });
    expect(validateTaxId('ID', '3171015708450001').valid).toBe(true);
    expect(validateTaxId('ID', '3171011713450001').error).toBe('invalid_format');
  });

  it('validates Kazakh IIN identifiers', () => {
    expect(validateTaxId('KZ', '900101300007').valid).toBe(true);
    expect(validateTaxId('KZ', '900101300008').error).toBe('invalid_checksum');
    expect(validateTaxId('KZ', '901301300007').error).toBe('invalid_format');
  });

  it('validates Kyrgyz personal numbers as format-only', () => {
    expect(validateTaxId('KG', '10101199000001')).toEqual({
      valid: true,
      country: 'KG',
      normalizedValue: '10101199000001',
      validationLevel: 'format',
    });
    expect(validateTaxId('KG', '10113199000001').error).toBe('invalid_format');
  });

  it('validates Malaysian NRIC numbers as format-only', () => {
    expect(validateTaxId('MY', '850101-14-5678')).toEqual({
      valid: true,
      country: 'MY',
      normalizedValue: '850101145678',
      validationLevel: 'format',
    });
    expect(validateTaxId('MY', '851301145678').error).toBe('invalid_format');
  });

  it('validates Philippine TIN identifiers as format-only', () => {
    expect(validateTaxId('PH', '123456789')).toEqual({
      valid: true,
      country: 'PH',
      normalizedValue: '123456789',
      validationLevel: 'format',
    });
    expect(validateTaxId('PH', '123456789000').valid).toBe(true);
    expect(validateTaxId('PH', '12345678').error).toBe('invalid_length');
  });

  it('validates Pakistani CNIC and NTN identifiers as format-only', () => {
    expect(validateTaxId('PK', '1234512345671')).toEqual({
      valid: true,
      country: 'PK',
      normalizedValue: '1234512345671',
      validationLevel: 'format',
    });
    expect(validateTaxId('PK', '1234567').valid).toBe(true);
    expect(validateTaxId('PK', '0234512345671').error).toBe('invalid_format');
  });

  it('validates Vietnamese tax identifiers as format-only', () => {
    expect(validateTaxId('VN', '0123456789')).toEqual({
      valid: true,
      country: 'VN',
      normalizedValue: '0123456789',
      validationLevel: 'format',
    });
    expect(validateTaxId('VN', '012345678901').valid).toBe(true);
    expect(validateTaxId('VN', '012345678').error).toBe('invalid_length');
  });

  it('validates South African tax reference and identity numbers', () => {
    expect(validateTaxId('ZA', '0001339050').valid).toBe(true);
    expect(validateTaxId('ZA', '0001339051').error).toBe('invalid_checksum');
    expect(validateTaxId('ZA', '4001339050').error).toBe('invalid_format');
    expect(validateTaxId('ZA', '9405105678082').valid).toBe(true);
    expect(validateTaxId('ZA', '9405105678083').error).toBe('invalid_checksum');
  });

  it('validates Iranian national identity codes', () => {
    expect(validateTaxId('IR', '1234567891').valid).toBe(true);
    expect(validateTaxId('IR', '1234567892').error).toBe('invalid_checksum');
    expect(validateTaxId('IR', '1111111111').error).toBe('invalid_format');
  });

  it('validates Ecuadorian cedula and personal RUC identifiers', () => {
    expect(validateTaxId('EC', '1714616123').valid).toBe(true);
    expect(validateTaxId('EC', '1714616123001').valid).toBe(true);
    expect(validateTaxId('EC', '1714616124').error).toBe('invalid_checksum');
    expect(validateTaxId('EC', '9914616123').error).toBe('invalid_format');
  });

  it('validates Dominican cedula identifiers', () => {
    expect(validateTaxId('DO', '00100082700').valid).toBe(true);
    expect(validateTaxId('DO', '00100082701').error).toBe('invalid_checksum');
  });

  it('validates Paraguayan RUC identifiers', () => {
    expect(validateTaxId('PY', '3966931-9').valid).toBe(true);
    expect(validateTaxId('PY', '39669318').error).toBe('invalid_checksum');
  });

  it('validates Guatemalan NIT identifiers', () => {
    expect(validateTaxId('GT', '3602978-5').valid).toBe(true);
    expect(validateTaxId('GT', '576937K').valid).toBe(true);
    expect(validateTaxId('GT', '36029786').error).toBe('invalid_checksum');
  });

  it('validates Sri Lankan NIC identifiers as format-only', () => {
    expect(validateTaxId('LK', '790930622V')).toEqual({
      valid: true,
      country: 'LK',
      normalizedValue: '790930622V',
      validationLevel: 'format',
    });
    expect(validateTaxId('LK', '199012300123').valid).toBe(true);
    expect(validateTaxId('LK', '794430622V').error).toBe('invalid_format');
  });

  it('validates Uzbek PINFL identifiers as format-only', () => {
    expect(validateTaxId('UZ', '30101901234567')).toEqual({
      valid: true,
      country: 'UZ',
      normalizedValue: '30101901234567',
      validationLevel: 'format',
    });
    expect(validateTaxId('UZ', '30113901234567').error).toBe('invalid_format');
  });

  it('validates Cuban identity numbers as format-only', () => {
    expect(validateTaxId('CU', '90010112345')).toEqual({
      valid: true,
      country: 'CU',
      normalizedValue: '90010112345',
      validationLevel: 'format',
    });
    expect(validateTaxId('CU', '90130112345').error).toBe('invalid_format');
  });

  it('validates Egyptian TIN identifiers as format-only', () => {
    expect(validateTaxId('EG', '123456789').valid).toBe(true);
    expect(validateTaxId('EG', '000000000').error).toBe('invalid_format');
  });

  it('validates Ghanaian tax identifiers as format-only', () => {
    expect(validateTaxId('GH', 'GHA1234567890').valid).toBe(true);
    expect(validateTaxId('GH', 'GHA12345A7890').error).toBe('invalid_format');
  });

  it('validates Kenyan KRA PIN identifiers as format-only', () => {
    expect(validateTaxId('KE', 'A123456789B').valid).toBe(true);
    expect(validateTaxId('KE', 'B123456789B').error).toBe('invalid_format');
  });

  it('validates Mauritian TAN identifiers as format-only', () => {
    expect(validateTaxId('MU', '12345678').valid).toBe(true);
    expect(validateTaxId('MU', '00000000').error).toBe('invalid_format');
  });

  it('validates Nigerian TIN identifiers as format-only', () => {
    expect(validateTaxId('NG', '1234567890').valid).toBe(true);
    expect(validateTaxId('NG', '123456780001').valid).toBe(true);
    expect(validateTaxId('NG', '0000000000').error).toBe('invalid_format');
  });

  it('validates Rwandan TIN identifiers as format-only', () => {
    expect(validateTaxId('RW', '123456789').valid).toBe(true);
    expect(validateTaxId('RW', '000000000').error).toBe('invalid_format');
  });

  it('validates Tanzanian TIN identifiers as format-only', () => {
    expect(validateTaxId('TZ', '123456789').valid).toBe(true);
    expect(validateTaxId('TZ', '1234567890').valid).toBe(true);
    expect(validateTaxId('TZ', '000000000').error).toBe('invalid_format');
  });

  it('validates Ugandan TIN identifiers as format-only', () => {
    expect(validateTaxId('UG', '1234567890').valid).toBe(true);
    expect(validateTaxId('UG', '0000000000').error).toBe('invalid_format');
  });

  it('validates Zambian TPIN identifiers as format-only', () => {
    expect(validateTaxId('ZM', '1234567890').valid).toBe(true);
    expect(validateTaxId('ZM', '0000000000').error).toBe('invalid_format');
  });

  it('validates Costa Rican personal identifiers as format-only', () => {
    expect(validateTaxId('CR', '123456789').valid).toBe(true);
    expect(validateTaxId('CR', '023456789').error).toBe('invalid_format');
  });

  it('validates Bangladeshi eTIN identifiers as format-only', () => {
    expect(validateTaxId('BD', '123456789012').valid).toBe(true);
    expect(validateTaxId('BD', '000000000000').error).toBe('invalid_format');
  });

  it('validates Nepalese PAN identifiers as format-only', () => {
    expect(validateTaxId('NP', '123456789').valid).toBe(true);
    expect(validateTaxId('NP', '000000000').error).toBe('invalid_format');
  });

  it('validates Fijian TIN identifiers as format-only', () => {
    expect(validateTaxId('FJ', '123456789').valid).toBe(true);
    expect(validateTaxId('FJ', '000000000').error).toBe('invalid_format');
  });

  it('validates Papua New Guinean TIN identifiers as format-only', () => {
    expect(validateTaxId('PG', '123456789').valid).toBe(true);
    expect(validateTaxId('PG', '000000000').error).toBe('invalid_format');
  });

  it('validates Jamaican TRN identifiers as format-only', () => {
    expect(validateTaxId('JM', '123456789').valid).toBe(true);
    expect(validateTaxId('JM', '000000000').error).toBe('invalid_format');
  });

  it('validates Trinidad and Tobago BIR identifiers as format-only', () => {
    expect(validateTaxId('TT', '1234567890').valid).toBe(true);
    expect(validateTaxId('TT', '0000000000').error).toBe('invalid_format');
  });

  it('validates Guyanese TIN identifiers as format-only', () => {
    expect(validateTaxId('GY', '123456789').valid).toBe(true);
    expect(validateTaxId('GY', '000000000').error).toBe('invalid_format');
  });

  it('validates Honduran RTN identifiers as format-only', () => {
    expect(validateTaxId('HN', '08011990123456').valid).toBe(true);
    expect(validateTaxId('HN', '00000000000000').error).toBe('invalid_format');
  });

  it('validates Armenian PSN identifiers as format-only', () => {
    expect(validateTaxId('AM', '1234567890').valid).toBe(true);
    expect(validateTaxId('AM', '0000000000').error).toBe('invalid_format');
  });

  it('validates Ethiopian TIN identifiers as format-only', () => {
    expect(validateTaxId('ET', '1234567890').valid).toBe(true);
    expect(validateTaxId('ET', '0000000000').error).toBe('invalid_format');
  });

  it('validates Namibian TIN identifiers as format-only', () => {
    expect(validateTaxId('NA', '123456789').valid).toBe(true);
    expect(validateTaxId('NA', '000000000').error).toBe('invalid_format');
  });

  it('validates Belizean TIN identifiers as format-only', () => {
    expect(validateTaxId('BZ', '123456').valid).toBe(true);
    expect(validateTaxId('BZ', '000000').error).toBe('invalid_format');
  });

  it('validates Azerbaijani TIN identifiers as format-only', () => {
    expect(validateTaxId('AZ', '1234567890').valid).toBe(true);
    expect(validateTaxId('AZ', '0000000000').error).toBe('invalid_format');
  });

  it('validates Cambodian TIN identifiers as format-only', () => {
    expect(validateTaxId('KH', '123456789').valid).toBe(true);
    expect(validateTaxId('KH', '1234567890').valid).toBe(true);
    expect(validateTaxId('KH', '000000000').error).toBe('invalid_format');
  });

  it('validates Barbadian TIN identifiers as format-only', () => {
    expect(validateTaxId('BB', '1234567890123').valid).toBe(true);
    expect(validateTaxId('BB', '0000000000000').error).toBe('invalid_format');
  });

  it('validates Salvadoran NIT identifiers as format-only', () => {
    expect(validateTaxId('SV', '0614-241287-102-5').valid).toBe(true);
    expect(validateTaxId('SV', '0614-321287-102-5').error).toBe('invalid_format');
  });

  it('validates Nicaraguan RUC identifiers as format-only', () => {
    expect(validateTaxId('NI', '001-241287-1234A').valid).toBe(true);
    expect(validateTaxId('NI', '001-321287-1234A').error).toBe('invalid_format');
  });

  it('validates Jordanian TIN identifiers as format-only', () => {
    expect(validateTaxId('JO', '123456789').valid).toBe(true);
    expect(validateTaxId('JO', '000000000').error).toBe('invalid_format');
  });

  it('validates Bolivian NIT identifiers as format-only', () => {
    expect(validateTaxId('BO', '1234567').valid).toBe(true);
    expect(validateTaxId('BO', '1234567890').valid).toBe(true);
    expect(validateTaxId('BO', '0000000').error).toBe('invalid_format');
  });

  it('reports that a personal TIN is not generally applicable in the UAE', () => {
    expect(validateTaxId('AE', '123456789').error).toBe('not_applicable');
  });

  it('reports that a personal TIN is not generally applicable in Bahrain', () => {
    expect(validateTaxId('BH', '123456789').error).toBe('not_applicable');
  });

  it('reports that a personal TIN is not generally applicable in Kuwait', () => {
    expect(validateTaxId('KW', '123456789').error).toBe('not_applicable');
  });

  it('reports that a personal TIN is not generally applicable in Qatar', () => {
    expect(validateTaxId('QA', '123456789').error).toBe('not_applicable');
  });

  it('reports that a personal TIN is not generally applicable in Saudi Arabia', () => {
    expect(validateTaxId('SA', '123456789').error).toBe('not_applicable');
  });

  it('reports that a personal TIN is not generally applicable in Brunei', () => {
    expect(validateTaxId('BN', '123456789').error).toBe('not_applicable');
  });

  it('reports that a personal TIN is not generally applicable in the Bahamas', () => {
    expect(validateTaxId('BS', '123456789').error).toBe('not_applicable');
  });

  it('reports that a personal TIN is not generally applicable in Nauru', () => {
    expect(validateTaxId('NR', '123456789').error).toBe('not_applicable');
  });

  it('reports that a personal TIN is not generally applicable in Vanuatu', () => {
    expect(validateTaxId('VU', '123456789').error).toBe('not_applicable');
  });

  it('reports that a personal TIN is not applicable in Vatican City', () => {
    expect(validateTaxId('VA', '123456789').error).toBe('not_applicable');
  });

  it('validates Moroccan fiscal identifiers as format-only', () => {
    expect(validateTaxId('MA', '12345678').valid).toBe(true);
    expect(validateTaxId('MA', '00000000').error).toBe('invalid_format');
  });

  it('validates Tunisian fiscal identifiers as format-only', () => {
    expect(validateTaxId('TN', '1234567/A/M/000').valid).toBe(true);
    expect(validateTaxId('TN', '0000000/A/M/000').error).toBe('invalid_format');
  });

  it('validates Botswana Omang identifiers as format-only', () => {
    expect(validateTaxId('BW', '123456789').valid).toBe(true);
    expect(validateTaxId('BW', '000000000').error).toBe('invalid_format');
  });

  it('validates Mongolian civil registration numbers as format-only', () => {
    expect(validateTaxId('MN', 'УБ90103112').valid).toBe(true);
    expect(validateTaxId('MN', 'УБ90323112').error).toBe('invalid_format');
  });

  it('reports that a personal TIN is not currently applicable in Oman', () => {
    expect(validateTaxId('OM', '123456789').error).toBe('not_applicable');
  });

  it('validates Angolan NIF identifiers as format-only', () => {
    expect(validateTaxId('AO', '1234567890').valid).toBe(true);
    expect(validateTaxId('AO', '0000000000').error).toBe('invalid_format');
  });

  it('validates Cape Verdean NIF identifiers', () => {
    expect(validateTaxId('CV', '501442600').valid).toBe(true);
    expect(validateTaxId('CV', '501442601').error).toBe('invalid_checksum');
  });

  it('validates Mozambican NUIT identifiers as format-only', () => {
    expect(validateTaxId('MZ', '123456789').valid).toBe(true);
    expect(validateTaxId('MZ', '000000000').error).toBe('invalid_format');
  });

  it('validates Bhutanese citizen identifiers as format-only', () => {
    expect(validateTaxId('BT', '12345678901').valid).toBe(true);
    expect(validateTaxId('BT', '00000000000').error).toBe('invalid_format');
  });

  it('validates Palestinian identity numbers', () => {
    expect(validateTaxId('PS', '123456782').valid).toBe(true);
    expect(validateTaxId('PS', '123456783').error).toBe('invalid_checksum');
  });

  it('validates Algerian NIF identifiers as format-only', () => {
    expect(validateTaxId('DZ', '408 020 000 150 039').valid).toBe(true);
    expect(validateTaxId('DZ', '41201600000606600001').valid).toBe(true);
    expect(validateTaxId('DZ', '12345').error).toBe('invalid_length');
  });

  it('validates Guinean permanent fiscal identifiers', () => {
    expect(validateTaxId('GN', '693-770-885').valid).toBe(true);
    expect(validateTaxId('GN', '693770880').error).toBe('invalid_checksum');
  });

  it('validates Senegalese NINEA identifiers with optional COFI', () => {
    expect(validateTaxId('SN', '306 7221').valid).toBe(true);
    expect(validateTaxId('SN', '3067221 2G2').valid).toBe(true);
    expect(validateTaxId('SN', '3067222').error).toBe('invalid_checksum');
    expect(validateTaxId('SN', '3067221 9G2').error).toBe('invalid_format');
  });

  it('validates Iraqi TIN identifiers as format-only', () => {
    expect(validateTaxId('IQ', '377819054').valid).toBe(true);
    expect(validateTaxId('IQ', '000000000').error).toBe('invalid_format');
    expect(validateTaxId('IQ', '12345678').error).toBe('invalid_length');
    expect(validateTaxId('IQ', '1234567890').error).toBe('invalid_length');
  });

  it('validates Maldivian TIN identifiers as format-only', () => {
    expect(validateTaxId('MV', '1099060').valid).toBe(true);
    expect(validateTaxId('MV', '0000000').error).toBe('invalid_format');
    expect(validateTaxId('MV', '123456').error).toBe('invalid_length');
    expect(validateTaxId('MV', '12345678').error).toBe('invalid_length');
  });

  it('validates Samoan TIN identifiers as format-only', () => {
    expect(validateTaxId('WS', '70004').valid).toBe(true);
    expect(validateTaxId('WS', '11001').valid).toBe(true);
    expect(validateTaxId('WS', '123456789').valid).toBe(true);
    expect(validateTaxId('WS', '0000').error).toBe('invalid_length');
    expect(validateTaxId('WS', '1234567890').error).toBe('invalid_length');
    expect(validateTaxId('WS', '00000').error).toBe('invalid_format');
  });

  it('validates Afghan e-Tazkira national identifiers as format-only', () => {
    expect(validateTaxId('AF', '1234-5678-90123')).toEqual({
      valid: true,
      country: 'AF',
      normalizedValue: '1234567890123',
      validationLevel: 'format',
    });
    expect(validateTaxId('AF', '0000000000000').error).toBe('invalid_format');
    expect(validateTaxId('AF', '123456789012').error).toBe('invalid_length');
  });

  it('validates Haitian NIF identifiers as format-only', () => {
    expect(validateTaxId('HT', '123-456-7890')).toEqual({
      valid: true,
      country: 'HT',
      normalizedValue: '1234567890',
      validationLevel: 'format',
    });
    expect(validateTaxId('HT', '0000000000').error).toBe('invalid_format');
    expect(validateTaxId('HT', '123456789').error).toBe('invalid_length');
    expect(validateTaxId('HT', '12345678901').error).toBe('invalid_length');
  });

  it('validates Tajik INN identifiers as format-only', () => {
    expect(validateTaxId('TJ', '123-456-789')).toEqual({
      valid: true,
      country: 'TJ',
      normalizedValue: '123456789',
      validationLevel: 'format',
    });
    expect(validateTaxId('TJ', '000000000').error).toBe('invalid_format');
    expect(validateTaxId('TJ', '12345678').error).toBe('invalid_length');
    expect(validateTaxId('TJ', '1234567890').error).toBe('invalid_length');
  });

  it('validates Dominican taxpayer numbers as format-only', () => {
    expect(validateTaxId('DM', '123456')).toEqual({
      valid: true,
      country: 'DM',
      normalizedValue: '123456',
      validationLevel: 'format',
    });
    expect(validateTaxId('DM', '42').valid).toBe(true);
    expect(validateTaxId('DM', '000000').error).toBe('invalid_format');
    expect(validateTaxId('DM', '1234567').error).toBe('invalid_length');
  });

  it('validates Grenadian TIN identifiers as format-only', () => {
    expect(validateTaxId('GD', '123-456')).toEqual({
      valid: true,
      country: 'GD',
      normalizedValue: '123456',
      validationLevel: 'format',
    });
    expect(validateTaxId('GD', '000000').error).toBe('invalid_format');
    expect(validateTaxId('GD', '12345').error).toBe('invalid_length');
  });

  it('validates Marshallese employee identifiers as format-only', () => {
    expect(validateTaxId('MH', '04-086123')).toEqual({
      valid: true,
      country: 'MH',
      normalizedValue: '04086123',
      validationLevel: 'format',
    });
    expect(validateTaxId('MH', '05-086123').error).toBe('invalid_format');
    expect(validateTaxId('MH', '04000000').error).toBe('invalid_format');
    expect(validateTaxId('MH', '04-08612').error).toBe('invalid_length');
  });

  it('validates Palauan ROP Social Security numbers as format-only', () => {
    expect(validateTaxId('PW', '006-123456')).toEqual({
      valid: true,
      country: 'PW',
      normalizedValue: '006123456',
      validationLevel: 'format',
    });
    expect(validateTaxId('PW', '00612345A').error).toBe('invalid_format');
    expect(validateTaxId('PW', '000000000').error).toBe('invalid_format');
    expect(validateTaxId('PW', '00612345').error).toBe('invalid_length');
  });

  it('validates Panamanian personal RUC identifiers as format-only', () => {
    expect(validateTaxId('PA', '8-340-1234')).toEqual({
      valid: true,
      country: 'PA',
      normalizedValue: '83401234',
      validationLevel: 'format',
    });
    expect(validateTaxId('PA', 'E-8-340-1234').valid).toBe(true);
    expect(validateTaxId('PA', '8-PE-340-1234').valid).toBe(true);
    expect(validateTaxId('PA', '8-340-1234-5').error).toBe('invalid_format');
    expect(validateTaxId('PA', '0-000-0000').error).toBe('invalid_format');
    expect(validateTaxId('PA', '83401234').error).toBe('invalid_format');
  });

  it('validates FSM Social Security numbers as format-only', () => {
    expect(validateTaxId('FM', '12-345678')).toEqual({
      valid: true,
      country: 'FM',
      normalizedValue: '12345678',
      validationLevel: 'format',
    });
    expect(validateTaxId('FM', '1234567A').error).toBe('invalid_format');
    expect(validateTaxId('FM', '00000000').error).toBe('invalid_format');
    expect(validateTaxId('FM', '12-34567').error).toBe('invalid_length');
  });

  it('validates Sudanese national identifiers as format-only', () => {
    expect(validateTaxId('SD', 'AB-123456')).toEqual({
      valid: true,
      country: 'SD',
      normalizedValue: 'AB123456',
      validationLevel: 'format',
    });
    expect(validateTaxId('SD', '1234/567').error).toBe('invalid_format');
    expect(validateTaxId('SD', '').error).toBe('empty');
  });

  it('validates Lebanese TINs as format-only', () => {
    expect(validateTaxId('LB', '123456-601')).toEqual({
      valid: true,
      country: 'LB',
      normalizedValue: '123456601',
      validationLevel: 'format',
    });
    expect(validateTaxId('LB', '123456').valid).toBe(true);
    expect(validateTaxId('LB', '123456-603').valid).toBe(true);
    expect(validateTaxId('LB', '123456-604').valid).toBe(true);
    expect(validateTaxId('LB', '123456-602').error).toBe('invalid_format');
    expect(validateTaxId('LB', 'ABC123').error).toBe('invalid_format');
    expect(validateTaxId('LB', '').error).toBe('empty');
  });

  it('validates Surinamese FINs as format-only', () => {
    expect(validateTaxId('SR', '1234567890')).toEqual({
      valid: true,
      country: 'SR',
      normalizedValue: '1234567890',
      validationLevel: 'format',
    });
    expect(validateTaxId('SR', '1').valid).toBe(true);
    expect(validateTaxId('SR', '12345678901').error).toBe('invalid_length');
    expect(validateTaxId('SR', '1234A').error).toBe('invalid_format');
    expect(validateTaxId('SR', '12 34').error).toBe('invalid_format');
    expect(validateTaxId('SR', '').error).toBe('empty');
  });

  it('validates DR Congo NIFs as format-only', () => {
    expect(validateTaxId('CD', 'a1011126f')).toEqual({
      valid: true,
      country: 'CD',
      normalizedValue: 'A1011126F',
      validationLevel: 'format',
    });
    expect(validateTaxId('CD', 'A1011126').error).toBe('invalid_length');
    expect(validateTaxId('CD', '10111267F').error).toBe('invalid_format');
    expect(validateTaxId('CD', 'A10111267').error).toBe('invalid_format');
    expect(validateTaxId('CD', '').error).toBe('empty');
  });

  it('validates the extended format-only country block', () => {
    const cases = [
      ['BF', '12345678A', '123456789'], ['BI', '1234567890', '0000000000'],
      ['BJ', '1234567890123', '0000000000000'], ['CF', '1234567A', '12345678'],
      ['CG', 'A1234567890123456', '12345678901234567'], ['CI', '1234567A', '12345678'],
      ['CM', 'P123456789012A', 'A123456789012P'], ['GA', '1234567890123', '0000000000000'],
      ['GW', '123456789', '000000000'], ['LA', '12345678901', '00000000000'],
      ['LC', '123456', '000000'], ['LR', '123456789', '000000000'],
      ['LS', '12345678', '00000000'], ['LY', '112345678901', '312345678901'],
      ['MG', '1234567890', '0000000000'], ['ML', '123456789A', '1234567890'],
      ['MM', '123456789', '000000000'], ['MR', '12345678', '00000000'],
      ['MW', 'TP12345678', '1234567890'], ['SB', '123456789', '000000000'],
      ['SC', '122456789', '123456789'], ['SL', '12345678', '00000000'],
      ['SS', '123456789', '000000000'], ['ST', '123456789', '000000000'],
      ['SY', '12345678901', '00000000000'], ['SZ', '123456789', '000000000'],
      ['TG', '0123456789012', '4123456789012'], ['TL', '123456789', '000000000'],
      ['VC', '123456789', '12345A'],
      ['ZW', '1234567890', '0000000000'],
    ] as const;

    for (const [country, valid, invalid] of cases) {
      expect(validateTaxId(country, valid).valid).toBe(true);
      expect(validateTaxId(country, invalid).error).toBe('invalid_format');
    }
  });

  it('reports that a generalized personal TIN is not applicable in Tuvalu', () => {
    expect(validateTaxId('TV', '123456789').error).toBe('not_applicable');
  });

  it('reports that a generalized personal TIN is not applicable in Antigua and Barbuda', () => {
    expect(validateTaxId('AG', '123456789').error).toBe('not_applicable');
  });

  it('reports that a generalized personal TIN is not applicable in Saint Kitts and Nevis', () => {
    expect(validateTaxId('KN', '123456789').error).toBe('not_applicable');
  });

  it('reports that a generalized personal TIN is not applicable in North Korea', () => {
    expect(validateTaxId('KP', '123456789').error).toBe('not_applicable');
  });

  it('integrates with Angular forms', () => {
    const control = new FormControl('RSSMRA85T10A562A', taxIdValidator('IT'));

    expect(control.errors?.['taxId'].error).toBe('invalid_checksum');

    control.setValue('RSSMRA85T10A562S');
    expect(control.valid).toBe(true);
  });

  it('leaves empty-value validation to Validators.required', () => {
    const control = new FormControl('', [Validators.required, taxIdValidator('IT')]);

    expect(control.errors).toEqual({ required: true });
  });

  it('uses policy mode by default and supports strict Angular validation', () => {
    const advisory = new FormControl('12', taxIdValidator('SO'));
    const strict = new FormControl('12', taxIdValidator('SO', { mode: 'strict' }));

    expect(advisory.valid).toBe(true);
    expect(strict.errors?.['taxId'].error).toBe('invalid_length');
  });
});
