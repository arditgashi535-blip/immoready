'use strict';
// Eingehende Kundenanfragen (Website-Formulare beider Marken). Regeln für ImmoReady identisch mit
// wix/backend/http-functions.js → pruefen() und src/p3c.html → validate.
const { scope, AppError } = require('./repo');
const { cleanText, detectInjection } = require('./sanitize');
const { notify } = require('./notify');
const { now } = require('./db');

const SERVICES = {
  immoready: ['hauswartung', 'sanitaer', 'gartenunterhalt', 'reinigung', 'raeumung', 'leerstand', 'verkauf', 'fotografie', 'verwaltung', 'mehrere'],
  readystudio: ['website', 'webdesign', 'app', 'software', 'ki_automatisierung', 'seo', 'werbevideo', 'readyos', 'mehrere']
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(tenant, b) {
  if (!SERVICES[tenant]) throw new AppError('tenant', 'Unbekannter Mandant');
  b = b && typeof b === 'object' ? b : {};
  const d = {
    leistung: cleanText(b.leistung, 40), auftrag: cleanText(b.auftrag, 20), ort: cleanText(b.ort, 120), beschreibung: cleanText(b.beschreibung, 4000),
    name: cleanText(b.name, 120), firma: cleanText(b.firma, 160), email: cleanText(b.email, 200), tel: cleanText(b.tel, 40), budget: cleanText(b.budget, 60),
    einwilligung_kontakt: b.einwilligung_kontakt === true, website_url: cleanText(b.website_url, 300)
  };
  const f = {};
  if (!SERVICES[tenant].includes(d.leistung)) f.leistung = 'Bitte wählen Sie die gewünschte Leistung.';
  if (d.auftrag && !['einzel', 'laufend'].includes(d.auftrag)) f.auftrag = 'Ungültige Auswahl.';
  if (tenant === 'immoready' && d.ort.length < 2) f.ort = 'Bitte geben Sie den Ort oder die Postleitzahl an.';
  if (d.beschreibung.length < 15) f.beschreibung = 'Bitte beschreiben Sie Ihr Anliegen in ein paar Worten (mindestens 15 Zeichen).';
  if (d.name.length < 2) f.name = 'Bitte geben Sie Ihren Namen an.';
  if (!EMAIL_RE.test(d.email)) f.email = 'Bitte prüfen Sie die E-Mail-Adresse, z. B. name@beispiel.ch.';
  const t = d.tel.replace(/[\s\-\/().]/g, '');
  if (t && !/^(\+|00)?\d{9,13}$/.test(t)) f.tel = 'Bitte prüfen Sie die Telefonnummer, z. B. 079 123 45 67.';
  if (b.hp) f.hp = 'spam'; // Honigtopf-Feld
  return { daten: d, fehler: f };
}

// Klassifizierung: regelbasiert, deterministisch. Externer Text steuert nie Aktionen.
function classify(tenant, d) {
  const text = (d.beschreibung + ' ' + d.firma).toLowerCase();
  const b2b = !!d.firma || /(verwaltung|bewirtschaft|liegenschaft|stwe|stockwerk|eigentümer|portfolio|überbauung|gmbh|\bag\b|firma|unternehmen)/.test(text);
  const recurring = d.auftrag === 'laufend' || /(regelmässig|laufend|monatlich|wöchentlich|jahresvertrag|abo)/.test(text);
  const urgent = /(dringend|sofort|notfall|wasserschaden|heute|morgen)/.test(text);
  const flags = detectInjection(d.beschreibung + '\n' + d.firma);
  const spam = flags.length >= 2 || /(viagra|casino|crypto|seo backlinks? cheap)/.test(text);
  const qualified = !spam && d.beschreibung.length >= 15 && EMAIL_RE.test(d.email);
  return { b2b, recurring, urgent, spam, qualified, injection_flags: flags, leistung: d.leistung };
}

function receive(db, tenant, body, channel = 'website_formular') {
  const { daten, fehler } = validate(tenant, body);
  if (Object.keys(fehler).length) return { ok: false, fehler };
  const R = scope(db, tenant, 'intake');
  const c = classify(tenant, daten);
  let lead = null;
  if (c.qualified && c.b2b && daten.firma) {
    lead = R.createLead({ company: { name: daten.firma, website: daten.website_url || null, email: daten.email, locality: daten.ort }, need: daten.leistung, fit_reason: 'Eingehende Anfrage über ' + channel, verification: 'selbstauskunft', score: 60, channel: 'email', channel_reason: 'Antwort auf eigene Anfrage des Kunden (keine Werbung).' });
  }
  const r = db.prepare('INSERT INTO inquiries (tenant_id,company_id,lead_id,channel,payload,classification,qualified,injection_flags,received_at) VALUES (?,?,?,?,?,?,?,?,?)')
    .run(tenant, lead ? R.getLead(lead.id).company_id : null, lead ? lead.id : null, channel, JSON.stringify(daten), JSON.stringify(c), c.qualified ? 1 : 0, JSON.stringify(c.injection_flags), now());
  const id = Number(r.lastInsertRowid);
  R.log('inquiry', id, 'eingegangen', { leistung: daten.leistung, qualified: c.qualified, b2b: c.b2b, flags: c.injection_flags });
  let notified = false;
  if (c.qualified) {
    const res = notify(db, tenant, c.b2b ? 'interessierter_kunde' : 'qualifizierte_anfrage', {
      key: 'inquiry-' + id,
      subject: `${c.urgent ? 'DRINGEND – ' : ''}Neue Anfrage: ${daten.leistung} (${daten.ort || 'Ort offen'})`,
      body: `Referenz: ${id}\nLeistung: ${daten.leistung}\nAuftrag: ${daten.auftrag || '–'}\nOrt: ${daten.ort || '–'}\nFirma: ${daten.firma || '–'}\nKlassifizierung: ${c.b2b ? 'Geschäftskunde' : 'Privat'}${c.recurring ? ', wiederkehrend' : ''}${c.urgent ? ', dringend' : ''}\n${c.injection_flags.length ? 'ACHTUNG: verdächtige Muster im Text: ' + c.injection_flags.join(', ') + '\n' : ''}\nDetails (inkl. Kontaktdaten) in ReadyOps → Anfragen.`
    });
    notified = res.some(x => x.created);
    if (c.urgent) notify(db, tenant, 'dringende_frist', { key: 'inquiry-' + id, subject: 'Dringende Anfrage ' + id, body: 'Die Anfrage ' + id + ' enthält Dringlichkeitshinweise. Bitte zeitnah prüfen.' });
  }
  // «notified» bedeutet: interne Meldung angelegt (Zustellung als Gmail-Entwurf/Übergabe, siehe EMAIL-ROUTING.md)
  return { ok: true, id, qualified: c.qualified, lead_id: lead ? lead.id : null, notification_queued: notified, notified: false };
}
module.exports = { validate, classify, receive, SERVICES };
