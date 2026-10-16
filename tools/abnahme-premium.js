// Abnahmebilder Premium-Durchgang: acht Grössen, je Einstieg, Rundgang (Station 1, 3, 5) und Offerte.
// Ausgabe: shots/premium/<breite>x<höhe>-<motiv>.png, danach python3 tools/abnahme-premium-collage.py → docs/premium/
// Aufruf: node tools/abnahme-premium.js [html] [ausgabeordner]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const file = 'file://' + path.resolve(process.argv[2] || 'dist/immoready-vorschau.html');
const out = path.resolve(process.argv[3] || 'shots/premium'); fs.mkdirSync(out, { recursive: true });
const SIZES = [[320, 568, 1], [360, 800, 1], [390, 844, 1], [430, 932, 1], [844, 390, 1], [768, 1024, 1], [1440, 900, 0], [1920, 1080, 0]];
const GPU = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
(async () => {
  const b = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: GPU });
  const report = [];
  for (const [w, h, m] of SIZES) {
    const p = await b.newPage({ viewport: { width: w, height: h }, isMobile: !!m, hasTouch: !!m, deviceScaleFactor: 1 });
    await p.addInitScript(() => { window.IR_FORCE_HQ = true; });
    await p.goto(file); await p.waitForTimeout(1200);
    const n = w + 'x' + h, shot = async s => { await p.waitForTimeout(500); await p.screenshot({ path: path.join(out, n + '-' + s + '.png') }); };
    await shot('1-einstieg');
    /* «Gebäude entdecken» wie ein Besucher */
    await p.click('#einstieg .hero3-ctas a[href="#reise"]');
    await p.waitForFunction(() => window.__jr === true, null, { timeout: 150000 }).catch(() => {});
    const mode = await p.evaluate(() => (window.__JR && window.__JR.state().mode) || 'none');
    for (const i of [0, 2, 4]) {
      await p.evaluate(i => { const t = window.__JR; if (t.state().mode === 'live') { t.goStation(i); t.jump(t.state().p); } else document.querySelectorAll('#reise .jr-nav button')[i].click(); }, i);
      await p.waitForTimeout(300);
      if (mode !== 'live') await p.evaluate(() => { const s = document.querySelector('#reise .jr-stage'), hh = document.querySelector('.hdr').getBoundingClientRect().height; scrollTo({ top: s.getBoundingClientRect().top + scrollY - hh, behavior: 'instant' }); });
      const f0 = await p.evaluate(() => window.__JR.state().frames);
      if (mode === 'live') await p.waitForFunction(f => window.__JR.state().frames > f, f0, { timeout: 60000 }).catch(() => {});
      await shot('2-station-' + (i + 1));
    }
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    await p.goto(file + '#offerte'); await p.waitForTimeout(900);
    await p.evaluate(() => { const f = document.getElementById('formRoot'); scrollTo({ top: f.getBoundingClientRect().top + scrollY - 90, behavior: 'instant' }); });
    await shot('3-offerte');
    report.push(n + ' Modus ' + mode + ', Überbreite ' + ov + ' px'); console.log(report[report.length - 1]);
    await p.close();
  }
  fs.writeFileSync(path.join(out, 'bericht.txt'), report.join('\n') + '\n');
  await b.close();
})();
