# Testbericht V17.1 «Final Realism & Mobile Release Candidate»

Stand: 10. Oktober 2026 · Branch `v17.1-release-candidate` · Ausgangsstand: Commit «V17 Ausgangsstand» (Tag `v17-ausgang`, lokal)
Alle Zahlen stammen aus Läufen am finalen Build in dieser Arbeitsumgebung (Linux-Container, Headless-Chromium mit
SwiftShader-Software-GPU). Nichts wurde auf Wix veröffentlicht, keine Domain verändert.

## Ergebnis

| Prüfung | Ausgangsstand V17 | Final V17.1 |
|---|---|---|
| `npm test` (RISE, t15, t7, t9, t11, t14, t16–t19) | 318/318 | 317/318 im Gesamtlauf, 318/318 nach Einzel-Wiederholung (siehe unten) |
| t12 iFrame-Nachrichten | – (nicht neu gelaufen) | 14/14 |
| t13 Web Component | – (nicht neu gelaufen) | 24/24 |
| **t20 V17.1 (neu)** | – | **43/43** |
| Summe | 356 dokumentiert | **399 Prüfungen** |

**Einzelner Ausreisser:** t11 «Szene pausiert ausserhalb des Sichtbereichs» schlug im Gesamtlauf einmal fehl (ein noch
laufendes Bild der Software-GPU, ≈0,7–0,8 s je Bild, fiel in das 1-s-Messfenster). Zwei Einzelläufe von t11 direkt danach:
37/37 bestanden. Im vorherigen Gesamtlauf am fast identischen Stand bestand die Prüfung ebenfalls. Kein Code-Fehler
gefunden; auf echter GPU ist ein Bild um Grössenordnungen kürzer.

## Während des Durchgangs gefundene und behobene Fehler

