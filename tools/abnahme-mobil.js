// Abnahme V17: echte Smartphone-Screenshots (390 × 844, Pixeldichte 2) aus der gebauten Seite.
// Aufruf: node tools/abnahme-mobil.js <html> <ausgabeordner>
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const file = path.resolve(process.argv[2] || 'dist/immoready-vorschau.html'), out = path.resolve(process.argv[3] || 'shots/v17-mobil');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
  const ctx = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };
  let p = await b.newPage(ctx); await p.goto('file://' + file); await p.waitForTimeout(1500);
  await p.screenshot({ path: path.join(out, '17-gebaeude-390.png') });
  const bad = await p.evaluate(() => Array.from(document.querySelectorAll('#reise .jr-nav button')).findIndex(x => /Sanit/.test(x.textContent)));
  await p.evaluate(i => document.querySelectorAll('#reise .jr-nav button')[i].click(), bad); await p.waitForTimeout(1200);
  await p.evaluate(() => { const r = document.querySelector('#reise .jr-stage').getBoundingClientRect(); scrollTo({ top: r.top + scrollY - document.querySelector('.hdr').getBoundingClientRect().height + 30, behavior: 'instant' }); }); await p.waitForTimeout(900);
  await p.screenshot({ path: path.join(out, '18-bad-390.png') });
  await p.evaluate(() => { const r = document.querySelector('#reise .jr-nav').getBoundingClientRect(); scrollTo({ top: r.top + scrollY - 420, behavior: 'instant' }); }); await p.waitForTimeout(900);
  await p.screenshot({ path: path.join(out, '19-stationsleiste-390.png') });
  await p.evaluate(() => { const s = document.getElementById('intro') || document.querySelectorAll('section')[3]; scrollTo({ top: s.getBoundingClientRect().top + scrollY - 140, behavior: 'instant' }); }); await p.waitForTimeout(900);
  await p.screenshot({ path: path.join(out, '22-kontaktleiste-390.png') });
  await p.close();
  p = await b.newPage(ctx); await p.goto('file://' + file + '#offerte'); await p.waitForTimeout(1200);
  await p.evaluate(() => { const t = document.getElementById('formRoot').getBoundingClientRect().top + scrollY - 90; scrollTo({ top: t, behavior: 'instant' }); }); await p.waitForTimeout(900);
  await p.screenshot({ path: path.join(out, '20-formular-oben-390.png') });
  await p.evaluate(() => { const t = document.getElementById('next').getBoundingClientRect().bottom + scrollY - innerHeight + 40; scrollTo({ top: t, behavior: 'instant' }); }); await p.waitForTimeout(900);
  await p.screenshot({ path: path.join(out, '21-formular-unten-390.png') });
  await p.close(); await b.close();
  console.log('Smartphone-Abnahmebilder:', fs.readdirSync(out).join(', '));
})();
