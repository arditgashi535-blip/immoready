// Bildzeiten des Rundgangs in dieser Testumgebung (Software-GPU, keine Aussage über echte Geräte):
// je Seite 5 Stationen, volle Auflösung und Auflösung 0,5, Mittel aus n Bildern (window.__JR.bench).
// Aufruf: node tests/bench-frames.js <html> [<html> …]
const { chromium } = require('playwright');
const path = require('path');
const files = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const f of files) {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    const t0 = Date.now(); await p.goto('file://' + path.resolve(f));
    await p.evaluate(() => { const r = document.getElementById('reise'); if (r) r.scrollIntoView({ block: 'start', behavior: 'instant' }); }); await p.waitForFunction(() => window.__jr === true && window.__JR.state().scan.state === 'done', null, { timeout: 120000 });
    const ready = Date.now() - t0;
    const r = await p.evaluate(() => { const J = window.__JR, out = { stats: J.sceneStats() }; [1, 0.5].forEach(sc => { J.setScale(sc, true); out['s' + sc] = [0.03, 0.235, 0.44, 0.59, 0.73].map(q => J.bench(q, 4).ms); }); return out; });
    console.log(JSON.stringify({ file: path.basename(f), readyMs: ready, vertices: r.stats.vertices, panes: r.stats.panes, full: r.s1, half: r['s0.5'] }));
    await p.close();
  }
  await b.close();
})();
