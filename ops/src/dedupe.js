'use strict';
// Normalisierung für die Duplikaterkennung von Firmen (Domain > Telefon > Firmenname).
const LEGAL = /\b(ag|gmbh|sa|sàrl|sarl|kg|klg|ag\.|gmbh\.|immobilien|immobilienverwaltung|verwaltung|liegenschaften|treuhand|und|&|co|cie)\b/g;

function domainOf(url) {
  if (!url) return null;
  let s = String(url).trim().toLowerCase();
  if (!/^[a-z]+:\/\//.test(s)) s = 'https://' + s;
  try { return new URL(s).hostname.replace(/^www\d?\./, '') || null; } catch { return null; }
}
function nameKey(name) {
  return String(name || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(LEGAL, ' ').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}
// Schweizer Nummern auf +41… vereinheitlichen
function phoneKey(p) {
  if (!p) return null;
  let d = String(p).replace(/[^\d+]/g, '');
  if (d.startsWith('00')) d = '+' + d.slice(2);
  if (d.startsWith('0')) d = '+41' + d.slice(1);
  if (!d.startsWith('+')) d = '+' + d;
  return d.length >= 11 ? d : null;
}
module.exports = { domainOf, nameKey, phoneKey };
