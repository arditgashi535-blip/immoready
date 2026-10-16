// Aufnahme der gesamten 3D-Reise aus der echten Vorschauseite: Gebäude → Garten → Eingang/Treppenhaus → Wohnung →
// Bad (Raum, Waschtisch, WC) → Rückkehr zur Gesamtansicht.
// Die Seite wird schrittweise durch den Abschnitt #reise gescrollt (Scrollmodus wie beim Lesen). Nach jedem Schritt wird die
// Kamera auf den Fortschritt der Seite gesetzt (ohne Glättung, sonst bräuchte die Software-Grafik je Schritt viele Bilder)
// und ein neues Bild abgewartet. An jedem Stationshalt und an den Nahansichten im Bad steht das Bild HALT Sekunden.
// ffmpeg setzt die Einzelbilder zu einem Video zusammen (gleichmässige Bildfolge, keine Echtzeitaufnahme).
// Aufruf: node tools/aufnahme-rundgang.js [html] [ausgabe.mp4] [schritte] [breite] [höhe]   (Umgebung: HALT=1.6, FPS=24)
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { execFileSync } = require('child_process');
const file = 'file://' + path.resolve(process.argv[2] || 'dist/immoready-vorschau.html');
const out = path.resolve(process.argv[3] || 'docs/reise/rundgang-gesamt.mp4');
const N = +(process.argv[4] || 420), W = +(process.argv[5] || 1280), H = +(process.argv[6] || 720);
const FPS = +(process.env.FPS || 24), HALT = +(process.env.HALT || 1.6);
const RISE = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../rise.json'), 'utf8')).tour;
const holds = RISE.stations.map(s => s.hold).concat(...RISE.stations.map(s => (s.details || []).map(d => d.q)));
const qs = [...new Set([...Array(N + 1).keys()].map(i => +(i / N).toFixed(4)).concat(holds))].sort((a, b) => a - b);
const tmp = path.join(path.dirname(out), '.frames'); fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp, { recursive: true });
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await p.addInitScript(() => { window.IR_FORCE_HQ = true; });
  await p.goto(file);
  await p.evaluate(() => document.getElementById('reise').scrollIntoView({ block: 'start', behavior: 'instant' }));
  await p.waitForFunction(() => window.__jr === true && window.__JR.state().scan.state === 'done', null, { timeout: 180000 });
  const span = await p.evaluate(() => { const r = document.getElementById('reise'), t = r.getBoundingClientRect().top + scrollY; return { t, len: r.offsetHeight - innerHeight }; });
  let n = 0;
  const save = async () => { const f = path.join(tmp, String(n++).padStart(5, '0') + '.png'); await p.screenshot({ path: f, timeout: 180000 }); return f; };
  for (let i = 0; i < qs.length; i++) {
    const q = qs[i], f0 = await p.evaluate(() => window.__JR.state().frames);
    await p.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), Math.round(span.t + q * span.len));
    await p.waitForTimeout(60);
    /* Zielwert genau setzen (die Seite rundet den Scrollstand auf ganze Pixel) */
    await p.evaluate(q => window.__JR.jump(q), q);
    await p.waitForFunction(f => window.__JR.state().frames > f, f0, { timeout: 60000, polling: 100 }).catch(() => {});
    await p.waitForTimeout(holds.includes(q) ? 700 : 60); /* Einblendungen der Station abwarten */
    const f = await save();
    if (holds.includes(q)) for (let k = 1; k < Math.round(HALT * FPS); k++) fs.copyFileSync(f, path.join(tmp, String(n++).padStart(5, '0') + '.png'));
    if (i % 40 === 0) console.log('Schritt', i, '/', qs.length);
  }
  await b.close();
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(tmp, '%05d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '22', '-movflags', '+faststart', out]);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('Video:', path.relative(process.cwd(), out), (fs.statSync(out).size / 1e6).toFixed(1), 'MB,', (n / FPS).toFixed(1), 's,', qs.length, 'gerenderte Schritte,', holds.length, 'Halte');
})();
