// Fertigstellung (V17.1): echter Anfrageablauf gegen einen simulierten Endpunkt, Velo-Backend mit Platzhalter-Modulen,
// Renderloop ausserhalb des Sichtbereichs, Direktaufruf/Neuladen/Vor-Zurück, Produktionsform über HTTP ohne fehlerhafte Anfragen.
// Aufruf: node tests/t21-fertigstellung.js   (WebGL über SwiftShader)
// Der simulierte Endpunkt läuft nur im Testbrowser (page.route) – es wird nichts an Wix oder an Dritte gesendet.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os'), { spawn } = require('child_process'), { pathToFileURL } = require('url');
const ROOT = path.resolve(__dirname, '..');
const url = 'file://' + path.join(ROOT, 'dist/immoready-vorschau.html');
const EP = 'https://formtest.example/_functions';
const log = []; const ok = (c, m) => log.push((c ? 'PASS ' : 'FAIL ') + m);
const launch = () => chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const FOTO = path.join(ROOT, 'tests/fixtures/TEST-foto.png');

/* Seite mit konfiguriertem Endpunkt (wie nach dem Eintrag in rise.json → wix.formEndpoint) */
async function formPage(b, handler) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await p.addInitScript(ep => { let r; Object.defineProperty(window, 'IR_RISE', { configurable: true, get() { return r; }, set(v) { v.formEndpoint = ep; r = v; } }); }, EP);
  const calls = [];
  await p.route(/^https:\/\/(formtest|upload)\.example\//, async route => { const rq = route.request(); if (rq.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS }); calls.push({ url: rq.url(), method: rq.method(), body: rq.postData() }); await handler(route, rq, calls); });
  await p.goto(url + '#offerte'); await p.waitForTimeout(900);
  return { p, calls };
}
async function fill(p, foto) {
  await p.locator('#fs_leistung .opt', { hasText: 'Sanitär' }).first().click();
  await p.fill('#ort', '8004 Zürich'); await p.fill('#beschreibung', 'Tropfender Wasserhahn in der Küche, bitte prüfen.');
  await p.fill('#name', 'Test Person'); await p.fill('#email', 'test@beispiel.ch'); await p.fill('#tel', '079 123 45 67');
  if (foto) { await p.setInputFiles('#fotos', FOTO); await p.waitForTimeout(200); }
  await p.evaluate(() => document.activeElement && document.activeElement.blur());
}
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, PUT, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
const J = (o, status) => ({ status: status || 200, contentType: 'application/json', headers: CORS, body: JSON.stringify(o) });

