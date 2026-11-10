# Offertformular – Prüfung durch den Inhaber (End-to-End)

Stand 09.11.2026 · Formular «Offertanfragen» (Wix Forms, Formular-ID `9671b663-fabd-48c6-b63e-53b20f09ca7e`)
auf der Wix-Headless-Seite `f486f5d5-a0d6-45e5-80a7-44befc45746e`.

## Was bereits automatisch geprüft ist

- `tests/t31-formular-wix.js` (13 Prüfungen, **nachgebildeter** Wix-Endpunkt, keine echte Übermittlung): Pflichtfelder, Fehlerübersicht
  und Fokus, E-Mail/Telefon, genau **eine** Übermittlung bei Mehrfachklick, Besucher-Token wird wiederverwendet, nur die 7 Formularfelder
  werden gesendet, Referenz aus der Wix-Antwort in der Bestätigung, Fehlerfälle 400/500/Netzabbruch (Eingaben bleiben erhalten),
  Honigtopf-Feld gegen einfache Bots.
- Live (09.11.2026): Wix hat eine Testanfrage angenommen (Referenz zurückgegeben). Sie lag wegen der Adresse `test@example.com`
  im **Spam-Ordner** (Grund `EMAIL_BLOCKLISTED`) und wurde gelöscht.

## Einstellungen in Wix (vom Inhaber im Dashboard zu prüfen)

| Punkt | Stand |
|---|---|
| Spam-Schutz | `ADVANCED` (Sperrlisten, Häufung gleicher E-Mail, KI-Textprüfung). Echte Adressen kommen durch; Tests aus Rechenzentren oder mit Beispieladressen landen im Spam. |
| Kontakt anlegen | ja: Die E-Mail-Adresse jeder Anfrage wird als Wix-Kontakt gespeichert. |
| E-Mail-Benachrichtigung an ImmoReady | **nicht im Formular hinterlegt** – im Dashboard einschalten: Wix-Dashboard der neuen Seite → Formulare → Formular «Offertanfragen» → Einstellungen/Benachrichtigungen (bzw. Automatisierungen) → Empfänger info.immoready@gmail.com. Kostenlos im Wix-Forms-Grundumfang; falls Wix dafür einen Plan verlangt: nicht buchen, melden. |
| Fotos | keine Upload-Funktion (Wix verlangt dafür einen bezahlten Plan). Hinweis im Formular: Fotos per E-Mail senden. |

Dashboard: https://manage.wix.com/dashboard/f486f5d5-a0d6-45e5-80a7-44befc45746e

## Manueller Test (5 Minuten)

1. Benachrichtigung einschalten (siehe Tabelle).
2. Live-Seite öffnen: https://headless-nvjfhfnkngv-infoimmoready-140d.wix-site-host.com/#offerte – am besten auf dem Handy im Mobilfunknetz.
3. Ausfüllen: Leistung «Hauswartung», Ort «8105 Regensdorf», Beschreibung «Test Inhaber – bitte nach Prüfung löschen»,
   Name «Ardit Gashi», **eigene** E-Mail-Adresse (nicht info.immoready@…, damit die Benachrichtigung unterscheidbar ist), Telefon leer lassen.
4. «Unverbindliche Offerte anfragen» **einmal** klicken.

Prüfpunkte:

| # | Erwartung | Wo prüfen |
|---|---|---|
| 1 | Bestätigung «Vielen Dank für Ihre Anfrage» mit «Anfrage gespeichert · Referenz …» | auf der Seite; Referenz notieren |
| 2 | Anfrage gespeichert, gleiche Referenz | Dashboard → Formulare → «Offertanfragen» → Einsendungen |
| 3 | korrekt klassifiziert: unter Einsendungen, **nicht** im Spam-Ordner; alle Felder richtig zugeordnet | dieselbe Ansicht, Spam-Ordner kontrollieren |
| 4 | interne Benachrichtigung angekommen | Postfach info.immoready@gmail.com (auch Spam-Ordner von Gmail) |
| 5 | genau **eine** Einsendung, kein Duplikat | Anzahl Einsendungen = 1 |

Danach die Testanfrage im Dashboard löschen (und den Testkontakt unter Kontakte, falls er stört).

Fällt Punkt 3 durch (Anfrage im Spam): im Dashboard «Kein Spam» wählen und mir die angezeigte Begründung nennen.
Fällt Punkt 4 durch: Benachrichtigungseinstellung prüfen; Gmail-Filter prüfen.
