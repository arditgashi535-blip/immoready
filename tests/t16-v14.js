// V14-Prüfungen «realistische Architekturvisualisierung»: Materialtexturen, vorab gerechnetes Licht, Wandstärken und
// Türöffnungen, Raumhöhe, Objektivverschiebung (senkrechte Kanten), weiche Belichtungsanpassung, keine ausgebrannten
// Flächen, Kennzeichnung als illustrative Visualisierung, Ersatzwege ohne Texturen bzw. ohne Lichtdaten, Smartphone.
// Aufruf: node tests/t16-v14.js   (WebGL über SwiftShader)
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const url = 'file://' + path.resolve(__dirname, '../dist/immoready-vorschau.html');
const RISE = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../rise.json'), 'utf8'));
const log = []; const ok = (c, m) => log.push((c ? 'PASS ' : 'FAIL ') + m);
(async () => {
  const b = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  let p = await b.newPage({ viewport: { width: 1440, height: 900 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(url);
  await p.evaluate(() => { const r = document.getElementById('reise'); if (r) r.scrollIntoView({ block: 'start', behavior: 'instant' }); }); await p.waitForFunction(() => window.__jr === true && window.__JR.state().scan.state === 'done', null, { timeout: 90000 });
  const st = await p.evaluate(() => window.__JR.sceneStats());
  ok(st.textures === 'ready', `Materialtexturen geladen und gepackt (Zustand ${st.textures}, Anisotropie ${st.anisotropy}, Software-Grafik ${st.softwareGL})`);
  ok(st.prebaked === true, `Vorab gerechnetes Licht passt zur Geometrie (Umgebungsverdeckung + weiche Schatten aktiv)`);
  ok(st.panes >= 40 && st.glass >= 6 && st.cards >= 1000 && st.halos >= 8, `Fenster mit Raumtiefe ${st.panes}, echte Glasflächen ${st.glass}, Laubkarten ${st.cards}, Lichthöfe ${st.halos}`);
  ok(await p.evaluate(l => { const t = document.querySelector('#reise .jr-tag'); return t && t.textContent.trim() === l && getComputedStyle(t).display !== 'none'; }, RISE.tour.scene.label), `Kennzeichnung sichtbar: «${RISE.tour.scene.label}»`);
  ok(await p.evaluate(() => Array.from(document.querySelectorAll('#reise .jr-still')).every(i => /Illustrative Visualisierung: .* – kein Referenzobjekt/.test(i.alt))), 'Stationsbilder: Alternativtext «Illustrative Visualisierung … – kein Referenzobjekt»');
  // Wandstärken, Öffnungen, Raumhöhe aus den Kollisionskörpern
  const geo = await p.evaluate(() => {
    const W = window.__JR.walls();
    function free(ax, c, y, at, lo, hi) { // freie Strecke entlang der Wand durch Punkt «at»
      const iv = W.filter(w => (ax === 'z' ? w[4] <= c && w[5] >= c : w[0] <= c && w[1] >= c) && w[2] <= y && w[3] >= y).map(w => ax === 'z' ? [w[0], w[1]] : [w[4], w[5]]).sort((a, b) => a[0] - b[0]);
      let a = lo, z = hi; iv.forEach(v => { if (v[1] <= at) a = Math.max(a, v[1]); if (v[0] >= at) z = Math.min(z, v[0]); if (v[0] < at && v[1] > at) { a = z = at; } });
      return +(z - a).toFixed(3);
    }
    const front = W.filter(w => w[4] >= 5.0 && w[5] <= 5.51 && w[3] > 5);
    const thick = front.length ? Math.min(...front.map(w => w[5] - w[4])) : 0;
    const inner = W.filter(w => Math.abs(w[2] - 0.5) < 0.01 && Math.abs(w[3] - 3.1) < 0.01 && Math.min(w[1] - w[0], w[5] - w[4]) < 0.2);
    return { thick: +thick.toFixed(3), haustuer: free('z', 5.3, 1.0, 0.0, -2, 2), terrasse: free('z', 5.3, 1.0, 6.8, 5, 9), wohnungstuer: free('x', 3.0, 1.0, 3.3, 1.5, 5), bad: free('x', 5.4, 1.0, 1.0, -1, 2.4), durchgang: free('x', 5.4, 1.0, 3.3, 2.4, 5), innen: inner.length };
  });
  ok(geo.thick >= 0.35, `Aussenwand mit Dämmung und Putz: ${geo.thick} m stark`);
  ok(geo.haustuer >= 1.0 && geo.wohnungstuer >= 0.9 && geo.bad >= 0.8 && geo.durchgang >= 0.9 && geo.terrasse >= 0.9, `Lichte Türöffnungen (m): Haustür ${geo.haustuer}, Wohnungstür ${geo.wohnungstuer}, Bad ${geo.bad}, Durchgang Wohnen ${geo.durchgang}, Terrassentür-Rahmen ${geo.terrasse}`);
  ok(geo.innen >= 6, `Innenwände mit lichter Raumhöhe 2,60 m (${geo.innen} Wandkörper, Boden 0,50 → Decke 3,10)`);
  // Objektivverschiebung: senkrechte Gebäudekante bleibt im Bild senkrecht (Gesamtansicht und Garten)
  for (const q of [0.03, 0.235]) {
    await p.evaluate(q => window.__JR.jump(q), q); await p.waitForTimeout(400);
    const pr = await p.evaluate(() => [window.__JR.project([9, 1, 5.5]), window.__JR.project([9, 12, 5.5]), window.__JR.project([-9, 1, 5.5]), window.__JR.project([-9, 12, 5.5])]);
    const dx = Math.max(Math.abs(pr[0][0] - pr[1][0]), Math.abs(pr[2][0] - pr[3][0]));
    ok(dx < 0.15, `Senkrechte Kanten bleiben senkrecht bei p=${q} (Abweichung ${dx.toFixed(3)} % der Bildbreite über 11 m Höhe)`);
  }
  // keine ausgebrannten Flächen: Anteil voll gesättigter Pixel je Station
  const fs2 = [];
  for (const s of RISE.tour.stations) { await p.evaluate(q => window.__JR.jump(q), s.hold); await p.waitForTimeout(300); fs2.push([s.key, await p.evaluate(() => window.__JR.frameStats())]); }
  ok(fs2.every(x => x[1].clipped < 0.01), 'Keine ausgebrannten Fenster/Leuchten: Anteil weisser Pixel je Station ' + fs2.map(x => x[0] + ' ' + (x[1].clipped * 100).toFixed(2) + ' %').join(', '));
  ok(fs2.every(x => x[1].mean > 0.08 && x[1].mean < 0.75), 'Belichtung je Station im brauchbaren Bereich (mittlere Helligkeit ' + fs2.map(x => x[1].mean).join(', ') + ')');
  const inside = fs2.filter(x => ['eingang', 'wohnung', 'bad'].includes(x[0])).map(x => x[1].mean), outside = fs2.filter(x => ['aussen', 'garten'].includes(x[0])).map(x => x[1].mean);
  ok(Math.min(...inside) > Math.max(...outside), `Innenräume ausreichend hell (min. ${Math.min(...inside)}) gegenüber der Dämmerung aussen (max. ${Math.max(...outside)})`);
  // weiche Belichtungsanpassung beim Hineinfahren (nicht sprunghaft)
  const H = await p.evaluate(() => { const r = document.getElementById('reise'); return [r.getBoundingClientRect().top + scrollY, r.offsetHeight - innerHeight]; });
  await p.evaluate(q => window.__JR.jump(q), 0.3); await p.waitForTimeout(600);
  const e0 = await p.evaluate(() => window.__JR.state().expo);
  await p.evaluate(q => window.__JR.jump(q), 0.44); await p.evaluate(() => { window.__JR.setProgress(0.4401); });
  const ex = []; for (let k = 0; k < 12; k++) { await p.waitForTimeout(150); ex.push(await p.evaluate(() => window.__JR.state().expo)); }
  console.log(`Info: Belichtung aussen ${e0.toFixed(3)} → innen ${ex[ex.length - 1].toFixed(3)}`);
  await p.evaluate(q => window.__JR.jump(q), 0.3); await p.waitForTimeout(800);
  await p.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), Math.round(H[0] + 0.44 * H[1]));
  const ex2 = []; for (let k = 0; k < 20; k++) { await p.waitForTimeout(200); ex2.push(+(await p.evaluate(() => window.__JR.state().expo)).toFixed(3)); }
  const distinct = new Set(ex2).size;
  ok(distinct >= 3 && ex2[ex2.length - 1] < e0, `Weiche Belichtungsanpassung beim Eintreten: ${distinct} Zwischenwerte (${ex2.slice(0, 8).join(' → ')} …)`);
  ok(errs.length === 0, 'keine JS-Fehler ' + errs.join(' | '));
  await p.close();
  // Bewegung reduzieren: Belichtung springt ohne Übergang, kein Wind
  p = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await p.addInitScript(() => { window.IR_EMBED = 1; }); // Stationsmodus (Scrollmodus zeigt bei «Bewegung reduzieren» Standbilder)
  await p.goto(url);
  await p.evaluate(() => { const r = document.getElementById('reise'); if (r) r.scrollIntoView({ block: 'start', behavior: 'instant' }); }); await p.waitForFunction(() => window.__jr === true, null, { timeout: 90000 }).catch(() => {});
  if (await p.evaluate(() => window.__jr === true)) {
    await p.evaluate(() => window.__JR.goStation(3)); await p.waitForFunction(() => { const s = window.__JR.state(); return Math.abs(s.p - s.ps) < 0.0004; }, null, { timeout: 30000 }).catch(() => {});
    await p.waitForTimeout(600); const w = await p.evaluate(() => window.__JR.state().wind);
    await p.evaluate(() => window.__JR.goStation(0)); await p.waitForTimeout(2500); const w2 = await p.evaluate(() => window.__JR.state().wind);
    ok(!w && !w2, 'Bewegung reduzieren: keine Pflanzenbewegung');
  } else ok(false, 'Bewegung reduzieren: Stationsmodus nicht gestartet');
  await p.close();
  // Ersatzwege: ohne vorab gerechnetes Licht, ohne Texturen
  for (const v of [{ k: 'IR_BAKE', t: 'ohne vorab gerechnetes Licht' }, { k: 'IR_TEX', t: 'ohne Materialtexturen' }]) {
    p = await b.newPage({ viewport: { width: 1200, height: 800 } }); const e2 = []; p.on('pageerror', e => e2.push(e.message));
    await p.addInitScript(k => { Object.defineProperty(window, k, { get() { return null; }, set() {}, configurable: true }); }, v.k);
    await p.goto(url);
    await p.evaluate(() => { const r = document.getElementById('reise'); if (r) r.scrollIntoView({ block: 'start', behavior: 'instant' }); }); const okk = await p.waitForFunction(() => window.__jr === true && document.getElementById('reise').classList.contains('jr-ready'), null, { timeout: 90000 }).then(() => true).catch(() => false);
    const s2 = await p.evaluate(() => window.__JR.sceneStats());
    ok(okk && e2.length === 0 && (v.k === 'IR_BAKE' ? s2.prebaked === false : s2.textures === 'off'), `Ersatzweg ${v.t}: Szene läuft (Licht ${s2.prebaked ? 'vorab' : 'zur Laufzeit'}, Texturen ${s2.textures})`);
    await p.close();
  }
  // Smartphone: Standbilder, keine 3D-Daten entpackt
  p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); await p.goto(url); await p.waitForTimeout(2500);
  const m = await p.evaluate(() => ({ st: document.getElementById('reise').classList.contains('jr-static'), s: window.__JR.sceneStats() }));
  ok(m.st && m.s.textures === 'none' && m.s.bakeState === 'none', 'Smartphone: Stationsbilder, Texturen und Lichtdaten werden nicht geladen/entpackt');
  await p.close();
  console.log(log.join('\n')); await b.close();
})();
