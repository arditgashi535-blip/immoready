'use strict';
// Exportiert Leads und Entwürfe je Mandant als CSV (UTF-8 mit BOM, Semikolon – öffnet direkt in Excel CH) nach data/export/.
const fs = require('node:fs');
const path = require('node:path');
const { open } = require('../src/db');

const db = open();
const out = path.join(__dirname, '..', 'data', 'export');
fs.mkdirSync(out, { recursive: true });
const csv = rows => {
  if (!rows.length) return '﻿';
  const cols = Object.keys(rows[0]);
  const esc = v => { const s = v == null ? '' : String(v); return /[;"\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return '﻿' + [cols.join(';'), ...rows.map(r => cols.map(c => esc(r[c])).join(';'))].join('\r\n');
};
for (const t of ['immoready', 'readystudio']) {
  const leads = db.prepare(`SELECT l.id, c.name firma, c.address adresse, c.locality ort, c.canton kanton, c.website, c.phone telefon, l.score, l.verification pruefstand,
    l.stage stufe, l.channel kanal, l.channel_reason kanal_begruendung, l.need bedarf, l.fit_reason eignung,
    (SELECT group_concat(url, ' | ') FROM lead_sources s WHERE s.lead_id=l.id) quellen, l.researched_at recherchiert
    FROM leads l JOIN companies c ON c.id=l.company_id WHERE l.tenant_id=? ORDER BY l.score DESC`).all(t);
  const drafts = db.prepare(`SELECT d.id entwurf, d.lead_id, d.kind art, d.status, d.current_version version, v.recipient empfaenger, v.subject betreff, v.body text, v.content_hash hash
    FROM drafts d JOIN draft_versions v ON v.draft_id=d.id AND v.version=d.current_version WHERE d.tenant_id=? ORDER BY d.id`).all(t);
  fs.writeFileSync(path.join(out, `${t}-leads.csv`), csv(leads), { mode: 0o600 });
  fs.writeFileSync(path.join(out, `${t}-entwuerfe.csv`), csv(drafts), { mode: 0o600 });
  console.log(t, leads.length, 'Leads,', drafts.length, 'Entwürfe');
}
