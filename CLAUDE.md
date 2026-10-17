# CLAUDE.md – ImmoReady Website (Relaunch-Vorschau)

Kontext für Claude Code. Dieses Repository enthält eine **eigenständige Code-Vorschau** der neuen Website von
ImmoReady (Immobilienservice in Zürich und Aargau, Inhaber Ardit Gashi). Es ist **keine Wix-Integration**. Die
öffentliche Website https://www.immoready.ch (Wix, Classic Editor, Velo aktiv) bleibt unverändert, bis der
Inhaber ausdrücklich freigibt.

## Verbindliche Regeln (immer einhalten)

- **Nichts veröffentlichen** und keine Domain oder Live-Website ändern ohne ausdrückliche Freigabe. Keine
  Wix-Custom-Embeds anlegen (sie wären sofort live). Bestehende Wix-Anfragen, Kontakte und Buchungen nie anfassen.
- **Original-Logo** (`assets/logo_orig.png`, transparentes PNG, Seitenverhältnis 1.318) nie neu zeichnen,
  umfärben, verzerren, beschneiden oder mit Filtern bzw. Leuchteffekten versehen. Immer auf hellem Grund
  (Ivory #FCF8F5) in Kopf und Footer; ein Klick darauf führt zum Seitenanfang.
- **Markenfarben** (aus dem Logo abgeleitet): Ivory #FCF8F5, Paper #F3EDE6, Ink #3B3A39, Graphit #302E2C,
  Night #252321, Sand/«lime» #DCC5A8, Sand dunkel #B39674, Akzenttext #7E6343 (AA-Kontrast). Keine neuen
  Neon- oder Fantasiefarben. Schrift: nur Archivo (Google Fonts).
- **Sprache:** Schweizer Hochdeutsch, «ss» statt «ß», Sie-Anrede, kurze konkrete Texte.
- **Nichts erfinden:** keine Bewertungen, Preise, Garantien, Fachbewilligungen, Notdienst- oder
  24/7-Versprechen, Referenzen, Kundenlogos, Teammitglieder oder Firmengeschichte. ImmoReady nicht automatisch
  «GmbH» nennen.
- **GmbH in Gründung:** Die Website wird für den späteren Auftritt als GmbH vorbereitet, darf die GmbH aber öffentlich nicht
  als gegründet darstellen. Alle Unternehmensangaben nur in `rise.json → firm.company` (`status`, Firmenname, Sitz, Adresse,
  UID, Handelsregister, Vertretung, MWST, `foundingConfirmed`, `goLiveApproved`); Impressum, Datenschutz, Kontakt und Footer
  werden daraus erzeugt (`firm_markup`). Keine Adresse, UID, Registerdaten oder Rollen erfinden. Veröffentlichung erst nach
  bestätigter Gründung und ausdrücklicher Freigabe: `python3 tools/rise.py --launch` / `build.py --release` sperren bis dahin.
  Vorschau nur privat (Claude-Artefakt privat; `noindex` + `robots.txt` sind kein Zugriffsschutz). Details: `docs/VEROEFFENTLICHUNG.md`.
- **Familienbetrieb, Qualifikation:** ImmoReady ist ein Familienbetrieb (`firm.businessType`). Bestätigte Qualifikation: nur
  Fachmann Betriebsunterhalt EFZ (WSF wurde auf Wunsch des Inhabers entfernt und darf nicht wieder erscheinen; Schema und Regeln sperren es).
  Funktion von Ardit Gashi in der GmbH erst nach Bestätigung nennen; bis dahin «Ihr Ansprechpartner».
- **Kontakt:** 076 340 44 01 · info.immoready@gmail.com · Zürich und Aargau.
- **Bilder:** Bildflächen nur über `rise.json → assets.photos` (ID, Motiv, Status ki-symbolbild|eigen|stock|fehlt, Quelle, Lizenz,
  Bildnachweis); Datei `assets/photos/<id>.jpg` ersetzt das Übergangsbild beim Build (`build.py → photos()`), Impressum-Bildnachweis
  wird erzeugt (`photo_credits`). Fotoliste: `docs/FOTOLISTE.md`. Kein Stock- oder KI-Porträt.
  KI-Bilder (Canva) und die 3D-Szene sind Illustrationen und werden als solche gekennzeichnet
  («Symbolbild»; Rundgang: «Illustrative Visualisierung · kein Referenzobjekt» aus `rise.json → tour.scene.label`).
  Sie dürfen nie als echte Objekte, Kundenreferenzen, Mitarbeitende oder Vorher-nachher-Ergebnisse erscheinen.
- **Formular:** Es läuft im Demo-Modus. Eine Erfolgsbestätigung erscheint nur nach echter Übermittlung, sonst
  bleibt der Demo-Hinweis sichtbar. Sanitär-Detailleistungen sind als «zu bestätigen» markiert und öffentlich
  ausgeblendet.
- **Leistungen (alle 8 behalten):** Hauswartung (wichtigste) · Sanitär & Unterhalt (direkt sichtbar) ·
  Gartenunterhalt · Reinigung · Räumung & Aufbereitung · Leerstandsmanagement · Vermarktung & Vermittlung ·
  Immobilienpräsentation (Fotografie, Drohne, 360°).
- **Ehrlich berichten:** Keine Nutzung, Integration oder Prüfung behaupten, die nicht stattgefunden hat.
- **Bedienung:** Keine Magnet-Effekte, kein eigener Cursor, kein Abfangen des Mausrads, kein Festhalten in der
  Szene. «Tour überspringen» und «Offerte anfragen» sind immer erreichbar. Informationen nie nur bei Hover.

## Aufbau

**Startseite (Fertigstellung):** 1 Foto-Einstieg `#einstieg` (h1) · 01 Leistungen `#leistungswelt` · 02 Hauswartung · 03 Sanitär ·
04 Familienbetrieb `#familienbetrieb` · optionaler Rundgang `#reise` (h2, aus `rise.json → tour`, «Tour überspringen» → `#ablauf`) ·
05 Ablauf `#ablauf` · 06 Karriere `#karriere` (aus `rise.json → careers`, nur mailto, keine Stellen, kein Upload) · 07 Häufige Fragen ·
Kontakt/Offerte `#anfrage` · Footer (Link «Karriere»). Kein eigener Abschnitt «Einsatzgebiet». Leistungsseiten: Was wir übernehmen ·
Geeignet für · Das hilft bei Ihrer Anfrage (`INFO` in `p3b`) · So geht es weiter. Formularbestätigung in Stufen (übermittelt, gespeichert,
Benachrichtigung nur bei `notified: true`). Prüfung: `tests/t24-inhalte.js`.

**Premium (16.10.2026):** Einstieg «Ihre Liegenschaft. / Unsere Verantwortung.», «Gebäude entdecken» → `#reise`. Tokens `--page-max/--page-gutter/--space-section/--radius-media/--dur-*` (Schicht «V14 Premium» in `p1`; `--max`/`--gut` zeigen darauf). Aktionen ≥ 48 px, Hover nur als Schatten (keine Verschiebung). Pixelbudget im Kern (`opts.maxPixels`, 2 Mio.). Videos «Im Alltag» vor `#reise` aus `rise.json → assets.videos` (`videos_markup`, nur mit Datei öffentlich, Stock = «Symbolvideo» mit Nachweis). Aufnahme: `npm run aufnahme`, Abnahme: `node tools/abnahme-premium.js` + `python3 tools/abnahme-premium-collage.py`. Prüfbuild in anderem Ordner: `IR_RISE=<json> IR_DIST=<ordner> python3 build.py`.

**Korrektur 3D-Reise (16.10.2026):** Route seit V17 unverändert zusammenhängend (jetzt 32 Stützpunkte: neuer Schwenk p 0,405 auf den
Treppenlauf, ≤ 35° je 1 % – `routeStats`). Spiegel: echte Spiegelung auch durch die Badtür (`mirrorVisible` bis x 7,6, mit Hülle und
Himmel, GPU volle Auflösung). Belichtung Wohnung gezielt angehoben (`expoTarget(ins, e)`). Waschtisch mit schlankem Rand (Licht neu
gebacken, alle Stationsbilder neu). Handy/niedrige Bildschirme: Bilder zuerst, «3D-Ansicht starten» (`[data-3d]`, `start3D()`/`stop3D()`,
Klasse `jr-3d`, Stationsmodus im Bildrahmen); Rückfall bei Bildzeit-Median > 60 ms (`TOO_SLOW`; Tests: `IR_PERF_MS`, `IR_NO_PERF_FALLBACK`).
Letzte Station: «Tour erneut starten» (`goTo: 0`), keine automatische Wiederholung. Bericht `docs/reise/BERICHT-REISE.md`, Prüfung t27.

**Realismus-Auftrag (17.10.2026):** Schmutz → sauber im Material-Shader (`DIRTF`/`DIRTM`, bis 6 Zonen aus `rise.json → tour.cleaning`:
Box in Weltkoordinaten, Art kalk|wasser|staub|laub, Wischrichtung, fester Startwert, Fortschrittsbereich; Zustand nur aus `ps`, vorwärts =
rückwärts; Rauschen aus kachelbarer Textur `mkNoise()`, Einheit 6; Schleife ohne `continue` wegen ANGLE/SwiftShader). Vergleich an der
Station «Vorher · Nachher · Reinigungsfortschritt» mit Hinweis «kein Kundenergebnis» (`_cmp` in `tools/rise.py`, `compare()`), Bildmodus
mit `<still>-vorher(-hoch).webp` (`render-stills.js`). Licht: Tageslicht Standard, Dämmerung umschaltbar (`tour.light`, `setDaylight`,
`[data-light]`; t16 prüft die Dämmerung, t28 das Tageslicht). Demo-Rundlauf ≈ 48 s nur auf Knopfdruck (`tour.demo`, `demoAt/demoSeek`,
`[data-demo]`, Naht vor der Hecke, Zeit nach Weg und Drehung, nicht bei «Bewegung reduzieren»). Aufnahme `npm run aufnahme:demo`,
Belege `docs/realismus/` (STATUS.md, Collagen `python3 tools/realismus-collage.py`, Bilder `node tools/realismus-bilder.js`), Prüfung t28.

**Einzige Quelle für Fakten und Tour: `rise.json`** (geprüft gegen `rise.schema.json` und die Regeln in
`tools/rise.py`). Firmen-/Kontaktdaten, Leistungsschlüssel, Stationen und Texte, Kameraroute, Türen,
Hervorhebung, Ereignisse und Wix-Regeln werden **nur dort** geändert, nie direkt im erzeugten Code.
Unbekanntes bleibt `"[UNSPECIFIED]"`. `python3 tools/rise.py` prüft die Datei; `build.py` bricht bei Fehlern ab.

`build.py` liest `rise.json`, erzeugt daraus das Rundgang-Markup (Platzhalter `<!--{{RISE_TOUR}}…-->` in
`src/p2.html`) und `window.IR_RISE`, setzt den Tour-Kern ein (`/*{{TOUR_CORE}}*/` in `src/p3g.html`) und
verkettet die Teile in `src/` zu einem HTML. Ein einziges `<script>` beginnt in `p3a` und endet in `p3d`
(gemeinsame IIFE). Bilder werden als data-URIs eingebettet; Stationsbilder liegen als WebP in `assets/tour/`.

| Datei | Inhalt |
|---|---|
| `rise.json`, `rise.schema.json`, `tools/rise.py` | Source of Truth, Schema, Prüfregeln und Generatoren (`tour_config`, `tour_markup`) |
| `src/tour/tour-core.js` | **Rundgang-Kern** `IRTour.create(root, opts)` – eigenes WebGL, gebackenes Licht, mehrfachinstanzfähig, `destroy()` |
| `src/tour/geometry.part.js` | Szene in Teilen (`BUILD_PARTS`): Umgebung, Garten, Hülle, Halle/Flur, Wohnung/Bad, Türen; Leuchten `light()`, Lichthöfe `halo()`, Laubkarten `card()`, Fenster `fwin()` |
| `tools/make-textures.py` | Materialtexturen prozedural (eigene Werke) → `assets/tex/` |
| `tools/bake-light.js` | vorab gerechnetes Licht (Raytracing: Umgebungsverdeckung, weiche Schatten) → `assets/bake/licht.json` |
| `tools/render-stills.js` | Stationsbilder quer (1440×900) und hoch (960×1080) aus der echten Szene |
| `src/tour/tour-element.js` | Web Component `<immoready-tour>` (Shadow DOM, Attribute, CustomEvents) |
| `src/tour/demo.html` | Testseite mit zwei Instanzen (wird nach `dist/component/` kopiert) |
| `src/p1.html` | `<title>`, Fonts, gesamtes CSS (Schichten V1–V13; die Komponente übernimmt es mit `:root`→`:host`) |
| `src/p2.html` | Markup: Demo-Banner, Header, mobiles Menü, alle Seiten (`data-page`), Platzhalter Rundgang, Footer |
| `src/p3a.html` | Icons, Canva-Fotos (base64), Leistungsdaten `S`, `ORDER` |
| `src/p3b.html` | Hash-Router (`route()`), Menüs, Scroll-Reveal, Parallax, FAQ-Akkordeon, Abschluss-Chips |
| `src/p3c.html` | Offertformular (Validierung, Demo-Modus, Lade-/Fehlerzustände, Doppelklick-Sperre) |
| `src/p3e.html` | Leistungsbühne `#svcx` |
| `src/p3f.html` | Neigung der Bildkarten (max. 3°), Fokusfalle im mobilen Menü (Magnet-Label in V13 entfernt) |
| `src/p3g.html` | Seitenanbindung des Rundgangs (`window.__JR`), iFrame-Nachrichten, Navigationsmarkierung |
| `src/p3d.html` | Umsetzungsmappe `#umsetzung` und Start |

Ausgaben in `dist/`:
- `immoready-vorschau.html` – vollständiges Dokument, zum Öffnen im Browser.
- `immoready-relaunch.html` – ohne doctype/head/body, für die Veröffentlichung als Claude-Artefakt.
- `component/immoready-tour.js` (+ `assets/tour/`: 16 Stations- und Detailbilder, 9 Texturen, `licht.json`) und
  `component/immoready-tour.inline.js` (alles eingebettet) – Web Component für Wix (Custom Element) oder andere
  Seiten; `component/demo.html` zum Testen. Texturen und Lichtdaten lädt die Komponente nur, wenn 3D startet.
- `site/` – Produktionsform derselben Seite mit getrennten Dateien (`index.html`, `site.css`, `site.js`, `assets/`
  mit Fotos, Stationsbildern, Texturen, Lichtdaten); keine Base64-Blöcke. Die Einzeldatei bleibt die Vorschau.
- `immoready-rundgang-embed.html` – Alternative für ein Wix-HTML-iFrame (postMessage).
- `embed-test.html` – wie die Embed-Datei, aber für den lokalen Nachrichtentest.

## 3D-Rundgang (`src/tour/tour-core.js`) – V17.1 «Final Realism & Mobile Release Candidate»

**Neu in V17.1 (Korrekturdurchgang, keine neue Version):**
- **Unterteilung:** `face()` interpoliert bei `withSub` bilinear über alle vier Ecken (vorher Parallelogramm aus drei Ecken –
  Trapeze wie die schräge Treppenbrüstung wurden waagrecht gezeichnet, die Stufen ragten als «Kisten» darüber).
- **Treppenhaus:** verputzte Wange 6 cm über den Stufenkanten mit Knick am Podest, Staketengeländer aus Flachstahl
  (Abstand 11,5 cm), Eichenhandlauf 0,9 m über den Stufenkanten, waagrecht am Podest.
- **Bad:** Wände und Vorwand auf 10 cm gerastert (vorher 30 cm: diagonale Lichtfächer aus dem gebackenen Schatten des
  Spiegelschranks). Griffmulde als Aluprofil über die ganze Breite mit Schattenfuge. WC-Wasserfläche mit weichem Übergang
  zum Geruchsverschluss.
- **Horizont:** Der Boden ab 120 m wurde im Shader mit fast Schwarz überblendet (dunkles Band in Gesamt- und Dachansicht) –
  jetzt abgedunkelter Dunstton (`land` in `VSM`/`VSML`); Himmel unter dem Horizont im Dunstton; ferner Boden mit
  Bodenmaterial. Strasse/Trottoir bis ±62 m, Bodenlücke bis ±90 m geschlossen.
- **Fassade:** Vorder- und Seitenfassade auf 34 cm gerastert (Balkonschatten ohne Interpolationsfahnen).
- **Garten:** mehrstämmiger Baum mit Ästen aus den Stämmen; Heckenoberseite aus fünf kleinen, geneigten Karten statt einer Platte.
- **Wohnung:** Sitzbank auf vier Beinen mit Zarge statt Holzkiste.
- **Seite:** Kontaktleiste und kompakter Kopf deckend, alle Bedienelemente ≥ 44 px (`.btn.sm`, Stationsknöpfe, «Kopieren»),
  320 px bei 200 % Text ohne Überlauf (Segmentwahl, Überzeilen, Personenkarte, Formularfuss), Fokus nach Fehlern auf dem
  ersten fehlerhaften Feld, Skip-Link bleibt beim Laden erster Tabstopp und führt zum Inhalt der aktuellen Seite.
- **Handy-Durchgang (Fertigstellung):** keine pauschale Überlaufsperre mehr (`body` ohne `overflow-x:hidden`; Überbreite an
  der Ursache behoben: einspaltige Raster `minmax(0,1fr)`, Formularspuren, Leistungskarten, Abschlusstitel). Lange Komposita
  bekommen weiche Trennstellen zur Laufzeit (`HY` in `p3b`, Wörterbuch, nur sichtbarer Text, MutationObserver) – neue lange
  Begriffe dort ergänzen. Bildmodus: nur aktive Station belegt Platz; «Offerte anfragen» in der Überspringen-Zeile < 760 px
  ausgeblendet (steht in Station und Kontaktleiste). Niedrige Bildschirme (`max-height:540px`, Smartphone quer) → Bildmodus
  mit normalem Scrollen (`SMALL` im Kern). Anker/Fokus: `scroll-margin` aus gemessener Kopfhöhe `--hdrh` (nicht
  `scroll-padding`, sonst springt die Seite beim Fokus im Kopf). Menü schliesst bei Wechsel auf Desktopbreite. Prüfung:
  `tests/t22-mobil.js`; Abnahmebilder: `node tools/abnahme-handy.js` + `python3 tools/abnahme-handy-collage.py` → `docs/v171/handy*`.
- Tests neu: `tests/t20-v171.js`. Abnahme: `npm run abnahme` (32 Bilder, `tools/kameras-vergleich.json → abnahme_final`,
  Vergleich mit dem Ausgangsstand: `node tools/abnahme-final.js <V17-Datei> shots/v171-vorher szene`). Wix: zusätzlich
  `wix/velo-offertseite.js` (Vorauswahl der Leistung).

### V17 «Final Production Candidate»

**Neu in V17:**
- **Bad:** Plattenfugen je Pixel im Shader (`vq` mit negativem `z` = 2D-Raster in Metern, Raster ab der Raumecke
  x 3,072 / z −0,928 / Boden; Wand 60×30, Boden 60×60), Texturen ohne eingebrannte Fugen (`make-textures.py`), Plattenton
  je Platte ±1,5 %; Wände weiss `#efeeea`, Boden anthrazit, neutralwarmes Licht `#fff0e0`, Glanzfarbe im Bad neutral.
  Vorwand 1,20 m (4 Plattenreihen). **WC** neu: konischer Körper mit zur Wand abfallender Unterseite, asymmetrische tiefe
  Schüssel mit Wasserfläche und Geruchsverschluss, Brille und Deckel mit gerundetem Querschnitt (`shellR()`), Deckel
  gewölbt mit Schürze (94° geöffnet), zwei Scharniere mit Gelenkstücken, Puffer, Betätigungsplatte 246×164 mm mit zwei
  Tasten, WC-Bürste. **Waschtisch** als Möbelwaschtisch (Schürze 15 cm, gerade Rückseite, Silikonfuge) auf
  wandhängendem Unterschrank (Sand matt, Schattenfuge, Griffmulde, 38 cm Bodenfreiheit) – Siphon und Eckventile
  verdeckt; Ablaufventil, Überlauf mit Blende, Armatur mit Hebel oben und 17 cm Ausladung.
- **Beschriftung im Bad** nur als `data-l` (CSS `attr()`), kein loser Text; «Schematische Kennzeichnung» wird vom Kern
  direkt unter/über die Markierungen gesetzt (`--cx/--cy`). Labels: Armatur · Ablaufventil · Siphon und Eckventile im Unterschrank.
- **Umgebung:** `nhouse()` – Nachbarhäuser mit Fensterachsen auf allen Seiten, Fensterbänken, Storen, wenigen hellen
  Fenstern, Balkonen auf einer Seite, Flach- oder Satteldach; Ring-Häuser nur zur Mitte befenstert. Strasse: blaue
  Parkfelder, zwei neutrale Autos (`car()`, leere Schilder), Signal «Zone 30» (`glyphs` um 3, Z, O, N erweitert).
- **Fassade:** Schmutzfahnen unter den Fensterbankenden und unter Attika/Notüberläufen (`decal()`: Verlaufsfläche 3 mm vor
  der Fassade), dunkle Anschlussfuge Laibung/Blendrahmen. Balkongeländer stirnseitig mit Konsolen, Fuge des
  Wärmedämmelements, weitere unterschiedliche Möblierung.
- **Pflanzen:** `treeC()` mit Wurzelanlauf, gekrümmtem Stamm, Haupt- und Nebenästen und mehreren Kronenteilen
  (verschiedene Grössen, Dichte, Grüntöne; gleiche Kartenzahl). Hecken mit unregelmässiger Oberkante.
- **Innen:** Gleitschutzstreifen an den Stufen, Fussmatte vor der Wohnungstür, Küche mit unterbautem Becken (Ausschnitt in
  der Arbeitsplatte), Griffleisten, zurückgesetztem Sockel, Sensortasten; neue Stühle (Sitz 45 cm), Schale, Kräutertopf.
- **Lichtdaten:** Umgebungsverdeckung geglättet (Nachbarn ≤ 5 cm mit ähnlicher Normale), innen 16 Leuchtenproben –
  keine Fächer- oder Fleckenmuster auf Nahobjekten. Jeder Bauteil startet mit eigenem Zufallsstartwert (`build()`).
- **Smartphone:** Kontaktleiste 56 px + Safe Area (Platz unten reserviert, ausgeblendet bei Tastatur auch über
  `visualViewport`), Logo 104 px (96/112) bei flacherem Kopf, Stationsleiste waagrecht scrollbar mit Einrasten (aktive
  Station mittig), Bild 10:9 (Hochformatbilder 960×864), Hero-Titel ohne Umbruch in «Bis ins Detail betreut.»;
  Offertseite: Formular vor den Kontaktangaben, Leistungskarten 1-spaltig < 375 px, sonst 2-spaltig mit gleich hohen
  Karten, Silbentrennung nur am weichen Trennstrich, «Einmalig / Regelmässig» als Segmentwahl.
- **Produktionsform:** `build.py → build_site()` erzeugt `dist/site/` (index.html, site.css, site.js, assets/ – ohne Base64).
- **Leistung:** statische Sätze (BLD 4 m, INT 3 m, ENV 14 m) werden beim Hochladen räumlich in Blöcke sortiert
  (`chunkify`) und nur im Sichtkegel gezeichnet (`frustumOf`/`boxIn`, auch für Spiegel und Reflexionsaufnahme;
  `window.IR_NO_CULL = true` schaltet es zu Vergleichszwecken ab, `__JR.cull()` zeigt die Zahlen). Ferne Bäume mit
  vereinfachtem Stamm (`TLOD`), ferne Häuser ohne Fensterbänke. Fugen im Shader ohne Verzweigung (Ableitungen in
  gleichförmigem Kontrollfluss). Bildzeiten: `node tests/bench-frames.js <html> …`.
- **Bad-Beschriftung** folgt der tatsächlichen Kameraposition (`hiAmt(ps)`), nicht dem Zielwert – bei Stationssprüngen
  erscheint sie erst im Bad.
- Tests neu: `tests/t19-v17.js`. Abnahmebilder: `tools/kameras-vergleich.json → abnahme` (a01–a17, r-…),
  `tools/abnahme-mobil.js`.

### V16 «authentisches Schweizer Mehrfamilienhaus»

**Neu in V16 (Szene, nach dem verbindlichen Masterprompt):**
- **Fassaden ringsum bewohnt:** Rückfassade mit 6 Fensterachsen je Geschoss und Fenstertüren mit französischem Balkon,
  linke Seitenfassade wie die rechte; Fallrohre an allen vier Ecken; Kiesstreifen rundum.
- **Lamellenstoren als Geometrie** (`slat()`): Lamellen 80 mm im Abstand 72 mm zwischen den Führungsschienen, Neigung
  und Behanghöhe je Fenster verschieden, hochgezogen nur die Endschiene im Sturz (Storenkasten verdeckt).
- **Fenster mit Raumtiefe:** zusätzlich Zimmerpflanzen auf der inneren Fensterbank und neutralweisses Licht bei einem
  Teil der Fenster. **Dach:** extensive Begrünung (Sedum) mit Kiesrand, Dachwassereinläufe, Liftüberfahrt und
  Dachausstieg statt grossem Aufbau.
- **Eingang:** Alu-Glastür anthrazit mit Bändern, Obentürschliesser und Stossgriff; Briefkasten- und Sonnerieanlage
  (8 Kästen, Klingeltaster, Gegensprechanlage, neutrale unbeschriftete Schilder); Hausnummer «12» als blaues
  Emailschild (illustrativ, keine reale Adresse); Sauberlaufzone. Schrift auf Schildern: `glyphs()`.
- **Treppenhaus:** Treppenauge über dem ganzen Lauf (Kopfhöhe ≥ 2,0 m, geprüft), Schacht mit Untersicht des nächsten
  Laufs, verputzte Brüstung parallel zum Lauf mit Eichenhandlauf, Lift (Chromstahltüren, Ruftaster, Anzeige),
  Etagenschild «EG», Wohnungstür 0,94 m (lichte Breite 0,91 m) mit Türspion, Namensschild und Klingel.
- **Wohnung:** Plattenboden im Eingangsbereich, Badtür 0,82 m (offen, Bänder, Zarge), Steckdosen Typ 13 und
  Schalter, Backofen unter dem Kochfeld. **Bad:** Vorwandinstallation mit Steinablage, wandhängendes WC aus
  Rotationsflächen (Schüssel mit Wasserfläche, separate Brille, hochgeklappter Deckel, Scharniere), Überlauf im
  Waschtisch, Duschablage.
- **Aussen:** Veloabstellplatz mit Anlehnbügeln und zwei Velos, Aussenwasserhahn, Asphalt als eigenes Material (`ASP`).
- **Kamera/Bad:** Station «Bad» zeigt WC und Waschtisch gemeinsam (Halt 0,73), danach Nahansichten Waschtisch (0,752)
  und WC (0,772). `rise.json → stations[].details` erzeugt die Schaltflächen «Übersicht · Waschtisch · WC»
  (3D: Kamerafahrt, Bildmodus: Detailbild aus derselben Szene).
- Prüfhilfe neu: `rayY(x, y, z, dir)` (senkrechter Strahl durch die Dreiecke: Kopfhöhe, WC-Schüssel).
- Vergleichskameras: `tools/kameras-vergleich.json → abnahme` (12 Abnahme- und Prüfansichten),
  `node tools/vergleich.js <html> <ordner> abnahme`.

### V15 «glaubwürdige Architekturvisualisierung»

**Neu in V15 (Renderer):**
- **Farbraum:** Vertex-Farben, Leuchten und Laubtönung werden beim Aufbau sRGB → linear umgerechnet (`lin()`,
  `lin3()`), Licht wird linear gerechnet, Ausgabe **einmal** über ACES-Näherung + Gamma 1/2,2 (`tm()`). Der Laubatlas
  (Farbtextur) wird im Shader linearisiert; die Graustufen-Texturen (Daten) nicht. `sky()` liefert lineare Werte.
- **Material je Pixel:** Tabelle `MATP` (Rauheit, F0, Metall, Relief) als 32×1-LUT. Glanz (normalisiertes Blinn mit
  Lichtgrössen-Verbreiterung), Schlick-Fresnel, Relief über Bildschirm-Ableitungen (nur im Nahbereich). Metalle:
  F0 = unbeleuchtete Grundfarbe (`va`) – Chrom neutral, Aluminium matt, keine Lichtfarbe im Reflex. Sehr raue
  Nichtmetalle (Rauheit > 0,76) rechnen keinen Glanz. Materialnummern: `CHR` 22 Chrom, `ALM` 23 Alu, `EDS` 24 Edelstahl,
  `BLA` 25 Blatt.
- **Reflexionen:** je Raum eine Reflexionsaufnahme (Würfeltextur 128², Software 64²), einmal aufgenommen, sobald die
  Kamera im Raum ist (`PROBES`, box-projiziert). **Badspiegel:** echte planare Spiegelung (Szene am Spiegel x = 3,25
  gespiegelt in eine halbe Auflösung, nur wenn der Spiegel im Bild ist; `MIR`). Aussen spiegelt der Himmel.
- **Türen:** Licht doppelt gebacken (zu/offen, `lt`/`lt2`, Mischwert `lm` aus dem Türwinkel) – keine falschen
  Schatten beim Öffnen. Türflügel verschatten im Lichtwerkzeug nicht (bewegt).
- **Luftperspektive** je Pixel; ferner Hügelzug im Himmel (`hil()`) statt gerader Bodenkante.
- **Laub:** Alpha-zu-Abdeckung bei Kantenglättung. Zimmerpflanzen aus modellierten Blättern (`leaf()`), Armaturen-
  bögen als Bézier-Rohr (`bogen()`).
- **Leistungspunkte** (`rise.json → tour.stations[].hotspots`): `<a href="#offerte" data-pre data-hot data-st>`,
  sichtbar nur an der Station, nie über Text/Navigation (sonst ausgeblendet), lösen dasselbe `request-quote` aus.
- **Software-Grafik (lite):** ohne Relief und Reflexionsaufnahme, Dunst je Eckpunkt (`VSML`), Start mit 50 % Auflösung.
  `window.IR_FORCE_HQ = true` (nur Bildproduktion) erzwingt die volle Qualität.
- Prüfhilfen neu: `checkFrustum(n)` (Nahebene gegen Wände und Türflügel), `frameDiff()` (Bildstabilität),
  `doorLight(q)`, `roomAt(q)`, `lightAt(q, n)`, `state().frames`.
- Vergleichsbilder: `tools/kameras-vergleich.json` (feste Kameras, nicht verändern) + `tools/vergleich.js`.


- **Szene (V14):** Schweizer Mehrfamilienhaus, 4 Geschosse à 3,00 m, lichte Raumhöhe 2,60 m, Aussenwand 38 cm
  (Mauerwerk + Wärmedämmung + Putz) mit echten Öffnungen, Laibungen, Blendrahmen, Flügeln, Alu-Fensterbänken,
  Storen-Führungsschienen; Sockel 2 cm zurückgesetzt mit Sockelprofil, Scheinfugen auf Deckenhöhe, Attika mit
  Blechabdeckung, Balkone mit Tropfkante und Staketengeländer. Garten: Kiesstreifen mit Stahlkante, Plattenweg mit
  Granit-Randsteinen (1-m-Stücke), Beete mit Erde und Stahlkante, Pflanzen als Laubkarten, Bäume, Hecken, Poller.
  Grundriss EG: Treppenhalle x[-3,3] · Flur x[3,5.4] · Bad x[3,5.4] z[-1,2.4] · Wohnen/Essen/Küche x[5.4,8.62].
  Türen (V16): Haustür 1,08 m (lichte Breite 1,09 m) + festes Seitenlicht, Wohnungstür 0,94 m (lichte Breite 0,91 m),
  Bad 0,82 m (lichte Breite 0,80 m), Durchgang 1,10 m, Hebeschiebetür 2,0 m (Flügel gleitet 1,0 m). Kantenschrägen: `withBev(c, fn)` bzw. `BEV` (nur Möbel, Stufen, Steine, Platten).
- Eine Fortschrittsvariable `p` (0…1). Daraus: Kamera (Position Catmull-Rom; Blickrichtung als stetig
  abgewickelter Gier-/Neigungswinkel), Bildwinkel, drei Türen (`tour.doors`), Sanitär-Hervorhebung,
  HTML-Einblendungen. Vorwärts und rückwärts identisch. 31 Stützpunkte (V16); Rückweg Bad → Wohnraum → Terrassentür →
  Gesamtansicht. **Objektivverschiebung:** Kamera waagrecht, Neigung als Shift (senkrechte Kanten bleiben
  senkrecht; erst ab 17° Neigung anteilig gekippt).
- Zeitbasiert: Scan-Kante beim Start (`tour.introScan`), Aufleuchten der Sanitär-Konturen (≈2,6 s),
  Belichtungsanpassung innen/aussen (≈0,45 s) und **Wind** in den Pflanzen (`tour.wind`: höchstens 30 Bilder/s, nur
  wenn Aussenraum im Bild, endet 15 s nach der letzten Eingabe). Bei «Bewegung reduzieren» entfallen Scan, Puls
  und Wind; die Belichtung springt.
- **Licht:** `bakeOne()` pro Eckpunkt (Himmel der blauen Stunde, Leuchten je Raum `roomOf`, indirektes Raumlicht).
  Dazu **vorab gerechnetes Licht** aus `tools/bake-light.js` (Raytracing über BVH: Umgebungsverdeckung und weiche
  Schatten der Leuchten, Laub verschattet teilweise) – je Eckpunkt 2 Bytes, zlib + base64 in
  `assets/bake/licht.json` mit Prüfsumme `geoHash()`. **Nach jeder Geometrieänderung `npm run bake`**, sonst
  rechnet der Rundgang ohne Schatten (Hinweis in der Konsole). Grosse Flächen werden gerastert (`withSub`).
- **Materialien:** 8 prozedurale Graustufen-Texturen werden zur Laufzeit in 2 RGBA-Texturen gepackt (T1 Putz,
  Stein, Rasen, Hecke · T2 Holz, Wandplatten, Bodenplatten, Metall), UV aus der Objektposition mit Massstab je
  Material; Fugen per Shader (geglättet mit `fwidth`). Mipmaps, anisotrope Filterung auf GPUs.
- **Glas:** Fenster ohne modellierten Raum zeigen Räume mit Tiefe (Interior Mapping, `pane()`), modellierte Räume
  echtes, durchsichtiges Glas mit Fresnel-Spiegelung (`tglass()`; TGD/TGT bewegen sich mit Haus-/Terrassentür).
- **Laub:** Karten mit Alpha-Test aus `assets/tex/laub.webp` (Strauch, Gras, Staude, Baumkrone), Lichtnormale nach
  aussen gewölbt, Wind im Vertex-Shader. **Lichthöfe** (`halo`) additiv und dezent. Tonkurve mit weicher Schulter
  in allen Shadern; Konturlinien nur noch für Scan und Sanitär-Hervorhebung.
- Zeichenreihenfolge: (einmalig Reflexionsaufnahme) → (Spiegelbild, falls sichtbar) → Flächen → Fenster mit Raumtiefe →
  Laub → Himmel → Glas (Scheiben von hinten nach vorn sortiert) → Lichthöfe → Linien.
- Software-Grafik (SwiftShader, llvmpipe): ohne Anisotropie, einfachere Mipmaps, vereinfachter Material-Shader, Start
  mit 50 % Auflösung; `window.IR_FORCE_HQ = true` (nur Bildproduktion/Abnahmebilder) hebt das auf.
- Rendern nur bei Bedarf (`request()` von aussen, `cont()` intern). Auflösung adaptiv 0,5–1.
- Kollisionskörper in `WALLS` (auch die Fassade mit Öffnungen); `checkRoute(n)` muss `[]` liefern.
  **Nach Änderungen an Route oder Grundriss t11, t14 und t16 laufen lassen.**
- Modi: `scroll` (Seite, 760 vh), `steps` (Komponente, iFrame), Standbilder (≤700 px Hochformat-Bilder;
  «Bewegung reduzieren» im Scrollmodus; kein WebGL; Kontextverlust). Smartphones laden keine Texturen/Lichtdaten.
- Ereignisse (erst nach dem Start): `tour-ready {version:"16", mode}`, `station-change {station, index, progress}`,
  `request-quote {service, station, source:"tour", version:1}`, `request-contact {station, source:"tour", version:1}`,
  `tour-error {code, fallback:"stills"}`. Unverändert gegenüber V13 (Wix-Adapter funktioniert weiter).
- `destroy()` stoppt rAF und Wind-Timer, trennt Beobachter, entfernt Listener, gibt Puffer, Texturen und Programme frei.
- Prüfhilfen: `sceneStats()`, `project([x,y,z])`, `frameStats()`, `bakeKit()` (nur für das Lichtwerkzeug).
- Stationsbilder neu rendern: `npm run render:stills`. Texturen neu erzeugen: `npm run textures`.
- Modell exportieren: `npm run export:glb` (14 Objekte, nur Geometrie ohne Texturen/Laub, zum Verfeinern in Blender).
- Bibliothekswahl (geprüft am 9. Oktober 2026 in der Arbeitsumgebung, nicht aus alten Kommentaren übernommen): npm-Registry
  nicht erreichbar (Zeitüberschreitung), cdnjs/jsDelivr/unpkg vom Proxy abgelehnt (403), Three.js nicht lokal
  installiert. Ein Umstieg war deshalb nicht möglich und ohne Not auch nicht sinnvoll; der eigene Renderer wurde
  gezielt erweitert. In einer Umgebung mit Paketzugriff kann ein Umstieg neu bewertet werden (Schnittstelle
  `IRTour.create` und `<immoready-tour>` müssten erhalten bleiben).

## Einbindung in Wix (vorbereitet, nicht eingebaut)

- **Bevorzugt: Custom Element `<immoready-tour>` + Velo** (`wix/velo-custom-element.js`, Element-ID
  `immoreadyTour`). Attribute `mode` (steps|scroll), `station` (0–5), `assets-base` (HTTPS-Ordner der WebP-Bilder).
  Velo empfängt die CustomEvents mit `$w('#immoreadyTour').on('request-quote', e => e.detail)`.
  Editor und Vorschau zeigen Custom Elements in einem iFrame; Live-Verhalten separat prüfen.
- Alternative: HTML-iFrame mit `dist/immoready-rundgang-embed.html` und postMessage
  (`SCENE_READY`, `REQUEST_QUOTE {leistung}`, `REQUEST_CONTACT` / `GO_TO_STATION`, `SET_PROGRESS`; Ursprünge aus
  `rise.json → wix.allowedOrigins`), Velo: `wix/velo-seitencode-startseite.js`.
- Einbauanleitung mit Element-IDs: `wix/EINBAU.md`. In Wix empfohlen: Stationsmodus (Begründung dort).
- Offen:
  1. Hosting der Komponente und der Bilder (Wix `public/custom-elements/` bzw. Medienverwaltung oder externe
     HTTPS-Adresse) – keine Adresse erfinden.
  2. Einbau im Wix Editor, Test in Vorschau **und** auf der Live-Seite unter kontrollierten Bedingungen.
  3. Veröffentlichung erst nach Freigabe.

## Befehle

```bash
python3 tools/rise.py             # rise.json prüfen
python3 build.py                  # baut dist/ (prüft rise.json zuerst)
npm install && npx playwright install chromium
npm test                          # Build, RISE, Velo (t15), t7 Seite, t9 Interaktionen, t11 Rundgang, t14 V13/V14, t16 V14, t17 V15, t18 V16, t19 V17, t20 V17.1, t21 Fertigstellung, t22 Handy, t23 GmbH/Startsperre, t24 Inhalte, t25 Premium, t26 Videos, t27 Reise, t28 Realismus
npm run abnahme                   # 32 Abnahmebilder + Übersicht/Vergleich → docs/v171/
npm run bake                      # Build → Licht vorab rechnen → Build (nach Geometrieänderungen Pflicht)
npm run perf                      # Ladeleistung gedrosselt (Server: python3 -m http.server 8702)
npm run test:servers &            # lokale Server für die folgenden zwei Tests
npm run test:embed                # t12: iFrame-Nachrichten
npm run test:component            # t13: Web Component
npm run render:stills             # Stationsbilder aus der Szene neu erzeugen
npm run shots                     # Abnahme-Screenshots 1440/768/390 → shots/
npm run vergleich                 # feste Vergleichskameras → shots/v17-nachher (Vorher: V16-Datei aus der Sicherung)
node tools/abnahme-mobil.js dist/immoready-vorschau.html shots/v17-mobil   # Smartphone-Abnahmebilder
python3 tools/abnahme-collage.py  # docs/v17: 22 Abnahmebilder, V16/V17-Vergleich
node tests/bench-frames.js <html> …  # Bildzeiten (Testumgebung)
```

- Tests mit WebGL starten Chromium mit SwiftShader (Software-GPU, V15 ≈0,5–1,8 s je Bild); zeitkritische Prüfungen
  warten deshalb auf Bedingungen bzw. auf gezeichnete Bilder (`state().frames`) statt auf feste Zeiten.
- Stand Korrektur 3D-Reise (16.10.2026): Gesamtlauf 562/0 ohne Wiederholung (inkl. t27). Stand Premium-Durchgang: 539/0 ohne Wiederholung (inkl. t25/t26), Bericht `docs/premium/BERICHT-PREMIUM.md`. Stand Fertigstellung (15.10.2026): 495/0. Früher V17.1: 356 bestehende Prüfungen + t20 43/43 = 399 (Details und ehrliche
  Einordnung eines einmaligen Zeitausreissers in t11: `docs/TESTBERICHT-V17.1.md`, Leistung: `docs/PERFORMANCE-V17.1.md`).
- Stand V17 (Branch `v17-final-realism`, Tag `v17-stand`; Sicherung des V16-Stands: Tag `v16-stand`):
  RISE 21/21, t15 10/10, t7 68/68, t9 18/18, t11 37/37, t12 14/14, t13 24/24, t14 28/28, t16 19/19, t17 18/18,
  t18 17/17, t19 82/82 (356 Prüfungen). Details: `docs/TESTBERICHT-V17.md` (frühere: V16, V15, V14, V13).
- Vor dem Launch Pflicht: Safari und mindestens ein echtes iOS- und Android-Gerät, Wix-Live-Test.

## Offene Punkte

- Formular an Wix Forms anbinden (Benachrichtigung an info.immoready@gmail.com; Bestätigung erst nach dem
  Speichern).
- GmbH-Angaben nach der Eintragung (Firmenname, Sitz, Adresse, UID, Handelsregister, Vertretung, MWST, Funktion von Ardit Gashi) –
  `rise.json → firm.company`, offene Punkte: `npm run launch:check`.
- Markenfarben vom Inhaber bestätigen lassen (`design_tokens.confirmed: false`); Logo als Vektordatei fehlt.
- Sanitär-Leistungsumfang bestätigen lassen.
- Echte Fotos und Porträt einsetzen; Nutzungsbedingungen der Canva-Bilder prüfen.
- Pfade der Offert- und Kontaktseite in Wix bestätigen (`pages.contactPath` ist offen).
- Texturen sind prozedural (eigene Werke); fotografische, lizenzierte Materialscans könnten den Realismus weiter
  steigern (Lizenz und Kosten vorher klären – nur nach Freigabe).
- Echte GPUs (Mac/Windows, iPhone/Android im Querformat-Tablet) noch nicht gemessen.
