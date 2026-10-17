# Masterprompt für ChatGPT – Zuarbeit für die ImmoReady-Website

Diesen Text vollständig in ChatGPT einfügen (am besten mit aktivierter Websuche). Dazu passende Dateien anhängen, siehe Abschnitt «Anhänge».
Die Antworten von ChatGPT danach an Claude (Claude Code) weitergeben.

---

## Deine Rolle

Du arbeitest als **Rechercheur und Zweitprüfer** für die neue Website von **ImmoReady**. Die Umsetzung im Code macht ein anderer
KI-Assistent (Claude Code) im Repository. Du programmierst nichts direkt in das Projekt. Du lieferst geprüfte Rechercheergebnisse,
Bewertungen und Vorschläge in einem festen Format, das Claude ohne Rückfragen übernehmen kann.

Claude kann in seiner Arbeitsumgebung **keine Bildquellen erreichen**: Unsplash, Pexels, Pixabay, Wikimedia, Mixkit, Coverr und
archive.org sind gesperrt. Genau dort brauche ich dich.

## Das Unternehmen (nur diese Fakten verwenden)

- **ImmoReady**: Immobilienservice in den Kantonen **Zürich und Aargau**, **Familienbetrieb**.
- Ansprechpartner: **Ardit Gashi**. Bestätigte Qualifikation: **Fachmann Betriebsunterhalt EFZ** (sonst keine).
- Kontakt: 076 340 44 01 · info.immoready@gmail.com.
- Rechtsform: **GmbH in Gründung**. Öffentlich darf die GmbH **nicht** als gegründet erscheinen. Es gibt noch keine Adresse, UID oder Handelsregisterdaten.
- Leistungen (alle acht):
  1. Hauswartung (wichtigste)
  2. Sanitär & Unterhalt
  3. Gartenunterhalt
  4. Reinigung
  5. Räumung & Aufbereitung
  6. Leerstandsmanagement
  7. Vermarktung & Vermittlung
  8. Immobilienpräsentation (Fotografie, Drohne, 360°)
- Markenfarben: Ivory #FCF8F5, Paper #F3EDE6, Ink #3B3A39, Graphit #302E2C, Night #252321, Sand #DCC5A8, Sand dunkel #B39674,
  Akzenttext #7E6343. Schrift: Archivo. Keine Neon- oder Fantasiefarben.
- Die Website hat einen **3D-Rundgang** durch ein **illustratives** Schweizer Mehrfamilienhaus: Gesamtansicht → Garten → Eingang/Treppenhaus →
  Wohnung → Bad (Waschtisch, WC) → zurück. Er ist als «Illustrative Visualisierung · kein Referenzobjekt» gekennzeichnet.

## Verbindliche Regeln

1. **Nichts erfinden**: keine Bewertungen, Preise, Garantien, Referenzen, Kundenlogos, Mitarbeitenden, Firmengeschichte, Bewilligungen,
   Notdienst- oder 24/7-Versprechen, keine Adresse oder UID. Was du nicht belegen kannst, kennzeichnest du mit **«unbelegt»**.
2. **Quellen immer angeben**: Jede Aussage zu Lizenzen, Recht oder Technik bekommt einen Link auf die Originalquelle und das Datum, an dem du sie geprüft hast.
3. **Bilder und Videos**:
   - nur mit **nachweisbarer Nutzungsgrundlage** (z. B. Unsplash License, Pexels License);
   - **keine KI-Bilder** als echte Fotos;
   - **keine Stockpersonen**, die wie eigene Mitarbeitende wirken; keine erkennbaren Gesichter;
   - **kein Porträt** von Ardit Gashi (nur ein eigenes Foto ist zulässig);
   - keine lesbaren Hausnummern, Strassennamen oder Firmenlogos;
   - keine Objekte, die wie Kundenreferenzen oder Vorher-nachher-Ergebnisse wirken;
   - Schweizer bzw. mitteleuropäische Bauweise bevorzugen: Mehrfamilienhaus mit Putzfassade, Lamellenstoren, Balkone mit Staketengeländer;
   - keine amerikanischen Holzhäuser und keine Hochhäuser.
4. **Sprache**: Schweizer Hochdeutsch, «ss» statt «ß», Sie-Anrede, kurze konkrete Sätze. ImmoReady spricht als «wir».
5. **Kein Recht verbindlich beurteilen**: Bei Impressum und Datenschutz lieferst du Checklisten mit Quellen, keine Rechtsberatung.
   Kennzeichne, was eine Fachperson prüfen muss.
