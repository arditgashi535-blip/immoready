# Testbericht V15 «glaubwürdige Architekturvisualisierung»

Stand: 9. Oktober 2026 · Branch `v15-architekturaufnahme` · Ausgangsstand V14: Tag `v14-stand` (Commit 6010e38),
zusätzlich gesichert als Archiv und als Einzeldatei ausserhalb des Repos (`immoready-v14-stand.zip`,
`immoready-vorschau-v14-ausgang.html`).

Die Szene ist eine **illustrative Visualisierung, kein Referenzobjekt** («Illustrative Visualisierung · kein
Referenzobjekt» im Bild, in allen Alternativtexten). In Wix wurde nichts verändert, nichts veröffentlicht, keine
Domain-Einstellung angefasst. Das Logo ist unverändert (Originaldatei, keine Neugenerierung, kein Filter).

## 1. Ausgangslage: beobachtet vs. vermutet

Grundlage sind Renderings der V14-Datei mit **festen Kameras** (`tools/kameras-vergleich.json`: sechs Hauptansichten
an den Stationskameras, sechs Nahansichten), nicht Annahmen aus dem Code.

| # | Tatsächlich im Bild beobachtet (V14) | Technische Ursache (geprüft) |
|---|---|---|
| 1 | Spiegelschrank als flache graue Fläche, Armatur dunkelgrau-matt, Keramik ohne Glanz | Licht und Glanz nur je Eckpunkt; keine Spiegelung, keine Umgebungsreflexion im Raum |
| 2 | Bad: fleckige, schmutzig wirkende Wandplatten; Halle flach überhell | nichtlinearer Farbraum (Licht auf sRGB-Werten gerechnet), Tonkurve doppelt wirksam, zu hohe Grundaufhellung |
| 3 | Kochfeld leuchtet blau | Glas-Shader spiegelt auch im Innenraum den Himmel |
| 4 | Gerade, harte Horizontkante; milchiger Dunst | Dunst je Eckpunkt über 350-m-Bodendreiecke interpoliert; Himmel unter dem Horizont nicht stetig |
| 5 | Nahansichten: Armatur als einfaches Rohr, leere weisse Aushänge, Zimmerpflanze aus Laub-Kugeln, frei schwebende Lichtlinie | zu grobe bzw. fehlende Modellierung für die Kameranähe |

Erst während V15 sichtbar geworden und behoben: senkrechte Streifen in Fenstern mit Raumtiefe (Ursache: Zufallswert aus
einem interpolierten «konstanten» Attribut – Rundung auf ganze Fenster-Nummern), facettierter Auslauf (Rohrstücke mit
Kugelgelenken → Bézierrohr), goldener Chrom (Reflex mit Lichtfarbe getönt → F0 aus der Grundfarbe), Rückkopplungsfehler
beim Spiegel (Spiegeltextur kurzzeitig auf Einheit 0 gebunden).

Nicht bestätigt und deshalb nicht «repariert»: Lichtdurchtritt durch Wände (die Raumzuordnung der Wandseiten ist
korrekt, siehe Test), angeschnittene Wände durch die Nahebene (geprüft, kein Treffer).

## 2. Umsetzung (Originalquellen, vorhandener Build, `rise.json` + Schema konsistent)

Kein Komplettumbau: Der eigene WebGL-Renderer wurde gezielt erweitert. Eine Migration auf Three.js war in dieser
Umgebung nicht möglich (am 9.10.2026 geprüft: npm-Registry Zeitüberschreitung, cdnjs/jsDelivr/unpkg vom Proxy mit 403
abgelehnt, Three.js lokal nicht vorhanden); die alte Begründung in CLAUDE.md wurde durch diese Prüfung ersetzt.

