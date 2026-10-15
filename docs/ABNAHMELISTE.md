# Abnahmeliste ImmoReady – Stand V17.1 (Fertigstellung)

Stand: 15. Oktober 2026 · Branch `v17.1-release-candidate`. Ergebnis «✓» = am finalen Build im zusammenhängenden Gesamtlauf
(`npm run test:alle`: **442 bestanden, 0 fehlgeschlagen, ohne Wiederholung**) bzw. in der Sichtprüfung bestätigt. Umgebung: Headless-Chromium mit Software-GPU (SwiftShader),
Browseremulation für Smartphone/Tablet. **Kein echtes Smartphone, kein Safari, kein Wix-Betrieb geprüft.**

## Status getrennt

| Status | Ergebnis |
|---|---|
| **Vorschau fertig** (Build, Seiten, Aktionen, Desktop/Mobile, Fallbacks, Sichtprüfung) | erfüllt – siehe Tabelle; externe Anschlüsse ausdrücklich gekennzeichnet |
| **Livebetrieb geprüft** | **nein** – Wix-Einbau, echter Anfrageablauf, echte Geräte, Impressumsangaben und Freigabe fehlen |

## Funktionen

| Funktion | Sollverhalten | Prüfung | Ergebnis | offener Punkt |
|---|---|---|---|---|
| Build | `python3 build.py` erzeugt Vorschau, `dist/site/`, Komponente, iFrame-Variante | Build im Gesamtlauf, RISE 21/21 | ✓ | – |
| Seiten | 17 Routen erreichbar, Direktaufruf und Neuladen zeigen richtige Seite | t20 (13 Breiten × 17 Seiten), t21 (Reload 10 Unterseiten) | ✓ | – |
| Anker, Zurück/Vorwärts | Router löst alle Anker auf, Verlauf funktioniert | t20 (20 Anker), t21 | ✓ | – |
| Hauptnavigation, Dropdown | Links führen zur Seite, Dropdown per Maus/Tastatur | t7, t9 | ✓ | – |
| Mobiles Menü | öffnet, sperrt Hintergrund, scrollbar bei 568 px Höhe und quer, Escape/Schliessen/Link, Fokus zurück, Scrollposition bleibt, schliesst bei Wechsel auf Desktopbreite | t19, t20, t22 | ✓ | – |
| Skip-Link | erster Tabstopp, führt zum Inhalt der aktuellen Seite | t20 | ✓ | – |
| FAQ-Akkordeon | öffnet/schliesst, unterbrechbar, nichts abgeschnitten | t7 | ✓ | – |
| Leistungswahl / Vorauswahl | Leistungslink, Abschluss-Chip, jede Station (Garten, Eingang, Wohnung ×3, Bad; Gebäude/Abschluss ohne), Hotspots wählen Leistung im Formular vor | t7, t11, t21, t22 (8 Fälle) | ✓ | – |
| Telefon / E-Mail | einheitlich `tel:+41763404401`, `mailto:info.immoready@gmail.com` | t20 | ✓ | – |
| Terminlink | führt zu Wix Bookings (`/book-online`, Beratungsgespräch) | t20 (Format), Wix-API: 8 Bookings-Dienste vorhanden | ✓ (Ziel vorhanden) | Erreichbarkeit der Live-Seite aus dieser Umgebung nicht prüfbar (Proxy sperrt Domain) |
| Rundgang 6 Stationen | vorwärts/rückwärts, Sprünge, Türen rechtzeitig offen, keine Kollisionen (4000 Punkte), Nahebene frei | t11, t14, t16–t19 | ✓ | – |
| Tour überspringen | «Direkt zu den Leistungen» springt ohne Blockade | t11, t14 | ✓ | – |
| Bad-Details | Übersicht · Waschtisch · WC (3D-Fahrt bzw. Detailbild) | t18, t19, Abnahmebilder 23–25 | ✓ | – |
| Stationsleiste mobil | ≥ 44 px, Einrasten, Touch und Tastatur, aktive Station sichtbar | t19, t20 | ✓ | – |
| Fallbacks | ohne WebGL, Kontextverlust, Reduced Motion, Smartphone → Stationsbilder aus derselben Szene | t11, t13, t17 | ✓ | – |
| Renderloop | ausserhalb Sichtbereich 0 Bilder, Ruhezustand ohne Dauerschleife | t11, t21 | ✓ | – |
| Web Component | Bereitschaft, Ereignisse, request-quote mit erlaubten Werten, Mehrfachinstanzen, Entfernen/Einfügen, Cleanup | t13 (24), t15 (Velo-Adapter) | ✓ | – |
| iFrame-Variante | postMessage nur von erlaubten Ursprüngen | t12 (14) | ✓ | – |
| Mobile Layouts | 320–1920 px, Querformat, Tablet: kein Overflow **ohne** pauschales `overflow-x:hidden`, Logo unverzerrt, Touchziele ≥ 44 px, Kontaktleiste deckend ≤ 60 px | t19, t20, t22, Messung 15 Grössen × 17 Seiten | ✓ | – |
| Handy-Gestaltung | einspaltig, Rand 16 px einheitlich, keine leeren Flächen im Rundgang, kein dreifacher Offert-Knopf, lange Begriffe mit Trennstrich, Leistungsübersicht/Kontakt einspaltig | t22, Abnahmebilder `docs/v171/handy-*` | ✓ | – |
| Smartphone quer | Bildmodus mit normalem Scrollen (keine klebende 3D-Bühne bei ≤ 540 px Höhe) | Sichtprüfung h16/h17, t19/t20 quer | ✓ | – |
| Anker unter dem Kopf | Anker, Skip-Link, fokussierte Felder nicht hinter Kopf/Kontaktleiste | t22 | ✓ | – |
| 200 % Text | 320, 360 und 390 px ohne seitliches Scrollen, Ursachen behoben (vorher teils durch `overflow-x:hidden` verdeckt) | t19, t20, Messung 17 Seiten | ✓ | – |
| Tastatur geöffnet | Kontaktleiste ausgeblendet bei Fokus im Textfeld | t19 | ✓ (emuliert) | echte Bildschirmtastatur nur auf Gerät prüfbar |
| Drehen / Grösse | 390↔844 quer↔1280 ohne Fehler | t20 | ✓ | – |
| Formular – Prüfung | Beschriftungen, Typen, Autofill, Pflichtfelder, Fokus erstes Fehlerfeld, Eingaben bleiben | t7, t19, t20 | ✓ | – |
| Formular – Fotos | hinzufügen/entfernen; nur Bilder, ≤ 10 MB, ≤ 5 Stück (Browser und Server) | t20, t21 | ✓ | – |
| Formular – Übermittlung | Erfolg erst nach bestätigter Annahme (200, ok, ID); Lade-, Netzwerk-, Upload-, Server- und Prüffehler; Doppelklick gesperrt | t21 gegen **simulierten** Endpunkt | ✓ (simuliert) | **nicht angeschlossen**: Wix-Sammlung, Backend, Automation und Veröffentlichung fehlen → Demo-Modus aktiv |
| Formular – Backend | serverseitige Prüfung, CORS nur immoready.ch, Speichern, Upload-Adresse | t21 mit Platzhalter-Modulen | ✓ (Logik) | in Wix nicht ausgeführt |
| Produktionsform | `dist/site/` über HTTP ohne fehlgeschlagene Anfragen und Konsolenfehler (Desktop 3D, Mobil) | t19, t21 | ✓ | Hosting-Adresse offen |
| Unternehmensangaben | Impressum, Datenschutz, Kontakt, Footer aus `rise.json → firm.company`; öffentlich keine «GmbH»; Entwurf nur mit Prüfhinweisen; nichts erfunden | test_rise (8 Regeln), t23 | ✓ | Registerangaben nach Eintragung |
| Zugriff / Indexierung | Vorschau privat (Artefakt), `noindex,nofollow,noarchive`, `robots.txt` sperrt; Release-Build und `--launch` verweigern bis zur Freigabe | t23 | ✓ | Zugriffsschutz bei einem allfälligen Testhosting (Passwort) |
| Sichtprüfung Szene | Fassade, Garten, Eingang, Treppe, Lift, Wohnung, Küche, Bad, WC, Waschtisch, Armatur, Spiegel | 20 Szenenbilder, selbst geprüft | ✓ | – |
| Sichtprüfung Seite | Startseite mobil, Menü, alle 6 Stationen, Leistungen, Sanitär, Formular leer/Fehler, Footer + Kontaktleiste, 320, quer, Tablet, Desktop; ganze Seiten | 13 + 18 Sichtbereiche, 6 ganze Seiten, selbst geprüft | ✓ | – |

## Verbleibende externe Blocker (nur diese)

0. **GmbH-Eintragung bestätigen** und Registerangaben liefern (Firmenname, Sitz, Adresse, UID, Handelsregister, Vertretung, MWST, Funktion) – danach ausdrückliche Livegang-Freigabe.
1. **Freigabe** für Änderungen an der Wix-Site: Sammlung `Offertanfragen`, `http-functions.js`, Automation, Veröffentlichung.
2. **Hosting** der Komponente/Bilder (`rise.json → wix.elementHosting/assetsHosting`) und Pfad der Kontaktseite (`pages.contactPath`).
3. **Echte Geräte**: iPhone (Safari), Android (Chrome), Safari macOS.
4. **Impressum/Datenschutz**: endgültige Texte nach der Eintragung fachlich prüfen lassen (`rise.json → legal`).
