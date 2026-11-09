'use strict';
// Ausführungsadapter für freigegebene Aktionen.
//  - mock:    für Tests; zeichnet auf, kann Fehler simulieren.
//  - handoff: schreibt die freigegebene, versionsgebundene Nachricht in eine Übergabewarteschlange
//             (data/handoff.jsonl). Daraus wird im passenden Gmail-Konto ein ENTWURF angelegt
//             (scripts/handoff.js + Gmail-Konnektor). Gesendet wird nur manuell durch den Inhaber in Gmail.
//             delivered = false → Lead bleibt «freigegeben», bis «manuell versendet» bestätigt wird.
// Ein selbst sendender Adapter (SMTP) ist absichtlich NICHT eingebaut (siehe docs/BLOCKERS.md).
const fs = require('node:fs');
const path = require('node:path');

function mockAdapter({ fail = 0, delivered = true } = {}) {
  const sent = [];
  let failures = fail;
  return {
    name: 'mock', sent,
    async execute(p) {
      if (failures > 0) { failures--; throw new Error('Simulierter Zustellfehler'); }
      if (sent.some(s => s.idempotency_key === p.idempotency_key)) throw new Error('Doppelte Zustellung im Mock erkannt');
      sent.push(p);
      return { mode: 'mock', delivered, id: 'mock-' + sent.length };
    }
  };
}

function handoffAdapter(file) {
  const f = file || process.env.READYOPS_HANDOFF || path.join(__dirname, '..', '..', 'data', 'handoff.jsonl');
  return {
    name: 'handoff', file: f,
    async execute(p) {
      fs.mkdirSync(path.dirname(f), { recursive: true });
      const existing = fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)) : [];
      if (existing.some(e => e.idempotency_key === p.idempotency_key)) return { mode: 'gmail_entwurf_wartet', delivered: false, duplicate_suppressed: true };
      fs.appendFileSync(f, JSON.stringify({ ...p, status: 'wartet_auf_gmail_entwurf', queued_at: new Date().toISOString() }) + '\n', { mode: 0o600 });
      return { mode: 'gmail_entwurf_wartet', delivered: false };
    }
  };
}
module.exports = { mockAdapter, handoffAdapter };
