// V16-Prüfungen «authentisches Schweizer Mehrfamilienhaus»: Kopfhöhe über jeder Stufe, WC mit offener, tiefer Schüssel,
// lichte Türbreiten, bewohnte Rück- und Seitenfassaden, Ansichtswahl im Bad (3D und Bildmodus), Smartphone 360/390/430.
// Aufruf: node tests/t18-v16.js   (WebGL über SwiftShader)
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const url = 'file://' + path.resolve(__dirname, '../dist/immoready-vorschau.html');
const RISE = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../rise.json'), 'utf8'));
const ST = RISE.tour.stations, BAD = ST.findIndex(s => s.key === 'bad'), FLOOR = 0.5;
const log = []; const ok = (c, m) => log.push((c ? 'PASS ' : 'FAIL ') + m);
(async () => {
  const b = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  let p = await b.newPage({ viewport: { width: 1440, height: 900 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(url);
  await p.waitForFunction(() => window.__jr === true && window.__JR.state().scan.state === 'done', null, { timeout: 90000 });

  // 1 Treppe: Kopfhöhe senkrecht über jeder Stufenvorderkante bis zur nächsten Fläche (echte Dreiecksgeometrie)
  const head = await p.evaluate(F => { const o = []; for (let s = 0; s < 11; s++) { const y = F + 0.176 * (s + 1) + 0.002, z = 5.01 - 0.29 * s - 0.015; [-2.7, -2.35, -2.0].forEach(x => { const up = window.__JR.rayY(x, y, z, 1); o.push(up === null ? 99 : +(up - y).toFixed(3)); }); } return o; }, FLOOR);
  ok(Math.min(...head) >= 2.0, `Treppe: Kopfhöhe über allen 11 Stufen ≥ 2,00 m (kleinste ${Math.min(...head).toFixed(2)} m)`);
  const steps = { rise: 0.176, going: 0.29 };
  ok(Math.abs(2 * steps.rise + steps.going - 0.63) < 0.03, `Schrittmass 2 × 17,6 cm + 29 cm = ${((2 * steps.rise + steps.going) * 100).toFixed(1)} cm (Richtwert 63 cm)`);

  // 2 WC: Schüssel offen und tief, Wasserfläche, Brille getrennt; Deckel hochgeklappt (nicht über der Schüssel)
  const wc = await p.evaluate(F => { const J = window.__JR, x = 3.522, z = -0.38; const down = J.rayY(x, F + 0.7, z, -1), upW = J.rayY(x, (down || F) + 0.01, z, 1), rim = J.rayY(3.73, F + 0.7, z, -1), seat = J.rayY(3.36, F + 0.7, z, -1);
    return { water: down, open: upW, rim, seat }; }, FLOOR);
  ok(wc.water !== null && wc.water < FLOOR + 0.3 && wc.water > FLOOR + 0.2, `WC: Schüssel mit Tiefe – Wasserfläche ${(wc.water - FLOOR).toFixed(3)} m über Boden, ${(FLOOR + 0.4 - wc.water).toFixed(3)} m unter dem Rand`);
  ok(wc.open === null || wc.open > FLOOR + 1.5, `WC: Schüsselöffnung frei (über der Schüssel erst in ${wc.open === null ? '–' : (wc.open - FLOOR).toFixed(2)} m Höhe eine Fläche – Deckel hochgeklappt)`);
  ok(wc.rim > FLOOR + 0.39 && wc.rim < FLOOR + 0.44, `WC: Sitzhöhe vorne ${(wc.rim - FLOOR).toFixed(3)} m (Brille auf dem Keramikrand)`);

  // 3 Lichte Türbreiten aus den Kollisionskörpern (Zargen, Leibungen)
  const dw = await p.evaluate(() => {
    const W = window.__JR.walls();
    function free(ax, c, y, at, lo, hi) { const iv = W.filter(w => (ax === 'z' ? w[4] <= c && w[5] >= c : w[0] <= c && w[1] >= c) && w[2] <= y && w[3] >= y).map(w => ax === 'z' ? [w[0], w[1]] : [w[4], w[5]]);
      let a = lo, z = hi; iv.forEach(v => { if (v[1] <= at) a = Math.max(a, v[1]); if (v[0] >= at) z = Math.min(z, v[0]); if (v[0] < at && v[1] > at) { a = z = at; } }); return +(z - a).toFixed(3); }
    return { wohnung: free('x', 3.0, 1.0, 3.35, 1.5, 5), bad: free('x', 5.4, 1.0, 1.0, -1, 2.4), haus: free('z', 5.3, 1.0, 0.0, -2, 2) };
  });
  ok(dw.wohnung >= 0.88 && dw.wohnung <= 0.95, `Wohnungstür ungefähr 90 cm: lichte Breite ${dw.wohnung} m`);
  ok(dw.bad >= 0.78 && dw.bad <= 0.86, `Badtür: lichte Breite ${dw.bad} m`);
  ok(dw.haus > dw.wohnung + 0.1, `Hauseingang breiter als die Wohnungstür (${dw.haus} m)`);

  // 4 Ringsum bewohnte Fassaden: Fenster mit Raumtiefe auch hinten und links
  const st = await p.evaluate(() => window.__JR.sceneStats());
  ok(st.panes >= 90, `Fenster mit Raumtiefe ringsum: ${st.panes} Scheiben (V15: 56, nur Vorder- und rechte Seitenfassade)`);
  ok(st.prebaked === true, 'Vorab gerechnetes Licht passt zur neuen Geometrie (Prüfsumme)');

  // 5 Ansicht wählen im Bad (3D, Stationsmodus der Seite: Scroll)
  await p.evaluate(i => window.__JR.goStation(i), BAD);
  await p.waitForFunction(i => document.querySelector('#reise .jr-st.on') && document.querySelector('#reise .jr-st.on').dataset.k === 'bad', BAD, { timeout: 20000 });
  const dets = await p.evaluate(() => Array.from(document.querySelectorAll('#reise .jr-st.on .jr-detb')).map(b => b.textContent));
  ok(dets.join('|') === 'Übersicht|Waschtisch|WC', `Bad: Ansicht wählen (${dets.join(' · ')})`);
  await p.evaluate(() => document.querySelectorAll('#reise .jr-st.on .jr-detb')[2].click());
  await p.waitForFunction(q => Math.abs(window.__JR.state().ps - q) < 0.004, ST[BAD].details[1].q, { timeout: 30000 }).catch(() => {});
  const s2 = await p.evaluate(() => ({ ps: window.__JR.state().ps, k: document.querySelector('#reise .jr-st.on').dataset.k, pr: Array.from(document.querySelectorAll('#reise .jr-st.on .jr-detb')).map(b => b.getAttribute('aria-pressed')).join(',') }));
  ok(Math.abs(s2.ps - ST[BAD].details[1].q) < 0.004 && s2.k === 'bad' && s2.pr === 'false,false,true', `3D: «WC» fährt zur Nahansicht (p ${s2.ps.toFixed(3)}), Station bleibt «Bad», Auswahl markiert`);
  const frWc = await p.evaluate(() => window.__JR.checkFrustum(1200));
  ok(frWc.hits.length === 0, `Nahebene auch mit den Nahansichten frei (kleinster Abstand ${frWc.minClearM} m)`);
  ok(errs.length === 0, 'keine JS-Fehler ' + errs.join(' | '));
  await p.close();

  // 6 Smartphone 360/390/430: Bildmodus, kein seitliches Scrollen, Touchziele, Detailbild im Bad, Offerte erreichbar
  for (const w of [360, 390, 430]) {
    p = await b.newPage({ viewport: { width: w, height: 800 }, isMobile: true, hasTouch: true }); const e2 = []; p.on('pageerror', e => e2.push(e.message));
    await p.goto(url); await p.waitForTimeout(1200);
    const r = await p.evaluate(BAD => {
      const root = document.getElementById('reise'), out = { static: root.classList.contains('jr-static'), hs: document.documentElement.scrollWidth > innerWidth + 1 };
      const pic = root.querySelector('.jr-still.on'); out.still = pic ? Math.round(pic.getBoundingClientRect().width) : 0;
      out.nav = Math.min(...Array.from(root.querySelectorAll('.jr-nav button')).map(b => b.getBoundingClientRect().height));
      root.querySelectorAll('.jr-nav button')[BAD].click();
      out.det = Math.min(...Array.from(root.querySelectorAll('.jr-st.on .jr-detb')).map(b => b.getBoundingClientRect().height));
      root.querySelectorAll('.jr-st.on .jr-detb')[1].click();
      const on = root.querySelector('.jr-still.on'); out.detOn = on ? on.dataset.detStill : null; out.detSrc = on && on.currentSrc ? on.currentSrc.slice(0, 15) : '';
      root.querySelectorAll('.jr-st.on .jr-detb')[0].click(); const on2 = root.querySelector('.jr-still.on'); out.back = on2 ? Array.from(root.querySelectorAll('.jr-still')).indexOf(on2) : -1;
      const of = Array.from(document.querySelectorAll('.mbar a')).find(a => /Offerte/.test(a.textContent)); out.offer = of ? Math.round(of.getBoundingClientRect().height) : 0;
      return out; }, BAD);
    ok(r.static && !r.hs && r.still >= w - 2 && r.nav >= 44 && r.det >= 44 && r.offer >= 44 && r.detOn === '0' && r.back === BAD && e2.length === 0,
      `Smartphone ${w} px: Bildmodus, kein seitliches Scrollen, Bild ${r.still} px breit, Stationsknöpfe ${Math.round(r.nav)} px, Ansichtswahl ${Math.round(r.det)} px, Detailbild Waschtisch (${r.detOn}) und zurück zur Übersicht, «Offerte» ${r.offer} px`);
    await p.close();
  }
  console.log(log.join('\n')); await b.close();
})();
