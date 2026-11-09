'use strict';
// ImmoReady-Pilot: Immobilienverwaltungen/Bewirtschafter in ZH/AG recherchieren, Website verifizieren, bewerten.
// Ausgabe NUR nach data/leads/ (gitignoriert). Keine Kontaktaufnahme, keine Formularübermittlung.
const fs = require('node:fs');
const path = require('node:path');
const { politeGet, sleep } = require('../src/research/fetch');
const { parseSearchCh, dec } = require('../src/research/directory');
const { score } = require('../src/scoring');
const { recommendChannel } = require('../src/compliance');
const { domainOf, nameKey } = require('../src/dedupe');

const TOWNS = (process.env.TOWNS || 'Baden,Aarau,Wettingen,Brugg,Lenzburg,Wohlen AG,Zofingen,Dietikon,Winterthur,Uster,Wetzikon,Bülach,Dübendorf,Horgen,Schlieren,Kloten,Rheinfelden,Zürich,Affoltern am Albis,Meilen,Thalwil,Wädenswil,Adliswil,Regensdorf,Spreitenbach,Mellingen,Bremgarten AG,Muri AG,Frick,Aarburg,Oftringen,Suhr,Buchs AG,Wallisellen,Volketswil,Illnau-Effretikon,Pfäffikon ZH,Hinwil,Rüti ZH,Stäfa,Männedorf,Opfikon,Dielsdorf,Andelfingen').split(',');
const RUBRIKEN = (process.env.RUBRIKEN || 'Liegenschaftsverwaltung,Immobilienverwaltung').split(',');
const RUBRIK = RUBRIKEN.join('/');
const OUT = path.join(__dirname, '..', 'data', 'leads');
const TARGET = Number(process.env.TARGET || 50);
const FIT = /(liegenschafts|immobilien)verwaltung|bewirtschaftung|verwaltung|immobilien.?treuhand|stockwerk/i;
const COMPETITOR = /hauswart|reinigung|facility|gartenbau|unterhaltsdienst/i;

