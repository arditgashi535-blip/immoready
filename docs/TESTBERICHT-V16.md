# Testbericht V16 «authentisches Schweizer Mehrfamilienhaus»

Stand: 9. Oktober 2026 · Branch `v16-schweizer-mfh` · Ausgangsstand V15: Tag `v15-stand`, zusätzlich gesichert als
Archiv (`immoready-v15-stand.zip`) und Einzeldatei (`immoready-vorschau-v15-ausgang.html`) ausserhalb des Repos.

Grundlage: der verbindliche Masterprompt «Authentisches Schweizer Mehrfamilienhaus». Die Szene bleibt eine
**illustrative Visualisierung, kein Referenzobjekt**. Masse sind Planungsmasse zur Modellierung, keine vermessenen Daten
eines realen Gebäudes. Hausnummer «12», Namensschilder und Briefkastenschilder sind neutral bzw. unlesbar – keine
realen Personen oder Adressen. In Wix wurde nichts verändert, nichts veröffentlicht.

## 1. Ausgangslage (V15) – im Bild und im Code festgestellt

Prüfansichten mit festen Kameras (`tools/kameras-vergleich.json → abnahme`: 9 Abnahme- und 4 Prüfansichten), dazu
Messungen an der Geometrie.

| # | Befund V15 | Wie festgestellt |
|---|---|---|
| 1 | Rück- und linke Fassade ohne ein einziges Fenster (dekorierte Vorderwand) | Code (`holed(BACK/LEFT, …, [])`), Prüfansicht |
| 2 | WC aus Ellipsoiden ohne Schüsselöffnung, Brille als flache Scheibe | Nahaufnahme WC |
| 3 | Treppe: Decke über den Stufen 4–6, Kopfhöhe nur 1,54–1,9 m; rechteckige Wange mit hängenden Stäben | Messung (Stufenhöhe vs. Decke), Ansicht Treppenhaus |
| 4 | Rollläden als aufgemalte Streifen ohne Tiefe | Fassadenansicht |
| 5 | Holz-Haustür ohne Bänder und Schliesser, Klingeltableau ohne Briefkästen, leeres Hausnummernschild | Eingangsansicht |
| 6 | Wohnungstür mit 1,06 m lichter Breite; Bad ohne Türblatt und Zarge | Messung, Grundriss |
| 7 | Dach grau, grosser Aufbau nicht über Treppe/Lift | Dachansicht |
| 8 | Flur mit Parkett, kein Backofen, keine Steckdosen/Schalter, keine Velos | Innen-/Gartenansichten |

## 2. Umsetzung (Originalquellen, vorhandener Build, `rise.json` + Schema konsistent)

