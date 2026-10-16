# Korrektur: die ursprüngliche 3D-Gebäudereise verbessern

Stand: 16. Oktober 2026 · Branch `v17.1-release-candidate` · nichts veröffentlicht, keine Domain und keine Live-Website verändert.

Alle Prüfungen und Bilder entstanden in dieser Arbeitsumgebung (Linux-Container, Headless-Chromium mit SwiftShader als Software-Grafik). Echte GPUs, ein echtes iPhone und ein echtes Android-Gerät wurden **nicht** geprüft.

## 1 Bestandsaufnahme

- **Die Reise war nicht verkürzt.** Route und Stationen sind seit V17 (Tag `v17-ausgang`) unverändert: dieselben 31 Stützpunkte, dieselben sechs Halte. Es ist eine zusammenhängende Kamerafahrt durch dasselbe Haus: Gesamtansicht → Garten → Haustür (öffnet 0,31–0,35) → Halle → Wohnungstür (öffnet 0,455–0,485) → Wohnung → Bad (Raum 0,73 → Waschtisch 0,752 → WC 0,772) → Wohnraum → Terrassentür (gleitet 0,845–0,875) → Gesamtansicht.
- **Kollisionen:** keine (`checkRoute(600)` = `[]`).
- **Warum die Tour «fehlen» konnte:** Auf dem Handy und bei niedrigen Bildschirmen zeigte die Seite bisher immer nur Bilder derselben Szene (kein 3D). Am Computer startet 3D erst, wenn der Abschnitt in Sichtnähe kommt (Einstieg: «Gebäude entdecken»).
- **Stockvideos:** Der vorbereitete Abschnitt «Im Alltag» ist **kein Ersatz** für die Reise. Er bleibt ohne Videodatei öffentlich unsichtbar. Die Verbesserung der 3D-Szene hing nicht davon ab.
- **Renderer:** Der eigene WebGL-Renderer bleibt. Es gibt keinen Technikwechsel und keine zweite Animationsschleife. Fortschritt, Türen, Stationswahl und Anfrageaktionen laufen unverändert über denselben Kern.

## 2 Sichtprüfung entlang der Fahrt (51 Bilder, p 0…1) – gefundene Schwächen und Korrekturen

| Stelle | Sichtbare Schwäche | Korrektur | Wo |
|---|---|---|---|
| Eingang → Treppenhaus | Nach der Haustür sah man nur Lift, Anschlagbrett und Pflanze, die Treppe kaum. | Neuer Stützpunkt p 0,405: Die Kamera schwenkt kurz auf den Treppenlauf (Wange, Staketengeländer, Eichenhandlauf), dann zum Halt «Eingang». Der Schwenk ist auf **30° je 1 %** begrenzt (Prüfgrenze 35°; ein erster Versuch mit 53° wurde verworfen). | `rise.json → tour.keyframes` |
| Badspiegel (Blick durch die Badtür) | Ein weisser, gezackter Fleck oben im Spiegel. Ursache: Ausserhalb des Bads wechselte der Spiegel auf die grobe Reflexionsaufnahme (128² Würfeltextur); darin erschien die Deckenleuchte als Treppenstufenmuster. | Echte planare Spiegelung auch aus Flur und Wohnung (Kamera bis x 7,6). Die Spiegelaufnahme enthält jetzt Gebäudehülle und Himmel und wird auf GPUs in voller statt halber Auflösung gerechnet. | `tour-core.js → mirrorVisible`, `renderMirror` |
| Wohnung | Deutlich zu dunkel und bräunlich, Möbel schwer lesbar. | Gezielt mehr Belichtung nur in der Wohnung (x > 5,4). Bad und Halle bleiben unverändert, damit die Keramik nicht ausbrennt. Die Lichtstimmung (blaue Stunde, warmes Innenlicht) bleibt. | `tour-core.js → expoTarget` |
| Waschtisch (Nahansicht) | Breiter, wulstiger Rand, weich gerundete Ecken. Der Waschtisch wirkte wie eine kleine Wanne. | Schlanker Keramikrand: vorne 2,5 cm, seitlich 3 cm, hinten Armaturenbank 9 cm. Becken mit steileren Wänden und flachem Boden, Aussenecken knapper gerundet, Überlauf auf die neue Beckenrückwand gesetzt. Danach **Licht neu gebacken** und **alle 16 Stationsbilder neu gerendert**. | `geometry.part.js` (Waschtisch), `assets/bake/licht.json`, `assets/tour/` |

**Geprüft und ohne Änderungsbedarf:**
- Fassade, Fenster, Laibungen und Balkone in Gesamt- und Gartenansicht;
- Haustür mit Öffnung und Durchfahrt;
- Treppe (Stufen, Wange, Geländer seit V17.1);
- WC mit getrennter Brille und Deckel;
- Rückfahrt durch die geöffnete Terrassentür.