| Bereich | V15 |
|---|---|
| Farbraum, Tonkurve | Farben beim Aufbau sRGB → linear, Licht linear, Ausgabe einmal über ACES-Näherung + Gamma; Farb- vs. Datentexturen getrennt behandelt |
| Material je Pixel | Rauheit, F0, Metall, Relief je Material (LUT); Glanz und Fresnel im Fragment-Shader; Relief nur im Nahbereich; Metall-Reflexion mit der Grundfarbe (Chrom neutral, Alu matt) |
| Reflexionen | Reflexionsaufnahmen je Raum (Würfeltextur, box-projiziert, einmal aufgenommen); **Badspiegel als echte planare Spiegelung** (halbe Auflösung, nur wenn sichtbar); aussen Himmel |
| Licht | Badleuchten ≈ +25 %, Halle ≈ −20 %; Türlicht doppelt gebacken (zu/offen), Türflügel verschatten nicht falsch; nach jeder Geometrieänderung neu gebacken (Prüfsumme) |
| Aussen | warmer Horizont, kühler Himmel, Dunst je Pixel, ferner Hügelzug statt gerader Kante; Vordach-Blech nicht mehr blau |
| Sanitär | Becken mit Mulde und sichtbarem Ablauf (Chromkappe), 72 Segmente; Einhebelmischer mit Rosette, Körper, Hebel auf Nabe, Bézier-Auslauf (21 Ringe × 28 Segmente), Strahlregler; Eckventile mit Schläuchen, Flaschensiphon; Spiegelschrank mit Lichtleiste; Seifenspender, Papierhalter; Platten 60×30 / 60×60 mit feinen Fugen |
| Nahansichten | Aushänge mit Textzeilen und Nadeln, Leuchtband im Alu-Profil, Zimmerpflanzen aus modellierten Blättern, Kochfeld als Glaskeramik mit Kochzonen |
| Architektur (schon V14, geprüft) | 4 Geschosse à 3,00 m, Aussenwand 38 cm, Laibungen, Fensterbänke, Dichtungen, Balkonplatten mit Tropfkante, Stützen mit Fussplatten, Fallrohre mit Schellen, Schwellen |
| Garten | unregelmässige Pflanzungen statt Raster, Erdtöne natürlicher, Alpha-zu-Abdeckung gegen flackernde Blattkanten, Wind an den Spitzen stärker |
| Kamera | zusätzlicher Stützpunkt im Wohnraum, ruhigere Wendung nach dem Bad: grösste Drehung 26,7° → 23,5° je 1 % Fortschritt |
| Effekte | Leistungspunkte im 3D-Bild (Gartenunterhalt, Hauswartung, Reinigung, Sanitär): zwei ruhige Impulse, danach still; Hover/Druck spürbar; nie über Text/Navigation; gleiche Offertanfrage wie die CTA |
| Software-Grafik | vereinfachter Material-Shader (ohne Relief/Reflexionsaufnahme, Dunst je Eckpunkt), Start mit 50 % Auflösung |
| Ersatzbilder | alle 12 Stationsbilder (quer und hoch) aus der neuen Szene neu gerendert – Desktop und Smartphone zeigen dieselbe Szene |

Texturen bleiben prozedural (eigene Werke, `tools/make-textures.py`); keine lizenzpflichtigen Scans verwendet.

## 3. In dieser Sitzung ausgeführte Tests

Umgebung: Linux-Container, 2 vCPU, Chromium 141 headless, WebGL über **SwiftShader** (Software-GPU).

| Suite | Inhalt | Ergebnis |
|---|---|---|
| `tests/test_rise.py` | Schema (neu: `hotspots`), Prüfregeln, gebaute Seite = rise.json, 12 Stationsbilder | 21/21 |
| `tests/t15-velo.js` | Wix-Adapter (Velo) mit gültigen und manipulierten Ereignissen | 10/10 |
| `tests/t7.js` | Seiten, Navigation, Formular (Demo), Layout 390/820/1440 | 68/68 |
| `tests/t9.js` | Interaktionen, kein Magnet-Effekt, kein eigener Cursor | 18/18 |
| `tests/t11.js` | Route, Stationen vorwärts/rückwärts, Türen, Overlay, Wind, Fallbacks, Smartphone | 37/37 |
| `tests/t12.js` | iFrame-Nachrichten | 14/14 |
| `tests/t13-component.js` | Web Component (zwei Instanzen, `tour-ready` Version 15, Aufräumen, Kontextverlust, ohne WebGL) | 24/24 |
| `tests/t14-v13.js` | Scan, Route 4000 Punkte, Drehgeschwindigkeit, Bildwinkel, Türdurchfahrt, Auswahl, Kontakt | 28/28 |
| `tests/t16-v14.js` | Texturen, Licht, Wandstärke, Belichtung, keine ausgebrannten Flächen, «Bewegung reduzieren», Ersatzwege | 19/19 |
| `tests/t17-v15.js` | **neu:** Nahebene gegen Wände/Türflügel (3001 Punkte), Reflexionsaufnahme, Spiegel nur im Bad, Türlicht, Leistungspunkte (Sichtbarkeit, Trefferfläche ≥ 44 px, frei klickbar, Ereignis + Vorauswahl), ruhige Kamera ohne Flackern, Raumzuordnung (kein Licht durch Wände), 8 schnelle Stationssprünge, GPU-Ressourcen beim Entfernen, keine WebGL-Fehler | 18/18 |

**Summe: 257 Prüfungen in 10 Suiten, alle bestanden (am finalen Stand nacheinander ausgeführt).**

Testanpassungen (begründet): Version 15 statt 14 (t13). Vier Prüfungen in t7, t11 und t14 warteten feste Zeiten
(400–1500 ms) – mit dem schwereren Pixel-Shader liefert die Software-GPU Bilder langsamer, CSS-Übergänge und die
Scroll-Auswertung laufen später. Sie warten jetzt auf den Endzustand (Bedingung mit Zeitlimit), die geprüfte Aussage
ist unverändert.

## 4. Kamera und Nahebene (gemessen)

