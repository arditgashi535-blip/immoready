'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { open } = require('../src/db');
const auth = require('../src/auth');

test('Import: Leads → CRM, Brief-/Formular-Entwurf je Kanal, Telefon → Aufgabe, Dubletten, Audit-Anhang', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ro-'));
  const dbf = path.join(dir, 't.sqlite');
  const db = open(dbf);
  auth.createUser(db, { email: 'o@test.invalid', name: 'O', password: 'Test-Passwort-123!', memberships: { immoready: 'owner', readystudio: 'owner' } });
  db.close();
  const irFile = path.join(dir, 'ir.json');
  const base = { score: 70, verification: 'verzeichnis', need: 'Hauswartung', fit_reason: 'Test', sources: [{ url: 'https://search.ch/tel/x' }] };
  fs.writeFileSync(irFile, JSON.stringify({ leads: [
    { ...base, company: { name: 'Alpha Verwaltung AG', address: 'Weg 1, 5400 Baden', locality: 'Baden', canton: 'AG' }, channel: 'brief' },
    { ...base, company: { name: 'Beta Immobilien AG', website: 'https://beta.example', locality: 'Uster', canton: 'ZH' }, channel: 'kontaktformular' },
    { ...base, company: { name: 'Gamma AG', phone: '044 111 22 33', canton: 'ZH' }, channel: 'telefon' },
    { ...base, company: { name: 'Alpha Verwaltung', address: 'Weg 1, 5400 Baden', canton: 'AG' }, channel: 'brief' }
  ] }));
  const env = { ...process.env, READYOPS_DB: dbf };
  const out = JSON.parse(execFileSync(process.execPath, ['--no-warnings', path.join(__dirname, '..', 'scripts', 'import-leads.js'), 'immoready', irFile], { env }).toString());
  assert.deepEqual({ c: out.created, d: out.duplicates, dr: out.drafts, t: out.phone_tasks }, { c: 3, d: 1, dr: 2, t: 1 });
  const rsFile = path.join(dir, 'rs.json');
  fs.writeFileSync(rsFile, JSON.stringify({ leads: [{ ...base, company: { name: 'Coiffeur Test', website: 'https://coiffeur.example', address: 'Weg 2, 5400 Baden', canton: 'AG' }, channel: 'brief',
    findings: [{ code: 'no_form', severity: 'mittel', text: 'Auf der Startseite ist kein Kontakt- oder Anfrageformular vorhanden.', evidence: 'kein <form>', measured_at: '2026-11-08T10:00:00Z' }], improvements: ['Formular ergänzen'], services: ['Anfrageformular'], researched_at: '2026-11-08T10:00:00Z' }] }));
  execFileSync(process.execPath, ['--no-warnings', path.join(__dirname, '..', 'scripts', 'import-leads.js'), 'readystudio', rsFile], { env });
  const db2 = open(dbf);
  const d = db2.prepare("SELECT d.kind, d.status, v.recipient, v.body, v.attachments FROM drafts d JOIN draft_versions v ON v.draft_id=d.id WHERE d.tenant_id='immoready' ORDER BY d.id").all();
  assert.equal(d[0].kind, 'brief'); assert.equal(d[0].status, 'freigabe_ausstehend'); assert.match(d[0].recipient, /Alpha Verwaltung AG, Weg 1, 5400 Baden/);
  assert.equal(d[1].kind, 'kontaktformular'); assert.equal(d[1].recipient, 'https://beta.example');
  assert.equal(db2.prepare("SELECT COUNT(*) n FROM approvals").get().n, 0, 'Import erteilt nie Freigaben');
  const rs = db2.prepare("SELECT v.body, v.attachments FROM drafts d JOIN draft_versions v ON v.draft_id=d.id WHERE d.tenant_id='readystudio'").get();
  assert.match(rs.body, /kein Kontakt- oder Anfrageformular/); assert.equal(JSON.parse(rs.attachments).length, 1);
  assert.equal(db2.prepare("SELECT COUNT(*) n FROM drafts WHERE tenant_id='immoready'").get().n, 2);
  db2.close();
});
