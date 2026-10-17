// Aufnahme des Demo-Rundlaufs aus der echten Vorschauseite (Realismus-Auftrag).
// Die Demo wird über den Knopf «Demo-Rundlauf starten» gestartet, angehalten und dann Bild für Bild auf die Demo-Zeit gesetzt
// (demoSeek) – gleichmässige Bildfolge aus der Software-Grafik, keine Echtzeitaufnahme. Die Seite bleibt sichtbar wie beim Besuch.
//   <ausgabe>.mp4            ganzer Rundlauf (Dauer aus rise.json → tour.demo.duration), endet genau vor dem ersten Bild
//   <ausgabe>-naht.mp4       Naht: 46 → 48 = 0 → 2 s in Echtzeit, danach 47 → 48 = 0 → 1 s in vierfacher Zeitlupe
//   <ausgabe>-naht.jpg       letztes und erstes Bild nebeneinander, dazu die Differenz
// Aufruf: node tools/aufnahme-demo.js [html] [ausgabe.mp4] [breite] [höhe]   (Umgebung: FPS=24, NUR_NAHT=1)
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { execFileSync } = require('child_process');
const file = 'file://' + path.resolve(process.argv[2] || 'dist/immoready-vorschau.html');
const out = path.resolve(process.argv[3] || 'docs/realismus/demo-rundlauf.mp4');
const W = +(process.argv[4] || 1280), H = +(process.argv[5] || 720), FPS = +(process.env.FPS || 24);
const D = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../rise.json'), 'utf8')).tour.demo.duration;
const base = out.replace(/\.mp4$/, '');
fs.mkdirSync(path.dirname(out), { recursive: true });
const enc = (dir, o) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(dir, '%05d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '22', '-movflags', '+faststart', o]);
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await p.addInitScript(() => { window.IR_FORCE_HQ = true; });
  await p.goto(file);
  await p.evaluate(() => document.getElementById('reise').scrollIntoView({ block: 'start', behavior: 'instant' }));
  await p.waitForFunction(() => window.__jr === true && window.__JR.state().scan.state === 'done', null, { timeout: 180000 });
  await p.evaluate(() => window.__JR.setScale(1, true));
  await p.click('#reise [data-demo="toggle"]');
  await p.evaluate(() => window.__JR.demoPause(true));
  const shot = async (t, f) => {
    const f0 = await p.evaluate(() => window.__JR.state().frames);
    await p.evaluate(t => window.__JR.demoSeek(t), t);
    await p.waitForFunction(n => window.__JR.state().frames > n, f0, { timeout: 120000, polling: 50 });
    await p.screenshot({ path: f, timeout: 180000 });
  };
  const run = async (times, dir) => { fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true }); for (let i = 0; i < times.length; i++) { await shot(times[i], path.join(dir, String(i).padStart(5, '0') + '.png')); if (i % 48 === 0) console.log(path.basename(dir), i, '/', times.length); } };
  if (!process.env.NUR_NAHT) {
    const dir = base + '.frames', n = Math.round(D * FPS);
    await run([...Array(n).keys()].map(i => i / FPS), dir);
    enc(dir, out); fs.rmSync(dir, { recursive: true, force: true });
    console.log('Video:', path.relative(process.cwd(), out), (fs.statSync(out).size / 1e6).toFixed(1), 'MB,', (n / FPS).toFixed(1), 's');
  }
  /* Naht: Echtzeit, dann Zeitlupe */
  const rt = [...Array(4 * FPS).keys()].map(i => (D - 2 + i / FPS) % D), sl = [...Array(8 * FPS).keys()].map(i => (D - 1 + i / (4 * FPS)) % D);
  const dirN = base + '-naht.frames'; await run(rt.concat(sl), dirN);
  enc(dirN, base + '-naht.mp4');
  /* letztes Bild (D − 1/FPS) und erstes Bild (0) */
  const last = path.join(dirN, 'last.png'), first = path.join(dirN, 'first.png');
  await shot(D - 1 / FPS, last); await shot(0, first);
  execFileSync('python3', ['-c', `
from PIL import Image, ImageChops, ImageDraw
a=Image.open(${JSON.stringify(last)}).convert('RGB'); c=Image.open(${JSON.stringify(first)}).convert('RGB')
d=ImageChops.difference(a,c); s=sum(sum(px) for px in d.resize((160,90)).getdata())/(160*90*3*255)
w,h=a.size; k=0.5; a2=a.resize((int(w*k),int(h*k))); c2=c.resize((int(w*k),int(h*k))); d2=d.point(lambda v:min(255,v*8)).resize((int(w*k),int(h*k)))
o=Image.new('RGB',(a2.width*3+40,a2.height+56),(252,248,245)); dr=ImageDraw.Draw(o)
for i,(im,t) in enumerate([(a2,'letztes Bild (%.3f s)'%(${D}-1/${FPS})),(c2,'erstes Bild (0 s)'),(d2,'Differenz ×8 (mittel %.4f)'%s)]): o.paste(im,(10+i*(a2.width+10),46)); dr.text((10+i*(a2.width+10),16),t,fill=(59,58,57))
o.save(${JSON.stringify(base + '-naht.jpg')},quality=86); print('Naht-Differenz (ganzes Bild, inkl. Stationstext):',round(s,5))
`], { stdio: 'inherit' });
  fs.rmSync(dirN, { recursive: true, force: true });
  await b.close();
  console.log('Naht:', path.relative(process.cwd(), base + '-naht.mp4'), '(', (rt.length + sl.length) / FPS, 's )');
})();
