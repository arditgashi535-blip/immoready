# Testbericht V17 «Final Production Candidate»

Stand: 9. Oktober 2026 · Branch `v17-final-realism` · Ausgangsstand V16: Tag `v16-stand`, zusätzlich gesichert als Archiv
(`immoready-v16-stand.zip`) und Einzeldatei (`immoready-vorschau-v16-ausgang.html`) ausserhalb des Repos.

Grundlage: die Aufträge «V17 – Final Realism, Schweizer Architektur und Mobile Polish» und «V17 Final Production
Candidate». Die Szene bleibt eine **illustrative Visualisierung, kein Referenzobjekt**; Masse sind Planungsmasse, keine
vermessenen Daten. In Wix wurde nichts verändert, nichts veröffentlicht, keine Domain angefasst.

## 1. Ausgangslage V16 – in den Abnahmebildern festgestellt

| # | Befund V16 | Bild |
|---|---|---|
| 1 | Hintergrundhäuser als graue Blöcke mit wenigen Fenstern, leere Strasse | 01 |
| 2 | Fassade zu glatt, keine Alterungsspuren; Geländer auf der Platte statt an der Stirn | 02 |
| 3 | Bäume als Stamm mit Kugelkrone, Hecken mit gerader Oberkante | 01, 05 |
| 4 | Bad: Plattenfugen aus der Textur (unscharf, ungleich, nicht an den Raumecken), dunkle Flecken, gelbbeiger Schleier | 11 |
| 5 | WC: Deckel und Brille als gleich geformte flache Scheiben, Körper eiförmig | 12 |
| 6 | Waschtisch scheinbar schwebend mit offenem Siphon; Armatur kurz | 11, 14 |
| 7 | Smartphone: Kontaktleiste verdeckt die Hauptüberschrift, sechs gequetschte Stationsknöpfe, Logo klein | 17 |
| 8 | Smartphone-Formular lang, «Immobilien-präsentation» eng, Einmalig/Regelmässig als grosse Karten | 20 |
| 9 | Bad-Beschriftung als Text im Dokument; bei Stationssprüngen schon während der Fahrt sichtbar | – |

## 2. Umsetzung (Originalquellen; `rise.json`, Schema, Tests und Dokumentation gemeinsam)

