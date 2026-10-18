# Realismus-Auftrag · Arbeitsstand

Auftrag: `IMMOREADY-CLAUDE-CODE-MASTERPROMPT.md` (Upload vom 17.10.2026). Dieser Stand wird nach jeder Runde nachgeführt.

## Verwendete Quelle

- **Vollständiges Quellprojekt:** dieses Repository (`arditgashi535-blip/immoready`, Branch `v17.1-release-candidate`). Die angehängte Vorschau-HTML wird daraus gebaut (`python3 build.py` → `dist/immoready-vorschau.html`). Es musste nichts aus der HTML rekonstruiert werden.
- **Das im Auftrag genannte Repository `infoimmoready-commits/immoready`** (Wix-Gerüst) ist in dieser Sitzung nicht freigegeben. Es wurde weder gelesen noch verändert; daraus wird nichts abgeleitet.
- **Canva «ImmoReady photo board»** (`DAHXQAIJpu4`): am 17.10.2026 über den Canva-Connector **nur gelesen** (keine Änderung). 8 Seiten: leere Titelseite, Fassade mit Loggien, Treppenhaus (Terrazzo, Flachstahlgeländer), Einhebelarmatur, Garten mit Hecke, leere Wohnung mit Parkett, Eingang mit Vordach, Luftbild. Es sind Einzelbilder **verschiedener Gebäude**; Herkunft und Lizenz sind im Board nicht angegeben (das Vorhandensein im Board ist kein Lizenznachweis). Sie dienten nur als Sichtreferenz für Materialien und Stimmung. In den Rundgang und die Seite wurde nichts davon übernommen.
- **Sites:** In dieser Sitzung nicht verwendet.
- **Private Vorschau:** das bestehende Claude-Artefakt https://claude.ai/artifact/3dNzp9yHwHBA5XhEwpwe1w, am 18.10.2026 auf Version 26 aktualisiert.
  - Laut Werkzeugergebnis ist es privat: Öffnen können nur der Eigentümer und Personen, denen der Eigentümer Zugriff gegeben hat.
  - Ob bereits Zugriff erteilt wurde, ist für Claude nicht einsehbar; die Freigabe kann Claude nicht ändern.
  - Keine Domain, keine Wix-Seite und keine öffentliche Website wurden verändert.
- Keine `AGENTS.md`; massgebend sind `CLAUDE.md` und die Regeln in `tools/rise.py`.

## Markenfarben (bestätigte Fassung)

Die im Auftrag zitierten Werte (`--ink #2B2B2A`, `--ivory #F4F2EE`, `--lime #E1D7C7` …) stammen aus der ältesten CSS-Schicht von `src/p1.html`, Zeile 10 ff. Sie werden ab Zeile 555 von der bestätigten Markenfassung aus `CLAUDE.md` überschrieben:

| Token | Wert |
|---|---|
| Ivory | #FCF8F5 |
| Paper | #F3EDE6 |
| Ink | #3B3A39 |
| Graphit | #302E2C |
| Night | #252321 |
| Sand («lime») | #DCC5A8 |
| Sand dunkel | #B39674 |
| Akzenttext | #7E6343 |

Diese Fassung gilt.

## Vorhandene Renderer-Funktionen (Kern `src/tour/tour-core.js`)

- **Grundlage:** eigenes WebGL1 mit einer einzigen rAF-Schleife je Instanz. Ein Fortschritt `p` (0…1) liefert Kamera, Türen, Hervorhebung und HTML-Einblendungen.
- **Steuerung:** Scrollmodus (Seite), Stationsmodus (Komponente, iFrame, Handy-3D) und Bildmodus.
- **Licht:** sRGB → linear, ACES-Tonkurve. Licht pro Eckpunkt vorab gebacken (`assets/bake/licht.json`: Umgebungsverdeckung, weiche Schatten).
- **Materialtabelle** (Rauheit, F0, Metall, Relief), prozedurale Texturen, Fugen pro Pixel, Reflexionsaufnahmen je Raum, echter Badspiegel.
- **Pflanzen und Glas:** Laubkarten mit Wind, Glas mit Fresnel, Interior Mapping.
- **Qualität:** adaptive Auflösung, Pixelbudget (2 Mio.), Frustum Culling, Software-Grafik-Modus.
- **Ereignisse:** `tour-ready`, `station-change`, `request-quote`, `request-contact`, `tour-error`.
- **Lebenszyklus:** `destroy()` gibt alle Ressourcen frei. Prüfhilfen: `checkRoute`, `routeStats`, `state()`, `sceneStats()`.

