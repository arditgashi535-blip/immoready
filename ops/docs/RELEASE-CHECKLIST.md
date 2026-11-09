# Release-Checkliste (Websites und ReadyOps)

Stand 08.11.2026. Eine «RELEASE-CHECKLIST vom 08.11.2026» war im zugänglichen Repository nicht vorhanden. Diese Liste ersetzt sie und beruht auf einer **lesenden** Prüfung der Live-Seiten am 08.11.2026 sowie auf `docs/VEROEFFENTLICHUNG.md` (23 offene Launch-Punkte).
**An Wix, an readystudio.ch, an DNS oder an Mail wurde nichts geändert.**

## A. www.immoready.ch (Wix, live) – belegte Befunde der Prüfung vom 08.11.2026
| # | Befund (Beleg) | Massnahme | Wer |
|---|---|---|---|
| A1 | **Falsche Social-Media-Links**: Footer verlinkt `facebook.com/wix`, `instagram.com/wix`, `x.com/wix`, `tiktok.com/@wix` (Wix-Vorlage) | Im Wix-Editor entfernen oder durch eigene Profile ersetzen | Inhaber im Wix-Editor (Live-Änderung → Freigabe) |
| A2 | Platzhalterseiten `/blank`, `/blank-1`, `/blank-2`, `/blank-3` sind verlinkt | Umbenennen (sprechende URL) oder ausblenden, 301-Weiterleitung | Inhaber |
| A3 | Kein Impressum-Link auf der Startseite (nur «Datenschutzbestimmungen/Datenschutzerklärung/Barrierefreiheitserklärung») | Impressum-Seite anlegen; Angaben siehe C1 | Inhaber + Rechtsprüfung |
| A4 | Handy 390 px: Seite ist breiter als der Bildschirm (Messwert `mobile_overflow`) | Abschnitte mit fester Breite im Mobil-Editor korrigieren | Inhaber |
| A5 | Keine `tel:`-Verlinkung der Telefonnummer auf der Startseite | Telefonnummer als Link setzen | Inhaber |
| A6 | Startseite lädt > 5 MB (`heavy_page`) | Bilder komprimieren | Inhaber |
| A7 | Seitentitel 90+ Zeichen und mit «Kostenlose Erstberatung … Immobilienbewertung» | Kürzen; «Bewertung» nur, wenn die Leistung bestätigt ist | Inhaber |
| A8 | Buchungsstrecke: 8 «kostenlose Offerte»-Kalender (u. a. Drohnenfotografie, 360°, Immobilienbewertung) | Leistungsumfang bestätigen; Drohne braucht ggf. BAZL-Registrierung bzw. Bewilligung – nur nennen, wenn vorhanden | Inhaber |
| A9 | Formular der Relaunch-Vorschau ist noch im Demo-Modus | Anbindung an ReadyOps oder Wix Forms (siehe D) | nach Freigabe |

Die Relaunch-Vorschau im Repository (`dist/`) ist **nicht** live. Die Verbindung GitHub → Wix ist nicht nachgewiesen (kein Wix-Git-Sync gefunden). Änderungen hier sind keine Live-Änderungen.

## B. readystudio.ch – Befunde (lesend)
| # | Befund | Massnahme |
|---|---|---|
| B1 | Impressum und Datenschutz als «Entwurf · nicht zur Veröffentlichung» bzw. «TODO-ARDIT» gekennzeichnet, aber öffentlich erreichbar | Angaben vervollständigen, rechtlich prüfen, Entwurfskennzeichnung entfernen |
| B2 | Kontaktformular sendet an `/api/inquiries` (eigenes Backend, Quellcode hier **nicht** verfügbar) | Repository freigeben, dann Weiterleitung an ReadyOps (`POST /api/intake/readystudio`) einbauen |
| B3 | Statische Prüfung ohne Befund (Viewport, Titel, H1, Impressum- und Datenschutz-Link vorhanden) | – |
| B4 | Hosting nicht eindeutig erkennbar (kein Wix-Generator) | Zugang (Vercel o. ä.) nennen |

## C. Entscheidungen des Inhabers (blockierend für Rechtstexte)
- **C1 Rechtsträger:** readystudio.ch nennt öffentlich «ImmoReady Gashi, Einzelunternehmen, Ostring 6, 8105 Regensdorf, UID CHE-437.026.042». `rise.json → firm.company` steht auf «GmbH in Gründung» mit `[UNSPECIFIED]`. Welche Angabe gilt für immoready.ch? Erst nach der Bestätigung trage ich etwas in `rise.json` ein; Impressum und Datenschutz werden dann automatisch erzeugt (`firm_markup`).
- C2 AGB und Rückerstattungsregeln: nur nötig, wenn online gebucht oder bezahlt wird (Wix Bookings mit Zahlung?). Bitte bestätigen.
- C3 Bestätigte Leistungen (Sanitär-Umfang, Drohne, Immobilienbewertung, Verwaltung).

## D. ReadyOps-Produktivsetzung (alles nach Freigabe)
- [ ] Hosting wählen (kostenlos oder günstig, mit HTTPS); `READYOPS_SECURE=1`, Backup
- [ ] Owner-Konto anlegen (`scripts/create-user.js`), 2FA nachrüsten
- [ ] Formularanbindung ImmoReady: `ops/integration/wix-forward.js` in `wix/backend/http-functions.js` übernehmen (nach erfolgreichem Speichern in Wix an ReadyOps weiterleiten)
- [ ] Formularanbindung Ready Studio: `/api/inquiries` → ReadyOps
- [ ] Gmail-Konnektor neu verbinden oder SMTP freigeben (EMAIL-ROUTING.md)
- [ ] Preisliste Ready Studio bestätigen (`config/pricing.readystudio.json`, `confirmed: true`)
- [ ] Datenschutzerklärungen um CRM, Formular-Speicherung und Auftragsbearbeiter ergänzen
- [ ] Netzwerk der Arbeitsumgebung nach den Piloten wieder einschränken
- [ ] Tests grün: `cd ops && npm run test:all`; Website: `npm test` im Repository-Wurzelverzeichnis

## E. Website-Vorschau im Repository (nicht live) – Testbefunde 08.11.2026
- [ ] t19: Eckpunkt-Grenze (+25 % ggü. V16) an die aktuelle Szene anpassen oder Geometrie reduzieren
- [ ] t20: Vergleichsordner `shots/v17-ausgang` bereitstellen oder den Test ohne ihn überspringen
- [ ] t22: Silbentrennung «Treppenhaus…» bei 390 px auf der Seite Reinigung
- [ ] t24: WSF-Prüfung soll data-URIs ausnehmen (heute Fehlalarm durch Base64)
- [ ] t25: «Gebäude entdecken» – Scroll-Ziel unter dem Kopf prüfen
