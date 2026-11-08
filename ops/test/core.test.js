'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { setup, sampleLead, sampleDraft } = require('./helpers');
const { scope } = require('../src/repo');
const approvals = require('../src/approvals');
const { mockAdapter } = require('../src/mail/adapter');
const { domainOf, nameKey, phoneKey } = require('../src/dedupe');
const { score } = require('../src/scoring');
const { recommendChannel, redact } = require('../src/compliance');

test('CRM: Lead mit Firma, Quellen und Historie speichern', () => {
  const { db } = setup();
  const R = scope(db, 'immoready');
  const { id } = R.createLead(sampleLead());
  const l = R.getLead(id);
  assert.equal(l.company.name, 'Muster Verwaltung AG');
  assert.equal(l.company.domain, 'muster-verwaltung.example');
  assert.equal(l.stage, 'neu');
  assert.equal(l.sources.length, 1);
  assert.ok(l.history.some(h => h.type === 'erstellt'));
});

test('Dedupe: Normalisierung von Domain, Name und Telefon', () => {
  assert.equal(domainOf('WWW.Beispiel.CH/kontakt'), 'beispiel.ch');
  assert.equal(domainOf('https://www2.beispiel.ch'), 'beispiel.ch');
  assert.equal(nameKey('Müller Immobilien AG'), nameKey('Mueller  Immobilien'.replace('ue', 'ü')));
  assert.equal(phoneKey('056 222 33 44'), '+41562223344');
  assert.equal(phoneKey('0041 56 222 33 44'), '+41562223344');
});

test('Dedupe: dieselbe Firma (Domain, Telefon, Name) erzeugt keinen zweiten Lead', () => {
  const { db } = setup();
  const R = scope(db, 'immoready');
  const a = R.createLead(sampleLead());
  const b = R.createLead(sampleLead({ company: { name: 'Muster Verwaltung', website: 'muster-verwaltung.example' } }));
  assert.equal(b.id, a.id); assert.equal(b.duplicate, 'domain');
  const c = R.createLead(sampleLead({ company: { name: 'Andere AG', phone: '044 111 22 33' } }));
  const d = R.createLead(sampleLead({ company: { name: 'Andere Firma', phone: '+41 44 111 22 33' } }));
  assert.equal(d.id, c.id); assert.equal(d.duplicate, 'telefon');
  const e = R.createLead(sampleLead({ company: { name: 'Gamma Liegenschaften GmbH' } }));
  const f = R.createLead(sampleLead({ company: { name: 'Gamma Liegenschaften' } }));
  assert.equal(f.id, e.id); assert.equal(f.duplicate, 'name');
  assert.equal(R.listLeads().length, 3);
});

test('Mandantentrennung: Datensätze des anderen Mandanten sind unsichtbar', () => {
  const { db, users } = setup();
  const IR = scope(db, 'immoready'), RS = scope(db, 'readystudio');
  const { id } = IR.createLead(sampleLead());
  assert.throws(() => RS.getLead(id), /nicht gefunden/);
  assert.equal(RS.listLeads().length, 0);
  // gleiche Firma darf in beiden Mandanten getrennt existieren
  const r2 = RS.createLead(sampleLead());
  assert.notEqual(r2.id, id); assert.equal(r2.duplicate, null);
  const A_IR = approvals.api(db, 'immoready', users.owner);
  const dr = A_IR.createDraft(sampleDraft(id));
  const A_RS = approvals.api(db, 'readystudio', users.rsOnly);
  assert.throws(() => A_RS.getDraft(dr.id), /nicht gefunden/);
  assert.throws(() => A_RS.decide(dr.id, { decision: 'freigegeben', version: 1, content_hash: dr.current.content_hash }), /nicht gefunden/);
  // RS-Owner ohne Mitgliedschaft in immoready darf dort nicht freigeben
  const A_X = approvals.api(db, 'immoready', users.rsOnly);
  assert.throws(() => A_X.decide(dr.id, { decision: 'freigegeben', version: 1, content_hash: dr.current.content_hash }), /Keine Berechtigung/);
  assert.throws(() => scope(db, 'fremd'), /Unbekannter Mandant/);
});

