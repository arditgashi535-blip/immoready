# Fotoliste und Bildstatus

Stand: 15. Oktober 2026

## Stand heute (ehrlich)

- **Eigene Betriebsfotos: keine vorhanden.** Geprüft wurden das Repository und die Wix-Mediathek der Site «Immoready» (nur lesend, 22 Bilddateien).
  - Dort liegen vor allem KI-Bilder: 10 Dateien mit Herkunft `runware.ai`.
  - Dazu kommen Logos und drei aus dem Web übernommene Dateien ohne nachweisbare Nutzungsgrundlage: `AdobeStock_508007942-1.jpg`, `Leerstand-Voecklabruck2-scaled.jpg` und `as-scaled-…jpg`. Diese drei werden **nicht** verwendet.
- **Stockfotos: nicht beschafft.** Die Netzwerkrichtlinie dieser Arbeitsumgebung sperrt Unsplash, Pexels, Pixabay, Wikimedia Commons und `static.wixstatic.com` (Antwort 403 des Proxys). Ohne Zugriff lassen sich Herkunft und Lizenz nicht nachweisen. Deshalb wurde kein Fremdbild eingesetzt.
- **Google Drive:** Der Connector ist in dieser Sitzung nicht angemeldet. Eigene Fotos konnten dort nicht gesucht werden.
- **Folge:** Alle neun Bildflächen sind vorbereitet. Acht zeigen bis zum Ersatz das bisherige Canva-KI-Bild, sichtbar gekennzeichnet als **«Symbolbild (KI)»**. Das Porträt bleibt leer, denn ein künstliches Porträt ist nicht zulässig. `npm run launch:check` führt jede KI-Fläche als offenen Punkt.

## Was Sie liefern (konkret, 9 Motive)

| ID | Motiv | Format / Hinweis | verwendet in |
|---|---|---|---|
| `hero` | Gepflegtes Schweizer Mehrfamilienhaus, Aussenansicht bei Tageslicht, ohne Personen und ohne lesbare Hausnummer | quer, mind. 2400 px breit; Hauptmotiv rechts der Bildmitte (links liegt Text) | Einstieg Startseite, Vermarktung |
| `hauswartung` | Hauswartung bei der Arbeit: Kontrollgang im Treppenhaus oder Technikraum | hoch oder quadratisch; Ihr eigenes Foto bevorzugt | Schwerpunkt Hauswartung |
| `sanitaer` | Echte Sanitärarbeit: Hände mit Werkzeug an Armatur, Siphon oder Spülkasten | quer; nur eigene oder lizenzierte Bilder | Sanitär & Unterhalt |
| `garten` | Gepflegter Garten einer Wohnliegenschaft: Hecke, Rasen, Weg | quer | Gartenunterhalt |
| `reinigung` | Reinigung eines Treppenhauses: frisch gewischter Boden, Geländer | quer oder hoch | Reinigung, Räumung |
| `eingang` | Hauseingang mit Briefkästen und Vordach | quer | Leerstand, Leistungsübersicht |
| `luft` | Luftaufnahme einer Wohnliegenschaft, nur eigene Drohnenaufnahme | quer | Immobilienpräsentation |
| `karriere` | Arbeitsmotiv: Werkzeug, Arbeitskleidung, Liegenschaft, ohne fremde Personen, die als Mitarbeitende erscheinen | quer 4:3 | Karrierebanner |
| `portraet` | Echtes Porträt von Ardit Gashi oder Familienfoto (nur eigenes Foto) | hoch 4:5 | Familienbetrieb, Über uns |

## So werden Fotos eingesetzt (ohne Programmierung im Seitencode)

1. Datei ablegen: `assets/photos/<id>.jpg`, zum Beispiel `assets/photos/hero.jpg`. Grösse beliebig; der Build verkleinert auf höchstens 1800 px und speichert als JPEG mit Qualität 82.
2. In `rise.json → assets.photos.slots` beim Eintrag setzen:
   - eigenes Foto: `"status": "eigen"`, `"file": "assets/photos/hero.jpg"`, `"source": "ImmoReady"`, `"license": "eigenes Foto"`, `"credit": "ImmoReady"`;
   - Stockfoto: `"status": "stock"` plus `file`, `source` (Plattform), `sourceId` (Bild-ID oder Link), `author`, `license` (z. B. «Unsplash License») und `credit`. Fehlt ein Nachweis, bricht die Prüfung ab.
