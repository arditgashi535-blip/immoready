# CRM-Schema (SQLite, `src/db.js`)

Alle fachlichen Tabellen haben `tenant_id` (`immoready` | `readystudio`). Abfragen laufen ausschliesslich über `repo.js` bzw. `approvals.js` und filtern immer nach dem Mandanten.

| Tabelle | Zweck | Wichtige Felder |
|---|---|---|
| tenants | Mandanten | notify_email, sender_email |
| users, memberships, sessions | Anmeldung, Rollen je Mandant, Sitzungen (nur Token-Hash) | role ∈ owner/editor/viewer |
| companies | Firmen | name_key, domain, phone_key (Dedupe), canton, segment, opt_out |
| contacts | Ansprechpartner (nur öffentlich-geschäftlich) | source_url, is_public_business, opt_out |
| properties | Liegenschaften | address, units |
| leads | Leads und Pipeline | stage, score, score_detail, need, fit_reason, channel, channel_reason, verification, est_value_chf, follow_up_at |
| lead_sources | Quellen mit Abrufzeitpunkt | url, retrieved_at |
| findings | Website-Befunde (Ready Studio) | code, severity, text, evidence, measured_at |
| inquiries | eingehende Anfragen | payload, classification, qualified, injection_flags |
| notes, tasks | Gesprächsnotizen, Wiedervorlagen | due_at, done |
| documents | Anhänge (z. B. Audit-Bericht) | sha256 |
| drafts, draft_versions | Entwürfe mit allen Versionen | status, current_version, content_hash |
| approvals | Freigabehistorie | version, content_hash, recipient, action, decision, valid |
| actions_outbox | Ausführungen | idem_key UNIQUE, status, attempts, error |
| quotes, quote_items, orders | Offerten, Rechnungen, Aufträge | Beträge in Rappen, number UNIQUE je Mandant |
| events | Änderungsprotokoll (unveränderlich) | actor, entity, type, data (PII maskiert) |
| notifications | interne Meldungen | dedupe_key UNIQUE, priority, status |
| suppression | Sperrliste (Widerspruch) | kind email/domain |

## Pipeline
`neu → qualifiziert → kontaktentwurf → freigabe_ausstehend → freigegeben* → kontaktiert* → rueckmeldung → offerte → gewonnen | verloren`
(* nur durch das System). Erlaubte Übergänge stehen in `src/pipeline.js → NEXT`.

## Prüfstufen eines Leads (`verification`)
- `verifiziert`: Die Firmenwebsite wurde abgerufen; Name und Tätigkeit sind dort bestätigt.
- `teilweise`: Die Website ist erreichbar und der Name gefunden, die Tätigkeit aber nicht eindeutig.
- `verzeichnis`: Nur der Verzeichniseintrag (search.ch) mit Adresse und Rubrik liegt vor.
- `selbstauskunft`: Der Lead stammt aus einer eigenen Anfrage des Kunden.
- `unverifiziert`: Es liegt kein Beleg vor.
