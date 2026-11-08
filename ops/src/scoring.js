'use strict';
// Lead-Score 0–100 mit nachvollziehbaren Teilpunkten (score_detail). Nur aus belegten Merkmalen.
const RULES = {
  immoready: [
    ['segment_verwaltung', 30, l => ['immobilienverwaltung', 'bewirtschaftung', 'stwe-verwaltung'].includes(l.segment)],
    ['segment_eigentuemer', 20, l => ['eigentuemer_mfh', 'investor', 'bauunternehmen'].includes(l.segment)],
    ['region_kern', 20, l => ['ZH', 'AG'].includes(l.canton)],
    ['region_nah', 8, l => ['ZG', 'SO', 'LU', 'SH', 'TG', 'BL'].includes(l.canton)],
    ['bestand_belegt', 15, l => !!l.portfolio_hint],
    ['kontakt_belegt', 10, l => !!(l.address || l.phone || l.contact_form)],
    ['quelle_offiziell', 10, l => !!l.official_source],
    ['eigene_hauswartung', -15, l => !!l.has_inhouse_facility],
    ['unverifiziert', -10, l => l.verification !== 'verifiziert']
  ],
  readystudio: [
    ['branche_ziel', 20, l => ['handwerk', 'reinigung', 'gartenbau', 'hauswartung', 'coiffeur', 'beauty', 'dienstleistung'].includes(l.segment)],
    ['region_ch', 10, l => !!l.canton],
    ['befunde_hoch', 30, l => (l.findings_high || 0) >= 2],
    ['befunde_mittel', 15, l => (l.findings_high || 0) < 2 && (l.findings_medium || 0) >= 2],
    ['kein_formular', 10, l => l.contact_form === false],
    ['nicht_mobil', 15, l => l.mobile_ok === false],
    ['kontakt_belegt', 10, l => !!(l.address || l.phone || l.contact_form)],
    ['seite_nicht_erreichbar', -20, l => l.reachable === false],
    ['unverifiziert', -10, l => l.verification !== 'verifiziert']
  ]
};
function score(tenant, lead) {
  const detail = [];
  let s = 0;
  for (const [code, pts, fn] of RULES[tenant] || []) if (fn(lead)) { s += pts; detail.push({ code, pts }); }
  return { score: Math.max(0, Math.min(100, s)), detail };
}
module.exports = { score, RULES };