3. Für den Ausschnitt `pos` setzen (z. B. `"30% 50%"`), damit Desktop und Handy das Motiv zeigen.
4. `python3 build.py` ausführen. Das Bild ersetzt dann überall das Übergangsbild:
   - die Kennzeichnung wird angepasst (eigenes Foto: keine; Stockfoto: «Symbolbild»);
   - der Bildnachweis im Impressum wird ergänzt;
   - `launch:check` streicht den offenen Punkt.

## Für Stockfotos in einer späteren Sitzung

Die Umgebungseinstellung «Netzwerkzugriff» muss die Bildquelle erlauben, zum Beispiel `unsplash.com`, `images.unsplash.com`, `api.unsplash.com` oder `www.pexels.com`, `images.pexels.com`. Die Änderung wirkt erst in einer neuen Sitzung. Danach lassen sich je Motiv Bild-ID, Urheber und Lizenz dokumentieren. Kostenpflichtige Käufe nur nach Ihrer Freigabe.

## Videos zum Rundgang (vorbereitet, Stand 16. Oktober 2026)

Neben dem 3D-Rundgang ist ein Abschnitt **«Im Alltag»** vorbereitet. Er steht direkt vor dem Rundgang und zeigt je Station einen kurzen, stummen Clip. Jeder Clip hat eine Pause-Taste und die Aktionen «Im Rundgang ansehen» (springt zur Station) sowie «… anfragen» (mit Vorauswahl der Leistung).

- **Stand:** keine Videodatei vorhanden. Alle Videoquellen sind in dieser Arbeitsumgebung gesperrt (403 des Proxys): Pexels, Pixabay, Mixkit, Coverr, Videvo, Wikimedia Commons und archive.org. Öffentlich erscheint der Abschnitt erst mit einer Datei. Bis dahin sehen Sie mit «Prüfhinweise anzeigen» die offenen Motive.
- **Motive (`rise.json → assets.videos`):**

| ID | Station | Motiv |
|---|---|---|
| `garten` | Garten | Heckenschnitt oder Rasenmähen, ohne erkennbare Gesichter |
| `treppenhaus` | Eingang | Reinigung eines Treppenhauses, Boden wischen, Handlauf abwischen |
| `wohnung` | Wohnung | leere, helle Wohnung nach Räumung oder Reinigung, ruhige Kamerafahrt |
| `sanitaer` | Bad | Nahaufnahme: Hände mit Werkzeug an Armatur oder Siphon |

- **So setzen Sie einen Clip ein:**
  1. Datei unter `assets/videos/<id>.mp4` (H.264) oder `.webm` ablegen: stumm, höchstens 12 s, höchstens 4 MB. Ein Standbild als `assets/videos/<id>.jpg` ist optional.
  2. In `rise.json` diese Felder setzen: `status: "stock"`, `file`, `source` (Plattform), `sourceId` (Video-ID oder Link), `author`, `license`, `credit`. Optional zusätzlich `poster`.
  3. `python3 build.py` ausführen.
- **Was der Build dann erzeugt:**
  - die Kennzeichnung «Symbolvideo»;
  - den Bildnachweis im Impressum;
  - in der Produktionsform `dist/site/assets/videos/` (keine Einbettung).
- **Prüfung:** Ohne vollständigen Nachweis bricht der Build ab. KI-Videos sind nicht vorgesehen.
- **Inhaltliche Regel:** Stockclips zeigen typische Arbeiten, nie «unsere Mitarbeitenden», «unsere Objekte» oder Referenzen. Der Abschnitt sagt das ausdrücklich.
- **Prüfung:** `npm run test:videos` (t26). Dafür wird ein synthetisches Testbild aus ffmpeg verwendet (`tests/fixtures/testclip.webm`, nur für den Test, nie in der Seite).
