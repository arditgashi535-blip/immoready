// t27 – Korrektur «3D-Gebäudereise»: zusammenhängende Fahrt, Steuerung, Handy-3D auf Wunsch, Rückkehr ohne Wiederholung
//  · Route: Gesamtansicht → Garten → Haustür (öffnet) → Treppenhaus (Treppe kurz im Bild) → Wohnungstür → Wohnung → Bad
//    (Raum → Waschtisch → WC) → Terrassentür → Gesamtansicht; kollisionsfrei (checkRoute), vorwärts = rückwärts
//  · Desktop: Scrollen steuert, Stationsknöpfe springen, rückwärts scrollen, «Tour überspringen» und «Offerte» erreichbar
//  · Ende: Gesamtansicht bleibt stehen (keine automatische Wiederholung), «Tour erneut starten» führt zum Anfang
//  · Spiegel im Bad: echte Spiegelung auch beim Blick durch die Tür (nicht die grobe Reflexionsaufnahme)
//  · Handy: Bildmodus mit «3D-Ansicht starten»; 3D im Bildrahmen (Stationsmodus, Seite scrollt normal), zurück zu Bildern;
//    zu langsame Darstellung → automatisch Bilder mit Hinweis; Bewegung reduzieren / ohne WebGL: Bilder mit allen Aktionen
// Aufruf: node tests/t27-reise.js
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const url = 'file://' + path.join(ROOT, 'dist/immoready-vorschau.html');
const RT = JSON.parse(fs.readFileSync(path.join(ROOT, 'rise.json'), 'utf8')).tour;
const log = []; const ok = (c, m) => log.push((c ? 'PASS ' : 'FAIL ') + m);
const GPU = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const mob = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };
(async () => {
  const b = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: GPU });
  try {
    /* 1 Desktop: Route, Türen, Treppe, Spiegel */
    let p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(url);
    await p.evaluate(() => document.getElementById('reise').scrollIntoView({ block: 'start', behavior: 'instant' }));
    await p.waitForFunction(() => window.__jr === true, null, { timeout: 150000 });
    const r = await p.evaluate(R => {
      const t = window.__JR, route = t.checkRoute(600), kf = R.keyframes.map(k => k.p);
      return { route, kf: kf.length, stations: R.stations.map(s => s.key), hold: R.stations.map(s => s.hold), doors: R.doors.map(x => x.id),
        stair: (() => { const k = R.keyframes.find(k => k.p > 0.39 && k.p < 0.44); return k ? k.lookAt[0] : null; })() };
    }, RT);
    ok(r.route.length === 0, 'Kamerafahrt kollisionsfrei über 600 Schritte (checkRoute: ' + JSON.stringify(r.route.slice(0, 4)) + ')');
    ok(r.stations.join() === 'aussen,garten,eingang,wohnung,bad,zurueck' && r.kf >= 32, 'zusammenhängende Reise in 6 Stationen, ' + r.kf + ' Stützpunkte');
    ok(r.stair !== null && r.stair < -2, 'zwischen Haustür und Halt «Eingang» schwenkt die Kamera zur Treppe');
    ok(r.doors.join() === 'haustuer,wohnungstuer,terrassentuer', 'drei Türen: Haustür, Wohnungstür, Terrassentür');
    /* Spiegel: Kamera in der Wohnung mit Blick durch die Badtür → echte Spiegelung */
    const m0 = await p.evaluate(() => window.__JR.sceneStats().mirrorFrames);
    await p.evaluate(() => window.__JR.jump(0.7)); await p.waitForFunction(m => window.__JR.sceneStats().mirrorFrames > m, m0, { timeout: 60000 }).catch(() => {});
    ok(await p.evaluate(m => window.__JR.sceneStats().mirrorFrames > m, m0), 'Blick durch die Badtür (p 0,70): echte Spiegelung statt grober Reflexionsaufnahme');
    /* Stationsknöpfe, vorwärts/rückwärts */
    const nav = await p.evaluate(async R => {
      const t = window.__JR, btn = [...document.querySelectorAll('#reise .jr-nav button')], out = [];
      for (const i of [4, 1, 5, 2]) { btn[i].click(); await new Promise(r => setTimeout(r, 150)); out.push([i, Math.round(t.state().p * 1000) / 1000, document.querySelector('#reise .jr-nav button.on') === btn[i]]); }
      return { out, holds: R.stations.map(s => s.hold) };
    }, RT);
    ok(nav.out.every(([i, q, on]) => Math.abs(q - nav.holds[i]) < 0.01 && on), 'Stationsknöpfe springen (auch rückwärts) und markieren die Station: ' + JSON.stringify(nav.out));
    const back = await p.evaluate(async () => { const r = document.getElementById('reise'), top = r.getBoundingClientRect().top + scrollY, span = r.offsetHeight - innerHeight;
      const until = async q => { for (let k = 0; k < 100 && Math.abs(window.__JR.state().p - q) > 0.02; k++) await new Promise(x => setTimeout(x, 100)); return window.__JR.state().p; };
      scrollTo({ top: top + span * 0.75, behavior: 'instant' }); const a = await until(0.75);
      scrollTo({ top: top + span * 0.25, behavior: 'instant' }); const c = await until(0.25); return [a, c]; });
    ok(Math.abs(back[0] - 0.75) < 0.02 && Math.abs(back[1] - 0.25) < 0.02, 'Scrollen steuert die Reise vorwärts und rückwärts (' + back.map(x => x.toFixed(3)).join(' → ') + ')');
    const reach = await p.evaluate(() => { const v = s => { const e = document.querySelector(s); if (!e) return false; const q = e.getBoundingClientRect(); return q.width > 0 && q.height > 0 && getComputedStyle(e).visibility !== 'hidden'; }; return [v('#reise .jr-skip-a'), v('#reise .jr-skip-o') || v('.hdr .btn')]; });
    ok(reach[0] && reach[1], '«Tour überspringen» und «Offerte anfragen» erreichbar');
    /* Ende: keine Wiederholung, «Tour erneut starten» */
    await p.evaluate(() => window.__JR.goStation(5)); await p.waitForTimeout(2500);
    const end = await p.evaluate(() => ({ p: window.__JR.state().p, re: !!document.querySelector('#reise .jr-st[data-k="zurueck"] [data-go="0"]') }));
    await p.waitForTimeout(2500);
    const end2 = await p.evaluate(() => window.__JR.state().p);
    ok(end.p > 0.99 && end2 > 0.99, 'nach der Rückkehr bleibt die Gesamtansicht stehen (keine automatische Wiederholung)');
    ok(end.re, 'letzte Station: «Tour erneut starten»');
    await p.evaluate(() => document.querySelector('#reise .jr-st[data-k="zurueck"] [data-go="0"]').click()); await p.waitForTimeout(400);
    ok(await p.evaluate(() => window.__JR.state().p < 0.05 && document.querySelector('#reise .jr-nav button.on').textContent.trim() === 'Gebäude'), '«Tour erneut starten» führt zur Gesamtansicht am Anfang');
    await p.close();
    /* 2 Handy: Bildmodus, 3D auf Wunsch */
    p = await b.newPage(mob); await p.addInitScript(() => { window.IR_NO_PERF_FALLBACK = true; }); await p.goto(url); await p.waitForTimeout(800);
    await p.evaluate(() => document.getElementById('reise').scrollIntoView({ block: 'start', behavior: 'instant' })); await p.waitForTimeout(500);
    const s0 = await p.evaluate(() => { const r = document.getElementById('reise'), b3 = r.querySelector('[data-3d]'); return { st: r.classList.contains('jr-static'), btn: b3 && !b3.hidden, h: b3 && b3.getBoundingClientRect().height, label: b3 && b3.textContent.trim() }; });
    ok(s0.st && s0.btn && s0.h >= 48 && s0.label === '3D-Ansicht starten', 'Handy: Bildmodus mit «3D-Ansicht starten» (≥ 48 px) ' + JSON.stringify(s0));
    await p.click('#reise [data-3d]');
    await p.waitForFunction(() => window.__JR.state().inline3d && window.__JR.state().ready, null, { timeout: 150000 }).catch(() => {});
    await p.waitForTimeout(700); /* Überblendung Bild → 3D */
    const s1 = await p.evaluate(() => { const r = document.getElementById('reise'), c = r.querySelector('.jr-canvas'), st = window.__JR.state();
      return { inl: st.inline3d, ready: st.ready, mode: st.mode, cv: c && getComputedStyle(c).display !== 'none' && +getComputedStyle(c).opacity > 0.5, rh: r.offsetHeight, vh: innerHeight, label: r.querySelector('[data-3d]').textContent.trim(), canvas: st.canvas, css: st.css }; });
    ok(s1.inl && s1.ready && s1.mode === 'button' && s1.cv, 'Handy: 3D läuft im Bildrahmen (Stationsmodus)');
    ok(s1.rh < s1.vh * 2.5, 'Handy-3D ohne Scrollfalle: Abschnitt ' + s1.rh + ' px hoch (Bildschirm ' + s1.vh + ' px), Seite scrollt normal');
    ok(s1.canvas && Math.abs(s1.canvas[0] / s1.canvas[1] - s1.css[0] / s1.css[1]) < 0.02, 'Handy-3D: Zeichenfläche passend zum Bildrahmen (' + (s1.canvas || []).join('×') + ')');
    await p.evaluate(() => document.querySelectorAll('#reise .jr-nav button')[4].click()); await p.waitForTimeout(400);
    ok(await p.evaluate(h => Math.abs(window.__JR.state().p - h) < 0.01, RT.stations[4].hold), 'Handy-3D: Station «Sanitär» per Knopf');
    const y0 = await p.evaluate(() => scrollY); const bx = await p.locator('#reise .jr-stage').boundingBox();
    await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await p.mouse.wheel(0, 600);
    await p.waitForFunction(y => scrollY > y + 100, y0, { timeout: 8000 }).catch(() => {});
    ok(await p.evaluate(y => scrollY > y + 100, y0), 'Handy-3D: Mausrad über der Szene scrollt die Seite weiter (kein Festhalten)');
    await p.evaluate(() => document.getElementById('reise').scrollIntoView({ block: 'start', behavior: 'instant' }));
    ok(s1.label === 'Bilder statt 3D', 'Umschalter heisst im 3D «Bilder statt 3D»');
    await p.evaluate(() => document.querySelector('#reise [data-3d]').click()); await p.waitForTimeout(500);
    const s2 = await p.evaluate(() => ({ st: window.__JR.state(), still: !!document.querySelector('#reise .jr-still.on') }));
    ok(s2.st.mode === 'static' && !s2.st.inline3d && !s2.st.running && s2.still, 'zurück zu Bildern: Renderschleife beendet, Stationsbild sichtbar');
    await p.evaluate(() => document.querySelector('#reise [data-3d]').click());
    await p.waitForFunction(() => window.__JR.state().inline3d && window.__JR.state().ready, null, { timeout: 150000 }).catch(() => {});
    ok(await p.evaluate(() => window.__JR.state().ready && window.__JR.state().inline3d), '3D lässt sich erneut starten (frische Zeichenfläche)');
    await p.close();
    /* 3 Handy: zu langsam → automatisch Bilder */
    p = await b.newPage(mob); const errs = []; await p.exposeFunction('__err', d => errs.push(d));
    /* langsames Gerät nachgestellt: Grenze 1 ms statt 60 ms (die Messung und der Rückfall sind dieselben) */
    await p.addInitScript(() => { window.IR_PERF_MS = 1; });
    await p.goto(url); await p.waitForTimeout(500);
    await p.evaluate(() => { document.getElementById('reise').addEventListener('tour-error', e => window.__err(e.detail)); });
    await p.evaluate(() => document.getElementById('reise').scrollIntoView({ block: 'start', behavior: 'instant' }));
    await p.click('#reise [data-3d]');
    await p.waitForFunction(() => window.__JR.state().inline3d && window.__JR.state().ready, null, { timeout: 150000 }).catch(() => {});
    /* Bewegung erzeugen, damit Bildzeiten gemessen werden */
    for (const i of [1, 2, 3, 4]) { await p.evaluate(i => document.querySelectorAll('#reise .jr-nav button')[i].click(), i); await p.waitForTimeout(1500); }
    await p.waitForFunction(() => !window.__JR.state().inline3d, null, { timeout: 120000 }).catch(() => {});
    const s3 = await p.evaluate(() => ({ st: window.__JR.state(), note: document.querySelector('#reise .jr-3d-note').textContent, hid: document.querySelector('#reise .jr-3d-note').hidden }));
    ok(!s3.st.inline3d && s3.st.mode === 'static' && !s3.hid && /nicht flüssig/.test(s3.note) && errs.some(e => e.code === 'TOO_SLOW'), 'zu langsame Darstellung → Bilder derselben Szene mit Hinweis (tour-error TOO_SLOW)');
    await p.close();
    /* 4 Bewegung reduzieren und ohne WebGL: Bilder mit allen Aktionen */
    for (const [n, opt, init] of [['Bewegung reduzieren', { ...mob, reducedMotion: 'reduce' }, null], ['ohne WebGL (Desktop)', { viewport: { width: 1440, height: 900 } }, () => { HTMLCanvasElement.prototype.getContext = function () { return null; }; }]]) {
      p = await b.newPage(opt); if (init) await p.addInitScript(init); await p.goto(url); await p.waitForTimeout(600);
      await p.evaluate(() => document.getElementById('reise').scrollIntoView({ block: 'start', behavior: 'instant' }));
      await p.waitForFunction(() => document.getElementById('reise').classList.contains('jr-static'), null, { timeout: 60000 }).catch(() => {});
      const s = await p.evaluate(() => { const r = document.getElementById('reise'); return { st: r.classList.contains('jr-static'), nav: r.querySelectorAll('.jr-nav button').length, pre: r.querySelectorAll('[data-pre]').length, still: !!r.querySelector('.jr-still.on') }; });
      await p.evaluate(() => document.querySelectorAll('#reise .jr-nav button')[4].click()); await p.waitForTimeout(300);
      const on = await p.evaluate(() => document.querySelector('#reise .jr-st.on').dataset.k);
      ok(s.st && s.nav === 6 && s.pre >= 6 && s.still && on === 'bad', n + ': Bilder derselben Szene, 6 Stationen, Anfrageaktionen, Station «Bad» per Knopf');
      await p.close();
    }
  } catch (e) { ok(false, 'Ausnahme: ' + e.message); }
  await b.close();
  console.log(log.join('\n'));
  const f = log.filter(l => l.startsWith('FAIL')).length; console.log('\nt27: ' + (log.length - f) + '/' + log.length + ' bestanden');
  process.exit(f ? 1 : 0);
})();
