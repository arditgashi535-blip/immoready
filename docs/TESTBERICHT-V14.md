# Testbericht V14 «realistische Architekturvisualisierung»

Stand: 9. Oktober 2026 · Branch `v14-realismus` · Ausgangsstand V13: Tag `v13-stand` (Commit 5bc8c14),
zusätzlich gesichert als Branch `sicherung/v13-vor-v14` und als Archiv ausserhalb des Repos.

Die Szene ist eine **illustrative Visualisierung, kein Referenzobjekt**. Im Rundgang steht die Kennzeichnung
«Illustrative Visualisierung · kein Referenzobjekt» sichtbar auf dem Bild, die Stationsbilder tragen sie im
Alternativtext. In Wix wurde nichts verändert, nichts veröffentlicht.

## 1. Was der Renderer konnte und was ergänzt wurde

Geprüft vor dem Umbau (Chromium, WebGL 1): 32 Textureinheiten, 16 Vertex-Attribute, Ableitungen
(`OES_standard_derivatives`), anisotrope Filterung, `DecompressionStream`. V13 nutzte davon nur einfache
Vertex-Farben, Licht pro Eckpunkt und Musterfugen im Shader – das reichte nicht für Materialien, Glas mit Tiefe,
weiche Schatten oder Pflanzen. Ergänzt wurden deshalb (keine reinen CSS-Effekte):

| Bereich | V14 |
|---|---|
| Geometrie | neuer Grundriss mit 38-cm-Aussenwänden und echten Öffnungen, Laibungen, Rahmen, Fensterbänken, Sockel, Attika, Balkonen; Türen in realen Breiten; Kantenschrägen an Möbeln, Stufen, Steinen und Platten |
| Materialien | 8 prozedurale Texturen (eigene Werke, `tools/make-textures.py`), zur Laufzeit in 2 RGBA-Texturen gepackt, Massstab je Material |
| Licht | vorab gerechnete Umgebungsverdeckung und weiche Schatten (Raytracing, `tools/bake-light.js`), indirektes Raumlicht, Tonkurve mit weicher Schulter, weiche Belichtungsanpassung innen/aussen |
| Glas | Interior Mapping für Fenster ohne modellierten Raum (Raum, Licht, Vorhang, Möbel je Fenster verschieden), echtes durchsichtiges Glas mit Fresnel-Spiegelung für Wohnung, Halle, Dusche, Türen |
| Pflanzen | Laubkarten mit Alpha-Test, leichter phasenversetzter Wind (gedrosselt, endet nach 15 s ohne Eingabe) |
| Kamera | Objektivverschiebung statt Kippen (senkrechte Kanten bleiben senkrecht), neue Stützpunkte für den neuen Grundriss |

Nicht verwendet: fotografische Materialscans (Lizenz/Kosten nicht freigegeben), Canva-Bilder (für die Szene
nicht nötig; es wurde in V14 nichts in Canva erzeugt), Bildgenerierung. Alle sechs Stationsbilder stammen aus
demselben Gebäudemodell und derselben Route wie der Rundgang.

## 2. In dieser Sitzung ausgeführt

Umgebung: Linux-Container, 2 vCPU, Chromium 141 headless, WebGL über **SwiftShader** (Software-GPU). Alle Suiten
am finalen Stand nacheinander ausgeführt.

