'use strict';
// Ready-Studio-Pilot: KMU-Websites (Handwerk, Reinigung, Gartenbau, Hauswartung, Coiffeur, Beauty) finden und schonend prüfen.
// Nur Einträge mit eigener Website und ohne Sterneintrag. Ausgabe nur nach data/leads/ (gitignoriert).
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const { politeGet } = require('../src/research/fetch');
const { parseSearchCh } = require('../src/research/directory');
const { auditSite } = require('../src/audit/site-audit');
const { score } = require('../src/scoring');
const { recommendChannel } = require('../src/compliance');
const { domainOf } = require('../src/dedupe');

const OUT = path.join(__dirname, '..', 'data', 'leads');
const TARGET = Number(process.env.TARGET || 50);
const PLAN = process.env.PLAN_JSON ? JSON.parse(process.env.PLAN_JSON) : [
  ['coiffeur', 'Coiffeur', 'Baden,Aarau,Winterthur,Uster,Wettingen,Dietikon,Lenzburg,Brugg'],
  ['beauty', 'Nagelstudio', 'Baden,Aarau,Winterthur,Zürich'],
  ['beauty', 'Kosmetik', 'Baden,Aarau,Wohlen AG,Bülach'],
  ['reinigung', 'Reinigung', 'Baden,Aarau,Winterthur,Dietikon,Wetzikon'],
  ['gartenbau', 'Gartenbau', 'Baden,Aarau,Lenzburg,Uster,Horgen'],
  ['hauswartung', 'Hauswartung', 'Zürich,Winterthur,Baden,Aarau'],
  ['handwerk', 'Malergeschäft', 'Baden,Aarau,Winterthur,Wettingen'],
  ['handwerk', 'Sanitär', 'Baden,Aarau,Dietikon,Uster'],
  ['handwerk', 'Elektroinstallationen', 'Baden,Wohlen AG,Bülach']
];
const MAX_AUDITS = Number(process.env.MAX_AUDITS || 75);

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const started = new Date().toISOString();
  const cands = new Map(); const excluded = [];
  // bereits geprüfte Domains früherer Läufe überspringen
  const skip = new Set((process.env.SKIP_FILES || '').split(',').filter(Boolean).flatMap(f => JSON.parse(fs.readFileSync(f, 'utf8')).audited_all.map(l => domainOf(l.company.website))));
  if (process.env.REAUDIT_FILE) {
    for (const l of JSON.parse(fs.readFileSync(process.env.REAUDIT_FILE, 'utf8')).audited_all) {
      const m = (l.company.address || '').match(/^(.*), (\d{4}) (.+)$/) || [];
      cands.set(domainOf(l.company.website), { name: l.company.name, website: l.company.website, phone: l.company.phone, street: m[1] || null, zip: m[2] || null, locality: l.company.locality,
        region: l.company.canton, segment: l.company.segment, occupation: l.company.industry, rubrik: (l.sources[0].note.match(/\((.+)\)/) || [])[1] || l.company.segment, source: l.sources[0].url });
    }
  }
  for (const [segment, rub, towns] of (process.env.REAUDIT_FILE ? [] : PLAN)) for (const town of towns.split(',')) {
    const url = `https://search.ch/tel/${encodeURIComponent(town)}/${encodeURIComponent(rub)}`;
    const r = await politeGet(url, { delayMs: 4000 }).catch(e => ({ error: e.message }));
    if (!r || r.status !== 200) { console.log('übersprungen', town, rub, r && (r.skipped || r.error || r.status)); continue; }
    const es = parseSearchCh(r.body, url);
    let n = 0;
    for (const e of es) {
      const d = domainOf(e.website);
      if (e.no_advertising) { excluded.push({ name: e.name, reason: 'Sterneintrag (keine Werbung)' }); continue; }
      if (!['ZH', 'AG'].includes(e.region)) { excluded.push({ name: e.name, reason: 'ausserhalb ZH/AG' }); continue; }
      if (!d) { excluded.push({ name: e.name, reason: 'keine eigene Website im Verzeichnis' }); continue; }
      if (/(facebook|instagram|local\.ch|search\.ch|wix\.com|google)/.test(d)) { excluded.push({ name: e.name, reason: 'keine eigene Domain: ' + d }); continue; }
      if (cands.has(d) || skip.has(d)) continue;
      cands.set(d, { ...e, segment, rubrik: rub, website: e.website.replace(/^http:\/\//, 'https://') }); n++;
    }
    console.log(`${town}/${rub}: ${es.length} Einträge, ${n} neu mit Website`);
  }
  console.log('Kandidaten mit Website:', cands.size);
  // Gleichmässig über Segmente verteilen, dann prüfen
  const bySeg = {}; for (const c of cands.values()) (bySeg[c.segment] = bySeg[c.segment] || []).push(c);
  const order = []; let i = 0;
  while (order.length < Math.min(MAX_AUDITS, cands.size)) { for (const s of Object.keys(bySeg)) if (bySeg[s][i]) order.push(bySeg[s][i]); i++; if (i > 500) break; }
  const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
  const leads = [];
  try {
    for (const c of order.slice(0, MAX_AUDITS)) {
      const a = await auditSite(browser, c.website).catch(e => ({ reachable: false, error: e.message, findings: [] }));
      const high = a.findings.filter(f => f.severity === 'hoch').length, med = a.findings.filter(f => f.severity === 'mittel').length;
      const sc = score('readystudio', { segment: c.segment, canton: c.region, findings_high: high, findings_medium: med, contact_form: a.contact_form, mobile_ok: a.mobile_ok,
        address: c.street, phone: c.phone, reachable: a.reachable, verification: a.reachable ? 'verifiziert' : 'unverifiziert' });
      const ch = recommendChannel({ hasPostalAddress: !!c.street, hasContactForm: !!a.contact_form, hasPhone: !!c.phone });
      leads.push({
        company: { name: c.name, website: c.website, phone: c.phone, address: c.street ? `${c.street}, ${c.zip} ${c.locality}` : null, locality: c.locality, canton: c.region, segment: c.segment, industry: c.occupation || c.categories },
        sources: [{ url: c.source, note: 'search.ch Verzeichniseintrag (' + c.rubrik + ')', retrieved_at: started }, ...(a.final_url ? [{ url: a.final_url, note: 'Startseite geprüft (Handy 390 px)', retrieved_at: a.measured_at }] : [])],
        verification: a.reachable ? 'verifiziert' : 'unverifiziert', score: sc.score, score_detail: sc.detail, channel: ch.channel, channel_reason: ch.reason,
        need: (a.services || []).join(', ') || 'keine belegten Verbesserungen', fit_reason: `${c.occupation || c.rubrik} in ${c.locality} ${c.region}; ${high} hohe / ${med} mittlere Befunde`,
        findings: a.findings, improvements: a.improvements || [], services: a.services || [], audit: { reachable: a.reachable, status: a.status, skipped: a.skipped, error: a.error, load_ms: a.load_ms, mobile_ok: a.mobile_ok, contact_form: a.contact_form, generator: a.generator, title: a.title },
        researched_at: a.measured_at || started
      });
      process.stdout.write(a.reachable ? '.' : 'x');
    }
  } finally { await browser.close(); }
  // relevant = mindestens ein hoher oder zwei mittlere belegte Befunde
  const relevant = leads.filter(l => l.audit.reachable && (l.findings.some(f => f.severity === 'hoch') || l.findings.filter(f => f.severity === 'mittel').length >= 2)).sort((a, b) => b.score - a.score);
  const file = path.join(OUT, `readystudio-pilot-${started.slice(0, 10)}${process.env.OUT_SUFFIX || ''}.json`);
  fs.writeFileSync(file, JSON.stringify({ started, finished: new Date().toISOString(), plan: PLAN, candidates: cands.size, audited: leads.length, reachable: leads.filter(l => l.audit.reachable).length,
    relevant: relevant.length, excluded_count: excluded.length, excluded_star: excluded.filter(x => /Stern/.test(x.reason)).length, leads: relevant.slice(0, TARGET), audited_all: leads }, null, 1), { mode: 0o600 });
  console.log(`\nGespeichert: ${file}\nGeprüft ${leads.length}, erreichbar ${leads.filter(l => l.audit.reachable).length}, relevant ${relevant.length}, ausgeschlossen ${excluded.length} (Stern ${excluded.filter(x => /Stern/.test(x.reason)).length})`);
})();
