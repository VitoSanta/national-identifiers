# Country Coverage

This catalogue records coverage for the 195 commonly recognised states:
193 UN members, Palestine and Vatican City.

A checked entry requires:

- a recorded institutional or normative source;
- normalization and format validation;
- a checksum when its algorithm is public;
- valid and invalid automated tests;
- an interactive case in `manual-test`;
- documented validation limitations.

Local validation does not certify that an identifier was actually issued.
Countries without a generalized personal TIN are represented explicitly as
`not_applicable`; undocumented checksums are not inferred.

## Africa (54)

- [x] DZ - Algeria - NIF (struttura 15/20 cifre)
- [x] AO - Angola - NIF (struttura)
- [x] BJ - Benin - IFU (struttura 13 cifre)
- [x] BW - Botswana - Omang (struttura)
- [x] BF - Burkina Faso - IFU (struttura)
- [x] BI - Burundi - NIF (struttura 10 cifre)
- [x] CV - Capo Verde - NIF (checksum modulo 11)
- [x] CM - Camerun - NIU personale (struttura)
- [x] CF - Repubblica Centrafricana - NIF (struttura)
- [x] TD - Ciad - NIF/NIFU alfanumerico (struttura, 4-16 caratteri)
- [x] KM - Comore - NIF numerico (struttura, 8-10 cifre)
- [x] CG - Repubblica del Congo - NIU (struttura)
- [x] CD - Repubblica Democratica del Congo - NIF (struttura 9 caratteri)
- [x] CI - Costa d'Avorio - numero contribuente (struttura)
- [x] DJ - Gibuti - NIF alfanumerico (struttura, 4-16 caratteri)
- [x] EG - Egitto - TIN (struttura)
- [x] GQ - Guinea Equatoriale - NIF alfanumerico (struttura, 7-9 caratteri)
- [x] ER - Eritrea - TIN alfanumerico (struttura, 4-16 caratteri)
- [x] SZ - Eswatini - TIN (struttura 9 cifre)
- [x] ET - Etiopia - TIN (struttura)
- [x] GA - Gabon - NIF (struttura 13 cifre)
- [x] GM - Gambia - TIN numerico (struttura, 10 cifre)
- [x] GH - Ghana - GhanaCard PIN/GRA TIN (struttura)
- [x] GN - Guinea - NIFp (checksum Luhn)
- [x] GW - Guinea-Bissau - NIF (struttura 9 cifre)
- [x] KE - Kenya - KRA PIN (struttura)
- [x] LS - Lesotho - TIN (struttura 8 cifre)
- [x] LR - Liberia - TIN (struttura 9 cifre)
- [x] LY - Libia - numero nazionale (struttura 12 cifre)
- [x] MG - Madagascar - NIF (struttura 10 cifre)
- [x] MW - Malawi - TPIN (struttura)
- [x] ML - Mali - NIF (struttura)
- [x] MR - Mauritania - NIF (struttura 8 cifre)
- [x] MU - Mauritius - TAN (struttura)
- [x] MA - Marocco - identifiant fiscal (struttura)
- [x] MZ - Mozambico - NUIT (struttura)
- [x] NA - Namibia - TIN (struttura)
- [x] NE - Niger - NIF numerico (struttura, 4-16 cifre)
- [x] NG - Nigeria - TIN (struttura)
- [x] RW - Ruanda - TIN (struttura)
- [x] ST - Sao Tome e Principe - NIF (struttura 9 cifre)
- [x] SN - Senegal - NINEA e COFI (checksum)
- [x] SC - Seychelles - TIN personale (struttura 9 cifre)
- [x] SL - Sierra Leone - TIN (struttura 8 cifre)
- [x] SO - Somalia - TIN numerico (struttura, 4-12 cifre)
- [x] ZA - Sudafrica - tax reference number e ID (Luhn, fonte OECD/SARS)
- [x] SS - Sud Sudan - TIN (struttura 9 cifre)
- [x] SD - Sudan - National ID (struttura alfanumerica)
- [x] TZ - Tanzania - TIN (struttura)
- [x] TG - Togo - NIF personale (struttura 13 cifre)
- [x] TN - Tunisia - matricule fiscal (struttura)
- [x] UG - Uganda - TIN (struttura)
- [x] ZM - Zambia - TPIN (struttura)
- [x] ZW - Zimbabwe - TIN (struttura 10 cifre)

## Americhe (35)

