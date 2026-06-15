import assert from 'node:assert/strict';
import { test } from 'node:test';

import '@angular/compiler';
import {
  SUPPORTED_TAX_ID_COUNTRIES,
  calculateItalianFiscalCodeCheckCharacter,
  isSupportedTaxIdCountry,
  normalizeTaxId,
  taxIdCheckOutcome,
  validateItalianFiscalCode,
  validateTaxId,
} from '../../dist/tax-id/fesm2022/national-identifiers.mjs';
import { taxIdValidator } from '../../dist/tax-id/fesm2022/national-identifiers-angular.mjs';
import { FormControl, Validators } from '@angular/forms';

test('exposes the supported countries through the public API', () => {
  assert.equal(SUPPORTED_TAX_ID_COUNTRIES.length, 195);
  assert.deepEqual(
    [...SUPPORTED_TAX_ID_COUNTRIES],
    [...SUPPORTED_TAX_ID_COUNTRIES].sort(),
  );
  assert.equal(Object.isFrozen(SUPPORTED_TAX_ID_COUNTRIES), true);
  assert.equal(isSupportedTaxIdCountry('IT'), true);
  assert.equal(isSupportedTaxIdCountry('VC'), true);
  assert.equal(isSupportedTaxIdCountry('PW'), true);
  assert.equal(isSupportedTaxIdCountry('PA'), true);
  assert.equal(isSupportedTaxIdCountry('FM'), true);
  assert.equal(isSupportedTaxIdCountry('SD'), true);
  assert.equal(isSupportedTaxIdCountry('LB'), true);
  assert.equal(isSupportedTaxIdCountry('SR'), true);
  assert.equal(isSupportedTaxIdCountry('CD'), true);
  assert.equal(isSupportedTaxIdCountry('it'), false);
  assert.equal(isSupportedTaxIdCountry('TD'), true);
  assert.equal(isSupportedTaxIdCountry('XX'), false);
});

test('normalizes a tax ID', () => {
  assert.equal(normalizeTaxId(' rssmra-85t10 a562s '), 'RSSMRA85T10A562S');
});

test('calculates and validates the Italian checksum', () => {
  assert.equal(calculateItalianFiscalCodeCheckCharacter('RSSMRA85T10A562'), 'S');
  assert.equal(validateItalianFiscalCode('rssmra85t10a562s').valid, true);
  assert.equal(validateItalianFiscalCode('RSSMRA85T10A562A').error, 'invalid_checksum');
});

test('validates Italian VAT numbers alongside personal fiscal codes', () => {
  assert.equal(validateItalianFiscalCode('00743110157').valid, true);
  assert.equal(validateItalianFiscalCode('00743 110-157').valid, true);
  assert.equal(validateTaxId('IT', '00743110157').valid, true);
  assert.equal(validateItalianFiscalCode('00743110158').error, 'invalid_checksum');
  assert.equal(validateItalianFiscalCode('0074311015A').error, 'invalid_format');
  assert.equal(validateItalianFiscalCode('00000000000').error, 'invalid_format');
  assert.equal(validateItalianFiscalCode('007431101').error, 'invalid_length');
});

test('maps validation results to registration policy outcomes', () => {
  assert.equal(taxIdCheckOutcome(validateTaxId('IT', 'RSSMRA85T10A562S')), 'accept');
  assert.equal(taxIdCheckOutcome(validateTaxId('IT', '00743110157')), 'accept');
  assert.equal(taxIdCheckOutcome(validateTaxId('IT', 'RSSMRA85T10A562A')), 'block');
  assert.equal(taxIdCheckOutcome(validateTaxId('IT', 'RSSMRA85')), 'block');
  assert.equal(taxIdCheckOutcome(validateTaxId('IT', '')), 'block');
  assert.equal(taxIdCheckOutcome(validateTaxId('SO', '12')), 'warn');
  assert.equal(taxIdCheckOutcome(validateTaxId('SO', '12345678')), 'accept');
  assert.equal(taxIdCheckOutcome(validateTaxId('AE', '123456789')), 'warn');
  assert.equal(taxIdCheckOutcome(validateTaxId('XX', '123456789')), 'warn');
});

test('uses value-specific policy metadata for countries with mixed validation levels', () => {
  assert.equal(taxIdCheckOutcome(validateTaxId('CZ', '531332/123')), 'warn');
  assert.equal(taxIdCheckOutcome(validateTaxId('CZ', '800101/0007')), 'block');
  assert.equal(taxIdCheckOutcome(validateTaxId('SK', '531332/123')), 'warn');
  assert.equal(taxIdCheckOutcome(validateTaxId('SK', '800101/0007')), 'block');
  assert.equal(taxIdCheckOutcome(validateTaxId('ID', '3173013213990001')), 'warn');
  assert.equal(taxIdCheckOutcome(validateTaxId('ID', '123456789012345')), 'block');
  assert.equal(taxIdCheckOutcome(validateTaxId('SG', 'M1234567!')), 'warn');
  assert.equal(taxIdCheckOutcome(validateTaxId('SG', 'S1234567A')), 'block');
});

test('reports unsupported countries', () => {
  assert.equal(validateTaxId('XX', '123').error, 'unsupported_country');
  assert.deepEqual(validateTaxId(null, '123'), {
    valid: false,
    country: '',
    normalizedValue: '123',
    error: 'unsupported_country',
  });
  assert.equal(validateTaxId('  ', '123').error, 'unsupported_country');
});

test('validates Spanish DNI and NIE identifiers', () => {
  assert.equal(validateTaxId('ES', '12345678Z').valid, true);
  assert.equal(validateTaxId('ES', 'X1234567L').valid, true);
  assert.equal(validateTaxId('ES', '12345678A').error, 'invalid_checksum');
});

test('validates French SPI identifiers', () => {
  assert.equal(validateTaxId('FR', '3023217600053').valid, true);
  assert.equal(validateTaxId('FR', '3023217600054').error, 'invalid_checksum');
});

test('validates Portuguese NIF identifiers', () => {
  assert.equal(validateTaxId('PT', '123456789').valid, true);
  assert.equal(validateTaxId('PT', '123456788').error, 'invalid_checksum');
});

