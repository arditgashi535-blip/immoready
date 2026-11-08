# Umsetzungsstand ReadyOps (08.11.2026)

Branch `claude/readyops-crm` in `arditgashi535-blip/immoready`. Alle Änderungen liegen unter `ops/`; die Website-Vorschau (`build.py`, `rise.json`, `src/`, `dist/`) ist **unverändert**.
**Nichts ist live:** Es gibt keinen Versand, keine Wix-Änderung, kein Deployment, keine DNS-Änderung und keinen Kundenkontakt.

## Was nachweislich läuft (in dieser Arbeitsumgebung)
| Funktion | Nachweis |
|---|---|
| Mandantenfähiges CRM (SQLite, 22 Tabellen) mit Leads, Firmen, Liegenschaften, Kontakten, Notizen, Aufgaben, Dokumenten, Anfragen, Offerten, Aufträgen | Tests `core`, `intake-security`, `import` |
| Pipeline Neu → … → Gewonnen/Verloren mit erlaubten Übergängen und Protokoll | Test «Pipeline» |
| Freigabe-Warteschlange: versionsgebunden, Änderung macht die Freigabe ungültig, Doppelversand-Schutz, Retry nur ausdrücklich | 8 Tests + UI-Test |
| Freigabeoberfläche (Login, Rollen, Suche/Filter, Volltext, Empfänger, Anhänge, Preis, Bearbeiten, Freigeben/Ablehnen/Zurückstellen, Verlauf, Fehleranzeige, Auswertung, Protokoll; Handy-tauglich) | `test-ui/approval-ui.js` 11/11; läuft auf `http://127.0.0.1:8790` mit den Pilotdaten |
| Formular-Endpunkt `POST /api/intake/:tenant` (Validierung, CORS, Rate-Limit, Klassifizierung, interne Meldung) | HTTP-Tests |
| Offerten/Rechnungen (Rappen, Nummernkreis, ohne MWST solange keine Nummer bestätigt) → Freigabe → Auftrag | Test «Offerten» |
| Interne Meldungen und Zusammenfassung mit Dedupe | Tests; `npm run digest` erzeugte 2 Meldungen, der zweite Lauf 0 |
| Prompt-Injection-Erkennung, Sperrliste, PII-Maskierung, unveränderliches Protokoll | Tests |
| Recherche-Pipeline (robots.txt-konform, gedrosselt, Sterneintrag-Ausschluss) | zwei echte Piloten, siehe unten |
| Website-Audit (390 px, belegte Befunde) | Test gegen lokale Testseiten + 62 echte Prüfungen; 2 Überlauf-Befunde per Screenshot gegengeprüft |

## Piloten (echte Daten, recherchiert am 08.11.2026; gespeichert nur in `ops/data/`, nicht im Git)
### ImmoReady – Immobilienverwaltungen ZH/AG
- 44 Orte × 2 Rubriken (Liegenschafts-/Immobilienverwaltung) auf search.ch. Daraus **105 geeignete Kandidaten**.
- **306 ausgeschlossen**, davon **238 Sterneinträge** (wünschen keine Werbung). Die übrigen: falsche Rubrik, ausserhalb ZH/AG oder Mitbewerber (eigener Hauswartbetrieb).
- **50 Leads ausgewählt** (AG 24, ZH 26; Score 70–90):
  - **12 verifiziert**: Firmenwebsite bestätigt Name und Bewirtschaftung.
  - **4 teilweise**: Website erreichbar, Tätigkeit nicht eindeutig.
  - **34 nur Verzeichnis**: Eintrag mit Geschäftsadresse und Rubrik, ohne Website.
- **50 Briefentwürfe** (Status «Freigabe ausstehend»). Es gibt keine E-Mail-Entwürfe, weil für Werbe-E-Mails keine Einwilligung vorliegt.

### Ready Studio – KMU-Websites ZH/AG
- 2 Läufe, 21 Branchen-Rubriken: Coiffeur, Kosmetik, Nagelstudio, Reinigung, Gartenbau/-pflege, Hauswartung, Maler, Sanitär, Elektro, Schreinerei, Gipser, Plattenleger, Bodenbeläge, Dachdecker, Umzüge, Fensterreinigung.
- **719 Verzeichniseinträge verworfen** (361 in Lauf 1, 358 in Lauf 2), davon **499 Sterneinträge** (242 + 257; dieselbe Firma kann in beiden Läufen vorkommen). Der Rest hatte keine eigene Website im Verzeichnis oder lag ausserhalb ZH/AG.
- **62 Websites geprüft, 52 erreichbar.** Relevant mit mindestens einem hohen oder zwei mittleren belegten Befunden: **39**.
- Häufigste belegte Befunde (unter den 52 erreichbaren):

  | Befund | Anzahl |
  |---|---|
  | seitlicher Überlauf auf dem Handy | 17 |
  | keine Meta-Beschreibung | 18 |
  | `tel:`-Link fehlt | 14 |
  | kein Impressum-Link | 13 |
  | keine H1 | 12 |
  | über 5 MB Seitengewicht | 8 |
  | kein Datenschutz-Link | 7 |
  | Ladezeit über 6 s | 6 |

- **39 Leads im CRM, 34 Entwürfe** (33 Briefe, 1 Kontaktformular), je mit Audit-Bericht als Anhang. Dazu **4 Telefon-Aufgaben** (nur Telefon bekannt).
- **1 Entwurf abgelehnt**: Ein gelöschter Verzeichniseintrag («Gelöscht») war durchgerutscht. Der Lead steht auf «verloren», und der Parser filtert solche Einträge seither.
- **Keine Preisindikation** in den Entwürfen, weil die Preisliste nicht bestätigt ist (`config/pricing.readystudio.json`).

## Was vorbereitet, aber nicht aktiv ist
- Gmail-Übergabe (`scripts/handoff.js`): Der Konnektor ist defekt, siehe BLOCKERS #5.
- Wix-Weiterleitung `integration/wix-forward.js`: nicht in Wix eingebaut.
- Anbindung des Ready-Studio-Formulars (`/api/inquiries`): Der Code ist nicht zugänglich.

## Laufende Kosten
| Posten | Heute | Option später |
|---|---|---|
| Software/Abhängigkeiten | CHF 0 (nur Node-Bordmittel) | – |
| Recherche/Audits | CHF 0 (öffentliche Seiten, keine Bezahl-APIs) | – |
| Hosting ReadyOps | CHF 0 (läuft nur lokal) | kleiner VPS bzw. Container mit persistentem Speicher ca. CHF 5–10/Monat, oder kostenlose Stufen mit Einschränkungen (Ruhezustand, kein dauerhafter Speicher). **Nichts aktiviert.** |
| E-Mail | CHF 0 (Gmail-Entwürfe) | SMTP über Gmail CHF 0; Transaktionsdienst Gratisstufe |
| Briefversand | Porto A-Post CHF 1.20 bzw. B-Post CHF 1.00 je Brief (Stand Post 2026 bitte prüfen) plus Druck | – |

Die Hosting-Preise sind Richtwerte und nicht verbindlich geprüft. Abgeschlossen wurde nichts.

## Daten sichern
`ops/data/readyops.sqlite` und `ops/data/leads/*.json` liegen nur in diesem flüchtigen Container. Vor Ende der Sitzung muss das Sicherungsziel bestätigt werden (BLOCKERS #10).
