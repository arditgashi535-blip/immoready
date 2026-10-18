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

> Hinweis: Diese Liste beschreibt den Stand vor Überarbeitung 2. Die Dateien wurden mit dem Endstand der Überarbeitung 2 neu erzeugt (gleiche oder neue Namen); massgeblich ist die Liste unter «Ergebnis Überarbeitung 2».

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

---

# Überarbeitung 2 (18.10.2026)

Auftrag: «3D-Reise so realistisch wie mit der tatsächlichen technischen Grundlage möglich» (Ergänzung zum Masterprompt).

## Ausgangspunkt gesichert

- Branch `v17.1-release-candidate`, Commit `ade7f1a`, lokaler Tag `realismus-r6-stand`.
  - Das Hochladen des Tags lehnt der Git-Proxy ab (403, nur der Arbeitsbranch ist freigegeben).
  - Der Remote-Branch steht auf demselben Commit.
- `python3 build.py` erzeugt byteweise denselben Stand wie im Repository.
- Die private Vorschau (Artefakt, Version 26) enthält genau diesen Build (Vergleich der Dateien: identisch bis auf die Hülle des Dienstes).
- **Freigabe der Vorschau:** Der Artefakt-Dienst meldet beim Lesen «shared with anyone with the link». Die Vorschau ist also derzeit **für alle mit dem Link** offen, nicht privat. Die frühere Angabe «privat» aus der Veröffentlichungsmeldung war damit falsch. Claude kann die Freigabe nicht ändern (Teilen-Menü der Seite).
- Das hochgeladene Archiv `immoready-website-v17-final.zip` (9.10.2026, V17, ohne Reinigung, Demo und Prüfungen ab t20) ist älter. Es wurde nur angesehen, nicht entpackt und nicht verwendet.

## Runde 7 – Beurteilung wie ein Architekturvisualisierer

Bilder: `shots/beurteilung/r7vorher-*` (Kundenansicht mit Kopf und Bedienung sowie reine Szene; 1280×720, 1440×900, Handy-Bildmodus und Handy-3D), Werkzeug `tools/beurteilung-bilder.js`. Konsole ohne Fehler.

Stärkste sichtbare Ursachen, nach Wirkung geordnet (Fläche × Blickpunkt):

| # | Bereich | Beobachtung |
|---|---|---|
| 1 | Kamera/Bildausschnitt | Die 3D-Bühne liegt im Scrollmodus **unter dem festen Kopf**. Die obersten 74–112 px sind verdeckt: Bei 1280×720 fehlt die Armatur oben, der WC-Deckel ist angeschnitten, an der Fassade fehlen die oberen Balkone. |
| 2 | Kamera/Bildausschnitt | Waschtisch-Nahansicht: Kamera zu nah und zu tief. Die Aussenschürze füllt die untere Bildhälfte, das Becken wirkt wie eine übergrosse Wanne. Beim WC liegt das Motiv unter dem Textblock. |
| 3 | Überlagerung | Bad-Übersicht 1280×720: «Ablaufventil» über dem Titel, «Siphon und Eckventile …» über dem Regler, «Schematische Kennzeichnung» im Textblock, «Armatur» am Kopf. Wohnung: Textblock höher als die Bühne, der Anfrageknopf liegt über der Kennzeichnung unten links. In Nahansichten bleibt der ganze Text (Absatz, Regler, Auswahl, Aktionen) stehen. |
| 4 | Licht | Tageslicht gleichmässig grau, ohne Richtung: kaum Schlagschatten von Gebäude, Balkonen und Bäumen auf Boden und Fassade. Innen fast keine Kontaktschatten unter Tisch, Stühlen und Sofa. Die Raumtiefe geht verloren. |
| 5 | Pflanzen | In allen Beeten dieselben ockergelben Gräserbüschel mit gleicher Silhouette und Farbe – die Wiederholung ist schon aus der Gesamtansicht erkennbar. Sträucher als gleichmässig grüne Kugeln ohne Tiefe. Kein Bodenkontakt (keine Verschattung am Fuss, flache braune Erde). Rasen einheitlich grün. |
| 6 | Material | Gartenweg als einheitliche Betonfläche ohne Plattenfugen und ohne Alterung – im «Nachher» fabrikneu. Parkett ohne Brettgrenzen. Fassadenputz mit grossen, wolkigen Flecken statt feiner Körnung. |
| 7 | Schmutz | Wasserränder als verteilte Ringe ähnlicher Grösse über das ganze Becken (dekorativ statt aus Tropfwasser entstanden). Keine Unterscheidung von Beckenboden, Rückwand und Ablage. |
| 8 | Handy | Vergleichsknöpfe stehen weit unter dem Bild und am Eingang teilweise hinter der Kontaktleiste. Wer «Vorher» drückt, sieht die Wirkung erst nach dem Zurückscrollen. |
| 9 | Demo-Naht | Bild nahtlos, der Stationstext springt aber sichtbar von Station 6 auf Station 1. |
| 10 | Geometrie | Sofa und Sitzbank aus wenigen gefasten Quadern. Nachbarhäuser als einfache Kisten mit Fensterraster (in der Gesamtansicht gross im Bild). |

