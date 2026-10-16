// Bilder entlang der gesamten Kamerafahrt (für die Sichtprüfung): p = 0 … 1 in festen Schritten, volle Qualität.
// Aufruf: node tools/route-bilder.js [html] [ordner] [schritte] [breite] [höhe]  → <ordner>/r-<p>.png
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const file = 'file://' + path.resolve(process.argv[2] || 'dist/immoready-vorschau.html');
const out = path.resolve(process.argv[3] || 'shots/route'); fs.mkdirSync(out, { recursive: true });
const N = +(process.argv[4] || 50), W = +(process.argv[5] || 960), H = +(process.argv[6] || 600);
const qs = process.env.QS ? process.env.QS.split(',').map(Number) : [...Array(N + 1).keys()].map(i => i / N);
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await p.addInitScript(() => { window.IR_FORCE_HQ = true; });
  await p.goto(file);
  await p.addStyleTag({ content: '#reise .jr-ui,#reise .jr-skip,#reise .jr-hot,#reise .jr-tech,#reise .jr-tag,.hdr,.demo,.mbar{opacity:0!important}' });
  await p.evaluate(() => document.getElementById('reise').scrollIntoView({ block: 'start', behavior: 'instant' }));
  await p.waitForFunction(() => window.__jr === true && window.__JR.state().scan.state === 'done', null, { timeout: 180000 });
  await p.evaluate(() => window.__JR.setScale(1, true));
  for (const q of qs) {
    const f0 = await p.evaluate(() => window.__JR.state().frames);
    await p.evaluate(q => { window.__JR.jump(q); }, q);
    await p.waitForFunction(f => window.__JR.state().frames > f, f0, { timeout: 60000 }).catch(() => {});
    await p.waitForTimeout(50);
    const st = await p.evaluate(() => { const r = document.querySelector('#reise .jr-stage').getBoundingClientRect(); return [Math.max(0, r.top), Math.min(innerHeight, r.bottom)]; });
    await p.screenshot({ path: path.join(out, 'r-' + q.toFixed(3) + '.png'), clip: { x: 0, y: st[0], width: W, height: st[1] - st[0] }, timeout: 180000 });
  }
  const col = await p.evaluate(() => window.__JR.checkRoute ? window.__JR.checkRoute(400) : null);
  console.log('checkRoute:', JSON.stringify(col));
  await b.close();
})();
