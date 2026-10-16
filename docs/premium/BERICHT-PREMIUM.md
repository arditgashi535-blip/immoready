# Premium-Durchgang «realistische 3D-Gebäudereise»

Stand: 16. Oktober 2026 · Branch `v17.1-release-candidate` · nichts veröffentlicht, keine Domain und keine Live-Website verändert.

Alle Prüfungen liefen in dieser Arbeitsumgebung: Linux-Container, Headless-Chromium mit SwiftShader als Software-GPU. Das ist eine **Browseremulation**. Echte iPhone- und Android-Geräte, Safari und ein Wix-Live-Test stehen aus.

## Umgesetzt

| Bereich | Was | Wo |
|---|---|---|
| Einstieg | h1 «Ihre Liegenschaft. / Unsere Verantwortung.», Beschreibung «Ihr Familienbetrieb für Hauswartung, Sanitär und Unterhalt in Zürich und Aargau.», Aktionen «Offerte anfragen» → `#offerte` und «Gebäude entdecken» → `#reise`. Das Foto erscheint sofort. Der Rundgang lädt 3D erst bei Annäherung (`lazyStart`, rootMargin 150 %) oder über den Klick. | `src/p2.html`, `src/p1.html` |
| Gestaltungs-Tokens | `--page-max` 1280 px, `--page-gutter` clamp(16px,4vw,64px), `--space-section` clamp(56px,8vw,120px), `--radius-media`, `--dur-fast/base/slow` 160/280/650 ms, `--ease-out` (bestand bereits). Die bisherigen Namen `--max` und `--gut` verweisen auf die Tokens, damit es nur eine Quelle gibt. **Markenfarben unverändert.** | `src/p1.html`, Schicht «V14 Premium» |
| Aktionen | Alle `.btn` mind. 48 px hoch, auch die Kontaktleiste (Leiste bleibt 56 px). Hover-Rückmeldung nur bei `hover:hover` und `pointer:fine`, **über einen Schatten statt einer Verschiebung**: Ein Anheben um 1 px hätte die Schaltfläche unter dem Zeiger bewegt und damit die bestehende Regel «kein Magnet-Effekt» verletzt (t9). `:active`, `:disabled`/`aria-disabled` sichtbar. Bei «Bewegung reduzieren» keine Transformation. Dekorative Pfeile `aria-hidden="true"`. Navigation als Link, Aktion als Button. | `src/p1.html`, `src/p2.html`, `src/p3*.html`, `tools/rise.py` |
| Rundgang: Stationen | Station 1 «Gesamtansicht · Illustration». Eingang/Treppenhaus mit Hauswartung **und** Reinigung. Wohnung: Reinigung, Räumung, Leerstand. Bad: Übersicht → Waschtisch → WC. Rückkehr mit Offerte und Kontakt. | `rise.json → tour.stations` |
| Rundgang: Pixelbudget | Zeichenfläche höchstens 2 Mio. Bildpunkte (`opts.maxPixels`), Pixeldichte höchstens 1,5, adaptiv 0,5–1. Projektion (w/h), Zeichenfläche und Spiegelziel folgen jeder Grössenänderung (ResizeObserver). `state()` meldet `canvas`, `css`, `dpr`, `pxCap`. | `src/tour/tour-core.js → resize()` |
| Rundgang: bestehende Logik geprüft | Ein Fortschritt `p`. Scrollen, Stationsknöpfe und Tastatur laufen über `setProgress`/`glide`. Die Glättung ist zeitbasiert (`1 − e^(−dt/τ)`), in einer einzigen rAF-Schleife. Rendern nur bei sichtbarer Szene und sichtbarem Dokument. Türen und Sanitär-Hervorhebung leiten sich aus dem Fortschritt ab. «Bewegung reduzieren» und `destroy()` sind unverändert vorhanden. Es wurde **keine zweite Schleife** ergänzt. | `src/tour/tour-core.js` |
| Videos zum Rundgang | Abschnitt «Im Alltag» direkt vor `#reise`, aus `rise.json → assets.videos`. Ablauf: Clip lädt erst im Sichtbereich, stumm, mit Pause-Taste (48 px); kein Autoplay bei «Bewegung reduzieren»; «Im Rundgang ansehen» springt zur Station; Anfrage mit Leistungsschlüssel. Kennzeichnung «Symbolvideo» und Bildnachweis im Impressum. **Ohne Datei nicht öffentlich.** | `tools/rise.py → videos_markup`, `build.py → videos()`, `src/p3b.html` |
| Aufnahme | 8,3 s, 1280×720, aus der echten Vorschauseite (Scrollmodus). | `docs/premium/rundgang-aufnahme.mp4`, `tools/aufnahme-rundgang.js` |
| Abnahmebilder | 8 Grössen × Einstieg, Stationen 1/3/5, Offerte | `docs/premium/abnahme-*.jpg`, `tools/abnahme-premium.js` |

