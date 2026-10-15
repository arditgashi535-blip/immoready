# Einbau des Rundgangs in Wix (V17.1) – kurz

Stand: vorbereitet, **nicht eingebaut**. In Wix wurde nichts verändert, nichts veröffentlicht, keine Domain angefasst.
Veröffentlichung nur nach ausdrücklicher Freigabe durch Ardit Gashi.

## Benötigte Dateien (aus `dist/`)

| Datei | Zweck |
|---|---|
| `component/immoready-tour.js` | Web Component `<immoready-tour>` (Shadow DOM), lädt Bilder, Texturen und Lichtdaten aus `assets-base` |
| `component/assets/tour/` | 16 Stations- und Detailbilder (quer 1440×900, hoch 960×864), 9 Materialtexturen, `licht.json` |
| `component/immoready-tour.inline.js` | Ausweichvariante ohne Bilderordner (alles eingebettet, ca. 2 MB) |
| `wix/velo-custom-element.js` | Velo-Seitencode für die Startseite |
| `wix/velo-offertseite.js` | Velo-Seitencode für die Offertseite (Vorauswahl der Leistung aus `?leistung=`) |
| `site/` | Produktionsform der ganzen Seite mit getrennten Dateien (für eigenes Hosting/Tests, nicht für Wix nötig) |

## Empfohlen: Custom Element `<immoready-tour>` im Stationsmodus

| Was | Wert |
|---|---|
| Wix-Element | «Hinzufügen» → «Einbetten» → «Benutzerdefiniertes Element» |
| Einbauort | Startseite, direkt unter dem Kopf (ersetzt das bisherige Titelbild), volle Breite |
| Quelle | «Velo-Datei»: `public/custom-elements/immoready-tour.js` (Inhalt von `dist/component/immoready-tour.js`) – oder «Server-URL» (HTTPS-Adresse **noch offen**) |
| Tag-Name | `immoready-tour` |
| **Element-ID** (Eigenschaften-Panel) | `immoreadyTour` |
| Attribut `mode` | `steps` (empfohlen, siehe unten) |
| Attribut `station` | optional `0`–`5` (Startstation) |
| Attribut `assets-base` | HTTPS-Ordner mit dem Inhalt von `dist/component/assets/tour/` (Ordner **noch offen**, Abruf per CORS freigeben). Ohne Ordner: `immoready-tour.inline.js` verwenden |
| Höhe im Editor | volle Bildschirmhöhe, mindestens 600 px; Breite: ganze Seite |
| Seitencode | `wix/velo-custom-element.js` in den Code der Startseite kopieren |
| Zielseiten im Code | `OFFERTE_PFAD = '/offerte'`, `KONTAKT_PFAD = '/kontakt'` – **beide vor dem Einbau prüfen** (in `rise.json` ist `contactPath` noch `[UNSPECIFIED]`) |

Das Custom Element ruft keine Velo-API auf; es sendet nur Ereignisse. Der Seitencode entscheidet über die Navigation.

### Ereignisse (CustomEvent, `event.detail`, bubbles + composed)

| Ereignis | Nutzdaten | Velo-Reaktion |
|---|---|---|
| `tour-ready` | `{version:"17", mode:"webgl"\|"stills"}` | keine nötig |
| `station-change` | `{station, index, progress}` – `station` ∈ `aussen, garten, eingang, wohnung, bad, zurueck` | optional |
| `request-quote` | `{service, station, source:"tour", version:1}` – `service` ∈ `hauswartung, sanitaer, gartenunterhalt, reinigung, raeumung, leerstand, verkauf, fotografie` oder `""` | `/offerte?leistung=<service>` bzw. `/offerte` |
| `request-contact` | `{station, source:"tour", version:1}` | Kontaktseite |
| `tour-error` | `{code, fallback:"stills"}` | protokollieren; der Rundgang zeigt selbst die Stationsbilder |

`request-quote` wird doppelt geprüft: Der Rundgang sendet nur Schlüssel aus `rise.json → services` (unbekannt → `""`),
der Velo-Code akzeptiert nur Quelle `tour`, Version `1` und Werte aus seinen festen Listen.

