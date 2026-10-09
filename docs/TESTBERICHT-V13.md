# Testbericht V13 «Digital Twin at Dusk»

Stand: 8. Oktober 2026 · Branch `v13-digital-twin-dusk` (Ausgangsstand V12: Tag `v12-ausgangsstand`, Commit f77b326)

## 1. In dieser Sitzung ausgeführt

Umgebung: Linux-Container, 2 vCPU, Chromium 141 headless, WebGL über **SwiftShader** (Software-GPU, keine
Grafikkarte). Alle Suiten am finalen Stand nacheinander ausgeführt.

| Suite | Inhalt | Ergebnis |
|---|---|---|
| `tests/test_rise.py` | Schema, Prüfregeln (inkl. 6 neuer Negativfälle), gebaute Seite = rise.json, 12 Stationsbilder | 21/21 |
| `tests/t15-velo.js` | Wix-Adapter mit nachgebildetem `$w`/`wixLocation`: gültige und manipulierte Ereignisse | 10/10 |
| `tests/t7.js` | Seiten, Navigation, Formular (Demo), Layout 390/820/1440, Layoutverschiebung beim Laden | 68/68 |
| `tests/t9.js` | Interaktionen; **neu:** kein Magnet-Effekt, kein eigener Cursor | 18/18 |
| `tests/t11.js` | Rundgang: Route (2000 Punkte), Stationen vorwärts/rückwärts, Türen inkl. Terrassentür, Ruhezustand, Fallbacks | 35/35 |
| `tests/t12.js` | iFrame-Nachrichten; **neu:** `REQUEST_CONTACT`, allgemeine Offerte | 14/14 |
| `tests/t13-component.js` | Web Component: zwei Instanzen, Ereignisse, Aufräumen (4× entfernen/einsetzen), Kontextverlust, ohne WebGL, Smartphone (Hochformat-Bild), Bewegung reduzieren (kein Scan); **neu:** Wohnungs-Auswahl per Klick und Tastatur, `request-contact` | 24/24 |
| `tests/t14-v13.js` | **neu:** Scan-Kante, interpolierte Route (4000 Punkte), Drehgeschwindigkeit, Bildwinkel, Türdurchfahrt erst bei Öffnung, doppelt belegte Wandflächen, Sanitär-Hervorhebung, Auswahl, Kontakt, Layout aller 6 Stationen bei 1440/768/390 px | 28/28 |

**Summe: 218 Prüfungen, alle bestanden.**

Gemessene Kennzahlen (Testumgebung, nicht auf echte Geräte übertragbar):

| Grösse | V12 | V13 |
|---|---|---|
| Grösste Drehung der Blickrichtung | 459° je 1 % Fortschritt | 24,9° je 1 % |
| Grösster vertikaler Bildwinkel | 56,1° | 56,1° |
| Haustür / Wohnungstür beim Durchfahren | 100° / −92° | 100° / −92°, Terrassentür ganz offen (1,1 Einheiten) |
| Layoutverschiebung beim Laden (CLS) | 0,049 | 0,0005 |
| Scan-Kante | – | geplant 1200 ms; gemessen 1,2–1,9 s Ende, abhängig vom Bildtakt der Software-GPU |
| Szene | 7 452 Eckpunkte | 138 261 Eckpunkte, 16 Leuchten (gebacken), 46 Kollisionskörper |
| Aufbau beim Start | – | 116 ms Geometrie + 62 ms Licht, verteilt auf 12 Leerlauf-Etappen |
| Zeit je Bild 1440×900 (SwiftShader, synchron gemessen) | nicht vergleichbar gemessen | 297–467 ms; bei Auflösung 0,5: 150–187 ms |

Die Bildzeiten gelten **nur** für die Software-GPU dieser Umgebung. Für echte Geräte wird keine Bildrate
behauptet; dort ist eine Messung mit realer Grafikkarte nötig. Die Szene rendert nur bei Bewegung und senkt die
Auflösung selbst, wenn Bilder länger als 45 ms dauern.

Zeitkritische Prüfungen warten in V13 auf Bedingungen statt auf feste 100 ms, weil Medienabfrage-Ereignisse und
CSS-Übergänge in SwiftShader erst mit dem nächsten Bild (0,3–0,5 s) eintreffen. Betroffen: t7 «Bewegung
reduzieren während der Nutzung» (Reaktion nach ca. 300 ms gemessen) und t9 «Logo im kompakten Kopf».

## 2. Visuell geprüft (Screenshots, nicht automatisiert)

- Vorher/Nachher aller sechs Stationen bei 1440, 768 und 390 px: `docs/vorher-nachher-*.jpg`, Einzelbilder in
  `docs/screenshots/`.
- Keine schwebenden Objekte, kein Flackern und keine durchschneidenden Flächen in den 18 Abnahmebildern und
  den 12 Stationsbildern gefunden. Gefunden und behoben: Geschossgesimse lagen als volle Platten im
  Erdgeschoss unter der Decke; der Polygon-Versatz liess bei streifendem Blick die Decke verschwinden.

## 3. Dokumentierte Altresultate (nicht erneut als V12 ausgeführt)

V12-Übergabe: RISE 13/13, t7 68/68, t9 17/17, t11 34/34, t12 12/12, t13 18/18. Diese Zahlen stammen aus der
vorherigen Sitzung und beziehen sich auf V12.

## 4. Offen – nicht geprüft

- Echte Geräte: Safari (macOS, iOS), mindestens ein iPhone und ein Android-Gerät, ein Tablet; Bildrate und
  Wärmeentwicklung auf einem schwächeren Notebook.
- Wix: Einbau des Custom Elements, Verhalten in Editor-Vorschau und auf der Live-Seite, Pfade der Offert- und
  Kontaktseite.
- Formularversand (Wix Forms) – das Formular bleibt als Demo gekennzeichnet.
- Bildschirmleser-Test (VoiceOver/NVDA) über ARIA-Prüfungen hinaus.