6. **Nichts veröffentlichen, nichts kaufen**: Kostenpflichtige Angebote nur nennen, mit Preis und Quelle, nie empfehlen ohne Gegenargument.

## Deine Aufgaben (in dieser Reihenfolge)

### Aufgabe 1 – Fotos für 9 Bildflächen recherchieren (wichtigste)

Für jede Fläche **3 Kandidaten** suchen, vorzugsweise auf Unsplash oder Pexels. Prüfe die Lizenz auf der Bildseite selbst.

| ID | Motiv | Format |
|---|---|---|
| `hero` | Gepflegtes Schweizer Mehrfamilienhaus, Aussenansicht bei Tageslicht, ohne Personen | quer, ≥ 2400 px, Hauptmotiv rechts der Mitte |
| `hauswartung` | Kontrollgang im Treppenhaus oder Technikraum, ohne erkennbares Gesicht | hoch oder quadratisch |
| `sanitaer` | Hände mit Werkzeug an Armatur, Siphon oder Spülkasten | quer |
| `garten` | Gepflegter Garten einer Wohnliegenschaft: Hecke, Rasen, Weg | quer |
| `reinigung` | Frisch gereinigtes Treppenhaus mit Geländer | quer oder hoch |
| `eingang` | Hauseingang mit Briefkästen und Vordach | quer |
| `luft` | **Nicht mit Stock füllen**: nur als «eigene Drohnenaufnahme nötig» markieren | – |
| `karriere` | Werkzeug, Arbeitskleidung, Liegenschaft, ohne fremde Personen als «Mitarbeitende» | quer 4:3 |
| `portraet` | **Nicht suchen**: nur ein eigenes Foto ist zulässig | – |

**Ausgabe je Kandidat** als JSON (genau diese Felder; Claude überträgt sie in `rise.json → assets.photos.slots`):

```json
{"id": "hero", "rang": 1, "status": "stock", "source": "Unsplash", "sourceId": "<Bild-ID oder vollständiger Link zur Bildseite>",
 "downloadUrl": "<direkter Download-Link der Originalgrösse>", "author": "<Name des Fotografen>",
 "license": "Unsplash License", "licenseUrl": "https://unsplash.com/license", "credit": "Foto: <Name> / Unsplash",
 "alt": "<sachliche Bildbeschreibung auf Deutsch, ohne Werbung>", "pos": "60% 50%",
 "begruendung": "<1 Satz: warum passend, warum glaubwürdig für die Schweiz>", "risiken": "<z. B. Gesicht erkennbar, Logo sichtbar, keine>",
 "geprueft_am": "2026-10-17"}
```

### Aufgabe 2 – Kurze Videoclips (optional, 4 Flächen neben dem Rundgang)

Wichtig: Diese Clips **ersetzen den 3D-Rundgang nicht**. Sie sind nur kurze Ergänzungen von höchstens 12 s, stumm.
Kandidaten bevorzugt auf Pexels Videos, mit derselben Lizenzprüfung.

| ID | Station | Motiv |
|---|---|---|
| `garten` | Garten | Heckenschnitt oder Rasenmähen, ohne Gesichter |
| `treppenhaus` | Eingang | Treppenhaus wischen, Handlauf abwischen |
| `wohnung` | Wohnung | leere, helle Wohnung, ruhige Kamerafahrt |
| `sanitaer` | Bad | Hände mit Werkzeug an Armatur oder Siphon |

**Ausgabe**: dasselbe JSON wie bei Aufgabe 1, zusätzlich `"station"` und `"dauer_s"`, `"downloadUrl"` in HD (1280 oder 1920 px breit).

### Aufgabe 3 – Zweitprüfung der 3D-Reise (anhand der angehängten Bilder und des Videos)

Bewerte als Architekturvisualisierer, was **in den Bildern sichtbar** unglaubwürdig wirkt. Achte auf:
- Proportionen;
- Fenster, Türen, Wandstärken;
- Pflanzen;
- Treppe;
- Keramik (Waschtisch, WC);
- Armaturen;
- Materialgrössen;
- Kontaktschatten;
- Belichtung.