function slug(s) { return s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/[^a-z0-9]+/g, '-'); }
function textOf(html) { return dec(String(html).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')).slice(0, 200000); }

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const started = new Date().toISOString();
  const seen = new Map(); const excluded = [];
  for (const town of TOWNS) for (const rub of RUBRIKEN) {
    const url = `https://search.ch/tel/${encodeURIComponent(town)}/${encodeURIComponent(rub)}`;
    const r = await politeGet(url, { delayMs: 4000 }).catch(e => ({ error: e.message }));
    if (!r || r.skipped || r.error || r.status !== 200) { console.log('Verzeichnis übersprungen', town, r && (r.skipped || r.error || r.status)); continue; }
    const entries = parseSearchCh(r.body, url);
    console.log(`${town}/${rub}: ${entries.length} Einträge`);
    for (const e of entries) {
      const key = domainOf(e.website) || nameKey(e.name);
      if (seen.has(key)) continue;
      if (!['ZH', 'AG'].includes(e.region)) { excluded.push({ name: e.name, reason: 'ausserhalb ZH/AG: ' + e.region }); continue; }
      if (e.no_advertising) { excluded.push({ name: e.name, reason: 'Sterneintrag: wünscht keine Werbung (UWG Art. 3 Abs. 1 lit. u)' }); seen.set(key, null); continue; }
      const cat = `${e.categories || ''} ${e.occupation || ''}`;
      if (!FIT.test(cat)) { excluded.push({ name: e.name, reason: 'Rubrik passt nicht: ' + cat }); continue; }
      if (COMPETITOR.test(cat) && !/verwaltung|bewirtschaftung/i.test(e.occupation || '')) { excluded.push({ name: e.name, reason: 'eigener Hauswart-/Reinigungsbetrieb (Mitbewerber)' }); continue; }
      seen.set(key, { ...e, town_query: town });
    }
  }
  const cands = [...seen.values()].filter(Boolean);
  console.log('Kandidaten nach Verzeichnis:', cands.length);

  const leads = [];
  for (const c of cands) {
    const at = new Date().toISOString();
    const lead = { company: { name: c.name, website: c.website, phone: c.phone, address: c.street ? `${c.street}, ${c.zip} ${c.locality}` : null, locality: c.locality, canton: c.region, segment: 'immobilienverwaltung', industry: c.occupation || c.categories },
      sources: [{ url: c.source, note: 'search.ch Verzeichniseintrag (Rubrik ' + RUBRIK + ')', retrieved_at: at }], verification: 'unverifiziert', site: null };
    if (c.website) c.website = c.website.replace(/^http:\/\//, 'https://'); // Proxy/Sicherheit: nur HTTPS
    lead.company.website = c.website;
    if (lead.company.address) lead.verification = 'verzeichnis';
    if (c.website) {
      const r = await politeGet(c.website, { delayMs: 2000, timeoutMs: 15000 }).catch(e => ({ error: e.message }));
      if (r && r.status === 200) {
        const t = textOf(r.body);
        const tokens = nameKey(c.name).split(' ').filter(w => w.length > 3);
        const nameOk = tokens.length ? tokens.some(w => nameKey(t).includes(w)) : false;
        lead.site = {
          final_url: r.url, name_on_site: nameOk,
          bewirtschaftung: /bewirtschaftung|liegenschaftsverwaltung|immobilienverwaltung|mietliegenschaft/i.test(t),
          stwe: /stockwerkeigentum|stweg|stwe\b/i.test(t), mfh: /mehrfamilienh|wohnüberbauung|überbauung/i.test(t),
          eigener_hauswartdienst: /(unser|eigene[nr]?) (hauswart|hauswartung|hausdienst)/i.test(t), kontaktformular: /<form\b/i.test(r.body),
          kontakt_email_vorhanden: /mailto:/i.test(r.body)
        };
        lead.sources.push({ url: r.url, note: 'Firmenwebsite (Startseite) abgerufen', retrieved_at: at });
        if (nameOk && lead.site.bewirtschaftung) lead.verification = 'verifiziert';
        else if (nameOk) lead.verification = 'teilweise';
      } else lead.site = { error: (r && (r.skipped || r.error || r.status)) || 'kein Abruf' };
    }
    const sc = score('immoready', { segment: 'immobilienverwaltung', canton: c.region, portfolio_hint: !!(lead.site && (lead.site.stwe || lead.site.mfh)), address: lead.company.address, phone: c.phone,
      official_source: true, has_inhouse_facility: !!(lead.site && lead.site.eigener_hauswartdienst), verification: lead.verification });
    const ch = recommendChannel({ hasPostalAddress: !!lead.company.address, hasContactForm: !!(lead.site && lead.site.kontaktformular), hasPhone: !!c.phone });
    const need = ['Hauswartung', 'Reinigung', 'Gartenunterhalt', 'Leerstandsaufbereitung'];
    const reasons = [`Eingetragen als ${c.occupation || c.categories} in ${c.locality} ${c.region}`];
    if (lead.site && lead.site.bewirtschaftung) reasons.push('Website nennt Bewirtschaftung/Verwaltung von Liegenschaften');
    if (lead.site && lead.site.stwe) reasons.push('Website nennt Stockwerkeigentum');
    if (lead.site && lead.site.mfh) reasons.push('Website nennt Mehrfamilienhäuser/Überbauungen');
    if (lead.site && lead.site.eigener_hauswartdienst) reasons.push('Hinweis auf eigenen Hauswartdienst (Bedarf ggf. nur als Vertretung/Spitzen)');
    let personal = null;
    if (lead.site && lead.site.stwe && lead.site.bewirtschaftung) personal = 'Da Sie neben Mietliegenschaften auch Stockwerkeigentum betreuen, könnten wir Sie etwa bei der Hauswartung einzelner Gemeinschaften, bei Reinigungen oder beim Gartenunterhalt entlasten.';
    else if (lead.site && lead.site.mfh) personal = 'Gerade bei Mehrfamilienhäusern unterstützen wir gerne bei Hauswartung, Treppenhausreinigung, Gartenpflege oder bei der Aufbereitung von Wohnungen zwischen zwei Mietverhältnissen.';
    leads.push({ ...lead, need: need.join(', '), fit_reason: reasons.join('; '), score: sc.score, score_detail: sc.detail, channel: ch.channel, channel_reason: ch.reason, personal_line: personal,
      est_value_chf: null, researched_at: at });
    process.stdout.write('.');
  }
  leads.sort((a, b) => b.score - a.score);
  const picked = leads.slice(0, TARGET);
  const file = path.join(OUT, `immoready-pilot-${started.slice(0, 10)}.json`);
  fs.writeFileSync(file, JSON.stringify({ started, finished: new Date().toISOString(), rubrik: RUBRIK, towns: TOWNS, candidates: cands.length, total_scored: leads.length, picked: picked.length, excluded, leads: picked, rest: leads.slice(TARGET) }, null, 1), { mode: 0o600 });
  const v = picked.filter(l => l.verification === 'verifiziert').length;
  console.log(`\nGespeichert: ${file}\nAusgewählt ${picked.length} (verifiziert ${v}, teilweise ${picked.filter(l => l.verification === 'teilweise').length}), ausgeschlossen ${excluded.length} (davon Sterneintrag ${excluded.filter(x => /Stern/.test(x.reason)).length})`);
})();
