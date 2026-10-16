// Handyansicht der 3D-Reise (390×844, Touch): Bildmodus und 3D im Bildrahmen, je Station Bühne + Text.
// Aufruf: node tools/handy-3d-bilder.js [html] [ordner]  → <ordner>/m-bild-<n>.png, m-3d-<n>.png
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const file = 'file://' + path.resolve(process.argv[2] || 'dist/immoready-vorschau.html');
const out = path.resolve(process.argv[3] || 'shots/handy-3d'); fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await p.addInitScript(() => { window.IR_FORCE_HQ = true; window.IR_NO_PERF_FALLBACK = true; });
  await p.goto(file); await p.waitForTimeout(800);
  const top = () => p.evaluate(() => { const s = document.querySelector('#reise .jr-stage'), hh = document.querySelector('.hdr').getBoundingClientRect().height; scrollTo({ top: s.getBoundingClientRect().top + scrollY - hh, behavior: 'instant' }); });
  const sts = [0, 1, 2, 3, 4, 5];
  for (const i of sts) { await p.evaluate(i => document.querySelectorAll('#reise .jr-nav button')[i].click(), i); await p.waitForTimeout(500); await top(); await p.waitForTimeout(400); await p.screenshot({ path: path.join(out, 'm-bild-' + (i + 1) + '.png') }); }
  if (process.env.NUR_BILDER) { await b.close(); return; }
  await p.evaluate(() => document.querySelectorAll('#reise .jr-nav button')[0].click());
  await top(); await p.click('#reise [data-3d]');
  await p.waitForFunction(() => window.__JR.state().ready && window.__JR.state().inline3d, null, { timeout: 180000 });
  await p.evaluate(() => window.__JR.setScale(1, true));
  for (const i of sts) {
    await p.evaluate(i => document.querySelectorAll('#reise .jr-nav button')[i].click(), i);
    await p.evaluate(() => { const s = window.__JR.state(); window.__JR.jump(s.p); });
    const f0 = await p.evaluate(() => window.__JR.state().frames);
    await p.waitForFunction(f => window.__JR.state().frames > f, f0, { timeout: 60000 }).catch(() => {});
    await top(); await p.waitForTimeout(700);
    await p.screenshot({ path: path.join(out, 'm-3d-' + (i + 1) + '.png') });
  }
  await b.close();
})();
