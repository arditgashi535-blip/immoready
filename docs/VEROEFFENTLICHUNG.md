# Veröffentlichung und GmbH-Status

Stand: 15. Oktober 2026 · Branch `v17.1-release-candidate`

## Status

| Punkt | Stand |
|---|---|
| Rechtsform | **GmbH in Gründung** (Angabe des Inhabers). Die Website tritt öffentlich noch nicht als GmbH auf. |
| Website | Vorschau fertig vorbereitet und prüfbar, **nicht veröffentlicht** |
| Bestehende Website www.immoready.ch / Domain | **unverändert** |
| Livegang | **gesperrt**, bis die Gründung bestätigt und der Livegang ausdrücklich freigegeben ist |

## Wo die Vorschau liegt und wer sie sehen kann

| Form | Zugriff |
|---|---|
| Claude-Artefakt «ImmoReady Relaunch» | **privat**: nur der Inhaber (angemeldetes Konto). Nicht über «Teilen» öffentlich freigeben. Ein öffentlicher Link wäre nicht mehr geschützt. |
| `dist/immoready-vorschau.html`, ZIP, Repository | lokale Dateien bzw. privates Repository – nicht hochladen |
| `dist/site/` (Produktionsform) | nur für einen späteren Upload vorbereitet. Enthält bis zur Freigabe `noindex,nofollow,noarchive` und `robots.txt` (`Disallow: /`). **Das ist kein Zugriffsschutz.** Falls sie vorab auf einem Server geprüft werden soll, nur hinter einem Passwort (HTTP-Anmeldung oder passwortgeschützte Seite), nie als nur «nicht verlinkte» Adresse. |

## Wie die GmbH-Angaben gepflegt werden

Alle Unternehmensangaben stehen **nur** in `rise.json → firm.company`. Impressum, Datenschutz (verantwortliche Stelle),
Kontaktseite und Footer werden beim Build daraus erzeugt (`tools/rise.py → firm_markup`) und sind dadurch überall gleich.

Solange `status` = `in_gruendung` ist:
- nennt die Seite öffentlich nur die Marke «ImmoReady» und Ardit Gashi, **keine Rechtsform**;
- erscheint der GmbH-Entwurf (Rechtsform geplant, alle Registerangaben «offen») nur mit **Prüfhinweise anzeigen**;
- verhindert die Prüfung in `tools/rise.py` «GmbH» in öffentlichen Texten (Rundgang, Leistungen, Seiten);
- sind `foundingConfirmed` und `goLiveApproved` gesperrt (müssen `false` bleiben).

Nichts davon ist erfunden: Firmenname, Sitz, Geschäftsadresse, UID, Handelsregister, zeichnungsberechtigte Personen und MWST sind `[UNSPECIFIED]`.

## Vor der Veröffentlichung (alle Punkte erforderlich)

`python3 tools/rise.py --launch` (oder `npm run launch:check`) listet die offenen Punkte und bricht mit Exit 1 ab, solange etwas fehlt. `python3 build.py --release` verweigert in diesem Fall den Release-Build.

Heute offen (23 Punkte, Ausgabe von `npm run launch:check` am 15.10.2026):
1. Gründung der GmbH bestätigen (Eintragung im Handelsregister).
2. Unternehmensangaben (7): eingetragener Firmenname (muss «GmbH» enthalten), Sitz, Geschäftsadresse, UID (`CHE-123.456.789`), Handelsregister (Kanton, Eintrag), zeichnungsberechtigte Person(en) und Funktion, MWST-Nummer oder «nicht MWST-pflichtig».
3. Funktion von Ardit Gashi in der GmbH bestätigen. Auf der Website steht bis dahin «Ihr Ansprechpartner»; im Impressum steht vorläufig «Inhaber» (`firm.role`).
4. Impressum: endgültiger Text (fachlich prüfen lassen).
5. Datenschutzerklärung: endgültiger Text. Der Entwurf ist auf die Technik abgestimmt: Wix-Hosting und -Speicherung, Google Fonts, Bewerbungen per E-Mail, keine eigenen Statistik-Cookies. Er braucht noch eine fachliche Prüfung.
6. Hosting und Auftragsbearbeiter.
7. Formular anschliessen (Wix-Backend, siehe `wix/EINBAU.md`). Bis dahin läuft es im Demo-Modus.
8. Fotos (9): acht KI-Übergangsbilder ersetzen und ein eigenes Porträt beziehungsweise Familienfoto liefern (`docs/FOTOLISTE.md`).
9. Ausdrückliche Freigabe des Livegangs durch den Inhaber.

## Ablauf nach bestätigter Gründung

1. Inhaber bestätigt die Eintragung und nennt die Registerangaben (Auszug Handelsregister).
2. Angaben in `rise.json → firm.company` eintragen. Dann `status: "eingetragen"`, `foundingConfirmed: true` und `firm.role` setzen.
3. `python3 tools/rise.py` (Regeln) und `npm run test:alle` (alle Prüfungen) laufen lassen. Danach Impressum, Datenschutz, Kontakt und Footer in der Vorschau kontrollieren.
4. Impressum und Datenschutz endgültig formulieren und prüfen lassen. Hosting eintragen, Formular anschliessen und testen (Testversand nur nach Freigabe der Empfänger).
5. Inhaber gibt den Livegang ausdrücklich frei → `goLiveApproved: true`.
6. `python3 tools/rise.py --launch` muss «Bereit» melden. Dann `python3 build.py --release`; dabei Vorschau-Werkzeuge entfernen (Demo-Hinweis, Prüfhinweise, Umsetzungsmappe).
7. Einbau in Wix nach `wix/EINBAU.md`, Test in Vorschau **und** live, auf Safari, einem echten iPhone und einem Android-Gerät.
