import { TaxIdCountry, TaxIdValidationLevel, TaxIdValidationResult } from './models';
import { taxIdNotApplicable } from './countries/not-applicable';
import { validateAfghanNationalId } from './countries/afghanistan';
import { validateAlbanianTaxId } from './countries/albania';
import { validateAlgerianTaxId } from './countries/algeria';
import { validateAndorranTaxId } from './countries/andorra';
import { validateAngolanTaxId } from './countries/angola';
import { validateArgentineTaxId } from './countries/argentina';
import { validateArmenianTaxId } from './countries/armenia';
import { validateAustralianTaxId } from './countries/australia';
import { validateAustrianTaxId } from './countries/austria';
import { validateAzerbaijaniTaxId } from './countries/azerbaijan';
import { validateBangladeshiTaxId } from './countries/bangladesh';
import { validateBarbadianTaxId } from './countries/barbados';
import { validateBelarusianTaxId } from './countries/belarus';
import { validateBelgianTaxId } from './countries/belgium';
import { validateBelizeanTaxId } from './countries/belize';
import { validateBeninTaxId } from './countries/benin';
import { validateBhutaneseTaxId } from './countries/bhutan';
import { validateBolivianTaxId } from './countries/bolivia';
import { validateBosnianTaxId } from './countries/bosnia-herzegovina';
import { validateBotswananTaxId } from './countries/botswana';
import { validateBrazilianTaxId } from './countries/brazil';
import { validateBulgarianTaxId } from './countries/bulgaria';
import { validateBurkinabeTaxId } from './countries/burkina-faso';
import { validateBurundianTaxId } from './countries/burundi';
import { validateCambodianTaxId } from './countries/cambodia';
import { validateCameroonianTaxId } from './countries/cameroon';
import { validateCanadianTaxId } from './countries/canada';
import { validateCapeVerdeanTaxId } from './countries/cape-verde';
import { validateCentralAfricanTaxId } from './countries/central-african-republic';
import { validateChadianTaxId } from './countries/chad';
import { validateChileanTaxId } from './countries/chile';
import { validateChineseTaxId } from './countries/china';
import { validateColombianTaxId } from './countries/colombia';
import { validateComorianTaxId } from './countries/comoros';
import { validateCostaRicanTaxId } from './countries/costa-rica';
import { validateIvorianTaxId } from './countries/cote-d-ivoire';
import { validateCroatianTaxId } from './countries/croatia';
import { validateCubanTaxId } from './countries/cuba';
import { validateCypriotTaxId } from './countries/cyprus';
import { validateCzechTaxId } from './countries/czechia';
import { validateCongoleseDrcTaxId } from './countries/democratic-republic-of-congo';
import { validateDanishTaxId } from './countries/denmark';
import { validateDjiboutianTaxId } from './countries/djibouti';
import { validateDominicaTaxId } from './countries/dominica';
import { validateDominicanTaxId } from './countries/dominican-republic';
import { validateEcuadorianTaxId } from './countries/ecuador';
import { validateEgyptianTaxId } from './countries/egypt';
import { validateSalvadoranTaxId } from './countries/el-salvador';
import { validateEquatorialGuineanTaxId } from './countries/equatorial-guinea';
import { validateEritreanTaxId } from './countries/eritrea';
import { validateEstonianTaxId } from './countries/estonia';
import { validateEswatiniTaxId } from './countries/eswatini';
import { validateEthiopianTaxId } from './countries/ethiopia';
import { validateFijianTaxId } from './countries/fiji';
import { validateFinnishTaxId } from './countries/finland';
import { validateFrenchTaxId } from './countries/france';
import { validateGaboneseTaxId } from './countries/gabon';
import { validateGambianTaxId } from './countries/gambia';
import { validateGeorgianTaxId } from './countries/georgia';
import { validateGermanTaxId } from './countries/germany';
import { validateGhanaianTaxId } from './countries/ghana';
import { validateGreekTaxId } from './countries/greece';
import { validateGrenadianTaxId } from './countries/grenada';
import { validateGuatemalanTaxId } from './countries/guatemala';
import { validateGuineaBissauanTaxId } from './countries/guinea-bissau';
import { validateGuineanTaxId } from './countries/guinea';
import { validateGuyaneseTaxId } from './countries/guyana';
import { validateHaitianTaxId } from './countries/haiti';
import { validateHonduranTaxId } from './countries/honduras';
import { validateHungarianTaxId } from './countries/hungary';
import { validateIcelandicTaxId } from './countries/iceland';
import { validateIndianTaxId } from './countries/india';
import { validateIndonesianTaxId } from './countries/indonesia';
import { validateIranianTaxId } from './countries/iran';
import { validateIraqiTaxId } from './countries/iraq';
import { validateIrishTaxId } from './countries/ireland';
import { validateIsraeliTaxId } from './countries/israel';
import { validateItalianFiscalCode } from './countries/italy';
import { validateJamaicanTaxId } from './countries/jamaica';
import { validateJapaneseTaxId } from './countries/japan';
import { validateJordanianTaxId } from './countries/jordan';
import { validateKazakhTaxId } from './countries/kazakhstan';
import { validateKenyanTaxId } from './countries/kenya';
import { validateKiribatiTaxId } from './countries/kiribati';
import { validateKyrgyzTaxId } from './countries/kyrgyzstan';
import { validateLaoTaxId } from './countries/laos';
import { validateLatvianTaxId } from './countries/latvia';
import { validateLebaneseTaxId } from './countries/lebanon';
import { validateLesothoTaxId } from './countries/lesotho';
import { validateLiberianTaxId } from './countries/liberia';
import { validateLibyanTaxId } from './countries/libya';
import { validateLiechtensteinTaxId } from './countries/liechtenstein';
import { validateLithuanianTaxId } from './countries/lithuania';
import { validateLuxembourgTaxId } from './countries/luxembourg';
import { validateMalagasyTaxId } from './countries/madagascar';
import { validateMalawianTaxId } from './countries/malawi';
import { validateMalaysianTaxId } from './countries/malaysia';
import { validateMaldivianTaxId } from './countries/maldives';
import { validateMalianTaxId } from './countries/mali';
import { validateMalteseTaxId } from './countries/malta';
import { validateMarshalleseTaxId } from './countries/marshall-islands';
import { validateMauritanianTaxId } from './countries/mauritania';
import { validateMauritianTaxId } from './countries/mauritius';
import { validateMexicanTaxId } from './countries/mexico';
import { validateMicronesianTaxId } from './countries/micronesia';
import { validateMoldovanTaxId } from './countries/moldova';
import { validateMonegasqueTaxId } from './countries/monaco';
import { validateMongolianTaxId } from './countries/mongolia';
import { validateMontenegrinTaxId } from './countries/montenegro';
import { validateMoroccanTaxId } from './countries/morocco';
import { validateMozambicanTaxId } from './countries/mozambique';
import { validateMyanmarTaxId } from './countries/myanmar';
import { validateNamibianTaxId } from './countries/namibia';
import { validateNepaleseTaxId } from './countries/nepal';
import { validateDutchTaxId } from './countries/netherlands';
import { validateNewZealandTaxId } from './countries/new-zealand';
import { validateNicaraguanTaxId } from './countries/nicaragua';
import { validateNigerienTaxId } from './countries/niger';
import { validateNigerianTaxId } from './countries/nigeria';
import { validateNorthMacedonianTaxId } from './countries/north-macedonia';
import { validateNorwegianTaxId } from './countries/norway';
import { validatePakistaniTaxId } from './countries/pakistan';
import { validatePalauanTaxId } from './countries/palau';
import { validatePalestinianTaxId } from './countries/palestine';
import { validatePanamanianTaxId } from './countries/panama';
import { validatePapuaNewGuineanTaxId } from './countries/papua-new-guinea';
import { validateParaguayanTaxId } from './countries/paraguay';
import { validatePeruvianTaxId } from './countries/peru';
import { validatePhilippineTaxId } from './countries/philippines';
import { validatePolishTaxId } from './countries/poland';
import { validatePortugueseTaxId } from './countries/portugal';
import { validateRepublicOfCongoTaxId } from './countries/republic-of-congo';
import { validateRomanianTaxId } from './countries/romania';
import { validateRussianTaxId } from './countries/russia';
import { validateRwandanTaxId } from './countries/rwanda';
import { validateSaintLucianTaxId } from './countries/saint-lucia';
import { validateSaintVincentianTaxId } from './countries/saint-vincent-and-the-grenadines';
import { validateSamoanTaxId } from './countries/samoa';
import { validateSammarineseTaxId } from './countries/san-marino';
import { validateSaoTomeanTaxId } from './countries/sao-tome-and-principe';
import { validateSenegaleseTaxId } from './countries/senegal';
import { validateSerbianTaxId } from './countries/serbia';
import { validateSeychelloisTaxId } from './countries/seychelles';
import { validateSierraLeoneanTaxId } from './countries/sierra-leone';
import { validateSingaporeanTaxId } from './countries/singapore';
import { validateSlovakTaxId } from './countries/slovakia';
import { validateSlovenianTaxId } from './countries/slovenia';
import { validateSolomonIslandsTaxId } from './countries/solomon-islands';
import { validateSomaliTaxId } from './countries/somalia';
import { validateSouthAfricanTaxId } from './countries/south-africa';
import { validateSouthKoreanTaxId } from './countries/south-korea';
import { validateSouthSudaneseTaxId } from './countries/south-sudan';
import { validateSpanishTaxId } from './countries/spain';
import { validateSriLankanTaxId } from './countries/sri-lanka';
import { validateSudaneseTaxId } from './countries/sudan';
import { validateSurinameseTaxId } from './countries/suriname';
import { validateSwedishTaxId } from './countries/sweden';
import { validateSwissTaxId } from './countries/switzerland';
import { validateSyrianTaxId } from './countries/syria';
import { validateTajikTaxId } from './countries/tajikistan';
import { validateTanzanianTaxId } from './countries/tanzania';
import { validateThaiTaxId } from './countries/thailand';
import { validateTimoreseTaxId } from './countries/timor-leste';
import { validateTogoleSeTaxId } from './countries/togo';
import { validateTonganTaxId } from './countries/tonga';
import { validateTrinidadianTaxId } from './countries/trinidad-tobago';
import { validateTunisianTaxId } from './countries/tunisia';
import { validateTurkishTaxId } from './countries/turkey';
import { validateTurkmenTaxId } from './countries/turkmenistan';
import { validateUgandanTaxId } from './countries/uganda';
import { validateUkrainianTaxId } from './countries/ukraine';
import { validateUnitedKingdomTaxId } from './countries/united-kingdom';
import { validateUnitedStatesTaxId } from './countries/united-states';
import { validateUruguayanTaxId } from './countries/uruguay';
import { validateUzbekTaxId } from './countries/uzbekistan';
import { validateVenezuelanTaxId } from './countries/venezuela';
import { validateVietnameseTaxId } from './countries/vietnam';
import { validateYemeniTaxId } from './countries/yemen';
import { validateZambianTaxId } from './countries/zambia';
import { validateZimbabweanTaxId } from './countries/zimbabwe';