**Titelbild und Rundgang:** Das Titelbild (KI-Symbolbild: beiger Bau mit Loggien, Abendlicht) und der Rundgang (weisser Putzbau, Tageslicht) zeigen verschiedene Gebäude. Beide sind gekennzeichnet («Symbolbild (KI)», «Illustrative Visualisierung · kein Referenzobjekt»). Der Rundgang darf nicht als dasselbe Objekt erscheinen.

**Reihenfolge der Arbeit:**
1. Kamera und Bildausschnitt, Überlagerungen (1–3, 9).
2. Licht (4).
3. Pflanzen (5).
4. Material (6).
5. Schmutz (7).
6. Handy (8).
Geometrie (10) nur dort, wo sie gross im Bild ist.

**Titelbild und Rundgang (geprüft):** Der Knopf im Einstieg heisst «Gebäude entdecken» (Vorgabe Premium-Durchgang) und führt zum Rundgang. Weder dort noch im Rundgang steht, dass Titelbild und Rundgang dasselbe Gebäude zeigen. Die Szene trägt durchgehend «Illustrative Visualisierung · kein Referenzobjekt», das Titelbild «Symbolbild (KI)». Unverändert gelassen.

## Runde 8 – Bühne, Bad-Kamera und Überlagerungen (Befunde 1, 2, 3, 9)

Bilder: `shots/beurteilung/r8*` (Kundenansicht und reine Szene), Werkzeug `tools/beurteilung-bilder.js` (neu: `PUNKTE=5-bad` für einzelne Punkte).

| Befund | Änderung | Nachweis |
|---|---|---|
| Bühne unter dem festen Kopf | Die Zeichenfläche beginnt unter dem sichtbaren Kopf: `--hdrv` = gemessene Kopfhöhe `--hdrh` minus dem Teil, der beim Scrollen über den Rand gleitet (36 px, ≤ 980 px Breite 26 px). 1280×720: Bühne 1280×623 ab y 97. Erster Versuch mit `--hdrh` allein ergab ein dunkles Band (sticky top −36 px); korrigiert. | t29: Oberkante = Kopfunterkante ± 1,5 px bei 1280×720, 1440×900, 1920×1080 |
| Stationstext in der Bedienleiste | Alle Texte stehen in derselben Rasterzeile; ihre Höhe bestimmte der höchste, ausgeblendete Text (Wohnung 636 px) und schob kürzere nach unten. Jetzt `grid-template-rows:minmax(0,1fr)`; niedrige Desktops (≤ 820 px hoch) mit kompaktem Text (440 px, kleinere Titel). | t29: alle Stationen und Nahansichten über der Bedienleiste, links der Stationsleiste |
| Bad-Kameras (Waschtisch zu nah und zu tief, Armatur oben abgeschnitten, WC unter dem Text) | Übersicht aus der Raumecke bei der Tür (x 4,9 m, Bildwinkel 1,04): Waschtisch, Spiegelschrank, Vorwand und WC gemeinsam. Waschtisch (0,66 statt 0,56, Blick leicht nach rechts): Armatur, Becken, Ablauf, Schürze und Unterschrank. WC weiter zurück (0,82) mit Betätigungsplatte. Ein erster Übersichtspunkt (x 5,05) stiess an Türzarge und Badtürflügel (`checkRoute`: Körper 183/185) – nach innen versetzt. | Route kollisionsfrei, grösste Drehung 30,4° je 1 % (p 0,424, unverändert), Nahebene ≥ 0,203 m |
| Motiv wird auf grossen Bildschirmen grösser als der freie Bereich | **Bildausschnitt in Bildpunkten** (`rise.json → keyframes[].fit`): Stationstext und Stationsleiste haben feste Grössen; auf Bühnen höher als 623 px weitet der Kern den Bildwinkel, damit das Motiv seine Grösse in Bildpunkten behält. Nur Querformat, nur die drei Badansichten; Stationsbilder ohne diese Regel (Text steht dort unter dem Bild). | t29: Waschtisch 479 px breit bei 1280×720, 1440×900 und 1920×1080 (± 3 %) |
| Beschriftungen über Titel, Regler und Kopf | Eine Beschriftung erscheint nur innerhalb der Bühne und ohne Überschneidung mit der ganzen Textspalte, Stationsleiste, Bedienleiste, Kennzeichnung oder einer anderen Beschriftung. «Schematische Kennzeichnung» steht unter oder über den sichtbaren Markierungen, ohne Markierung entfällt sie. In der WC-Nahansicht stehen keine Waschtisch-Beschriftungen mehr am Bildrand. | t29 |
| Vergleich ohne sichtbare Wirkung | Im 3D wie im Bildmodus: Vergleich nur, wo ein «Vorher»-Bild derselben Ansicht existiert (WC-Nahansicht und Bad-Übersicht ohne Vergleich). | t29, t28 |
| Viel Text in Nahansichten | Nahansichten (Waschtisch, WC): Absatz ausgeblendet, Text 440 px. Neuer Knopf **«Details ansehen»** in der Bedienleiste: nimmt Absatz, Auswahl, Leistungspunkte, Beschriftungen und den dunklen Verlauf zurück; Titel, Vergleich, Stationen, «Tour überspringen» und «Offerte anfragen» bleiben. «Text einblenden» stellt alles wieder her. Maus, Enter, Leertaste, sichtbarer Fokus, 44 px. Nur im 3D (im Bildmodus steht der Text unter dem Bild). | t29 |
| Demo-Naht: Text springt von Station 6 auf 1 | Während die Hecke das Bild verdeckt (46,9 s bis 0,9 s), ist kein Stationstext sichtbar; der Wechsel geschieht verdeckt. | t29 (46,4 s Station 6 · 47,5 s und 0,3 s kein Text · 1,6 s Station 1) |