## Lokale Startanweisung

```bash
python3 build.py                                   # baut dist/
python3 -m http.server 8790 --directory dist       # dann http://127.0.0.1:8790/immoready-vorschau.html
# oder die Datei dist/immoready-vorschau.html direkt im Browser öffnen
```

## Baseline (17.10.2026, vor diesem Auftrag)

- **Bilder:** `shots/realismus/baseline-*`. Desktop 1440×900 (3D, volle Qualität) und Handy 390×844 (Bildmodus), jeweils Startseite und sechs Stationen.
- **Konsole:** keine Fehler, Warnungen oder fehlgeschlagenen Anfragen (`baseline-konsole.txt`).

## Beobachtete Hauptprobleme (Baseline)

1. **Kein Schmutz-zu-sauber-Zustand:** Alle Oberflächen sind von Anfang an sauber. Die Leistungen sind nur über Text erkennbar.
2. **Licht:** Die ganze Szene liegt in der blauen Stunde mit warmem Innenlicht. Für die Materialabnahme fehlt neutrales Tageslicht.
3. **Kein Vorher/Nachher-Vergleich und kein Demo-Loop:** Die Reise endet auf der Gesamtansicht (gewollt), ein ausdrücklich startbarer Rundlauf fehlt.

## Runden

| Runde | Ziel | Stand |
|---|---|---|
| 0 | Quellenabgleich, Baseline, STATUS | erledigt |
| 1 | Bad-Prototyp: Armatur + Waschtisch schmutzig → halb → sauber | erledigt (2 Versuche an den Wasserrändern) |
| 2 | Übertragung auf Gartenweg (Laub, Moos), Eingangshalle (Staub, Schuhspuren), Wohnung (Staub) + Vergleich Vorher/Nachher/Regler | erledigt |
| 3 | Tageslicht als Standard (Dämmerung umschaltbar), Demo-Rundlauf 48 s mit Naht | erledigt (Naht: 2 Versuche) |
| 4 | Sichtprüfung der «Vorher»-Bilder: Wohnung, Gartenweg, Bad nachgeschärft; Demo-Zeitplan | erledigt (Bad-Wasserränder: 3 Versuche, Grenze erreicht) |
| 5 | Gesamtlauf: Leistungsrückschritt der Schmutzschicht in der Software-Grafik, Barrierefreiheit, Alternativtexte | erledigt |
| 6 | Sichtprüfung der Belege: Eingang zu schwach | erledigt (Lifttür-Schlieren: 2 Versuche) |

### Runde 1 – Bad-Prototyp (Befunde und Korrekturen)