| Befund | Ursache | Korrektur | Prüfung |
|---|---|---|---|
| Treppe: Stufen wirken wie gestapelte Kisten | `face()` unterteilte Vierecke als Parallelogramm aus drei Ecken – die schräge Brüstung wurde waagrecht bei 1,13 m gezeichnet | bilineare Unterteilung; neue Wange mit Podestknick, Staketengeländer, Eichenhandlauf | t20 «Treppenwange folgt der Steigung» (Strahl auf 0,98 / 1,71 / 2,38 m) |
| Bad: diagonale Lichtfächer an der Wand | gebackener Schatten des Spiegelschranks auf 30-cm-Eckpunktraster | Wand mit Spiegelschrank und Vorwand 10 cm, übrige Badwände 20 cm | Sichtprüfung 13/17/20, Eckpunktgrenze t19 |
| Dunkles bis schwarzes Band am Horizont (Gesamt- und Dachansicht) | Vertex-Shader überblendete Boden ab 120 m mit (0,007; 0,01; 0,017) | abgedunkelter Dunstton | t20 «Kein schwarzblaues Band» (0 dunkle Pixel) |
| Schwarze Fläche links in der Gesamtansicht | Strasse endete bei ±30 m, dahinter fehlte Boden | Strasse/Trottoir bis ±62 m, Boden bis ±90 m | t20 Horizont, Sichtprüfung 01 |
| Fassade: dunkle Fahne am Balkonanschluss | 55-cm-Raster der Fassade | Vorder-/Seitenfassade 34 cm | Sichtprüfung 02 |
| Garten: Heckenoberseite als flache Platte, Baum mit Querast | eine fast waagrechte Karte; Äste aus einem Punkt zwischen den Stämmen | fünf kleine geneigte Karten; Äste aus den Stämmen | Sichtprüfung 06 |
| Wohnung: Holzkiste unter dem Esstisch | Sitzbank als Vollkörper | Bank mit Beinen und Zarge | Sichtprüfung 11 |
| Kontaktleiste und kompakter Kopf durchscheinend (Text schimmerte durch) | 97 % bzw. 90 % Deckkraft | deckend | t20 alle 13 Breiten |
| Touchziele 40–42 px («Betreuung anfragen», «Offerte anfragen» im Kopf, Stationsknöpfe Desktop, «Kopieren» 70×30) | Mindesthöhe fehlte | ≥ 44 px | t20 alle 13 Breiten × 17 Seiten |
| 320 px bei 200 % Text: seitliches Scrollen (bis 428 px) | Segmentwahl, Überzeilen, Personenkarte, Formularfuss ohne Umbruch | schrumpfende Spalten, Umbruch | t20 «320 px bei 200 %» |
| Nach Formularfehler Fokus auf der Fehlerübersicht | Vorgabe verlangt erstes Fehlerfeld | Fokus auf erstes Fehlerfeld, Übersicht bleibt | t20 Formular 320/390 |
| Skip-Link nicht erster Tabstopp; auf Unterseiten führte er zur Startseite | Router setzte beim Laden Fokus; `#main` lief durch den Router | Fokus erst bei Seitenwechsel; Klick abgefangen | t20 «Skip-Link (#kontakt)» |
| Stationsbild-Werkzeug brach bei langsamer Grafik ab | Element-Screenshot wartete auf «stabil» | Bildausschnitt statt Element | `npm run render:stills` |

## Neue Prüfungen (t20, alle bestanden)

- 13 Breiten (320, 360, 375, 390, 393, 414, 430, 844×390 quer, 768, 1024, 1280, 1440, 1920) × 17 Seiten: kein seitliches
  Scrollen, Kopf ohne Überlappung, Original-Logo unverzerrt (762×578), alle Bedienelemente ≥ 44 px, Kontaktleiste genau
  einmal, deckend, ≤ 60 px, Platz reserviert, kompakter Kopf deckend.
- 320 px bei 200 % Text auf 6 Seiten.
- Stationsleiste 320/390/430: Höhe ≥ 44 px, Einrasten, Anfang nicht abgeschnitten, Touch und Tastatur, aktive Station sichtbar.
- Menü 320×568: Hintergrund gesperrt, vollständig scrollbar, Escape, Fokus zurück auf den Menüknopf.
- Formular 320/390: Eingabetypen, Autofill, Beschriftungen, Spalten, Fokus auf erstem Fehlerfeld, Eingaben bleiben,
  Foto hinzufügen/entfernen, Doppelklick-Sperre (1 Übermittlung bei 3 Klicks), Fehlerfall statt Erfolg, Demo-Hinweis.
- 20 Seitenanker über den Router, Telefon/E-Mail einheitlich, Terminlink, externe Links nur HTTPS auf immoready.ch,
  Hash-Navigation + Browser-Zurück, Skip-Link, Drehen/Grösse ändern.
- Szene: Lichtdaten passen (Prüfsumme), Treppenwange, kein dunkles Horizontband, keine JS-Fehler.
- Alle 16 Stationsbilder gegenüber dem V17-Ausgangsstand neu gerendert.

Bestehende Prüfungen decken weiterhin ab: Kamerafahrt vorwärts/rückwärts und Stationssprünge, Kollisionen (4000 Punkte),
Nahebene, Türen, Reduced Motion, WebGL-Ausfall, Kontextverlust, Mehrfachinstanzen, Entfernen/Einfügen, Cleanup, Ruhezustand
ohne Rendering, Produktionsform `dist/site/` über HTTP, Velo-Adapter und Ereignisse.

## Was nicht geprüft werden konnte

| Art | Status |
|---|---|
| Browseremulation (Viewport, Touch, `isMobile`) | durchgeführt (Chromium) |
| Headless-Chromium mit Software-GPU (SwiftShader) | durchgeführt |
| Safari (macOS/iOS) | **nicht** durchgeführt – kein Gerät/Browser in der Umgebung |
| echtes iPhone | **nicht** durchgeführt |
| echtes Android-Gerät | **nicht** durchgeführt |
| echte GPU (Mac/Windows) | **nicht** gemessen |
| Wix (Editor, Vorschau, Live) | **nicht** durchgeführt – bewusst, keine Freigabe |
| Formularversand über Wix Forms | **nicht** möglich – Formular bleibt im Demo-Modus |

Diese Punkte sind die letzten externen Abnahmeschritte (siehe `wix/EINBAU.md → Vor dem Livegang`).
