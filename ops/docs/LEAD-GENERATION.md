# Leadgenerierung

## Grundsätze (Schweiz: UWG, revDSG)
- **Keine Massenwerbung per E-Mail ohne Einwilligung** (UWG Art. 3 Abs. 1 lit. o). Eine öffentlich auffindbare Adresse ist keine Einwilligung. Deshalb ist der Standardkanal für den Erstkontakt **Brief** an die Geschäftsadresse oder eine einzelne Nachricht über das **Kontaktformular**. Jede Nachricht ist individuell und wird einzeln freigegeben.
- **Sterneintrag** im Telefonbuch («wünscht keine Werbung», UWG Art. 3 Abs. 1 lit. u): Diese Firmen werden bei der Recherche **ausgeschlossen**, nicht nur beim Anruf.
- Jede Nachricht enthält eine einfache Ablehnungsmöglichkeit. Ein Widerspruch → Sperrliste (`suppression`), danach ist kein Entwurf mehr freigebbar.
- **Nichts erfinden:** keine Referenzen, keine Kundenbeziehungen, keine Zertifikate, keine «GmbH», kein 24/7, keine Garantien. `drafts.checkClaims()` blockiert solche Formulierungen. Bei Ready Studio: keine Aussage, dass eine Website «unsicher» oder «schlecht» sei. Es gibt nur gemessene Befunde mit Beleg.
- Personendaten: Ansprechpartner nur, wenn öffentlich und geschäftlich relevant. Im Pilot wurden **keine Ansprechpartner** erfasst; die Anrede lautet «Sehr geehrte Damen und Herren» bzw. «Guten Tag». Ausnahme: **Einzelunternehmen**, die im Verzeichnis unter dem Namen des Inhabers geführt werden (Pilot: 2 Einträge im Format «Nachname, Vorname»). Das ist der öffentliche Geschäftseintrag; vor einer Freigabe bitte besonders prüfen.
- Gelöschte/anonymisierte Verzeichniseinträge («Gelöscht») werden verworfen (1 Fall im Pilot erkannt, Entwurf abgelehnt, Lead «verloren»).

## Quellen und Technik
| Schritt | Werkzeug | Schonung |
|---|---|---|
| Kandidaten | search.ch Telefonbuch, Rubrikenseiten `/tel/<Ort>/<Rubrik>` (laut robots.txt erlaubt) | 4 s Abstand, keine Paginierung (`alltl=` ist per robots.txt gesperrt), keine Detail-Scraping-Schleifen |
| Verifikation ImmoReady | Firmen-Startseite (1 Abruf): Name, «Bewirtschaftung/Verwaltung», Stockwerkeigentum, Mehrfamilienhäuser, eigener Hauswartdienst | 2 s Abstand je Host, robots.txt |
| Audit Ready Studio | 1 Seitenansicht im Browser als Smartphone (390 px) + HTML-Analyse | nur Startseite, keine Formulare, keine Scans |
| Bewertung | `src/scoring.js` (Teilpunkte nachvollziehbar in `score_detail`) | – |
| Kanal | `src/compliance.js → recommendChannel` | – |

Websuche (WebSearch) wurde getestet. Sie lieferte überwiegend Stelleninserate und war für die Firmenfindung ungeeignet.

## Bewertung ImmoReady (0–100)
+30 Verwaltung/Bewirtschaftung · +20 Kanton ZH/AG · +15 Bestand belegt (STWE/MFH auf der Website) · +10 Kontakt belegt · +10 offizielle Quelle · +5 Website bestätigt · −15 eigener Hauswartdienst · −10 unverifiziert.

## Bewertung Ready Studio (0–100)
+20 Zielbranche · +10 Region · +30 mindestens 2 hohe Befunde (sonst +15 bei mindestens 2 mittleren) · +10 kein Formular · +15 nicht mobiltauglich · +10 Kontakt belegt · −20 nicht erreichbar · −10 unverifiziert.

## Abläufe
```bash
cd ops
npm run research:immo                                   # → data/leads/immoready-pilot-<datum>.json
npm run research:studio                                 # → data/leads/readystudio-pilot-<datum>.json
node scripts/import-leads.js immoready  data/leads/immoready-pilot-<datum>.json
node scripts/import-leads.js readystudio data/leads/readystudio-pilot-<datum>.json
npm start                                               # Freigaben prüfen
```

## Ergebnisse der Piloten
Siehe `IMPLEMENTATION-STATUS.md` (Abschnitt «Piloten»). Dort stehen die tatsächlichen Zahlen dieses Laufs.