- **Umsetzung:** Schmutzschicht im Material-Shader (`DIRTF`/`DIRTM` in `tour-core.js`), bis 6 Zonen aus `rise.json → tour.cleaning`. Jede Zone hat Box, Art, Wischrichtung, Kante, Material, festen Startwert und Fortschrittsbereich. Die Schicht verändert Farbe, Rauheit und Metallanteil, die feuchte Kante ist kurz glänzender und dunkler.
- **Beobachtung 1:** Rechnendes Rauschen pro Pixel war in der Software-Grafik zu teuer (Bad-Nahaufnahme 4,6 s statt 0,6 s je Bild). **Behoben** mit einer einmal erzeugten, kachelbaren Rauschtextur 128² (eigene Erzeugung, fester Startwert). Jetzt wieder im Bereich des Ausgangsstands.
- **Beobachtung 2:** Die Wasserränder wirkten wie Marmor und lagen auch auf der Aussenschürze. **Behoben:** einzelne eingetrocknete Tropfenränder (1–2 cm, unregelmässig), matter Film zum Ablauf hin. Die Zone ist auf Becken und Ablage begrenzt.
- **Beobachtung 3:** Kalk lag als Flecken über der ganzen Armatur. **Behoben:** Kalk sitzt am Armaturenfuss (dichter nach unten) und am Strahlregler (eigene Zone). Im sauberen Zustand ist der Chrom wieder spiegelnd.
- **Beobachtung 4:** Gartenweg, Halle und Wohnung zeigten keine Wirkung. **Ursache 1:** Die Schleife mit `continue` wurde von ANGLE/SwiftShader fehlerhaft übersetzt; sie ist jetzt ohne `continue` geschrieben. **Ursache 2:** Die Box des Weges lag unter der Wegoberfläche (Weg 5 cm über Gelände).

### Runde 2 – Übertragung und Vergleichsbedienung

- **Zonen:** Gartenweg (Laub, Moos), Eingangshalle (Schuhspuren, Staub an den Wandkanten), Wohnung (Staub), Bad (Kalk an Armatur und Strahlregler, Wasserränder). Höchstens 6 Zonen (Grenze der Shader-Uniforms, auch für schwache Mobil-GPUs).
- **Vergleich an der Station:** «Vorher», «Nachher» und Regler «Reinigungsfortschritt» (Tastatur: Pfeile, Pos1/Ende; Schritt 5 %). Der Hinweis «Illustration eines Arbeitsablaufs, kein Kundenergebnis.» steht immer dabei. Ein Stationswechsel beendet den manuellen Vergleich.
- **Bildmodus** (Handy, ohne WebGL): «Vorher» zeigt ein Bild derselben Kamera im Ausgangszustand (`<still>-vorher.webp`). Ohne solches Bild (Web Component) wird der Vergleich ausgeblendet.

### Runde 3 – Licht und Demo-Rundlauf

- **Tageslicht** (Standard): weiches, bedecktes Licht, neutraler Himmel, mehr Fernsicht; Leuchten innen gedämpft, aussen aus. Die Dämmerung bleibt als zweite Gestaltung (Schalter «Tageslicht / Dämmerung»). Die andere Lichtfassung wird beim ersten Umschalten einmal gerechnet und in die vorhandenen Puffer geladen (kein neues Vertex-Attribut, WebGL1 hat nur 8).
- **Demo-Rundlauf** (≈ 48 s, nur auf Knopfdruck): Hecke → Gesamtansicht → Garten → Eingang/Treppe → Wohnung → Bad (Waschtisch) → Terrasse → Garten → hinter die Hecke. Zeitplan in `rise.json → tour.demo`, geprüft in `tools/rise.py`. Steuerung «Demo-Rundlauf starten» · «Pause»/«Fortsetzen» · «Beenden». Eigenes Scrollen, Stationswahl, Vergleich oder Anfrage beenden die Demo; die Lichtwahl nicht. Im Handy-3D steht sie ausserhalb des Bildes still. Bei «Bewegung reduzieren» wird sie nicht angeboten.
- **Naht:** Anfang und Ende liegen formatfüllend vor der strassenseitigen Hecke. Nur dort springt der Reinigungszustand auf «Vorher» zurück.
  - Versuch 1: Nahtpunkt x 8,0 – der Rückweg schnitt das parkierte Auto (grauer Keil im Bild). Verworfen.
  - Versuch 2: x 10,8 – frei. Bild bei 47,99 s und 0 s gleich (Bildfläche ohne Text: mittlere Differenz 0,03 %, Rest ist Wind).

### Runde 4 – Sichtprüfung der «Vorher»-Zustände (gleiche Kamera, gleicher Startwert)