Nebenbefund: `render-stills.js` hätte nach der Kopfregel verzerrte Bilder erzeugt (Bühne 1440×803, auf 1440×900 gestreckt). Jetzt volle Bildgrösse (`--hdrv:0`) und Abbruch, wenn die Bühne nicht die Bildgrösse hat.

## Runde 9a – Waschtisch: Schmutz aus seiner Entstehung (Befund 7)

Anlass: Im ruhigeren Ausschnitt (Waschtisch ≈ 480 px breit, rund 1 Bildpunkt je mm) fiel der Vorher/Nachher-Unterschied unter die Sichtbarkeitsschwelle der Stationsbilder (0,06 % der Bildpunkte, Schwelle 0,1 %). Die Ringe waren gleichmässig über Becken und Ablage verteilt, die Armatur rundum fleckig. Mehr Schmutz wäre die falsche Antwort gewesen; geändert wurde der **Ort**:

- `rise.json → tour.cleaning.zones[].focus`: Entstehungsorte [x, y, z, Radius, Gewicht], der erste ist der Hauptort. `wipeTo`: Zielort des Wischwegs. Geprüft in `tools/rise.py` (höchstens 4 Orte, Radius ≤ 0,5 m, Orte in der Box).
- **Armatur (Kalk):** Kalkfuss über der Rosette (1–2 cm, ausgefranster Rand), Kruste am Strahlregler (Hauptort), wenige eingetrocknete Tropfen vorne am Körper (Spritzrichtung). Kein flächiges Fleckenmuster mehr.
- **Waschtisch (Wasser und Seife):** matter, beige-grauer Seifen- und Kalkfilm um den Ablauf mit Schmutzring am Rand des Ablaufdeckels; eingetrocknete Tropfenränder (Ø 6–12 mm, zu einer Seite offen) um Armaturenfuss und Seifenspender, sonst vereinzelt; aussen an der Schürze wenige blasse Laufspuren mit Tropfen am Ende. Die Beckenwände bleiben weitgehend frei (dort läuft Wasser ab). Grössen auf den Bildmassstab abgestimmt – feinere Spuren erschienen in der Prüfung als dunkle «Pfefferpunkte» und feine Kratzer.
- **Wischweg:** Becken vom Rand zum Ablauf (radial, leicht wellige Front), Armatur von oben nach unten. Nasskante je Material: Keramik und Chrom glänzender und nur 7 % dunkler, schmal hinter dem Tuch; Böden wie bisher (22 %, breit). Zustand weiter nur aus dem Fortschritt.
- **Leistung** (Software-Grafik SwiftShader dieser Umgebung, 1440×900, ohne `IR_FORCE_HQ`; keine Messung auf echter GPU): Nahansicht «Vorher» 928 ms (Ausgangsstand 869 ms), sauber 663 ms (577 ms – der weitere Ausschnitt zeichnet mehr Raum), Anfahrt p 0,705/0,715: 1340/1319 ms (1475/1277 ms). Zusatzkosten der Schmutzschicht 265 ms (Ausgangsstand 292 ms). Eine erste Fassung mit zwei Ringlagen und `atan` je Bildpunkt kostete 362 ms und wurde vereinfacht.

