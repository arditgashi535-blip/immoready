'use strict';
// Offerten- und Rechnungsentwürfe. Beträge in Rappen (Ganzzahlen). MWST nur, wenn eine MWST-Nummer
// hinterlegt ist – solange rise.json → firm.company.vat = [UNSPECIFIED], wird keine MWST ausgewiesen.
const { scope, AppError } = require('./repo');
const { now, tx } = require('./db');
const approvals = require('./approvals');

function chf(rappen) { return 'CHF ' + (rappen / 100).toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function api(db, tenant, user) {
  const R = scope(db, tenant, user ? `user:${user.id}` : 'system');
  function nextNumber(kind) {
    const y = new Date().getFullYear();
    const p = (kind === 'offerte' ? 'OF' : 'RE') + '-' + (tenant === 'immoready' ? 'IR' : 'RS') + '-' + y + '-';
    const n = db.prepare('SELECT COUNT(*) n FROM quotes WHERE tenant_id=? AND kind=? AND number LIKE ?').get(tenant, kind, p + '%').n;
    return p + String(Number(n) + 1).padStart(4, '0');
  }
  function create({ lead_id, kind = 'offerte', items, vat_rate = null, valid_days = 30 }) {
    if (!Array.isArray(items) || !items.length) throw new AppError('validation', 'Mindestens eine Position nötig');
    for (const it of items) {
      if (!it.label || !(Number(it.qty) > 0) || !Number.isInteger(Number(it.unit_rappen)) || Number(it.unit_rappen) < 0) throw new AppError('validation', 'Ungültige Position');
    }
    if (lead_id) R.mustGet('leads', lead_id);
    return tx(db, () => {
      const t = now();
      const total = items.reduce((s, it) => s + Math.round(Number(it.qty) * Number(it.unit_rappen)), 0);
      const vat = vat_rate == null ? 0 : Math.round(total * Number(vat_rate));
      const vu = new Date(Date.now() + valid_days * 864e5).toISOString().slice(0, 10);
      const r = db.prepare('INSERT INTO quotes (tenant_id,lead_id,kind,number,status,vat_rate,total_rappen,valid_until,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
        .run(tenant, lead_id || null, kind, nextNumber(kind), 'entwurf', vat_rate, total + vat, kind === 'offerte' ? vu : null, t, t);
      const id = Number(r.lastInsertRowid);
      for (const it of items) db.prepare('INSERT INTO quote_items (tenant_id,quote_id,label,qty,unit,unit_rappen) VALUES (?,?,?,?,?,?)').run(tenant, id, String(it.label).slice(0, 300), Number(it.qty), it.unit || 'Pauschal', Number(it.unit_rappen));
      R.log('quote', id, 'erstellt', { kind, total_rappen: total + vat });
      return get(id);
    });
  }
  function get(id) {
    const q = R.mustGet('quotes', id);
    q.items = db.prepare('SELECT label,qty,unit,unit_rappen FROM quote_items WHERE tenant_id=? AND quote_id=?').all(tenant, q.id);
    return q;
  }
  function render(q, brand) {
    const lines = q.items.map(i => `- ${i.label}: ${i.qty} ${i.unit} × ${chf(i.unit_rappen)} = ${chf(Math.round(i.qty * i.unit_rappen))}`);
    return [`${q.kind === 'offerte' ? 'Offerte' : 'Rechnung'} ${q.number} – ${brand}`, '', ...lines, '',
      q.vat_rate == null ? 'Total ' + chf(q.total_rappen) + ' (keine MWST ausgewiesen)' : 'Total inkl. MWST ' + chf(q.total_rappen),
      q.valid_until ? 'Gültig bis ' + q.valid_until : '', '', 'ENTWURF – erst nach Freigabe gültig.'].join('\n');
  }
  // Offerte → versionsgebundener Versandentwurf in der Freigabe-Warteschlange
  function toDraft(id, recipient) {
    const q = get(id);
    const brand = tenant === 'immoready' ? 'ImmoReady' : 'Ready Studio';
    const A = approvals.api(db, tenant, user);
    const d = A.createDraft({ lead_id: q.lead_id, kind: q.kind, recipient, subject: `${q.kind === 'offerte' ? 'Offerte' : 'Rechnung'} ${q.number} – ${brand}`,
      body: render(q, brand), price_chf: (q.total_rappen / 100).toFixed(2) });
    db.prepare('UPDATE quotes SET draft_id=?, status=?, updated_at=? WHERE id=? AND tenant_id=?').run(d.id, 'freigabe_ausstehend', now(), q.id, tenant);
    if (q.lead_id) { const l = R.mustGet('leads', q.lead_id); if (l.stage === 'rueckmeldung') R.moveLead(q.lead_id, 'offerte'); }
    return d;
  }
  // Auftrag bestätigen (nach Kundenzusage) → Lead gewonnen, interne Meldung
  function confirmOrder(quote_id) {
    const q = get(quote_id);
    return tx(db, () => {
      const t = now();
      const r = db.prepare('INSERT INTO orders (tenant_id,lead_id,quote_id,status,value_rappen,confirmed_at,created_at) VALUES (?,?,?,?,?,?,?)').run(tenant, q.lead_id, q.id, 'bestaetigt', q.total_rappen, t, t);
      db.prepare("UPDATE quotes SET status='angenommen', updated_at=? WHERE id=?").run(t, q.id);
      if (q.lead_id) { const l = R.mustGet('leads', q.lead_id); if (l.stage !== 'gewonnen' && require('./pipeline').canMove(l.stage, 'gewonnen')) R.moveLead(q.lead_id, 'gewonnen'); }
      require('./notify').notify(db, tenant, 'auftrag_bestaetigt', { key: 'order-' + r.lastInsertRowid, subject: `Auftrag bestätigt: ${q.number}`, body: `Auftrag zu ${q.number} bestätigt, Wert ${chf(q.total_rappen)}.` });
      R.log('order', r.lastInsertRowid, 'bestaetigt', { quote: q.number });
      return Number(r.lastInsertRowid);
    });
  }
  return { create, get, render, toDraft, confirmOrder };
}
module.exports = { api, chf };