Ereignisse, Element-ID und Velo-Code sind gegenüber V13–V16 unverändert; nur `tour-ready.version` lautet `"17"`
(der Velo-Code prüft die Version nicht). Neu in V17: Hochformatbilder 960×864 statt 960×1080 (gleiche Dateinamen),
Smartphone-Stationsleiste waagrecht scrollbar, Bad mit Unterschrank; Bildnamen unverändert. Die Ansichtswahl im Bad
(«Übersicht · Waschtisch · WC», seit V16) und die Leistungspunkte (seit V15) lösen keine neuen Ereignisse aus.

Steuerung von der Wix-Seite: `$w('#immoreadyTour').setAttribute('station', '4')` (0–5).

## Vorauswahl der Leistung auf der Offertseite (neu in V17.1)

| Was | Wert |
|---|---|
| Ablauf | Rundgang → `request-quote {service}` → Startseiten-Code → `wixLocation.to('/offerte?leistung=<service>')` → Offertseite liest `wixLocation.query.leistung` |
| Seitencode | `wix/velo-offertseite.js` in den Code der Offertseite kopieren |
| **Element-ID** des Leistungsfelds | `leistungFeld` (Dropdown oder Optionsfeld; **vor dem Einbau prüfen**) |
| Werte | Option mit dem Schlüssel (`hauswartung` …) oder mit der Beschriftung aus der Liste im Code |
| Prüfung | unbekannter oder fehlender Parameter → keine Vorauswahl; nur die 8 Schlüssel aus `rise.json` werden akzeptiert |
| Einschränkung | Felder des neuen Wix-Forms-Elements sind je nach Version nicht per Velo setzbar – dann eigenes Velo-Formular oder ohne Vorauswahl |

## Wo die Dateien in Wix liegen

| Datei | Ort in Wix |
|---|---|
| `dist/component/immoready-tour.js` | Velo-Seitenleiste → «Öffentlich» → `public/custom-elements/immoready-tour.js` |
| `dist/component/assets/tour/*` (16 WebP, 9 Texturen, `licht.json`) | HTTPS-Ordner mit CORS-Freigabe (Adresse **offen**); Wert für `assets-base` |
| `wix/velo-custom-element.js` | Seitencode der Startseite |
| `wix/velo-offertseite.js` | Seitencode der Offertseite |

## Offertformular an Wix anbinden (vorbereitet, nicht eingerichtet)

Geprüft am 15.10.2026 über die Wix-API (nur lesend): Site «Immoready» veröffentlicht, Velo aktiv, Wix Forms installiert,
**im aktuellen Wix-Forms-System ist kein Formular vorhanden** (Form Schemas: 0). Wix Bookings mit 8 Diensten vorhanden.
Es gibt also noch keinen Empfänger für Offertanfragen; die Vorschau bleibt bis zur Einrichtung im Demo-Modus.

| Schritt | Was | Wer / Freigabe |
|---|---|---|
| 1 | CMS-Sammlung **`Offertanfragen`** anlegen. Felder: `leistung`, `auftrag`, `ort`, `beschreibung`, `name`, `email`, `tel` (Text), `fotos` (Array/Objekt), `quelle`, `status` (Text). Berechtigungen: Lesen/Schreiben nur Admin (Einträge schreibt der Backend-Code mit `auth.elevate`). | Änderung an der Site → **Freigabe nötig** |
| 2 | `wix/backend/http-functions.js` als **Backend → http-functions.js** einfügen (Endpunkte `/_functions/offerte`, `/_functions/offerteUpload`, CORS nur für immoready.ch). | Freigabe nötig |
| 3 | Wix-Automation «Neuer Eintrag in Offertanfragen → E-Mail an info.immoready@gmail.com» einrichten. **Annahme (Eintrag gespeichert) und Benachrichtigung sind getrennte Prüfschritte.** | Freigabe nötig |
| 4 | Site veröffentlichen (HTTP-Funktionen sind erst auf der veröffentlichten Site erreichbar). | **ausdrückliche Freigabe** |
| 5 | In `rise.json → wix.formEndpoint` die Basisadresse eintragen (`https://www.immoready.ch/_functions`), `python3 build.py`. Danach verschwindet der Demo-Hinweis. | lokal |
| 6 | Testversand mit einer eigenen Adresse (z. B. info.immoready@gmail.com), keine Kundendaten: Eintrag in der Sammlung sichtbar? E-Mail angekommen? Foto im Media Manager unter `/offerten`? | Freigabe für den Testversand |

