# tax-id

Angular and TypeScript utilities for validating tax identifiers by country.

This package is designed for international sign-up and onboarding flows where user-provided national identifiers must be validated with a combination of normalization, format rules and, when available, checksum algorithms. The same validation semantics are replicated in the .NET package so frontend and backend behavior stay aligned.

The current MVP supports:

- Italian personal fiscal codes, including omocodia characters;
- Spanish DNI and NIE identifiers;
- French SPI tax identifiers;
- Portuguese NIF identifiers;
- Greek AFM identifiers;
- Belgian national register numbers;
- Croatian OIB identifiers;
- Polish PESEL identifiers;
- Finnish personal identity codes;
- Danish CPR numbers (format and date validation);
- Norwegian national identity numbers;
- Swedish personnummer and coordination numbers;
- Icelandic kennitala identifiers;
- Estonian isikukood identifiers;
- Latvian historical and modern personal codes.
- Lithuanian personal codes;
- Dutch BSN identifiers;
- Czech and Slovak birth numbers;
- Slovenian tax numbers;
- Austrian personal TIN structure;
- German tax identification numbers;
- Swiss AHV/AVS numbers;
- Hungarian tax identification signs;
- Romanian CNP identifiers;
- Bulgarian EGN identifiers;
- Serbian and Montenegrin JMBG identifiers;
- North Macedonian EMBG identifiers;
- Albanian personal numbers (format and date validation);
- Bosnian JMBG identifiers;
- Turkish T.C. identity numbers;
- Moldovan IDNP identifiers (format validation);
- Ukrainian RNOKPP identifiers (format validation);
- Cypriot TIN identifiers (format validation);
- Irish PPS numbers;
- Luxembourg national identification numbers;
- Maltese personal TIN identifiers (format validation);
- Liechtenstein PEID identifiers (format validation);
- Andorran NRT identifiers (format validation);
- UK NINO and UTR identifiers (format validation);
- Russian INN identifiers;
- Belarusian UNP identifiers (format validation);
- San Marino ISS/COE codes (format validation);
- Monegasque TIN identifiers (format validation);
- US Social Security Numbers (format validation);
- Canadian SIN numbers;
- Mexican personal RFC identifiers;
- Brazilian CPF identifiers;
- Argentine CUIT/CUIL identifiers;
- Chilean RUT/RUN identifiers;
- Colombian NIT identifiers;
- Peruvian DNI and RUC identifiers;
- Uruguayan CI identifiers;
- Venezuelan RIF identifiers;
- Australian tax file numbers;
- Chinese resident identity numbers;
- Indian PAN identifiers (format validation);
- Israeli identity numbers;
- Japanese My Number identifiers;
- South Korean resident registration numbers (format and date validation);
- New Zealand IRD numbers;
- Singaporean NRIC/FIN identifiers;
- Thai national identification numbers;
- Georgian personal numbers (format validation);
- Indonesian NPWP and NIK identifiers;
- Kazakh IIN identifiers;
- Kyrgyz personal INN identifiers (format and date validation);
- Malaysian NRIC numbers (format and date validation);
- Philippine TIN identifiers (format validation);
- Pakistani CNIC and NTN identifiers (format validation);
- Vietnamese tax codes and personal identification numbers (format validation);
- South African tax reference numbers and identity numbers;
- Iranian national identity codes;
- Ecuadorian cedula and personal RUC identifiers;
- Dominican cedula identifiers;
- Paraguayan RUC identifiers;
- Guatemalan NIT identifiers;
- Sri Lankan NIC identifiers (format and date validation);
- Uzbek PINFL identifiers (format and date validation);
- Cuban identity card numbers (format and date validation);
- Egyptian TIN identifiers (format validation);
- GhanaCard PIN and legacy GRA TIN identifiers (format validation);
- Kenyan KRA PIN identifiers (format validation);
- Mauritian TAN identifiers (format validation);
- Nigerian JTB/FIRS TIN identifiers (format validation);
- Rwandan TIN identifiers (format validation);
- Tanzanian TIN identifiers (format validation);
- Ugandan TIN identifiers (format validation);
- Zambian TPIN identifiers (format validation).
- Costa Rican personal identifiers (format validation);
- Bangladeshi eTIN identifiers (format validation);
- Nepalese PAN identifiers (format validation);
- Fijian TIN identifiers (format validation);
- Papua New Guinean TIN identifiers (format validation).
- Jamaican TRN identifiers (format validation);
- Trinidad and Tobago BIR identifiers (format validation);
- Guyanese TIN identifiers (format validation);
- Honduran RTN identifiers (format validation);
- Armenian PSN identifiers (format validation).
- Ethiopian TIN identifiers (format validation);
- Namibian TIN identifiers (format validation);
- Belizean TIN identifiers (format validation);
- Azerbaijani TIN identifiers (format validation);
- Cambodian TIN identifiers (format validation).
- Barbadian TIN/NRN identifiers (format validation);
- Salvadoran NIT identifiers (format and date validation);
- Nicaraguan RUC identifiers (format and date validation);
- Jordanian TIN identifiers (format validation);
- Bolivian NIT identifiers (format validation).
- Iraqi TIN identifiers (format validation);
- Maldivian personal TIN identifiers (format validation);
- Samoan TIN identifiers (format validation).
- Afghan e-Tazkira national identifiers (format validation).
- Haitian NIF identifiers (format validation).
- Tajik INN identifiers (format validation).
- Dominican taxpayer numbers (format validation).
- Grenadian TIN identifiers (format validation).
- Marshallese employee identification numbers (format validation).
- Palauan ROP Social Security numbers (format validation).
- Panamanian personal RUC/cédula identifiers (segmented format validation).
- Surinamese FIN identifiers (numeric format validation, maximum 10 digits).
- FSM Social Security numbers (format validation).
- Beninese, Burkinabe, Burundian, Cameroonian, Central African, Congolese,
  DR Congolese, Ivorian, Gabonese and Guinea-Bissauan identifiers
  (format validation).