- [x] AG - Antigua e Barbuda - nessun TIN personale generalizzato
- [x] AR - Argentina - CUIT/CUIL
- [x] BS - Bahamas - nessun TIN personale generalizzato
- [x] BB - Barbados - TIN/NRN (struttura)
- [x] BZ - Belize - TIN (struttura)
- [x] BO - Bolivia - NIT (struttura)
- [x] BR - Brasile - CPF
- [x] CA - Canada - SIN
- [x] CL - Cile - RUT/RUN
- [x] CO - Colombia - NIT
- [x] CR - Costa Rica - cédula personale (struttura)
- [x] CU - Cuba - carnet de identidad (struttura e data)
- [x] DM - Dominica - taxpayer number (struttura fino a 6 cifre)
- [x] DO - Repubblica Dominicana - cédula
- [x] EC - Ecuador - cédula e RUC personale
- [x] SV - El Salvador - NIT (struttura e data)
- [x] GD - Grenada - TIN (struttura 6 cifre)
- [x] GT - Guatemala - NIT (mod 11 con K)
- [x] GY - Guyana - TIN (struttura)
- [x] HT - Haiti - NIF (struttura 10 cifre)
- [x] HN - Honduras - RTN (struttura)
- [x] JM - Giamaica - TRN (struttura)
- [x] MX - Messico - RFC personale
- [x] NI - Nicaragua - RUC (struttura e data)
- [x] PA - Panama - RUC personale/cédula (struttura DGI)
- [x] PY - Paraguay - RUC (mod 11, fonte DNIT)
- [x] PE - Peru - RUC/DNI
- [x] KN - Saint Kitts e Nevis - nessun TIN personale generalizzato
- [x] LC - Saint Lucia - TIN (struttura fino a 6 cifre)
- [x] VC - Saint Vincent e Grenadine - TIN numerico (struttura)
- [x] SR - Suriname - FIN numerico fino a 10 cifre (struttura)
- [x] TT - Trinidad e Tobago - BIR Number (struttura)
- [x] US - Stati Uniti - SSN (struttura)
- [x] UY - Uruguay - CI
- [x] VE - Venezuela - RIF

## Asia (48)

- [x] AF - Afghanistan - identificatore nazionale e-Tazkira (struttura)
- [x] SA - Arabia Saudita - nessun TIN personale generalizzato
- [x] AM - Armenia - PSN (struttura)
- [x] AZ - Azerbaigian - VÖEN/TIN (struttura)
- [x] BH - Bahrein - nessun TIN personale generalizzato
- [x] BD - Bangladesh - eTIN (struttura)
- [x] BT - Bhutan - CID (struttura)
- [x] BN - Brunei - nessun TIN personale generalizzato
- [x] KH - Cambogia - TIN (struttura)
- [x] CN - Cina - numero di identità dei residenti
- [x] CY - Cipro - TIN personale (struttura)
- [x] KP - Corea del Nord - nessun TIN personale generalizzato
- [x] KR - Corea del Sud - RRN (struttura e data)
- [x] AE - Emirati Arabi Uniti - nessun TIN personale generalizzato
- [x] PH - Filippine - TIN (struttura)
- [x] GE - Georgia - numero personale (struttura)
- [x] JP - Giappone - My Number
- [x] JO - Giordania - TIN (struttura)
- [x] IN - India - PAN (struttura)
- [x] ID - Indonesia - NPWP e NIK
- [x] IR - Iran - codice nazionale
- [x] IQ - Iraq - TIN (struttura 9 cifre)
- [x] IL - Israele - numero di identità
- [x] KZ - Kazakistan - IIN
- [x] KG - Kirghizistan - INN personale (struttura e data)
- [x] KW - Kuwait - nessun TIN personale generalizzato
- [x] LA - Laos - TIN (struttura 11 cifre)
- [x] LB - Libano - TIN numerico e suffissi IVA (struttura)
- [x] MY - Malaysia - NRIC (struttura e data)
- [x] MV - Maldive - TIN personale (struttura 7 cifre)
- [x] MN - Mongolia - registro civile (struttura e data)
- [x] MM - Myanmar - TIN (struttura 9 cifre)
- [x] NP - Nepal - PAN (struttura)
- [x] OM - Oman - TIN personale non ancora applicabile (riforma 2028)
- [x] PK - Pakistan - CNIC e NTN (struttura)
- [x] PS - Palestina - numero d'identita (checksum Luhn)
- [x] QA - Qatar - nessun TIN personale generalizzato
- [x] SG - Singapore - NRIC/FIN (serie M solo struttura)
- [x] SY - Siria - TIN (struttura 11 cifre)
- [x] LK - Sri Lanka - NIC (struttura e data)
- [x] TJ - Tagikistan - INN (struttura 9 cifre)
- [x] TH - Thailandia - numero di identità nazionale
- [x] TL - Timor Est - TIN (struttura 9 cifre)
- [x] TR - Turchia - T.C. Kimlik No.
- [x] TM - Turkmenistan - HSB (struttura, 12 cifre)
- [x] UZ - Uzbekistan - PINFL (struttura e data)
- [x] VN - Vietnam - MST e numero d'identità personale (struttura)
- [x] YE - Yemen - raqm daribiy (struttura, 9 cifre)