test('Pipeline: ungültige Übergänge und System-Stufen werden abgelehnt', () => {
  const { db } = setup();
  const R = scope(db, 'immoready');
  const { id } = R.createLead(sampleLead());
  assert.throws(() => R.moveLead(id, 'gewonnen'), /nicht erlaubt/);
  R.moveLead(id, 'qualifiziert'); R.moveLead(id, 'kontaktentwurf'); R.moveLead(id, 'freigabe_ausstehend');
  assert.throws(() => R.moveLead(id, 'freigegeben'), /nur das System/);
  R.moveLead(id, 'verloren', { reason: 'kein Bedarf' });
  assert.equal(R.getLead(id).lost_reason, 'kein Bedarf');
  const types = R.getLead(id).history.filter(h => h.type === 'stufe').length;
  assert.equal(types, 4);
});

test('Freigabe: Ablauf Entwurf → Freigabe → Ausführung, Lead-Stufen folgen', async () => {
  const { db, users } = setup();
  const R = scope(db, 'immoready');
  const { id } = R.createLead(sampleLead());
  const A = approvals.api(db, 'immoready', users.owner);
  let d = A.createDraft(sampleDraft(id));
  assert.equal(d.status, 'freigabe_ausstehend');
  assert.equal(R.getLead(id).stage, 'freigabe_ausstehend');
  d = A.decide(d.id, { decision: 'freigegeben', version: 1, content_hash: d.current.content_hash });
  assert.equal(d.status, 'freigegeben'); assert.equal(d.approved_valid, true);
  assert.equal(R.getLead(id).stage, 'freigegeben');
  const ad = mockAdapter();
  d = await A.execute(d.id, ad);
  assert.equal(d.status, 'ausgefuehrt'); assert.equal(ad.sent.length, 1);
  assert.equal(ad.sent[0].recipient, 'kontakt@muster-verwaltung.example');
  assert.equal(R.getLead(id).stage, 'kontaktiert');
});

test('Freigabe: Änderung am Entwurf macht die Freigabe ungültig', async () => {
  const { db, users } = setup();
  const R = scope(db, 'immoready');
  const { id } = R.createLead(sampleLead());
  const A = approvals.api(db, 'immoready', users.owner);
  let d = A.createDraft(sampleDraft(id));
  d = A.decide(d.id, { decision: 'freigegeben', version: 1, content_hash: d.current.content_hash });
  const E = approvals.api(db, 'immoready', users.editor);
  d = E.edit(d.id, { body: d.current.body + ' Geänderter Satz.' });
  assert.equal(d.current_version, 2); assert.equal(d.status, 'freigabe_ausstehend'); assert.equal(d.approved_valid, false);
  assert.equal(d.approvals[0].valid, 0);
  assert.equal(R.getLead(id).stage, 'freigabe_ausstehend');
  await assert.rejects(A.execute(d.id, mockAdapter()), /Keine gültige Freigabe/);
  // Auch Empfängerwechsel ist eine Änderung
  d = A.decide(d.id, { decision: 'freigegeben', version: 2, content_hash: d.current.content_hash });
  d = E.edit(d.id, { recipient: 'andere@muster-verwaltung.example' });
  assert.equal(d.approved_valid, false);
  // unverändertes Speichern erzeugt keine neue Version
  const v = d.current_version;
  assert.equal(E.edit(d.id, {}).current_version, v);
});

test('Freigabe: veraltete Version oder falscher Hash wird abgelehnt', () => {
  const { db, users } = setup();
  const A = approvals.api(db, 'immoready', users.owner);
  const R = scope(db, 'immoready');
  const { id } = R.createLead(sampleLead());
  let d = A.createDraft(sampleDraft(id));
  const oldHash = d.current.content_hash;
  d = A.edit(d.id, { subject: 'Neuer Betreff' });
  assert.throws(() => A.decide(d.id, { decision: 'freigegeben', version: 1, content_hash: oldHash }), /nicht auf die aktuelle Version/);
  assert.throws(() => A.decide(d.id, { decision: 'freigegeben', version: 2, content_hash: oldHash }), /nicht auf die aktuelle Version/);
  assert.throws(() => A.edit(d.id, { subject: 'X' }, { expectVersion: 1 }), /inzwischen geändert/);
});