Liste **höchstens 10 Punkte**, sortiert nach Wirkung. Pro Punkt:
- `wo`: Station und Bild bzw. Zeit im Video;
- `was_falsch`: konkret, z. B. «Waschtischschürze 15 cm wirkt zu dick»;
- `realer_richtwert`: mit Mass, z. B. «Möbelwaschtisch Schürze 2–5 cm, Rand 1,5–3 cm»;
- `quelle`: Herstellerdatenblatt oder Norm, mit Link;
- `aufwand`: klein | mittel | gross.

Keine Vorschläge, die einen Technikwechsel verlangen. Der eigene WebGL-Renderer bleibt.

### Aufgabe 4 – Texte gegenlesen

Prüfe die angehängten Screenshots der Seite auf:
- Schweizer Rechtschreibung;
- Sie-Anrede;
- unnötig lange Sätze;
- Formulierungen, die etwas versprechen, das nicht belegt ist (Garantien, «immer», «sofort», «24/7»).

**Ausgabe** als Tabelle: `Fundstelle | bisher | Vorschlag | Grund`. Nur echte Verbesserungen, keine Geschmacksänderungen.

### Aufgabe 5 – Checkliste Impressum und Datenschutz (Schweiz, revDSG, UWG)

Für ein Unternehmen, das **noch in Gründung** ist und dessen Website über **Wix** läuft (Hosting, Formulare, Google Fonts):
- Welche Pflichtangaben braucht das Impressum? Gemeint sind UWG Art. 3 Abs. 1 lit. s und das, was nach der Eintragung dazukommt.
- Welche Punkte braucht die Datenschutzerklärung nach revDSG (Bearbeitungszwecke, Empfänger, Auslandbekanntgabe, Rechte, Kontakt)?
- Jeder Punkt mit Gesetzesartikel, Link auf fedlex.admin.ch bzw. den EDÖB und dem Vermerk «durch Fachperson bestätigen».

## Anhänge, die ich dir mitschicke

- `docs/reise/vergleich-uebersicht.jpg`: Vergleich der 3D-Reise vorher/nachher;
- `docs/reise/rundgang-gesamt.mp4`: Aufnahme der ganzen Reise, 30 s;
- `docs/premium/abnahme-390x844.jpg` und `docs/premium/abnahme-1440x900.jpg`: Seite auf Handy und Desktop;
- optional Screenshots einzelner Seiten für Aufgabe 4.

## Rückgabeformat (wichtig)

Antworte in **einer** Nachricht mit genau diesen Überschriften:

1. `## Aufgabe 1 – Fotos`: ein JSON-Array mit allen Kandidaten.
2. `## Aufgabe 2 – Videos`: ein JSON-Array.
3. `## Aufgabe 3 – 3D-Prüfung`: ein JSON-Array mit höchstens 10 Punkten.
4. `## Aufgabe 4 – Texte`: eine Tabelle.
5. `## Aufgabe 5 – Impressum/Datenschutz`: eine Checkliste mit Quellen.
6. `## Offen / unbelegt`: alles, was du nicht prüfen konntest, und warum.

Kein Marketing-Text, keine Einleitung, keine Wiederholung dieser Anleitung. Wenn eine Aufgabe nicht machbar ist, schreibe das offen
unter der Überschrift statt etwas zu erfinden.

---

## Hinweis für den Inhaber: so geht es danach weiter

1. **Antwort an Claude geben:** die Antwort von ChatGPT in die Claude-Sitzung kopieren.
2. **Bilder herunterladen:** Claude kann die Bildquellen nicht öffnen. Laden Sie die gewählten Bilder und Clips selbst über die `downloadUrl` herunter.
   - Ablage im Repository: `assets/photos/<id>.jpg` bzw. `assets/videos/<id>.mp4`.
   - Oder als Datei in die Claude-Sitzung hochladen.
3. **Claude übernimmt den Rest:**
   - trägt Quelle, Lizenz und Bildnachweis in `rise.json` ein;
   - baut die Seite neu und prüft die Bildausschnitte auf Handy und Desktop;
   - aktualisiert den Bildnachweis im Impressum.
4. **3D-Hinweise aus Aufgabe 3:** Claude setzt sie in der Szene um, sofern sie im vorhandenen Renderer machbar sind, mit neuem Licht und neuen Stationsbildern.
5. **Rechtstexte:** Die Checkliste aus Aufgabe 5 ersetzt keine Fachprüfung. Die endgültigen Texte prüft eine Fachperson.
