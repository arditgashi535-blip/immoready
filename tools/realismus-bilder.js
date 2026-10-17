// Realismus-Runden: Startseite und sechs Stationen auf Desktop (1440×900, 3D) und Handy (390×844, Bildmodus und 3D),
// dazu Konsolenfehler und fehlgeschlagene Anfragen. Gleiche Kamera, gleiche Auflösung für Vorher-/Nachher-Vergleiche.
// Aufruf: node tools/realismus-bilder.js [html] [ordner] [etikett]   → <ordner>/<etikett>-desktop-*.png, -handy-*.png, konsole.txt
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const file = 'file://' + path.resolve(process.argv[2] || 'dist/immoready-vorschau.html');
const out = path.resolve(process.argv[3] || 'shots/realismus'); fs.mkdirSync(out, { recursive: true });
const tag = process.argv[4] || 'stand';
const GPU = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const log = [];
const watch = (p, n) => { p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') log.push(n + ' ' + m.type() + ': ' + m.text()); }); p.on('pageerror', e => log.push(n + ' pageerror: ' + e.message)); p.on('requestfailed', r => log.push(n + ' requestfailed: ' + r.url().slice(0, 120))); };
(async () => {
  const b = await chromium.launch({ args: GPU });
  /* Desktop */
  let p = await b.newPage({ viewport: { width: 1440, height: 900 } }); watch(p, 'desktop');
  await p.addInitScript(() => { window.IR_FORCE_HQ = true; });
  await p.goto(file); await p.waitForTimeout(1200);
  await p.screenshot({ path: path.join(out, tag + '-desktop-0-start.png') });
  await p.evaluate(() => document.getElementById('reise').scrollIntoView({ block: 'start', behavior: 'instant' }));
  await p.waitForFunction(() => window.__jr === true && window.__JR.state().scan.state === 'done', null, { timeout: 180000 });
  await p.evaluate(() => window.__JR.setScale(1, true));
  for (let i = 0; i < 6; i++) {
    const f0 = await p.evaluate(() => window.__JR.state().frames);
    await p.evaluate(i => { window.__JR.goStation(i); window.__JR.jump(window.__JR.state().p); }, i);
    await p.waitForFunction(f => window.__JR.state().frames > f, f0, { timeout: 90000 }).catch(() => {});
    await p.waitForTimeout(900);
    await p.screenshot({ path: path.join(out, tag + '-desktop-' + (i + 1) + '.png'), timeout: 180000 });
  }
  await p.close();
  /* Handy: Start, Stationen als Bild */
  p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }); watch(p, 'handy');
  await p.goto(file); await p.waitForTimeout(1000);
  await p.screenshot({ path: path.join(out, tag + '-handy-0-start.png') });
  const top = () => p.evaluate(() => { const s = document.querySelector('#reise .jr-stage'), hh = document.querySelector('.hdr').getBoundingClientRect().height; scrollTo({ top: s.getBoundingClientRect().top + scrollY - hh, behavior: 'instant' }); });
  for (let i = 0; i < 6; i++) { await p.evaluate(i => document.querySelectorAll('#reise .jr-nav button')[i].click(), i); await p.waitForTimeout(500); await top(); await p.waitForTimeout(500); await p.screenshot({ path: path.join(out, tag + '-handy-' + (i + 1) + '.png') }); }
  await p.close(); await b.close();
  fs.writeFileSync(path.join(out, tag + '-konsole.txt'), (log.length ? log.join('\n') : 'keine Fehler, Warnungen oder fehlgeschlagenen Anfragen') + '\n');
  console.log(tag, 'fertig;', log.length, 'Konsolenmeldungen');
})();
