// Abnahme Demo-Rundlauf: dreimal vollständig in Echtzeit abspielen (gleiche rAF-Schleife wie beim Besuch) und dabei je Bild
// Demo-Zeit, Kameraposition und – rund um die Naht – ein Bildraster aufzeichnen. Geprüft: drei Durchgänge, keine Zeitsprünge
// ausser der Naht, kein Kamerasprung, an der Naht kein sichtbarer Bildwechsel (kein Schwarz, kein Aufblitzen).
// Aufruf: node tools/demo-dreimal.js [html] [bericht.txt]   (Software-Grafik: die Demo-Zeit läuft je Bild höchstens 0,25 s)
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const file = 'file://' + path.resolve(process.argv[2] || 'dist/immoready-vorschau.html');
const out = path.resolve(process.argv[3] || 'docs/realismus/demo-dreimal.txt');
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 960, height: 600 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(file);
  await p.evaluate(() => document.getElementById('reise').scrollIntoView({ block: 'start', behavior: 'instant' }));
  await p.waitForFunction(() => window.__jr === true && window.__JR.state().scan.state === 'done', null, { timeout: 180000 });
  const t0 = Date.now();
  await p.click('#reise [data-demo="toggle"]');
  /* Aufzeichnung je gezeichnetem Bild (rAF nach dem Bild der Tour) */
  await p.evaluate(() => {
    window.__rec = []; let last = -1;
    (function tick() {
      const t = window.__JR, s = t.state(), d = t.demoState();
      if (s.frames !== last && d.on) { last = s.frames; const r = { f: s.frames, t: d.t, loops: d.loops, e: s.cam, now: performance.now() }; if (d.t > 47.6 || d.t < 0.4) { r.g = t.frameGrid(12, 8); last = t.state().frames; } window.__rec.push(r); }
      if (d.on && d.loops < 3) requestAnimationFrame(tick); else window.__recDone = true;
    })();
  });
  await p.waitForFunction(() => window.__recDone === true, null, { timeout: 3 * 3600 * 1000, polling: 2000 });
  const rec = await p.evaluate(() => window.__rec);
  const st = await p.evaluate(() => ({ d: window.__JR.demoState(), s: window.__JR.state() }));
  await b.close();
  const lines = [], L = s => { lines.push(s); console.log(s); };
  let wraps = 0, maxV = 0, atV = 0, tJump = [], seamD = [], blk = 0;
  const gd = (a, c) => a.reduce((s, x, i) => s + Math.abs(x[0] - c[i][0]) + Math.abs(x[1] - c[i][1]) + Math.abs(x[2] - c[i][2]), 0) / (a.length * 765);
  for (let i = 1; i < rec.length; i++) {
    const a = rec[i - 1], c = rec[i], dt = c.t - a.t, de = Math.hypot(c.e[0] - a.e[0], c.e[1] - a.e[1], c.e[2] - a.e[2]);
    if (dt < 0) { wraps++; seamD.push(de); }
    else if (dt > 0.26) tJump.push(a.t + '→' + c.t);
    if (dt > 0.001 && de / dt > maxV) { maxV = de / dt; atV = c.t; }
    if (a.g && c.g) { const g = gd(a.g, c.g); if (g > 0.02) blk++; }
    if (c.g && c.g.every(x => x[0] + x[1] + x[2] < 15)) blk++;
  }
  L('Demo-Rundlauf dreimal abgespielt (' + new Date().toISOString().slice(0, 10) + ', Headless-Chromium, SwiftShader, 960×600)');
  L('Bilder: ' + rec.length + ', Dauer: ' + ((Date.now() - t0) / 1000).toFixed(0) + ' s Echtzeit, Durchgänge laut Demo: ' + st.d.loops);
  L('Nahtübergänge: ' + wraps + ', Kameraweg über die Naht: ' + seamD.map(x => x.toFixed(3) + ' m').join(', '));
  L('Zeitsprünge ausser der Naht (> 0,26 s Demo-Zeit je Bild): ' + (tJump.length ? tJump.slice(0, 5).join(', ') : 'keine'));
  L('grösste Kamerageschwindigkeit: ' + maxV.toFixed(1) + ' m/s bei ' + atV.toFixed(2) + ' s');
  L('Naht ±0,4 s: Bildwechsel > 2 % zwischen Folgebildern oder schwarzes Bild: ' + blk);
  L('Konsolenfehler: ' + (errs.length ? errs.join(' | ') : 'keine'));
  const okAll = wraps >= 3 && st.d.loops >= 3 && !tJump.length && seamD.every(x => x < 0.05) && blk === 0 && !errs.length;
  L(okAll ? 'ERGEBNIS: bestanden' : 'ERGEBNIS: NICHT bestanden');
  fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, lines.join('\n') + '\n');
  process.exit(okAll ? 0 : 1);
})();