- Lao, Lebanese, Liberian, Lesotho, Libyan, Malagasy, Malawian, Malian, Mauritanian,
  Myanmar and Syrian identifiers (format validation).
- Saint Lucian, Seychellois, Sierra Leonean, Sudanese, South Sudanese, Sao Tomean,
  Saint Vincentian, Eswatini, Togolese, Timorese, Solomon Islands and
  Zimbabwean identifiers (format validation).
- an explicit `not_applicable` result for Tuvalu.
- explicit `not_applicable` results for the UAE, Bahrain, Kuwait, Qatar and
  Saudi Arabia, where no general personal TIN is issued.
- explicit `not_applicable` results for Brunei, the Bahamas, Nauru, Vanuatu
  and Vatican City.
- Moroccan fiscal identifiers, Tunisian matricules fiscaux and Botswana
  Omang identifiers (format validation);
- Mongolian civil registration numbers (format and date validation);
- an explicit `not_applicable` result for Oman before its personal income-tax
  reform takes effect in 2028.
- Angolan NIF, Mozambican NUIT and Bhutanese CID identifiers (format
  validation);
- Cape Verdean NIF and Palestinian identity numbers (checksum validation).
- Algerian NIF identifiers with 15 or 20 digits (format validation);
- Guinean NIFp and Senegalese NINEA identifiers (checksum validation).
- explicit `not_applicable` results for Antigua and Barbuda and Saint Kitts
  and Nevis.
- an explicit `not_applicable` result for North Korea.

All supported identifiers include normalization and format validation. Checksums
are verified where they are universally applicable. Danish CPR validation is
limited to structure and date because the historical modulus-11 rule is not
mandatory for all modern CPR numbers.

## Design principles

- Keep the core API simple and deterministic: normalize, validate, report a structured result.
- Distinguish between format-only and checksum validation so callers can make informed decisions.
- Do not throw on unsupported or missing country codes; return a structured failure instead.
- Preserve the same validation contract between JS/TS and .NET for consistent UX and backend enforcement.

## Future expansion

