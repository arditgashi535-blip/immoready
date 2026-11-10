// t32 – ReadyOS-Adapter gegen den nachgebildeten Empfänger (keine echte ReadyOS-Verbindung, keine E-Mails)
const A = require('../integrations/readyos/readyos-adapter');
const M = require('../integrations/readyos/mock-readyos');
const log = []; const ok = (c, m) => log.push((c ? 'PASS ' : 'FAIL ') + m);
const sub = { id: '11111111-2222-4333-8444-555555555555', formId: '9671b663-fabd-48c6-b63e-53b20f09ca7e', status: 'CONFIRMED', createdDate: '2026-11-09T10:00:00Z',
  submissions: { leistung: 'sanitaer', auftrag: 'einzel', ort: '8105 Regensdorf', beschreibung: 'Armatur tropft.', name: 'Test Person', email: 'Test@Beispiel.ch' } };
const booking = { id: 'b-1', status: 'CONFIRMED', revision: '3', startDate: '2026-12-01T09:00:00Z', endDate: '2026-12-01T09:30:00Z',
  contactDetails: { firstName: 'Test', lastName: 'Person', email: 'test@beispiel.ch' }, bookedEntity: { title: 'Kostenloses Beratungsgespräch' } };

(async () => {
  const ev = A.fromWixSubmission(sub);
  ok(ev.type === 'offertanfrage.eingegangen' && ev.idempotencyKey === 'wix-forms:' + sub.id && ev.requiresApproval === true, 'Einsendung → Ereignis mit Idempotenz-Schlüssel und Freigabepflicht');
  ok(ev.kunde.email === 'test@beispiel.ch' && ev.kunde.telefon === null && ev.anfrage.leistung === 'sanitaer' && ev.anfrage.auftragsart === 'einzel', 'Felder korrekt abgebildet (E-Mail klein, leeres Telefon = null)');
  ok(A.validate(ev).length === 0, 'Ereignis gültig');
  ok(A.fromWixSubmission(Object.assign({}, sub, { submissions: Object.assign({}, sub.submissions, { leistung: 'unbekannt' }) })).anfrage.leistung === 'mehrere', 'unbekannte Leistung → «mehrere»');
  const be = A.fromWixBooking(booking);
  ok(be.type === 'buchung.confirmed' && be.buchung.service === 'Kostenloses Beratungsgespräch' && A.validate(be).length === 0, 'Buchung → Ereignis «buchung.confirmed»');
  ok(A.validate(Object.assign({}, ev, { requiresApproval: false })).includes('requiresApproval'), 'Ereignis ohne Freigabepflicht wird abgelehnt');

  /* ohne Endpunkt: nichts senden, alles in die Warteschlange */
  const q0 = []; let called = 0;
  const r0 = await A.deliver([ev], { url: '', fetch: () => { called++; }, queue: q0 });
  ok(r0.queued === 1 && q0.length === 1 && called === 0, 'ohne READYOS_URL: nichts gesendet, Ereignis bleibt in der Warteschlange');

  /* Empfänger nicht erreichbar → Warteschlange; dann erreichbar → zugestellt, Wiederholung = Duplikat */
  const m = await M.start({ token: 'test-token', failFirst: 1 });
  const q1 = [];
  const r1 = await A.deliver([ev], { url: m.url, token: 'test-token', queue: q1 });
  ok(r1.queued === 1 && q1.length === 1, 'ReadyOS antwortet 503: Ereignis bleibt in der Warteschlange');
  const r2 = await A.deliver(q1.splice(0), { url: m.url, token: 'test-token', queue: q1 });
  ok(r2.sent === 1 && m.seen.size === 1, 'erneuter Versuch: zugestellt');
  const r3 = await A.deliver([ev, be], { url: m.url, token: 'test-token', queue: q1 });
  ok(r3.duplicate === 1 && r3.sent === 1 && m.seen.size === 2, 'gleiche Einsendung erneut: als Duplikat erkannt, Buchung zugestellt');
  const r4 = await A.deliver([be], { url: m.url, token: 'falsch', queue: [] });
  ok(r4.sent === 0 && r4.queued === 1, 'falscher Schlüssel: nicht angenommen, bleibt in der Warteschlange');
  m.close();

  log.forEach(l => console.log(l));
  const f = log.filter(l => l.startsWith('FAIL')).length;
  console.log('\nt32: ' + (log.length - f) + '/' + log.length + ' bestanden');
  process.exitCode = f ? 1 : 0;
})();
