'use strict';
// Freigabe-Warteschlange. Kernregeln (siehe docs/APPROVAL-POLICY.md):
//  1. Eine Freigabe bindet Aktion + Empfänger + Inhalts-Hash + Version. Nur Rolle «owner» des Mandanten darf freigeben.
//  2. Jede Änderung erzeugt eine neue Version und macht alle bisherigen Freigaben ungültig.
//  3. Ausführung nur mit gültiger Freigabe der aktuellen Version; ein Idempotenz-Schlüssel (UNIQUE) verhindert Doppelausführung.
//  4. Fehlgeschlagene Ausführungen werden nie still wiederholt – nur über ausdrückliches retry durch einen owner.
const crypto = require('node:crypto');
const { now, tx } = require('./db');
const { scope, AppError } = require('./repo');
const { isSuppressed } = require('./compliance');
const { cleanText, detectInjection } = require('./sanitize');

const ACTION_OF = { email: 'email_senden', brief: 'brief_versenden', kontaktformular: 'kontaktformular_senden', offerte: 'offerte_versenden', rechnung: 'rechnung_versenden', mahnung: 'mahnung_versenden' };
const EMAIL_RE = /^[^\s@<>()]+@[^\s@<>()]+\.[^\s@<>()]{2,}$/;

function contentHash(v) {
  const canon = JSON.stringify([v.recipient, v.subject, v.body, v.attachments || [], v.price_chf == null ? null : String(v.price_chf)]);
  return crypto.createHash('sha256').update(canon).digest('hex');
}

function roleOf(db, userId, tenant) {
  const r = db.prepare('SELECT role FROM memberships WHERE user_id=? AND tenant_id=?').get(Number(userId), tenant);
  return r ? r.role : null;
}
function requireRole(db, user, tenant, roles) {
  if (!user || !user.id) throw new AppError('auth', 'Anmeldung erforderlich', 401);
  const r = roleOf(db, user.id, tenant);
  if (!r || !roles.includes(r)) throw new AppError('forbidden', 'Keine Berechtigung für diese Aktion in diesem Mandanten', 403);
  return r;
}

function normVersion(kind, v) {
  const out = {
    recipient: cleanText(v.recipient || '', 400), subject: cleanText(v.subject || '', 300), body: cleanText(v.body || '', 20000),
    attachments: Array.isArray(v.attachments) ? v.attachments.map(a => ({ id: Number(a.id), filename: cleanText(a.filename || '', 200), sha256: String(a.sha256 || '') })) : [],
    price_chf: v.price_chf == null || v.price_chf === '' ? null : String(v.price_chf).slice(0, 60)
  };
  if (!out.recipient) throw new AppError('validation', 'Empfänger fehlt');
  if (['email', 'offerte', 'rechnung', 'mahnung'].includes(kind) && !EMAIL_RE.test(out.recipient)) throw new AppError('validation', 'Empfänger ist keine gültige E-Mail-Adresse');
  if (!out.body || out.body.length < 20) throw new AppError('validation', 'Inhalt ist zu kurz');
  return out;
}

