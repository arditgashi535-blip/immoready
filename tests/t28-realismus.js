// t28 – Realismus-Auftrag: Schmutz → sauber, Vergleich Vorher/Nachher, Tageslicht, Demo-Rundlauf
//  · Reinigungszonen aus rise.json (Weltkoordinaten, fester Startwert): Zustand nur aus dem Fortschritt – vorwärts = rückwärts,
//    zwei Bilder bei gleicher Kamera identisch (kein Flimmern), Vorher/halb/Nachher sichtbar verschieden
//  · Vergleich an der Station: «Vorher», «Nachher», Regler «Reinigungsfortschritt» (Maus und Tastatur), Hinweis «kein Kundenergebnis»,
//    Stationswechsel stellt den Fortschrittszustand her; Bildmodus: «Vorher»-Bild derselben Kamera
//  · Licht: Tageslicht beim Start, Dämmerung umschaltbar; im Tageslicht keine ausgebrannten Flächen, brauchbare Belichtung,
//    weiche Anpassung beim Eintreten (Gegenstück zu den Dämmerungsprüfungen in t16)
//  · Demo-Rundlauf: nur auf Knopfdruck, Start/Pause/Fortsetzen/Beenden, Naht hinter der Hecke ohne sichtbaren Sprung,
//    Rücksprung «schmutzig» nur verdeckt, eigenes Scrollen oder Stationswahl beenden die Demo, eine Schleife, unsichtbar = Stillstand,
//    nicht bei «Bewegung reduzieren», nach destroy() keine Bilder mehr
// Aufruf: node tests/t28-realismus.js
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const url = 'file://' + path.join(ROOT, 'dist/immoready-vorschau.html');
const RT = JSON.parse(fs.readFileSync(path.join(ROOT, 'rise.json'), 'utf8')).tour;
const log = []; const ok = (c, m) => log.push((c ? 'PASS ' : 'FAIL ') + m);
const GPU = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const mob = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };
const gmax = (a, b) => Math.max(...a.map((c, i) => (Math.abs(c[0] - b[i][0]) + Math.abs(c[1] - b[i][1]) + Math.abs(c[2] - b[i][2])) / (3 * 255)));
const gdiff = (a, b) => a.reduce((s, c, i) => s + Math.abs(c[0] - b[i][0]) + Math.abs(c[1] - b[i][1]) + Math.abs(c[2] - b[i][2]), 0) / (a.length * 3 * 255);
const frames = p => p.evaluate(() => window.__JR.state().frames);
const nextFrame = async (p, f0) => p.waitForFunction(f => window.__JR.state().frames > f, f0, { timeout: 120000 });
(async () => {
  const b = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: GPU });
  try {
    /* 1 Desktop 3D: Zonen, Determinismus, Sichtbarkeit */
    /* volle Materialqualität wie auf echten GPUs (die Software-Grafik dieser Umgebung rechnet sonst ohne Glanz und Spiegelung) */
    let p = await b.newPage({ viewport: { width: 1280, height: 800 } }); await p.addInitScript(() => { window.IR_FORCE_HQ = true; });
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto(url);
    await p.evaluate(() => document.getElementById('reise').scrollIntoView({ block: 'start', behavior: 'instant' }));
    await p.waitForFunction(() => window.__jr === true && window.__JR.state().scan.state === 'done', null, { timeout: 180000 });
    const z = await p.evaluate(() => window.__JR.cleanZones());
    ok(z.length === RT.cleaning.zones.length && z.length <= 6 && ['garten', 'eingang', 'wohnung', 'bad'].every(k => z.some(x => x.st === k)), 'Reinigungszonen aus rise.json: ' + z.map(x => x.id).join(', '));
    const fb = await p.evaluate(() => { const t = window.__JR, at = q => { t.jump(q); return t.cleanZones().map(x => +x.v.toFixed(4)); }; const a = at(0.216), c = at(0.6), d = at(0.216), e = at(0.0), f = at(1.0); return { a, d, e, f }; });
    ok(JSON.stringify(fb.a) === JSON.stringify(fb.d), 'Reinigungszustand nur aus dem Fortschritt: vorwärts = rückwärts (p 0,216: ' + fb.a.join('/') + ')');
    ok(fb.e.every(v => v === 0) && fb.f.every(v => v === 1), 'am Anfang alles «Vorher», am Ende alles «Nachher»');
    /* Bad-Nahansicht: Vorher / halb / Nachher bei gleicher Kamera */
    await p.evaluate(() => window.__JR.goStation(4)); await p.waitForTimeout(800);
    const g = await p.evaluate(() => { const t = window.__JR, out = {}; t.jump(0.752); for (const v of [0, 0.5, 1]) { t.setClean('bad', v); out[v] = t.frameGrid(64, 40, 0); } out.again = t.frameGrid(64, 40, 0); t.setClean('bad', null); return out; });
    /* die Zonen im Bad sind klein (Armatur, Becken): lokale Änderung je Rasterfeld statt Bildmittel */
    const d01 = gmax(g[0], g[1]), d0h = gmax(g[0], g['0.5']), dh1 = gmax(g['0.5'], g[1]), dst = gdiff(g[1], g.again);
    ok(d01 > 0.02, 'Bad: Vorher und Nachher sichtbar verschieden (grösste Änderung je Rasterfeld ' + (d01 * 100).toFixed(1) + ' %)');
    ok(d0h > 0.005 && dh1 > 0.005, 'Bad: halber Zustand ist weder «Vorher» noch «Nachher» (Wischkante: ' + (d0h * 100).toFixed(1) + ' % / ' + (dh1 * 100).toFixed(1) + ' %)');
    ok(dst < 0.0005, 'Bad: zwei Bilder bei gleicher Kamera und gleichem Zustand identisch – kein Flimmern (' + dst.toFixed(5) + ')');
    const fd = await p.evaluate(() => { window.__JR.setClean('bad', 0.5); const v = window.__JR.frameDiff(); window.__JR.setClean('bad', null); return v; });
    ok(fd < 0.0005, 'Wischkante (halb gereinigt): frameDiff ' + fd.toFixed(5));
    /* Gartenweg und Halle ebenfalls sichtbar */
    for (const [st, q] of [['garten', 0.235], ['eingang', 0.44], ['wohnung', 0.59]]) {
      const dd = await p.evaluate(([st, q]) => { const t = window.__JR; t.jump(q); t.setClean(st, 0); const a = t.frameGrid(24, 15, 0); t.setClean(st, 1); const c = t.frameGrid(24, 15, 0); t.setClean(st, null); return [a, c]; }, [st, q]);
      ok(gdiff(dd[0], dd[1]) > 0.0015, 'Station ' + st + ': Vorher/Nachher sichtbar verschieden (' + gdiff(dd[0], dd[1]).toFixed(4) + ')');
    }
    /* 2 Vergleichsbedienung – Überarbeitung 2: der Vergleich steht nur dort, wo eine Reinigungszone im Bild liegt; in der Bad-Übersicht
       ist der Unterschied unsichtbar (kein «Vorher»-Bild), an der Nahansicht Waschtisch wird er angeboten */
    await p.evaluate(() => window.__JR.goStation(4)); await p.waitForTimeout(800);
    await p.waitForFunction(() => { const s = window.__JR.state(); return Math.abs(s.p - s.ps) < 0.002; }, null, { timeout: 120000 }).catch(() => {});
    ok(await p.evaluate(() => { const g = document.querySelector('#reise .jr-st.on .jr-cmp'); return !!g && getComputedStyle(g).display === 'none'; }), 'Bad-Übersicht (Reinigung im Bild nicht erkennbar): kein Vergleich');
    await p.click('#reise .jr-st.on [data-det-i="0"]');
    await p.waitForFunction(() => { const s = window.__JR.state(); return Math.abs(s.p - 0.752) < 0.002 && Math.abs(s.p - s.ps) < 0.002; }, null, { timeout: 120000 }).catch(() => {});
    await p.waitForTimeout(300);
    const cmp0 = await p.evaluate(() => { const s = document.querySelector('#reise .jr-st.on'), g = s.querySelector('.jr-cmp'); return g && { b: [...g.querySelectorAll('[data-cmp]')].map(x => x.textContent.trim()), r: !!g.querySelector('input[type=range][data-cmpr]'), rl: g.querySelector('.jr-cmpr span').textContent.trim(), n: g.querySelector('.jr-cmpn').textContent.trim(), h: Math.min(...[...g.querySelectorAll('[data-cmp]')].map(x => x.getBoundingClientRect().height)), aria: g.getAttribute('role') }; });
    ok(cmp0 && cmp0.b.join() === 'Vorher,Nachher' && cmp0.r && cmp0.rl === 'Reinigungsfortschritt' && cmp0.aria === 'group', 'Bad, Nahansicht Waschtisch: «Vorher», «Nachher» und Regler «Reinigungsfortschritt»');
    ok(cmp0 && /kein Kundenergebnis/.test(cmp0.n) && cmp0.h >= 44, 'Hinweis «Illustration eines Arbeitsablaufs, kein Kundenergebnis.», Knöpfe ≥ 44 px');
    await p.click('#reise .jr-st.on [data-cmp="0"]');
    const c1 = await p.evaluate(() => ({ v: window.__JR.cleanZones().filter(x => x.st === 'bad').map(x => x.v), pr: document.querySelector('#reise .jr-st.on [data-cmp="0"]').getAttribute('aria-pressed'), r: +document.querySelector('#reise .jr-st.on [data-cmpr]').value }));
    ok(c1.v.every(v => v === 0) && c1.pr === 'true' && c1.r === 0, '«Vorher»: Zonen der Station schmutzig, Knopf gedrückt, Regler 0');
    await p.focus('#reise .jr-st.on [data-cmpr]'); await p.keyboard.press('End');
    const c2 = await p.evaluate(() => ({ v: window.__JR.cleanZones().filter(x => x.st === 'bad').map(x => x.v), r: +document.querySelector('#reise .jr-st.on [data-cmpr]').value, t: document.querySelector('#reise .jr-st.on [data-cmpr]').getAttribute('aria-valuetext') }));
    ok(c2.v.every(v => v === 1) && c2.r === 100 && /100 % gereinigt/.test(c2.t || ''), 'Regler per Tastatur (Ende): 100 % gereinigt');
    for (let k = 0; k < 10; k++) await p.keyboard.press('ArrowLeft');
    const c3 = await p.evaluate(() => window.__JR.cleanZones().filter(x => x.st === 'bad').map(x => x.v));
    ok(c3.every(v => Math.abs(v - 0.5) < 0.001), 'Regler per Pfeiltasten: 10 × 5 % zurück = halb gereinigt (' + c3[0] + ')');
    await p.click('#reise .jr-st.on [data-cmp="1"]');
    ok(await p.evaluate(() => window.__JR.cleanZones().filter(x => x.st === 'bad').every(x => x.v === 1)), '«Nachher»: Zonen sauber');
    await p.click('#reise .jr-st.on [data-cmp="0"]');
    await p.evaluate(() => window.__JR.goStation(3));
    await p.waitForFunction(() => { const s = window.__JR.state(); return Math.abs(s.p - s.ps) < 0.002; }, null, { timeout: 120000 }).catch(() => {});
    const c4 = await p.evaluate(() => ({ z: window.__JR.cleanZones(), p: window.__JR.state().p, pr: [...document.querySelectorAll('#reise .jr-st.on [data-cmp]')].map(x => x.getAttribute('aria-pressed')) }));
    ok(c4.pr.length === 2 && c4.pr.every(x => x === 'false'), 'Stationswechsel beendet den manuellen Vergleich (Knöpfe der neuen Station nicht gedrückt)');
    ok(c4.z.filter(x => x.st === 'wohnung').every(x => x.v === 1) && c4.z.filter(x => x.st === 'bad').every(x => x.v === 0), 'nach dem Wechsel gilt wieder der Fortschrittszustand (Wohnung sauber, Bad noch vor der Reinigung)');
    /* 3 Licht */
    const l0 = await p.evaluate(() => ({ m: window.__JR.lightMode(), pr: [...document.querySelectorAll('#reise [data-light]')].map(x => x.dataset.light + ':' + x.getAttribute('aria-pressed')) }));
    ok(l0.m.light === 'tag' && l0.pr.join() === 'tag:true,nacht:false', 'Start mit Tageslicht (Materialvergleich), Wahl «Tageslicht / Dämmerung»');
    await p.evaluate(() => window.__JR.goStation(0)); await p.waitForTimeout(800);
    const at0 = () => p.evaluate(() => { window.__JR.jump(0.03); return { m: window.__JR.lightMode().light, mean: window.__JR.frameStats().mean }; });
    const mDay = (await at0()).mean;
    await p.click('#reise [data-light="nacht"]'); await p.waitForTimeout(300);
    const mN = await at0();
    await p.click('#reise [data-light="tag"]'); await p.waitForTimeout(300);
    const mD2 = await at0();
    ok(mN.m === 'nacht' && mN.mean < mDay - 0.03 && mD2.m === 'tag' && Math.abs(mD2.mean - mDay) < 0.01, 'Dämmerung umschaltbar und zurück (Helligkeit ' + mDay + ' → ' + mN.mean + ' → ' + mD2.mean + ')');
    /* 4 Demo-Rundlauf */
    await p.waitForTimeout(1500);
    const d0 = await p.evaluate(() => { const g = document.querySelector('#reise .jr-demo'), tg = g.querySelector('[data-demo="toggle"]'), sp = g.querySelector('[data-demo="stop"]'); return { st: window.__JR.demoState(), vis: !g.hidden && getComputedStyle(g).display !== 'none', lab: tg.textContent.trim(), stop: sp.hidden, h: tg.getBoundingClientRect().height }; });
    ok(!d0.st.on && d0.vis && d0.lab === 'Demo-Rundlauf starten' && d0.stop && d0.h >= 44, 'Demo startet nicht von selbst; Knopf «Demo-Rundlauf starten» (≥ 44 px), «Beenden» verborgen');
    const tl = await p.evaluate(() => { const t = window.__JR, D = t.demoState().duration, s = []; for (let i = 0; i < D * 20; i++) s.push(t.demoAt(i / 20)); return { D, s: s.map(x => { const c = x.cam || t.camAt(x.q); return { q: x.q, e: c.e, c: { e: c.e, t: c.t }, cl: x.clean }; }), rep: JSON.stringify(t.demoAt(20)) === JSON.stringify(t.demoAt(20)) }; });
    let maxStep = 0, at = 0, maxRot = 0, atR = 0, clJump = [];
    const yaw = c => Math.atan2(c.t[0] - c.e[0], c.t[2] - c.e[2]);
    for (let i = 1; i < tl.s.length; i++) { const a = tl.s[i - 1].e, c = tl.s[i].e, dd = Math.hypot(a[0] - c[0], a[1] - c[1], a[2] - c[2]); if (dd > maxStep) { maxStep = dd; at = i / 20; }
      let dy = Math.abs(yaw(tl.s[i].c) - yaw(tl.s[i - 1].c)); if (dy > Math.PI) dy = 2 * Math.PI - dy; if (dy * 20 * 180 / Math.PI > maxRot) { maxRot = dy * 20 * 180 / Math.PI; atR = i / 20; } for (const k of Object.keys(tl.s[i].cl)) if (Math.abs(tl.s[i].cl[k] - tl.s[i - 1].cl[k]) > 0.2) clJump.push(k + '@' + i / 20); }
    const wrap = (() => { const a = tl.s[tl.s.length - 1].e, c = tl.s[0].e; return Math.hypot(a[0] - c[0], a[1] - c[1], a[2] - c[2]); })();
    ok(tl.D >= 44 && tl.D <= 52 && tl.rep, 'Demo-Dauer ' + tl.D + ' s, Zeitplan deterministisch');
    ok(maxStep < 2.2 && wrap < 0.05, 'Kamera ohne Sprung (grösster Schritt je 0,05 s: ' + maxStep.toFixed(2) + ' m bei ' + at + ' s; Naht 47,95 → 0 s: ' + wrap.toFixed(3) + ' m)');
    ok(maxRot <= 90, 'Drehung höchstens 90°/s (grösste ' + maxRot.toFixed(0) + '°/s bei ' + atR + ' s)');
    ok(clJump.length === 0, 'Reinigung ohne Sprung innerhalb des Rundlaufs' + (clJump.length ? ': ' + clJump.slice(0, 4).join(', ') : ''));
    await p.click('#reise [data-demo="toggle"]');
    await p.waitForFunction(() => window.__JR.demoState().t > 0.3, null, { timeout: 60000 }).catch(() => {});
    const d1 = await p.evaluate(() => ({ st: window.__JR.demoState(), src: window.__JR.state().source, lab: document.querySelector('#reise [data-demo="toggle"]').textContent.trim(), pr: document.querySelector('#reise [data-demo="toggle"]').getAttribute('aria-pressed'), stop: document.querySelector('#reise [data-demo="stop"]').hidden }));
    ok(d1.st.on && !d1.st.paused && d1.st.t > 0.3 && d1.src === 'demo' && d1.lab === 'Pause' && d1.pr === 'true' && !d1.stop, 'Demo läuft (Quelle «demo», t ' + d1.st.t + ' s), Knopf «Pause», «Beenden» sichtbar');
    await p.click('#reise [data-demo="toggle"]');
    const tp = await p.evaluate(() => window.__JR.demoState().t); await p.waitForTimeout(1500);
    const d2 = await p.evaluate(() => ({ st: window.__JR.demoState(), lab: document.querySelector('#reise [data-demo="toggle"]').textContent.trim() }));
    ok(d2.st.paused && d2.st.t === tp && d2.lab === 'Fortsetzen', 'Pause hält die Demo an (t bleibt ' + tp + ' s), Knopf «Fortsetzen»');
    /* Naht: Bild am Ende = Bild am Anfang, beide formatfüllend Hecke; Reinigungszustand springt nur dort */
    const seam = await p.evaluate(async () => {
      const t = window.__JR, sh = async s => { t.demoSeek(s); await new Promise(r => setTimeout(r, 50)); return { g: t.frameGrid(16, 10, 0), z: t.cleanZones().map(x => x.v), q: t.demoState() }; };
      const a = await sh(47.99), c = await sh(0), m = await sh(47.5), n = await sh(0.5); return { a, c, m, n };
    });
    const green = gr => gr.filter(c => c[1] > c[0] && c[1] > c[2] && c[1] < 200).length / gr.length;
    ok(gdiff(seam.a.g, seam.c.g) < 0.004, 'Naht: Bild bei 47,99 s und 0 s gleich (Differenz ' + gdiff(seam.a.g, seam.c.g).toFixed(5) + ')');
    ok([seam.a, seam.c, seam.m, seam.n].every(x => green(x.g) > 0.9), 'Naht 47,5 – 0,5 s: Hecke füllt das Bild (Grünanteil ' + [seam.m, seam.a, seam.c, seam.n].map(x => green(x.g).toFixed(2)).join(' / ') + ')');
    ok(seam.a.z.every(v => v === 1) && seam.c.z.every(v => v === 0), 'Rücksprung auf «Vorher» nur hinter der Hecke (47,99 s sauber, 0 s schmutzig)');
    await p.evaluate(() => window.__JR.demoPause(false)); await p.waitForTimeout(300);
    /* eigenes Scrollen beendet die Demo, die Kamera folgt wieder der Seite */
    await p.evaluate(() => scrollBy(0, 240));
    await p.waitForFunction(() => !window.__JR.demoState().on, null, { timeout: 30000 }).catch(() => {}); await p.waitForTimeout(200);
    const d3 = await p.evaluate(() => ({ st: window.__JR.demoState(), src: window.__JR.state().source, lab: document.querySelector('#reise [data-demo="toggle"]').textContent.trim() }));
    ok(!d3.st.on && d3.src === 'scroll' && d3.lab === 'Demo-Rundlauf starten', 'eigenes Scrollen beendet die Demo (Quelle wieder «scroll»)' + (d3.st.on || d3.src !== 'scroll' ? ' ' + JSON.stringify(d3) : ''));
    /* Stationswahl beendet die Demo; «Beenden» lässt Bild und Seite übereinstimmen */
    await p.click('#reise [data-demo="toggle"]'); await p.waitForTimeout(300);
    await p.evaluate(() => document.querySelectorAll('#reise .jr-nav button')[2].click()); await p.waitForTimeout(400);
    ok(await p.evaluate(h => !window.__JR.demoState().on && Math.abs(window.__JR.state().p - h) < 0.01, RT.stations[2].hold), 'Stationsknopf beendet die Demo und springt zur Station');
    await p.click('#reise [data-demo="toggle"]');
    await p.evaluate(() => window.__JR.demoSeek(35)); await p.waitForTimeout(300);
    await p.click('#reise [data-demo="stop"]'); await p.waitForTimeout(700);
    const d4 = await p.evaluate(() => { const r = document.getElementById('reise'), span = r.offsetHeight - innerHeight, sp = -r.getBoundingClientRect().top / span; return { st: window.__JR.demoState(), p: window.__JR.state().p, sp, stop: document.querySelector('#reise [data-demo="stop"]').hidden }; });
    ok(!d4.st.on && d4.stop && Math.abs(d4.p - 0.752) < 0.01 && Math.abs(d4.sp - d4.p) < 0.01, '«Beenden»: Bild bleibt (p ' + d4.p.toFixed(3) + '), Seite steht an derselben Stelle (' + d4.sp.toFixed(3) + ')');
    await p.waitForTimeout(3200); /* Aufleuchten der Sanitär-Konturen beim Betreten des Bads (≈ 2,6 s) abwarten */
    const f1 = await frames(p); await p.waitForTimeout(1500); const f2 = await frames(p);
    ok(f2 === f1, 'nach dem Beenden im Bad keine weiteren Bilder (keine zweite Schleife; ' + f1 + ' → ' + f2 + ')');
    ok(errs.length === 0, 'keine Konsolenfehler' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
    /* destroy während der Demo */
    await p.click('#reise [data-demo="toggle"]'); await p.waitForTimeout(400);
    const de = await p.evaluate(async () => { window.__JR.destroy(); const f = window.__JR.state().frames; await new Promise(r => setTimeout(r, 1200)); const s = window.__JR.state(); return { f, f2: s.frames, run: s.running, d: s.destroyed, demo: window.__JR.demoState().on }; });
    ok(de.d && !de.run && !de.demo && de.f === de.f2, 'destroy() während der Demo: keine Schleife, keine Bilder mehr');
    await p.close();
    /* 4b Tageslicht: keine ausgebrannten Flächen, brauchbare Belichtung, weiche Anpassung beim Eintreten (Gegenstück zu t16,
       dort für die Dämmerung; im Tageslicht ist aussen heller als innen, die Belichtung steigt deshalb beim Eintreten) */
    p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(url);
    await p.evaluate(() => document.getElementById('reise').scrollIntoView({ block: 'start', behavior: 'instant' }));
    await p.waitForFunction(() => window.__jr === true && window.__JR.state().scan.state === 'done', null, { timeout: 180000 });
    const fsd = [];
    for (const s of RT.stations) { await p.evaluate(q => window.__JR.jump(q), s.hold); await p.waitForTimeout(300); fsd.push([s.key, await p.evaluate(() => window.__JR.frameStats())]); }
    ok(await p.evaluate(() => window.__JR.lightMode().light) === 'tag', 'Tageslicht aktiv');
    ok(fsd.every(x => x[1].clipped < 0.01), 'Tageslicht: keine ausgebrannten Flächen (weisse Pixel je Station ' + fsd.map(x => x[0] + ' ' + (x[1].clipped * 100).toFixed(2) + ' %').join(', ') + ')');
    ok(fsd.every(x => x[1].mean > 0.08 && x[1].mean < 0.75), 'Tageslicht: Belichtung je Station im brauchbaren Bereich (' + fsd.map(x => x[1].mean).join(', ') + ')');
    const HH = await p.evaluate(() => { const r = document.getElementById('reise'); return [r.getBoundingClientRect().top + scrollY, r.offsetHeight - innerHeight]; });
    await p.evaluate(q => window.__JR.jump(q), 0.3); await p.waitForTimeout(800);
    const ed0 = await p.evaluate(() => window.__JR.state().expo);
    await p.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), Math.round(HH[0] + 0.44 * HH[1]));
    const exd = []; for (let k = 0; k < 20; k++) { await p.waitForTimeout(200); exd.push(+(await p.evaluate(() => window.__JR.state().expo)).toFixed(3)); }
    ok(new Set(exd).size >= 3 && exd[exd.length - 1] > ed0, 'Tageslicht: weiche Belichtungsanpassung beim Eintreten (' + ed0.toFixed(3) + ' → ' + exd.slice(0, 8).join(' → ') + ' …)');
    await p.close();
    /* 5 Handy: Bildmodus mit «Vorher»-Bild, Demo im Handy-3D, unsichtbar = Stillstand */
    p = await b.newPage(mob); await p.addInitScript(() => { window.IR_NO_PERF_FALLBACK = true; }); await p.goto(url); await p.waitForTimeout(800);
    await p.evaluate(() => document.getElementById('reise').scrollIntoView({ block: 'start', behavior: 'instant' })); await p.waitForTimeout(400);
    await p.evaluate(() => document.querySelectorAll('#reise .jr-nav button')[1].click()); await p.waitForTimeout(300);
    /* Überarbeitung 2: Vergleich direkt am Bild (Knöpfe im Stationstext entfallen im Bildmodus) */
    const h0 = await p.evaluate(() => { const r = document.getElementById('reise'), o = r.querySelector('.jr-cmpo'), st = r.querySelector('.jr-stage').getBoundingClientRect(), g = r.querySelector('.jr-st.on .jr-cmp');
      const bs = o ? [...o.querySelectorAll('[data-cmp]')].map(b => b.getBoundingClientRect()) : [], or = o && o.getBoundingClientRect();
      return { st: r.classList.contains('jr-static'), cmp: !!o && !o.hidden && getComputedStyle(o).display !== 'none', inImg: !!or && or.left >= st.left && or.right <= st.right && or.top >= st.top && or.bottom <= st.bottom,
        h: bs.length ? Math.min(...bs.map(b => b.height)) : 0, note: !!o && /kein Kundenergebnis/.test(o.textContent), dup: !!g && getComputedStyle(g).display !== 'none', range: r.querySelector('.jr-st.on .jr-cmpr') && getComputedStyle(r.querySelector('.jr-st.on .jr-cmpr')).display, demo: getComputedStyle(r.querySelector('.jr-demo')).display }; });
    ok(h0.st && h0.cmp && h0.inImg && h0.h >= 44 && h0.note && !h0.dup && h0.range === 'none' && h0.demo === 'none', 'Handy-Bildmodus: Vorher/Nachher direkt im Bild (Knöpfe ' + Math.round(h0.h) + ' px, Hinweis «kein Kundenergebnis»), nicht doppelt im Text, ohne Regler und ohne Demo');
    await p.click('#reise .jr-cmpo [data-cmp="0"]'); await p.waitForTimeout(200);
    const h1 = await p.evaluate(() => { const v = document.querySelector('#reise .jr-still-v.on'), base = document.querySelector('#reise .jr-still[data-n="' + (v && v.dataset.v) + '"]'); return { v: v && v.dataset.v, vis: v && +getComputedStyle(v).opacity, base: base && base.classList.contains('on'), alt: v && v.alt }; });
    ok(h1.v === RT.stations[1].still && !h1.base && /Zustand vorher/.test(h1.alt || '') && /kein Referenzobjekt/.test(h1.alt || ''), '«Vorher» zeigt das Bild derselben Kamera im Ausgangszustand (' + h1.v + ')');
    await p.click('#reise .jr-cmpo [data-cmp="1"]'); await p.waitForTimeout(200);
    ok(await p.evaluate(n => !document.querySelector('#reise .jr-still-v.on') && document.querySelector('#reise .jr-still.on').dataset.n === n, RT.stations[1].still), '«Nachher» zeigt wieder das Stationsbild');
    await p.click('#reise .jr-cmpo [data-cmp="0"]'); await p.evaluate(() => document.querySelectorAll('#reise .jr-nav button')[2].click()); await p.waitForTimeout(200);
    ok(await p.evaluate(() => !document.querySelector('#reise .jr-still-v.on')), 'Stationswechsel blendet das «Vorher»-Bild aus');
    /* Bad: in der Übersicht und am WC ohne sichtbaren Unterschied → kein Vergleich; an der Nahansicht Waschtisch mit Vergleich */
    await p.evaluate(() => document.querySelectorAll('#reise .jr-nav button')[4].click()); await p.waitForTimeout(200);
    const vis = () => p.evaluate(() => { const o = document.querySelector('#reise .jr-cmpo'); return !!o && !o.hidden && getComputedStyle(o).display !== 'none'; });
    const bv0 = await vis();
    await p.click('#reise .jr-st.on [data-det-i="0"]'); await p.waitForTimeout(200); const bv1 = await vis();
    await p.click('#reise .jr-st.on [data-det-i="1"]'); await p.waitForTimeout(200); const bv2 = await vis();
    ok(!bv0 && bv1 && !bv2, 'Bildmodus Bad: Vergleich nur, wo ein Unterschied sichtbar ist (Übersicht ' + bv0 + ', Waschtisch ' + bv1 + ', WC ' + bv2 + ')');
    await p.click('#reise [data-3d]');
    await p.waitForFunction(() => window.__JR.state().inline3d && window.__JR.state().ready, null, { timeout: 150000 }).catch(() => {});
    await p.waitForTimeout(500);
    const h2 = await p.evaluate(() => { const g = document.querySelector('#reise .jr-demo'); return { vis: !g.hidden && getComputedStyle(g).display !== 'none', w: document.documentElement.scrollWidth, iw: innerWidth }; });
    ok(h2.vis && h2.w <= h2.iw, 'Handy-3D: Demo-Knopf vorhanden, kein seitliches Überlaufen (' + h2.w + '/' + h2.iw + ')');
    await p.click('#reise [data-demo="toggle"]');
    await p.waitForFunction(() => window.__JR.demoState().t > 0.2, null, { timeout: 60000 }).catch(() => {});
    ok(await p.evaluate(() => window.__JR.demoState().on && window.__JR.state().source === 'demo'), 'Handy-3D: Demo läuft im Bildrahmen');
    await p.evaluate(() => scrollTo({ top: document.getElementById('anfrage').getBoundingClientRect().top + scrollY, behavior: 'instant' })); await p.waitForTimeout(800);
    const o1 = await p.evaluate(() => window.__JR.demoState().t); await p.waitForTimeout(1500); const o2 = await p.evaluate(() => ({ t: window.__JR.demoState().t, on: window.__JR.demoState().on }));
    ok(o2.on && o2.t === o1, 'Szene ausserhalb des Bildschirms: Demo steht still (t ' + o1 + ' s) und läuft beim Zurückkehren weiter');
    await p.evaluate(() => document.getElementById('reise').scrollIntoView({ block: 'start', behavior: 'instant' }));
    await p.waitForFunction(t => window.__JR.demoState().t > t, o1, { timeout: 60000 }).catch(() => {});
    ok(await p.evaluate(t => window.__JR.demoState().t > t, o1), 'zurück im Bild: Demo läuft weiter');
    await p.close();
    /* 6 Bewegung reduzieren: keine Demo */
    p = await b.newPage({ ...mob, reducedMotion: 'reduce' }); await p.addInitScript(() => { window.IR_NO_PERF_FALLBACK = true; }); await p.goto(url); await p.waitForTimeout(600);
    await p.evaluate(() => document.getElementById('reise').scrollIntoView({ block: 'start', behavior: 'instant' })); await p.waitForTimeout(300);
    await p.click('#reise [data-3d]');
    await p.waitForFunction(() => window.__JR.state().inline3d && window.__JR.state().ready, null, { timeout: 150000 }).catch(() => {});
    const rm = await p.evaluate(() => { const g = document.querySelector('#reise .jr-demo'); return { vis: getComputedStyle(g).display !== 'none' && !g.hidden, can: window.__JR.demoState().available, st: window.__JR.demoStart() }; });
    ok(!rm.vis && !rm.can && !rm.st, 'Bewegung reduzieren: keine automatische Kamerafahrt (Demo nicht angeboten, Start abgelehnt)');
    await p.close();
  } catch (e) { ok(false, 'Ausnahme: ' + e.message); }
  await b.close();
  console.log(log.join('\n'));
  const f = log.filter(l => l.startsWith('FAIL')).length; console.log('\nt28: ' + (log.length - f) + '/' + log.length + ' bestanden');
  process.exit(f ? 1 : 0);
})();