**Bewusst nicht verändert:**
- Pauschal mehr Polygone.
- Ein Wechsel zu Tageslicht, der laut Auftrag nicht Voraussetzung ist.

## 3 Steuerung

| | Stand |
|---|---|
| Desktop | Scrollen steuert die Reise vorwärts und rückwärts. Stationsknöpfe springen direkt (auch rückwärts). «Tour überspringen» und «Offerte anfragen» sind immer erreichbar. |
| Ende | Nach der Rückkehr bleibt die Gesamtansicht stehen. Es gibt **keine automatische Wiederholung** und keine automatische Führung, deshalb braucht es keine Start-, Pause- oder Abbrechen-Steuerung. **Neu:** «Tour erneut starten» als freiwillige Aktion an der letzten Station. |
| Handy und niedrige Bildschirme | Zuerst hochwertige Bilder derselben Szene mit allen Funktionen. **Neu:** «3D-Ansicht starten» lädt dieselbe Szene im Bildrahmen, im Stationsmodus mit grossen Stationsknöpfen. Eigene Hochformat-Ausschnitte (`portraitShift`), Text unter dem Bild, die Seite scrollt normal (keine Scrollfalle). «Bilder statt 3D» schaltet zurück und beendet die Renderschleife. |
| Gerät zu langsam | Die Bildzeiten werden gemessen (Median aus 12 Bildern). Über 60 ms je Bild wechselt die Seite automatisch zu den Bildern, mit dem Hinweis «3D läuft auf diesem Gerät nicht flüssig …» (`tour-error TOO_SLOW`). |
| Bewegung reduzieren · ohne WebGL · Kontextverlust | Bilder derselben Szene, sechs Stationen, alle Anfrageaktionen. |

## 4 Kein zusätzliches Werkzeug nötig

Alle Korrekturen sind im vorhandenen Code erfolgt, der die Szene tatsächlich erzeugt (`geometry.part.js`), und im tatsächlich verwendeten Renderer (`tour-core.js`). Ein separates GLB oder eine Modellierungssoftware war nicht nötig.

Ein Bedarf entstünde erst bei fotografischen Materialscans (zum Beispiel lizenzierte Keramik-, Holz- oder Putztexturen) oder bei einem Wechsel zu Tageslicht mit neu abgestimmter Lichtplanung. Beides geht nur nach Ihrer Freigabe und mit geklärter Lizenz.

## 5 Ergebnisse

- **Aufnahme:** `docs/reise/rundgang-gesamt.mp4`. Die ganze Reise aus der echten Vorschauseite, 1280×720, mit Halt an jeder Station und an den Nahansichten Waschtisch und WC. Die Einzelbilder kommen aus der Software-Grafik und wurden zusammengesetzt, also keine Echtzeitaufnahme.
- **Vergleichsbilder (vorher | nachher, gleiche Kamerapunkte):** `docs/reise/vergleich-*.jpg` für Gesamtansicht, Garten, Treppenhaus, Eingang, Wohnung, Waschtisch und WC, ausserdem Handy Wohnung und Bad. Übersicht: `docs/reise/vergleich-uebersicht.jpg`.
- **Werkzeuge:**
  - `tools/route-bilder.js`: Bilder entlang der Fahrt;
  - `tools/handy-3d-bilder.js`: Handy, Bilder und 3D;
  - `tools/vergleich-reise.py`: Vergleichsbilder;
  - `tools/aufnahme-rundgang.js` (`npm run aufnahme`): Aufnahme der Fahrt.
- **Prüfung:** `tests/t27-reise.js` (`npm run test:reise`). Sie deckt ab:
  - Route und Kollisionen;
  - Treppenschwenk;
  - Türen;
  - Spiegel;
  - Stationsknöpfe;
  - Scrollen vorwärts und rückwärts;
  - Erreichbarkeit;
  - keine Wiederholung;
  - «Tour erneut starten»;
  - Handy-3D (Start, Ausschnitt, Station, kein Festhalten, zurück, erneuter Start);
  - Rückfall bei zu langsamer Darstellung;
  - Bewegung reduzieren und ohne WebGL.

## 6 Gesamtlauf

`sh tests/alle.sh` ohne Wiederholung: **562 bestanden, 0 fehlgeschlagen** (npm test exit 0 mit RISE, t15, t7, t9, t11, t14, t16–t27; dazu t12 und t13 mit lokalen Servern; t27 23/23).

Ein Lauf davor ergab 561/1. Der Fehler lag in der neuen Prüfung t27 selbst: Sie erwartete noch den Blickpunkt des ersten, zu ruckartigen Treppenschwenks. Sie prüft jetzt fachlich, ob der Blickpunkt im Treppenlauf liegt. Der neue Schwenk zielt mit x −1,9 dorthin und besteht damit. An der Seite wurde dafür nichts geändert.
