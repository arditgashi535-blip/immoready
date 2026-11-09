'use strict';
// Datenbank (node:sqlite, eingebaut in Node ≥ 22.5). Jede fachliche Tabelle trägt tenant_id;
// der Zugriff läuft ausschliesslich über repo.js, das den Mandanten bei jeder Abfrage erzwingt.
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const TENANTS = [
  { id: 'immoready', name: 'ImmoReady', notify_email: 'info.immoready@gmail.com', sender_email: 'info.immoready@gmail.com', website: 'https://www.immoready.ch' },
  { id: 'readystudio', name: 'Ready Studio', notify_email: 'info.readystudio@gmail.com', sender_email: 'info.readystudio@gmail.com', website: 'https://readystudio.ch' }
];
const ESCALATION_EMAIL = 'arditgashi535@gmail.com';

const SCHEMA = `
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS schema_version (v INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, notify_email TEXT NOT NULL, sender_email TEXT NOT NULL, website TEXT
);
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, pw_hash TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL
);
-- Rollen je Mandant: owner (freigeben), editor (bearbeiten), viewer (lesen)
CREATE TABLE IF NOT EXISTS memberships (
  user_id INTEGER NOT NULL REFERENCES users(id), tenant_id TEXT NOT NULL REFERENCES tenants(id),
  role TEXT NOT NULL CHECK (role IN ('owner','editor','viewer')), PRIMARY KEY (user_id, tenant_id)
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), csrf TEXT NOT NULL,
  created_at TEXT NOT NULL, expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id), name TEXT NOT NULL, name_key TEXT NOT NULL,
  website TEXT, domain TEXT, phone TEXT, phone_key TEXT, email TEXT, address TEXT, locality TEXT, canton TEXT,
  industry TEXT, segment TEXT, opt_out INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_comp_t_domain ON companies(tenant_id, domain);
CREATE INDEX IF NOT EXISTS ix_comp_t_name ON companies(tenant_id, name_key);
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id), company_id INTEGER REFERENCES companies(id),
  name TEXT NOT NULL, role TEXT, email TEXT, phone TEXT, source_url TEXT, is_public_business INTEGER NOT NULL DEFAULT 0,
  opt_out INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS properties (
  id INTEGER PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id), company_id INTEGER REFERENCES companies(id),
  label TEXT NOT NULL, address TEXT, units INTEGER, notes TEXT, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id), company_id INTEGER NOT NULL REFERENCES companies(id),
  stage TEXT NOT NULL, score INTEGER, score_detail TEXT, need TEXT, fit_reason TEXT, channel TEXT, channel_reason TEXT,
  verification TEXT NOT NULL DEFAULT 'unverifiziert', est_value_chf INTEGER, researched_at TEXT, follow_up_at TEXT,
  lost_reason TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_leads_t_stage ON leads(tenant_id, stage);
CREATE TABLE IF NOT EXISTS lead_sources (
  id INTEGER PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id), lead_id INTEGER NOT NULL REFERENCES leads(id),
  url TEXT NOT NULL, note TEXT, retrieved_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS findings (
  id INTEGER PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id), lead_id INTEGER NOT NULL REFERENCES leads(id),
  code TEXT NOT NULL, severity TEXT NOT NULL, text TEXT NOT NULL, evidence TEXT, measured_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id), company_id INTEGER REFERENCES companies(id),
  lead_id INTEGER REFERENCES leads(id), channel TEXT NOT NULL, payload TEXT NOT NULL, classification TEXT,
  qualified INTEGER NOT NULL DEFAULT 0, injection_flags TEXT, received_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id), lead_id INTEGER REFERENCES leads(id),
  company_id INTEGER REFERENCES companies(id), author_id INTEGER, kind TEXT NOT NULL DEFAULT 'notiz', body TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id), lead_id INTEGER REFERENCES leads(id),
  title TEXT NOT NULL, due_at TEXT, done INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id), lead_id INTEGER REFERENCES leads(id),
  draft_id INTEGER, filename TEXT NOT NULL, mime TEXT NOT NULL, content TEXT NOT NULL, sha256 TEXT NOT NULL, created_at TEXT NOT NULL
);
-- Entwürfe für externe Aktionen (E-Mail, Brief, Offerte, Rechnung, Mahnung). Inhalt lebt in draft_versions.
CREATE TABLE IF NOT EXISTS drafts (
  id INTEGER PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id), lead_id INTEGER REFERENCES leads(id),
  kind TEXT NOT NULL CHECK (kind IN ('email','brief','offerte','rechnung','mahnung','kontaktformular')),
  status TEXT NOT NULL CHECK (status IN ('entwurf','freigabe_ausstehend','freigegeben','abgelehnt','zurueckgestellt','ausgefuehrt','fehler')),
  current_version INTEGER NOT NULL DEFAULT 1, last_error TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_drafts_t_status ON drafts(tenant_id, status);
CREATE TABLE IF NOT EXISTS draft_versions (
  draft_id INTEGER NOT NULL REFERENCES drafts(id), version INTEGER NOT NULL, tenant_id TEXT NOT NULL,
  recipient TEXT NOT NULL, subject TEXT NOT NULL, body TEXT NOT NULL, attachments TEXT NOT NULL DEFAULT '[]',
  price_chf TEXT, content_hash TEXT NOT NULL, author_id INTEGER, created_at TEXT NOT NULL,
  PRIMARY KEY (draft_id, version)
);
-- Freigabe gilt genau für (Entwurf, Version, Inhalts-Hash, Empfänger, Aktion)
CREATE TABLE IF NOT EXISTS approvals (
  id INTEGER PRIMARY KEY, tenant_id TEXT NOT NULL, draft_id INTEGER NOT NULL REFERENCES drafts(id), version INTEGER NOT NULL,
  content_hash TEXT NOT NULL, recipient TEXT NOT NULL, action TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('freigegeben','abgelehnt','zurueckgestellt')),
  decided_by INTEGER NOT NULL, comment TEXT, valid INTEGER NOT NULL DEFAULT 1, decided_at TEXT NOT NULL, invalidated_at TEXT
);
-- Ausführungsprotokoll: idem_key UNIQUE verhindert doppelte Ausführung derselben freigegebenen Version
CREATE TABLE IF NOT EXISTS actions_outbox (
  id INTEGER PRIMARY KEY, tenant_id TEXT NOT NULL, draft_id INTEGER NOT NULL, approval_id INTEGER NOT NULL,
  idem_key TEXT NOT NULL UNIQUE, adapter TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('in_arbeit','erledigt','fehler')), attempts INTEGER NOT NULL DEFAULT 0,
  result TEXT, error TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id), lead_id INTEGER REFERENCES leads(id),
  kind TEXT NOT NULL CHECK (kind IN ('offerte','rechnung')), number TEXT NOT NULL,
  status TEXT NOT NULL, currency TEXT NOT NULL DEFAULT 'CHF', vat_rate REAL, total_rappen INTEGER NOT NULL DEFAULT 0,
  valid_until TEXT, draft_id INTEGER, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE (tenant_id, number)
);
CREATE TABLE IF NOT EXISTS quote_items (
  id INTEGER PRIMARY KEY, tenant_id TEXT NOT NULL, quote_id INTEGER NOT NULL REFERENCES quotes(id),
  label TEXT NOT NULL, qty REAL NOT NULL, unit TEXT NOT NULL, unit_rappen INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id), lead_id INTEGER REFERENCES leads(id),
  quote_id INTEGER REFERENCES quotes(id), status TEXT NOT NULL, value_rappen INTEGER, confirmed_at TEXT, created_at TEXT NOT NULL
);
-- Änderungsprotokoll, nur anhängend (Trigger verhindern Änderung/Löschung)
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY, tenant_id TEXT NOT NULL, actor TEXT NOT NULL, entity TEXT NOT NULL, entity_id INTEGER,
  type TEXT NOT NULL, data TEXT, at TEXT NOT NULL
);
CREATE TRIGGER IF NOT EXISTS events_no_update BEFORE UPDATE ON events BEGIN SELECT RAISE(ABORT, 'events sind unveränderlich'); END;
CREATE TRIGGER IF NOT EXISTS events_no_delete BEFORE DELETE ON events BEGIN SELECT RAISE(ABORT, 'events sind unveränderlich'); END;
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY, tenant_id TEXT NOT NULL, dedupe_key TEXT NOT NULL UNIQUE, kind TEXT NOT NULL,
  priority TEXT NOT NULL, recipient TEXT NOT NULL, subject TEXT NOT NULL, body TEXT NOT NULL,
  status TEXT NOT NULL, error TEXT, created_at TEXT NOT NULL, delivered_at TEXT
);
CREATE TABLE IF NOT EXISTS suppression (
  tenant_id TEXT NOT NULL, kind TEXT NOT NULL CHECK (kind IN ('email','domain')), value TEXT NOT NULL,
  reason TEXT, created_at TEXT NOT NULL, PRIMARY KEY (tenant_id, kind, value)
);
`;

function now() { return new Date().toISOString(); }

function open(file) {
  const f = file || process.env.READYOPS_DB || path.join(__dirname, '..', 'data', 'readyops.sqlite');
  if (f !== ':memory:') fs.mkdirSync(path.dirname(f), { recursive: true });
  const db = new DatabaseSync(f);
  db.exec(SCHEMA);
  const ins = db.prepare('INSERT OR IGNORE INTO tenants (id,name,notify_email,sender_email,website) VALUES (?,?,?,?,?)');
  for (const t of TENANTS) ins.run(t.id, t.name, t.notify_email, t.sender_email, t.website);
  if (!db.prepare('SELECT v FROM schema_version').get()) db.prepare('INSERT INTO schema_version (v) VALUES (1)').run();
  return db;
}

function tx(db, fn) {
  db.exec('BEGIN IMMEDIATE');
  try { const r = fn(); db.exec('COMMIT'); return r; } catch (e) { db.exec('ROLLBACK'); throw e; }
}

module.exports = { open, tx, now, TENANTS, ESCALATION_EMAIL };