| Bereich | V16 |
|---|---|
| Geometrie Fassade | Rückfassade 6 Fensterachsen je Geschoss, Fenstertüren mit französischem Balkon, linke Fassade 3 Achsen; Lamellenstoren als einzelne Lamellen (80 mm, Abstand 72 mm, Neigung und Behanghöhe variiert), Endschiene im Sturz bei hochgezogenen Storen; Fallrohre an vier Ecken; Kiesstreifen rundum |
| Dach | extensive Begrünung (Sedum) mit Kiesrand, Dachwassereinläufe, Liftüberfahrt und Dachausstieg über dem Kern |
| Eingang | Alu-Glastür anthrazit (Bänder, Obentürschliesser, Stossgriff, Drücker), Briefkasten- und Sonnerieanlage (8 Kästen, Einwurfklappen, Schlösser, neutrale Schilder, Gegensprechanlage, Klingeltaster), Hausnummer als blaues Emailschild, Sauberlaufzone |
| Treppenhaus | Treppenauge über dem ganzen Lauf (Kopfhöhe ≥ 2,05 m gemessen), Schacht mit Untersicht des nächsten Laufs, verputzte Brüstung parallel zum Lauf mit Eichenhandlauf, Lift mit Chromstahltüren, Ruftaster und Anzeige, Etagenschild «EG», Lichttaster |
| Wohnung | Wohnungstür 0,94 m (lichte Breite 0,91 m) mit Umfassungszarge, Türspion, Bändern, Namensschild und Klingel; Plattenboden im Eingangsbereich; Steckdosen Typ 13 und Schalter; Backofen unter dem Kochfeld |
| Bad | Vorwandinstallation mit Steinablage (Pflanze, Handtuch), wandhängendes WC (Schüssel mit Wasserfläche, separate Brille, hochgeklappter Deckel, Scharniere, bündig an der Vorwand), Betätigungsplatte, Papierhalter an der Vorwand, Überlauf im Waschtisch, Duschablage, Badtür 0,82 m mit Zarge und Bändern |
| Aussenraum | Veloabstellplatz mit drei Anlehnbügeln und zwei Velos, Aussenwasserhahn, Asphalt als eigenes Material (matt, körnig) |
| Materialien | Asphalt (neu, Rauheit 0,9), Keramik leicht abgetönt (Form statt weisser Fläche), Lamellen lackiertes Aluminium, Sedum, Chromstahl geschliffen (Lift) |
| Licht | Lichtdaten nach jeder Geometrieänderung neu gerechnet (`npm run bake`, Prüfsumme), zuletzt am Endstand; Treppenauge als Teil der Halle beleuchtet; Fenster teils neutralweiss, teils mit Zimmerpflanze |
| Kamera | Station «Bad» zeigt WC und Waschtisch gemeinsam (Halt 0,73), danach Nahansichten Waschtisch (0,752) und WC (0,772), Ausfahrt durch die Badtür; zusätzlicher Stützpunkt in der Tür |
| Smartphone | Schaltflächen «Übersicht · Waschtisch · WC» (3D: Kamerafahrt, Bildmodus: Detailbild); zwei neue Detailbilder quer und hoch; Hochformat Bad mit WC und Waschtisch; alle 16 Bilder aus der V16-Szene neu gerendert |
| Fehlerbehebung | Belichtungsanpassung zeitbasiert (lief bei langsamen Bildern rund 20 Bilder nach – Dauerschleife im Ruhezustand), Leistungspunkt «Hauswartung» an den Lift verlegt (lag unter der Textkarte) |

## 3. In dieser Sitzung ausgeführte Tests

Umgebung: Linux-Container, 2 vCPU, Chromium 141 headless, WebGL über **SwiftShader** (Software-GPU).

| Suite | Inhalt | Ergebnis |
|---|---|---|
| `tests/test_rise.py` | Schema (neu: `details`), Prüfregeln, gebaute Seite = rise.json, Stationsbilder | 21/21 |
| `tests/t15-velo.js` | Wix-Adapter (Velo) | 10/10 |
| `tests/t7.js` | Seiten, Navigation, Formular (Demo), Layout 390/820/1440 | 68/68 |
| `tests/t9.js` | Interaktionen | 18/18 |
| `tests/t11.js` | Route, Stationen, Türen, Overlay, Ruhezustand, Wind, Fallbacks, Smartphone | 37/37 |
| `tests/t12.js` | iFrame-Nachrichten | 14/14 |
| `tests/t13-component.js` | Web Component (`tour-ready` Version 16, Bad-Station 0,73) | 24/24 |
| `tests/t14-v13.js` | Scan, Route 4000 Punkte, Drehung, Bildwinkel, Türdurchfahrt, Auswahl, Kontakt | 28/28 |
| `tests/t16-v14.js` | Texturen, Licht, Wandstärke, Belichtung, Ersatzwege | 19/19 |
| `tests/t17-v15.js` | Nahebene, Spiegel, Türlicht, Leistungspunkte, Flackern, Raumzuordnung, Ressourcen | 18/18 |
| `tests/t18-v16.js` | **neu:** Kopfhöhe über allen Stufen (Strahl durch die Dreiecke), Schrittmass, WC-Schüssel offen und tief, Sitzhöhe, lichte Türbreiten, Fenster ringsum, Ansichtswahl im Bad (3D), Nahebene mit Nahansichten, Smartphone 360/390/430 | 17/17 |

**Summe: 274 Prüfungen in 11 Suiten, alle bestanden (am finalen Stand nacheinander ausgeführt).**

