# Known Validation Limitations

Status as of 2026-06-12: all 195 states in the current scope are represented.
This document records deliberately limited validation and the institutional
sources used for rules where no public checksum is available. Coverage does
not imply equal confidence across countries.

Nota operativa: la sentinella "paese non supportato" nei test automatici e nella
suite manuale è ora `XX` (codice non assegnato a nessuno Stato ISO 3166-1).

## Identifier families and online verification

The explicit family API currently validates `tax_id_person` for the existing
country/territory coverage and `vat` for all 27 EU countries: AT, BE, BG, CY,
CZ, DE, DK, EE, ES, FI, FR, GR, HR, HU, IE, IT, LT, LU, LV, MT, NL, PL, PT,
RO, SE, SI and SK, plus AU, CH, GB and NO. The French offline rule accepts the numeric
two-character VAT key;
alphanumeric French key variants remain unsupported. The Latvian VAT rule
covers legal-entity registration numbers rather than historical personal
codes. The Bulgarian VAT rule covers the 9-digit EIK and the 10-digit
sole-trader (EGN) check; foreigner (PNF) and miscellaneous 10-digit variants
are not validated. The `tax_id_company` family is implemented for Brazil
(CNPJ), India (GSTIN) and Australia (ACN); further company identifiers (e.g.
Korea BRN, Turkey VKN, Singapore UEN, Japan corporate number) are candidates
pending a confirmed public algorithm and a verifiable example. Other VAT and
`tax_id_company` combinations return
`unsupported_identifier_type`; they are not silently routed through personal
tax-id rules.

Bulgarian VAT remains unsupported because its 9/10-digit space includes
multiple entity and personal-number checksum families. It will be enabled
only when every accepted branch can be sourced and tested without treating
the personal EGN algorithm as a universal Bulgarian VAT rule.

For the United Kingdom, ordinary 9/12-digit VAT numbers receive checksum
validation. Government departments (`GD`) and health authorities (`HA`) have
only a documented range rule and therefore return `validationLevel: 'format'`.

The core remains fully offline. It validates format and checksum but does not
query VIES or national registries, and therefore cannot prove that a VAT
number was issued, is active or belongs to a specific entity. Any future VIES
integration will live in an optional online package.

Fonti istituzionali verificate per gli inserimenti del 2026-06-11:

- DM: scheda OECD AEOI `Dominica-TIN.pdf`, versione archiviata il
  2022-01-24; taxpayer number numerico di massimo 6 cifre.
- GD: scheda OECD AEOI `Grenada-TIN.pdf`, versione archiviata il 2022-01-24;
  TIN univoco di 6 cifre.
- MH: scheda OECD AEOI `Marshall-Islands-TIN.pdf`, versione archiviata il
  2016-08-24; employee identification number nel formato `04-XXXXXX`.
- VC: scheda OECD AEOI `Saint-Vincent-and-the-Grenadines-TIN.pdf`, versione
  archiviata il 2016-08-24; il TIN e numerico, senza lunghezza o checksum
  pubblicati.
- PW: modulo ufficiale `Tax-100` del Bureau of Revenue and Taxation; il ROP
  Social Security Number personale e composto da 3 cifre di citizen code e 6
  cifre individuali.
- PA: pagine ufficiali DGI sul RUC e sul Digito Verificador; per le persone
  naturali il RUC coincide con la cedula. La struttura usa provincia, serie
  alfabetica opzionale, folio/imagen e asiento/ficha. Il DV assegnato dal
  sistema DGI non viene calcolato offline.
- FM: modulo ufficiale `Application for a FSM Social Security Number` della
  FSM Social Security Administration; struttura grafica `2-6` cifre, senza
  checksum pubblicato.
- SD: portale pubblico di registrazione della Sudan Taxation Chamber e relativa
  guida alle dichiarazioni elettroniche; per il tipo `National I.D.` il
  validatore operativo accetta caratteri ASCII alfanumerici. Lunghezza e
  checksum non sono pubblicati.
- LB: scheda OECD AEOI `Lebanon-TIN.pdf`, settembre 2017; TIN seriale
  esclusivamente numerico, con suffisso opzionale `-601`, `-603` o `-604` per
  le registrazioni IVA. Lunghezza e checksum non sono pubblicati.