| Suite | Inhalt | Ergebnis |
|---|---|---|
| `tests/test_rise.py` | Schema (neu: `tour.scene`, `tour.wind`), Prüfregeln, gebaute Seite = rise.json, 12 Stationsbilder | 21/21 |
| `tests/t15-velo.js` | Wix-Adapter (Velo) mit gültigen und manipulierten Ereignissen | 10/10 |
| `tests/t7.js` | Seiten, Navigation, Formular (Demo), Layout 390/820/1440, Layoutverschiebung | 68/68 |
| `tests/t9.js` | Interaktionen, kein Magnet-Effekt, kein eigener Cursor | 18/18 |
| `tests/t11.js` | Route (2000 Punkte), Stationen vorwärts/rückwärts, Türen, Overlay, Ruhezustand innen, **neu: Wind gedrosselt und Stillstand nach 15 s**, Fallbacks, Smartphone | 37/37 |
| `tests/t12.js` | iFrame-Nachrichten | 14/14 |
| `tests/t13-component.js` | Web Component (zwei Instanzen, `tour-ready` Version 14, Aufräumen, Kontextverlust, ohne WebGL, Smartphone, Auswahl, Kontakt) | 24/24 |
| `tests/t14-v13.js` | Scan-Kante, Route 4000 Punkte, Drehgeschwindigkeit, Bildwinkel, Türdurchfahrt, doppelte Wandflächen, Sanitär-Puls, Auswahl, Kontakt, Layout 1440/768/390 | 28/28 |
| `tests/t16-v14.js` | **neu:** Texturen, vorab gerechnetes Licht, Kennzeichnung, Wandstärke, lichte Türöffnungen, Raumhöhe, senkrechte Kanten, keine ausgebrannten Flächen, Helligkeit innen/aussen, weiche Belichtung, «Bewegung reduzieren», Ersatzwege ohne Texturen bzw. ohne Lichtdaten, Smartphone ohne 3D-Daten | 19/19 |

**Summe: 239 Prüfungen, alle bestanden.**

Testanpassungen (begründet): Erwarteter Schiebeweg der Terrassentür 1,0 m (neue Hebeschiebetür, vorher 1,1 m);
Version 14 statt 13; der V13-Ruhezustand-Test lief aussen und kollidierte mit dem neuen Wind – jetzt getrennt
geprüft (innen still; aussen höchstens 30 Bilder/s; 15 s nach der letzten Eingabe still). Fünf zeitkritische
Prüfungen (Kopfzeile kompakt, Markierung, Dropdown, Overlay, Sanitär-Puls) warten jetzt auf Bedingungen statt
auf feste Zeiten, weil die Software-GPU mit der schwereren Szene langsamer Bilder liefert.

## 3. Kameraroute (gemessen, 4000 interpolierte Punkte)

| Grösse | V13 | V14 |
|---|---|---|
| Wandkontakte (Abstand ≥ 12 cm) | 0 | 0 – auch Fassade und Türzargen sind Kollisionskörper |
| Grösste Drehung der Blickrichtung | 24,9° je 1 % | 26,7° je 1 % (bei p = 0,844, Wendung im Wohnraum nach dem Bad) |
| Grösster vertikaler Bildwinkel | 56,1° | 51,6° |
| Türdurchfahrten | Haustür 100°, Wohnungstür −92°, Terrasse 1,1 | Haustür 100° (p 0,376), Wohnungstür −92° (p 0,512), Terrassentür ganz offen 1,0 m (p 0,897) |
| Lichte Öffnungen | – | Haustür 1,09 m · Wohnungstür 1,06 m · Bad 0,85 m · Durchgang 1,10 m |

Vorwärts und rückwärts geprüft: Stationen in beiden Richtungen (t11), Kamera ist eine reine Funktion des
Fortschritts (t14), Kontaktbogen mit 48 Bildern über die ganze Fahrt visuell durchgesehen.

## 4. Ladeleistung und Bildzeiten (Testumgebung, keine Zusage für echte Geräte)

Lokaler HTTP-Server ohne Kompression, Netzwerk und CPU über das DevTools-Protokoll gedrosselt (`npm run perf`),
je drei Läufe; angegeben ist die Spannweite.