| Bereich | V17 |
|---|---|
| Bad | Plattenfugen je Pixel ab der Raumecke (Wand 60×30, Boden 60×60, Fugen laufen in den Ecken zusammen), Plattenton ±1,5 %, weisse Wandplatten, Boden anthrazit, neutralwarmes Licht, Silikonfugen an Boden, Wanne, Waschtisch und Vorwand; Vorwand 1,20 m = 4 Plattenreihen |
| WC | konischer Körper mit zur Wand abfallender Unterseite, tiefe asymmetrische Schüssel mit Wasserfläche und Geruchsverschluss, Brille 21 mm mit gerundetem Querschnitt auf Puffern, gewölbter Deckel mit Schürze (94° geöffnet), zwei Scharniere mit Gelenkstücken, Betätigungsplatte 246 × 164 mm mit zwei Tasten, Papierhalter mit Rosette und Arm, WC-Bürste |
| Waschtisch | Möbelwaschtisch mit gerader Rückseite und Silikonfuge, Becken 13,6 cm tief, Ablaufventil, Überlauf mit Blende; wandhängender Unterschrank (Sand matt, Schattenfuge, Griffmulde, 38 cm Bodenfreiheit), Siphon und Eckventile verdeckt; Armatur mit separatem Hebel und 17 cm Ausladung |
| Beschriftung | «Armatur · Ablaufventil · Siphon und Eckventile im Unterschrank» nur als Attribut an den Markierungen, «Schematische Kennzeichnung» direkt darunter; sichtbar erst, wenn die Kamera im Bad ist |
| Quartier | 12 Nachbarhäuser mit Fensterachsen ringsum, Fensterbänken, Storen, wenigen hellen Fenstern, Balkonen, Flach- oder Satteldach; Ring-Häuser im Dunst; Parkfelder blaue Zone, zwei neutrale Autos ohne Marke und mit leerem Schild, Signal «Zone 30» |
| Fassade | Schmutzfahnen unter Fensterbänken und Notüberläufen, leichter Grauschleier unter der Attika, dunkle Anschlussfuge Laibung/Rahmen; Balkongeländer stirnseitig mit Konsolen, Fuge des Wärmedämmelements, unterschiedliche Möblierung |
| Pflanzen | Bäume mit Wurzelanlauf, Haupt- und Nebenästen, mehreren Kronenteilen; Hecken mit unregelmässiger Oberkante; Stämme bewegen sich nicht |
| Eingang/Treppenhaus | Rippenstruktur der Sauberlaufmatte, Gleitschutzstreifen an den Stufen, Fuge Stufe/Wand, Fussmatte vor der Wohnungstür |
| Wohnung/Küche | unterbautes Becken mit Ausschnitt in der Arbeitsplatte, Griffleisten (grifflos), zurückgesetzter Sockel, Sensortasten; neue Stühle (Sitz 45 cm), Schale, Kräutertopf |
| Licht | Lichtdaten nach jeder Geometrieänderung neu gerechnet, Umgebungsverdeckung geglättet (keine Fächer- und Fleckenmuster), innen 16 Leuchtenproben; Prüfsumme passt zur Endgeometrie |
| Smartphone | Kontaktleiste 57 px + Safe Area, Platz unten reserviert, bei Tastatur ausgeblendet (Fokus und `visualViewport`); Logo 104 px (360: 96, 430: 112) bei flacherem Kopf; Stationsleiste waagrecht scrollbar mit Einrasten, aktive Station mittig; Bild 10:9; Hero-Titel in zwei Zeilen; robust bei 200 % Schrift |
| Formular | Formular vor den Kontaktangaben, Leistungskarten mit em-Spaltenbreite (360: 1 Spalte, 390/430: 2 Spalten, grosse Schrift: 1 Spalte), Trennung nur am weichen Trennstrich, «Einmalig / Regelmässig» als Segmentwahl, kompakter Demo-Hinweis |
| Leistung | Sichtkegel-Auswahl statischer Blöcke, ferne Bäume vereinfacht, ferne Häuser ohne Fensterbänke, Fugen im Shader ohne Verzweigung |
| Produktionsform | `dist/site/` (HTML, CSS, JS, Assets getrennt, keine Base64-Blöcke); die Einzeldatei bleibt die Vorschau |

## 3. In dieser Sitzung ausgeführte Tests (am finalen Stand nacheinander)

Umgebung: Linux-Container, 2 vCPU, Chromium 141 headless, WebGL über **SwiftShader** (Software-GPU).