Testanpassungen (begründet): Version 16; Bad-Halt 0,73 statt 0,765 (t13, t17, RISE-Test liest den Wert jetzt aus
rise.json).

## 4. Kamera (gemessen)

| Grösse | V15 | V16 |
|---|---|---|
| Wandkontakte des Kameramittelpunkts (2000 Punkte) | 0 | 0 |
| Nahebene gegen Wände, Möbel, Türflügel | 0 Treffer, ≥ 0,19 m | 0 Treffer, ≥ 0,24 m |
| Grösste Drehung der Blickrichtung | 23,5° je 1 % | 24,4° je 1 % (p 0,722, Eintritt ins Bad) |
| Grösster vertikaler Bildwinkel | 51,6° | 53,9° (Bad-Übersicht) |

## 5. Laden und Bildzeiten (Testumgebung, keine Zusage für echte Geräte)

Lokaler HTTP-Server ohne Kompression, Netzwerk und CPU gedrosselt (`npm run perf`), drei Läufe, Spannweite. Bildzeiten
V15 und V16 in derselben Sitzung gemessen (`bench`, Software-Shader, Software-GPU).

| Grösse | V15 | V16 |
|---|---|---|
| Seite (eine Datei) | 3,13 MB · gzip ≈ 2,15 MB | 3,41 MB · gzip ≈ 2,34 MB (mehr Lichtdaten, 4 Detailbilder) |
| Desktop 1440, 20 Mbit/s: FCP / LCP | 956–1088 ms | 1040–1228 ms / 1040–1580 ms |
| Desktop: Ladeende / Rundgang bereit | 1,52–1,62 s / 3,63–3,95 s | 1,65–1,77 s / 3,81–4,48 s |
| Desktop CLS | 0,0005–0,0097 | 0,0005 |
| Smartphone 390, 9 Mbit/s, CPU ×4: FCP / Ladeende | 564–692 ms / 3,15–3,37 s | 584–648 ms / 3,48–3,53 s |
| Szene | 265 860 Eckpunkte, 56 Fenster mit Raumtiefe | 361 344 Eckpunkte, 128 Fenster mit Raumtiefe, 30 Leuchten |
| Aufbau beim Start | ≈220–262 ms + ≈110–133 ms Licht | ≈302–336 ms + ≈135–174 ms Licht |
| Bildzeit 1440×900, volle Auflösung | 1,10–1,57 s | 1,23–1,70 s |
| Bildzeit bei Auflösung 0,5 | 0,43–0,48 s | 0,51–0,67 s |

Die zusätzliche Geometrie (Rückfassade, Lamellen, Velos, WC, Lift) kostet in der Software-GPU rund 10–30 % Bildzeit.
Smartphones laden weiterhin nur die Stationsbilder (keine Texturen, keine Lichtdaten). Auf echten Grafikkarten wurde
**nicht** gemessen; dort bleibt eine Messung Pflicht.

## 6. Bilder (`docs/v16/`)

- `abnahme-12-bilder.jpg` und `abnahme/01…12` – die zwölf verlangten Abnahmebilder: 1–9 aus der laufenden Szene mit festen
  Kameras (1440×900, Bühne ohne Oberfläche), 10–12 echte Smartphone-Screenshots 390 px (Gebäude, Bad, Anfrageformular).
- `vorher-nachher-v15-v16.jpg` – dieselben 9 Kameras plus 4 Prüfansichten (Rückseite, Seite, Treppe, Dach), V15 | V16.

## 7. Offen – nicht geprüft

- Echte Geräte und GPUs (Safari, iPhone, Android, Tablet, schwächeres Notebook) – Bildraten dort unbekannt.
- Baurechtliche Details (Brandschutz, SIA-Normen) sind nur sichtbar plausibel dargestellt, nicht geprüft oder zertifiziert.
- Die Briefkasten- und Klingelschilder sind bewusst unbeschriftet; die Hausnummer ist frei gewählt.
- Lamellen und Velos erhöhen die Geometrie; auf schwachen Geräten weiter beobachten.
- Wix-Einbau, Formularversand (Demo), Bildschirmleser-Test.
