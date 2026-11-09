'use strict';
// Mandantengebundener Datenzugriff. Jede Funktion arbeitet nur innerhalb von `tenant`; IDs aus einem
// anderen Mandanten werden wie nicht vorhandene Datensätze behandelt (NotFound), nie ausgeliefert.
const { now, tx, TENANTS } = require('./db');
const { domainOf, nameKey, phoneKey } = require('./dedupe');
const pipeline = require('./pipeline');
const { redact } = require('./compliance');

class AppError extends Error { constructor(code, msg, status = 400) { super(msg); this.code = code; this.status = status; } }
const TENANT_IDS = TENANTS.map(t => t.id);

function scope(db, tenant, actor = 'system') {
  if (!TENANT_IDS.includes(tenant)) throw new AppError('tenant', 'Unbekannter Mandant', 400);
  const T = tenant;

  function log(entity, entity_id, type, data) {
    db.prepare('INSERT INTO events (tenant_id,actor,entity,entity_id,type,data,at) VALUES (?,?,?,?,?,?,?)')
      .run(T, String(actor), entity, entity_id == null ? null : Number(entity_id), type, data == null ? null : redact(JSON.stringify(data)), now());
  }
  function mustGet(table, id) {
    const r = db.prepare(`SELECT * FROM ${table} WHERE id=? AND tenant_id=?`).get(Number(id), T);
    if (!r) throw new AppError('not_found', 'Datensatz nicht gefunden', 404);
    return r;
  }

  // ---------- Firmen ----------
  function findDuplicate({ website, name, phone }) {
    const d = domainOf(website);
    if (d) { const r = db.prepare('SELECT * FROM companies WHERE tenant_id=? AND domain=?').get(T, d); if (r) return { match: 'domain', company: r }; }
    const p = phoneKey(phone);
    if (p) { const r = db.prepare('SELECT * FROM companies WHERE tenant_id=? AND phone_key=?').get(T, p); if (r) return { match: 'telefon', company: r }; }
    const k = nameKey(name);
    if (k) { const r = db.prepare('SELECT * FROM companies WHERE tenant_id=? AND name_key=?').get(T, k); if (r) return { match: 'name', company: r }; }
    return null;
  }
  function upsertCompany(c) {
    if (!c || !c.name) throw new AppError('validation', 'Firmenname fehlt');
    const dup = findDuplicate(c);
    const t = now();
    if (dup) {
      const o = dup.company;
      db.prepare(`UPDATE companies SET website=COALESCE(website,?), domain=COALESCE(domain,?), phone=COALESCE(phone,?), phone_key=COALESCE(phone_key,?),
        email=COALESCE(email,?), address=COALESCE(address,?), locality=COALESCE(locality,?), canton=COALESCE(canton,?), industry=COALESCE(industry,?),
        segment=COALESCE(segment,?), updated_at=? WHERE id=? AND tenant_id=?`)
        .run(c.website || null, domainOf(c.website), c.phone || null, phoneKey(c.phone), c.email || null, c.address || null, c.locality || null,
          c.canton || null, c.industry || null, c.segment || null, t, o.id, T);
      return { id: o.id, duplicate: dup.match };
    }
    const r = db.prepare(`INSERT INTO companies (tenant_id,name,name_key,website,domain,phone,phone_key,email,address,locality,canton,industry,segment,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(T, c.name, nameKey(c.name), c.website || null, domainOf(c.website), c.phone || null, phoneKey(c.phone),
      c.email || null, c.address || null, c.locality || null, c.canton || null, c.industry || null, c.segment || null, t, t);
    log('company', r.lastInsertRowid, 'erstellt', { name: c.name });
    return { id: Number(r.lastInsertRowid), duplicate: null };
  }
  function getCompany(id) { return mustGet('companies', id); }

  // ---------- Leads ----------
  function createLead(l) {
    return tx(db, () => {
      const comp = upsertCompany(l.company);
      const existing = db.prepare("SELECT id FROM leads WHERE tenant_id=? AND company_id=? AND stage NOT IN ('verloren')").get(T, comp.id);
      if (existing) return { id: Number(existing.id), duplicate: comp.duplicate || 'lead' };
      const t = now();
      const r = db.prepare(`INSERT INTO leads (tenant_id,company_id,stage,score,score_detail,need,fit_reason,channel,channel_reason,verification,est_value_chf,researched_at,created_at,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(T, comp.id, 'neu', l.score ?? null, JSON.stringify(l.score_detail || []), l.need || null, l.fit_reason || null,
        l.channel || null, l.channel_reason || null, l.verification || 'unverifiziert', l.est_value_chf ?? null, l.researched_at || t, t, t);
      const id = Number(r.lastInsertRowid);
      for (const s of l.sources || []) db.prepare('INSERT INTO lead_sources (tenant_id,lead_id,url,note,retrieved_at) VALUES (?,?,?,?,?)').run(T, id, s.url, s.note || null, s.retrieved_at || t);
      for (const c of l.contacts || []) addContact({ ...c, company_id: comp.id });
      for (const f of l.findings || []) db.prepare('INSERT INTO findings (tenant_id,lead_id,code,severity,text,evidence,measured_at) VALUES (?,?,?,?,?,?,?)').run(T, id, f.code, f.severity, f.text, f.evidence || null, f.measured_at || t);
      log('lead', id, 'erstellt', { score: l.score, verification: l.verification });
      return { id, duplicate: null };
    });
  }
  function getLead(id) {
    const l = mustGet('leads', id);
    l.company = getCompany(l.company_id);
    l.sources = db.prepare('SELECT url,note,retrieved_at FROM lead_sources WHERE tenant_id=? AND lead_id=?').all(T, l.id);
    l.findings = db.prepare('SELECT code,severity,text,evidence,measured_at FROM findings WHERE tenant_id=? AND lead_id=?').all(T, l.id);
    l.contacts = db.prepare('SELECT id,name,role,email,phone,source_url,is_public_business,opt_out FROM contacts WHERE tenant_id=? AND company_id=?').all(T, l.company_id);
    l.notes = db.prepare('SELECT * FROM notes WHERE tenant_id=? AND lead_id=? ORDER BY id DESC').all(T, l.id);
    l.tasks = db.prepare('SELECT * FROM tasks WHERE tenant_id=? AND lead_id=? ORDER BY due_at').all(T, l.id);
    l.history = db.prepare("SELECT actor,type,data,at FROM events WHERE tenant_id=? AND entity='lead' AND entity_id=? ORDER BY id").all(T, l.id);
    l.score_detail = JSON.parse(l.score_detail || '[]');
    return l;
  }
  function listLeads({ stage, q, minScore, limit = 200, offset = 0 } = {}) {
    const w = ['l.tenant_id=?'], a = [T];
    if (stage) { w.push('l.stage=?'); a.push(stage); }
    if (minScore != null) { w.push('l.score>=?'); a.push(Number(minScore)); }
    if (q) { w.push('(c.name LIKE ? OR c.locality LIKE ? OR l.need LIKE ?)'); const k = `%${q}%`; a.push(k, k, k); }
    return db.prepare(`SELECT l.id,l.stage,l.score,l.need,l.channel,l.verification,l.est_value_chf,l.follow_up_at,l.updated_at,c.name company,c.locality,c.canton,c.website
      FROM leads l JOIN companies c ON c.id=l.company_id AND c.tenant_id=l.tenant_id WHERE ${w.join(' AND ')} ORDER BY l.score DESC, l.id LIMIT ? OFFSET ?`).all(...a, Number(limit), Number(offset));
  }
  function moveLead(id, to, { system = false, reason } = {}) {
    const l = mustGet('leads', id);
    if (!pipeline.STAGES.includes(to)) throw new AppError('stage', 'Unbekannte Stufe');
    if (l.stage === to) return l;
    if (!pipeline.canMove(l.stage, to)) throw new AppError('transition', `Übergang ${l.stage} → ${to} ist nicht erlaubt`, 409);
    if (pipeline.SYSTEM_ONLY[to] && !system) throw new AppError('transition', `«${pipeline.LABELS[to]}» setzt nur das System nach Freigabe bzw. Ausführung`, 409);
    db.prepare('UPDATE leads SET stage=?, lost_reason=?, updated_at=? WHERE id=? AND tenant_id=?').run(to, to === 'verloren' ? (reason || null) : null, now(), l.id, T);
    log('lead', l.id, 'stufe', { von: l.stage, nach: to, grund: reason || null });
    return mustGet('leads', id);
  }
  function addContact(c) {
    const r = db.prepare('INSERT INTO contacts (tenant_id,company_id,name,role,email,phone,source_url,is_public_business,created_at) VALUES (?,?,?,?,?,?,?,?,?)')
      .run(T, c.company_id ? getCompany(c.company_id).id : null, c.name, c.role || null, c.email || null, c.phone || null, c.source_url || null, c.is_public_business ? 1 : 0, now());
    return Number(r.lastInsertRowid);
  }
  function addNote(lead_id, body, author_id = null, kind = 'notiz') {
    const l = mustGet('leads', lead_id);
    const r = db.prepare('INSERT INTO notes (tenant_id,lead_id,company_id,author_id,kind,body,created_at) VALUES (?,?,?,?,?,?,?)').run(T, l.id, l.company_id, author_id, kind, String(body).slice(0, 8000), now());
    log('lead', l.id, 'notiz', { kind });
    return Number(r.lastInsertRowid);
  }
  function addTask(lead_id, title, due_at) {
    const l = lead_id ? mustGet('leads', lead_id) : null;
    const r = db.prepare('INSERT INTO tasks (tenant_id,lead_id,title,due_at,created_at) VALUES (?,?,?,?,?)').run(T, l ? l.id : null, title, due_at || null, now());
    if (l && due_at) db.prepare('UPDATE leads SET follow_up_at=? WHERE id=? AND tenant_id=?').run(due_at, l.id, T);
    return Number(r.lastInsertRowid);
  }
  function suppress(kind, value, reason) {
    db.prepare('INSERT OR IGNORE INTO suppression (tenant_id,kind,value,reason,created_at) VALUES (?,?,?,?,?)').run(T, kind, String(value).toLowerCase().trim(), reason || null, now());
    log('suppression', null, 'hinzugefuegt', { kind });
  }

  // ---------- Auswertung ----------
  function stats() {
    const byStage = Object.fromEntries(pipeline.STAGES.map(s => [s, 0]));
    for (const r of db.prepare('SELECT stage, COUNT(*) n FROM leads WHERE tenant_id=? GROUP BY stage').all(T)) byStage[r.stage] = Number(r.n);
    const total = Object.values(byStage).reduce((a, b) => a + b, 0);
    const pot = db.prepare("SELECT COALESCE(SUM(est_value_chf),0) s FROM leads WHERE tenant_id=? AND stage NOT IN ('verloren','gewonnen')").get(T).s;
    const won = db.prepare("SELECT COALESCE(SUM(value_rappen),0) s FROM orders WHERE tenant_id=? AND status='bestaetigt'").get(T).s;
    const contacted = ['kontaktiert', 'rueckmeldung', 'offerte', 'gewonnen'].reduce((a, s) => a + byStage[s], 0) + byStage.verloren;
    const drafts = {};
    for (const r of db.prepare('SELECT status, COUNT(*) n FROM drafts WHERE tenant_id=? GROUP BY status').all(T)) drafts[r.status] = Number(r.n);
    return {
      tenant: T, total, byStage, drafts, potential_chf: Number(pot), won_chf: Number(won) / 100,
      conversion: { kontakt_zu_rueckmeldung: contacted ? (byStage.rueckmeldung + byStage.offerte + byStage.gewonnen) / contacted : null, gewonnen_von_kontaktiert: contacted ? byStage.gewonnen / contacted : null }
    };
  }
  function events(limit = 100) { return db.prepare('SELECT * FROM events WHERE tenant_id=? ORDER BY id DESC LIMIT ?').all(T, Number(limit)); }

  return { tenant: T, log, mustGet, findDuplicate, upsertCompany, getCompany, createLead, getLead, listLeads, moveLead, addContact, addNote, addTask, suppress, stats, events };
}

module.exports = { scope, AppError, TENANT_IDS };