## Europa (44)

- [x] AL - Albania - numero personale (struttura e data)
- [x] AD - Andorra - NRT (struttura)
- [x] AT - Austria - TIN personale (struttura)
- [x] BY - Bielorussia - UNP (struttura)
- [x] BE - Belgio - numero di registro nazionale
- [x] BA - Bosnia ed Erzegovina - JMBG
- [x] BG - Bulgaria - EGN
- [x] CZ - Cechia - rodné číslo
- [x] HR - Croazia - OIB
- [x] DK - Danimarca - CPR (struttura e data)
- [x] EE - Estonia - isikukood
- [x] FI - Finlandia - HETU
- [x] FR - Francia - numero fiscale SPI
- [x] DE - Germania - steuerliche Identifikationsnummer
- [x] GR - Grecia - AFM
- [x] IE - Irlanda - PPS Number
- [x] IS - Islanda - kennitala
- [x] IT - Italia - Codice Fiscale e Partita IVA / CF numerico (checksum)
- [x] LV - Lettonia - personas kods
- [x] LI - Liechtenstein - PEID (struttura)
- [x] LT - Lituania - asmens kodas
- [x] LU - Lussemburgo - matricola nazionale
- [x] MK - Macedonia del Nord - EMBG
- [x] MT - Malta - TIN personale (struttura)
- [x] MD - Moldova - IDNP (struttura)
- [x] MC - Monaco - TIN personale (struttura)
- [x] ME - Montenegro - JMBG
- [x] NO - Norvegia - fødselsnummer e varianti numeriche
- [x] NL - Paesi Bassi - BSN
- [x] PL - Polonia - PESEL
- [x] PT - Portogallo - NIF
- [x] GB - Regno Unito - NINO/UTR (struttura)
- [x] RO - Romania - CNP
- [x] RU - Russia - INN
- [x] SM - San Marino - Codice ISS/COE (struttura)
- [x] RS - Serbia - JMBG
- [x] SK - Slovacchia - rodné číslo
- [x] SI - Slovenia - davčna številka
- [x] ES - Spagna - DNI e NIE
- [x] SE - Svezia - personnummer e samordningsnummer
- [x] CH - Svizzera - numero AVS/AHV
- [x] UA - Ucraina - RNOKPP (struttura)
- [x] HU - Ungheria - adóazonosító jel
- [x] VA - Citta del Vaticano - TIN personale non applicabile

## Oceania (14)

- [x] AU - Australia - TFN (9 cifre)
- [x] FJ - Figi - TIN (struttura)
- [x] KI - Kiribati - TIN alfanumerico (struttura, 4-16 caratteri)
- [x] MH - Isole Marshall - employee identification number (struttura)
- [x] FM - Micronesia - Social Security Number (struttura 2+6 cifre)
- [x] NR - Nauru - nessun TIN personale generalizzato
- [x] NZ - Nuova Zelanda - IRD number
- [x] PW - Palau - ROP Social Security Number (struttura 9 cifre)
- [x] PG - Papua Nuova Guinea - TIN (struttura)
- [x] WS - Samoa - TIN (struttura 5-9 cifre)
- [x] SB - Isole Salomone - TIN (struttura 9 cifre)
- [x] TO - Tonga - TIN alfanumerico (struttura, 4-16 caratteri)
- [x] TV - Tuvalu - nessun TIN personale generalizzato
- [x] VU - Vanuatu - nessun TIN personale generalizzato

## Stato della copertura

La copertura dei 195 Stati e completa in TypeScript e .NET. Ogni voce
indica la profondita disponibile: checksum, formato, dati codificati oppure
`not_applicable`. I miglioramenti futuri sono tracciati nella roadmap e nei
limiti noti, non in questa matrice.

## Giurisdizioni e territori

Territories and independently administered tax jurisdictions are outside the
current 195-state scope. Examples include Hong Kong, Macao, Taiwan, Greenland,
the Faroe Islands, Puerto Rico and other territories with autonomous tax
systems.
