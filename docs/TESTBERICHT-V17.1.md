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

## Handy-Durchgang (Fertigstellung, 15. Oktober 2026)

**Gesamtlauf am finalen Build, ohne Wiederholung:** `sh tests/alle.sh` → **442 bestanden, 0 fehlgeschlagen** (npm test
exit 0, t12 exit 0, t13 exit 0). Enthalten: RISE, t15, t7, t9, t11, t14, t16–t19 (318), t20 (43), t21 (21), **t22 Handy (22, neu)**,
t12 (14), t13 (24). Kein Einzel-Retry nötig; t11 bestand im Gesamtlauf.

| Befund (Handy) | Ursache | Korrektur | Prüfung |
|---|---|---|---|
| `body` hatte `overflow-x:hidden` – Überbreite wurde versteckt statt behoben | Altlast aus V8 | entfernt; alle Ursachen einzeln behoben (siehe unten) | t22 «keine pauschale Überlaufsperre»; eigene Messung 15 Grössen × 17 Seiten inkl. 200 %: 0 Fälle |
| bei 200 % Text breiter als der Bildschirm: Leistungsumfang (`.scope`), Ablauf (`.steps`), Offertformular, Leistungskarten, Abschlusstitel | einspaltige Raster mit `1fr` (Mindestbreite = längstes Wort), Formularspuren nach Grundbreite der Eingabefelder, Flex-Titel, Schriftuntergrenze 3 rem | `minmax(0,1fr)`, `.f/.fgroup` ohne Mindestbreite, Titel als Raster, `min(3rem,13vw)` | Messung 200 % (320/360/390): 0 Fälle |
| Lange Wörter mitten im Wort ohne Trennstrich («Leerstandsmanageme/nt», «Datenschutzerklä/rung», «Immobilienpräsen/tation») | `overflow-wrap:anywhere`; `hyphens:auto` in Chromium/Linux ohne Wörterbuch | weiche Trennstellen zur Laufzeit (Wörterbuch, nur sichtbarer Text), Überschriften `break-word` | t22: 4 Breiten × 16 Seiten ohne Wortbruch |
| Leistungsübersicht 320–430 px: Beschreibung in 48-px-Spalte (706 px hoch), «..» am Satzende | dritte Zelle rutschte in die Nummernspalte; Punkt doppelt angehängt | einspaltig untereinander; Punkt nur einmal | t22 |
| Kontaktseite bei 320 px dreispaltig, Einsatzgebiet/Termin zweispaltig | Inline-Spalten überschrieben die mobile Regel | Klassen mit Umbruch < 760 px | t22 |
| Rundgang mobil: 250–350 px leere dunkle Fläche unter kurzen Stationen | alle Stationen im selben Rasterfeld, Höhe = längste Station | nur aktive Station belegt Platz | t22 (alle 6 Stationen ≤ 14 px) |
| «Offerte anfragen» dreifach direkt untereinander (Station, Überspringen-Zeile, Kontaktleiste) | Pill in der Überspringen-Zeile | < 760 px ausgeblendet; «Tour überspringen» bleibt | t22 |
| Station mit 32 px Seitenrand statt 16 px | doppelte Innenabstände | einheitlich 16 px | t22 |
| Smartphone quer (844×390): 3D-Bühne klebt, Stationsleiste über Titel, Texte abgeschnitten | Bildmodus nur nach Breite (≤ 700 px) | auch bei Höhe ≤ 540 px Bildmodus mit normalem Scrollen, Bild ≤ 60 % Höhe | Sichtprüfung h16/h17, Textabschnitt-Messung |
| Menü offen → Gerät gedreht/Fenster breit: Seite blieb gesperrt | Sperre nur beim Schliessen aufgehoben | Menü schliesst, wenn der Menüknopf verschwindet | t22 |
| Anker konnten unter dem klebenden Kopf landen | kein Abstand | `scroll-margin` aus gemessener Kopfhöhe (nicht `scroll-padding`: das liess die Seite beim Fokus auf den Menüknopf springen – im Durchgang gefunden und korrigiert) | t22 (Anker, Skip-Link, Menü-Scrollposition) |
| Stationsleiste: Weiterscrollen schwer erkennbar | harte Kante | weich ausblendende Ränder | Sichtprüfung |

Neu geprüft (t22): Leistungs-Vorauswahl aus jeder Station – Gebäude/Offerte ohne Vorauswahl, Garten → Gartenunterhalt,
Eingang → Hauswartung, Wohnung → Reinigung / Räumung / Leerstand (je nach Wahl), Bad → Sanitär.

Bekannte Grenzen: E-Mail-Adresse darf bei 320 px an «@» umbrechen (`<wbr>`, kein Zeichen im kopierten Text). Ganzseiten-
Aufnahmen zeigen die fixierte Kontaktleiste an der Stelle des ersten Bildschirms (Aufnahmeeffekt, nicht im Browser).
Abnahmebilder: `docs/v171/handy-uebersicht.jpg` (18 Sichtbereiche), `docs/v171/handy-ganze-seiten.jpg`, Einzelbilder
`docs/v171/handy/`; Seitenbilder 21–33 der Abnahme neu (`docs/v171/abnahme-33-bilder.jpg`).

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
| 320 px bei 200 % Text: seitliches Scrollen (bis 428 px) | Segmentwahl, Überzeilen, Personenkarte, Formularfuss ohne Umbruch | schrumpfende Spalten, Umbruch | t20 «320 px bei 200 %» – *Nachtrag: weitere Fälle waren durch `overflow-x:hidden` verdeckt, siehe Handy-Durchgang* |
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