Verhalten im Browser (getestet gegen einen simulierten Endpunkt, `tests/t21-fertigstellung.js`): Fotos werden einzeln über eine
vom Server erzeugte Upload-Adresse hochgeladen (keine Schlüssel im Browser), danach wird die Anfrage gesendet. Erfolg erscheint
nur bei HTTP 200 mit `ok:true` und Referenz-ID. Netzwerkausfall, Zeitüberschreitung, Upload-Fehler, Serverprüfung (400 mit Feldern)
und unbestätigte Antworten zeigen je eine eigene Meldung; Eingaben bleiben erhalten; Doppelklick ist gesperrt.

**Einschränkung:** Der Backend-Code wurde in dieser Umgebung nur mit Platzhalter-Modulen geprüft (Logik, Validierung, CORS),
nicht in Wix ausgeführt. `@wix/data`, `@wix/media` und `@wix/essentials` müssen im Wix-Editor unter «Pakete» verfügbar sein.

## Warum Stationsmodus statt Scrollmodus in Wix

Der Scrollmodus braucht einen Abschnitt von rund 7,6 Bildschirmhöhen, dessen Fortschritt aus dem Seitenscroll
berechnet wird. Ein Wix-Element hat eine im Editor fest eingestellte Pixelhöhe; auf unterschiedlich hohen
Bildschirmen stimmt das Verhältnis nicht, und Editor und Vorschau zeigen Custom Elements zusätzlich in einem iFrame.
Der Stationsmodus («Weiter»/«Zurück», Stationspunkte, Tastatur) funktioniert unabhängig davon.

## Alternative: HTML-iFrame

| Was | Wert |
|---|---|
| Wix-Element | «Einbetten» → «Code einbetten» → «HTML-iFrame», Modus «Website-Adresse» |
| Adresse | öffentliche Adresse von `dist/immoready-rundgang-embed.html` (**noch offen**) |
| **Element-ID** | `rundgang` |
| Seitencode | `wix/velo-seitencode-startseite.js` |
| Nachrichten | vom Rundgang: `SCENE_READY`, `REQUEST_QUOTE {leistung}`, `REQUEST_CONTACT`; an den Rundgang: `GO_TO_STATION {index}`, `SET_PROGRESS {value}` |
| Erlaubte Ursprünge | `https://www.immoready.ch`, `https://immoready.ch` (aus `rise.json`) |

## Testschritte auf einer unveröffentlichten Testseite (vor jeder Freigabe)

1. Seite duplizieren (z. B. «Start-Test»), auf «nicht im Menü» und **nicht veröffentlichen**.
2. Custom Element einfügen, ID `immoreadyTour`, Attribute setzen, Seitencode einfügen.
3. Vorschau: `tour-ready` erscheint in der Konsole (`console.info` aus dem Seitencode ergänzen), sechs Stationen
   anwählen, im Bad «Übersicht · Waschtisch · WC».
4. «Offerte anfragen» an jeder Station und jeden Leistungspunkt klicken → richtige Offertseite mit `?leistung=…`,
   Leistungsfeld ist vorausgewählt; `/offerte?leistung=unbekannt` wählt nichts vor.
5. Smartphone-Ansicht im Editor und auf einem echten iPhone und Android-Gerät: Stationsbilder, Stationsleiste,
   Kontaktleiste verdeckt nichts.
6. Safari (macOS/iOS) prüfen. Erst danach – mit Freigabe – veröffentlichen.

## Vor dem Livegang (Pflicht)

1. Hosting für Komponente und Bilder festlegen (Wix `public/` bzw. Medienverwaltung oder eigene HTTPS-Adresse).
2. Pfade der Offert- und Kontaktseite in Wix bestätigen und im Velo-Code eintragen.
3. Formular an Wix Forms anbinden und einen echten Testversand prüfen (Eintrag gespeichert, Benachrichtigung an
   info.immoready@gmail.com); bis dahin bleibt es als Demo gekennzeichnet (keine Erfolgsmeldung ohne Versand).
4. Impressum: Adresse, Rechtsform und UID eintragen (in `rise.json` noch `[UNSPECIFIED]`).
5. Test auf echtem iPhone (Safari) und Android-Gerät (Chrome) – bisher nur Browser-Emulation.