export type TaxIdValidationEntry = {
  readonly validate: (value: unknown) => TaxIdValidationResult;
  readonly validationLevel?: TaxIdValidationLevel;
  readonly policyValidationLevel?: (normalizedValue: string) => TaxIdValidationLevel;
};

const notApplicable = (country: TaxIdCountry) => (value: unknown): TaxIdValidationResult =>
  taxIdNotApplicable(country, value);

export const TAX_ID_VALIDATION_REGISTRY: Readonly<Record<TaxIdCountry, TaxIdValidationEntry>> = {
  AD: { validate: validateAndorranTaxId },
  AE: { validate: notApplicable('AE') },
  AF: { validate: validateAfghanNationalId },
  AG: { validate: notApplicable('AG') },
  AL: { validate: validateAlbanianTaxId },
  AM: { validate: validateArmenianTaxId },
  AO: { validate: validateAngolanTaxId },
  AR: { validate: validateArgentineTaxId, validationLevel: 'checksum' },
  AT: { validate: validateAustrianTaxId },
  AU: { validate: validateAustralianTaxId, validationLevel: 'checksum' },
  AZ: { validate: validateAzerbaijaniTaxId },
  BA: { validate: validateBosnianTaxId, validationLevel: 'checksum' },
  BD: { validate: validateBangladeshiTaxId },
  BB: { validate: validateBarbadianTaxId },
  BE: { validate: validateBelgianTaxId, validationLevel: 'checksum' },
  BF: { validate: validateBurkinabeTaxId },
  BG: { validate: validateBulgarianTaxId, validationLevel: 'checksum' },
  BH: { validate: notApplicable('BH') },
  BI: { validate: validateBurundianTaxId },
  BJ: { validate: validateBeninTaxId },
  BN: { validate: notApplicable('BN') },
  BO: { validate: validateBolivianTaxId },
  BR: { validate: validateBrazilianTaxId, validationLevel: 'checksum' },
  BS: { validate: notApplicable('BS') },
  BT: { validate: validateBhutaneseTaxId },
  BW: { validate: validateBotswananTaxId },
  BY: { validate: validateBelarusianTaxId },
  BZ: { validate: validateBelizeanTaxId },
  CA: { validate: validateCanadianTaxId, validationLevel: 'checksum' },
  CD: { validate: validateCongoleseDrcTaxId },
  CF: { validate: validateCentralAfricanTaxId },
  CG: { validate: validateRepublicOfCongoTaxId },
  CH: { validate: validateSwissTaxId, validationLevel: 'checksum' },
  CI: { validate: validateIvorianTaxId },
  CL: { validate: validateChileanTaxId, validationLevel: 'checksum' },
  CM: { validate: validateCameroonianTaxId },
  CN: { validate: validateChineseTaxId, validationLevel: 'checksum' },
  CO: { validate: validateColombianTaxId, validationLevel: 'checksum' },
  CR: { validate: validateCostaRicanTaxId },
  CU: { validate: validateCubanTaxId },
  CV: { validate: validateCapeVerdeanTaxId, validationLevel: 'checksum' },
  CZ: {
    validate: validateCzechTaxId,
    validationLevel: 'checksum',
    policyValidationLevel: (value) => value.length === 9 ? 'format' : 'checksum',
  },
  CY: { validate: validateCypriotTaxId },
  DK: { validate: validateDanishTaxId },
  DE: { validate: validateGermanTaxId, validationLevel: 'checksum' },
  DJ: { validate: validateDjiboutianTaxId },
  DM: { validate: validateDominicaTaxId },
  DO: { validate: validateDominicanTaxId, validationLevel: 'checksum' },
  DZ: { validate: validateAlgerianTaxId },
  EC: { validate: validateEcuadorianTaxId, validationLevel: 'checksum' },
  EE: { validate: validateEstonianTaxId, validationLevel: 'checksum' },
  EG: { validate: validateEgyptianTaxId },
  ER: { validate: validateEritreanTaxId },
  ES: { validate: validateSpanishTaxId, validationLevel: 'checksum' },
  ET: { validate: validateEthiopianTaxId },
  FI: { validate: validateFinnishTaxId, validationLevel: 'checksum' },
  FJ: { validate: validateFijianTaxId },
  FM: { validate: validateMicronesianTaxId },
  FR: { validate: validateFrenchTaxId, validationLevel: 'checksum' },
  GA: { validate: validateGaboneseTaxId },
  GB: { validate: validateUnitedKingdomTaxId },
  GD: { validate: validateGrenadianTaxId },
  GE: { validate: validateGeorgianTaxId },
  GH: { validate: validateGhanaianTaxId },
  GM: { validate: validateGambianTaxId },
  GN: { validate: validateGuineanTaxId, validationLevel: 'checksum' },
  GQ: { validate: validateEquatorialGuineanTaxId },
  GR: { validate: validateGreekTaxId, validationLevel: 'checksum' },
  GT: { validate: validateGuatemalanTaxId, validationLevel: 'checksum' },
  GW: { validate: validateGuineaBissauanTaxId },
  GY: { validate: validateGuyaneseTaxId },
  HN: { validate: validateHonduranTaxId },
  HR: { validate: validateCroatianTaxId, validationLevel: 'checksum' },
  HT: { validate: validateHaitianTaxId },
  HU: { validate: validateHungarianTaxId, validationLevel: 'checksum' },
  ID: {
    validate: validateIndonesianTaxId,
    validationLevel: 'checksum',
    policyValidationLevel: (value) => value.length === 16 ? 'format' : 'checksum',
  },
  IS: { validate: validateIcelandicTaxId, validationLevel: 'checksum' },
  IE: { validate: validateIrishTaxId, validationLevel: 'checksum' },
  IL: { validate: validateIsraeliTaxId, validationLevel: 'checksum' },
  IN: { validate: validateIndianTaxId },
  IQ: { validate: validateIraqiTaxId },
  IR: { validate: validateIranianTaxId, validationLevel: 'checksum' },
  IT: { validate: validateItalianFiscalCode, validationLevel: 'checksum' },
  JP: { validate: validateJapaneseTaxId, validationLevel: 'checksum' },
  JO: { validate: validateJordanianTaxId },
  KH: { validate: validateCambodianTaxId },
  KI: { validate: validateKiribatiTaxId },
  KM: { validate: validateComorianTaxId },
  KN: { validate: notApplicable('KN') },
  JM: { validate: validateJamaicanTaxId },
  KE: { validate: validateKenyanTaxId },
  KG: { validate: validateKyrgyzTaxId },
  KP: { validate: notApplicable('KP') },
  KR: { validate: validateSouthKoreanTaxId },
  KW: { validate: notApplicable('KW') },
  KZ: { validate: validateKazakhTaxId, validationLevel: 'checksum' },
  LA: { validate: validateLaoTaxId },
  LB: { validate: validateLebaneseTaxId },
  LC: { validate: validateSaintLucianTaxId },
  LI: { validate: validateLiechtensteinTaxId },
  LK: { validate: validateSriLankanTaxId },
  LR: { validate: validateLiberianTaxId },
  LS: { validate: validateLesothoTaxId },
  LT: { validate: validateLithuanianTaxId, validationLevel: 'checksum' },
  LU: { validate: validateLuxembourgTaxId, validationLevel: 'checksum' },
  LV: { validate: validateLatvianTaxId, validationLevel: 'checksum' },
  LY: { validate: validateLibyanTaxId },
  MA: { validate: validateMoroccanTaxId },
  MC: { validate: validateMonegasqueTaxId },
  MD: { validate: validateMoldovanTaxId },
  ME: { validate: validateMontenegrinTaxId, validationLevel: 'checksum' },
  MG: { validate: validateMalagasyTaxId },
  MH: { validate: validateMarshalleseTaxId },
  MK: { validate: validateNorthMacedonianTaxId, validationLevel: 'checksum' },
  ML: { validate: validateMalianTaxId },
  MM: { validate: validateMyanmarTaxId },
  MN: { validate: validateMongolianTaxId },
  MR: { validate: validateMauritanianTaxId },
  MT: { validate: validateMalteseTaxId },
  MU: { validate: validateMauritianTaxId },
  MV: { validate: validateMaldivianTaxId },
  MW: { validate: validateMalawianTaxId },
  MX: { validate: validateMexicanTaxId, validationLevel: 'checksum' },
  MY: { validate: validateMalaysianTaxId },
  MZ: { validate: validateMozambicanTaxId },
  NA: { validate: validateNamibianTaxId },
  NE: { validate: validateNigerienTaxId },
  NL: { validate: validateDutchTaxId, validationLevel: 'checksum' },
  NG: { validate: validateNigerianTaxId },
  NI: { validate: validateNicaraguanTaxId },
  NP: { validate: validateNepaleseTaxId },
  NO: { validate: validateNorwegianTaxId, validationLevel: 'checksum' },
  NR: { validate: notApplicable('NR') },
  NZ: { validate: validateNewZealandTaxId, validationLevel: 'checksum' },
  OM: { validate: notApplicable('OM') },
  PA: { validate: validatePanamanianTaxId },
  PE: {
    validate: validatePeruvianTaxId,
    validationLevel: 'checksum',
    policyValidationLevel: (value) => value.length === 8 ? 'format' : 'checksum',
  },
  PG: { validate: validatePapuaNewGuineanTaxId },
  PH: { validate: validatePhilippineTaxId },
  PK: { validate: validatePakistaniTaxId },
  PL: { validate: validatePolishTaxId, validationLevel: 'checksum' },
  PT: { validate: validatePortugueseTaxId, validationLevel: 'checksum' },
  PS: { validate: validatePalestinianTaxId, validationLevel: 'checksum' },
  PY: { validate: validateParaguayanTaxId, validationLevel: 'checksum' },
  PW: { validate: validatePalauanTaxId },
  QA: { validate: notApplicable('QA') },
  RO: { validate: validateRomanianTaxId, validationLevel: 'checksum' },
  RS: { validate: validateSerbianTaxId, validationLevel: 'checksum' },
  RU: { validate: validateRussianTaxId, validationLevel: 'checksum' },
  RW: { validate: validateRwandanTaxId },
  SA: { validate: notApplicable('SA') },
  SB: { validate: validateSolomonIslandsTaxId },
  SC: { validate: validateSeychelloisTaxId },
  SD: { validate: validateSudaneseTaxId },
  SE: { validate: validateSwedishTaxId, validationLevel: 'checksum' },
  SG: {
    validate: validateSingaporeanTaxId,
    validationLevel: 'checksum',
    policyValidationLevel: (value) => value.startsWith('M') ? 'format' : 'checksum',
  },
  SI: { validate: validateSlovenianTaxId, validationLevel: 'checksum' },
  SK: {
    validate: validateSlovakTaxId,
    validationLevel: 'checksum',
    policyValidationLevel: (value) => value.length === 9 ? 'format' : 'checksum',
  },
  SL: { validate: validateSierraLeoneanTaxId },
  SM: { validate: validateSammarineseTaxId },
  SN: { validate: validateSenegaleseTaxId, validationLevel: 'checksum' },
  SO: { validate: validateSomaliTaxId },
  SR: { validate: validateSurinameseTaxId },
  SS: { validate: validateSouthSudaneseTaxId },
  ST: { validate: validateSaoTomeanTaxId },
  SV: { validate: validateSalvadoranTaxId },
  SY: { validate: validateSyrianTaxId },
  SZ: { validate: validateEswatiniTaxId },
  TD: { validate: validateChadianTaxId },
  TG: { validate: validateTogoleSeTaxId },
  TH: { validate: validateThaiTaxId, validationLevel: 'checksum' },
  TJ: { validate: validateTajikTaxId },
  TL: { validate: validateTimoreseTaxId },
  TM: { validate: validateTurkmenTaxId },
  TN: { validate: validateTunisianTaxId },
  TO: { validate: validateTonganTaxId },
  TR: { validate: validateTurkishTaxId, validationLevel: 'checksum' },
  TT: { validate: validateTrinidadianTaxId },
  TV: { validate: notApplicable('TV') },
  TZ: { validate: validateTanzanianTaxId },
  UA: { validate: validateUkrainianTaxId },
  UG: { validate: validateUgandanTaxId },
  US: { validate: validateUnitedStatesTaxId },
  UY: { validate: validateUruguayanTaxId, validationLevel: 'checksum' },
  UZ: { validate: validateUzbekTaxId },
  VA: { validate: notApplicable('VA') },
  VC: { validate: validateSaintVincentianTaxId },
  VE: { validate: validateVenezuelanTaxId, validationLevel: 'checksum' },
  VN: { validate: validateVietnameseTaxId },
  VU: { validate: notApplicable('VU') },
  WS: { validate: validateSamoanTaxId },
  YE: { validate: validateYemeniTaxId },
  ZA: { validate: validateSouthAfricanTaxId, validationLevel: 'checksum' },
  ZM: { validate: validateZambianTaxId },
  ZW: { validate: validateZimbabweanTaxId },
};
