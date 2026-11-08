'use strict';
// Interne Benachrichtigungen (an die eigenen Firmenadressen – keine externe Kommunikation, daher ohne Einzelfreigabe).
// Dedupe über dedupe_key (UNIQUE): dasselbe Ereignis erzeugt nie zwei Meldungen.
const { now, TENANTS, ESCALATION_EMAIL } = require('./db');
const { redact } = require('./compliance');

const IMMEDIATE = {
  qualifizierte_anfrage: 'Neue qualifizierte Kundenanfrage',
  interessierter_kunde: 'Neuer interessierter Geschäftskunde',
  auftrag_bestaetigt: 'Bestätigter Auftrag',
  kundenantwort: 'Neue Kundenantwort',
  kritischer_fehler: 'Kritischer Fehler',
  formular_fehlgeschlagen: 'Fehlgeschlagene Formularzustellung',
  sicherheitsvorfall: 'Sicherheitsvorfall',
  dringende_frist: 'Dringende Frist'
};
const CRITICAL = new Set(['kritischer_fehler', 'sicherheitsvorfall', 'formular_fehlgeschlagen']);

function recipientsFor(tenant, kind) {
  const t = TENANTS.find(x => x.id === tenant);
  const list = [t.notify_email];
  if (CRITICAL.has(kind)) list.push(ESCALATION_EMAIL);
  return list;
}

function notify(db, tenant, kind, { key, subject, body }) {
  if (!IMMEDIATE[kind] && kind !== 'digest') throw new Error('Unbekannte Meldungsart ' + kind);
  const out = [];
  for (const rcpt of recipientsFor(tenant, kind)) {
    const dk = `${tenant}:${kind}:${key}:${rcpt}`;
    const r = db.prepare('INSERT OR IGNORE INTO notifications (tenant_id,dedupe_key,kind,priority,recipient,subject,body,status,created_at) VALUES (?,?,?,?,?,?,?,?,?)')
      .run(tenant, dk, kind, CRITICAL.has(kind) ? 'kritisch' : (kind === 'digest' ? 'zusammenfassung' : 'sofort'), rcpt,
        `[${TENANTS.find(x => x.id === tenant).name}] ${subject || IMMEDIATE[kind]}`, String(body || '').slice(0, 20000), 'offen', now());
    out.push({ recipient: rcpt, created: Number(r.changes) === 1 });
  }
  return out;
}
function pending(db, tenant) {
  return tenant ? db.prepare("SELECT * FROM notifications WHERE tenant_id=? AND status='offen' ORDER BY id").all(tenant)
    : db.prepare("SELECT * FROM notifications WHERE status='offen' ORDER BY id").all();
}
function markDelivered(db, id, how = 'gmail_entwurf') {
  db.prepare("UPDATE notifications SET status=?, delivered_at=? WHERE id=?").run(how, now(), Number(id));
}
function markFailed(db, id, err) {
  db.prepare("UPDATE notifications SET status='fehler', error=? WHERE id=?").run(String(err).slice(0, 500), Number(id));
}

// Zusammenfassung je Mandant für einen Zeitraum (seit ISO-Zeitpunkt)
function digest(db, tenant, sinceIso) {
  const q = (sql, ...a) => db.prepare(sql).get(tenant, ...a).n;
  const s = sinceIso;
  const d = {
    neue_leads: q('SELECT COUNT(*) n FROM leads WHERE tenant_id=? AND created_at>=?', s),
    vorbereitete_anschreiben: q("SELECT COUNT(*) n FROM drafts WHERE tenant_id=? AND kind IN ('email','brief','kontaktformular') AND created_at>=?", s),
    offene_freigaben: q("SELECT COUNT(*) n FROM drafts WHERE tenant_id=? AND status='freigabe_ausstehend'"),
    versendete_angebote: q("SELECT COUNT(*) n FROM drafts WHERE tenant_id=? AND kind='offerte' AND status='ausgefuehrt' AND updated_at>=?", s),
    kundenrueckmeldungen: q("SELECT COUNT(*) n FROM events WHERE tenant_id=? AND entity='lead' AND type='stufe' AND data LIKE '%\"nach\":\"rueckmeldung\"%' AND at>=?", s),
    gewonnene_auftraege: q("SELECT COUNT(*) n FROM orders WHERE tenant_id=? AND status='bestaetigt' AND confirmed_at>=?", s),
    umsatzpotenzial_chf: db.prepare("SELECT COALESCE(SUM(est_value_chf),0) n FROM leads WHERE tenant_id=? AND stage NOT IN ('verloren','gewonnen')").get(tenant).n
  };
  const lines = [
    `Zusammenfassung seit ${s.slice(0, 10)}`, '',
    `Neue Leads: ${d.neue_leads}`, `Vorbereitete Anschreiben: ${d.vorbereitete_anschreiben}`, `Offene Freigaben: ${d.offene_freigaben}`,
    `Versendete Angebote: ${d.versendete_angebote}`, `Kundenrückmeldungen: ${d.kundenrueckmeldungen}`, `Gewonnene Aufträge: ${d.gewonnene_auftraege}`,
    `Geschätztes Umsatzpotenzial (offene Leads, Indikation): CHF ${Number(d.umsatzpotenzial_chf).toLocaleString('de-CH')}`, '',
    'Freigaben erfolgen ausschliesslich in der ReadyOps-Freigabeoberfläche.'
  ];
  return { data: d, text: redact(lines.join('\n')) };
}
module.exports = { notify, pending, markDelivered, markFailed, digest, IMMEDIATE, CRITICAL, recipientsFor };