| Befund | Ursache | Korrektur | Ergebnis |
|---|---|---|---|
| Wohnung: «Vorher» und «Nachher» praktisch gleich (0,07 % der Pixel verändert) | Staubfarbe so dunkel wie das Parkett; Boden kaum im Bild | Staubfarbe aus der Grundhelligkeit (auf dunklem Holz hell und grau), Zone auch auf waagrechten Möbelflächen (Tisch, Sitze), Schuhspuren nur am Boden | sichtbarer matter Staubfilm auf Tisch und Stühlen |
| Wohnung: Staub fleckig-kariert | Schwellwert auf grobem Wertrauschen erzeugt Rauten | gleichmässiger Film mit feiner Körnung | ruhig, glaubwürdig |
| Gartenweg: Laub wie Konfetti | eine Blattgrösse, gleichmässig verteilt, kräftiges Orange | zwei Grössen, Häufung in Wolken und zu den Rändern, gedämpfte Brauntöne, grünlich-grauer Schmutzfilm | liest sich als Laub |
| Gartenweg: wirkte im «Vorher» heller | Messung: tatsächlich überall dunkler; Glanz des Untergrunds unter dem Belag aber zu stark | Glanz unter diffusem Belag gedämpft (physikalisch: Belag deckt den Untergrund ab) | – |
| Bad: im Tageslicht kaum sichtbar | Ränder zu hell auf weisser Keramik | Versuch 1: grauer und dichter → zu grafisch (exakte Kreise, kantige Flecken, Tarnmuster auf der Armatur). Versuch 2/3: unterbrochene, verzogene Ränder, kleine runde Tropfenpunkte zum Ablauf hin, feinerer Kalk | sichtbar, ruhiger; bleibt erkennbar synthetisch (siehe offene Punkte) |
| Demo: Drehungen bis 150°/s, Rückflug 60 m zur Hecke | Zeit gleichmässig nach Fortschritt, Ende bei p 1 (Gesamtansicht) | Zeit gleichmässig nach Weg und Drehung (1 rad = 4 m), Fahrprofil mit 30 % Anfahren/Abbremsen; Fahrt endet nach der Terrasse (p 0,94) und sinkt von dort hinter die Hecke | höchstens ≈ 23 m/s und ≈ 86°/s |

### Runde 5 – Gesamtlauf und Leistung

Der erste Gesamtlauf nach Runde 4 war **nicht bestanden**. Gefunden und an der Ursache behoben:

| Befund (Prüfung) | Ursache | Korrektur |
|---|---|---|
| t18: Kamerafahrt zur WC-Nahansicht nach 30 s nicht am Ziel; t20: Bildschirmfoto wartet vergeblich auf ein ruhiges Bild | Die Schmutzschicht machte jedes Bild in der Software-Grafik 4–5× langsamer, **auch ohne aktive Zone**. Gemessen mit `bench` (1440×900): Gesamtansicht 0,60 s → 2,57 s. Gegenprobe ohne Schmutz-Code: wieder 0,69 s. Ursache: SwiftShader rechnet Verzweigungen für jedes Pixel aus; die allgemeine Schleife über alle 4 Arten lief deshalb überall | (1) Shader aus den Zonen erzeugt: je Zone nur der Code ihrer Art, Werte als Konstanten. (2) Sichtweite je Zone (Laub 30 m, Staub 9 m, Bad 4 m) mit weicher Ausblendung im Shader. (3) Programm ohne Schmutzschicht, solange keine nahe, nicht saubere Zone im Bild ist, sonst eine Variante nur mit diesen Zonen. Auf echten GPUs werden die Varianten entlang Route und Demo im Leerlauf vorab übersetzt. |
| t16: Alternativtext der «Vorher»-Bilder | «Illustrative Visualisierung, Zustand vorher: …» wich vom vorgeschriebenen Muster ab | «Illustrative Visualisierung: …, Zustand vorher – kein Referenzobjekt» |
| t20: Knöpfe «Tageslicht / Dämmerung» 40 px hoch (Regel ≥ 44 px) | allgemeinere Regel der Leiste überschrieb die Mindesthöhe | Regel mit passender Spezifität |
| t16 (Dämmerung): «innen heller als aussen», «Belichtung sinkt beim Eintreten» | gilt physikalisch nur in der Dämmerung; im Tageslicht kehrt es sich um | t16 schaltet dafür ausdrücklich auf «Dämmerung» (Grenzwerte unverändert); t28 prüft das Tageslicht-Gegenstück |