## Runde 9b – Materialien (Befund 6)

- **Gartenweg, Veloplatz, Terrasse:** Seit V17 enthält die Plattentextur keine eingebrannten Fugen mehr (innen zeichnet der Shader die Fugen); die Beläge aussen waren dadurch durchgehende Flächen. Jetzt einzelne Platten (Gehweg ≈ 52 × 50 cm, Veloplatz ≈ 56 × 50 cm, Terrasse ≈ 79 × 60 cm – illustrative Masse, keine Normangabe) mit 8-mm-Fugen über einem dunklen Sandbett, Fase 4 mm, Ton je Platte ±5 %, Höhe je Platte ±1 mm, einzelne Platten verwittert dunkler. Das vorab gerechnete Licht dunkelt die Fugen zusätzlich ab.
- **Parkett:** Die Holztextur enthält 19-cm-Dielen mit Stössen; deren Fugen verschwanden in der Texturfilterung. Die Längsfugen werden jetzt je Bildpunkt nachgezeichnet (1,6 mm, mit Kantenglättung, nur am Boden), passend zum Raster der Textur.
- **Fassadenputz:** Die «Wolken» waren keine Textur, sondern Interpolationsfahnen des je Eckpunkt gebackenen Lichts. Mit Sonnenschatten wären sie deutlicher geworden; Vorder- und Seitenfassade sind deshalb auf 17 cm statt 34 cm gerastert (+48 000 Eckpunkte im Gebäude, Backen 88 s statt 81 s). Baum- und Balkonschatten sind jetzt klar umrissen.
- **Trennung der Ebenen** (unverändert und geprüft): Grundfarbe je Eckpunkt, feine Struktur aus der Textur, Rauheit/Glanz aus der Materialtabelle, dauerhafte Alterung als Farbabweichung und Verlaufsflächen (Fassade, Platten), entfernbare Verschmutzung als eigene Schicht (Reinigungszonen), Feuchte nur an der Wischkante.

## Runde 10 – Licht und Vegetation (Befunde 4 und 5)

**Licht.** Vorher kamen 84 % des Tageslichts gleichmässig vom Himmel, die Sonne trug 16 % bei – ohne Schatten. Jetzt:
- Lichtwerkzeug mit zwei weiteren Kanälen je Eckpunkt (4 statt 2 Byte, `assets/bake/licht.json` 510 KB statt 404 KB):
  - **Sonnensichtbarkeit** – 16 Strahlen in Sonnenrichtung (Höhe 58°), Kegel ±1,5°, Laub lässt 45 % durch;
  - **Himmel durch Öffnungen** innen – 192 Strahlen, über 35 cm innerhalb desselben Raums geglättet.
- Gemessen (`WS_STATS=1 node tools/bake-light.js`): Wohnraum Boden Median 0,8 % Himmel, 90 % bei 1,9 % – realistische Tageslichtquotienten. Bad ohne Fenster ≈ 0 (Leuchten tragen das Licht).
- Die erste Abtastung mit 40 Strahlen ergab fleckige Wände (Median 0); verworfen.
- Aussen: Himmel (20–50 %) plus Sonne (bis 62 %) mit Schatten, Sonnenglanz im Schatten aus. Innen: Grundaufhellung plus Fensterlicht, das mit dem Abstand zur Öffnung abnimmt, plus Sonnenflecken durch die Fenster.
- Dämmerung unverändert.
- Ohne Lichtdaten (Handy-3D lädt keine) bleibt es bei Licht ohne Schatten.
- Kein zusätzlicher Dunst, keine Abdunklung, keine Unschärfe, kein Leuchtschimmer.

