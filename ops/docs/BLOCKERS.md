# Blocker und fehlende Zugänge (Stand 08.11.2026)

| # | Blocker | Auswirkung | Was konkret fehlt / nötig ist |
|---|---|---|---|
| 1 | Repository `infoimmoready-commits/immoready` **nicht erreichbar** (add_repo: «you don't have access») | Gearbeitet wurde in `arditgashi535-blip/immoready` (öffentlich) | Zugriff der Claude-GitHub-App auf die Organisation `infoimmoready-commits` oder Bestätigung, dass `arditgashi535-blip/immoready` massgeblich ist |
| 2 | GitHub-Issues #1–#7 nicht vorhanden (404 im zugänglichen Repo) | Konnten nicht als Ausgangsbasis dienen | Issues im erreichbaren Repo oder Zugriff gemäss Punkt 1 |
| 3 | «RELEASE-CHECKLIST vom 08.11.2026» nicht auffindbar | Neue Checkliste aus Live-Prüfung erstellt (`RELEASE-CHECKLIST.md`) | Originaldatei, falls sie existiert |
| 4 | Quellcode von **readystudio.ch** nicht verfügbar (eigenes Backend `/api/inquiries`, Hosting unbekannt) | Formular- und CRM-Anbindung von Ready Studio nur vorbereitet, nicht eingebaut | GitHub-Repository der Ready-Studio-Website und Hosting-Zugang (z. B. Vercel) |
| 5 | **Gmail-Konnektor** schlägt fehl («Incompatible auth server: does not support dynamic client registration») | Keine Gmail-Entwürfe angelegt; bestehende Gmail-Labels und Filter konnten nicht gelesen werden; interne Meldungen bleiben in ReadyOps (`notifications`, Status «offen») | Gmail-Konnektor in den claude.ai-Einstellungen neu verbinden – für welches Konto (info.immoready, info.readystudio, arditgashi535)? Drei Postfächer brauchen drei Verbindungen oder eine Weiterleitung |
| 6 | Kein Hosting für ReadyOps | Die Freigabeoberfläche läuft nur in der Arbeitsumgebung (127.0.0.1), nicht vom Handy aus | Entscheid für einen Host (siehe Kosten in IMPLEMENTATION-STATUS) |
| 7 | Rechtsträger widersprüchlich: readystudio.ch nennt «ImmoReady Gashi, Einzelunternehmen, UID CHE-437.026.042», `rise.json` sagt «GmbH in Gründung / [UNSPECIFIED]» | Impressum/Datenschutz für immoready.ch nicht finalisierbar | Ihre Bestätigung der gültigen Angaben |
| 8 | Wix: Live-Seite wird im Editor gepflegt; keine nachgewiesene Verbindung GitHub → Wix | Website-Korrekturen (Social-Links, /blank-Seiten, Impressum) nur als Checkliste | Umsetzung im Wix-Editor durch Sie oder ausdrückliche Freigabe einer konkreten Änderung |
| 9 | Preisliste Ready Studio nicht bestätigt | Keine Preisindikation in Entwürfen (bewusst) | Preise in `config/pricing.readystudio.json` eintragen, `confirmed: true` |
| 10 | Container ist flüchtig | `data/readyops.sqlite` und Lead-Dateien gehen beim Ende der Sitzung verloren, wenn sie nicht gesichert werden | Export-Ziel bestätigen (privates Google Drive oder Download), siehe IMPLEMENTATION-STATUS |

## Nicht blockierend, aber offen
- Netzwerk der Umgebung «Immoready» ist für die Piloten auf «unrestricted» gestellt. Nach den Piloten wieder einschränken.
- Drohnenfotografie und Immobilienbewertung werden auf immoready.ch angeboten. Bewilligungen und Umfang bitte bestätigen.
