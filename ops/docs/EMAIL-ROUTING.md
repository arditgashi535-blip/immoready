# E-Mail-Routing

## Adressen
| Zweck | ImmoReady | Ready Studio |
|---|---|---|
| Interne Meldungen | info.immoready@gmail.com | info.readystudio@gmail.com |
| Absender externer Nachrichten (nach Freigabe) | info.immoready@gmail.com | info.readystudio@gmail.com |
| Kritische Eskalation (zusätzlich) | arditgashi535@gmail.com | arditgashi535@gmail.com |

«Kritisch» umfasst diese Meldungsarten: `kritischer_fehler`, `sicherheitsvorfall`, `formular_fehlgeschlagen`.

## Sofortmeldungen (`src/notify.js → IMMEDIATE`)
qualifizierte_anfrage · interessierter_kunde · auftrag_bestaetigt · kundenantwort · kritischer_fehler · formular_fehlgeschlagen · sicherheitsvorfall · dringende_frist

## Zusammenfassung (`npm run digest [tage]`)
Enthält: neue Leads, vorbereitete Anschreiben, offene Freigaben, versendete Angebote, Kundenrückmeldungen, gewonnene Aufträge und das geschätzte Umsatzpotenzial (nur aus erfassten Werten; leer = 0).
Der Dedupe-Schlüssel gilt je Tag und Zeitraum. Ein zweiter Lauf am selben Tag erzeugt deshalb nichts Neues.

## Duplikate
`notifications.dedupe_key` (Mandant, Art, Ereignis-ID, Empfänger) ist UNIQUE. Dasselbe Ereignis kann daher nie zweimal gemeldet werden.
Meldungen enthalten **keine** Kontaktdaten von Kunden, nur Referenz, Leistung und Ort. Die Details stehen in ReadyOps.

## Zustellung – aktueller Stand (ehrlich)
- Das System versendet **selbst keine** E-Mails. Das gilt auch für interne Meldungen.
- Der vorgesehene Weg sind Gmail-**Entwürfe** über den Gmail-Konnektor der Claude-Sitzung:
  - `node scripts/handoff.js notif` listet offene interne Meldungen.
  - `node scripts/handoff.js list` listet freigegebene externe E-Mails.
- **Blocker 08.11.2026:** Der verbundene Gmail-Konnektor meldet bei jedem Aufruf «Incompatible auth server: does not support dynamic client registration». Es wurde daher **kein** Gmail-Entwurf angelegt. Ausserdem ist unklar, mit welchem der drei Konten der Konnektor verbunden wäre. Siehe `BLOCKERS.md`.
- Bestehende Gmail-Filter und Labels konnten wegen desselben Fehlers nicht gelesen werden. Es wurden **keine** Gmail-Regeln angelegt oder geändert.
- Für Briefe und Kontaktformulare legt «Ausführen» eine druck- bzw. kopierfertige Übergabe an. Gesendet wird manuell.

## Spätere Option (nur nach Freigabe)
SMTP über Gmail mit App-Passwort je Konto oder ein kostenloser Transaktionsdienst. Beides ist bewusst nicht eingebaut. Ein Einbau braucht eine Freigabe, weil damit das System selbst versenden könnte.
