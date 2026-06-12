# Paesi non ancora coperti

Stato al 2026-06-12 (195 paesi coperti — tutti i 195 Stati comunemente riconosciuti).
Censimento dei paesi della checklist di [TODO.md](TODO.md) non ancora
implementati, raggruppati per motivo. Le note tecniche derivano da conoscenza
generale consolidata (OECD AEOI, librerie di validazione note); dove possibile
la fonte va verificata online prima dell'implementazione, come richiesto dai
criteri del TODO.

Nota operativa: la sentinella "paese non supportato" nei test automatici e nella
suite manuale è ora `XX` (codice non assegnato a nessuno Stato ISO 3166-1).

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

## 1. Candidati prioritari - algoritmo di controllo noto da fonti secondarie

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

## 2. Struttura nota, checksum assente o non pubblico - candidati format-only

La struttura è riportata da fonti secondarie (principalmente schede OECD
AEOI); serve conferma istituzionale prima di implementare.

### Africa


### Asia

## 3. Informazioni insufficienti - serve ricerca con fonti online

Sezione svuotata il 12-06-2026: le ultime 12 voci (TD, KM, DJ, GQ, ER, GM, NE,
SO, TM, YE, KI, TO) sono state implementate con struttura format-only, poiché
non sono disponibili algoritmi di checksum pubblici per questi paesi.

## Limiti dichiarati nei paesi già coperti (da rivisitare)

Voci già spuntate in TODO.md ma con validazione ridotta, da potenziare se
emergono fonti:

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
