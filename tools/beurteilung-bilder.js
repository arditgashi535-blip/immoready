// Beurteilung wie ein Architekturvisualisierer: Stationen und Nahansichten in der echten Website, Kundenansicht (mit Kopf,
// Text und Bedienung) und reine Szene (Bedienung ausgeblendet), gleiche Kameras für Vorher-/Nachher-Vergleiche.
// Aufruf: node tools/beurteilung-bilder.js [html] [ordner] [etikett] [ansichten]
//   ansichten (Komma): 1280x720, 1440x900, handy (390×844 Bildmodus), handy3d (390×844 3D)   – Standard: alle
// Ausgabe: <ordner>/<etikett>-<ansicht>-<punkt>-kunde.png bzw. -szene.png, <etikett>-konsole.txt   (Umgebung: PUNKTE=5-bad,2-garten)
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const file = 'file://' + path.resolve(process.argv[2] || 'dist/immoready-vorschau.html');
const out = path.resolve(process.argv[3] || 'shots/beurteilung'); fs.mkdirSync(out, { recursive: true });
const tag = process.argv[4] || 'stand';
const VIEWS = (process.argv[5] || '1280x720,1440x900,handy,handy3d').split(',');
const RISE = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../rise.json'), 'utf8')).tour;
const PTS = [];
RISE.stations.forEach((s, i) => { PTS.push({ n: (i + 1) + '-' + s.key, q: s.hold, st: i }); (s.details || []).forEach(d => PTS.push({ n: (i + 1) + '-' + s.key + '-' + d.key, q: d.q, st: i, det: d.key })); });
/* PUNKTE=5-bad,4-wohnung: nur Punkte, deren Name so beginnt */
if (process.env.PUNKTE) { const w = process.env.PUNKTE.split(','); PTS.splice(0, PTS.length, ...PTS.filter(pt => w.some(x => pt.n.startsWith(x)))); }
const GPU = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const log = [];
const watch = (p, n) => { p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') log.push(n + ' ' + m.type() + ': ' + m.text()); }); p.on('pageerror', e => log.push(n + ' pageerror: ' + e.message)); };
const HIDE = '#reise .jr-ui,#reise .jr-st,#reise .jr-skip,#reise .jr-hot,#reise .jr-tech,#reise .jr-tag,#reise .jr-nav,.hdr,.demo,.mbar{visibility:hidden!important}';
(async () => {
  const b = await chromium.launch({ args: GPU });
  for (const v of VIEWS) {
    const mob = v.startsWith('handy');
    const [W, H] = mob ? [390, 844] : v.split('x').map(Number);
    const p = await b.newPage(mob ? { viewport: { width: W, height: H }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { viewport: { width: W, height: H } });
    watch(p, v);
    await p.addInitScript(() => { window.IR_FORCE_HQ = true; window.IR_NO_PERF_FALLBACK = true; });
    await p.goto(file); await p.waitForTimeout(900);
    await p.evaluate(() => document.getElementById('reise').scrollIntoView({ block: 'start', behavior: 'instant' }));
    if (v === 'handy') {
      for (const pt of PTS) {
        await p.evaluate(pt => { const r = document.getElementById('reise'); r.querySelectorAll('.jr-nav button')[pt.st].click(); if (pt.det) { const bt = [...r.querySelectorAll('.jr-st.on [data-det]')].find(x => x.textContent.trim().toLowerCase() === pt.det.toLowerCase()); if (bt) bt.click(); } }, pt);
        await p.waitForTimeout(450);
        await p.evaluate(() => { const s = document.querySelector('#reise .jr-stage'), hh = document.querySelector('.hdr').getBoundingClientRect().height; scrollTo({ top: s.getBoundingClientRect().top + scrollY - hh, behavior: 'instant' }); });
        await p.waitForTimeout(350);
        await p.screenshot({ path: path.join(out, `${tag}-${v}-${pt.n}-kunde.png`) });
      }
      await p.close(); continue;
    }
    if (v === 'handy3d') { await p.click('#reise [data-3d]'); }
    await p.waitForFunction(() => window.__jr === true || (window.__JR && window.__JR.state().inline3d && window.__JR.state().ready), null, { timeout: 180000 });
    await p.waitForFunction(() => window.__JR.state().scan.state === 'done', null, { timeout: 60000 }).catch(() => {});
    await p.evaluate(() => window.__JR.setScale(1, true));
    for (const pt of PTS) {
      const f0 = await p.evaluate(() => window.__JR.state().frames);
      await p.evaluate(pt => {
        const r = document.getElementById('reise'), t = window.__JR;
        if (t.mode() === 'live') { const top = r.getBoundingClientRect().top + scrollY, span = r.offsetHeight - innerHeight; scrollTo({ top: Math.round(top + pt.q * span), behavior: 'instant' }); }
        else r.querySelectorAll('.jr-nav button')[pt.st].click();
        t.jump(pt.q);
        if (pt.det) { const bt = [...r.querySelectorAll('.jr-st.on [data-det]')].find(x => x.textContent.trim().toLowerCase() === pt.det.toLowerCase()); if (bt) bt.setAttribute('aria-pressed', 'true'); }
      }, pt);
      await p.waitForFunction(f => window.__JR.state().frames > f, f0, { timeout: 120000 }).catch(() => {});
      /* ein weiteres Bild: Ansichtswahl, Vergleich und Beschriftungen folgen dem Fortschritt erst im nächsten Bild */
      const f1 = await p.evaluate(() => { const t = window.__JR; t.jump(t.state().p); return t.state().frames; });
      await p.waitForFunction(f => window.__JR.state().frames > f, f1, { timeout: 120000 }).catch(() => {});
      /* Textüberblendung abwarten (in der Software-Grafik laufen CSS-Übergänge verzögert) */
      await p.waitForFunction(() => [...document.querySelectorAll('#reise .jr-st')].every(e => +getComputedStyle(e).opacity === (e.classList.contains('on') ? 1 : 0)), null, { timeout: 15000 }).catch(() => {});
      await p.waitForTimeout(300);
      if (v === 'handy3d') await p.evaluate(() => { const s = document.querySelector('#reise .jr-stage'), hh = document.querySelector('.hdr').getBoundingClientRect().height; scrollTo({ top: s.getBoundingClientRect().top + scrollY - hh, behavior: 'instant' }); });
      await p.waitForTimeout(200);
      await p.screenshot({ path: path.join(out, `${tag}-${v}-${pt.n}-kunde.png`), timeout: 180000 });
      if (v !== 'handy3d') {
        const st = await p.addStyleTag({ content: HIDE });
        await p.waitForTimeout(100);
        const bb = await p.evaluate(() => { const r = document.querySelector('#reise .jr-stage').getBoundingClientRect(); return { x: Math.max(0, r.left), y: Math.max(0, r.top), width: Math.min(innerWidth, r.width), height: Math.min(innerHeight, r.bottom) - Math.max(0, r.top) }; });
        await p.screenshot({ path: path.join(out, `${tag}-${v}-${pt.n}-szene.png`), clip: bb, timeout: 180000 });
        await st.evaluate(n => n.remove());
      }
    }
    await p.close();
  }
  await b.close();
  fs.writeFileSync(path.join(out, tag + '-konsole.txt'), (log.length ? log.join('\n') : 'keine Fehler oder Warnungen') + '\n');
  console.log(tag, 'fertig;', PTS.length, 'Punkte je Ansicht,', log.length, 'Konsolenmeldungen');
})();