**Vegetation.**
- Beete in Gruppen («Drifts») aus drei Grassorten statt gleicher Büschel in Reihe: ockerfarbenes Lampenputzergras, niedriger blaugrauer Schwingel, grüne Segge. Dazu Stauden, Grössen gestreut, Mindestabstand 26 cm.
- Bodenkontakt: dunklere Erde direkt unter jeder Pflanze mit weichem Verlauf; das Laub verschattet zusätzlich im vorab gerechneten Licht.
- Heckenkarten bewegen sich im Wind kaum noch (geschnittene Hecke). Stämme und Äste waren schon unbewegt.
- Rasen mit dezenten Mähstreifen (0,6 m, ±6 %).
- **Pflanzenassets geprüft:** Im Projekt liegen keine lizenzierten Pflanzenmodelle oder -texturen. Vorhanden ist nur der eigene, prozedural erzeugte Laubatlas `assets/tex/laub.webp` (`tools/make-textures.py`, `assets/tex/LIZENZ.txt`: eigenes Werk). Es wurde nichts heruntergeladen.

## Runde 11 – Handy, Funde aus dem Prüflauf, Leistung

- **Handy (Befund 8):** Vergleich direkt am Bild (`.jr-cmpo`, oben rechts im Bildrahmen) mit dem Hinweis «Illustration · kein Kundenergebnis». Im Bildmodus ersetzt er die Knöpfe im Stationstext (nicht doppelt), im Handy-3D bleibt dort der Regler «Reinigungsfortschritt». Wer «Vorher» antippt, sieht die Wirkung, ohne zurückzuscrollen. Geprüft per Antippen und Tastatur (t29, t28). Ladehinweis «3D wird geladen …» und der Rückfall «3D läuft auf diesem Gerät nicht flüssig. Sie sehen Bilder derselben Szene.» waren schon vorhanden und sind unverändert.
- **Fund 768 px (t14):** Die neue Polsterung der Bühne galt für alle Breiten und hob auf Tablets (Hochformat) den Platz für die Stationsleiste auf – Anfrageknöpfe lagen darunter. Jetzt nur auf dem Desktop; ≤ 980 px steht der Text wie vor der Kopfregel.
- **Fund Leistungspunkt Bad (t17):** In der neuen Bad-Übersicht ragte die 190 px breite Beschriftung 7 px in die Stationsleiste und wurde deshalb ausgeblendet. Ist die bevorzugte Seite belegt, steht die Beschriftung jetzt auf der anderen Seite; ausgeblendet wird nur, wenn beide Seiten belegt sind.
- **Fund Vergleich in der Bad-Übersicht (t28):** Folge der Regel «Vergleich nur, wo er etwas zeigt»; die Prüfung bedient den Vergleich jetzt an der Nahansicht Waschtisch und prüft, dass die Übersicht keinen zeigt.
- **Leistung** (nur Software-Grafik SwiftShader dieser Umgebung, 1440×900, ohne `IR_FORCE_HQ`; Ausgangsstand = Build von `ade7f1a`): {{BENCH}}
- **Vertex-Attribute** unverändert 8 (`p`, `n`, `c`, `em`, `lt`, `lt2`, `sl`, `sc`); die Sonnensichtbarkeit steckt aussen in der Glanzfarbe `sc`. Keine neue Shader-Variante und keine neue Schleife: die Wasserränder sind eine Lage statt zwei, der Wischweg ohne `atan`. Die übrigen Neuerungen sind Rechnung ohne Verzweigung (Mähstreifen, Parkettfugen) oder liegen im vorab gerechneten Licht.

## Ergebnis Überarbeitung 2 (Endstand)

Sichtbar umgesetzt, Reihenfolge nach Wirkung:
1. Die Szene liegt vollständig unter dem Kopf. Text, Beschriftungen und Leistungspunkte überdecken weder Motiv noch Bedienung. Die Bad-Nahansichten zeigen Armatur, Becken und Reinigungsflächen bei 1280×720, 1440×900 und 1920×1080 gleich gross und frei.
2. Tageslicht mit Richtung: Schlagschatten von Baum, Balkonen und Vordach, Fensterlicht mit Abfall in den Raum, Sonnenflecken innen; Dämmerung unverändert umschaltbar.
3. Gartenweg, Veloplatz und Terrasse aus einzelnen, leicht verschiedenen Platten; Parkett mit Dielenfugen; Fassade ohne Interpolationsfahnen.
4. Beete in Pflanzgruppen mit drei Grassorten, Stauden und Sträuchern, Bodenkontakt; Rasen mit Mähstreifen; Hecken ruhig.
5. Schmutz am Waschtisch nach seiner Entstehung, Reinigung vom Rand zum Ablauf mit materialgerechter Nasskante; Vergleich nur, wo er etwas zeigt.
6. «Details ansehen», neutraler Text an der Demo-Naht, Vergleich am Bild auf dem Handy.

