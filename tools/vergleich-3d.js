// Vorher/Nachher im 3D aus der echten Website (Überarbeitung 2): Garten, Eingang, Wohnung und Bad (Nahansicht Waschtisch).
// Je Station wird der Regler «Reinigungsfortschritt» wie ein Besucher auf 0 und 100 % gestellt (gleiche Kamera, gleiches Licht).
// Ausgabe: <ordner>/<station>-<0|100>-kunde.png (Fenster) und -ausschnitt.png (Bereich der Reinigungszonen der Station, 1:1).
// Aufruf: node tools/vergleich-3d.js [html] [ordner] [breite] [höhe]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const file = 'file://' + path.resolve(process.argv[2] || 'dist/immoready-vorschau.html');
const out = path.resolve(process.argv[3] || 'shots/vergleich-3d'); fs.mkdirSync(out, { recursive: true });
const W = +(process.argv[4] || 1280), H = +(process.argv[5] || 720);
const T = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../rise.json'), 'utf8')).tour;
const ST = [['garten', null], ['eingang', null], ['wohnung', null], ['bad', 0]];
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.addInitScript(() => { window.IR_FORCE_HQ = true; });
  await p.goto(file);
  await p.evaluate(() => document.getElementById('reise').scrollIntoView({ block: 'start', behavior: 'instant' }));
  await p.waitForFunction(() => window.__jr === true && window.__JR.state().scan.state === 'done', null, { timeout: 180000 });
  await p.evaluate(() => window.__JR.setScale(1, true));
  for (const [key, det] of ST) {
    const i = T.stations.findIndex(s => s.key === key), q = det === null ? T.stations[i].hold : T.stations[i].details[det].q;
    await p.evaluate(q => { const r = document.getElementById('reise'), top = r.getBoundingClientRect().top + scrollY, span = r.offsetHeight - innerHeight; scrollTo({ top: Math.round(top + q * span), behavior: 'instant' }); window.__JR.jump(q); }, q);
    await p.waitForTimeout(4500);
    /* Ausschnitt: Boxen der Reinigungszonen dieser Station, auf die Bühne projiziert */
    const zones = T.cleaning.zones.filter(z => z.st === key).map(z => z.box);
    const clip = await p.evaluate(Z => {
      const st = document.querySelector('#reise .jr-stage').getBoundingClientRect(), xs = [], ys = [];
      Z.forEach(B => { for (let c = 0; c < 8; c++) { const r = window.__JR.project([B[c & 1][0], B[(c >> 1) & 1][1], B[(c >> 2) & 1][2]]); if (r) { xs.push(st.left + r[0] / 100 * st.width); ys.push(st.top + r[1] / 100 * st.height); } } });
      const x0 = Math.max(st.left, Math.min(...xs) - 12), y0 = Math.max(st.top, Math.min(...ys) - 12), x1 = Math.min(st.right, Math.max(...xs) + 12), y1 = Math.min(st.bottom, Math.max(...ys) + 12);
      return { x: Math.round(x0), y: Math.round(y0), width: Math.max(40, Math.round(x1 - x0)), height: Math.max(40, Math.round(y1 - y0)) };
    }, zones);
    for (const v of [0, 100]) {
      const f0 = await p.evaluate(() => window.__JR.state().frames);
      await p.evaluate(v => { const r = document.querySelector('#reise .jr-st.on [data-cmpr]'); r.value = String(v); r.dispatchEvent(new Event('input', { bubbles: true })); }, v);
      await p.waitForFunction(f => window.__JR.state().frames > f, f0, { timeout: 120000 });
      await p.waitForTimeout(400);
      await p.screenshot({ path: path.join(out, `${key}-${v}-kunde.png`), timeout: 180000 });
      await p.screenshot({ path: path.join(out, `${key}-${v}-ausschnitt.png`), clip, timeout: 180000 });
    }
    console.log(key, 'q', q, 'Ausschnitt', clip.width + '×' + clip.height);
  }
  await b.close();
})();