**Bildzeiten danach** (Software-Grafik SwiftShader, 1440×900, 3 Bilder je Punkt, Mittel in ms; *keine Aussage über echte GPUs*):

| p | 0,03 Gesamt | 0,235 Garten | 0,44 Eingang | 0,59 Wohnung | 0,73 Bad | 0,772 WC |
|---|---|---|---|---|---|---|
| Ausgangsstand (vor dem Auftrag) | 604 | 685 | 724 | 536 | 781 | 482 |
| mit allgemeiner Schmutzschleife | 2572 | 3019 | 3952 | 2985 | 3672 | 2673 |
| Endstand | 648 | 708 | 879 | 565 | 774 | 518 |

Am Eingang bleiben +21 %: dort ist der Wohnungsstaub tatsächlich in Sichtweite. Das t9-Logo im kompakten Kopf war in diesem Lauf 9 px über dem Rand; einzeln bestanden, die Seite hat beim Laden keine langen Aufgaben über 0,2 s (gemessen mit `PerformanceObserver longtask`). Am Test wurde nichts geändert; massgeblich ist der folgende vollständige Gesamtlauf.

### Runde 6 – Eingang

- **Befund:** Bei normaler Grösse unterschieden sich «Vorher» und «Nachher» am Eingang kaum (blasse Abdrücke am Bildrand). Ursache: Die Stationskamera blickt auf Lift und Wohnungstür, der Boden ist kaum im Bild, und die Gehspuren lagen unter der Kamera. Zusätzlich wurden die neuen Zonenfelder `walk`/`entry` zunächst gar nicht an den Kern übergeben (`tour_config` las nur feste Felder) – behoben.
- **Korrektur:** Gehspuren entlang echter Laufwege (Haustür → Wohnungstür, Haustür → Treppe) mit eingetragenem Schmutz an der Haustür; neue Art **Schlieren** für die Chromstahl-Lifttür: Fingerabdrücke in Griffhöhe, zum Türspalt dichter, einzelne Wischschlieren, matt und weniger metallisch. Platz dafür: Die beiden Kalkzonen der Armatur sind zu einer zusammengelegt (gleiche Box, Material des Strahlreglers ergänzt).
  - Versuch 1: gleichmässige helle Schrägstreifen über die ganze Tür – zu grafisch, verworfen.
  - Versuch 2: Schlieren nur stellenweise und vor allem in Griffhöhe, Abdrücke kleiner und seltener – übernommen.
- **Stationsbilder:** Eingang und Bad neu gerendert. «Vorher» ohne sichtbaren Unterschied wird verworfen (Bad-Übersicht 0,025 %, WC 0 % der Bildpunkte); dort blendet der Bildmodus den Vergleich aus.

## Ergebnis (Endstand)

### Sichtbar umgesetzt

- **Schmutz → sauber an fünf Stellen**, jeweils in Weltkoordinaten mit festem Startwert, Wischkante mit kurzer Nässe, vorwärts und rückwärts gleich:
  - Gartenweg: Laub, Moos an den Rändern, Schmutzfilm;
  - Eingang: Gehspuren mit eingetragenem Schmutz, Fingerabdrücke und Schlieren an der Lifttür;
  - Wohnung: Staubfilm auf Parkett, Tisch und Sitzflächen;
  - Bad: Kalk an Armatur und Strahlregler, Wasserränder und Tropfen im Waschtisch.