**Ereignisse/Wix:** Der Vertrag ist unverändert:
- `request-quote {service, station, source:"tour", version:1}`. `service` ist nur ein Schlüssel aus `rise.json → services`, sonst leer (allgemeine Anfrage ohne Vorauswahl).
- Die Komponente sendet mit `bubbles` und `composed`.
- Der Velo-Empfänger (`wix/velo-custom-element.js`) prüft Quelle, Version und Station und übernimmt nur bekannte Leistungen.
- Ein Ereignis beweist weder Speicherung noch Benachrichtigung. Das Formular zeigt Erfolg erst nach bestätigter Verarbeitung (Stufen in `src/p3c.html`). Bis zur Anbindung bleibt es im Demo-Modus.

## Sichtprüfung (Bilder geöffnet und angesehen)

- **Alle Grössen:** Überbreite 0 px. Grössen: 320×568, 360×800, 390×844, 430×932, 844×390 (Bildmodus), 768×1024, 1440×900, 1920×1080 (3D).
- **Logo:** unverändert auf Ivory.
- **Einstieg:**
  - Desktop: Titel in zwei Zeilen ohne Silbentrennung (vorher brach «Verantwortun-g.» um; Schriftgrad und Spaltenbreite korrigiert).
  - 320 px bei 200 % Text: lesbar, ohne Überlauf.
- **Rundgang Handy:**
  - Bild und Text getrennt.
  - Stationsleiste waagrecht mit grossen Knöpfen.
  - Kennzeichnung «Illustrative Visualisierung · kein Referenzobjekt» sichtbar.
  - Kontaktleiste verdeckt keine Bedienung.
- **Rundgang Desktop:**
  - Station 3: Lift, Türen und Briefkastenanlage plausibel.
  - Station 5: WC mit Brille und Deckel, Waschtisch mit Unterschrank, Beschriftungen innerhalb des Bildes.
  - Keine schwarzen Horizontbänder, keine Lichtfächer.
- **Offerte Handy:** Demo-Hinweis oben, Leistungskarten zweispaltig (320 px einspaltig), Segmentwahl.

## Bewusst nicht geändert

- **Licht der Szene:** Die Szene ist weiterhin in der blauen Stunde mit warmem Innenlicht gerechnet und nicht im Tageslicht. Ein Wechsel auf Tageslicht verlangt:
  - neues gebackenes Licht (`npm run bake`);
  - 16 neue Stationsbilder;
  - eine neue Abnahme aller Kameras.

  Das ist als nächster Schritt möglich, wurde aber nicht nebenbei gemacht. Die Farbkette (sRGB → linear → ACES → Gamma) ist seit V15 vorhanden und wurde nicht verändert.
- **Geometrie:** Es gab keine Änderung. Deshalb war kein neues Backen und kein Neurendern der Stationsbilder nötig. Die Kollisionsprüfung der Route (`checkRoute`) läuft in t11/t14/t16 mit.

## Offen (externe Eingaben)

1. **Echte Fotos und Videos:**
   - Alle Bild- und Videoquellen sind in dieser Umgebung gesperrt (403 des Proxys): Unsplash, Pexels, Pixabay, Mixkit, Coverr, Videvo, Wikimedia, archive.org.
   - Neun Fotoflächen zeigen weiterhin gekennzeichnete KI-Übergangsbilder.
   - Vier Videoflächen sind leer und damit öffentlich unsichtbar.
   - Motive und Ablauf stehen in `docs/FOTOLISTE.md`.
2. **Netzwerkzugriff** der Cloud-Umgebung für eine Stockquelle erweitern (zum Beispiel `www.pexels.com`, `videos.pexels.com`, `api.pexels.com`) oder eigene Dateien liefern.
3. **GmbH-Angaben und Freigaben:** siehe `docs/VEROEFFENTLICHUNG.md`.
4. **Wix:**
   - Die Einbindung ist vorbereitet, in Wix aber nicht getestet.
   - Die Datensammlung für Offertanfragen wurde nicht angelegt; das braucht Ihre ausdrückliche Zustimmung.
5. **Echte Geräte:** Safari, iPhone, Android und echte GPUs wurden nicht gemessen.

## Prüfungen

- **Neu:** t25 (Premium: Einstieg, Aktionen, Stationen, Ereignis, Pixelbudget, Grössenänderung, Bewegung reduzieren, Touch) und t26 (Videos).
- **Gesamtlauf (`sh tests/alle.sh`, ohne Wiederholung): 539 bestanden, 0 fehlgeschlagen.** Darin: npm test (RISE, t15, t7, t9, t11, t14, t16–t26) sowie t12 und t13 mit lokalen Servern; t25 26/26, t26 18/18.
- **Vorher zwei Läufe mit Fehlern, beide an der Ursache behoben:**
  1. 512/9: Hover-Verschiebung, Kontaktleiste 44 px, t25-Selektoren, t7.
  2. 398/11, Kette nach t20 abgebrochen: Kontaktleiste 61 px.
- **t7 «schnelles Überfahren»:** Der Test mass vorher die Zeilenposition zwischen den Mausbewegungen. Mit laufendem Rundgang im Hintergrund wurde die Bewegung dadurch langsamer als die Absichtsverzögerung von 55 ms. Jetzt werden die Positionen vorab gemessen. Grenze (≤ 4 Wechsel) und Verzögerung sind unverändert.
