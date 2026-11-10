// t30 – Prüfung der veröffentlichten Seite (oder einer lokalen Release-Fassung)
//  · 16 Routen × 390/768/1440/1920 px: genau eine H1, kein seitlicher Überlauf, keine JS-Fehler, keine 4xx/5xx-Ressourcen,
//    sichtbare Bilder geladen, Logo scharf und unverzerrt
//  · alle Links: Hash-Ziele existieren, tel:/mailto: korrekt, externe Links erreichbar (HEAD/GET)
//  · mobiles Menü: öffnen, Escape schliesst, Fokus zurück auf den Auslöser
//  · Barrierefreiheit: axe-core (WCAG 2.1 A/AA) je Route bei 390 und 1440 px – Befunde «serious»/«critical» = FAIL
//  · Inhalt ohne JavaScript (was Suchmaschinen zuerst sehen): H1 und Kontaktdaten im HTML
// Aufruf: IR_LIVE_URL=https://… node tests/t30-live.js   (ohne Variable: die Live-Adresse aus docs/VEROEFFENTLICHUNG.md)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const BASE = (process.env.IR_LIVE_URL || 'https://headless-nvjfhfnkngv-infoimmoready-140d.wix-site-host.com/').replace(/\/?$/, '/');
const ROUTES = ['start', 'leistungen', 'hauswartung', 'sanitaer', 'gartenunterhalt', 'reinigung', 'raeumung', 'leerstand', 'verkauf', 'fotografie', 'verwaltungen', 'ueber', 'kontakt', 'offerte', 'impressum', 'datenschutz'];
const WIDTHS = [[390, 844], [768, 1024], [1440, 900], [1920, 1080]];
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js', { paths: [path.resolve(__dirname, '..')] }), 'utf8');
const log = []; const ok = (c, m) => log.push((c ? 'PASS ' : 'FAIL ') + m);
const report = { axe: {}, links: {} };

