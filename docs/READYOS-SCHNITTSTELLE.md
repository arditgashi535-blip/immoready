# Schnittstelle Website → ReadyOS (vorbereitet, nicht in Betrieb)

Stand 09.11.2026. Code: `integrations/readyos/` · Prüfung: `node tests/t32-readyos.js` (11 Prüfungen, nachgebildeter Empfänger).

## Grundsätze

1. **Die Website bleibt unabhängig.** Anfragen werden in Wix Forms gespeichert (Formular «Offertanfragen»), Buchungen in Wix Bookings.
   ReadyOS liest daraus; fällt ReadyOS aus, funktionieren Website, Formular und Buchung unverändert weiter.
2. **Nichts geht verloren.** Was ReadyOS nicht annimmt, bleibt in der Warteschlange und kann jederzeit erneut aus Wix gelesen werden
   (Wix hält die Einsendungen).
3. **Einmal verarbeiten.** Jedes Ereignis hat einen Idempotenz-Schlüssel (`wix-forms:<Einsendungs-ID>`,
   `wix-bookings:<Buchungs-ID>:<Revision>`). ReadyOS antwortet bei Wiederholung mit 409 und legt nichts doppelt an.
4. **Nur mit Freigabe.** Jedes Ereignis trägt `requiresApproval: true`. ReadyOS darf daraus Kunden-, Anfrage- und Aufgabenentwürfe
   anlegen und Offertentwürfe vorbereiten; **E-Mails an Kunden, Offerten, Terminzusagen und andere verbindliche Aktionen nur nach
   Freigabe des Inhabers**. Der Adapter selbst versendet nichts und schreibt nichts nach Wix zurück.
5. **Keine Zugangsdaten im Repository.** `READYOS_URL` und `READYOS_TOKEN` kommen zur Laufzeit aus der Umgebung.

## Ablauf

```
Besucher ─▶ Website-Formular ─▶ Wix Forms (Speicher, Spam-Prüfung, Kontakt)
                                    │  (1) Wix-Automatisierung/Webhook «Einsendung erstellt»  oder  (2) ReadyOS fragt ab
                                    ▼
                         readyos-adapter.fromWixSubmission() ─▶ validate() ─▶ deliver() ─▶ ReadyOS  POST /events
                                                                                       (201 neu · 409 Duplikat · sonst Warteschlange)
Wix Bookings ─▶ fromWixBooking() ─▶ (gleich)
```

Zwei Anbindungswege, beide kostenlos möglich, Wahl beim Aufbau von ReadyOS:

- **Abfrage (empfohlen für den Start):** ReadyOS fragt periodisch `POST /form-submission-service/v4/submissions/namespace/query`
  (Filter `namespace`, `formId`, `createdDate > letzter Stand`) und Wix Bookings ab, übersetzt mit dem Adapter. Einfach, robust,
  braucht nur einen Wix-API-Schlüssel mit Leserechten (im Wix-Konto erzeugen, nicht im Repository speichern).
- **Webhook:** Wix-App oder Wix-Automatisierung ruft bei neuer Einsendung ReadyOS auf. Schneller, aber mehr Einrichtung.

## Ereignisformat

JSON-Schema: `integrations/readyos/event.schema.json`. Typen: `offertanfrage.eingegangen`, `buchung.<status>`.
Inhalt: `kunde` (Name, E-Mail, Telefon, Wix-Kontakt), `anfrage` (Leistung, Auftragsart, Ort, Beschreibung) bzw. `buchung`,
`vorschlag.status` (neu → in_pruefung → offerte_entwurf → freigegeben/abgelehnt → erledigt).

## ReadyOS-Seite (zu bauen)

| Funktion | Erwartung |
|---|---|
| `POST /events` | Bearer-Schlüssel, `Idempotency-Key`-Kopfzeile, Antwort 201/409/400/401 |
| Zuordnung | Kunde über E-Mail bzw. Wix-Kontakt-ID; Leistung → Zuständigkeit |
| Entwürfe | Offertentwurf, Aufgaben, Termine – Status «Entwurf», bis zur Freigabe |
| Freigabe | Sammelansicht für den Inhaber; erst danach Versand/Buchung |
| Datenschutz | nur die Felder aus dem Ereignis; Löschung analog Wix (Anfrage ohne Auftrag löschen, sobald nicht mehr benötigt) |
