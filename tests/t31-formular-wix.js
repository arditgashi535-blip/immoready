// t31 – Offertformular der Release-Fassung gegen einen NACHGEBILDETEN Wix-Forms-Endpunkt (keine echte Übermittlung)
//  · Pflichtfelder, Fehlerübersicht, Fokus auf erstes Fehlerfeld, E-Mail-/Telefonprüfung
//  · Erfolg: Besucher-Token einmal geholt und wiederverwendet, genau eine Übermittlung je Absenden (Doppelklick-Sperre),
//    Nutzdaten nur mit den 7 Formularfeldern, Referenz aus der Antwort in der Bestätigung, keine falsche Benachrichtigungsmeldung
//  · Fehler: 400 mit Feldverletzung → Feld markiert; 500 → Hinweis «nicht bestätigt»; Netzabbruch → Hinweis «keine Verbindung»;
//    Eingaben bleiben erhalten
//  · Honigtopf-Feld ausgefüllt → kein Versand
// Voraussetzung: python3 build.py --release (dist-release/site). Aufruf: node tests/t31-formular-wix.js
const { chromium } = require('playwright');
const path = require('path'), http = require('http'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), SITE = path.join(ROOT, 'dist-release/site');
const log = []; const ok = (c, m) => log.push((c ? 'PASS ' : 'FAIL ') + m);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png' };

function serve() {
  return new Promise(res => {
    const s = http.createServer((q, r) => {
      const f = path.join(SITE, decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/, '/index.html'));
      if (!f.startsWith(SITE) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
      r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
    }).listen(0, '127.0.0.1', () => res(s));
  });
}