| Suite | Inhalt | Ergebnis |
|---|---|---|
| `tests/test_rise.py` | Schema, Prüfregeln, gebaute Seite = rise.json, Stationsbilder | 21/21 |
| `tests/t15-velo.js` | Wix-Adapter (Velo) | 10/10 |
| `tests/t7.js` | Seiten, Navigation, Formular (Demo), Layout 390/820/1440 | 68/68 |
| `tests/t9.js` | Interaktionen | 18/18 |
| `tests/t11.js` | Route, Stationen, Türen, Overlay, Ruhezustand, Wind, Fallbacks, Smartphone | 37/37 |
| `tests/t12.js` | iFrame-Nachrichten | 14/14 |
| `tests/t13-component.js` | Web Component (`tour-ready` Version 17, Mehrfachinstanz, Entfernen/Einfügen) | 24/24 |
| `tests/t14-v13.js` | Scan, Route 4000 Punkte, Drehung, Bildwinkel, Türdurchfahrt, Auswahl, Kontakt | 28/28 |
| `tests/t16-v14.js` | Texturen, Licht, Wandstärke, Belichtung, Ersatzwege | 19/19 |
| `tests/t17-v15.js` | Nahebene, Spiegel, Türlicht, Leistungspunkte, Flackern, Raumzuordnung, Ressourcen | 18/18 |
| `tests/t18-v16.js` | Kopfhöhe, Schrittmass, WC-Schüssel offen und tief, Türbreiten, Fenster ringsum, Ansichtswahl, Smartphone | 17/17 |
| `tests/t19-v17.js` | **neu:** Smartphone 360/390/393/430 (kein seitliches Scrollen, Kontaktleiste ≤ 60 px, Bedienelemente ≥ 44 px, Hero-Titel nicht verdeckt, Platz unten reserviert, Fusszeile frei, Tastatur blendet Leiste aus, Stationsleiste scrollbar und aktive Station ganz sichtbar, Original-Logo vollständig und unverzerrt, Hero-CTA über der Leiste klickbar), Formular 360/390 bis zum Absenden (Karten 1-/2-spaltig ohne Überlauf, ganze Fläche wählbar, Segmentwahl, Demo-Hinweis statt Erfolgsmeldung), Menü (Knopf, Escape, Link, Hintergrund gesperrt), 200 % Schrift auf 4 Seiten, Querformat 844×390, Desktop 1024/1280/1440/1920 und 200 % Zoom auf je 9 Seiten, keine doppelten IDs, Alttexte, eine sichtbare h1, Bad-Beschriftung nur an den Markierungen und erst im Bad, Lichtdaten passen (Prüfsumme), Geometrie ≤ +25 %, Produktionsform über HTTP, 16 neue Stationsbilder ≠ V16, Hochformat 960×864 | 82/82 |

**Summe: 356 Prüfungen in 12 Suiten, alle bestanden** (die 274 Prüfungen aus V16 und 82 neue; am finalen Stand nacheinander
ausgeführt, Lauf 22:29–22:44 Uhr).

Testanpassungen (begründet, bewusst geänderte Anforderungen):
- `t13`: `tour-ready.version` «17»; Text zur Bildgrösse 960×864.
- `t14`: Hochformatbild 960×864 statt 960×1080; Beschriftung im Bad als `data-l` statt Text (Prüfung jetzt: Attribut
  vorhanden, kein Textknoten); auf dem Smartphone endet der sichtbare Bereich an der festen Kontaktleiste – ein Knopf,
  dessen Mitte hinter oder unter der Leiste liegt, zählt wie ein Knopf unter dem Bildrand (die Seite reserviert unten
  Platz; `t19` prüft zusätzlich, dass sich der Hero-Knopf ganz über die Leiste scrollen lässt und dort frei klickbar ist).

## 4. Kamera und Ruhezustand (gemessen)

Unverändert gegenüber V16 (Route, Türen, Stützpunkte): Wandkontakte 0, Nahebene frei (t14, t17, t18), keine
Türdurchfahrt vor der Öffnung (t11, t14), Ruhezustand ohne Dauerschleife (t11, t17). Neu: Bad-Beschriftung folgt der
tatsächlichen Kameraposition.

## 5. Leistung (Testumgebung, keine Zusage für echte Geräte)

Lokaler HTTP-Server ohne Kompression, Netzwerk und CPU gedrosselt (`npm run perf`). Bildzeiten mit
`node tests/bench-frames.js` (V16 aus der Sicherung und V17 in derselben Sitzung, Software-Shader, Software-GPU).

