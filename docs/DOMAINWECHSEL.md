# Domainwechsel www.immoready.ch → neue Website (vorbereitet, NICHT ausgeführt)

Stand 09.11.2026. **Die Umstellung braucht die ausdrückliche Freigabe des Inhabers.**

| | Bisher | Neu |
|---|---|---|
| Wix-Seite | «Immoready», Classic Editor, ID `bf50a109-2216-43c2-8ea7-87d100888a99` | Wix Headless, ID `f486f5d5-a0d6-45e5-80a7-44befc45746e` |
| Adresse | https://www.immoready.ch (Premium-Plan, Domain verbunden) | https://headless-nvjfhfnkngv-infoimmoready-140d.wix-site-host.com |
| Funktionen | Wix Bookings (8 sichtbare Gratis-Termine, 3 verborgene Dienste), Members, Portfolio, Forms, Invoices | statische Seite, Wix Forms «Offertanfragen» |

## Wichtigster Punkt: Plan und Kosten

Wix verbindet eine eigene Domain nur mit einer Seite, die einen **Premium-Plan** hat (Wix-API-Dokumentation «Upsert Domain
Assignment»: «The site must have a Premium plan»). Die neue Seite hat keinen Plan.

**Kostenfreier Weg:** den bestehenden Plan der alten Seite der neuen Seite zuweisen
(Wix-Konto → Premium-Abos → ⋯ beim Plan → «Assign to a Different Site / Anderer Website zuweisen»; Wix-Hilfe «Assigning a Premium Plan
to a Different Site»). Folgen für die alte Seite: Premium-Funktionen entfallen – keine eigene Domain mehr, Wix-Werbung erscheint, Adresse
wird `<präfix>.wixsite.com/<name>`. Wix Bookings (nur Gratis-Termine, keine Online-Zahlung), Members und Forms funktionieren auf
kostenlosen Seiten weiter.

**Abbruchkriterien – dann nicht umstellen, sondern melden:**
- die neue Seite erscheint bei «Anderer Website zuweisen» nicht in der Auswahl, oder Wix verlangt einen anderen/teureren Plan;
- Wix zeigt beim Zuweisen eine Zahlung oder Preisdifferenz an.

Nach der Zuweisung sollte auch der Hinweis «Built on Wix Headless» verschwinden (Wix entfernt Werbehinweise auf Premium-Seiten) – nach dem
Wechsel prüfen.

## Buchungen

Stand 09.11.2026 (nur gelesen): **0 künftige Buchungen**, 23 Buchungen insgesamt (Vergangenheit). Bestehende Buchungen werden durch den
Domainwechsel nicht gelöscht; sie bleiben in der alten Seite.

Alle Terminlinks der neuen Website («Termin buchen», Beratungsgespräch, Offert-Termine) zeigen auf die alte Seite. Ihre Basisadresse steht
in `rise.json → contact.bookingSite` (heute `https://www.immoready.ch`). **Nach dem Wechsel** auf die freie Adresse der alten Seite setzen
(steht danach im Dashboard der alten Seite unter «Domains»), dann `python3 build.py --release`, CDN-Kette und Upload (docs/VEROEFFENTLICHUNG.md).
Alternative, langfristig: Buchung als Formular/ReadyOS-Funktion in der neuen Seite (docs/READYOS-SCHNITTSTELLE.md).

## Alte Adressen (aus der Sitemap der alten Seite, 09.11.2026)

Nach dem Wechsel liefert die neue (statische) Seite diese Pfade nicht mehr (404). Weiterleitungen im Wix-Dashboard der **neuen** Seite
einrichten (Marketing & SEO → SEO → URL-Weiterleitungen, 301), sofern Wix das für Headless-Seiten anbietet – sonst als offenen Punkt melden:

| Alter Pfad | Ziel |
|---|---|
| `/book-online`, `/service-page/*` | gleicher Pfad auf der freien Adresse der alten Seite (Buchung) |
| `/portfolio`, `/portfolio-collections/*` | `/#fotografie` |
| `/blank`, `/blank-1`, `/blank-2`, `/blank-3` | `/` |

## Ablauf

**A. Vorher prüfen (Inhaber, ca. 15 Min.)**
1. Formular-Test nach `docs/FORMULAR-TEST.md` bestanden (Anfrage gespeichert, Benachrichtigung angekommen).
2. Neue Seite auf dem eigenen Handy und Computer angesehen (Start, Leistungen, Offerte, Impressum, Datenschutz).
3. Keine künftigen Buchungen offen (Dashboard alte Seite → Buchungskalender) – sonst Kunden vorher nicht verlieren: Termine notieren.
4. Zeitpunkt mit wenig Verkehr wählen (abends/Wochenende).

**B. Umstellen (Inhaber im Wix-Dashboard; ich führe es nicht aus)**
1. Premium-Plan der alten Seite der neuen Seite zuweisen (siehe oben, Abbruchkriterien beachten).
2. Wix-Konto → Domains → `immoready.ch` → «Zuweisen/Assign» an die neue Seite `ImmoReady` (Headless) als **Hauptdomain**.
3. Warten, bis Wix die Verbindung und das SSL-Zertifikat anzeigt (meist Minuten, bei Wix-verwalteter Domain ohne DNS-Änderung).

**C. Unmittelbar danach (ich, nach Freigabe)**
1. `rise.json`: `seo.canonical` = `https://www.immoready.ch/`, `contact.bookingSite` = freie Adresse der alten Seite,
   `wix.allowedOrigins` prüfen; Build, CDN-Kette, Upload der Startdatei.
2. `IR_LIVE_URL=https://www.immoready.ch/ node tests/t30-live.js` (Seiten, Links, Konsole, axe) – alle grün.
3. `https://www.immoready.ch/sitemap.xml` und `robots.txt` erreichbar; Google Search Console: Eigentum bestätigen, Sitemap einreichen
   (kostenlos).
4. Weiterleitungen der alten Pfade testen (Tabelle oben).
5. Terminbuchung über einen Link auf der neuen Seite bis zur Terminauswahl durchklicken (ohne zu buchen).

**Ausfallzeit:** erwartet wenige Minuten bis zur SSL-Ausstellung; die alte Seite bleibt die ganze Zeit unter ihrer freien Adresse erreichbar.

## Rückweg (Rollback)

1. Domain `immoready.ch` im Wix-Konto wieder der alten Seite zuweisen (Hauptdomain).
2. Premium-Plan zurück der alten Seite zuweisen (gleicher Menüpunkt).
3. `rise.json → contact.bookingSite` zurück auf `https://www.immoready.ch`, neu bauen und hochladen.
Die alte Seite wird dabei nicht verändert; ihre Inhalte, Buchungen und Mitglieder bleiben erhalten.

Die vorherige Startdatei der neuen Seite liegt in `docs/rollback/wix-index-2026-11-09.html`.
