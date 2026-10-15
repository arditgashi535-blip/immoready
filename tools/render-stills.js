// Stationsbilder aus der echten 3D-Szene rendern (gleiches Gebäude, gleiche Route wie der Rundgang).
//   Querformat 1440×900  → assets/tour/station-0N-<key>.webp      (Desktop-Fallback, Komponente)
//   Hochformat  960×864 (10:9, V17; vorher 960×1080) → assets/tour/station-0N-<key>-hoch.webp (Smartphone ≤700 px)
// Aufruf: python3 build.py && node tools/render-stills.js && python3 build.py
// V14: alle zwölf Bilder stammen aus demselben Gebäudemodell und derselben Route wie der Rundgang (gleiches Licht, gleiche Texturen).
// Hochformat: gleiche Kamerapositionen wie im Rundgang, Blickziel auf das Motiv zentriert
// (im Querformat steht das Motiv rechts, links liegt der Text; im Hochformat steht der Text unter dem Bild).
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const PAGE = 'file://' + path.join(ROOT, 'dist/immoready-vorschau.html');
const TMP = path.join(ROOT, 'shots/stills'); fs.mkdirSync(TMP, { recursive: true });
const PORTRAIT = {
  aussen: { e: [37, 17.5, 47], t: [0.2, 4.7, 1.5], f: 0.56 },
  garten: { e: [1.2, 1.95, 20.5], t: [0.1, 1.5, 9], f: 0.74 },
  eingang: { e: [-0.35, 2.1, 4.75], t: [1.75, 1.55, 1.75], f: 0.92 },
  wohnung: { e: [5.85, 2.0, 3.6], t: [7.4, 1.5, 1.0], f: 0.95 },
  bad: { e: [5.0, 1.62, 2.05], t: [3.3, 1.0, 0.35], f: 0.95 },
  'bad-waschtisch': { e: [3.98, 1.66, 1.3], t: [3.24, 1.15, 0.8], f: 0.78 },
  'bad-wc': { e: [4.05, 1.36, 0.62], t: [3.36, 0.78, -0.38], f: 0.84 },
  zurueck: { e: [37, 17.5, 47], t: [0.2, 4.7, 1.5], f: 0.56 }
};
(async () => {
  const b = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'rise.json'), 'utf8'));
  const ST = cfg.tour.stations;
  for (const fmt of [{ w: 1440, h: 900, suffix: '' }, { w: 960, h: 864, suffix: '-hoch' }]) {
    const p = await b.newPage({ viewport: { width: fmt.w, height: fmt.h } });
    /* Bildproduktion: volle Qualität auch in der Software-Grafik dieser Umgebung (anisotrope Filterung, volle Auflösung) */
    await p.addInitScript(() => { window.IR_FORCE_HQ = true; });
    await p.goto(PAGE);
    await p.evaluate(() => { const r = document.getElementById('reise'); if (r) r.scrollIntoView({ block: 'start', behavior: 'instant' }); }); await p.waitForFunction(() => window.__jr === true && window.__JR.state().scan.state === 'done', null, { timeout: 60000 });
    await p.addStyleTag({ content: '.jr-ui,.jr-tag,.jr-tech,.jr-hot{display:none!important}.jr-stage::after{display:none!important}.hdr,.demo,.mbar{display:none!important}' });
    await p.evaluate(() => { window.__JR.setScale(1, true); });
    /* Stationen und ihre Nahansichten (rise.json → details): gleiche Szene, gleiches Licht */
    const JOBS = [];
    ST.forEach(s => { JOBS.push({ key: s.key, hold: s.hold, still: s.still }); (s.details || []).forEach(d => JOBS.push({ key: s.key + '-' + d.key, hold: d.q, still: d.still })); });
    for (let i = 0; i < JOBS.length; i++) {
      const s = JOBS[i];
      await p.evaluate(([q, cam]) => {
        const r = document.getElementById('reise'); const top = r.getBoundingClientRect().top + scrollY;
        scrollTo({ top: Math.round(top + q * (r.offsetHeight - innerHeight)), behavior: 'instant' });
        window.__JR.jump(q); window.__JR.setCamera(cam);
      }, [s.hold, fmt.suffix ? PORTRAIT[s.key] : null]);
      await p.waitForTimeout(400);
      await p.evaluate(() => window.__JR.setScale(1, true));
      await p.waitForFunction(() => { const s = window.__JR.state(); return Math.abs(s.p - s.ps) < 0.0004; }, null, { timeout: 60000, polling: 250 });
      await p.waitForTimeout(2600);
      const png = path.join(TMP, `${s.still}${fmt.suffix}.png`);
      /* V17.1: Ausschnitt der Bühne statt Element-Screenshot (kein Warten auf «stabil» bei langsamer Software-Grafik) */
      const bb = await p.evaluate(() => { const r = document.querySelector('#reise .jr-stage').getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; });
      await p.screenshot({ path: png, clip: bb, timeout: 120000 });
      const out = path.join(ROOT, 'assets/tour', `${s.still}${fmt.suffix}.webp`);
      execFileSync('python3', ['-c', `from PIL import Image;im=Image.open(${JSON.stringify(png)}).convert('RGB');im=im.resize((${fmt.w},${fmt.h}),Image.LANCZOS) if im.size!=(${fmt.w},${fmt.h}) else im;im.save(${JSON.stringify(out)},'WEBP',quality=82,method=6)`]);
      console.log(out.replace(ROOT + '/', ''), fs.statSync(out).size, 'Bytes');
    }
    await p.evaluate(() => window.__JR.setCamera(null));
    await p.close();
  }
  await b.close();
})();