test('Rollen: nur owner gibt frei und führt aus; viewer darf nicht bearbeiten', async () => {
  const { db, users } = setup();
  const R = scope(db, 'immoready');
  const { id } = R.createLead(sampleLead());
  const d = approvals.api(db, 'immoready', users.owner).createDraft(sampleDraft(id));
  const E = approvals.api(db, 'immoready', users.editor), V = approvals.api(db, 'immoready', users.viewer);
  assert.throws(() => E.decide(d.id, { decision: 'freigegeben', version: 1, content_hash: d.current.content_hash }), /Keine Berechtigung/);
  assert.throws(() => V.edit(d.id, { subject: 'x' }), /Keine Berechtigung/);
  await assert.rejects(E.execute(d.id, mockAdapter()), /Keine Berechtigung/);
  assert.throws(() => approvals.api(db, 'immoready', null).decide(d.id, { decision: 'freigegeben' }), /Anmeldung erforderlich/);
});

test('Versand ohne Freigabe, nach Ablehnung oder Zurückstellung wird verweigert', async () => {
  const { db, users } = setup();
  const R = scope(db, 'immoready');
  const { id } = R.createLead(sampleLead());
  const A = approvals.api(db, 'immoready', users.owner);
  const ad = mockAdapter();
  let d = A.createDraft(sampleDraft(id));
  await assert.rejects(A.execute(d.id, ad), /Keine gültige Freigabe/);
  d = A.decide(d.id, { decision: 'abgelehnt', version: 1, content_hash: d.current.content_hash });
  await assert.rejects(A.execute(d.id, ad), /Keine gültige Freigabe/);
  assert.equal(R.getLead(id).stage, 'kontaktentwurf');
  d = A.resubmit(d.id);
  d = A.decide(d.id, { decision: 'zurueckgestellt', version: 1, content_hash: d.current.content_hash });
  await assert.rejects(A.execute(d.id, ad), /Keine gültige Freigabe/);
  assert.equal(ad.sent.length, 0);
});

