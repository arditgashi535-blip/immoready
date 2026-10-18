// Bad in fünf Reinigungszuständen aus der echten Website (Überarbeitung 2): Waschtisch-Nahansicht, Regler «Reinigungsfortschritt»
// wie ein Besucher auf 0 / 25 / 50 / 75 / 100 % gestellt (Eingabeereignis am Regler), gleiche Kamera und gleiches Licht.
// Ausgabe je Zustand: <ordner>/bad-<wert>-kunde.png (ganze Seite im Fenster) und bad-<wert>-ausschnitt.png (Waschtisch 1:1).
// Aufruf: node tools/bad-zustaende.js [html] [ordner] [breite] [höhe]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const file = 'file://' + path.resolve(process.argv[2] || 'dist/immoready-vorschau.html');
const out = path.resolve(process.argv[3] || 'shots/bad-zustaende'); fs.mkdirSync(out, { recursive: true });
const W = +(process.argv[4] || 1280), H = +(process.argv[5] || 720), Q = 0.752;
/* Waschtisch in Weltkoordinaten (src/tour/geometry.part.js): Ausschnitt um Becken, Armatur und Schürze */
const BOX = [[3.06, 1.2, 0.47], [3.58, 1.6, 1.13]];
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.addInitScript(() => { window.IR_FORCE_HQ = true; });
  await p.goto(file);
  await p.evaluate(() => document.getElementById('reise').scrollIntoView({ block: 'start', behavior: 'instant' }));
  await p.waitForFunction(() => window.__jr === true && window.__JR.state().scan.state === 'done', null, { timeout: 180000 });
  await p.evaluate(() => window.__JR.setScale(1, true));
  await p.evaluate(q => { const r = document.getElementById('reise'), top = r.getBoundingClientRect().top + scrollY, span = r.offsetHeight - innerHeight; scrollTo({ top: Math.round(top + q * span), behavior: 'instant' }); window.__JR.jump(q); }, Q);
  /* Hervorhebung beim Eintreten (≈ 2,6 s) und Textüberblendung abklingen lassen */
  await p.waitForTimeout(4500);
  const clip = await p.evaluate(B => {
    const st = document.querySelector('#reise .jr-stage').getBoundingClientRect(), xs = [], ys = [];
    for (let c = 0; c < 8; c++) { const r = window.__JR.project([B[c & 1][0], B[(c >> 1) & 1][1], B[(c >> 2) & 1][2]]); xs.push(st.left + r[0] / 100 * st.width); ys.push(st.top + r[1] / 100 * st.height); }
    const x0 = Math.max(st.left, Math.min(...xs) - 12), y0 = Math.max(st.top, Math.min(...ys) - 12), x1 = Math.min(st.right, Math.max(...xs) + 12), y1 = Math.min(st.bottom, Math.max(...ys) + 12);
    return { x: Math.round(x0), y: Math.round(y0), width: Math.round(x1 - x0), height: Math.round(y1 - y0) };
  }, BOX);
  for (const v of [0, 25, 50, 75, 100]) {
    const f0 = await p.evaluate(() => window.__JR.state().frames);
    await p.evaluate(v => { const r = document.querySelector('#reise .jr-st.on [data-cmpr]'); r.value = String(v); r.dispatchEvent(new Event('input', { bubbles: true })); }, v);
    await p.waitForFunction(f => window.__JR.state().frames > f, f0, { timeout: 120000 });
    await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(out, `bad-${v}-kunde.png`), timeout: 180000 });
    await p.screenshot({ path: path.join(out, `bad-${v}-ausschnitt.png`), clip, timeout: 180000 });
    const txt = await p.evaluate(() => document.querySelector('#reise .jr-st.on [data-cmpr]').getAttribute('aria-valuetext'));
    console.log(v, '%', txt);
  }
  await b.close();
})();