- **Vergleich an den Stationen:** «Vorher», «Nachher», Regler «Reinigungsfortschritt» (Maus, Touch, Tastatur), Hinweis «Illustration eines Arbeitsablaufs, kein Kundenergebnis.». Im Bildmodus (Handy, ohne WebGL) Bilder derselben Kamera.
- **Licht:** weiches Tageslicht als Standard, «Dämmerung» umschaltbar.
- **Demo-Rundlauf ≈ 48 s** auf Knopfdruck, nahtlos hinter der Hecke, Start/Pause/Fortsetzen/Beenden.

### Wo starten

- **Vergleich:** in der Reise (Startseite → «Gebäude entdecken» → Abschnitt Rundgang) an den Stationen Garten, Eingang, Wohnung und Bad: Knöpfe «Vorher» / «Nachher» und der Regler unter dem Stationstext.
- **Demo:** in der Leiste unten in der Bühne: «Demo-Rundlauf starten». Auf dem Handy zuerst «3D-Ansicht starten». Bei «Bewegung reduzieren» wird die Demo nicht angeboten.

### Belege in diesem Ordner

| Datei | Inhalt |
|---|---|
| `vergleich-desktop.jpg`, `vergleich-handy.jpg` | Ausgangsstand und Endstand: Startseite und sechs Stationen (Desktop 1440×900 3D, Handy 390×844 Bildmodus), beschriftet |
| `bad-zustaende.jpg` | Waschtisch vorher · halb gereinigt · nachher, gleiche Kamera |
| `stationen-vorher-nachher.jpg`, `details-1zu1.jpg` | Stationsbilder «Vorher»/«Nachher» und Ausschnitte in Originalgrösse |
| `demo-rundlauf.mp4` | ganze Demo, 48 s, 1280×720, 24 Bilder/s. Bild für Bild aus der Software-Grafik in voller Qualität gesetzt (`demoSeek`), keine Echtzeitaufnahme. Weil die Aufnahme die Demo dafür anhält, zeigt der Knopf «Fortsetzen» statt «Pause» |
| `demo-rundlauf-naht.mp4` | Naht, 12 s: 46 → 48 = 0 → 2 s in Echtzeit, danach 47 → 1 s in vierfacher Zeitlupe |
| `demo-rundlauf-naht.jpg` | letztes Bild (47,958 s) und erstes Bild (0 s) mit Differenz. Bildfläche ohne Stationstext: mittlere Abweichung 0,46 % (Rest: aktive Station in der Leiste); reine Zeichenfläche laut t28: 0,006 % |
| `demo-dreimal.txt` | Demo dreimal in Echtzeit abgespielt: Nähte, Zeitsprünge, Kamerasprünge, Bildwechsel |
| `testlauf.log` | vollständige Ausgabe des Gesamtlaufs |

Die Rohbilder (PNG) liegen in `shots/realismus/` (nicht im Repository): `baseline-*`, `final-*`, `bad-*`, Konsolenprotokolle `*-konsole.txt`.

### Assets

- **Keine externen Dateien neu eingebunden.**
  - Rauschtextur der Schmutzschicht: im Code erzeugt (`mkNoise`, fester Startwert).
  - Stationsbilder und «Vorher»-Bilder: aus der eigenen Szene gerendert (`tools/render-stills.js`).
  - Materialtexturen: unverändert prozedural (`tools/make-textures.py`).
- **Canva-Board:** nur gelesen, nichts übernommen (siehe oben).
- **Fotos der Seite:** unverändert. Herkunft und Kennzeichnung wie bisher in `rise.json → assets.photos`.

### Prüfungen (Endstand, 18.10.2026)

