# ReadyOps

Internes CRM mit Freigabe-Warteschlange und Lead-Piloten für **ImmoReady** und **Ready Studio**. Es ist vom Website-Build in diesem Repository getrennt.

**Grundsatz:** Vorbereitung läuft automatisch, jede Aussenwirkung braucht eine Einzelfreigabe. Das System versendet selbst nichts.

```bash
cd ops
node scripts/create-user.js <email> "<Name>" immoready:owner,readystudio:owner   # Passwort → data/zugang-*.txt
npm start                    # http://127.0.0.1:8790
npm run test:all             # 31 Tests + 11 Browser-Prüfungen
npm run research:immo        # Pilot ImmoReady (öffentliche Quellen, robots.txt-konform)
npm run research:studio      # Pilot Ready Studio (Website-Audits, 390 px)
node scripts/import-leads.js <tenant> data/leads/<datei>.json
npm run digest               # Zusammenfassung als interne Meldung
npm run export               # CSV-Export nach data/export/
```

Daten (`data/`) werden **nie** committet; das Repository ist öffentlich.

Dokumentation in `docs/`:
- [Umsetzungsstand](docs/IMPLEMENTATION-STATUS.md)
- [Architektur](docs/ARCHITECTURE.md)
- [Freigabe-Richtlinie](docs/APPROVAL-POLICY.md)
- [CRM-Schema](docs/CRM-SCHEMA.md)
- [Leadgenerierung](docs/LEAD-GENERATION.md)
- [E-Mail-Routing](docs/EMAIL-ROUTING.md)
- [Sicherheit](docs/SECURITY.md)
- [Tests](docs/TESTREPORT.md)
- [Blocker](docs/BLOCKERS.md)
- [Release-Checkliste](docs/RELEASE-CHECKLIST.md)