function api(db, tenant, user) {
  const R = scope(db, tenant, user ? `user:${user.id}` : 'system');
  const T = tenant;

  function current(draft) {
    return db.prepare('SELECT * FROM draft_versions WHERE draft_id=? AND version=? AND tenant_id=?').get(draft.id, draft.current_version, T);
  }
  function validApproval(draft, ver) {
    return db.prepare("SELECT * FROM approvals WHERE tenant_id=? AND draft_id=? AND version=? AND content_hash=? AND recipient=? AND decision='freigegeben' AND valid=1 ORDER BY id DESC LIMIT 1")
      .get(T, draft.id, ver.version, ver.content_hash, ver.recipient);
  }

  function createDraft({ lead_id = null, kind, submit = true, ...v }, author = user) {
    if (!ACTION_OF[kind]) throw new AppError('validation', 'Unbekannte Entwurfsart');
    if (lead_id != null) R.mustGet('leads', lead_id);
    const ver = normVersion(kind, v);
    const hash = contentHash(ver);
    return tx(db, () => {
      const t = now();
      const r = db.prepare('INSERT INTO drafts (tenant_id,lead_id,kind,status,current_version,created_at,updated_at) VALUES (?,?,?,?,1,?,?)').run(T, lead_id, kind, submit ? 'freigabe_ausstehend' : 'entwurf', t, t);
      const id = Number(r.lastInsertRowid);
      db.prepare('INSERT INTO draft_versions (draft_id,version,tenant_id,recipient,subject,body,attachments,price_chf,content_hash,author_id,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
        .run(id, 1, T, ver.recipient, ver.subject, ver.body, JSON.stringify(ver.attachments), ver.price_chf, hash, author ? author.id : null, t);
      R.log('draft', id, 'erstellt', { kind, version: 1, hash: hash.slice(0, 12) });
      if (lead_id != null) {
        const l = R.mustGet('leads', lead_id);
        if (['neu', 'qualifiziert'].includes(l.stage)) { if (l.stage === 'neu') R.moveLead(lead_id, 'qualifiziert'); R.moveLead(lead_id, 'kontaktentwurf'); }
        if (submit && R.mustGet('leads', lead_id).stage === 'kontaktentwurf') R.moveLead(lead_id, 'freigabe_ausstehend');
      }
      return getDraft(id);
    });
  }

  function getDraft(id) {
    const d = R.mustGet('drafts', id);
    const versions = db.prepare('SELECT * FROM draft_versions WHERE draft_id=? AND tenant_id=? ORDER BY version').all(d.id, T)
      .map(v => ({ ...v, attachments: JSON.parse(v.attachments || '[]') }));
    const approvals = db.prepare('SELECT a.*, u.name decided_by_name FROM approvals a LEFT JOIN users u ON u.id=a.decided_by WHERE a.tenant_id=? AND a.draft_id=? ORDER BY a.id').all(T, d.id);
    const outbox = db.prepare('SELECT id,adapter,status,attempts,result,error,created_at,updated_at FROM actions_outbox WHERE tenant_id=? AND draft_id=? ORDER BY id').all(T, d.id);
    const cur = versions.find(v => v.version === d.current_version);
    const lead = d.lead_id ? R.getLead(d.lead_id) : null;
    const flags = detectInjection([cur.subject, cur.body].join('\n'));
    return { ...d, action: ACTION_OF[d.kind], current: cur, versions, approvals, outbox, lead, injection_flags: flags,
      suppressed: isSuppressed(db, T, cur.recipient), approved_valid: !!validApproval(d, cur) };
  }

  function list({ status, q, kind, limit = 200 } = {}) {
    const w = ['d.tenant_id=?'], a = [T];
    if (status) { w.push('d.status=?'); a.push(status); }
    if (kind) { w.push('d.kind=?'); a.push(kind); }
    if (q) { w.push('(v.subject LIKE ? OR v.recipient LIKE ? OR v.body LIKE ? OR c.name LIKE ?)'); const k = `%${q}%`; a.push(k, k, k, k); }
    return db.prepare(`SELECT d.id,d.kind,d.status,d.current_version,d.updated_at,d.last_error,v.recipient,v.subject,v.price_chf,c.name company,l.score
      FROM drafts d JOIN draft_versions v ON v.draft_id=d.id AND v.version=d.current_version
      LEFT JOIN leads l ON l.id=d.lead_id AND l.tenant_id=d.tenant_id LEFT JOIN companies c ON c.id=l.company_id AND c.tenant_id=d.tenant_id
      WHERE ${w.join(' AND ')} ORDER BY d.updated_at DESC LIMIT ?`).all(...a, Number(limit));
  }

  // Bearbeiten → neue Version; vorhandene Freigaben verlieren ihre Gültigkeit.
  function edit(id, changes, { expectVersion } = {}) {
    requireRole(db, user, T, ['owner', 'editor']);
    return tx(db, () => {
      const d = R.mustGet('drafts', id);
      if (d.status === 'ausgefuehrt') throw new AppError('locked', 'Bereits ausgeführt – bitte einen neuen Entwurf anlegen', 409);
      if (expectVersion != null && Number(expectVersion) !== d.current_version) throw new AppError('conflict', `Entwurf wurde inzwischen geändert (aktuell Version ${d.current_version})`, 409);
      const cur = current(d);
      const merged = normVersion(d.kind, { ...cur, attachments: JSON.parse(cur.attachments || '[]'), ...changes });
      const hash = contentHash(merged);
      if (hash === cur.content_hash) return getDraft(id);
      const nv = d.current_version + 1, t = now();
      db.prepare('INSERT INTO draft_versions (draft_id,version,tenant_id,recipient,subject,body,attachments,price_chf,content_hash,author_id,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
        .run(d.id, nv, T, merged.recipient, merged.subject, merged.body, JSON.stringify(merged.attachments), merged.price_chf, hash, user.id, t);
      const inv = db.prepare("UPDATE approvals SET valid=0, invalidated_at=? WHERE tenant_id=? AND draft_id=? AND valid=1").run(t, T, d.id);
      db.prepare("UPDATE drafts SET current_version=?, status='freigabe_ausstehend', last_error=NULL, updated_at=? WHERE id=? AND tenant_id=?").run(nv, t, d.id, T);
      R.log('draft', d.id, 'geaendert', { version: nv, hash: hash.slice(0, 12), freigaben_ungueltig: Number(inv.changes) });
      if (d.lead_id) { const l = R.mustGet('leads', d.lead_id); if (l.stage === 'freigegeben') R.moveLead(d.lead_id, 'freigabe_ausstehend', { system: true }); }
      return getDraft(id);
    });
  }

  // Entscheidung muss die Version UND den Hash nennen, die der Freigebende gesehen hat.
  function decide(id, { decision, version, content_hash, comment }) {
    requireRole(db, user, T, ['owner']);
    if (!['freigegeben', 'abgelehnt', 'zurueckgestellt'].includes(decision)) throw new AppError('validation', 'Unbekannte Entscheidung');
    return tx(db, () => {
      const d = R.mustGet('drafts', id);
      const cur = current(d);
      if (d.status === 'ausgefuehrt') throw new AppError('locked', 'Bereits ausgeführt', 409);
      if (Number(version) !== cur.version || content_hash !== cur.content_hash) throw new AppError('stale', 'Die Freigabe bezieht sich nicht auf die aktuelle Version. Bitte den aktuellen Inhalt prüfen.', 409);
      if (decision === 'freigegeben') {
        if (isSuppressed(db, T, cur.recipient)) throw new AppError('suppressed', 'Empfänger steht auf der Sperrliste (Widerspruch)', 409);
        if (d.lead_id) {
          const l = R.getLead(d.lead_id);
          if (l.company.opt_out) throw new AppError('suppressed', 'Firma hat widersprochen', 409);
        }
      }
      const t = now();
      db.prepare("UPDATE approvals SET valid=0, invalidated_at=? WHERE tenant_id=? AND draft_id=? AND valid=1").run(t, T, d.id);
      db.prepare('INSERT INTO approvals (tenant_id,draft_id,version,content_hash,recipient,action,decision,decided_by,comment,valid,decided_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
        .run(T, d.id, cur.version, cur.content_hash, cur.recipient, ACTION_OF[d.kind], decision, user.id, cleanText(comment || '', 2000) || null, decision === 'freigegeben' ? 1 : 0, t);
      db.prepare('UPDATE drafts SET status=?, updated_at=? WHERE id=? AND tenant_id=?').run(decision, t, d.id, T);
      R.log('draft', d.id, 'entscheidung', { decision, version: cur.version, hash: cur.content_hash.slice(0, 12) });
      if (d.lead_id) {
        const l = R.mustGet('leads', d.lead_id);
        if (decision === 'freigegeben' && l.stage === 'freigabe_ausstehend') R.moveLead(d.lead_id, 'freigegeben', { system: true });
        if (decision === 'abgelehnt' && l.stage === 'freigabe_ausstehend') R.moveLead(d.lead_id, 'kontaktentwurf');
      }
      return getDraft(id);
    });
  }

  function resubmit(id) {
    requireRole(db, user, T, ['owner', 'editor']);
    const d = R.mustGet('drafts', id);
    if (!['abgelehnt', 'zurueckgestellt', 'entwurf', 'fehler'].includes(d.status)) throw new AppError('transition', 'Nur abgelehnte, zurückgestellte oder fehlerhafte Entwürfe können erneut eingereicht werden', 409);
    db.prepare("UPDATE drafts SET status='freigabe_ausstehend', updated_at=? WHERE id=? AND tenant_id=?").run(now(), d.id, T);
    R.log('draft', d.id, 'eingereicht', {});
    if (d.lead_id && R.mustGet('leads', d.lead_id).stage === 'kontaktentwurf') R.moveLead(d.lead_id, 'freigabe_ausstehend');
    return getDraft(id);
  }

  // Ausführung über einen Adapter. Prüft die Freigabe unmittelbar vor der Ausführung erneut.
  async function execute(id, adapter, { retry = false } = {}) {
    requireRole(db, user, T, ['owner']);
    if (!adapter || typeof adapter.execute !== 'function') throw new AppError('adapter', 'Kein Ausführungsadapter konfiguriert', 500);
    const prep = tx(db, () => {
      const d = R.mustGet('drafts', id);
      const cur = current(d);
      const ap = validApproval(d, cur);
      if (!ap) throw new AppError('not_approved', 'Keine gültige Freigabe für die aktuelle Version – Ausführung verweigert', 403);
      if (isSuppressed(db, T, cur.recipient)) throw new AppError('suppressed', 'Empfänger steht auf der Sperrliste', 409);
      const idem = crypto.createHash('sha256').update([T, d.id, cur.version, cur.content_hash, ACTION_OF[d.kind], cur.recipient].join('|')).digest('hex');
      const ex = db.prepare('SELECT * FROM actions_outbox WHERE idem_key=?').get(idem);
      const t = now();
      if (ex) {
        if (ex.status === 'erledigt') throw new AppError('duplicate', 'Diese freigegebene Version wurde bereits ausgeführt – kein zweiter Versand', 409);
        if (ex.status === 'in_arbeit') throw new AppError('in_progress', 'Ausführung läuft bereits', 409);
        if (ex.status === 'fehler' && !retry) throw new AppError('failed_before', 'Letzter Versuch ist fehlgeschlagen – erneuter Versuch nur ausdrücklich (retry)', 409);
        db.prepare("UPDATE actions_outbox SET status='in_arbeit', attempts=attempts+1, updated_at=? WHERE id=?").run(t, ex.id);
        return { d, cur, ap, outboxId: ex.id };
      }
      const r = db.prepare("INSERT INTO actions_outbox (tenant_id,draft_id,approval_id,idem_key,adapter,status,attempts,created_at,updated_at) VALUES (?,?,?,?,?,'in_arbeit',1,?,?)")
        .run(T, d.id, ap.id, idem, adapter.name || 'adapter', t, t);
      return { d, cur, ap, outboxId: Number(r.lastInsertRowid) };
    });
    const payload = { tenant: T, draft_id: prep.d.id, kind: prep.d.kind, version: prep.cur.version, content_hash: prep.cur.content_hash, recipient: prep.cur.recipient,
      subject: prep.cur.subject, body: prep.cur.body, attachments: JSON.parse(prep.cur.attachments || '[]'), idempotency_key: db.prepare('SELECT idem_key FROM actions_outbox WHERE id=?').get(prep.outboxId).idem_key };
    let result;
    try {
      result = await adapter.execute(payload);
    } catch (e) {
      const t = now();
      db.prepare("UPDATE actions_outbox SET status='fehler', error=?, updated_at=? WHERE id=?").run(String(e.message || e).slice(0, 1000), t, prep.outboxId);
      db.prepare("UPDATE drafts SET status='fehler', last_error=?, updated_at=? WHERE id=? AND tenant_id=?").run(String(e.message || e).slice(0, 1000), t, prep.d.id, T);
      R.log('draft', prep.d.id, 'ausfuehrung_fehler', { adapter: adapter.name, error: String(e.message || e).slice(0, 200) });
      throw new AppError('adapter_failed', 'Ausführung fehlgeschlagen: ' + (e.message || e), 502);
    }
    tx(db, () => {
      const t = now();
      db.prepare("UPDATE actions_outbox SET status='erledigt', result=?, error=NULL, updated_at=? WHERE id=?").run(JSON.stringify(result || {}), t, prep.outboxId);
      db.prepare("UPDATE drafts SET status='ausgefuehrt', last_error=NULL, updated_at=? WHERE id=? AND tenant_id=?").run(t, prep.d.id, T);
      R.log('draft', prep.d.id, 'ausgefuehrt', { adapter: adapter.name, mode: result && result.mode });
      // «Kontaktiert» erst, wenn der Adapter tatsächlich zugestellt hat (nicht bei blossem Gmail-Entwurf)
      if (prep.d.lead_id && result && result.delivered === true) {
        const l = R.mustGet('leads', prep.d.lead_id);
        if (l.stage === 'freigegeben') R.moveLead(prep.d.lead_id, 'kontaktiert', { system: true });
      }
    });
    return getDraft(id);
  }

  // Inhaber bestätigt manuell, dass er den Gmail-Entwurf versendet bzw. den Brief abgeschickt hat
  function markSent(id) {
    requireRole(db, user, T, ['owner']);
    const d = R.mustGet('drafts', id);
    if (d.status !== 'ausgefuehrt') throw new AppError('transition', 'Erst nach der Ausführung (Entwurf angelegt) möglich', 409);
    R.log('draft', d.id, 'manuell_versendet', {});
    if (d.lead_id && R.mustGet('leads', d.lead_id).stage === 'freigegeben') R.moveLead(d.lead_id, 'kontaktiert', { system: true });
    return getDraft(id);
  }

  return { createDraft, getDraft, list, edit, decide, resubmit, execute, markSent };
}

module.exports = { api, contentHash, requireRole, roleOf, ACTION_OF };
