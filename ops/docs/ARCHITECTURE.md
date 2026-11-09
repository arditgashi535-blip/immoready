# ReadyOps – Architektur

Stand: 08.11.2026 · Branch `claude/readyops-crm` · Verzeichnis `ops/`

## Ziel
Eine gemeinsame, kostengünstige Infrastruktur für **ImmoReady** und **Ready Studio**:
- Leads recherchieren und bewerten
- CRM führen
- Entwürfe vorbereiten
- Freigaben erteilen

Jede Aussenwirkung braucht eine Einzelfreigabe. Marken, Kundendaten, Absender und Vertriebsprozesse bleiben pro Mandant getrennt.

## Bausteine

```
Website-Formulare ──POST /api/intake/:tenant──┐
(Wix / readystudio.ch, CORS-Whitelist)        │
                                              ▼
Recherche-Skripte ──JSON (data/leads)──► import-leads ──► SQLite (data/readyops.sqlite, gitignoriert)
  research-immoready (search.ch, Firmenwebsite)            │  tenant_id auf jeder Zeile
  research-readystudio (search.ch, Website-Audit 390 px)   │
                                                           ▼
                                         repo.js (Mandantenzwang) · pipeline.js · approvals.js
                                                           │
                                     server.js (node:http) │  Freigabeoberfläche public/
                                                           ▼
                           approvals.execute ──► Adapter: handoff (data/handoff.jsonl) │ mock (Tests)
                                                           │
                                       Gmail-ENTWURF (manuell senden)  /  Brief (drucken)  /  Kontaktformular (manuell)
notify.js ──► notifications (dedupliziert) ──► scripts/handoff.js notif ──► Gmail-Entwurf an eigene Adressen
```

| Modul | Aufgabe |
|---|---|
| `src/db.js` | Schema, Mandanten, Eskalationsadresse; `events` mit Triggern unveränderlich |
| `src/repo.js` | Datenzugriff je Mandant; fremde IDs werden wie «nicht gefunden» behandelt |
| `src/pipeline.js` | Zustandsautomat der Vertriebs-Pipeline; «freigegeben» und «kontaktiert» setzt nur das System |
| `src/approvals.js` | versionsgebundene Freigaben, Ungültigkeit bei Änderung, Idempotenz, Retry nur ausdrücklich |
| `src/auth.js` | scrypt, Sitzungen (Token-Hash), CSRF, Anmeldebremse, Rollen owner/editor/viewer je Mandant |
| `src/intake.js` | Formularvalidierung (wie `wix/backend/http-functions.js`), regelbasierte Klassifizierung |
| `src/sanitize.js` | Prompt-Injection-Erkennung, Steuerzeichen entfernen, Escaping, `quoteUntrusted` |
| `src/compliance.js` | Kanalwahl UWG/DSG, Sperrliste, Maskierung von Personendaten in Logs |
| `src/drafts.js` | Anschreiben-Vorlagen und Prüfung verbotener Behauptungen |
| `src/quotes.js` | Offerten und Rechnungen in Rappen, Nummernkreis je Mandant, Auftrag bestätigen |
| `src/notify.js` | interne Sofortmeldungen und Zusammenfassungen, Dedupe-Schlüssel |
| `src/audit/site-audit.js` | schonender Website-Audit mit Belegen |
| `src/research/*` | robots.txt-konformer Abruf (Drosselung), search.ch-Parser mit Sterneintrag-Erkennung |

## Entscheidungen
- **Keine npm-Abhängigkeiten.** Verwendet werden `node:sqlite` (Node ≥ 22.5), `node:http` und `node:test`. Das ergibt keine Lizenz- oder Lieferkettenrisiken und keine Kosten. Playwright wird nur für Tests und Audits genutzt; es ist in der Arbeitsumgebung bereits vorinstalliert.
- **Daten nie im Git.** Das Repository `arditgashi535-blip/immoready` ist öffentlich. `ops/.gitignore` schliesst `data/*` aus.
- **Getrennt vom Website-Build.** `build.py`, `rise.json` und `src/` der Website bleiben unverändert.
- **Kein selbst sendender Mail-Adapter.** Externe Nachrichten werden nach der Freigabe nur als Entwurf übergeben. Gesendet wird durch den Inhaber.

## Betrieb (lokal)
```bash
cd ops
node scripts/create-user.js arditgashi535@gmail.com "Ardit Gashi" immoready:owner,readystudio:owner
npm start                      # http://127.0.0.1:8790
npm run research:immo          # Pilot ImmoReady → data/leads/
npm run research:studio        # Pilot Ready Studio → data/leads/
node scripts/import-leads.js immoready data/leads/immoready-pilot-<datum>.json
npm run digest                 # Zusammenfassung als interne Meldung
npm run test:all
```
Für einen dauerhaften Betrieb braucht es einen Host. Siehe `BLOCKERS.md`, Punkt Hosting.
