# Freigabe-Richtlinie (verbindlich, technisch durchgesetzt)

Modus: **KONTROLLIERT – automatische Vorbereitung, manuelle Freigabe.**

## Automatisch erlaubt (ohne Einzelfreigabe)
- Unternehmen recherchieren (öffentliche Quellen, robots.txt wird beachtet, gedrosselt), Leads bewerten
- CRM-Datensätze, Aufgaben und Notizen anlegen
- Entwürfe für E-Mails, Briefe, Offerten und Rechnungen erstellen
- Interne Meldungen an die eigenen Adressen vorbereiten
- Anfragen klassifizieren, Fehler protokollieren

## Nur nach Einzelfreigabe (Rolle `owner` des Mandanten)
Externe E-Mails und jeder Kundenkontakt, Offerten, Rechnungen, Mahnungen, Verträge, verbindliche Termine, Zahlungen, Produktionsdeployments sowie DNS- und Mailkonfiguration.
Für Verträge, Termine, Zahlungen, Deployments und DNS gibt es **keinen** Ausführungsweg im System. Diese Schritte bleiben manuell.

## Technische Regeln (`src/approvals.js`)
1. Eine Freigabe speichert **Aktion, Empfänger, Inhalts-Hash (SHA-256 über Empfänger, Betreff, Text, Anhänge, Preis) und Version**.
2. Wer entscheidet, schickt die gesehene `version` und den `content_hash` mit. Weicht eines davon ab, wird die Entscheidung abgewiesen (HTTP 409, «nicht die aktuelle Version»).
3. **Jede Änderung** erzeugt eine neue Version und setzt alle bisherigen Freigaben auf ungültig. Der Status springt zurück auf «Freigabe ausstehend».
4. Die Ausführung prüft **unmittelbar davor** erneut: gültige Freigabe für die aktuelle Version und Hash, Empfänger nicht auf der Sperrliste.
5. **Doppelversand-Schutz:** Der Idempotenz-Schlüssel ist SHA-256 aus Mandant, Entwurf, Version, Hash, Aktion und Empfänger und in `actions_outbox` UNIQUE. Ist er erledigt → 409, läuft er → 409.
6. **Fehler:** Status «fehler» mit Fehlermeldung. Es gibt keine automatische Wiederholung; ein neuer Versuch ist nur mit `retry: true` durch einen owner möglich.
7. Abgelehnte oder zurückgestellte Entwürfe lassen sich nicht ausführen. Erneutes Einreichen ist möglich.
8. Ausgeführte Entwürfe sind gesperrt; für Änderungen braucht es einen neuen Entwurf.
9. «Kontaktiert» setzt das System erst, wenn der Adapter die Zustellung bestätigt oder der Inhaber «Ich habe es selbst versendet» klickt.
10. Alle Schritte landen in `events`. Diese Tabelle ist nur anhängend, Trigger blockieren UPDATE und DELETE.

## Rollen
| Rolle | Lesen | Bearbeiten/Notizen | Freigeben/Ablehnen/Zurückstellen | Ausführen |
|---|---|---|---|---|
| viewer | ✓ | – | – | – |
| editor | ✓ | ✓ | – | – |
| owner | ✓ | ✓ | ✓ | ✓ |

Rollen gelten pro Mandant. Ein owner von Ready Studio hat ohne eigene Mitgliedschaft keinen Zugriff auf ImmoReady.