| Grösse | V13 | V14 |
|---|---|---|
| Seite (eine Datei) | 2,08 MB · gzip ≈ 1,39 MB | 3,08 MB · gzip ≈ 2,12 MB (Texturen ≈ 0,56 MB, Lichtdaten 0,24 MB, Stationsbilder) |
| Desktop 1440, 20 Mbit/s, 20 ms: FCP / LCP | 632–884 ms / 632–884 ms | 652–1308 ms / 1188–1308 ms |
| Desktop: Ladeende / Rundgang bereit (3D) | 1,16–1,22 s / 2,6–2,8 s | 1,50–1,63 s / 3,6–4,0 s |
| Smartphone 390, 9 Mbit/s, 60 ms, CPU ×4: FCP / Ladeende | 524–544 ms / 2,76–3,14 s | 540–700 ms / 3,24–3,31 s |
| Layoutverschiebung (CLS) Desktop / Smartphone | 0,0005 / 0,066 | 0,0005 / 0,066 (unverändert) |
| Szene | 138 261 Eckpunkte, 16 Leuchten | 215 994 Eckpunkte (davon 20 430 Laub), 30 Leuchten, 56 Fenster mit Raumtiefe, 3 405 Laubkarten |
| Aufbau beim Start (in Leerlauf-Etappen) | ≈125–155 ms Geometrie + ≈60–105 ms Licht | ≈170–205 ms Geometrie + ≈95–120 ms Licht (vorab gerechnet, nur noch angewendet) |
| Bildzeit 1440×900, SwiftShader, volle Auflösung | 386–624 ms | 698–878 ms (Software-Modus: ohne Anisotropie) |
| Bildzeit bei Auflösung 0,5 | 192–203 ms | 289–310 ms |

Smartphones (≤ 700 px) zeigen Stationsbilder und entpacken weder Texturen noch Lichtdaten; in der Vorschau-Datei
sind sie aber eingebettet und werden mit übertragen (+1 MB). In der Wix-Komponente liegen Texturen und
`licht.json` als eigene Dateien und werden nur geladen, wenn 3D startet. Auf echten Grafikkarten wurde nicht
gemessen; dort ist der Unterschied der Shader-Last erfahrungsgemäss klein, eine Messung auf Zielgeräten bleibt Pflicht.

## 5. Visuell geprüft

- Sechs echte Screenshots der laufenden Seite (Navigation über die Stationspunkte, 1440×900):
  `docs/v14/screenshots/v14-live-*.jpg`.
- Vorher/Nachher mit **gleicher Kamera** (Gebäude, Garten, Eingang, Wohnung, Bad): `docs/v14/vorher-nachher-gleiche-kamera.jpg`.
- Vorher/Nachher der Stationen mit Oberfläche bei 1440, 768 und 390 px: `docs/v14/vorher-nachher-{1440,768,390}.jpg`.
- Beim Aufbau gefunden und behoben: Putz- und Rasentextur wiederholten sich sichtbar (grossflächige Wolken aus
  den Texturen entfernt, Unregelmässigkeiten kommen nicht kachelnd je Eckpunkt); Sockel wurde zum Boden hin
  schwarz (Eckpunkte im Kies → feiner gerastert); Kamera streifte die Terrassentür-Zarge (zusätzliche Stützpunkte);
  Treppenhalle überbelichtet; Notizzettel flackerten am Anschlagbrett; Balkonstühle standen im Erdgeschoss;
  Küchenfronten trugen Holzmaserung; Highlight-Puls lief bei ausbleibenden Bildern nicht weiter.

## 6. Offen – nicht geprüft

- Echte Geräte: Safari (macOS, iOS ≥ 16.4 wegen `DecompressionStream`; ältere Browser rechnen das Licht ohne
  vorab gerechnete Schatten), mindestens ein iPhone, ein Android-Gerät, ein Tablet, ein schwächeres Notebook.
- Wix: Einbau des Custom Elements mit dem erweiterten Bilderordner (CORS), Editor-Vorschau und Live-Seite.
- Formularversand (Wix Forms) – das Formular bleibt als Demo gekennzeichnet.
- Bildschirmleser-Test (VoiceOver/NVDA) über ARIA-Prüfungen hinaus.