- Extend coverage to `vat_number`, `tax_id_company`, `company_registration`, and `national_id` when the corresponding rules are available.
- Add shared JSON rule definitions so JS and .NET use the same source of truth.
- Provide metadata helpers for birth date, gender, and region extraction where identifiers encode them.
- Add policy helpers that answer whether a country has checksum validation available.
- Consider a centralised validation API or SaaS layer for multi-tenant applications.
Albanian personal-number validation is limited to the published structure and
encoded birth date; the control letter is not claimed as a checksum until a
reliable institutional algorithm is available.
Moldovan, Ukrainian and Cypriot validation is likewise limited to the published
identifier structure. Their control characters are not claimed as checksums.
Maltese, Liechtenstein and Andorran validation is limited to the published
identifier structure.
Indian PAN validation is limited to the published structure because the check
letter algorithm is not public. South Korean RRN validation is limited to
structure and birth date because the individual portion of numbers issued from
October 2020 is randomized and no longer carries a mandatory check digit.
Australian validation covers the current nine-digit tax file numbers only.
Singaporean M-series FINs are validated as structure-only because their check
letter table is not institutionally published; S, T, F and G series include the
checksum.
Georgian, Philippine, Pakistani and Vietnamese validation is limited to the
published identifier structure because no public check algorithm is available.
Indonesian 15-digit NPWP numbers are checked with the widely implemented Luhn
rule on the first nine digits; 16-digit NIK numbers are validated as structure
and encoded birth date only. Malaysian validation covers the NRIC number used
as the functional TIN; income tax numbers with SG/OG prefixes are not yet
covered. Kyrgyz INN validation is limited to structure and encoded birth date.
South African validation follows the modulus-10 rule published in the OECD
AEOI sheet for both the 10-digit tax reference number and the 13-digit
identity number. Paraguayan RUC validation follows the DNIT modulus-11 rule.
Sri Lankan, Uzbek and Cuban validation is limited to structure and encoded
birth date because no public check algorithm is documented.
Egyptian, Ghanaian, Kenyan, Mauritian, Nigerian, Rwandan, Tanzanian, Ugandan
and Zambian validation is limited to the published identifier structure.
Costa Rican, Bangladeshi, Nepalese, Fijian and Papua New Guinean validation is
limited to the published identifier structure.
Jamaican, Trinidadian, Guyanese, Honduran and Armenian validation is limited to
the published identifier structure.
Ethiopian, Namibian, Belizean, Azerbaijani and Cambodian validation is limited
to the published identifier structure.
Barbadian, Jordanian and Bolivian validation is limited to the published
identifier structure. Salvadoran and Nicaraguan validation also checks the
encoded birth date, but does not claim an undocumented checksum.
Iraqi and Maldivian validation is limited to the published identifier structure.
Samoa's TIN is a sequential numeric identifier with no fixed structure beyond a
5–9 digit range; no check digit algorithm is documented.
Afghan validation covers the 13-digit e-Tazkira national identifier as a
functional personal identifier; no public checksum algorithm is claimed.
Haitian validation covers the 10-digit NIF structure; no public checksum
algorithm is claimed.
Tajik validation covers the 9-digit INN structure; no public checksum
algorithm is claimed.
Dominican validation covers the 1-6 digit taxpayer number published in the
OECD AEOI sheet; the separate proprietary check digit is not claimed.
Grenadian validation covers the six-digit TIN structure published in the OECD
AEOI sheet. Marshallese validation covers the personal employee identification
number in the documented `04-XXXXXX` form.
Palauan validation covers the nine-digit ROP Social Security Number documented
by the Bureau of Revenue and Taxation as a three-digit citizen code followed by
six individual digits; no checksum is claimed.
Panamanian validation covers the personal RUC, which the DGI defines as the
identity-card number for natural persons. It validates the documented province,
optional letter series, folio/image and asiento/ficha segments; the separately
assigned DGI verification digit is not calculated.
Micronesian validation covers the eight-digit FSM Social Security Number shown
in the official application form as two digits followed by six digits; no
checksum is claimed.
Lebanese validation accepts the numeric serial published in the OECD AEOI
sheet and the documented VAT suffixes `-601`, `-603` and `-604`. The source
does not publish a fixed length or checksum, so neither is claimed.
Sudanese validation covers the National ID format accepted by the public
Taxation Chamber registration portal: ASCII letters and digits only. The
authority does not publish a fixed length or checksum, so neither is claimed.
The extended format-only block mirrors the structures supported by the .NET
package. Seychelles additionally requires the third digit `2` for an
individual; its unpublished checksum algorithm is not claimed.
Saint Vincent and the Grenadines is limited to the numeric structure published
in its OECD AEOI sheet because neither a length nor a checksum is documented.
The `not_applicable` error distinguishes jurisdictions without a generalized
personal TIN from countries whose validation has not yet been implemented.
For Nauru and Vanuatu this classification concerns personal identifiers tied
to citizenship; tax registrations may still exist for specific taxable
activities or entities.
Moroccan, Tunisian and Botswanan validation is limited to structure.
Mongolian validation also checks the encoded birth date but does not claim an
undocumented checksum.
Angolan, Mozambican and Bhutanese validation is limited to structure.
Algerian validation is limited to the published 15 and 20 digit structures.
The Caribbean `not_applicable` classification concerns a generalized personal
identifier; business or activity-specific tax registrations may still exist.
The North Korean classification records the absence of a generalized personal
tax identifier that can be validated by this library.

## TypeScript API

```ts
import { validateTaxId } from 'tax-id';

const result = validateTaxId('IT', 'RSSMRA85T10A562S');

if (!result.valid) {
  console.log(result.error);
}
```

Validation checks the public format and checksum rules. It does not confirm that
an identifier was issued by a government authority.

## Angular reactive forms

```ts
import { FormControl, Validators } from '@angular/forms';
import { taxIdValidator } from 'tax-id';

const fiscalCode = new FormControl('', [
  Validators.required,
  taxIdValidator('IT'),
]);
```

The country can be resolved dynamically:

```ts
const country = new FormControl('IT', { nonNullable: true });
const taxId = new FormControl('', taxIdValidator(() => country.value));

country.valueChanges.subscribe(() => taxId.updateValueAndValidity());
```

Invalid controls expose a structured `taxId` error:

```ts
{
  taxId: {
    valid: false,
    country: 'IT',
    normalizedValue: 'RSSMRA85T10A562A',
    error: 'invalid_checksum'
  }
}
```

Empty values are accepted by `taxIdValidator`; combine it with
`Validators.required` when the field is mandatory.

## Development

```bash
npm test
npm run build
```
