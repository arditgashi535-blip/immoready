// t24 – Fertigstellung Inhalte (Masterprompt «Familienbetrieb»)
//  · WSF aus aktuellen Inhalten, Metadaten und Builds entfernt (sichtbarer Text, Titel, Beschreibungen, rise.json)
//  · eigenständiger Abschnitt «Einsatzgebiet» entfernt; Zürich und Aargau im Einstieg, Kontakt und Footer
//  · Startseite in der verlangten Reihenfolge; Rundgang optional (Abschnitt 6), h1 im Foto-Einstieg
//  · Familienbetrieb auf Start- und Über-uns-Seite; Ardit Gashi sichtbar, kein künstliches Porträt
//  · Karrierebanner: mailto mit Betreff, Hinweis auf E-Mail-Programm, keine Stellen, nicht im Offertformular; Footer-Link
//  · Bildzuordnung: jede Bildfläche aus rise.json → assets.photos, Übergangsbilder als «Symbolbild (KI)» gekennzeichnet
//  · Leistungsseiten beantworten Was / Für wen / Welche Angaben / Wie weiter
//  · Formular: Erfolg in Stufen (übermittelt, gespeichert, Benachrichtigung nur wenn bestätigt)
// Aufruf: node tests/t24-inhalte.js
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const url = 'file://' + path.join(ROOT, 'dist/immoready-vorschau.html');
const RISE = JSON.parse(fs.readFileSync(path.join(ROOT, 'rise.json'), 'utf8'));
const log = []; const ok = (c, m) => log.push((c ? 'PASS ' : 'FAIL ') + m);
const ROUTES = ['start', 'leistungen', 'hauswartung', 'sanitaer', 'gartenunterhalt', 'reinigung', 'raeumung', 'leerstand', 'verkauf', 'fotografie', 'verwaltungen', 'ueber', 'kontakt', 'offerte', 'impressum', 'datenschutz'];
const SERVICES = ['hauswartung', 'sanitaer', 'gartenunterhalt', 'reinigung', 'raeumung', 'leerstand', 'verkauf', 'fotografie'];
const txt = () => document.body.innerText.replace(/­/g, '');
/* Text ohne eingebettete Bilddaten (Base64 enthält zufällig jede Buchstabenfolge) */
const plain = f => fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/data:[a-z/+-]+;base64,[A-Za-z0-9+/=]+/g, '');
(async () => {
  /* 1 WSF: Quelle und Builds */
  ok(!JSON.stringify(RISE.firm).includes('WSF') && RISE.firm.qualifications.join() === 'Fachmann Betriebsunterhalt EFZ', 'rise.json: nur «Fachmann Betriebsunterhalt EFZ»');
  const builds = ['dist/immoready-vorschau.html', 'dist/site/index.html', 'dist/site/site.js', 'dist/component/immoready-tour.js'];
  const wsf = builds.filter(f => /WSF|Facility Services Specialist/.test(plain(f)));
  ok(wsf.length === 0, 'Builds ohne WSF (Text, Metadaten, Skript)' + (wsf.length ? ': ' + wsf.join(', ') : ''));
  const srcHits = ['src/p1.html', 'src/p2.html', 'src/p3a.html', 'src/p3b.html'].filter(f => /WSF|Facility Services Specialist/.test(plain(f)));
  ok(srcHits.length === 0, 'Quellcode der Seite ohne WSF');

  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const p = await b.newPage({ viewport: { width: 1280, height: 860 } });
  await p.addInitScript(() => { try { localStorage.setItem('ir-review', '0'); } catch (e) {} });
  const hits = [], metas = [];
  for (const r of ROUTES) {
    await p.goto(url + '#' + r); await p.waitForTimeout(200);
    const t = await p.evaluate(txt);
    if (/WSF|Facility Services/.test(t)) hits.push(r);
    const m = await p.evaluate(() => document.title + ' ' + (document.querySelector('meta[name=description]') || {}).content);
    if (/WSF|Facility Services/.test(m)) metas.push(r);
  }
  ok(hits.length === 0, 'sichtbarer Text auf 16 Seiten ohne WSF' + (hits.length ? ': ' + hits.join(', ') : ''));
  ok(metas.length === 0, 'Seitentitel und Beschreibungen ohne WSF');

  /* 2 Einsatzgebiet und Reihenfolge der Startseite */
  await p.goto(url); await p.waitForTimeout(400);
  const st = await p.evaluate(() => {
    const pg = document.querySelector('[data-page="start"]');
    const secs = Array.from(pg.children).filter(e => e.tagName === 'SECTION').map(e => e.id || e.className.split(' ')[0]);
    return { secs, region: !!pg.querySelector('#h-region, .region-wrap'), h1: Array.from(document.querySelectorAll('h1')).filter(h => h.offsetParent).map(h => h.closest('section').id),
      nums: Array.from(pg.querySelectorAll('p.num span')).map(s => s.textContent),
      hero: ((document.querySelector('#einstieg') || {}).textContent || '').replace(/\u00ad/g, '').replace(/\s+/g, ' '), foot: document.querySelector('.ftr').innerText, finale: document.querySelector('#anfrage').innerText };
  });
  const want = ['einstieg', 'leistungswelt', 'leistungen-start', 'sanitaer-start', 'familienbetrieb', 'reise', 'ablauf', 'karriere'];
  const idx = want.map(id => st.secs.indexOf(id));
  ok(idx.every((v, i) => v >= 0 && (i === 0 || v > idx[i - 1])), 'Startseite: Einstieg → Leistungen → Hauswartung → Sanitär → Familienbetrieb → Rundgang → Ablauf → Karriere (' + st.secs.join(' · ') + ')');
  ok(st.secs.indexOf('anfrage') > st.secs.indexOf('karriere') && st.secs[st.secs.length - 1] === 'anfrage', 'Häufige Fragen und Kontakt/Offerte am Schluss');
  ok(!st.region && !/Einsatzgebiet/.test(st.secs.join()), 'eigenständiger Abschnitt «Einsatzgebiet» entfernt');
  ok(JSON.stringify(st.nums) === JSON.stringify(['01', '02', '03', '04', '05', '06', '07']), 'Nummerierung lückenlos 01–07 (' + st.nums.join(',') + ')');
  ok(/Zürich und Aargau/.test(st.hero) && /Zürich/.test(st.foot) && /Aargau/.test(st.foot) && /Zürich und Aargau/.test(st.finale), 'Zürich und Aargau kompakt im Einstieg, Kontaktbereich und Footer');
  ok(st.h1.length === 1 && st.h1[0] === 'einstieg', 'genau eine h1, im Foto-Einstieg');
  ok(/Ihre Liegenschaft\.\s*Unsere Verantwortung\./.test(st.hero) && /Ihr Familienbetrieb für Hauswartung, Sanitär und Unterhalt in Zürich und Aargau\./.test(st.hero) && /Offerte anfragen/.test(st.hero) && /Gebäude entdecken/.test(st.hero), 'Einstieg mit Überschrift, Beschreibung und zwei Aktionen');
  const tour = await p.evaluate(() => { const r = document.getElementById('reise'); return { h: r.querySelector('#h-hero').textContent, tag: r.querySelector('.jr-tag').textContent, skip: r.querySelector('.jr-skip-a').getAttribute('href') }; });
  ok(/Leistungen am Gebäude entdecken/.test(tour.h) && /Illustrative Visualisierung/.test(tour.tag) && tour.skip === '#ablauf', 'Rundgang: «Leistungen am Gebäude entdecken», als Illustration gekennzeichnet, «Tour überspringen» führt zum Ablauf');

  /* 3 Familienbetrieb */
  const fam = await p.evaluate(() => document.getElementById('familienbetrieb').innerText.replace(/­/g, ''));
  ok(/Ein Familienbetrieb\. Persönlich für Sie da\./.test(fam) && /Ardit Gashi/.test(fam) && /Fachmann Betriebsunterhalt EFZ/.test(fam), 'Startseite: Familienbetrieb mit Ardit Gashi und EFZ');
  ok(await p.evaluate(() => !document.querySelector('#familienbetrieb img')), 'kein künstliches Porträt im Familienbereich');
  await p.goto(url + '#ueber'); await p.waitForTimeout(300);
  const ue = await p.evaluate(() => document.querySelector('[data-page="ueber"]').innerText.replace(/­/g, ''));
  ok(/Familienbetrieb/.test(ue) && /Ardit Gashi/.test(ue) && !/Inhaber/.test(ue), 'Über uns: Familienbetrieb, Ansprechpartner ohne unbestätigte Funktion');

  /* 4 Karriere */
  await p.goto(url + '#karriere'); await p.waitForTimeout(500);
  const ca = await p.evaluate(() => { const s = document.getElementById('karriere'), a = s.querySelector('a[data-career]'); return { t: s.textContent.replace(/\u00ad/g, '').replace(/\s+/g, ' '), href: a.getAttribute('href'), pre: a.hasAttribute('data-pre'), vis: !!s.offsetParent, top: s.getBoundingClientRect().top, hdr: document.querySelector('.hdr').getBoundingClientRect().bottom }; });
  ok(ca.vis && /Arbeiten bei ImmoReady/.test(ca.t) && /Gemeinsam anpacken\./.test(ca.t) && /Initiativ bewerben/.test(ca.t), 'Karrierebanner mit Überzeile, Überschrift und Knopf');
  ok(ca.href === 'mailto:info.immoready@gmail.com?subject=' + encodeURIComponent('Initiativbewerbung ImmoReady') && !ca.pre, 'Knopf: E-Mail an info.immoready@gmail.com mit Betreff, nicht als Offertanfrage');
  ok(/öffnet Ihr E-Mail-Programm/.test(ca.t) && !/Pensum|Lohn|%|Stelle als/.test(ca.t), 'Hinweis auf E-Mail-Programm, keine erfundenen Stellen, Pensen oder Löhne');
  ok(ca.top >= ca.hdr - 1, 'Anker #karriere landet unter dem Kopf');
  const before = await p.evaluate(() => document.getElementById('result') ? document.getElementById('result').hidden : true);
  await p.evaluate(() => document.querySelector('#karriere a[data-career]').addEventListener('click', e => e.preventDefault(), { once: true }));
  await p.click('#karriere a[data-career]'); await p.waitForTimeout(300);
  const after = await p.evaluate(() => ({ h: location.hash, res: document.getElementById('result') ? document.getElementById('result').hidden : true, sel: (document.querySelector('#formRoot input[name="leistung"]:checked') || {}).value || null }));
  ok(after.h === '#karriere' && after.res === before && !after.sel, 'Klick auf «Initiativ bewerben»: keine Versandbestätigung, kein Wechsel ins Offertformular');
  ok(await p.evaluate(() => Array.from(document.querySelectorAll('.ftr a')).some(a => a.getAttribute('href') === '#karriere' && /Karriere/.test(a.textContent))), 'Footer-Link «Karriere»');

  /* 5 Bildzuordnung */
  await p.goto(url); await p.waitForTimeout(400);
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 30)); } });
  const img = await p.evaluate(() => Array.from(document.querySelectorAll('img.ph')).map(i => ({ slot: i.dataset.slot, tag: (i.nextElementSibling && i.nextElementSibling.classList.contains('ph-tag')) ? i.nextElementSibling.textContent : '', alt: i.alt })));
  const slots = RISE.assets.photos.slots;
  const byId = Object.fromEntries(slots.map(s => [s.id, s]));
  const bad = img.filter(i => !byId[i.slot] || (byId[i.slot].status === 'ki-symbolbild' && i.tag !== 'Symbolbild (KI)') || !/Symbolbild/.test(i.alt) && byId[i.slot].status !== 'eigen');
  ok(img.length >= 5 && bad.length === 0, 'Startseite: ' + img.length + ' Bilder, alle einer Bildfläche zugeordnet und als Symbolbild (KI) gekennzeichnet' + (bad.length ? ' – ' + JSON.stringify(bad.slice(0, 3)) : ''));
  ok(await p.evaluate(() => { const i = document.querySelector('#einstieg img.ph'); return !!i && i.dataset.slot === 'hero' && i.complete && i.naturalWidth > 0; }), 'Einstieg zeigt die Bildfläche «hero» (geladen)');
  ok(slots.every(s => s.motive && s.alt && s.status && 'license' in s && 'credit' in s && 'source' in s), 'rise.json: jede Bildfläche mit Motiv, Alternativtext, Status, Quelle, Lizenz und Bildnachweis');
  ok(slots.find(s => s.id === 'portraet').status === 'fehlt', 'Porträt: nur eigenes Foto vorgesehen, derzeit offen');

  /* 6 Leistungsseiten: Was / Für wen / Angaben / Weiter */
  const svcBad = [];
  for (const k of SERVICES) {
    await p.goto(url + '#' + k); await p.waitForTimeout(150);
    const t = await p.evaluate(() => document.getElementById('leistungPage').innerText.replace(/­/g, ''));
    if (!(/Was wir übernehmen/.test(t) && /Geeignet für/i.test(t) && /Das hilft bei Ihrer Anfrage/i.test(t) && /So geht es weiter/i.test(t))) svcBad.push(k);
  }
  ok(svcBad.length === 0, '8 Leistungsseiten mit «Was wir übernehmen», «Geeignet für», «Das hilft bei Ihrer Anfrage», «So geht es weiter»' + (svcBad.length ? ' (fehlt: ' + svcBad.join(', ') + ')' : ''));
  const unb = [];
  /* Datenschutz ausgenommen: «Garantien» ist dort ein Rechtsbegriff (Datenübermittlung), kein Werbeversprechen */
  for (const r of ROUTES.filter(x => x !== 'datenschutz')) { await p.goto(url + '#' + r); await p.waitForTimeout(120); if (/24\/7|rund um die Uhr|Garantie|höchste Qualität|beste Preise|massgeschneidert/i.test(await p.evaluate(txt))) unb.push(r); }
  ok(unb.length === 0, 'keine Floskeln oder unbelegten Versprechen (24/7, Garantie, höchste Qualität, beste Preise, massgeschneidert)' + (unb.length ? ': ' + unb.join(', ') : ''));

  /* 7 Formular: Stufen der Bestätigung (simulierte Antwort des Dienstes) */
  const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, PUT, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
  for (const [notified, n] of [[false, 2], [true, 3]]) {
    const q = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await q.addInitScript(() => { let r; Object.defineProperty(window, 'IR_RISE', { configurable: true, get() { return r; }, set(v) { v.formEndpoint = 'https://formtest.example/_functions'; r = v; } }); });
    await q.route(/^https:\/\/formtest\.example\//, r => r.request().method() === 'OPTIONS' ? r.fulfill({ status: 204, headers: CORS }) : r.fulfill({ status: 200, contentType: 'application/json', headers: CORS, body: JSON.stringify({ ok: true, id: 'T-1', notified }) }));
    await q.goto(url + '#offerte'); await q.waitForTimeout(900);
    await q.locator('#fs_leistung .opt', { hasText: 'Hauswartung' }).first().click();
    await q.fill('#ort', '8000 Zürich'); await q.fill('#beschreibung', 'Testanfrage für die Stufenanzeige der Bestätigung.'); await q.fill('#name', 'Test Person'); await q.fill('#email', 'test@beispiel.ch');
    await q.evaluate(() => document.activeElement && document.activeElement.blur());
    await q.click('#next'); await q.waitForFunction(() => { const r = document.getElementById('result'); return r && !r.hidden; }, null, { timeout: 10000 }).catch(() => {});
    const res = await q.evaluate(() => { const r = document.getElementById('result'); return r && !r.hidden ? Array.from(r.querySelectorAll('.rstat li')).map(l => l.dataset.state) : null; });
    ok(res && res.length === n && res[0] === 'sent' && res[1] === 'stored' && (notified ? res[2] === 'notified' : !res.includes('notified')), 'Bestätigung ' + (notified ? 'mit' : 'ohne') + ' bestätigte(r) Benachrichtigung: ' + JSON.stringify(res));
    await q.close();
  }
  await b.close();
  log.forEach(l => console.log(l));
  const f = log.filter(l => l.startsWith('FAIL')).length;
  console.log('\nt24: ' + (log.length - f) + '/' + log.length + ' bestanden');
  process.exitCode = f ? 1 : 0;
})();