- **Gesamtlauf** `sh tests/alle.sh`, zusammenhängend, ohne Wiederholung: **612 bestanden, 0 fehlgeschlagen** (`npm test` mit Build, RISE, t15, t7, t9, t11, t14, t16–t28; dazu t12 und t13 mit lokalen Servern). Ausgabe: `testlauf.log`.
- **Davor zwei nicht bestandene Gesamtläufe:**
  - 364/2: t16 Alternativtext, t18 WC-Fahrt; danach brach die Kette ab.
  - 403/6: t9 Logo, t20 Knopfhöhe.
  Ursachen und Korrekturen stehen unter Runde 5.
- **t28 Realismus (50 Prüfungen):**
  - Zonen und Determinismus, vorwärts = rückwärts;
  - Vorher/halb/Nachher mit gleicher Kamera, kein Flimmern;
  - Vergleichsknöpfe, Regler per Tastatur, Stationswechsel;
  - Tageslicht/Dämmerung, Tageslicht-Belichtung;
  - Demo-Zeitplan ohne Sprung, Naht gleich und verdeckt, Pause, Beenden;
  - Abbruch durch Scrollen und Stationswahl, keine zweite Schleife, `destroy()`;
  - Handy-Bildmodus mit «Vorher»-Bild, Vergleich nur mit sichtbarem Unterschied;
  - Handy-3D-Demo, Stillstand ausserhalb des Bildes;
  - «Bewegung reduzieren».
- **Demo dreimal in Echtzeit:** `demo-dreimal.txt`.
- **Konsole:** Desktop und Handy ohne Fehler, Warnungen oder fehlgeschlagene Anfragen (`shots/realismus/final-konsole.txt`).

## Offene Punkte und bekannte Grenzen

1. **Nicht fotorealistisch.**
   - Die Verschmutzung ist prozedural und bleibt erkennbar synthetisch, besonders die Wasserränder im Becken (3 Versuche, Grenze erreicht).
   - Der Schmutzfilm auf dem Gartenweg wirkt eher körnig (terrazzoartig) als wie ein Belag.
   - Fotografische, lizenzierte Materialscans würden das verbessern (Lizenz und Kosten vorher klären).
2. **«Nachher» altert nicht zusätzlich:** Der saubere Zustand ist das bestehende Material (Putzstruktur, Fugen, Plattentöne) ohne eigene Patina.
3. **Nicht umgesetzt:**
   - Räumungsgegenstände in der Wohnung;
   - Glasschlieren an der Haustür (das Türglas wird vereinfacht ohne Materialschicht gezeichnet).
   Am Eingang zeigen stattdessen Lifttür und Boden den Unterschied.
4. **Bad-Übersicht und WC:** In diesen Ansichten liegt keine Zone im Bild, deshalb gibt es dort kein «Vorher»-Bild, und der Bildmodus blendet den Vergleich aus. Im 3D wirkt der Vergleich in der Übersicht nur schwach (Waschtisch klein im Bild).
5. **Demo-Naht:** Das Bild ist nahtlos (Hecke formatfüllend). Der Stationstext wechselt an der Naht sichtbar von «Station 6» zu «Station 1» – gewollt, weil er die Orientierung gibt. Drehungen bis ≈ 86°/s in den kurzen Innenabschnitten (Gestaltungsdauer 48 s).
6. **Software-Grafik:** Die Demo-Zeit läuft je Bild höchstens 0,25 s. Auf langsamen Rechnern läuft sie deshalb langsamer statt ruckartig.
7. **Leistung auf echter Hardware nicht gemessen:** Alle Messungen stammen aus Headless-Chromium mit SwiftShader. Echte GPUs (Mac/Windows), echtes iPhone und Android, Safari und der Wix-Live-Test stehen aus. Browseremulation ersetzt keinen echten Gerätetest.
8. **Tageslicht:** Die Putzstruktur der Fassade wirkt im Tageslicht fleckiger als in der Dämmerung (nicht geändert).
9. **Nicht veröffentlicht:** keine Domain, keine Wix-Seite verändert. Das im Auftrag genannte Repository `infoimmoready-commits/immoready` wurde nicht berührt.