| Grösse | V16 | V17 Vorschau (eine Datei) | V17 Produktionsform `dist/site/` |
|---|---|---|---|
| Umfang | 3,41 MB · gzip ≈ 2,34 MB | 3,44 MB · gzip ≈ 2,35 MB | HTML 52 KB + CSS 136 KB + JS 331 KB, Assets getrennt (gesamt 2,8 MB) |
| Desktop 1440, 20 Mbit/s: FCP / LCP | 768–1072 / 1072–1204 ms | 720–936 / 720–936 ms | 372–408 / 960–1004 ms |
| Desktop: Ladeende / Rundgang bereit | 1,68–1,69 s / 3,78–3,90 s | 1,65–1,70 s / 3,29–4,03 s | 0,96–1,00 s / 2,81–2,97 s |
| Desktop: übertragen | 3,44 MB | 3,47 MB | 2,63 MB |
| Smartphone 390, 9 Mbit/s, CPU ×4: FCP / Ladeende | 588–628 ms / 3,53–3,58 s | 508–656 ms / 3,46–3,60 s | 636–968 ms / 2,03–2,11 s |
| Smartphone: Layoutverschiebung (CLS) | 0,066 | 0,000 (nach Korrektur; vorher 0,087–0,158) | 0,000 |
| Smartphone: übertragen | 3,44 MB | 3,46 MB | 1,67 MB (ohne Texturen und Lichtdaten) |
| Szene | 361 344 Eckpunkte | 407 184 Eckpunkte (+12,7 %), Sichtkegel-Auswahl: BLD 131, INT 26, ENV 44 Blöcke | wie Vorschau |
| Bildzeit 1440×900, volle Auflösung (5 Stationen) | 1,19 / 1,47 / 1,68 / 1,28 / 1,64 s | 1,48 / 1,52 / 1,76 / 1,40 / 1,68 s | – |
| Bildzeit bei Auflösung 0,5 | 0,55 / 0,62 / 0,63 / 0,54 / 0,60 s | 0,63 / 0,64 / 0,63 / 0,51 / 0,68 s | – |

Einordnung: Quartier, Autos, Fassadendetails, WC und Waschtisch kosten in der Software-GPU je nach Ansicht 0–25 % mehr
Bildzeit (am meisten in der Gesamtansicht, in der fast alles im Bild ist). Ohne Sichtkegel-Auswahl, Vereinfachung der
fernen Bäume und Häuser sowie verzweigungsfreie Fugen lag der Mehraufwand höher (Zwischenmessung +15–29 %).
Smartphones laden weiterhin nur Stationsbilder. Auf echten Grafikkarten wurde **nicht** gemessen; dort bleibt eine
Messung Pflicht. Die Produktionsform lädt CSS, Skript, Fotos, Texturen und Lichtdaten als eigene Dateien (zwischen-
speicherbar); die Einzeldatei bleibt nur die Vorschau.

## 6. Bilder (`docs/v17/`)

- `abnahme-22-bilder.jpg` und `abnahme/01…22` – die 22 verlangten Abnahmebilder: 1–16 aus der laufenden V17-Szene mit
  festen Kameras (1440×900, Bühne ohne Oberfläche), 17–22 echte Smartphone-Screenshots 390×844.
- `vorher-nachher-v16-v17-aussen.jpg`, `vorher-nachher-v16-v17-innen.jpg` – 21 Kameras, links V16 (Tag `v16-stand`),
  rechts V17, identische Kamerapositionen.
- Stationsbilder: 16 Dateien in `assets/tour/` neu aus der V17-Szene (Prüfung: keine Datei gleicht dem V16-Stand).

## 7. Offen – nicht geprüft bzw. nicht möglich

- Echte Geräte und GPUs (Safari, iPhone, Android, Tablet, schwächeres Notebook) – Bildraten dort unbekannt.
- Wix-Einbau und Live-Test (vorbereitet, nicht ausgeführt – Freigabe nötig); Hosting-Adresse der Assets offen.
- Formularversand an Wix Forms (bleibt Demo); Impressumsangaben (Adresse, Rechtsform, UID) weiterhin offen markiert.
- Bildschirmleser-Test mit echter Hilfstechnik (geprüft wurden Struktur, Alttexte, IDs, Tastatur und Fokus automatisiert).
- Baurechtliche Details (SIA, Brandschutz) sind nur sichtbar plausibel dargestellt, nicht geprüft.