test('Doppelversand: dieselbe freigegebene Version wird nur einmal ausgeführt', async () => {
  const { db, users } = setup();
  const R = scope(db, 'immoready');
  const { id } = R.createLead(sampleLead());
  const A = approvals.api(db, 'immoready', users.owner);
  let d = A.createDraft(sampleDraft(id));
  d = A.decide(d.id, { decision: 'freigegeben', version: 1, content_hash: d.current.content_hash });
  const ad = mockAdapter();
  // gleichzeitige Doppelklicks
  const results = await Promise.allSettled([A.execute(d.id, ad), A.execute(d.id, ad), A.execute(d.id, ad)]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  await assert.rejects(A.execute(d.id, ad), /bereits ausgeführt|Keine gültige|bereits/);
  assert.equal(ad.sent.length, 1);
  // nach Ausführung gesperrt
  assert.throws(() => A.edit(d.id, { body: 'neu neu neu neu neu neu neu' }), /Bereits ausgeführt/);
});

test('Fehlgeschlagene Integration: Fehlerstatus, keine stille Wiederholung, ausdrückliches retry', async () => {
  const { db, users } = setup();
  const R = scope(db, 'immoready');
  const { id } = R.createLead(sampleLead());
  const A = approvals.api(db, 'immoready', users.owner);
  let d = A.createDraft(sampleDraft(id));
  d = A.decide(d.id, { decision: 'freigegeben', version: 1, content_hash: d.current.content_hash });
  const ad = mockAdapter({ fail: 1 });
  await assert.rejects(A.execute(d.id, ad), /Ausführung fehlgeschlagen/);
  d = A.getDraft(d.id);
  assert.equal(d.status, 'fehler'); assert.match(d.last_error, /Simulierter Zustellfehler/);
  assert.equal(R.getLead(id).stage, 'freigegeben');
  await assert.rejects(A.execute(d.id, ad), /erneuter Versuch nur ausdrücklich/);
  d = await A.execute(d.id, ad, { retry: true });
  assert.equal(d.status, 'ausgefuehrt'); assert.equal(d.outbox[0].attempts, 2); assert.equal(ad.sent.length, 1);
  await assert.rejects(A.execute(d.id, ad, { retry: true }), /bereits ausgeführt/);
});

test('Gmail-Entwurf-Übergabe: Lead bleibt «freigegeben», bis manuell versendet bestätigt', async () => {
  const { db, users } = setup();
  const R = scope(db, 'immoready');
  const { id } = R.createLead(sampleLead());
  const A = approvals.api(db, 'immoready', users.owner);
  let d = A.createDraft(sampleDraft(id));
  d = A.decide(d.id, { decision: 'freigegeben', version: 1, content_hash: d.current.content_hash });
  d = await A.execute(d.id, mockAdapter({ delivered: false }));
  assert.equal(d.status, 'ausgefuehrt'); assert.equal(R.getLead(id).stage, 'freigegeben');
  A.markSent(d.id);
  assert.equal(R.getLead(id).stage, 'kontaktiert');
});

test('Datenschutz: Sperrliste blockiert Freigabe und Ausführung; Opt-out der Firma', async () => {
  const { db, users } = setup();
  const R = scope(db, 'immoready');
  const { id } = R.createLead(sampleLead());
  const A = approvals.api(db, 'immoready', users.owner);
  let d = A.createDraft(sampleDraft(id));
  d = A.decide(d.id, { decision: 'freigegeben', version: 1, content_hash: d.current.content_hash });
  R.suppress('domain', 'muster-verwaltung.example', 'Widerspruch per Telefon');
  await assert.rejects(A.execute(d.id, mockAdapter()), /Sperrliste/);
  const d2 = A.createDraft(sampleDraft(id, { recipient: 'neu@muster-verwaltung.example' }));
  assert.equal(d2.suppressed, true);
  assert.throws(() => A.decide(d2.id, { decision: 'freigegeben', version: 1, content_hash: d2.current.content_hash }), /Sperrliste/);
});

test('Datenschutz: Ereignisprotokoll maskiert E-Mail/Telefon und ist unveränderlich', () => {
  const { db, users } = setup();
  const R = scope(db, 'immoready');
  const { id } = R.createLead(sampleLead());
  R.log('test', id, 'pii', { email: 'max.muster@firma.example', tel: '079 123 45 67' });
  const ev = R.events(1)[0];
  assert.doesNotMatch(ev.data, /max\.muster@/); assert.doesNotMatch(ev.data, /079 123 45 67/);
  assert.equal(redact('a.b@c.ch'), 'a***@c.ch');
  assert.throws(() => db.prepare('UPDATE events SET type=? WHERE id=?').run('x', ev.id), /unveränderlich/);
  assert.throws(() => db.prepare('DELETE FROM events').run(), /unveränderlich/);
});

test('Scoring und Kanalwahl (UWG): ohne Einwilligung kein E-Mail-Erstkontakt', () => {
  const s = score('immoready', { segment: 'immobilienverwaltung', canton: 'ZH', portfolio_hint: true, address: 'x', official_source: true, verification: 'verifiziert' });
  assert.equal(s.score, 90); assert.ok(s.detail.length >= 4);
  assert.equal(score('immoready', { segment: 'x', verification: 'unverifiziert' }).score, 0);
  assert.equal(recommendChannel({ hasPostalAddress: true }).channel, 'brief');
  assert.equal(recommendChannel({ hasContactForm: true }).channel, 'kontaktformular');
  assert.equal(recommendChannel({ hasConsent: true, hasPostalAddress: true }).channel, 'email');
  assert.equal(recommendChannel({ optOut: true, hasConsent: true }).channel, 'keiner');
});

test('Validierung von Entwürfen: Empfänger und Inhalt', () => {
  const { db, users } = setup();
  const A = approvals.api(db, 'immoready', users.owner);
  assert.throws(() => A.createDraft({ kind: 'email', recipient: 'keine-mail', subject: 's', body: 'x'.repeat(30) }), /gültige E-Mail/);
  assert.throws(() => A.createDraft({ kind: 'email', recipient: 'a@b.ch', subject: 's', body: 'kurz' }), /zu kurz/);
  assert.throws(() => A.createDraft({ kind: 'fax', recipient: 'a@b.ch', subject: 's', body: 'x'.repeat(30) }), /Unbekannte Entwurfsart/);
  const b = A.createDraft({ kind: 'brief', recipient: 'Muster AG, Teststrasse 1, 5400 Baden', subject: 'Brief', body: 'Sehr geehrte Damen und Herren, Testbrief mit Inhalt.' });
  assert.equal(b.kind, 'brief');
});
