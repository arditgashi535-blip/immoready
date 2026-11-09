'use strict';
// Übergabe an Gmail (nur ENTWÜRFE, niemals Senden):
//   node scripts/handoff.js list            → freigegebene externe Nachrichten, die als Gmail-Entwurf anzulegen sind
//   node scripts/handoff.js done <key> <id> → Eintrag als «Gmail-Entwurf angelegt» markieren
//   node scripts/handoff.js notif           → offene interne Meldungen (an eigene Adressen)
//   node scripts/handoff.js notif-done <id> [fehler-text]
// Die Anlage der Gmail-Entwürfe erfolgt über den Gmail-Konnektor der Claude-Sitzung (siehe docs/EMAIL-ROUTING.md).
const fs = require('node:fs');
const path = require('node:path');
const { open } = require('../src/db');
const notify = require('../src/notify');

const F = process.env.READYOPS_HANDOFF || path.join(__dirname, '..', 'data', 'handoff.jsonl');
const read = () => fs.existsSync(F) ? fs.readFileSync(F, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)) : [];
const [cmd, a, b] = process.argv.slice(2);
if (cmd === 'list') console.log(JSON.stringify(read().filter(x => x.status === 'wartet_auf_gmail_entwurf' && x.kind !== 'brief' && x.kind !== 'kontaktformular'), null, 1));
else if (cmd === 'done') {
  const all = read(); const e = all.find(x => x.idempotency_key === a);
  if (!e) { console.error('unbekannt'); process.exit(1); }
  e.status = 'gmail_entwurf_angelegt'; e.gmail_draft_id = b || null; e.done_at = new Date().toISOString();
  fs.writeFileSync(F, all.map(x => JSON.stringify(x)).join('\n') + '\n', { mode: 0o600 });
  console.log('ok');
} else if (cmd === 'notif') console.log(JSON.stringify(notify.pending(open()).map(n => ({ id: n.id, to: n.recipient, subject: n.subject, body: n.body, priority: n.priority })), null, 1));
else if (cmd === 'notif-done') { const db = open(); if (b) notify.markFailed(db, a, b); else notify.markDelivered(db, a, 'gmail_entwurf'); console.log('ok'); }
else { console.error('Befehle: list | done <key> <gmail-id> | notif | notif-done <id> [fehler]'); process.exit(1); }