(async () => {
  const b = await launch();

  // 1 Erfolg erst nach Bestätigung, Fotos vorher hochgeladen, Ladezustand, Doppelklick-Sperre, kein Demo-Hinweis
  {
    let release; const gate = new Promise(r => { release = r; });
    const { p, calls } = await formPage(b, async (route, rq) => {
      if (/offerteUpload$/.test(rq.url())) return route.fulfill(J({ uploadUrl: 'https://upload.example/u1' }));
      if (/^https:\/\/upload\.example\//.test(rq.url())) return route.fulfill(J({ file: { url: 'https://static.wixstatic.com/media/test.png' } }));
      if (/\/offerte$/.test(rq.url())) { await gate; return route.fulfill(J({ ok: true, id: 'ANF-123' })); }
      return route.abort();
    });
    const flag = await p.evaluate(() => !!document.querySelector('#qf .demo-flag'));
    await fill(p, true);
    await p.click('#next'); await p.click('#next', { force: true }); await p.click('#next', { force: true }); await p.waitForTimeout(700);
    const mid = await p.evaluate(() => ({ busy: document.getElementById('next').getAttribute('aria-busy'), res: document.getElementById('result').hidden, msg: document.getElementById('busyMsg').textContent }));
    release(); await p.waitForTimeout(700);
    const end = await p.evaluate(() => { const r = document.getElementById('result'); return { shown: !r.hidden, t: r.textContent, form: document.getElementById('qf').hidden }; });
    const posts = calls.filter(c => /\/offerte$/.test(c.url)), body = posts[0] ? JSON.parse(posts[0].body) : {};
    const put = calls.find(c => /upload\.example/.test(c.url));
    ok(!flag, 'Mit Endpunkt: kein Demo-Hinweis «Formular nicht verbunden»');
    ok(mid.busy === 'true' && mid.res && /übermittelt/.test(mid.msg), `Ladezustand während der Übermittlung sichtbar («${mid.msg}»), noch keine Erfolgsmeldung`);
    ok(posts.length === 1, `Doppelübermittlung verhindert: ${posts.length} Anfrage(n) trotz 3 Klicks`);
    ok(put && put.method === 'PUT' && /filename=TEST-foto\.png/.test(put.url) && body.fotos && body.fotos[0] && /wixstatic/.test(body.fotos[0].ref), 'Foto zuerst hochgeladen (PUT mit Dateiname), Referenz in der Anfrage');
    ok(body.leistung === 'sanitaer' && body.version === 1 && body.email === 'test@beispiel.ch' && body.ort === '8004 Zürich', `Anfrage enthält gewählte Leistung und Angaben (${body.leistung})`);
    ok(end.shown && end.form && /Vielen Dank/.test(end.t) && /ANF-123/.test(end.t) && !/Demo/.test(end.t), 'Erfolg erst nach bestätigter Annahme, mit Referenz');
    await p.close();
  }
  // 2 Fehlerarten: Netzwerk, Upload, Serverprüfung (400 mit Feldern), Server ohne Bestätigung
  for (const [name, handler, re, extra] of [
    ['Netzwerkausfall', (route) => route.abort('internetdisconnected'), /Keine Verbindung/, null],
    ['Upload-Fehler', (route, rq) => /offerteUpload$/.test(rq.url()) ? route.fulfill(J({ error: 'upload' }, 500)) : route.fulfill(J({ ok: true, id: 'X' })), /Foto konnte nicht hochgeladen/, 'noPost'],
    ['Serverprüfung', (route) => route.fulfill(J({ ok: false, fields: { ort: 'Bitte geben Sie den Ort oder die Postleitzahl an.' } }, 400)), /beanstandet/, 'ort'],
    ['Antwort ohne Bestätigung', (route) => route.fulfill(J({ ok: false }, 200)), /nicht bestätigt/, null]]) {
    const { p, calls } = await formPage(b, handler);
    await fill(p, name === 'Upload-Fehler');
    await p.click('#next'); await p.waitForTimeout(900);
    const r = await p.evaluate(() => ({ fail: !document.getElementById('failbox').hidden, why: document.getElementById('failWhy').textContent, res: document.getElementById('result').hidden,
      keep: document.getElementById('beschreibung').value, ortErr: document.getElementById('ort_e').textContent, busy: document.getElementById('next').getAttribute('aria-busy') }));
    const posted = calls.some(c => /\/offerte$/.test(c.url));
    ok(r.fail && re.test(r.why) && r.res && r.keep.length > 10 && r.busy !== 'true' && (extra !== 'noPost' || !posted) && (extra !== 'ort' || /Ort/.test(r.ortErr)),
      `${name}: verständliche Meldung («${r.why.trim()}»), keine Erfolgsmeldung, Eingaben erhalten${extra === 'noPost' ? ', Anfrage nicht gesendet' : ''}${extra === 'ort' ? ', Feld markiert' : ''}`);
    await p.close();
  }
  // 3 ohne Endpunkt: Demo bleibt deutlich, nichts wird gesendet
  {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); const reqs = [];
    p.on('request', r => { if (/^https?:/.test(r.url()) && !/fonts\.(googleapis|gstatic)/.test(r.url())) reqs.push(r.url()); });
    await p.goto(url + '#offerte'); await p.waitForTimeout(800); await fill(p, true); await p.click('#next'); await p.waitForTimeout(700);
    const r = await p.evaluate(() => ({ flag: !!document.querySelector('#qf .demo-flag'), t: document.getElementById('result').textContent }));
    ok(r.flag && /keine Übermittlung/.test(r.t) && reqs.length === 0, `Ohne Endpunkt (rise.json: [UNSPECIFIED]): Demo-Hinweis, keine Netzwerkanfrage (${reqs.length})`);
    await p.close();
  }

  // 4 Velo-Backend mit Platzhalter-Modulen (wix-http-functions, @wix/data, @wix/media, @wix/essentials)
  {
    const src = fs.readFileSync(path.join(ROOT, 'wix/backend/http-functions.js'), 'utf8').replace(/^import .*$/mg, '');
    const stub = `const R=s=>o=>Object.assign({status:s},o||{});const ok=R(200),badRequest=R(400),serverError=R(500),forbidden=R(403);
      export const DB=[];let FAIL=false;export const setFail=v=>{FAIL=v};
      const items={insert:async(c,d)=>{if(FAIL)throw new Error('x');const e=Object.assign({_id:'id'+DB.length},d);DB.push([c,e]);return e;}};
      const files={generateFileUploadUrl:async(m,o)=>({uploadUrl:'https://upload.wixmp.com/u?'+o.fileName})};const auth={elevate:f=>f};\n`;
    const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'velo-')), 'http-functions.mjs'); fs.writeFileSync(tmp, stub + src);
    const M = await import(pathToFileURL(tmp).href);
    const req = (body, origin) => ({ headers: origin === undefined ? { origin: 'https://www.immoready.ch' } : (origin ? { origin } : {}), body: { json: async () => { if (body === 'kaputt') throw new Error('json'); return body; } } });
    const gut = { version: 1, leistung: 'hauswartung', auftrag: 'laufend', ort: 'Baden', beschreibung: 'Regelmässige Hauswartung für 8 Wohnungen.', name: 'A B', email: 'a@b.ch', tel: '079 123 45 67', fotos: [{ name: 'x.jpg', ref: 'https://static.wixstatic.com/media/x.jpg' }, { name: 'bad', ref: 'https://evil.example/x' }] };
    const r1 = await M.post_offerte(req(gut)), r2 = await M.post_offerte(req(Object.assign({}, gut, { email: 'falsch', leistung: 'xx', beschreibung: 'kurz' })));
    const r3 = await M.post_offerte(req(gut, 'https://evil.example')), r4 = await M.post_offerte(req('kaputt'));
    M.setFail(true); const r5 = await M.post_offerte(req(gut)); M.setFail(false);
    const u1 = await M.post_offerteUpload(req({ name: 'a.png', mime: 'image/png', size: 1000 })), u2 = await M.post_offerteUpload(req({ name: 'a.exe', mime: 'application/x-msdownload', size: 10 })), u3 = await M.post_offerteUpload(req({ name: 'a.png', mime: 'image/png', size: 11 * 1048576 }));
    const o1 = M.options_offerte(req(null)), o2 = M.options_offerte(req(null, 'https://evil.example'));
    ok(r1.status === 200 && r1.body.ok === true && r1.body.id === 'id0' && M.DB[0][0] === 'Offertanfragen' && M.DB[0][1].fotos.length === 1 && M.DB[0][1].status === 'neu', 'Backend: gültige Anfrage gespeichert (Sammlung «Offertanfragen»), fremde Foto-Adresse verworfen, Antwort mit ID');
    ok(r2.status === 400 && r2.body.fields.email && r2.body.fields.leistung && r2.body.fields.beschreibung && M.DB.length === 1, 'Backend: serverseitige Prüfung lehnt ungültige Angaben mit Feldmeldungen ab, nichts gespeichert');
    ok(r3.status === 403 && r4.status === 400 && r5.status === 500 && r5.body.ok === false, 'Backend: fremder Ursprung 403, kaputtes JSON 400, Speicherfehler 500 ohne Erfolg');
    ok(u1.status === 200 && /^https:/.test(u1.body.uploadUrl) && u2.status === 400 && u3.status === 400, 'Backend: Upload-Adresse nur für Bilder ≤ 10 MB');
    ok(o1.status === 200 && o1.headers['Access-Control-Allow-Origin'] === 'https://www.immoready.ch' && o2.status === 403, 'Backend: CORS nur für www.immoready.ch / immoready.ch');
  }

  // 5 Renderloop: ausserhalb des Sichtbereichs keine Bilder, auch bei Scroll-/Grössenereignissen; zurück im Bild wieder Bilder
  {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(url); await p.waitForFunction(() => window.__jr === true && window.__JR.state().scan.state === 'done', null, { timeout: 150000 });
    const runs = [];
    for (let k = 0; k < 3; k++) {
      await p.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })); await p.waitForTimeout(1500);
      const f0 = await p.evaluate(() => window.__JR.state().frames);
      await p.evaluate(() => { for (let i = 0; i < 10; i++) { scrollBy(0, i % 2 ? -1 : 1); dispatchEvent(new Event('scroll')); } dispatchEvent(new Event('resize')); });
      await p.waitForTimeout(2000); const f1 = await p.evaluate(() => window.__JR.state().frames);
      await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await p.waitForTimeout(2500); const f2 = await p.evaluate(() => window.__JR.state().frames);
      runs.push([f1 - f0, f2 - f1]);
    }
    ok(runs.every(r => r[0] === 0 && r[1] > 0) && errs.length === 0, `Renderloop: ausserhalb des Sichtbereichs 0 Bilder trotz Scroll/Resize, im Bild wieder gezeichnet (3 Durchgänge: ${runs.map(r => r.join('/')).join(', ')})`);
    await p.close();
  }

  // 6 Direktaufruf, Neuladen, Vor/Zurück
  {
    const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
    const vis = () => p.evaluate(() => (/\broute-(\S+)/.exec(document.body.className) || [])[1]);
    const bad = [];
    for (const r of ['leistungen', 'sanitaer', 'hauswartung', 'kontakt', 'offerte', 'impressum', 'datenschutz', 'ueber', 'verwaltungen', 'umsetzung']) {
      await p.goto(url + '#' + r); await p.waitForTimeout(300); const a = await vis(); await p.reload(); await p.waitForTimeout(400); const c = await vis();
      const want = ['sanitaer', 'hauswartung'].includes(r) ? 'leistung' : r; if (a !== want || c !== want) bad.push(r + ':' + a + '/' + c);
    }
    await p.goto(url + '#leistungen'); await p.waitForTimeout(300); await p.evaluate(() => { location.hash = '#kontakt'; }); await p.waitForTimeout(300); await p.evaluate(() => { location.hash = '#offerte'; }); await p.waitForTimeout(300);
    await p.goBack(); await p.waitForTimeout(300); const b1 = await vis(); await p.goBack(); await p.waitForTimeout(300); const b2 = await vis(); await p.goForward(); await p.waitForTimeout(300); const f1 = await vis();
    ok(bad.length === 0, `Direktaufruf und Neuladen von 10 Unterseiten zeigen die richtige Seite${bad.length ? ' – ' + bad.join(', ') : ''}`);
    ok(b1 === 'kontakt' && b2 === 'leistungen' && f1 === 'kontakt' && errs.length === 0, `Browser-Zurück/Vorwärts: ${b1} → ${b2} → ${f1}`);
    await p.close();
  }

  // 7 Produktionsform dist/site/ über HTTP: keine fehlgeschlagenen Anfragen, keine Konsolenfehler (Desktop 3D, Smartphone Bilder)
  {
    const srv = spawn('python3', ['-m', 'http.server', '8705', '--bind', '127.0.0.1'], { cwd: path.join(ROOT, 'dist/site'), stdio: 'ignore' });
    await new Promise(r => setTimeout(r, 1200));
    try {
      for (const [w, h, mob] of [[1440, 900, 0], [390, 844, 1]]) {
        const p = await b.newPage({ viewport: { width: w, height: h }, isMobile: !!mob, hasTouch: !!mob }); const bad = [], cons = [];
        p.on('requestfailed', r => { if (!/fonts\.(googleapis|gstatic)/.test(r.url())) bad.push('failed ' + r.url()); });
        p.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()); });
        p.on('console', m => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)|ERR_TUNNEL|net::ERR/.test(m.text())) cons.push(m.text()); }); p.on('pageerror', e => cons.push(e.message));
        await p.goto('http://127.0.0.1:8705/index.html');
        if (!mob) await p.waitForFunction(() => window.__jr === true && window.__JR.state().scan.state === 'done', null, { timeout: 150000 }); else await p.waitForTimeout(1500);
        for (const r of ['#leistungen', '#sanitaer', '#offerte', '#kontakt', '#impressum']) { await p.evaluate(r => { location.hash = r; }, r); await p.waitForTimeout(400); }
        if (mob) { await p.evaluate(() => { location.hash = '#start'; }); await p.waitForTimeout(500); for (let i = 0; i < 6; i++) { await p.evaluate(i => document.querySelectorAll('#reise .jr-nav button')[i].click(), i); await p.waitForTimeout(250); } }
        ok(bad.length === 0 && cons.length === 0, `Produktionsform über HTTP ${w} px: alle Anfragen erfolgreich, keine Konsolenfehler${bad.length ? ' – ' + bad.slice(0, 3).join(', ') : ''}${cons.length ? ' – ' + cons.slice(0, 2).join(' | ') : ''}`);
        await p.close();
      }
    } finally { srv.kill(); }
  }
  await b.close();
  console.log(log.join('\n'));
  process.exitCode = log.some(l => l.startsWith('FAIL')) ? 1 : 0;
})();
