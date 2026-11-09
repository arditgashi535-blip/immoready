# Testbericht (08.11.2026, Arbeitsumgebung Claude Code, Node 22.23, Chromium/Playwright)

## ReadyOps (`cd ops && npm run test:all`)
**31/31 Unit-, Integrations- und HTTP-Tests bestanden** (`node --test`) und **11/11 Browser-Prüfungen** (`test-ui/approval-ui.js`, Desktop 1280 px und Handy 390 px).

| Anforderung | Test(s) |
|---|---|
| Formularvalidierung | Formularvalidierung; HTTP Formular-Endpunkt (CORS, 64 KB, 404 bei fremdem Mandanten) |
| CRM-Speicherung | CRM: Lead speichern; Import (Leads → CRM, Entwürfe je Kanal, Audit-Anhang) |
| Lead-Deduplizierung | Dedupe Normalisierung; Dedupe Domain/Telefon/Name |
| Mandantentrennung | Mandantentrennung (Repo + Freigabe); HTTP 403/404 für fremde Mandanten; UI Mandantenwechsel |
| Freigabeprozess | Ablauf; Änderung → Freigabe ungültig; veraltete Version/Hash; UI: Freigeben → Bearbeiten (v2, Freigabe weg) → Freigeben → Ausführen |
| Nicht autorisierter E-Mail-Versand | Versand ohne Freigabe/nach Ablehnung/Zurückstellung verweigert; Rollen; CSRF |
| Versandwiederholungen | Doppelversand (3 gleichzeitige Ausführungen → genau 1); zweite Ausführung → 409 |
| Fehlgeschlagene Integrationen | Fehlerstatus, keine stille Wiederholung, ausdrückliches retry |
| Datenschutz | Sperrliste (E-Mail/Domain), Opt-out der Firma, PII-Maskierung im Protokoll, Protokoll unveränderlich, Meldungen ohne Kundenkontaktdaten |
| Prompt-Injection | Erkennung; bösartige Anfrage erzeugt keinen Entwurf, keine Freigabe, keine Ausführung; UI-Warnung |
| Mobile Darstellung | UI 390 px ohne Überlauf, Bedienelemente ≥ 44 px |
| Sicherheit/Berechtigungen | Cookie-Attribute, CSP/Frame-Header, falsches Passwort, Abmelden beendet die Sitzung |
| Anschreiben-Regeln | keine verbotenen Behauptungen, Opt-out-Zeile, «GmbH» im Empfängernamen erlaubt |
| Website-Audit | robots.txt-Parser, Verzeichnis-Parser (Sterneintrag, gelöschte Einträge), statische Befunde, Browser-Audit gegen lokale Testseiten |

Mock-Dienste: `mockAdapter` (Versand), lokale HTTP-Server mit Testseiten (Audit), In-Memory- bzw. Temp-Datenbanken. **Es gab keine Testanfragen an produktive Kundenendpunkte** (insbesondere nicht an `readystudio.ch/api/inquiries` oder Wix).

Belege: `ops/data/ops-test.log` (lokal), Screenshots `ops/data/shots/` (lokal).

## Pilot-Läufe gegen echte öffentliche Seiten (nur lesend)
- Verzeichnis: 86 + 41 + 45 erfolgreiche Rubrikenabfragen auf search.ch (ImmoReady, Ready Studio Lauf 1 und 2), gedrosselt mit 4 s.
- Firmen-Startseiten ImmoReady: 22 der 105 Kandidaten hatten eine Website im Verzeichnis; alle 22 waren abrufbar.
- Ready-Studio-Audits: 62 Websites, 52 erreichbar.
- Gegenprüfung: 2 Überlauf-Befunde per Screenshot bestätigt (Inhalte rechts abgeschnitten).

## Bestehende Website-Tests (`npm test` im Repository-Wurzelverzeichnis)
Ausgeführt am 08.11.2026 auf dem Branch. Ausserhalb von `ops/` gibt es gegenüber `v17.1-release-candidate` **keine Änderung**, der Build hat `dist/` bitgleich reproduziert.
- **369 bestanden, 2 fehlgeschlagen**, danach Abbruch der Kette in t20:
  1. `t19-v17`: «Geometrie nicht pauschal erhöht: 502 386 Eckpunkte (V16: 361 344, Grenze +25 %)». Die Grenzwertprüfung stammt aus V17; die Szene wuchs in späteren Überarbeitungen. Nicht durch ReadyOps verursacht.
  2. `t20-v171`: «Alle 16 Stationsbilder … neu gerendert (gegenüber v17-ausgang verglichen: 0)». Der Vergleichsordner liegt in `shots/` (gitignoriert) und fehlt in einem frischen Klon. Das betrifft die Umgebung, nicht den Code.
- **t21–t29 einzeln nachgeführt: 248 bestanden, 3 fehlgeschlagen** (t21, t23, t26–t29 ohne Fehler):
  3. `t22-mobil`: «lange Wörter nur an Trennstellen umbrochen … 390: reinigung: Treppenhaus…» (Silbentrennung bei 390 px auf der Seite Reinigung).
  4. `t24-inhalte`: «Builds ohne WSF: dist/immoready-vorschau.html». Das ist ein **Fehlalarm** der Testregel: «WSF» kommt nur als zufällige Zeichenfolge in eingebetteten Base64-Bilddaten vor (6 Treffer, alle in data-URIs), nicht im sichtbaren Text oder in Metadaten. Die Regel sollte data-URIs ausnehmen.
  5. `t25-premium`: «Gebäude entdecken führt zum Rundgang … Oberkante unter dem Kopf 343 px» (Scroll-Ziel bzw. Zeitverhalten in SwiftShader).
- Alle 5 Fehler betreffen die bestehende Website-Vorschau. Diese wurde in dieser Sitzung nicht verändert; die Fehler bestanden also schon vorher bzw. hängen von der Umgebung ab. Sie wurden **nicht** behoben, weil das ausserhalb des ReadyOps-Auftrags liegt und die Vorschau ohnehin nicht live ist. Sie stehen in RELEASE-CHECKLIST, Abschnitt E.
- Gesamt Website: **617 bestanden, 5 fehlgeschlagen**.
- Nicht ausgeführt: `test:embed` und `test:component` (brauchen 3 lokale Server), `perf`.
