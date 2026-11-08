'use strict';
// Anschreiben-Vorlagen. Regeln: Schweizer Hochdeutsch («ss»), Sie-Anrede, kurz und konkret.
// Keine erfundenen Referenzen, Kunden, Preise, Garantien, Zertifikate, Notdienst/24-7, keine Rechtsform
// «GmbH» für ImmoReady (in Gründung). Nur bestätigte Qualifikation: Fachmann Betriebsunterhalt EFZ.
const { OPT_OUT } = require('./compliance');
const { cleanText } = require('./sanitize');

const FORBIDDEN = [/\bgmbh\b/i, /24\s*\/\s*7|rund um die uhr|notdienst/i, /garantie|garantiert/i, /referenz(en|kunden)?\b(?! auf anfrage)/i, /zertifiziert|iso\s?9001/i, /marktführer|nr\.\s?1|bester?\b/i, /bewertung(en)?|sterne/i, /\bwsf\b/i, /unsicher|gehackt|geschäftsschädigend|katastroph/i];

function checkClaims(text) {
  return FORBIDDEN.filter(re => re.test(text)).map(re => re.source);
}

function salutation(contact) {
  if (contact && contact.name && contact.is_public_business && contact.salutation) return `${contact.salutation} ${contact.name.split(' ').slice(-1)[0]}`;
  return null;
}

function immoready(lead) {
  const c = lead.company;
  const contact = (lead.contacts || []).find(x => x.is_public_business);
  const anrede = salutation(contact);
  const region = c.locality ? `in ${c.locality} und Umgebung` : 'in den Kantonen Zürich und Aargau';
  const need = lead.need_text || 'Hauswartung, Reinigung, Gartenpflege und laufendem Liegenschaftsunterhalt';
  const subject = `Partner für Hauswartung und Liegenschaftsunterhalt ${c.canton === 'AG' ? 'im Aargau' : c.canton === 'ZH' ? 'im Raum Zürich' : 'in Zürich und Aargau'}`;
  const body = [
    anrede ? `Guten Tag ${anrede}` : 'Sehr geehrte Damen und Herren',
    '',
    `Ich wende mich an ${cleanText(c.name, 160)}, weil Sie Liegenschaften ${region} betreuen. Mein Name ist Ardit Gashi; mit ImmoReady, einem Familienbetrieb, übernehmen wir Arbeiten rund um ${need}.`,
    '',
    'Was wir für Verwaltungen übernehmen können:',
    '– Hauswartung und technischer Gebäudeunterhalt (Fachmann Betriebsunterhalt EFZ)',
    '– Treppenhaus-, Unterhalts- und Endreinigungen',
    '– Gartenunterhalt und Rückschnitt',
    '– Leerstandsaufbereitung und Kleinreparaturen',
    '– Immobilienfotografie für Ihre Vermarktung',
    '',
    lead.personal_line ? cleanText(lead.personal_line, 600) : 'Gerne würde ich in einem kurzen Gespräch erfahren, wo Sie bei Ihren Liegenschaften Unterstützung brauchen – etwa als Vertretung, für einzelne Objekte oder bei Leerständen.',
    '',
    'Wenn das für Sie interessant ist, erreichen Sie mich unter 076 340 44 01 oder info.immoready@gmail.com. Gerne erstelle ich Ihnen eine unverbindliche Offerte für ein konkretes Objekt.',
    '',
    'Freundliche Grüsse',
    'Ardit Gashi',
    'ImmoReady · Zürich und Aargau',
    'www.immoready.ch',
    '',
    OPT_OUT.immoready
  ].join('\n');
  return { subject, body };
}

function readystudio(lead) {
  const c = lead.company;
  const f = (lead.findings || []).filter(x => x.severity !== 'info').slice(0, 3);
  const subject = `Kurze Beobachtungen zu Ihrer Website ${c.domain || ''}`.trim();
  const obs = f.length ? f.map(x => `– ${x.text}`) : ['– (keine belegten Befunde – Entwurf nicht versenden)'];
  const body = [
    'Guten Tag',
    '',
    `Bei einem Besuch der Website von ${cleanText(c.name, 160)} sind mir ein paar Punkte aufgefallen, die sich mit überschaubarem Aufwand verbessern lassen (Prüfung am ${String((f[0] && f[0].measured_at) || new Date().toISOString()).slice(0, 10)}):`,
    '',
    ...obs,
    '',
    'Mögliche nächste Schritte:',
    ...(lead.improvements || []).slice(0, 3).map(x => `– ${x}`),
    '',
    'Ready Studio entwickelt Websites, Web-Apps und Automatisierungen für Schweizer KMU. Wenn Sie möchten, schicke ich Ihnen die Beobachtungen ausführlicher oder wir besprechen sie kurz am Telefon – unverbindlich.',
    '',
    'Freundliche Grüsse',
    'Ready Studio',
    'info.readystudio@gmail.com · readystudio.ch',
    '',
    OPT_OUT.readystudio
  ].join('\n');
  return { subject, body };
}

function compose(tenant, lead) {
  const r = tenant === 'immoready' ? immoready(lead) : readystudio(lead);
  r.claim_violations = checkClaims(r.subject + '\n' + r.body.replace(/Fachmann Betriebsunterhalt EFZ/, ''));
  return r;
}
module.exports = { compose, checkClaims, FORBIDDEN };