(async () => {
  if (!fs.existsSync(path.join(SITE, 'index.html'))) { console.log('FAIL dist-release/site fehlt – zuerst python3 build.py --release'); process.exitCode = 1; return; }
  const srv = await serve(); const URL = 'http://127.0.0.1:' + srv.address().port + '/#offerte';
  const b = await chromium.launch();
  let mode = 'ok', tokens = 0, subs = [];
  async function page() {
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await p.route('https://www.wixapis.com/**', async route => {
      const u = route.request().url();
      if (u.includes('/oauth2/token')) { tokens++; return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ access_token: 'MOCK', expires_in: 14400 }) }); }
      if (u.includes('/form-submission-service/v4/submissions')) {
        subs.push({ auth: route.request().headers().authorization, body: route.request().postDataJSON() });
        if (mode === 'abort') return route.abort('internetdisconnected');
        if (mode === '500') return route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
        if (mode === '400') return route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ details: { validationError: { fieldViolations: [{ field: 'submission.submissions.email', description: 'invalid' }] } } }) });
        await new Promise(r => setTimeout(r, 400));
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ submission: { id: 'mock-ref-1234', status: 'CONFIRMED' } }) });
      }
      return route.fulfill({ status: 404, body: '' });
    });
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ status: 200, body: '' }));
    await p.goto(URL); await p.waitForTimeout(900);
    return p;
  }
  async function fill(p, o = {}) {
    await p.check('#leistung_' + (o.leistung || 'sanitaer'), { force: true });
    await p.fill('#ort', '8105 Regensdorf');
    await p.fill('#beschreibung', 'Die Armatur in der Küche tropft seit einer Woche.');
    await p.fill('#name', 'Mock Prüfung');
    await p.fill('#email', o.email || 'pruefung@beispiel.ch');
    await p.fill('#tel', o.tel || '');
  }
  const state = p => p.evaluate(() => ({ result: !document.getElementById('result').hidden, fail: !document.getElementById('failbox').hidden,
    why: document.getElementById('failWhy').textContent, res: document.getElementById('result').innerText, form: !document.getElementById('qf').hidden }));

  /* 1 Pflichtfelder */
  let p = await page();
  ok(await p.evaluate(() => !document.querySelector('.demo-flag') && !document.getElementById('fotos')), 'Release: kein Demo-Hinweis, kein Foto-Upload');
  await p.click('#next'); await p.waitForTimeout(300);
  const e1 = await p.evaluate(() => ({ n: document.querySelectorAll('#errsum li').length, sum: !document.getElementById('errsum').hidden, foc: document.activeElement && (document.activeElement.name || document.activeElement.id) }));
  ok(e1.sum && e1.n === 5 && e1.foc === 'leistung', 'leeres Formular: 5 Pflichtangaben in der Fehlerübersicht, Fokus auf «Leistung» (' + e1.n + ', ' + e1.foc + ')');
  ok(subs.length === 0 && tokens === 0, 'leeres Formular: nichts gesendet');
  await fill(p, { email: 'name@', tel: '12' }); await p.click('#next'); await p.waitForTimeout(300);
  const e2 = await p.evaluate(() => [document.getElementById('email_e').textContent, document.getElementById('tel_e').textContent]);
  ok(/E-Mail/.test(e2[0]) && /Telefonnummer/.test(e2[1]) && subs.length === 0, 'ungültige E-Mail und Telefonnummer werden gemeldet, nichts gesendet');

  /* 2 Erfolg, Doppelklick, Nutzdaten */
  await fill(p, { tel: '079 123 45 67' });
  await p.evaluate(() => { const b = document.getElementById('next'); b.click(); b.click(); b.click(); });
  await p.waitForFunction(() => !document.getElementById('result').hidden, null, { timeout: 10000 });
  let s = await state(p);
  ok(subs.length === 1 && tokens === 1, 'dreifacher Klick: genau eine Übermittlung, ein Besucher-Token (' + subs.length + '/' + tokens + ')');
  const body = subs[0].body.submission;
  ok(body.formId === '9671b663-fabd-48c6-b63e-53b20f09ca7e' && subs[0].auth === 'MOCK', 'Übermittlung an die Formular-ID aus rise.json mit Besucher-Token');
  ok(JSON.stringify(Object.keys(body.submissions).sort()) === JSON.stringify(['beschreibung', 'email', 'leistung', 'name', 'ort', 'tel']), 'Nutzdaten nur Formularfelder (ohne leeres «auftrag»): ' + Object.keys(body.submissions).join(','));
  ok(s.result && /Referenz mock-ref-1234/.test(s.res) && !/Benachrichtigung/.test(s.res), 'Bestätigung mit Referenz aus Wix, keine unbestätigte Benachrichtigungsmeldung');
  /* zweite Anfrage: Token wiederverwendet */
  await p.click('#newReq'); await fill(p, { leistung: 'reinigung' }); await p.click('#auftrag_laufend', { force: true });
  await p.click('#next'); await p.waitForFunction(() => !document.getElementById('result').hidden, null, { timeout: 10000 });
  ok(subs.length === 2 && tokens === 1 && subs[1].body.submission.submissions.auftrag === 'laufend' && !('tel' in subs[1].body.submission.submissions), 'zweite Anfrage: Token wiederverwendet, «auftrag» übermittelt, leeres Telefon weggelassen');
  await p.close();

  /* 3 Fehlerfälle */
  for (const [m, re, label] of [['400', /beanstandet/, '400 mit Feldverletzung'], ['500', /nicht bestätigt/, '500'], ['abort', /Keine Verbindung/, 'Netzabbruch']]) {
    mode = m; const n0 = subs.length; p = await page(); await fill(p); await p.click('#next');
    await p.waitForFunction(() => !document.getElementById('failbox').hidden, null, { timeout: 10000 }).catch(() => {});
    s = await state(p);
    const kept = await p.evaluate(() => document.getElementById('beschreibung').value.length > 10);
    const mark = m === '400' ? await p.evaluate(() => document.getElementById('email').getAttribute('aria-invalid') === 'true') : true;
    ok(s.fail && !s.result && s.form && re.test(s.why) && kept && mark && subs.length === n0 + 1, label + ': Fehlerhinweis, keine Erfolgsmeldung, Eingaben erhalten' + (m === '400' ? ', Feld markiert' : '') + ' («' + s.why.trim().slice(0, 50) + '»)');
    await p.close();
  }

  /* 4 Honigtopf */
  mode = 'ok'; const n1 = subs.length; p = await page(); await fill(p);
  await p.evaluate(() => { document.getElementById('website').value = 'spam'; }); await p.click('#next'); await p.waitForTimeout(800);
  s = await state(p);
  ok(subs.length === n1 && !s.result, 'Honigtopf ausgefüllt: kein Versand, keine Bestätigung');
  await p.close();

  await b.close(); srv.close();
  log.forEach(l => console.log(l));
  const f = log.filter(l => l.startsWith('FAIL')).length;
  console.log('\nt31: ' + (log.length - f) + '/' + log.length + ' bestanden');
  process.exitCode = f ? 1 : 0;
})();
