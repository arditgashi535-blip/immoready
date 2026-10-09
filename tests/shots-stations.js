// Abnahme-Screenshots der sechs Stationen in 1440, 768 und 390 px Breite.
// Aufruf: node tests/shots-stations.js <html-datei> <präfix>   → shots/<präfix>-<breite>-<nn>-<station>.png
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const file = path.resolve(process.argv[2] || path.join(__dirname, '../dist/immoready-vorschau.html'));
const pre = process.argv[3] || 'nachher';
const out = path.resolve(__dirname, '../shots'); fs.mkdirSync(out, { recursive: true });
const VPS = [{ w: 1440, h: 900 }, { w: 768, h: 1024 }, { w: 390, h: 844, mobile: true }];
(async () => {
  const b = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const report = [];
  for (const vp of VPS) {
    const p = await b.newPage({ viewport: { width: vp.w, height: vp.h }, ...(vp.mobile ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {}) });
    /* Abnahmebilder in GPU-Qualität (die Testumgebung rendert per Software) */
    await p.addInitScript(() => { window.IR_FORCE_HQ = true; });
    await p.goto('file://' + file);
    await p.waitForFunction(() => window.__JR && document.querySelector('#reise'), null, { timeout: 20000 }).catch(() => {});
    await p.waitForTimeout(vp.mobile ? 1500 : 4500);
    const st = await p.evaluate(() => Array.from(document.querySelectorAll('#reise .jr-st')).map(e => e.dataset.k));
    for (let i = 0; i < st.length; i++) {
      await p.evaluate(i => { const r = document.getElementById('reise'); const b = r.querySelectorAll('.jr-nav button')[i]; if (b) b.click(); }, i);
      if (vp.mobile) await p.waitForTimeout(700);
      else { await p.waitForFunction(() => { const s = window.__JR && window.__JR.state(); return !s || s.mode === 'static' || Math.abs(s.p - s.ps) < 0.0004; }, null, { timeout: 90000, polling: 250 }).catch(() => {}); await p.waitForTimeout(1800); }
      const f = `${pre}-${vp.w}-${String(i + 1).padStart(2, '0')}-${st[i]}.png`;
      await p.screenshot({ path: path.join(out, f) });
      report.push(f);
    }
    await p.close();
  }
  console.log(report.join('\n')); await b.close();
})();
