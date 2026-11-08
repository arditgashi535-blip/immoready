'use strict';
// Erzeugt je Mandant eine Zusammenfassung als interne Meldung (dedupliziert je Tag).
// Aufruf: node scripts/digest.js [tage=1]
const { open } = require('../src/db');
const notify = require('../src/notify');
const days = Number(process.argv[2] || 1);
const db = open();
const since = new Date(Date.now() - days * 864e5).toISOString();
for (const t of ['immoready', 'readystudio']) {
  const d = notify.digest(db, t, since);
  const r = notify.notify(db, t, 'digest', { key: 'digest-' + new Date().toISOString().slice(0, 10) + '-' + days, subject: `Zusammenfassung (${days} Tag${days > 1 ? 'e' : ''})`, body: d.text });
  console.log(t, JSON.stringify(d.data), r.some(x => x.created) ? 'neu' : 'bereits vorhanden');
}
