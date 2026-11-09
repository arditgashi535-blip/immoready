// ReadyOS-Adapter (vorbereitet, nicht in Betrieb)
//
// Übersetzt Wix-Ereignisse (Formular-Einsendung, Buchung) in ReadyOS-Ereignisse und liefert sie an ReadyOS aus.
// Grundsätze (docs/READYOS-SCHNITTSTELLE.md):
//  · Die Website bleibt unabhängig: Wix Forms ist der Speicher. Ist ReadyOS nicht erreichbar, geht nichts verloren –
//    das Ereignis bleibt in der Warteschlange und kann jederzeit erneut aus Wix gelesen werden.
//  · Idempotenz: Schlüssel = Quelle + Wix-ID. ReadyOS verarbeitet denselben Schlüssel nur einmal.
//  · Keine verbindliche Aktion ohne Freigabe: jedes Ereignis trägt requiresApproval: true; der Adapter versendet keine
//    E-Mails und schreibt nichts zurück nach Wix.
//  · Keine Zugangsdaten im Code: Endpunkt und Schlüssel kommen zur Laufzeit aus der Umgebung (READYOS_URL, READYOS_TOKEN).
'use strict';

const VERSION = 1;
const SERVICES = ['hauswartung', 'sanitaer', 'gartenunterhalt', 'reinigung', 'raeumung', 'leerstand', 'verkauf', 'fotografie', 'mehrere'];
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Wix-Forms-Einsendung (Formular «Offertanfragen») → ReadyOS-Ereignis «offertanfrage.eingegangen». */
function fromWixSubmission(sub) {
  if (!sub || !sub.id || !sub.submissions) throw new Error('Einsendung ohne id oder Werte');
  const v = sub.submissions;
  const leistung = SERVICES.includes(v.leistung) ? v.leistung : 'mehrere';
  return {
    version: VERSION,
    type: 'offertanfrage.eingegangen',
    idempotencyKey: 'wix-forms:' + sub.id,
    source: { system: 'wix-forms', formId: sub.formId || null, submissionId: sub.id, status: sub.status || null },
    occurredAt: sub.createdDate || new Date().toISOString(),
    requiresApproval: true,
    kunde: { name: str(v.name, 120), email: str(v.email, 200).toLowerCase(), telefon: str(v.tel, 40) || null, wixContactId: sub.contactId || null },
    anfrage: { leistung, auftragsart: v.auftrag === 'laufend' ? 'laufend' : v.auftrag === 'einzel' ? 'einzel' : null, ort: str(v.ort, 120), beschreibung: str(v.beschreibung, 4000) },
    vorschlag: { status: 'neu', naechsterSchritt: 'offertentwurf_pruefen' }
  };
}

/** Wix-Bookings-Buchung → ReadyOS-Ereignis «buchung.<status>» (nur Lesen, keine Änderung an der Buchung). */
function fromWixBooking(b) {
  if (!b || !b.id) throw new Error('Buchung ohne id');
  const c = (b.contactDetails || {});
  const st = String(b.status || 'UNKNOWN').toLowerCase();
  return {
    version: VERSION,
    type: 'buchung.' + st,
    idempotencyKey: 'wix-bookings:' + b.id + ':' + (b.revision || st),
    source: { system: 'wix-bookings', bookingId: b.id },
    occurredAt: b.updatedDate || b.createdDate || new Date().toISOString(),
    requiresApproval: true,
    kunde: { name: [c.firstName, c.lastName].filter(Boolean).join(' '), email: (c.email || '').toLowerCase(), telefon: c.phone || null, wixContactId: c.contactId || null },
    buchung: { service: (b.bookedEntity && b.bookedEntity.title) || null, start: b.startDate || (b.bookedEntity && b.bookedEntity.slot && b.bookedEntity.slot.startDate) || null,
      ende: b.endDate || (b.bookedEntity && b.bookedEntity.slot && b.bookedEntity.slot.endDate) || null, status: st }
  };
}

/** Prüft ein Ereignis gegen die Pflichtfelder (ohne Fremdbibliothek). Gibt eine Liste von Fehlern zurück. */
function validate(ev) {
  const e = [];
  if (!ev || ev.version !== VERSION) e.push('version');
  if (!/^(offertanfrage\.eingegangen|buchung\.[a-z_]+)$/.test((ev || {}).type || '')) e.push('type');
  if (!/^wix-(forms|bookings):/.test((ev || {}).idempotencyKey || '')) e.push('idempotencyKey');
  if (!ev || ev.requiresApproval !== true) e.push('requiresApproval');
  if (!ev || !ev.kunde || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(ev.kunde.email || '')) e.push('kunde.email');
  if (ev && ev.type === 'offertanfrage.eingegangen' && (!ev.anfrage || !SERVICES.includes(ev.anfrage.leistung))) e.push('anfrage.leistung');
  return e;
}

/**
 * Liefert Ereignisse an ReadyOS aus. Ohne Endpunkt (READYOS_URL) bleibt alles in der Warteschlange – nichts wird gesendet.
 * opts: { url, token, fetch, queue } – queue ist ein Array (oder Speicher mit push/shift), das fehlgeschlagene Ereignisse behält.
 */
async function deliver(events, opts = {}) {
  const url = opts.url || process.env.READYOS_URL || '';
  const token = opts.token || process.env.READYOS_TOKEN || '';
  const f = opts.fetch || (typeof fetch === 'function' ? fetch : null);
  const queue = opts.queue || [];
  const out = { sent: 0, duplicate: 0, queued: 0, invalid: [] };
  for (const ev of events) {
    const err = validate(ev);
    if (err.length) { out.invalid.push({ key: ev && ev.idempotencyKey, err }); continue; }
    if (!url || !f) { queue.push(ev); out.queued++; continue; }
    try {
      const r = await f(url.replace(/\/$/, '') + '/events', { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json', 'Idempotency-Key': ev.idempotencyKey }, token ? { Authorization: 'Bearer ' + token } : {}), body: JSON.stringify(ev) });
      if (r.status === 200 || r.status === 201) out.sent++;
      else if (r.status === 409) out.duplicate++;
      else { queue.push(ev); out.queued++; }
    } catch (e) { queue.push(ev); out.queued++; }
  }
  return out;
}

module.exports = { VERSION, SERVICES, fromWixSubmission, fromWixBooking, validate, deliver };