| Grösse | V14 | V15 |
|---|---|---|
| Wandkontakte des Kameramittelpunkts (Abstand ≥ 12 cm, 2000 Punkte) | 0 | 0 |
| Nahebene (Ecken + Kantenmitten) gegen Wände, Möbel, bewegte Türflügel | nicht geprüft | 0 Treffer, kleinster Abstand 0,19 m (p 0,812, Badtür-Laibung) |
| Grösste Drehung der Blickrichtung | 26,7° je 1 % (p 0,844) | 23,5° je 1 % (p 0,630) |
| Grösster vertikaler Bildwinkel | 51,6° | 51,6° |
| Türdurchfahrten | Haustür 100°, Wohnungstür −92°, Terrasse 1,0 m | unverändert |

Die ganze Fahrt wurde zusätzlich als Kontaktbogen mit 48 Bildern visuell durchgesehen.

## 5. Laden und Bildzeiten (Testumgebung, keine Zusage für echte Geräte)

Lokaler HTTP-Server ohne Kompression, Netzwerk und CPU gedrosselt (`npm run perf`), drei Läufe, Spannweite.

| Grösse | V14 | V15 |
|---|---|---|
| Seite (eine Datei) | 3,08 MB · gzip ≈ 2,12 MB | 3,13 MB · gzip ≈ 2,15 MB |
| Desktop 1440, 20 Mbit/s: FCP = LCP | 652–1308 ms | 956–1088 ms |
| Desktop: Ladeende / Rundgang bereit | 1,50–1,63 s / 3,6–4,0 s | 1,52–1,62 s / 3,63–3,95 s |
| Desktop CLS | 0,0005 | 0,0005–0,0097 |
| Smartphone 390, 9 Mbit/s, CPU ×4: FCP / Ladeende | 540–700 ms / 3,24–3,31 s | 564–692 ms / 3,15–3,37 s |
| Szene | 215 994 Eckpunkte, 30 Leuchten | 265 860 Eckpunkte (davon 21 600 Laub), 30 Leuchten, 56 Fenster mit Raumtiefe, 9 Glasflächen |
| Aufbau beim Start | ≈170–205 ms + ≈95–120 ms Licht | ≈220–262 ms + ≈110–133 ms Licht |
| Bildzeit 1440×900, SwiftShader, volle Auflösung | 658–760 ms | Software-Shader 1,19–1,77 s · volle Qualität (nur Bildproduktion) 1,94–3,22 s |
| Bildzeit bei Auflösung 0,5 | 256–313 ms | Software-Shader 0,51–0,61 s · volle Qualität 0,75–0,78 s |

Engpass gemessen: Mit einem leeren Material-Shader sinkt die Bildzeit auf 0,39–0,52 s – der Pixel-Shader trägt rund
70 % der Last. Optimiert: Software-Shader ohne Relief und Reflexionsaufnahme, Dunst je Eckpunkt, kein Glanz auf sehr
rauen Flächen, Dunst nur wo sichtbar (Bildzeit bei voller Auflösung ≈ −25 % gegenüber dem ersten V15-Stand), dazu
Start mit 50 % statt 60 % Auflösung. Der Rundgang
rendert nur bei Bedarf; die Auflösung passt sich zwischen 0,5 und 1 an. Auf echten Grafikkarten wurde **nicht**
gemessen.

## 6. Visuell geprüft (Bilder in `docs/v15/`)

- `vorher-nachher-hauptansichten.jpg` – sechs Ansichten V14 | V15 mit identischer Kamera (Gebäude, Garten, Eingang,
  Wohnung, Sanitär, Rückkehr); `vorher-nachher-nahansichten.jpg` – sechs Nahansichten; `paar-*.jpg` einzeln.
- `sanitaer-nahaufnahme.jpg` – Becken mit Ablauf, Armatur, Platten; Spiegelschrank mit Spiegelung.
- `smartphone-390-stationen.jpg` – sechs Stationen in 390 px mit den neu gerenderten Stationsbildern.
- `stationen-1440-mit-oberflaeche.jpg` – Stationen mit Text, Navigation und Leistungspunkten.

## 7. Offen – nicht geprüft

- Echte Geräte und GPUs (Safari macOS/iOS ≥ 16.4, iPhone, Android, Tablet, schwächeres Notebook) – Bildraten dort
  unbekannt.
- Der Spiegel rendert in halber Auflösung (Software: 0,35): Leuchtenreflexe wirken leicht stufig.
- Reflexionsaufnahmen sind statisch (einmal je Raum); bewegte Türen erscheinen darin im Zustand der Aufnahme.
- Texturen prozedural; fotografische, lizenzierte Materialscans nur nach Freigabe (Lizenz, Kosten).
- Wix: Einbau, Editor-Vorschau, Live-Seite; Formularversand (bleibt Demo); Bildschirmleser-Test über ARIA hinaus.
- Kein Wasser-Effekt am Waschtisch umgesetzt (nicht überzeugend genug in dieser Technik).
