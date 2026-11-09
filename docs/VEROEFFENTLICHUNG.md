# Veröffentlichung und Rechtsform

Stand: 8. November 2026 · Branch `live-einzelunternehmen`

## Entscheid vom 08.11.2026

Der Inhaber hat entschieden, die neue Website **als Einzelunternehmen** live zu stellen; die GmbH folgt später.

| Punkt | Stand |
|---|---|
| Rechtsform | **Einzelunternehmen «ImmoReady Gashi»**, Ostring 6, 8105 Regensdorf, UID CHE-437.026.042, Inhaber Ardit Gashi (Angaben des Inhabers). GmbH weiterhin geplant, öffentlich nicht genannt. |
| Handelsregister, MWST | offen – erscheinen nicht im Impressum (beim Einzelunternehmen nicht Pflicht; nichts erfunden) |
| Rechtstexte | Entwürfe aus der Vorschau vom Inhaber freigegeben (`approvals.legalDraftsApproved`); im Release ohne offene Markierungen: Stand-Datum gesetzt, Wix Bookings und Foto-Upload entfernt (auf der neuen Seite nicht im Einsatz), Aufbewahrung «sobald nicht mehr benötigt». Fachliche Prüfung weiterhin empfohlen. |
| Bilder | 8 KI-Symbolbilder mit Kennzeichnung «Symbolbild (KI)» vom Inhaber freigegeben (`approvals.aiPhotosApproved`); Porträt fehlt (kein Platzhalter öffentlich) |
| Formular | Wix Forms «Offertanfragen» auf der neuen Wix-Headless-Seite (`rise.json → wix.forms`), ohne Foto-Upload |
| Hosting | neue Wix-Headless-Seite «ImmoReady» (Site-ID `f486f5d5-a0d6-45e5-80a7-44befc45746e`). Die bisherige Classic-Seite www.immoready.ch (Bookings, Members) bleibt unverändert; den Domainwechsel macht der Inhaber im Wix-Dashboard. |
| Startprüfung | `python3 tools/rise.py --launch` → «Bereit» |

## Live seit 09.11.2026

- Live-Adresse: https://headless-nvjfhfnkngv-infoimmoready-140d.wix-site-host.com (Wix-Headless-Seite `f486f5d5-a0d6-45e5-80a7-44befc45746e`,
  Dashboard https://manage.wix.com/dashboard/f486f5d5-a0d6-45e5-80a7-44befc45746e). Domain www.immoready.ch zeigt noch auf die alte Classic-Seite.
- **Aufbau:** Wix hostet nur die Startdatei `dist-release/cdn/wix-index.html` (als `index.html`). Sie lädt die vollständige Seite
  `dist-release/cdn/index.html` über jsDelivr aus diesem Repository; Stil, Skript, Bilder, Texturen und Lichtdaten ebenso – alle Adressen an
  feste Commits gebunden (`tools/cdn-release.py <assets-commit> <code-commit> <page-commit>`). Grund: Der direkte Datei-Upload zu Wix war aus
  der Arbeitsumgebung nicht möglich (Wix 403 bzw. gesperrt durch die Rechteprüfung). Die Seite hängt damit von GitHub und jsDelivr ab.
- **Aktualisieren:** `python3 build.py --release` → `python3 tools/cdn-release.py <A>` → Commit/Push (A = Commit mit den Assets; `*.png`
  mit `git add -f`) → `tools/cdn-release.py <A> <Y>` → Commit/Push → `tools/cdn-release.py <A> <Y> <Z>` → `wix-index.html` als `index.html`
  hochladen (Wix-MCP `UploadHeadlessWebsiteFiles`). Danach alle CDN-Adressen auf HTTP 200 prüfen.
- **Formular:** Wix Forms «Offertanfragen». Spam-Schutz `ADVANCED`: Testanfragen mit `test@example.com` oder aus Rechenzentren landen im
  Spam-Ordner (Dashboard → Formulare → Spam).

## Release bauen

```bash
python3 tools/rise.py --launch     # muss «Bereit» melden
python3 build.py --release         # → dist-release/site/ (öffentliche Fassung)
```

`dist-release/` ist nicht im Repository (`.gitignore`), sie wird aus der Quelle erzeugt. `dist/` bleibt die private Vorschau
(`noindex`, `robots.txt`, Demo-Formular, Prüfhinweise).

---

## Früherer Stand (15.10.2026, GmbH in Gründung)

### Status

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
