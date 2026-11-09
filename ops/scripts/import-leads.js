'use strict';
// Importiert Pilot-Leads (data/leads/*.json) ins CRM und legt je Lead einen freigabepflichtigen Kontaktentwurf an.
// Aufruf: node scripts/import-leads.js <tenant> <datei.json>
// Kanal folgt compliance.recommendChannel: Brief/Kontaktformular statt Werbe-E-Mail ohne Einwilligung; Telefon → Aufgabe.
const fs = require('node:fs');
const crypto = require('node:crypto');
const { open, now } = require('../src/db');
const { scope } = require('../src/repo');
const approvals = require('../src/approvals');
const drafts = require('../src/drafts');
const { domainOf } = require('../src/dedupe');

const [tenant, file] = process.argv.slice(2);
if (!tenant || !file) { console.error('Aufruf: import-leads.js <immoready|readystudio> <datei.json>'); process.exit(1); }
const db = open();
const R = scope(db, tenant, 'import');
const system = db.prepare("SELECT u.id FROM users u JOIN memberships m ON m.user_id=u.id WHERE m.tenant_id=? AND m.role='owner' ORDER BY u.id LIMIT 1").get(tenant);
if (!system) { console.error('Zuerst einen owner anlegen: npm run seed:users'); process.exit(1); }
const A = approvals.api(db, tenant, { id: system.id });
const pricing = JSON.parse(fs.readFileSync(require('node:path').join(__dirname, '..', 'config', 'pricing.readystudio.json'), 'utf8'));

const data = JSON.parse(fs.readFileSync(file, 'utf8'));
let created = 0, dup = 0, draftsN = 0, tasks = 0, skipped = 0;
for (const l of data.leads) {
  const r = R.createLead({ ...l, est_value_chf: l.est_value_chf ?? null });
  if (r.duplicate) { dup++; continue; }
  created++;
  const lead = R.getLead(r.id);
  lead.company.domain = domainOf(lead.company.website);
  const content = drafts.compose(tenant, { ...lead, personal_line: l.personal_line, improvements: l.improvements, findings: l.findings || [] });
  if (content.claim_violations.length) { R.addNote(r.id, 'Entwurf nicht erzeugt – unzulässige Formulierung erkannt: ' + content.claim_violations.join(', '), null, 'system'); skipped++; continue; }
  if (tenant === 'readystudio' && !(l.findings || []).some(f => ['hoch', 'mittel'].includes(f.severity))) { skipped++; continue; }
  let att = [];
  if (tenant === 'readystudio') {
    const rep = [`Website-Beobachtungen ${lead.company.name} (${l.company.website})`, `Geprüft: ${l.researched_at} · Handy-Ansicht 390 px, Startseite, einmalige Messung`, '',
      ...(l.findings || []).map(f => `[${f.severity}] ${f.text}\n   Beleg: ${f.evidence}`), '', 'Verbesserungen:', ...(l.improvements || []).map(x => '- ' + x), '', 'Passende Leistungen:', ...(l.services || []).map(x => '- ' + x),
      '', pricing.confirmed ? 'Preisindikation gemäss bestätigter Preisliste.' : 'Preisindikation: Preisliste noch nicht bestätigt (config/pricing.readystudio.json) – keine Zahl genannt.'].join('\n');
    const sha = crypto.createHash('sha256').update(rep).digest('hex');
    const d = db.prepare('INSERT INTO documents (tenant_id,lead_id,filename,mime,content,sha256,created_at) VALUES (?,?,?,?,?,?,?)').run(tenant, r.id, `website-beobachtungen-${lead.company.domain || r.id}.txt`, 'text/plain', rep, sha, now());
    att = [{ id: Number(d.lastInsertRowid), filename: `website-beobachtungen-${lead.company.domain || r.id}.txt`, sha256: sha }];
  }
  const ch = l.channel;
  if (ch === 'brief' && lead.company.address) {
    A.createDraft({ lead_id: r.id, kind: 'brief', recipient: `${lead.company.name}, ${lead.company.address}`, subject: content.subject, body: content.body, attachments: att }); draftsN++;
  } else if (ch === 'kontaktformular' && lead.company.website) {
    A.createDraft({ lead_id: r.id, kind: 'kontaktformular', recipient: lead.company.website, subject: content.subject, body: content.body, attachments: att }); draftsN++;
  } else if (ch === 'telefon') {
    R.addTask(r.id, 'Telefonischer Erstkontakt vorbereiten (vorher Sterneintrag prüfen)', null); tasks++;
  } else skipped++;
}
console.log(JSON.stringify({ tenant, file, leads_in_file: data.leads.length, created, duplicates: dup, drafts: draftsN, phone_tasks: tasks, skipped }));
