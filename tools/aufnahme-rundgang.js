// Kurze Aufnahme des 3D-Rundgangs aus der echten Vorschauseite (nicht aus einer Testseite):
// Die Seite wird im Browser schrittweise durch den Abschnitt #reise gescrollt (Scrollmodus, wie beim Lesen).
// Nach jedem Schritt wird die Kamera auf den Fortschritt der Seite gesetzt und ein neues Bild abgewartet; dann Bildschirmfoto.
// Die Einzelbilder setzt ffmpeg zu einem Video zusammen (gleichmässige Bildfolge, keine Echtzeitaufnahme –
// die Testumgebung rendert mit Software-Grafik deutlich langsamer als eine echte GPU).
// Aufruf: node tools/aufnahme-rundgang.js [html] [ausgabe.mp4] [bilder] [breite] [höhe]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { execFileSync } = require('child_process');
const file = 'file://' + path.resolve(process.argv[2] || 'dist/immoready-vorschau.html');
const out = path.resolve(process.argv[3] || 'docs/premium/rundgang-aufnahme.mp4');
const N = +(process.argv[4] || 180), W = +(process.argv[5] || 1280), H = +(process.argv[6] || 720);
const tmp = path.join(path.dirname(out), '.frames'); fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp, { recursive: true });
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await p.addInitScript(() => { window.IR_FORCE_HQ = true; });
  await p.goto(file);
  await p.evaluate(() => document.getElementById('reise').scrollIntoView({ block: 'start', behavior: 'instant' }));
  await p.waitForFunction(() => window.__jr === true && window.__JR.state().scan.state === 'done', null, { timeout: 180000 });
  const span = await p.evaluate(() => { const r = document.getElementById('reise'), t = r.getBoundingClientRect().top + scrollY; return { t, len: r.offsetHeight - innerHeight }; });
  for (let i = 0; i < N; i++) {
    /* weich beschleunigt und abgebremst, kurze Halte an Anfang und Ende */
    const k = Math.min(1, Math.max(0, (i / (N - 1) - 0.04) / 0.92)), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    const f0 = await p.evaluate(() => window.__JR.state().frames);
    await p.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), Math.round(span.t + e * span.len));
    /* die Seite setzt den Fortschritt aus dem Scrollstand; die Glättung wird für die Aufnahme übersprungen
       (sonst bräuchte die Software-Grafik je Schritt viele Bilder), Kamera = Zielwert der Seite */
    await p.waitForFunction(() => { const s = window.__JR.state(); return s.p > 0; }, null, { timeout: 5000 }).catch(() => {});
    await p.waitForTimeout(40);
    await p.evaluate(() => { const s = window.__JR.state(); window.__JR.jump(s.p); });
    await p.waitForFunction(f => window.__JR.state().frames > f, f0, { timeout: 60000, polling: 100 }).catch(() => {});
    await p.waitForTimeout(60);
    await p.screenshot({ path: path.join(tmp, String(i).padStart(4, '0') + '.png') });
    if (i % 20 === 0) console.log('Bild', i, '/', N);
  }
  await b.close();
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '24', '-i', path.join(tmp, '%04d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', '-movflags', '+faststart', out]);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('Video:', path.relative(process.cwd(), out), (fs.statSync(out).size / 1e6).toFixed(1), 'MB,', N, 'Bilder, 24 Bilder/s');
})();