test('validates Greek AFM identifiers', () => {
  assert.equal(validateTaxId('GR', '094259216').valid, true);
  assert.equal(validateTaxId('GR', '094259217').error, 'invalid_checksum');
});

test('validates Belgian national register numbers', () => {
  assert.equal(validateTaxId('BE', '85.07.30-033.28').valid, true);
  assert.equal(validateTaxId('BE', '85073003329').error, 'invalid_checksum');
});

test('validates Croatian OIB identifiers', () => {
  assert.equal(validateTaxId('HR', '12345678903').valid, true);
  assert.equal(validateTaxId('HR', '12345678904').error, 'invalid_checksum');
});

test('validates Polish PESEL identifiers', () => {
  assert.equal(validateTaxId('PL', '44051401458').valid, true);
  assert.equal(validateTaxId('PL', '44051401459').error, 'invalid_checksum');
});

test('validates Finnish personal identity codes', () => {
  assert.equal(validateTaxId('FI', '131052-308T').valid, true);
  assert.equal(validateTaxId('FI', '131052-308A').error, 'invalid_checksum');
});

test('validates Danish CPR structure without claiming a checksum', () => {
  assert.deepEqual(validateTaxId('DK', '010101-1234'), {
    valid: true,
    country: 'DK',
    normalizedValue: '0101011234',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('DK', '310299-1234').error, 'invalid_format');
});

test('validates Norwegian national identity numbers', () => {
  assert.equal(validateTaxId('NO', '01010100050').valid, true);
  assert.equal(validateTaxId('NO', '01010100051').error, 'invalid_checksum');
});

test('validates Swedish personal identity numbers', () => {
  assert.equal(validateTaxId('SE', '811228-9874').valid, true);
  assert.equal(validateTaxId('SE', '811228-9875').error, 'invalid_checksum');
});

test('validates Icelandic kennitala identifiers', () => {
  assert.equal(validateTaxId('IS', '120174-0029').valid, true);
  assert.equal(validateTaxId('IS', '120174-0039').error, 'invalid_checksum');
});

test('validates Estonian personal identification codes', () => {
  assert.equal(validateTaxId('EE', '37605030299').valid, true);
  assert.equal(validateTaxId('EE', '37605030298').error, 'invalid_checksum');
});

test('validates historical and opaque Latvian personal codes', () => {
  assert.equal(validateTaxId('LV', '010190-12349').valid, true);
  assert.equal(validateTaxId('LV', '320000-12340').valid, true);
  assert.equal(validateTaxId('LV', '320000-12341').error, 'invalid_checksum');
});

test('validates Lithuanian personal codes', () => {
  assert.equal(validateTaxId('LT', '38409152012').valid, true);
  assert.equal(validateTaxId('LT', '38409152013').error, 'invalid_checksum');
});

test('validates Dutch BSN identifiers', () => {
  assert.equal(validateTaxId('NL', '123456782').valid, true);
  assert.equal(validateTaxId('NL', '123456783').error, 'invalid_checksum');
});

test('validates Czech and Slovak birth numbers', () => {
  assert.equal(validateTaxId('CZ', '800101/0006').valid, true);
  assert.equal(validateTaxId('SK', '800101/0006').valid, true);
  assert.equal(validateTaxId('CZ', '800101/0007').error, 'invalid_checksum');
});

test('accepts historical Czech birth numbers as format-only', () => {
  assert.deepEqual(validateTaxId('CZ', '530101/123'), {
    valid: true,
    country: 'CZ',
    normalizedValue: '530101123',
    validationLevel: 'format',
  });
});

test('validates Slovenian tax numbers', () => {
  assert.equal(validateTaxId('SI', '12345679').valid, true);
  assert.equal(validateTaxId('SI', '12345678').error, 'invalid_checksum');
});

test('validates Austrian TIN structure without claiming a checksum', () => {
  assert.deepEqual(validateTaxId('AT', '12-345/6789'), {
    valid: true,
    country: 'AT',
    normalizedValue: '123456789',
    validationLevel: 'format',
  });
});

test('validates German tax identification numbers', () => {
  assert.equal(validateTaxId('DE', '12345678911').valid, true);
  assert.equal(validateTaxId('DE', '12345678912').error, 'invalid_checksum');
});

test('validates Swiss AHV identifiers', () => {
  assert.equal(validateTaxId('CH', '756.1234.5678.97').valid, true);
  assert.equal(validateTaxId('CH', '756.1234.5678.98').error, 'invalid_checksum');
});

test('validates Hungarian tax identification signs', () => {
  assert.equal(validateTaxId('HU', '8123456786').valid, true);
  assert.equal(validateTaxId('HU', '8123456787').error, 'invalid_checksum');
});

test('validates Romanian CNP identifiers', () => {
  assert.equal(validateTaxId('RO', '1960523420017').valid, true);
  assert.equal(validateTaxId('RO', '1960523420018').error, 'invalid_checksum');
});

test('validates Bulgarian EGN identifiers', () => {
  assert.equal(validateTaxId('BG', '0041010002').valid, true);
  assert.equal(validateTaxId('BG', '0041010003').error, 'invalid_checksum');
  assert.equal(validateTaxId('BG', '0053010000').error, 'invalid_format');
});

test('validates Serbian JMBG identifiers', () => {
  assert.equal(validateTaxId('RS', '0101006710000').valid, true);
  assert.equal(validateTaxId('RS', '0101006710001').error, 'invalid_checksum');
  assert.equal(validateTaxId('RS', '0101006210008').error, 'invalid_format');
});

test('validates Montenegrin JMBG identifiers', () => {
  assert.equal(validateTaxId('ME', '0101006210008').valid, true);
  assert.equal(validateTaxId('ME', '0101006210009').error, 'invalid_checksum');
});

test('validates North Macedonian EMBG identifiers', () => {
  assert.equal(validateTaxId('MK', '0101006410007').valid, true);
  assert.equal(validateTaxId('MK', '0101006410008').error, 'invalid_checksum');
});

test('validates Albanian personal numbers as format-only', () => {
  assert.deepEqual(validateTaxId('AL', 'K30315001A'), {
    valid: true,
    country: 'AL',
    normalizedValue: 'K30315001A',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('AL', 'K30230001A').error, 'invalid_format');
});

test('validates Bosnian JMBG identifiers', () => {
  assert.equal(validateTaxId('BA', '0101006170006').valid, true);
  assert.equal(validateTaxId('BA', '0101006170007').error, 'invalid_checksum');
  assert.equal(validateTaxId('BA', '0101006210008').error, 'invalid_format');
});

test('validates Turkish identity numbers', () => {
  assert.equal(validateTaxId('TR', '10000000146').valid, true);
  assert.equal(validateTaxId('TR', '10000000147').error, 'invalid_checksum');
  assert.equal(validateTaxId('TR', '00000000146').error, 'invalid_format');
});

test('validates Moldovan IDNP identifiers as format-only', () => {
  assert.deepEqual(validateTaxId('MD', '2002001000001'), {
    valid: true,
    country: 'MD',
    normalizedValue: '2002001000001',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('MD', '0000000000000').error, 'invalid_format');
});

test('validates Ukrainian taxpayer numbers as format-only', () => {
  assert.deepEqual(validateTaxId('UA', '1234567890'), {
    valid: true,
    country: 'UA',
    normalizedValue: '1234567890',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('UA', '123456789A').error, 'invalid_format');
});

test('validates Cypriot TIN identifiers as format-only', () => {
  assert.deepEqual(validateTaxId('CY', '12345678T'), {
    valid: true,
    country: 'CY',
    normalizedValue: '12345678T',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('CY', '123456789').error, 'invalid_format');
});

test('validates Irish PPS numbers', () => {
  assert.equal(validateTaxId('IE', '1234567T').valid, true);
  assert.equal(validateTaxId('IE', '1234567TW').valid, true);
  assert.equal(validateTaxId('IE', '1234567A').error, 'invalid_checksum');
});

test('validates Luxembourg national identification numbers', () => {
  assert.equal(validateTaxId('LU', '2000010100125').valid, true);
  assert.equal(validateTaxId('LU', '2000010100126').error, 'invalid_checksum');
  assert.equal(validateTaxId('LU', '2000023000125').error, 'invalid_format');
});

test('validates Maltese TIN identifiers as format-only', () => {
  assert.deepEqual(validateTaxId('MT', '1234567M'), {
    valid: true,
    country: 'MT',
    normalizedValue: '1234567M',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('MT', '1234567X').error, 'invalid_format');
});

test('validates Liechtenstein PEID identifiers as format-only', () => {
  assert.deepEqual(validateTaxId('LI', '000247681888'), {
    valid: true,
    country: 'LI',
    normalizedValue: '000247681888',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('LI', '000000000000').error, 'invalid_format');
});

test('validates Andorran NRT identifiers as format-only', () => {
  assert.deepEqual(validateTaxId('AD', 'F123456Z'), {
    valid: true,
    country: 'AD',
    normalizedValue: 'F123456Z',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('AD', 'F000000Z').error, 'invalid_format');
});

test('validates UK tax identifiers as format-only', () => {
  assert.deepEqual(validateTaxId('GB', 'AB123456C'), {
    valid: true,
    country: 'GB',
    normalizedValue: 'AB123456C',
    validationLevel: 'format',
  });
  assert.deepEqual(validateTaxId('GB', '1234567890'), {
    valid: true,
    country: 'GB',
    normalizedValue: '1234567890',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('GB', 'AB123456E').error, 'invalid_format');
});

test('validates Russian tax identifiers', () => {
  assert.equal(validateTaxId('RU', '7728168971').valid, true);
  assert.equal(validateTaxId('RU', '7728168972').error, 'invalid_checksum');
  assert.equal(validateTaxId('RU', '500100732259').valid, true);
  assert.equal(validateTaxId('RU', '500100732258').error, 'invalid_checksum');
});

test('validates Belarusian tax identifiers as format-only', () => {
  assert.deepEqual(validateTaxId('BY', '123456789'), {
    valid: true,
    country: 'BY',
    normalizedValue: '123456789',
    validationLevel: 'format',
  });
  assert.deepEqual(validateTaxId('BY', 'AB1234567'), {
    valid: true,
    country: 'BY',
    normalizedValue: 'AB1234567',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('BY', '12345678').error, 'invalid_length');
});

test('validates San Marino tax identifiers as format-only', () => {
  assert.deepEqual(validateTaxId('SM', '123456789'), {
    valid: true,
    country: 'SM',
    normalizedValue: '123456789',
    validationLevel: 'format',
  });
  assert.deepEqual(validateTaxId('SM', '12345'), {
    valid: true,
    country: 'SM',
    normalizedValue: '12345',
    validationLevel: 'format',
  });
  assert.deepEqual(validateTaxId('SM', 'SM12345'), {
    valid: true,
    country: 'SM',
    normalizedValue: 'SM12345',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('SM', '1234').error, 'invalid_format');
});

test('validates Monaco tax identifiers as format-only', () => {
  assert.deepEqual(validateTaxId('MC', 'FR12345678901'), {
    valid: true,
    country: 'MC',
    normalizedValue: 'FR12345678901',
    validationLevel: 'format',
  });
  assert.deepEqual(validateTaxId('MC', '123456789'), {
    valid: true,
    country: 'MC',
    normalizedValue: '123456789',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('MC', '1234').error, 'invalid_format');
});

test('validates US tax identifiers as format-only', () => {
  assert.deepEqual(validateTaxId('US', '123456789'), {
    valid: true,
    country: 'US',
    normalizedValue: '123456789',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('US', '000456789').error, 'invalid_format');
});

test('validates Canadian tax identifiers', () => {
  assert.equal(validateTaxId('CA', '046454286').valid, true);
  assert.equal(validateTaxId('CA', '046454287').error, 'invalid_checksum');
});

test('validates Brazilian tax identifiers', () => {
  assert.equal(validateTaxId('BR', '11144477735').valid, true);
  assert.equal(validateTaxId('BR', '11144477736').error, 'invalid_checksum');
  assert.equal(validateTaxId('BR', '00000000000').error, 'invalid_format');
});

test('validates Mexican tax identifiers', () => {
  assert.equal(validateTaxId('MX', 'GODE561231GR8').valid, true);
  assert.equal(validateTaxId('MX', 'GODE561231GR9').error, 'invalid_checksum');
});

test('validates Argentine tax identifiers', () => {
  assert.equal(validateTaxId('AR', '20267565393').valid, true);
  assert.equal(validateTaxId('AR', '20267565394').error, 'invalid_checksum');
});

test('validates Chilean tax identifiers', () => {
  assert.equal(validateTaxId('CL', '123456785').valid, true);
  assert.equal(validateTaxId('CL', '1111122K').valid, true);
  assert.equal(validateTaxId('CL', '123456786').error, 'invalid_checksum');
});

test('validates Colombian tax identifiers', () => {
  assert.equal(validateTaxId('CO', '8903215670').valid, true);
  assert.equal(validateTaxId('CO', '8903215671').error, 'invalid_checksum');
});

test('validates Peruvian tax identifiers', () => {
  assert.equal(validateTaxId('PE', '100000008').valid, true); // DNI
  assert.equal(validateTaxId('PE', '20100000009').valid, true); // RUC
  assert.equal(validateTaxId('PE', '20100000008').error, 'invalid_checksum');
});

test('validates Uruguayan tax identifiers', () => {
  assert.equal(validateTaxId('UY', '12345672').valid, true);
  assert.equal(validateTaxId('UY', '12345673').error, 'invalid_checksum');
});

test('validates Venezuelan tax identifiers', () => {
  assert.equal(validateTaxId('VE', 'J070133805').valid, true);
  assert.equal(validateTaxId('VE', 'J070133806').error, 'invalid_checksum');
});

test('validates Australian tax file numbers', () => {
  assert.equal(validateTaxId('AU', '123456782').valid, true);
  assert.equal(validateTaxId('AU', '123456783').error, 'invalid_checksum');
  assert.equal(validateTaxId('AU', '000000000').error, 'invalid_format');
});

test('validates Chinese resident identity numbers', () => {
  assert.equal(validateTaxId('CN', '11010519491231002X').valid, true);
  assert.equal(validateTaxId('CN', '110105194912310021').error, 'invalid_checksum');
  assert.equal(validateTaxId('CN', '110105194913310029').error, 'invalid_format');
});

test('validates Indian PAN identifiers as format-only', () => {
  assert.deepEqual(validateTaxId('IN', 'ABCPE1234F'), {
    valid: true,
    country: 'IN',
    normalizedValue: 'ABCPE1234F',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('IN', 'ABCXE1234F').error, 'invalid_format');
});

test('validates Israeli identity numbers', () => {
  assert.equal(validateTaxId('IL', '123456782').valid, true);
  assert.equal(validateTaxId('IL', '123456783').error, 'invalid_checksum');
});

test('validates Japanese My Number identifiers', () => {
  assert.equal(validateTaxId('JP', '123456789018').valid, true);
  assert.equal(validateTaxId('JP', '123456789019').error, 'invalid_checksum');
});

test('validates South Korean RRN identifiers as format-only', () => {
  assert.deepEqual(validateTaxId('KR', '900101-1234567'), {
    valid: true,
    country: 'KR',
    normalizedValue: '9001011234567',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('KR', '901301-1234567').error, 'invalid_format');
});

test('validates New Zealand IRD numbers', () => {
  assert.equal(validateTaxId('NZ', '49-091-850').valid, true);
  assert.equal(validateTaxId('NZ', '49091851').error, 'invalid_checksum');
  assert.equal(validateTaxId('NZ', '999999999').error, 'invalid_format');
});

test('validates Singaporean NRIC and FIN identifiers', () => {
  assert.equal(validateTaxId('SG', 'S1234567D').valid, true);
  assert.equal(validateTaxId('SG', 'S1234567A').error, 'invalid_checksum');
  assert.deepEqual(validateTaxId('SG', 'M1234567X'), {
    valid: true,
    country: 'SG',
    normalizedValue: 'M1234567X',
    validationLevel: 'format',
  });
});

test('validates Thai national identification numbers', () => {
  assert.equal(validateTaxId('TH', '1101700230708').valid, true);
  assert.equal(validateTaxId('TH', '1101700230709').error, 'invalid_checksum');
  assert.equal(validateTaxId('TH', '0101700230708').error, 'invalid_format');
});

test('validates Georgian personal numbers as format-only', () => {
  assert.deepEqual(validateTaxId('GE', '12345678901'), {
    valid: true,
    country: 'GE',
    normalizedValue: '12345678901',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('GE', '1234567890').error, 'invalid_length');
});

test('validates Indonesian NPWP and NIK identifiers', () => {
  assert.equal(validateTaxId('ID', '01.300.066.6-091.000').valid, true);
  assert.equal(validateTaxId('ID', '013000667091000').error, 'invalid_checksum');
  assert.deepEqual(validateTaxId('ID', '3171011708450001'), {
    valid: true,
    country: 'ID',
    normalizedValue: '3171011708450001',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('ID', '3171015708450001').valid, true);
  assert.equal(validateTaxId('ID', '3171011713450001').error, 'invalid_format');
});

test('validates Kazakh IIN identifiers', () => {
  assert.equal(validateTaxId('KZ', '900101300007').valid, true);
  assert.equal(validateTaxId('KZ', '900101300008').error, 'invalid_checksum');
  assert.equal(validateTaxId('KZ', '901301300007').error, 'invalid_format');
});

test('validates Kyrgyz personal numbers as format-only', () => {
  assert.deepEqual(validateTaxId('KG', '10101199000001'), {
    valid: true,
    country: 'KG',
    normalizedValue: '10101199000001',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('KG', '10113199000001').error, 'invalid_format');
});

test('validates Malaysian NRIC numbers as format-only', () => {
  assert.deepEqual(validateTaxId('MY', '850101-14-5678'), {
    valid: true,
    country: 'MY',
    normalizedValue: '850101145678',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('MY', '851301145678').error, 'invalid_format');
});

test('validates Philippine TIN identifiers as format-only', () => {
  assert.deepEqual(validateTaxId('PH', '123456789'), {
    valid: true,
    country: 'PH',
    normalizedValue: '123456789',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('PH', '123456789000').valid, true);
  assert.equal(validateTaxId('PH', '12345678').error, 'invalid_length');
});

test('validates Pakistani CNIC and NTN identifiers as format-only', () => {
  assert.deepEqual(validateTaxId('PK', '1234512345671'), {
    valid: true,
    country: 'PK',
    normalizedValue: '1234512345671',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('PK', '1234567').valid, true);
  assert.equal(validateTaxId('PK', '0234512345671').error, 'invalid_format');
});

test('validates Vietnamese tax identifiers as format-only', () => {
  assert.deepEqual(validateTaxId('VN', '0123456789'), {
    valid: true,
    country: 'VN',
    normalizedValue: '0123456789',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('VN', '012345678901').valid, true);
  assert.equal(validateTaxId('VN', '012345678').error, 'invalid_length');
});

test('validates South African tax reference and identity numbers', () => {
  assert.equal(validateTaxId('ZA', '0001339050').valid, true);
  assert.equal(validateTaxId('ZA', '0001339051').error, 'invalid_checksum');
  assert.equal(validateTaxId('ZA', '4001339050').error, 'invalid_format');
  assert.equal(validateTaxId('ZA', '9405105678082').valid, true);
  assert.equal(validateTaxId('ZA', '9405105678083').error, 'invalid_checksum');
});

test('validates Iranian national identity codes', () => {
  assert.equal(validateTaxId('IR', '1234567891').valid, true);
  assert.equal(validateTaxId('IR', '1234567892').error, 'invalid_checksum');
  assert.equal(validateTaxId('IR', '1111111111').error, 'invalid_format');
});

test('validates Ecuadorian cedula and personal RUC identifiers', () => {
  assert.equal(validateTaxId('EC', '1714616123').valid, true);
  assert.equal(validateTaxId('EC', '1714616123001').valid, true);
  assert.equal(validateTaxId('EC', '1714616124').error, 'invalid_checksum');
  assert.equal(validateTaxId('EC', '9914616123').error, 'invalid_format');
});

test('validates Dominican cedula identifiers', () => {
  assert.equal(validateTaxId('DO', '00100082700').valid, true);
  assert.equal(validateTaxId('DO', '00100082701').error, 'invalid_checksum');
});

test('validates Paraguayan RUC identifiers', () => {
  assert.equal(validateTaxId('PY', '3966931-9').valid, true);
  assert.equal(validateTaxId('PY', '39669318').error, 'invalid_checksum');
});

test('validates Guatemalan NIT identifiers', () => {
  assert.equal(validateTaxId('GT', '3602978-5').valid, true);
  assert.equal(validateTaxId('GT', '576937K').valid, true);
  assert.equal(validateTaxId('GT', '36029786').error, 'invalid_checksum');
});

test('validates Sri Lankan NIC identifiers as format-only', () => {
  assert.deepEqual(validateTaxId('LK', '790930622V'), {
    valid: true,
    country: 'LK',
    normalizedValue: '790930622V',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('LK', '199012300123').valid, true);
  assert.equal(validateTaxId('LK', '794430622V').error, 'invalid_format');
});

test('validates Uzbek PINFL identifiers as format-only', () => {
  assert.deepEqual(validateTaxId('UZ', '30101901234567'), {
    valid: true,
    country: 'UZ',
    normalizedValue: '30101901234567',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('UZ', '30113901234567').error, 'invalid_format');
});

test('validates Cuban identity numbers as format-only', () => {
  assert.deepEqual(validateTaxId('CU', '90010112345'), {
    valid: true,
    country: 'CU',
    normalizedValue: '90010112345',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('CU', '90130112345').error, 'invalid_format');
});

test('validates Egyptian TIN identifiers as format-only', () => {
  assert.equal(validateTaxId('EG', '123456789').valid, true);
  assert.equal(validateTaxId('EG', '000000000').error, 'invalid_format');
});

test('validates Ghanaian tax identifiers as format-only', () => {
  assert.equal(validateTaxId('GH', 'GHA1234567890').valid, true);
  assert.equal(validateTaxId('GH', 'GHA12345A7890').error, 'invalid_format');
});

test('validates Kenyan KRA PIN identifiers as format-only', () => {
  assert.equal(validateTaxId('KE', 'A123456789B').valid, true);
  assert.equal(validateTaxId('KE', 'B123456789B').error, 'invalid_format');
});

test('validates Mauritian TAN identifiers as format-only', () => {
  assert.equal(validateTaxId('MU', '12345678').valid, true);
  assert.equal(validateTaxId('MU', '00000000').error, 'invalid_format');
});

test('validates Nigerian TIN identifiers as format-only', () => {
  assert.equal(validateTaxId('NG', '1234567890').valid, true);
  assert.equal(validateTaxId('NG', '123456780001').valid, true);
  assert.equal(validateTaxId('NG', '0000000000').error, 'invalid_format');
});

test('validates Rwandan TIN identifiers as format-only', () => {
  assert.equal(validateTaxId('RW', '123456789').valid, true);
  assert.equal(validateTaxId('RW', '000000000').error, 'invalid_format');
});

test('validates Tanzanian TIN identifiers as format-only', () => {
  assert.equal(validateTaxId('TZ', '123456789').valid, true);
  assert.equal(validateTaxId('TZ', '1234567890').valid, true);
  assert.equal(validateTaxId('TZ', '000000000').error, 'invalid_format');
});

test('validates Ugandan TIN identifiers as format-only', () => {
  assert.equal(validateTaxId('UG', '1234567890').valid, true);
  assert.equal(validateTaxId('UG', '0000000000').error, 'invalid_format');
});

test('validates Zambian TPIN identifiers as format-only', () => {
  assert.equal(validateTaxId('ZM', '1234567890').valid, true);
  assert.equal(validateTaxId('ZM', '0000000000').error, 'invalid_format');
});

test('validates Costa Rican personal identifiers as format-only', () => {
  assert.equal(validateTaxId('CR', '123456789').valid, true);
  assert.equal(validateTaxId('CR', '023456789').error, 'invalid_format');
});

test('validates Bangladeshi eTIN identifiers as format-only', () => {
  assert.equal(validateTaxId('BD', '123456789012').valid, true);
  assert.equal(validateTaxId('BD', '000000000000').error, 'invalid_format');
});

test('validates Nepalese PAN identifiers as format-only', () => {
  assert.equal(validateTaxId('NP', '123456789').valid, true);
  assert.equal(validateTaxId('NP', '000000000').error, 'invalid_format');
});

test('validates Fijian TIN identifiers as format-only', () => {
  assert.equal(validateTaxId('FJ', '123456789').valid, true);
  assert.equal(validateTaxId('FJ', '000000000').error, 'invalid_format');
});

test('validates Papua New Guinean TIN identifiers as format-only', () => {
  assert.equal(validateTaxId('PG', '123456789').valid, true);
  assert.equal(validateTaxId('PG', '000000000').error, 'invalid_format');
});

test('validates Jamaican TRN identifiers as format-only', () => {
  assert.equal(validateTaxId('JM', '123456789').valid, true);
  assert.equal(validateTaxId('JM', '000000000').error, 'invalid_format');
});

test('validates Trinidad and Tobago BIR identifiers as format-only', () => {
  assert.equal(validateTaxId('TT', '1234567890').valid, true);
  assert.equal(validateTaxId('TT', '0000000000').error, 'invalid_format');
});

test('validates Guyanese TIN identifiers as format-only', () => {
  assert.equal(validateTaxId('GY', '123456789').valid, true);
  assert.equal(validateTaxId('GY', '000000000').error, 'invalid_format');
});

test('validates Honduran RTN identifiers as format-only', () => {
  assert.equal(validateTaxId('HN', '08011990123456').valid, true);
  assert.equal(validateTaxId('HN', '00000000000000').error, 'invalid_format');
});

test('validates Armenian PSN identifiers as format-only', () => {
  assert.equal(validateTaxId('AM', '1234567890').valid, true);
  assert.equal(validateTaxId('AM', '0000000000').error, 'invalid_format');
});

test('validates Ethiopian TIN identifiers as format-only', () => {
  assert.equal(validateTaxId('ET', '1234567890').valid, true);
  assert.equal(validateTaxId('ET', '0000000000').error, 'invalid_format');
});

test('validates Namibian TIN identifiers as format-only', () => {
  assert.equal(validateTaxId('NA', '123456789').valid, true);
  assert.equal(validateTaxId('NA', '000000000').error, 'invalid_format');
});

test('validates Belizean TIN identifiers as format-only', () => {
  assert.equal(validateTaxId('BZ', '123456').valid, true);
  assert.equal(validateTaxId('BZ', '000000').error, 'invalid_format');
});

test('validates Azerbaijani TIN identifiers as format-only', () => {
  assert.equal(validateTaxId('AZ', '1234567890').valid, true);
  assert.equal(validateTaxId('AZ', '0000000000').error, 'invalid_format');
});

test('validates Cambodian TIN identifiers as format-only', () => {
  assert.equal(validateTaxId('KH', '123456789').valid, true);
  assert.equal(validateTaxId('KH', '1234567890').valid, true);
  assert.equal(validateTaxId('KH', '000000000').error, 'invalid_format');
});

test('validates Barbadian TIN identifiers as format-only', () => {
  assert.equal(validateTaxId('BB', '1234567890123').valid, true);
  assert.equal(validateTaxId('BB', '0000000000000').error, 'invalid_format');
});

test('validates Salvadoran NIT identifiers as format-only', () => {
  assert.equal(validateTaxId('SV', '0614-241287-102-5').valid, true);
  assert.equal(validateTaxId('SV', '0614-321287-102-5').error, 'invalid_format');
});

test('validates Nicaraguan RUC identifiers as format-only', () => {
  assert.equal(validateTaxId('NI', '001-241287-1234A').valid, true);
  assert.equal(validateTaxId('NI', '001-321287-1234A').error, 'invalid_format');
});

test('validates Jordanian TIN identifiers as format-only', () => {
  assert.equal(validateTaxId('JO', '123456789').valid, true);
  assert.equal(validateTaxId('JO', '000000000').error, 'invalid_format');
});

test('validates Bolivian NIT identifiers as format-only', () => {
  assert.equal(validateTaxId('BO', '1234567').valid, true);
  assert.equal(validateTaxId('BO', '1234567890').valid, true);
  assert.equal(validateTaxId('BO', '0000000').error, 'invalid_format');
});

test('reports that a personal TIN is not generally applicable in the UAE', () => {
  assert.equal(validateTaxId('AE', '123456789').error, 'not_applicable');
});

test('reports that a personal TIN is not generally applicable in Bahrain', () => {
  assert.equal(validateTaxId('BH', '123456789').error, 'not_applicable');
});

test('reports that a personal TIN is not generally applicable in Kuwait', () => {
  assert.equal(validateTaxId('KW', '123456789').error, 'not_applicable');
});

test('reports that a personal TIN is not generally applicable in Qatar', () => {
  assert.equal(validateTaxId('QA', '123456789').error, 'not_applicable');
});

test('reports that a personal TIN is not generally applicable in Saudi Arabia', () => {
  assert.equal(validateTaxId('SA', '123456789').error, 'not_applicable');
});

test('reports that a personal TIN is not generally applicable in Brunei', () => {
  assert.equal(validateTaxId('BN', '123456789').error, 'not_applicable');
});

test('reports that a personal TIN is not generally applicable in the Bahamas', () => {
  assert.equal(validateTaxId('BS', '123456789').error, 'not_applicable');
});

test('reports that a personal TIN is not generally applicable in Nauru', () => {
  assert.equal(validateTaxId('NR', '123456789').error, 'not_applicable');
});

test('reports that a personal TIN is not generally applicable in Vanuatu', () => {
  assert.equal(validateTaxId('VU', '123456789').error, 'not_applicable');
});

test('reports that a personal TIN is not applicable in Vatican City', () => {
  assert.equal(validateTaxId('VA', '123456789').error, 'not_applicable');
});

test('validates Moroccan fiscal identifiers as format-only', () => {
  assert.equal(validateTaxId('MA', '12345678').valid, true);
  assert.equal(validateTaxId('MA', '00000000').error, 'invalid_format');
});

test('validates Tunisian fiscal identifiers as format-only', () => {
  assert.equal(validateTaxId('TN', '1234567/A/M/000').valid, true);
  assert.equal(validateTaxId('TN', '0000000/A/M/000').error, 'invalid_format');
});

test('validates Botswana Omang identifiers as format-only', () => {
  assert.equal(validateTaxId('BW', '123456789').valid, true);
  assert.equal(validateTaxId('BW', '000000000').error, 'invalid_format');
});

test('validates Mongolian civil registration numbers as format-only', () => {
  assert.equal(validateTaxId('MN', 'УБ90103112').valid, true);
  assert.equal(validateTaxId('MN', 'УБ90323112').error, 'invalid_format');
});

test('reports that a personal TIN is not currently applicable in Oman', () => {
  assert.equal(validateTaxId('OM', '123456789').error, 'not_applicable');
});

test('validates Angolan NIF identifiers as format-only', () => {
  assert.equal(validateTaxId('AO', '1234567890').valid, true);
  assert.equal(validateTaxId('AO', '0000000000').error, 'invalid_format');
});

test('validates Cape Verdean NIF identifiers', () => {
  assert.equal(validateTaxId('CV', '501442600').valid, true);
  assert.equal(validateTaxId('CV', '501442601').error, 'invalid_checksum');
});

test('validates Mozambican NUIT identifiers as format-only', () => {
  assert.equal(validateTaxId('MZ', '123456789').valid, true);
  assert.equal(validateTaxId('MZ', '000000000').error, 'invalid_format');
});

test('validates Bhutanese citizen identifiers as format-only', () => {
  assert.equal(validateTaxId('BT', '12345678901').valid, true);
  assert.equal(validateTaxId('BT', '00000000000').error, 'invalid_format');
});

test('validates Palestinian identity numbers', () => {
  assert.equal(validateTaxId('PS', '123456782').valid, true);
  assert.equal(validateTaxId('PS', '123456783').error, 'invalid_checksum');
});

test('validates Algerian NIF identifiers as format-only', () => {
  assert.equal(validateTaxId('DZ', '408 020 000 150 039').valid, true);
  assert.equal(validateTaxId('DZ', '41201600000606600001').valid, true);
  assert.equal(validateTaxId('DZ', '12345').error, 'invalid_length');
});

test('validates Guinean permanent fiscal identifiers', () => {
  assert.equal(validateTaxId('GN', '693-770-885').valid, true);
  assert.equal(validateTaxId('GN', '693770880').error, 'invalid_checksum');
});

test('validates Senegalese NINEA identifiers with optional COFI', () => {
  assert.equal(validateTaxId('SN', '306 7221').valid, true);
  assert.equal(validateTaxId('SN', '3067221 2G2').valid, true);
  assert.equal(validateTaxId('SN', '3067222').error, 'invalid_checksum');
  assert.equal(validateTaxId('SN', '3067221 9G2').error, 'invalid_format');
});

test('validates Iraqi TIN identifiers as format-only', () => {
  assert.equal(validateTaxId('IQ', '377819054').valid, true);
  assert.equal(validateTaxId('IQ', '000000000').error, 'invalid_format');
  assert.equal(validateTaxId('IQ', '12345678').error, 'invalid_length');
  assert.equal(validateTaxId('IQ', '1234567890').error, 'invalid_length');
});

test('validates Maldivian TIN identifiers as format-only', () => {
  assert.equal(validateTaxId('MV', '1099060').valid, true);
  assert.equal(validateTaxId('MV', '0000000').error, 'invalid_format');
  assert.equal(validateTaxId('MV', '123456').error, 'invalid_length');
  assert.equal(validateTaxId('MV', '12345678').error, 'invalid_length');
});

test('validates Samoan TIN identifiers as format-only', () => {
  assert.equal(validateTaxId('WS', '70004').valid, true);
  assert.equal(validateTaxId('WS', '11001').valid, true);
  assert.equal(validateTaxId('WS', '123456789').valid, true);
  assert.equal(validateTaxId('WS', '0000').error, 'invalid_length');
  assert.equal(validateTaxId('WS', '1234567890').error, 'invalid_length');
  assert.equal(validateTaxId('WS', '00000').error, 'invalid_format');
});

test('validates Afghan e-Tazkira national identifiers as format-only', () => {
  assert.deepEqual(validateTaxId('AF', '1234-5678-90123'), {
    valid: true,
    country: 'AF',
    normalizedValue: '1234567890123',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('AF', '0000000000000').error, 'invalid_format');
  assert.equal(validateTaxId('AF', '123456789012').error, 'invalid_length');
});

test('validates Haitian NIF identifiers as format-only', () => {
  assert.deepEqual(validateTaxId('HT', '123-456-7890'), {
    valid: true,
    country: 'HT',
    normalizedValue: '1234567890',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('HT', '0000000000').error, 'invalid_format');
  assert.equal(validateTaxId('HT', '123456789').error, 'invalid_length');
  assert.equal(validateTaxId('HT', '12345678901').error, 'invalid_length');
});

test('validates Tajik INN identifiers as format-only', () => {
  assert.deepEqual(validateTaxId('TJ', '123-456-789'), {
    valid: true,
    country: 'TJ',
    normalizedValue: '123456789',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('TJ', '000000000').error, 'invalid_format');
  assert.equal(validateTaxId('TJ', '12345678').error, 'invalid_length');
  assert.equal(validateTaxId('TJ', '1234567890').error, 'invalid_length');
});

test('validates Dominican taxpayer numbers as format-only', () => {
  assert.equal(validateTaxId('DM', '123456').valid, true);
  assert.equal(validateTaxId('DM', '42').valid, true);
  assert.equal(validateTaxId('DM', '000000').error, 'invalid_format');
  assert.equal(validateTaxId('DM', '1234567').error, 'invalid_length');
});

test('validates Grenadian TIN identifiers as format-only', () => {
  assert.deepEqual(validateTaxId('GD', '123-456'), {
    valid: true,
    country: 'GD',
    normalizedValue: '123456',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('GD', '000000').error, 'invalid_format');
  assert.equal(validateTaxId('GD', '12345').error, 'invalid_length');
});

test('validates Marshallese employee identifiers as format-only', () => {
  assert.deepEqual(validateTaxId('MH', '04-086123'), {
    valid: true,
    country: 'MH',
    normalizedValue: '04086123',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('MH', '05-086123').error, 'invalid_format');
  assert.equal(validateTaxId('MH', '04000000').error, 'invalid_format');
  assert.equal(validateTaxId('MH', '04-08612').error, 'invalid_length');
});

test('validates Palauan ROP Social Security numbers as format-only', () => {
  assert.deepEqual(validateTaxId('PW', '006-123456'), {
    valid: true,
    country: 'PW',
    normalizedValue: '006123456',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('PW', '00612345A').error, 'invalid_format');
  assert.equal(validateTaxId('PW', '000000000').error, 'invalid_format');
  assert.equal(validateTaxId('PW', '00612345').error, 'invalid_length');
});

test('validates Panamanian personal RUC identifiers as format-only', () => {
  assert.deepEqual(validateTaxId('PA', '8-340-1234'), {
    valid: true,
    country: 'PA',
    normalizedValue: '83401234',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('PA', 'E-8-340-1234').valid, true);
  assert.equal(validateTaxId('PA', '8-PE-340-1234').valid, true);
  assert.equal(validateTaxId('PA', '8-340-1234-5').error, 'invalid_format');
  assert.equal(validateTaxId('PA', '0-000-0000').error, 'invalid_format');
  assert.equal(validateTaxId('PA', '83401234').error, 'invalid_format');
});

test('validates FSM Social Security numbers as format-only', () => {
  assert.deepEqual(validateTaxId('FM', '12-345678'), {
    valid: true,
    country: 'FM',
    normalizedValue: '12345678',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('FM', '1234567A').error, 'invalid_format');
  assert.equal(validateTaxId('FM', '00000000').error, 'invalid_format');
  assert.equal(validateTaxId('FM', '12-34567').error, 'invalid_length');
});

test('validates Sudanese national identifiers as format-only', () => {
  assert.deepEqual(validateTaxId('SD', 'AB-123456'), {
    valid: true,
    country: 'SD',
    normalizedValue: 'AB123456',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('SD', '1234/567').error, 'invalid_format');
  assert.equal(validateTaxId('SD', '').error, 'empty');
});

test('validates Lebanese TINs as format-only', () => {
  assert.deepEqual(validateTaxId('LB', '123456-601'), {
    valid: true,
    country: 'LB',
    normalizedValue: '123456601',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('LB', '123456').valid, true);
  assert.equal(validateTaxId('LB', '123456-603').valid, true);
  assert.equal(validateTaxId('LB', '123456-604').valid, true);
  assert.equal(validateTaxId('LB', '123456-602').error, 'invalid_format');
  assert.equal(validateTaxId('LB', 'ABC123').error, 'invalid_format');
  assert.equal(validateTaxId('LB', '').error, 'empty');
});

test('validates Surinamese FINs as format-only', () => {
  assert.deepEqual(validateTaxId('SR', '1234567890'), {
    valid: true,
    country: 'SR',
    normalizedValue: '1234567890',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('SR', '1').valid, true);
  assert.equal(validateTaxId('SR', '12345678901').error, 'invalid_length');
  assert.equal(validateTaxId('SR', '1234A').error, 'invalid_format');
  assert.equal(validateTaxId('SR', '12 34').error, 'invalid_format');
  assert.equal(validateTaxId('SR', '').error, 'empty');
});

test('validates DR Congo NIFs as format-only', () => {
  assert.deepEqual(validateTaxId('CD', 'a1011126f'), {
    valid: true,
    country: 'CD',
    normalizedValue: 'A1011126F',
    validationLevel: 'format',
  });
  assert.equal(validateTaxId('CD', 'A1011126').error, 'invalid_length');
  assert.equal(validateTaxId('CD', '10111267F').error, 'invalid_format');
  assert.equal(validateTaxId('CD', 'A10111267').error, 'invalid_format');
  assert.equal(validateTaxId('CD', '').error, 'empty');
});

test('validates the extended format-only country block', () => {
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
    ['TM', '123456789012', '000000000000'],
    ['GM', '1234567890', '0000000000'],
    ['KM', '8301149211', '0000000000'],
    ['GQ', 'A0704885T', 'A@704885T'],
    ['YE', '123456789', '000000000'],
    ['NE', '12345678', '00000000'],
    ['SO', '12345678', '00000000'],
    ['TD', 'ABC12345', 'ABC@1234'],
    ['DJ', 'AB12345', 'AB@1234'],
    ['ER', '1234567', '1234@56'],
    ['KI', '1234567', '5678@90'],
    ['TO', '1234567', '5678@90'],
  ];

  for (const [country, valid, invalid] of cases) {
    assert.equal(validateTaxId(country, valid).valid, true, country);
    assert.equal(validateTaxId(country, invalid).error, 'invalid_format', country);
  }
});

test('reports that a generalized personal TIN is not applicable in Tuvalu', () => {
  assert.equal(validateTaxId('TV', '123456789').error, 'not_applicable');
});

test('reports that a generalized personal TIN is not applicable in Antigua and Barbuda', () => {
  assert.equal(validateTaxId('AG', '123456789').error, 'not_applicable');
});

test('reports that a generalized personal TIN is not applicable in Saint Kitts and Nevis', () => {
  assert.equal(validateTaxId('KN', '123456789').error, 'not_applicable');
});

test('reports that a generalized personal TIN is not applicable in North Korea', () => {
  assert.equal(validateTaxId('KP', '123456789').error, 'not_applicable');
});

test('integrates with Angular reactive forms', () => {
  const control = new FormControl('RSSMRA85T10A562A', taxIdValidator('IT'));

  assert.equal(control.errors.taxId.error, 'invalid_checksum');

  control.setValue('RSSMRA85T10A562S');
  assert.equal(control.valid, true);
});

test('leaves empty values to Validators.required', () => {
  const control = new FormControl('', [Validators.required, taxIdValidator('IT')]);

  assert.deepEqual(control.errors, { required: true });
});

test('uses policy mode by default and supports strict Angular validation', () => {
  const advisory = new FormControl('12', taxIdValidator('SO'));
  const strict = new FormControl('12', taxIdValidator('SO', { mode: 'strict' }));

  assert.equal(advisory.valid, true);
  assert.equal(strict.errors?.taxId.error, 'invalid_length');
});