**Kein Fotorealismus:** Die Bilder bleiben sichtbar stilisiert: prozedurale Texturen, Laubkarten, Licht je Eckpunkt. Die Szene ist durchgehend als «Illustrative Visualisierung · kein Referenzobjekt» gekennzeichnet, der Vergleich als «Illustration eines Arbeitsablaufs, kein Kundenergebnis».

### Belege in diesem Ordner (alle aus dem Endstand)

| Datei | Inhalt |
|---|---|
| `vergleich-desktop.jpg` | Ausgangsstand (`ade7f1a`) und Endstand, 1280×720, Kundenansicht, alle Stationen und Nahansichten |
| `vergleich-handy.jpg` | dasselbe auf dem Handy 390×844, Bildmodus und Handy-3D |
| `uebersicht-desktop.jpg` | Endstand 1440×900 mit Bedienung und als reine Szene |
| `bad-zustaende.jpg` | Waschtisch bei 0 / 25 / 50 / 75 / 100 % (Regler in der Website), Kundenansicht und Ausschnitt 1:1 |
| `vergleich-3d.jpg` | Vorher/Nachher im 3D: Garten, Eingang, Wohnung, Bad |
| `stationen-vorher-nachher.jpg` | Stationsbilder (Bildmodus) Vorher/Nachher, quer und hoch |
| `details-1zu1.jpg` | Ausschnitte 1:1 aus den Stationsbildern |
| `demo-rundlauf.mp4`, `demo-rundlauf-naht.mp4`, `demo-rundlauf-naht.jpg` | Demo-Rundlauf 48 s (Bild für Bild aus der Seite), Naht in Echtzeit und Zeitlupe, letztes/erstes Bild mit Differenz |
| `demo-dreimal.txt` | Echtzeit-Wiedergabe im Browser, drei Durchläufe: Sprünge, Naht, Text an der Naht, Bildabstände |
| `testlauf.log` | tatsächliches Protokoll des Gesamtlaufs |

### Grenzen (Ursache → nächster Schritt)

1. **Schatten nur so fein wie das Eckpunktraster** (Fassaden 17 cm, Boden aussen 50 cm, Böden innen 25 cm). Kleine Schatten fehlen, etwa von Pollern und Stuhlbeinen. → Sonnenschatten je Bildpunkt über eine einmal gerechnete Schattentextur. Erst prüfen: Texturbudget unter WebGL 1 (Einheit 7 ist die letzte freie) und Kosten in der Software-Grafik.
2. **Pflanzen aus vier eigenen Laubkarten.** Aus der Nähe bleiben Silhouetten kartenhaft. Lizenzierte Pflanzenmodelle gibt es im Projekt nicht. → Lizenzierte Assets nur nach Ihrer Freigabe, Kosten und Lizenz vorher klären.
3. **Prozedurale Texturen** ohne fotografische Mikrostruktur. → Lizenzierte Materialscans nach Freigabe.
4. **Nicht bearbeitet:** Nachbarhäuser als einfache Baukörper und das Sofa aus wenigen Quadern (Befund 10).
5. **Handy-3D lädt keine Texturen und Lichtdaten**, dort also ohne Schatten (bewusst, Ladezeit).
6. **Messungen nur in der Software-Grafik dieser Umgebung.** Keine Bildraten auf echter Hardware gemessen. Safari, iPhone und Android sind nicht geprüft.
7. **Eine Tageszeit:** Sonne fest, etwa 58° hoch. Der Himmel bleibt dunstig hell.

### Freigabe der Vorschau

Der Artefakt-Dienst meldet für die Vorschau «shared with anyone with the link». Wer den Link hat, kann sie öffnen; privat ist sie nicht. Ändern lässt sich das nur im Teilen-Menü der Vorschau; Claude kann die Freigabe nicht ändern. Wix-Seite, Domain, Firmenangaben und öffentliche Sichtbarkeit sind unverändert.

### Prüfungen (Endstand)

{{TESTS}}
