// V15-Prüfungen «glaubwürdige Architekturvisualisierung»: Reflexionsaufnahmen und Badspiegel, Türlicht (doppelt
// gebacken), Nahebene gegen Wände und Türflügel, Leistungspunkte (sichtbar nur an der Station, lösen dieselbe
// Offertanfrage aus wie die CTA), schnelle Stationswechsel, Bildstabilität (kein Flackern bei ruhender Kamera),
// Lichtdurchtritt durch Wände, Freigabe aller GPU-Ressourcen beim Entfernen.
// Aufruf: node tests/t17-v15.js   (WebGL über SwiftShader)
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const url = 'file://' + path.resolve(__dirname, '../dist/immoready-vorschau.html');
const RISE = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../rise.json'), 'utf8'));
const log = []; const ok = (c, m) => log.push((c ? 'PASS ' : 'FAIL ') + m);
const ST = RISE.tour.stations;
// Software-GPU: CSS-Übergänge laufen nur mit den (langsamen) Bildern weiter – auf den Endzustand warten statt fester Zeiten
const settle = (p, q) => p.evaluate(q => { window.__f0 = window.__JR.state().frames; window.__JR.jump(q); }, q).then(() => p.waitForFunction(() => window.__JR.state().frames >= window.__f0 + 2, null, { timeout: 20000 }).catch(() => {})).then(() => p.waitForFunction(q => Array.from(document.querySelectorAll('#reise .jr-hot')).every(a => { const c = getComputedStyle(a), si = window.__JR.stationOf(q); if (a.classList.contains('on') && +a.dataset.st !== si) return false; return a.classList.contains('on') ? c.visibility === 'visible' && +c.opacity > 0.99 && /none|matrix\(1, 0, 0, 1, [-0-9.]+, 0\)/.test(c.transform) : c.visibility === 'hidden'; }), q, { timeout: 20000, polling: 200 }).catch(() => {}));
(async () => {
  const b = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  let p = await b.newPage({ viewport: { width: 1440, height: 900 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (/GL_INVALID|WebGL: INVALID|feedback loop/i.test(m.text())) errs.push(m.text()); });
  await p.goto(url);
  await p.evaluate(() => { const r = document.getElementById('reise'); if (r) r.scrollIntoView({ block: 'start', behavior: 'instant' }); }); await p.waitForFunction(() => window.__jr === true && window.__JR.state().scan.state === 'done', null, { timeout: 90000 });

  // 1 Nahebene (nicht nur der Kameramittelpunkt) gegen Wände, Möbel und die bewegten Türflügel
  const fr = await p.evaluate(() => window.__JR.checkFrustum(3000));
  ok(fr.hits.length === 0 && fr.minClearM > 0.02, `Nahebene schneidet keine Wand und keinen Türflügel (3001 Punkte, kleinster Abstand ${fr.minClearM} m bei p=${fr.at}, ${fr.nearest})`);

  // 2 Reflexionsaufnahmen und Badspiegel
  await p.evaluate(() => { window.__f0 = window.__JR.state().frames; window.__JR.jump(0.73); });
  await p.waitForFunction(() => window.__JR.state().frames >= window.__f0 + 2, null, { timeout: 30000 }).catch(() => {});
  let s = await p.evaluate(() => window.__JR.sceneStats());
  ok(s.probes.includes('bad'), `Reflexionsaufnahme (Würfeltextur) des Bads aufgenommen, sobald es sichtbar ist: ${s.probes.join(', ')} (${s.probeMs} ms)`);
  const mf0 = s.mirrorFrames;
  ok(mf0 >= 1, `Badspiegel: echte planare Spiegelung gerendert (${mf0} Spiegelbilder bisher)`);
  await p.evaluate(q => window.__JR.jump(q), 0.235); await p.waitForTimeout(800);
  const mf1 = (await p.evaluate(() => window.__JR.sceneStats())).mirrorFrames;
  await p.evaluate(q => window.__JR.jump(q), 0.24); await p.waitForTimeout(800);
  const mf2 = (await p.evaluate(() => window.__JR.sceneStats())).mirrorFrames;
  ok(mf2 === mf1, `Spiegel wird ausserhalb des Bads nicht gerechnet (Garten: ${mf1} → ${mf2})`);

  // 3 Türlicht: Licht der Türflügel wird zwischen «zu» und «offen» überblendet (doppelt gebacken)
  const dl = await p.evaluate(() => { const J = window.__JR; return [J.doorLight(0.2), J.doorLight(0.4), J.doorLight(0.95)]; });
  ok(dl[0] < 0.01 && dl[1] > 0.99 && dl[2] < 0.01, `Haustür: Licht zu/offen überblendet (Mischwert ${dl.map(v => v.toFixed(2)).join(' → ')})`);

  // 4 Leistungspunkte
  const hs = await p.evaluate(() => Array.from(document.querySelectorAll('#reise .jr-hot')).map(a => ({ svc: a.dataset.pre, st: +a.dataset.st, lab: a.getAttribute('aria-label') })));
  const want = []; ST.forEach((s2, i) => (s2.hotspots || []).forEach(h => want.push(h.service + '@' + i)));
  ok(hs.length === want.length && hs.every(h => want.includes(h.svc + '@' + h.st) && /Offerte anfragen/.test(h.lab)), `Leistungspunkte aus rise.json: ${hs.map(h => h.svc + '@' + h.st).join(', ')}`);
  const vis = [];
  for (let i = 0; i < ST.length; i++) {
    await settle(p, ST[i].hold); await p.waitForTimeout(300);
    vis.push(await p.evaluate(i => Array.from(document.querySelectorAll('#reise .jr-hot')).map(a => ({ st: +a.dataset.st, on: a.classList.contains('on'), v: getComputedStyle(a).visibility, r: a.getBoundingClientRect() })), i));
  }
  const visOk = vis.every((arr, i) => arr.every(h => (h.st === i) === h.on && (h.on ? h.v === 'visible' : h.v === 'hidden')));
  const bad = []; vis.forEach((arr, i) => arr.forEach(h => { if ((h.st === i) !== h.on || (h.on ? h.v !== 'visible' : h.v !== 'hidden')) bad.push(ST[i].key + ': Punkt ' + h.st + ' on=' + h.on + ' ' + h.v); }));
  ok(visOk, 'Leistungspunkte nur an ihrer Station sichtbar, sonst unsichtbar und nicht fokussierbar: ' + vis.map((arr, i) => ST[i].key + ' ' + arr.filter(h => h.on).length).join(', ') + (bad.length ? ' · Abweichung ' + bad.join('; ') : ''));
  // an jeder Station: Punkt liegt frei (nicht unter Text, Navigation oder Knöpfen)
  const free = [];
  for (let i = 0; i < ST.length; i++) {
    await settle(p, ST[i].hold); await p.waitForTimeout(300);
    free.push(...await p.evaluate(() => Array.from(document.querySelectorAll('#reise .jr-hot.on')).map(a => { const r = a.querySelector('.jr-hot-d').getBoundingClientRect(), el = document.elementFromPoint(r.left + 22, r.top + r.height / 2), l = a.querySelector('.jr-hot-l').getBoundingClientRect(), el2 = document.elementFromPoint(a.classList.contains('l') ? l.left + 6 : l.right - 6, l.top + l.height / 2); return a.dataset.pre + ':' + (el && el.closest('.jr-hot') === a && el2 && el2.closest('.jr-hot') === a ? 'frei' : 'verdeckt'); })));
  }
  ok(free.length >= 3 && free.every(x => /frei$/.test(x)), 'Leistungspunkte frei klickbar (Punkt und Beschriftung oben): ' + free.join(', '));
  const tgt = vis.map((arr, i) => arr.filter(h => h.on).map(h => Math.min(h.r.width, h.r.height))).flat();
  ok(tgt.length && tgt.every(v => v >= 44), `Trefferfläche der Leistungspunkte ≥ 44 px (${tgt.map(v => Math.round(v)).join(', ')})`);
  // Klick: gleiche request-quote-Nachricht wie die Stations-CTA, Leistung vorausgewählt
  await settle(p, ST[1].hold);
  await p.evaluate(() => { window.__rq = []; document.getElementById('reise').addEventListener('request-quote', e => window.__rq.push(e.detail)); });
  const hot = p.locator('#reise .jr-hot.on').first();
  const box = await hot.boundingBox();
  const under = await p.evaluate(bx => { const el = document.elementFromPoint(bx.x + 22, bx.y + bx.height / 2); return el && el.closest('.jr-hot') ? 'hot' : (el ? el.className : 'nichts'); }, box);
  ok(under === 'hot', `Leistungspunkt liegt oben und ist klickbar (Element unter dem Punkt: ${under})`);
  await hot.click();
  await p.waitForTimeout(600);
  const rq = await p.evaluate(() => window.__rq || []);
  const pre = await p.evaluate(() => { const r = document.querySelector('#qf input[name="leistung"]:checked'); return [location.hash, r ? r.value : null]; });
  ok(rq.length === 1 && rq[0].service === 'gartenunterhalt' && rq[0].station === 'garten' && rq[0].source === 'tour', `Klick → request-quote ${JSON.stringify(rq[0] || {})}`);
  ok(pre[0] === '#offerte' && pre[1] === 'gartenunterhalt', `Offertformular geöffnet, Leistung vorausgewählt (${pre.join(' · ')})`);
  await p.goto(url);
  await p.evaluate(() => { const r = document.getElementById('reise'); if (r) r.scrollIntoView({ block: 'start', behavior: 'instant' }); }); await p.waitForFunction(() => window.__jr === true && window.__JR.state().scan.state === 'done', null, { timeout: 90000 });

  // 5 Ruhige Kamera: zwei Bilder hintereinander identisch (kein Textur- oder Laubflackern, kein Spiegelrauschen)
  const still = [];
  for (const q of [0.235, 0.44, 0.73]) {
    await p.evaluate(q => { window.__JR.jump(q); }, q); await p.waitForTimeout(500);
    const d = await p.evaluate(() => window.__JR.frameDiff());
    still.push(q + ': ' + d.toFixed(4));
    if (d > 0.002) { ok(false, `Bild bei ruhender Kamera p=${q} verändert sich (${d})`); }
  }
  ok(true, 'Ruhige Kamera: mittlere Pixeldifferenz zweier aufeinanderfolgender Bilder ' + still.join(', '));

  // 6 Kein Licht durch Wände: Leuchten wirken nur im eigenen Raum; geprüft wird die Raumzuordnung beider Seiten
  //   jeder Trennwand (Wandoberflächen 6 cm neben der Wandachse) und der Fassade aussen
  const faces = [['Bad|Flur', [4.2, 1.6, 2.33], 3, [4.2, 1.6, 2.47], 2], ['Halle|Bad', [2.93, 1.6, 0.7], 1, [3.07, 1.6, 0.7], 3],
    ['Bad|Wohnen', [5.33, 1.6, 0.5], 3, [5.47, 1.6, 0.5], 4], ['Wohnen|Fassade', [8.55, 1.6, 2.0], 4, [8.9, 1.6, 2.0], 0]];
  const rooms = await p.evaluate(f => f.map(x => [window.__JR.roomAt(x[1]), window.__JR.roomAt(x[3])]), faces);
  ok(rooms.every((r, i) => r[0] === faces[i][2] && r[1] === faces[i][4]), 'Wandseiten dem richtigen Raum zugeordnet (kein Leuchtenlicht durch Wände): ' + faces.map((f, i) => f[0] + ' ' + rooms[i].join('|')).join(', '));
  const la = await p.evaluate(() => [window.__JR.lightAt([4.2, 1.6, 2.47], [0, 0, 1]), window.__JR.lightAt([8.9, 1.6, 2.0], [1, 0, 0])]);
  ok(la[0].room === 2 && la[1].room === 0, `Flurseite der Badwand und Fassade vor dem Wohnraum ohne Licht der Nachbarräume (Flur ${la[0].rgb.join('/')}, Fassade ${la[1].rgb.join('/')})`);

  // 7 Schnelle Stationswechsel (Stationsmodus): keine Fehler, Endstation stimmt
  const p2 = await b.newPage({ viewport: { width: 1280, height: 800 } }); const e2 = []; p2.on('pageerror', e => e2.push(e.message));
  await p2.addInitScript(() => { window.IR_EMBED = 1; });
  await p2.goto(url);
  await p2.evaluate(() => { const r = document.getElementById('reise'); if (r) r.scrollIntoView({ block: 'start', behavior: 'instant' }); }); await p2.waitForFunction(() => window.__jr === true, null, { timeout: 90000 });
  for (const i of [4, 0, 5, 2, 3, 1, 4, 2]) { await p2.evaluate(i => window.__JR.goStation(i), i); await p2.waitForTimeout(60); }
  await p2.waitForFunction(() => { const s = window.__JR.state(); return Math.abs(s.p - s.ps) < 0.0004; }, null, { timeout: 30000 }).catch(() => {});
  const fin = await p2.evaluate(() => ({ st: window.__JR.station(), p: window.__JR.state().ps }));
  ok(e2.length === 0 && fin.st === 2 && Math.abs(fin.p - ST[2].hold) < 0.002, `8 schnelle Sprünge: Endstation ${fin.st} (p=${fin.p.toFixed(3)}), keine Fehler`);
  await p2.close();

  // 8 Ressourcen: Web Component entfernen gibt alle GL-Objekte frei
  const http = require('http'), root = path.resolve(__dirname, '../dist/component');
  const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png' };
  const srv = http.createServer((rq, rs) => { const f = path.join(root, decodeURIComponent(rq.url.split('?')[0])); if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rs.writeHead(404); return rs.end(); } rs.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(rs); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const comp = 'http://127.0.0.1:' + srv.address().port + '/demo.html';
  const p3 = await b.newPage({ viewport: { width: 1280, height: 800 } });
  await p3.goto(comp);
  const ready = await p3.waitForFunction(() => { const e = document.querySelector('immoready-tour'); if (!e || !e._tour || !e._tour.sceneStats) return false; const x = e._tour.sceneStats().glResources; return x && x.buffers > 0; }, null, { timeout: 90000 }).then(() => true).catch(() => false);
  if (ready) {
    const r = await p3.evaluate(() => { const e = document.querySelector('immoready-tour'), t = e._tour, g = () => { const x = t.sceneStats().glResources; return x.buffers + x.textures + x.programs; }, s0 = t.sceneStats(), before = g(); e.remove(); return { before, after: g(), probes: s0.probes.length, mirror: s0.mirrorFrames }; });
    ok(r.before > 0 && r.after === 0, `Entfernen gibt alle GPU-Puffer, Texturen (inkl. Reflexionsaufnahmen) und Programme frei (${r.before} → ${r.after})`);
  } else ok(false, 'Komponente nicht im 3D-Modus gestartet (Ressourcenprüfung)');
  await p3.close(); srv.close();

  ok(errs.length === 0, 'keine JS- oder WebGL-Fehler ' + errs.slice(0, 3).join(' | '));
  console.log(log.join('\n')); await b.close();
})();
