# Sicherheit und Datenschutz

## Umgesetzt (getestet, siehe TESTREPORT.md)
- **Authentifizierung:**
  - Passwörter mit scrypt (N = 16384), mindestens 12 Zeichen.
  - Sitzungstoken mit 256 Bit; gespeichert wird nur der SHA-256-Hash. Laufzeit 12 h.
  - Cookie `HttpOnly; SameSite=Strict` (+ `Secure` mit `READYOPS_SECURE=1`).
  - Anmeldebremse: 5 Fehlversuche führen zu 15 Minuten Sperre (pro IP und E-Mail).
  - Zeitkonstante Prüfung, auch für unbekannte Benutzer.
- **CSRF:** Jeder nicht-GET-Aufruf braucht ein `X-CSRF-Token`, das an die Sitzung gebunden ist.
- **Autorisierung:** Rolle je Mandant. Mandantentrennung ist in jeder Abfrage erzwungen; fremde IDs ergeben 404.
- **HTTP-Header:**
  - CSP `default-src 'self'` ohne Inline-Skripte, `frame-ancestors 'none'`
  - `X-Frame-Options: DENY`, `nosniff`, `no-referrer`, `no-store`
- **Formular-Endpunkt:**
  - CORS nur für immoready.ch und readystudio.ch
  - 64 KB Grössenlimit, Rate-Limit 10 Anfragen pro 10 min und IP
  - Honigtopf-Feld, serverseitige Validierung
- **Prompt-Injection:**
  - Externe Inhalte (Anfragen, Websites) sind Daten. Sie können keine Aktion, keine Freigabe und keinen Versand auslösen; das ist so implementiert.
  - Muster werden erkannt (`sanitize.detectInjection`) und in der Oberfläche als Warnung angezeigt.
  - Steuer- und Bidi-Zeichen werden entfernt.
  - `quoteUntrusted()` umschliesst Text, bevor er einem Sprachmodell gegeben wird.
  - Die Klassifizierung ist regelbasiert und nutzt kein LLM.
- **XSS:** Die Oberfläche setzt alle Daten mit `textContent` ein, nie mit `innerHTML`.
- **Datenschutz (revDSG):**
  - Daten liegen nur lokal in `data/` (gitignoriert, Datei-Rechte 600 für Exporte).
  - Personendaten in `events` werden maskiert; Meldungen enthalten keine Kundenkontaktdaten.
  - Ansprechpartner nur, wenn sie öffentlich und geschäftlich genannt sind. Im Pilot wurden keine Ansprechpartner erfasst; 2 Einzelunternehmen tragen den Namen des Inhabers als Firmennamen (öffentlicher Geschäftseintrag).
  - Sperrliste (E-Mail oder Domain) blockiert Freigabe und Ausführung.
  - Sterneinträge («wünscht keine Werbung») werden schon bei der Recherche ausgeschlossen.
- **Recherche:**
  - robots.txt wird beachtet (search.ch: keine Paginierung über `alltl=`), Drosselung 2–4 s pro Host.
  - Eigener User-Agent, nur GET; keine Formularübermittlung, keine Sicherheits-Scans.

## Offen / vor einem Produktivbetrieb
- Hosting hinter HTTPS mit `READYOPS_SECURE=1`; Backup der SQLite-Datei (verschlüsselt).
- Zwei-Faktor-Anmeldung (TOTP) für owner.
- Datenschutzerklärung beider Websites um die CRM-Verarbeitung und die Formular-Speicherung ergänzen. Das sind prüfpflichtige Entwürfe, siehe RELEASE-CHECKLIST.
- Löschkonzept: Leads ohne Reaktion nach 12 Monaten löschen oder anonymisieren (noch nicht automatisiert).
- Die Netzwerkfreigabe der Arbeitsumgebung «Immoready» wurde am 08.11.2026 für die Piloten auf «unrestricted» gestellt (vom Inhaber bestätigt). Nach Abschluss der Piloten kann sie wieder eingeschränkt werden.