- SR: portale ufficiale Belastingdienst Suriname, schema pubblico
  `AccountAanmaken` versione `1.7.87_20260505_1554`; il FIN e obbligatorio,
  accetta esclusivamente cifre (`^[0-9]*$`) e ha lunghezza massima 10.
  Non e pubblicato un checksum.
- CD: portale ufficiale e-NIF della DGI della Repubblica Democratica del
  Congo e relativa guida pubblica; il risultato di ricerca mostrato nella
  guida usa `A1011126F`, nel formato lettera + 7 cifre + lettera. Il portale
  impone almeno 9 caratteri; non e pubblicato un checksum.

## Completed research batches

Sezione svuotata l'11-06-2026: tutte le voci (CU, DO, EC, GT, IR, LK, PY, UZ,
ZA) sono state implementate. Fonti verificate online durante l'implementazione:

- ZA: scheda OECD AEOI "South Africa - Information on Tax Identification
  Numbers" (modulus 10 con esempio ufficiale 0001339050; ID a 13 cifre come
  equivalente funzionale).
- PY: nota tecnica DNIT sul dígito verificador (modulo 11).
- GT: regola SAT del modulo 11 con lettera K = 10, esempio verificato
  3602978-5.
- CU: struttura del carnet (7a cifra: 9 = XIX, 0-5 = XX, 6-8 = XXI) da fonti
  pubbliche cubane concordanti.
- IR, EC, DO: algoritmi mod-11/mod-10/Luhn ampiamente documentati e verificati
  su esempi noti.
- LK, UZ: solo struttura e data; l'algoritmo della cifra di controllo non è
  pubblico.

## Format-only research

Sezione svuotata il 12-06-2026: le ultime 12 voci (TD, KM, DJ, GQ, ER, GM, NE,
SO, TM, YE, KI, TO) sono state implementate con struttura format-only, poiché
non sono disponibili algoritmi di checksum pubblici per questi paesi.

## Territories researched but not validated

These ISO 3166-1 territories were researched for the expansion roadmap but
expose no institutionally documented structure or check digit that can be
validated honestly, so they are intentionally not supported:

- Gibraltar (GI): taxpayer reference is numeric only, with no published fixed
  length or check digit.
- Isle of Man (IM): individuals use UK NINO-style references that overlap the
  GB rules; not separately modelled.
- Macao (MO): the resident-ID check digit algorithm is not publicly documented.
- Aruba (AW), Curaçao (CW), Sint Maarten (SX): persoonsnummer / crib structure
  is not institutionally documented.

They will be added if an official source becomes available.

## Country limitations to revisit

These countries are supported with deliberately reduced validation and should
be upgraded only when stronger institutional sources become available:

- US - SSN solo struttura (le aree non sono più predittive dopo la
  randomizzazione del 2011).
- KR - RRN solo struttura e data (parte individuale randomizzata da ottobre
  2020, checksum non più garantito).
- IN - PAN solo struttura (algoritmo della lettera di controllo non
  pubblico).
- SG - serie M dei FIN solo struttura (tabella della lettera di controllo
  non pubblicata).
- AU - solo TFN a 9 cifre; gli storici TFN a 8 cifre non sono accettati.
- MY - coperto il NRIC (TIN funzionale); gli income tax number con prefisso
  SG/OG non sono accettati.
- ID - il Luhn sulle prime 9 cifre del NPWP è implementato ovunque ma non
  risulta pubblicato come norma; NIK solo struttura e data.
- LK, UZ, CU - solo struttura e data di nascita codificata; cifra di
  controllo non pubblica.
- DK, AL, MD, UA, CY, MT, LI, AD, BY, SM, MC, GB, GE, PH, PK, VN, EG, GH,
  KE, MU, NG, RW, TZ, UG, ZM, TJ, DM, GD, MH, BF, BI, BJ, CD, CF, CG, CI,
  CM, GA, GW, LA, LC, LR, LS, LY, MG, ML, MM, MR, MW, SB, SC, SL, SR, SS,
  LB, SD, ST, SY, SZ, TG, TL, ZW, TD, KM, DJ, GQ, ER, GM, NE, SO, TM, YE,
  KI, TO - solo struttura, come documentato nel README della libreria.
