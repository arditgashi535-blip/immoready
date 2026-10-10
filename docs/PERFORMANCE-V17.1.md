# Performancebericht V17.1

Gemessen am 10. Oktober 2026 in dieser Arbeitsumgebung: Headless-Chromium, **Software-GPU (SwiftShader)**, 4 CPU-Kerne.
Die Bildzeiten sind nur relativ aussagekräftig (Vorher/Nachher). Auf echter GPU liegen sie um Grössenordnungen tiefer.
Echte Geräte wurden nicht gemessen.

## Bildzeiten (`node tests/bench-frames.js`, 5 Stationen, ms je Bild)

| Stand | Eckpunkte | bereit nach | volle Auflösung | Auflösung 0,5 |
|---|---|---|---|---|
| V17 Ausgangsstand | 407 184 | 4,6 s | 690 · 756 · 829 · 674 · 820 | 331 · 332 · 289 · 234 · 298 |
| V17.1 final | 436 158 (+7 %) | 3,7 s | 680 · 741 · 824 · 665 · 823 | 334 · 333 · 307 · 243 · 303 |

Die Bildzeiten sind innerhalb der Messstreuung unverändert. Die zusätzlichen Eckpunkte stammen fast ganz aus dem feineren
Licht-Raster (Badwand, Vorder-/Seitenfassade). Sie liegen unter der Grenze aus t19 (V16 + 25 % = 451 680).

## Dateigrössen

| Datei | V17 | V17.1 |
|---|---|---|
| `dist/immoready-vorschau.html` (Einzeldatei, Vorschau) | 3,44 MB | 3,46 MB |
| `assets/bake/licht.json` (Lichtdaten) | 510 kB | 539 kB |
| `dist/site/` gesamt (Produktionsform) | – | 2,86 MB (Fotos 845 kB, Stationsbilder 483 kB, Lichtdaten 539 kB, Texturen 372 kB) |

## Unverändert wirksam

- Rendern nur bei Bedarf, Pause ausserhalb des Sichtbereichs und bei verstecktem Tab (t11).
- Sichtkegel-Auswahl der statischen Blöcke, vereinfachte ferne Bäume/Häuser.
- Smartphones (≤ 700 px) laden kein WebGL, keine Texturen und keine Lichtdaten, sondern die Hochformat-Stationsbilder
  (960×864, WebP). Texturen und Lichtdaten werden nur geladen, wenn 3D startet.