(async () => {
  const b = await chromium.launch();
  /* 0 Ohne JavaScript */
  {
    const c = await b.newContext({ javaScriptEnabled: false }); const p = await c.newPage();
    await p.goto(BASE, { waitUntil: 'load' });
    const t = await p.evaluate(() => ({ h1: (document.querySelector('h1') || {}).textContent || '', body: document.body.innerText }));
    ok(/Liegenschaft/.test(t.h1) && /076 340 44 01/.test(t.body), 'ohne JavaScript: H1 und Telefonnummer im HTML (' + (t.h1 || 'keine H1').trim().slice(0, 40) + ')');
    await c.close();
  }
  for (const [w, h] of WIDTHS) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errs = [], bad = [];
    p.on('pageerror', e => errs.push(e.message));
    p.on('response', r => { if (r.status() >= 400 && !/\/_api\/|frog\.wix|panorama/.test(r.url())) bad.push(r.status() + ' ' + r.url().slice(0, 110)); });
    p.on('requestfailed', r => { if (!/frog\.wix|panorama|google-analytics/.test(r.url())) bad.push('FAILED ' + r.url().slice(0, 110) + ' ' + ((r.failure() || {}).errorText || '')); });
    await p.goto(BASE, { waitUntil: 'load' }); await p.waitForTimeout(2500);
    const issues = [];
    for (const r of ROUTES) {
      await p.evaluate(r => { location.hash = r; }, r); await p.waitForTimeout(350);
      const s = await p.evaluate(() => {
        const pg = document.querySelector('[data-page]:not([hidden])');
        const imgs = [...document.querySelectorAll('img')].filter(i => i.offsetParent && i.getBoundingClientRect().top < innerHeight && i.loading !== 'lazy');
        return { h1: pg ? pg.querySelectorAll('h1').length : 0, ov: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          broken: imgs.filter(i => i.complete && i.naturalWidth === 0).map(i => i.src.slice(-50)) };
      });
      if (s.h1 !== 1) issues.push(r + ': H1=' + s.h1);
      if (s.ov > 0) issues.push(r + ': Überlauf ' + s.ov + ' px');
      if (s.broken.length) issues.push(r + ': Bild fehlt ' + s.broken.join(','));
    }
    ok(issues.length === 0, w + ' px: 16 Routen mit genau einer H1, ohne Überlauf, Bilder geladen' + (issues.length ? ' – ' + issues.slice(0, 6).join(' | ') : ''));
    const L = await p.evaluate(() => { const i = document.querySelector('.logo img'); const r = i.getBoundingClientRect(); return { nw: i.naturalWidth, nh: i.naturalHeight, w: r.width, h: r.height }; });
    ok(L.nw > 0 && Math.abs(L.w / L.h - L.nw / L.nh) < 0.02 && L.nw >= 2 * L.w, w + ' px: Logo geladen, unverzerrt, scharf (' + Math.round(L.w) + ' px)');
    if (w === 390) {
      await p.evaluate(() => { location.hash = 'start'; scrollTo(0, 0); }); await p.waitForTimeout(300);
      await p.click('#burger'); await p.waitForTimeout(400);
      const open = await p.evaluate(() => document.getElementById('mnav').dataset.open === 'true' && document.getElementById('mnav').contains(document.activeElement));
      await p.keyboard.press('Escape'); await p.waitForTimeout(400);
      const closed = await p.evaluate(() => document.getElementById('mnav').dataset.open !== 'true' && document.activeElement && document.activeElement.id === 'burger');
      ok(open && closed, '390 px: mobiles Menü öffnet mit Fokus im Menü, Escape schliesst, Fokus zurück');
    }
    ok(errs.length === 0, w + ' px: keine JavaScript-Fehler' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
    ok(bad.length === 0, w + ' px: keine fehlerhaften Ressourcen' + (bad.length ? ': ' + [...new Set(bad)].slice(0, 5).join(' | ') : ''));
    if (w === 390 || w === 1440) {
      const ax = {};
      for (const r of ROUTES) {
        await p.evaluate(r => { location.hash = r; }, r); await p.waitForTimeout(1200);
        await p.addScriptTag({ content: AXE });
        const res = await p.evaluate(async () => {
          const out = await axe.run(document.querySelector('[data-page]:not([hidden])') ? { exclude: [['[data-page][hidden]']] } : document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] });
          return out.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, t: v.nodes[0] && v.nodes[0].target.join(' ') }));
        });
        for (const v of res) { const k = v.id + ' (' + v.impact + ')'; (ax[k] = ax[k] || []).push(r + ':' + v.n + ' ' + (v.t || '').slice(0, 60)); }
      }
      report.axe[w] = ax;
      const severe = Object.keys(ax).filter(k => /serious|critical/.test(k));
      ok(severe.length === 0, w + ' px: axe ohne schwere Befunde' + (severe.length ? ': ' + severe.map(k => k + ' → ' + ax[k].slice(0, 3).join('; ')).join(' || ') : ''));
    }
    if (w === 1440) {
      /* Links */
      const links = await p.evaluate(() => { const s = new Set(); document.querySelectorAll('a[href]').forEach(a => s.add(a.getAttribute('href'))); return [...s]; });
      const ids = await p.evaluate(() => [...document.querySelectorAll('[id]')].map(e => e.id).concat(['start', 'leistungen', 'hauswartung', 'sanitaer', 'gartenunterhalt', 'reinigung', 'raeumung', 'leerstand', 'verkauf', 'fotografie', 'verwaltungen', 'ueber', 'kontakt', 'offerte', 'impressum', 'datenschutz', 'umsetzung']));
      const deadHash = links.filter(l => l.startsWith('#') && l.length > 1 && !ids.includes(l.slice(1)));
      ok(deadHash.length === 0, 'interne Links: alle ' + links.filter(l => l.startsWith('#')).length + ' Sprungziele vorhanden' + (deadHash.length ? ' – fehlen: ' + deadHash.join(', ') : ''));
      const tel = links.filter(l => l.startsWith('tel:')), mail = links.filter(l => l.startsWith('mailto:'));
      ok(tel.every(l => l === 'tel:+41763404401') && mail.every(l => /^mailto:info\.immoready@gmail\.com(\?|$)/.test(l)), 'Telefon- und E-Mail-Links einheitlich (' + tel.length + '/' + mail.length + ')');
      const ext = links.filter(l => /^https?:/.test(l));
      const dead = [];
      const lp = await b.newPage();
      for (const u of ext) {
        try { const r = await lp.goto(u, { timeout: 30000, waitUntil: 'commit' }); const st = r ? r.status() : 0; report.links[u] = st; if (!st || st >= 400) dead.push(st + ' ' + u); }
        catch (e) { report.links[u] = 'Fehler'; dead.push('Fehler ' + u + ' ' + String(e.message).slice(0, 60)); }
      }
      await lp.close();
      ok(dead.length === 0, 'externe Links erreichbar (' + ext.length + ')' + (dead.length ? ' – ' + dead.join(' | ') : ''));
    }
    await p.close();
  }
  await b.close();
  fs.mkdirSync(path.resolve(__dirname, '../shots'), { recursive: true });
  fs.writeFileSync(path.resolve(__dirname, '../shots/t30-bericht.json'), JSON.stringify(report, null, 1));
  log.forEach(l => console.log(l));
  const f = log.filter(l => l.startsWith('FAIL')).length;
  console.log('\nt30: ' + (log.length - f) + '/' + log.length + ' bestanden (' + BASE + ')');
  process.exitCode = f ? 1 : 0;
})();
