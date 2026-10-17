# Realismus-Auftrag · Arbeitsstand

Auftrag: `IMMOREADY-CLAUDE-CODE-MASTERPROMPT.md` (Upload vom 17.10.2026). Dieser Stand wird nach jeder Runde nachgeführt.

## Verwendete Quelle

- **Vollständiges Quellprojekt:** dieses Repository (`arditgashi535-blip/immoready`, Branch `v17.1-release-candidate`). Die angehängte Vorschau-HTML wird daraus gebaut (`python3 build.py` → `dist/immoready-vorschau.html`). Es musste nichts aus der HTML rekonstruiert werden.
- **Das im Auftrag genannte Repository `infoimmoready-commits/immoready`** (Wix-Gerüst) ist in dieser Sitzung nicht freigegeben. Es wurde weder gelesen noch verändert; daraus wird nichts abgeleitet.
- **Canva «ImmoReady photo board»** (`DAHXQAIJpu4`): wird nur lesend geprüft, soweit der Connector Zugriff gibt. Das Vorhandensein im Board ist kein Lizenznachweis.
- **Sites:** In dieser Sitzung nicht verwendet. Die private Vorschau ist das Claude-Artefakt (privat).
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
| 2 | Übertragung auf Gartenweg (Laub, Moos), Eingangshalle (Staub, Schuhspuren), Wohnung (Staub) + Vergleich Vorher/Nachher/Regler | in Arbeit |

### Runde 1 – Bad-Prototyp (Befunde und Korrekturen)

- **Umsetzung:** Schmutzschicht im Material-Shader (`DIRTF`/`DIRTM` in `tour-core.js`), bis 6 Zonen aus `rise.json → tour.cleaning`. Jede Zone hat Box, Art, Wischrichtung, Kante, Material, festen Startwert und Fortschrittsbereich. Die Schicht verändert Farbe, Rauheit und Metallanteil, die feuchte Kante ist kurz glänzender und dunkler.
- **Beobachtung 1:** Rechnendes Rauschen pro Pixel war in der Software-Grafik zu teuer (Bad-Nahaufnahme 4,6 s statt 0,6 s je Bild). **Behoben** mit einer einmal erzeugten, kachelbaren Rauschtextur 128² (eigene Erzeugung, fester Startwert). Jetzt wieder im Bereich des Ausgangsstands.
- **Beobachtung 2:** Die Wasserränder wirkten wie Marmor und lagen auch auf der Aussenschürze. **Behoben:** einzelne eingetrocknete Tropfenränder (1–2 cm, unregelmässig), matter Film zum Ablauf hin. Die Zone ist auf Becken und Ablage begrenzt.
- **Beobachtung 3:** Kalk lag als Flecken über der ganzen Armatur. **Behoben:** Kalk sitzt am Armaturenfuss (dichter nach unten) und am Strahlregler (eigene Zone). Im sauberen Zustand ist der Chrom wieder spiegelnd.
- **Beobachtung 4:** Gartenweg, Halle und Wohnung zeigten keine Wirkung. **Ursache 1:** Die Schleife mit `continue` wurde von ANGLE/SwiftShader fehlerhaft übersetzt; sie ist jetzt ohne `continue` geschrieben. **Ursache 2:** Die Box des Weges lag unter der Wegoberfläche (Weg 5 cm über Gelände).
