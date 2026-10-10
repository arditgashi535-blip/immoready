# ImmoReady – Website-Relaunch (Vorschau)

Eigenständige Vorschau der neuen ImmoReady-Website mit einem interaktiven 3D-Rundgang durch ein Schweizer
Mehrfamilienhaus im Raum Zürich/Aargau in der blauen Stunde (V17.1 «Final Realism & Mobile Release Candidate»: Gebäude → Garten → Eingang →
Wohnung → Bad → Terrasse → Gesamtansicht) und dem Rundgang als Web Component `<immoready-tour>` für Wix.
Die Szene ist eine **illustrative Visualisierung, kein Referenzobjekt** und im Rundgang so gekennzeichnet.
Die öffentliche Website auf Wix bleibt bis zur Freigabe unverändert.

**Einzige Quelle für Fakten, Tour und Ereignisse: [`rise.json`](rise.json)** (Schema: `rise.schema.json`).

## Schnellstart

```bash
python3 tools/rise.py                # rise.json prüfen
python3 build.py                     # erzeugt dist/
open dist/immoready-vorschau.html    # Website-Vorschau (eine Datei)
# Produktionsform mit getrennten Dateien: dist/site/ (index.html, site.css, site.js, assets/)
```

Komponente lokal ansehen: `python3 -m http.server 8702 --bind 127.0.0.1` und
`http://127.0.0.1:8702/dist/component/demo.html` öffnen.

## Web Component

```html
<immoready-tour mode="steps" assets-base="https://…/tour/"></immoready-tour>
<script src="immoready-tour.js"></script>
```

- Attribute: `mode` (`steps` | `scroll`), `station` (0–5), `assets-base`.
- Ereignisse: `tour-ready`, `station-change`, `request-quote`, `request-contact`, `tour-error`.
- Velo-Code: [`wix/velo-custom-element.js`](wix/velo-custom-element.js) · Einbau mit Element-IDs: [`wix/EINBAU.md`](wix/EINBAU.md).

## Tests

```bash
npm install
npx playwright install chromium
npm test                    # Build, RISE, Velo-Adapter, Seite, Interaktionen, Rundgang, V13–V17-Prüfungen
npm run test:servers &      # lokale Server für die zwei folgenden Tests
npm run test:embed          # iFrame-Nachrichten
npm run test:component      # Web Component
npm run perf                # Ladeleistung (gedrosselt, Testumgebung)
```

Nach Änderungen an der Geometrie: `npm run bake` (Licht vorab rechnen), danach `npm run render:stills`.

## Inhalt

- `rise.json`, `rise.schema.json`, `tools/rise.py` – Source of Truth, Schema, Prüfregeln, Generatoren.
- `src/` – Quellteile der Seite; `src/tour/` enthält Kern, Geometrie, Web Component und Testseite.
- `assets/` – Original-Logo, Favicon, Stationsbilder (WebP, quer und hoch, aus der 3D-Szene gerendert),
  `assets/tex/` Materialtexturen (prozedural, eigene Werke, `tools/make-textures.py`), `assets/bake/licht.json`
  vorab gerechnetes Licht (`tools/bake-light.js`).
- `dist/` – Vorschau (eine Datei), Produktionsform mit getrennten Dateien (`dist/site/`), Komponente (`dist/component/`), iFrame-Alternative.
- `model/` – GLB-Modell des Wohnblocks (14 Objekte, Geometrie V14; mit `npm run export:glb` aus der V15-Szene neu erzeugbar) und Exportskript.
- `tools/render-stills.js` – Stationsbilder aus der Szene neu erzeugen (`npm run render:stills`).
- `docs/` – Testberichte V13–V17.1, Performancebericht V17.1, 32 Abnahmebilder und Vorher/Nachher-Vergleich (`docs/v171/`).
- `tools/abnahme-mobil.js` – Smartphone-Abnahmebilder 390 px (`node tools/abnahme-mobil.js dist/immoready-vorschau.html shots/v17-mobil`).
- `tools/vergleich.js` + `tools/kameras-vergleich.json` – feste Kameras für Vorher/Nachher-Vergleiche (`node tools/vergleich.js <html> <ordner> alle`).
- `wix/` – Velo-Code für das Custom Element und für die iFrame-Variante, Einbauanleitung.
- `tests/` – Playwright- und Python-Tests.

Details zu Architektur, Regeln und offenen Punkten stehen in [CLAUDE.md](CLAUDE.md).
