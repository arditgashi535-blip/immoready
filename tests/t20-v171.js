// V17.1-Prüfungen «Final Realism & Mobile Release Candidate» – ergänzt t7–t19 um die bisher nicht automatisch geprüften Punkte:
// 13 Breiten (320 … 1920, Querformat) × 17 Seiten: kein seitliches Scrollen, Kopf ohne Überlappung, Logo unverzerrt, alle
// Bedienelemente ≥ 44 px, Kontaktleiste deckend und ≤ 60 px mit reserviertem Platz, kompakter Kopf deckend; 320 px bei 200 % Text;
// Stationsleiste (Höhe, Einrasten, aktive Station sichtbar, Tastatur und Touch); Menü (scrollbar, Fokus zurück); Formular
// (Eingabetypen, Autofill, Beschriftungen, Foto hinzufügen/entfernen, Fokus auf erstes Fehlerfeld, Doppelklick-Sperre, kein falscher
// Erfolg); Links (Seitenanker, Telefon, E-Mail, Termin); Hash-Navigation mit Browser-Zurück; Skip-Link; Drehen/Grösse ändern;
// Szene: Unterteilung bilinear (schräge Treppenwange), Geländer, kein dunkles Horizontband, Badwand fein gerastert; Stationsbilder
// gegenüber dem V17-Ausgangsstand neu gerendert.
// Aufruf: node tests/t20-v171.js   (WebGL über SwiftShader)
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), crypto = require('crypto'), { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const url = 'file://' + path.join(ROOT, 'dist/immoready-vorschau.html');
const RISE = JSON.parse(fs.readFileSync(path.join(ROOT, 'rise.json'), 'utf8'));
const log = []; const ok = (c, m) => log.push((c ? 'PASS ' : 'FAIL ') + m);
const launch = () => chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ROUTES = ['#start', '#leistungen', '#hauswartung', '#sanitaer', '#gartenunterhalt', '#reinigung', '#raeumung', '#leerstand', '#verkauf', '#fotografie', '#verwaltungen', '#ueber', '#kontakt', '#offerte', '#impressum', '#datenschutz', '#umsetzung'];
const VPS = [[320, 640, 1], [360, 800, 1], [375, 812, 1], [390, 844, 1], [393, 852, 1], [414, 896, 1], [430, 932, 1], [844, 390, 1], [768, 1024, 1], [1024, 768, 0], [1280, 800, 0], [1440, 900, 0], [1920, 1080, 0]];

/* je Seite: Überlauf, Kopf, Logo, Touchziele, Kontaktleiste */
function pageFacts() {
  const iss = [], R = e => e.getBoundingClientRect(), vis = e => e.offsetParent && getComputedStyle(e).visibility !== 'hidden';
  const sw = document.documentElement.scrollWidth; if (sw > innerWidth + 1) iss.push('Dokument ' + sw + ' px breit');
  const small = Array.from(document.querySelectorAll('a.btn,button,.burger,.hdr-call,.mbar a,.opt span,summary,.jr-nav button,.fchip,.copy-btn')).filter(vis)
    .filter(e => { const q = R(e); return q.width > 0 && (q.height < 43.5 || q.width < 43.5); }).map(e => (e.textContent || e.className).toString().trim().slice(0, 20) + ' ' + Math.round(R(e).width) + '×' + Math.round(R(e).height));
  if (small.length) iss.push('kleiner als 44 px: ' + Array.from(new Set(small)).slice(0, 4).join(', '));
  const hd = Array.from(document.querySelectorAll('.hdr .logo img,.hdr-call,.burger,.hdr .btn.top,.hdr .nav')).filter(e => e.offsetParent).map(e => R(e));
  for (let i = 0; i < hd.length; i++) for (let j = i + 1; j < hd.length; j++) { const A = hd[i], B = hd[j]; if (A.left < B.right - 1 && A.right > B.left + 1 && A.top < B.bottom - 1 && A.bottom > B.top + 1) iss.push('Kopfelemente überlappen'); }
  const lg = document.querySelector('.hdr .logo img'), lq = R(lg); if (lq.left < 0 || lq.right > innerWidth || Math.abs(lq.width / lq.height - 762 / 578) > 0.012 || lg.naturalWidth !== 762) iss.push('Logo ' + Math.round(lq.width) + '×' + Math.round(lq.height));
  const bar = document.querySelector('.mbar'), bs = getComputedStyle(bar);
  if (bs.display !== 'none') { const q = R(bar), al = /rgba\(.*,\s*([\d.]+)\)/.exec(bs.backgroundColor); if (q.height > 60.5) iss.push('Kontaktleiste ' + q.height + ' px'); if (al && +al[1] < 0.999) iss.push('Kontaktleiste durchscheinend');
    if (parseFloat(getComputedStyle(document.body).paddingBottom) < q.height - 1) iss.push('kein Platz für Kontaktleiste'); }
  if (document.querySelectorAll('.mbar').length !== 1) iss.push('Kontaktleiste nicht genau einmal');
  return iss;
}

(async () => {
  const b = await launch();

  // 1 Breiten × Seiten
  for (const [w, h, mob] of VPS) {
    const p = await b.newPage({ viewport: { width: w, height: h }, isMobile: !!mob, hasTouch: !!mob }); const errs = []; p.on('pageerror', e => errs.push(e.message));
    const bad = [];
    for (const r of ROUTES) { await p.goto(url + r); await p.waitForTimeout(r === '#start' ? 900 : 350); (await p.evaluate(pageFacts)).forEach(i => bad.push(r + ' ' + i)); }
    await p.goto(url + '#start'); await p.waitForTimeout(600); await p.evaluate(() => scrollTo(0, 1600)); await p.waitForTimeout(700);
    const hc = await p.evaluate(() => getComputedStyle(document.querySelector('.hdr')).backgroundColor); const ha = /rgba\(.*,\s*([\d.]+)\)/.exec(hc);
    if (ha && +ha[1] < 0.999) bad.push('kompakter Kopf durchscheinend ' + hc);
    ok(bad.length === 0 && errs.length === 0, `${w}×${h}${mob ? ' (Touch)' : ''}: 17 Seiten ohne seitliches Scrollen, Kopf ohne Überlappung, Logo unverzerrt, Bedienelemente ≥ 44 px, Kontaktleiste deckend ≤ 60 px mit Platz${bad.length ? ' – ' + bad.slice(0, 5).join(' | ') : ''}${errs.length ? ' – JS: ' + errs.join(' | ') : ''}`);
    await p.close();
  }

  // 2 320 px bei 200 % Text
  {
    const bad = [];
    for (const r of ['#start', '#offerte', '#leistungen', '#sanitaer', '#kontakt', '#impressum']) {
      const p = await b.newPage({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true }); await p.goto(url + r); await p.waitForTimeout(600);
      await p.evaluate(() => { document.documentElement.style.fontSize = '200%'; }); await p.waitForTimeout(400);
      const q = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cut: Array.from(document.querySelectorAll('h1,h2,h3,p,label,.btn')).filter(e => e.offsetParent && e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== 'visible').length }));
      if (q.sw > 321 || q.cut) bad.push(r + ' ' + q.sw + '/' + q.cut); await p.close();
    }
    ok(bad.length === 0, `320 px bei 200 % Textgrösse: 6 Seiten ohne seitliches Scrollen und ohne abgeschnittene Texte${bad.length ? ' – ' + bad.join(', ') : ''}`);
  }

  // 3 Stationsleiste Smartphone
  for (const w of [320, 390, 430]) {
    const p = await b.newPage({ viewport: { width: w, height: 800 }, isMobile: true, hasTouch: true }); await p.goto(url); await p.waitForTimeout(1000);
    const s0 = await p.evaluate(() => { const nav = document.querySelector('#reise .jr-nav'), cs = getComputedStyle(nav), bt = Array.from(nav.querySelectorAll('button')), n = nav.getBoundingClientRect();
      return { h: Math.min(...bt.map(x => x.getBoundingClientRect().height)), snap: cs.scrollSnapType, first: bt[0].getBoundingClientRect().left - n.left, sw: document.documentElement.scrollWidth, scrolls: nav.scrollWidth > nav.clientWidth }; });
    ok(s0.h >= 44 && /x/.test(s0.snap) && s0.first >= 0 && s0.sw <= w + 1 && s0.scrolls, `${w} px Stationsleiste: Knöpfe ≥ 44 px (${Math.round(s0.h)}), Einrasten (${s0.snap}), erste Station nicht abgeschnitten, kein seitliches Seiten-Scrollen`);
    await p.locator('#reise .jr-nav button').nth(4).tap(); await p.waitForTimeout(700);
    const t1 = await p.evaluate(() => { const nav = document.querySelector('#reise .jr-nav'), on = nav.querySelector('button.on'), n = nav.getBoundingClientRect(), q = on.getBoundingClientRect(); return { idx: Array.from(nav.querySelectorAll('button')).indexOf(on), inV: q.left >= n.left - 1 && q.right <= n.right + 1 }; });
    await p.locator('#reise .jr-nav button').nth(1).focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(700);
    const t2 = await p.evaluate(() => { const nav = document.querySelector('#reise .jr-nav'), on = nav.querySelector('button.on'), n = nav.getBoundingClientRect(), q = on.getBoundingClientRect(); return { idx: Array.from(nav.querySelectorAll('button')).indexOf(on), inV: q.left >= n.left - 1 && q.right <= n.right + 1, sw: document.documentElement.scrollWidth }; });
    ok(t1.idx === 4 && t1.inV && t2.idx === 1 && t2.inV && t2.sw <= w + 1, `${w} px Stationsleiste: Touch wählt Station 5, Tastatur (Enter) Station 2, aktive Station jeweils ganz sichtbar`);
    await p.close();
  }

  // 4 Menü: scrollbar auf kleinem Bildschirm, Fokus zurück auf den Menüknopf
  {
    const p = await b.newPage({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true }); await p.goto(url); await p.waitForTimeout(800);
    await p.click('#burger'); await p.waitForTimeout(450);
    const m = await p.evaluate(() => { const n = document.getElementById('mnav'), sc = Array.from(n.querySelectorAll('*')).concat([n]).filter(e => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 4);
      const last = Array.from(n.querySelectorAll('a,button')).filter(e => e.offsetParent).pop(); if (sc[0]) sc[0].scrollTop = sc[0].scrollHeight; const q = last.getBoundingClientRect();
      return { lock: getComputedStyle(document.body).overflow === 'hidden' || document.body.style.overflow === 'hidden', scrollable: sc.length > 0 || n.scrollHeight <= n.clientHeight + 4, lastVis: q.bottom <= innerHeight + 1 && q.top >= 0 }; });
    await p.keyboard.press('Escape'); await p.waitForTimeout(450);
    const f = await p.evaluate(() => document.activeElement && document.activeElement.id);
    ok(m.lock && m.scrollable && m.lastVis && f === 'burger', `Menü 320×568: Hintergrund gesperrt, vollständig scrollbar (letzter Eintrag erreichbar), Escape schliesst, Fokus zurück auf den Menüknopf (${f})`);
    await p.close();
  }

  // 5 Formular
  for (const w of [320, 390]) {
    const p = await b.newPage({ viewport: { width: w, height: 760 }, isMobile: true, hasTouch: true }); const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.goto(url + '#offerte'); await p.waitForTimeout(800);
    const a = await p.evaluate(() => { const q = id => document.getElementById(id);
      const labels = ['ort', 'beschreibung', 'name', 'email', 'tel'].every(id => { const l = document.querySelector('label[for="' + id + '"]'); return l && l.getBoundingClientRect().height > 0; });
      return { em: q('email').type, tel: q('tel').type, acE: q('email').autocomplete, acN: q('name').autocomplete, acT: q('tel').autocomplete, labels, cols: new Set(Array.from(document.querySelectorAll('#fs_leistung .opt span')).map(s => Math.round(s.getBoundingClientRect().left))).size }; });
    ok(a.em === 'email' && a.tel === 'tel' && /email/.test(a.acE) && /name/.test(a.acN) && /tel/.test(a.acT) && a.labels && a.cols === (w < 375 ? 1 : 2),
      `${w} px Formular: Eingabetypen email/tel, Autofill (${a.acN}, ${a.acE}, ${a.acT}), sichtbare Beschriftungen, Leistungskarten ${a.cols}-spaltig`);
    // Fehler: leeres Absenden → Fokus auf erstes fehlerhaftes Feld, Eingaben bleiben erhalten
    await p.fill('#name', 'Test Person');
    await p.evaluate(() => { const t = document.getElementById('next').getBoundingClientRect().top + scrollY - innerHeight / 2; scrollTo({ top: t, behavior: 'instant' }); });
    await p.click('#next'); await p.waitForTimeout(500);
    const e1 = await p.evaluate(() => { const a = document.activeElement; return { name: a && (a.name || a.id), sum: !document.getElementById('errsum').hidden, keep: document.getElementById('name').value, inv: a && (a.getAttribute('aria-invalid') === 'true' || !!a.closest('[aria-invalid="true"]') || a.name === 'leistung'), vis: (() => { const q = (a.closest('.f') || a.closest('fieldset') || a).getBoundingClientRect(); return q.bottom > 0 && q.top < innerHeight; })() }; });
    ok(e1.name === 'leistung' && e1.sum && e1.keep === 'Test Person' && e1.vis, `${w} px Formular: Fokus auf erstem fehlerhaften Feld (${e1.name}), im Bild, Fehlerübersicht sichtbar, Eingaben bleiben erhalten`);
    // Fotos: hinzufügen und entfernen
    await p.setInputFiles('#fotos', path.join(ROOT, 'tests/fixtures/TEST-foto.png')); await p.waitForTimeout(300);
    const f1 = await p.evaluate(() => document.querySelectorAll('#fileList li').length);
    await p.click('#fileList [data-rm="0"]'); await p.waitForTimeout(200);
    const f2 = await p.evaluate(() => document.querySelectorAll('#fileList li').length);
    ok(f1 === 1 && f2 === 0, `${w} px Formular: Foto hinzufügen (${f1}) und wieder entfernen (${f2})`);
    // vollständig ausfüllen, Doppelklick, Demo-Ergebnis
    await p.locator('#fs_leistung .opt', { hasText: 'Hauswartung' }).first().click();
    await p.fill('#ort', '5400 Baden'); await p.fill('#beschreibung', 'Regelmässige Hauswartung für ein Mehrfamilienhaus.'); await p.fill('#email', 'test@beispiel.ch'); await p.fill('#tel', '079 123 45 67');
    await p.evaluate(() => document.activeElement && document.activeElement.blur());
    await p.evaluate(() => { document.getElementById('simFail').checked = true; });
    await p.evaluate(() => { const t = document.getElementById('next').getBoundingClientRect().top + scrollY - innerHeight / 2; scrollTo({ top: t, behavior: 'instant' }); }); await p.waitForTimeout(200);
    const hit = await p.evaluate(() => { const bt = document.getElementById('next'), q = bt.getBoundingClientRect(), el = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); return el === bt || bt.contains(el); });
    await p.evaluate(() => { window.__subm = 0; document.getElementById('qf').addEventListener('submit', () => { if (document.getElementById('next').getAttribute('aria-busy') !== 'true') window.__subm++; }, true); });
    await p.click('#next'); await p.click('#next', { force: true }); await p.click('#next', { force: true }); await p.waitForTimeout(150);
    const busy = await p.evaluate(() => document.getElementById('next').getAttribute('aria-busy'));
    await p.waitForTimeout(1100);
    const fail = await p.evaluate(() => ({ fb: !document.getElementById('failbox').hidden, res: document.getElementById('result').hidden, n: window.__subm }));
    ok(hit && busy === 'true' && fail.n === 1 && fail.fb && fail.res, `${w} px Formular: Absenden frei erreichbar, Doppelklick gesperrt (1 Übermittlung trotz 3 Klicks), Fehlerfall zeigt Hinweis statt Erfolg`);
    await p.evaluate(() => { document.getElementById('simFail').checked = false; }); await p.click('#next'); await p.waitForTimeout(500);
    const res = await p.evaluate(() => { const r = document.getElementById('result'); return { shown: !r.hidden, t: r.textContent }; });
    ok(res.shown && /keine Übermittlung/.test(res.t) && /nichts gesendet und nichts gespeichert/.test(res.t) && errs.length === 0, `${w} px Formular: Demo-Modus deutlich – «keine Übermittlung», «nichts gesendet und nichts gespeichert», keine JS-Fehler`);
    await p.close();
  }

  // 6 Links, Hash-Navigation, Zurück, Skip-Link, Drehen
  {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.goto(url); await p.waitForTimeout(900);
    const L = await p.evaluate(() => { const pages = new Set(Array.from(document.querySelectorAll('[data-page]')).map(e => e.dataset.page)); const a = Array.from(document.querySelectorAll('a[href]'));
      const deadHash = [];
      const tel = a.filter(x => /^tel:/.test(x.href)).map(x => x.getAttribute('href')), mail = a.filter(x => /^mailto:/.test(x.href)).map(x => x.getAttribute('href'));
      const ext = a.filter(x => /^https?:/.test(x.getAttribute('href'))).map(x => x.getAttribute('href'));
      return { dead: Array.from(new Set(deadHash)), tel: Array.from(new Set(tel)), mail: Array.from(new Set(mail)), ext: Array.from(new Set(ext)), termin: ext.filter(h => /immoready\.ch\/(book-online|booking-calendar)/.test(h)).length }; });
    // jeden Anker über den Router aufrufen: er muss eine Seite (nicht den Rückfall «start») oder ein vorhandenes Element treffen
    const hashes = await p.evaluate(() => Array.from(new Set(Array.from(document.querySelectorAll('a[href^="#"]')).map(x => x.getAttribute('href')).filter(h => h.length > 1))));
    const dead = [];
    for (const h of hashes) { await p.evaluate(h => { location.hash = h; }, h); await p.waitForTimeout(60);
      const r = await p.evaluate(h => { const m = /\broute-(\S+)/.exec(document.body.className); return { page: m && m[1], el: !!document.getElementById(h.slice(1)) }; }, h);
      if (r.page === 'start' && h !== '#start' && !r.el) dead.push(h); }
    ok(hashes.length >= 15 && dead.length === 0, `Alle ${hashes.length} Seitenanker führen über den Router zu einer Seite oder einem Element${dead.length ? ' – tot: ' + dead.join(', ') : ''}`);
    ok(L.tel.length === 1 && L.tel[0] === 'tel:+41763404401' && L.mail.length === 1 && L.mail[0] === 'mailto:info.immoready@gmail.com', `Telefon- und E-Mail-Links einheitlich (${L.tel.join(', ')} · ${L.mail.join(', ')})`);
    ok(L.termin > 0 && L.ext.every(h => /^https:\/\/(www\.)?immoready\.ch\//.test(h) || /^https:\/\/fonts\./.test(h)), `Terminlink vorhanden (${L.termin}×), externe Links nur HTTPS auf immoready.ch`);
    await p.goto(url + '#leistungen'); await p.waitForTimeout(400); await p.goto(url + '#kontakt'); await p.waitForTimeout(400);
    await p.evaluate(() => { location.hash = '#sanitaer'; }); await p.waitForTimeout(400);
    await p.goBack(); await p.waitForTimeout(500);
    const back = await p.evaluate(() => ({ h: location.hash, vis: Array.from(document.querySelectorAll('[data-page]')).filter(e => e.offsetParent || getComputedStyle(e).display !== 'none').map(e => e.dataset.page) }));
    ok(back.h === '#kontakt' && back.vis.includes('kontakt') && !back.vis.includes('sanitaer'), `Hash-Navigation und Browser-Zurück: zurück auf #kontakt (sichtbar: ${back.vis.slice(0, 3).join(', ')})`);
    const sp = await b.newPage({ viewport: { width: 1440, height: 900 } }); await sp.goto(url + '#kontakt'); await sp.waitForTimeout(600); await sp.keyboard.press('Tab');
    const sk = await sp.evaluate(() => { const a = document.activeElement; return { cls: a.className, vis: a.getBoundingClientRect().height > 0 && a.getBoundingClientRect().top >= 0 }; });
    await sp.keyboard.press('Enter'); await sp.waitForTimeout(300);
    const sk2 = await sp.evaluate(() => { const a = document.activeElement, m = document.getElementById('main'); return (a === m || m.contains(a)) && /route-kontakt/.test(document.body.className); }); await sp.close();
    ok(/skip/.test(sk.cls) && sk.vis && sk2, `Skip-Link (#kontakt): erster Tabstopp beim Laden, sichtbar bei Fokus, führt zum Inhalt der aktuellen Seite (${sk.cls})`);
    ok(errs.length === 0, 'Links und Navigation: keine JS-Fehler ' + errs.join(' | '));
    await p.close();
    const q = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); const qe = []; q.on('pageerror', e => qe.push(e.message)); await q.goto(url); await q.waitForTimeout(900);
    await q.setViewportSize({ width: 844, height: 390 }); await q.waitForTimeout(700); const r1 = await q.evaluate(() => document.documentElement.scrollWidth);
    await q.setViewportSize({ width: 390, height: 844 }); await q.waitForTimeout(700); const r2 = await q.evaluate(() => ({ sw: document.documentElement.scrollWidth, img: !!document.querySelector('#reise .jr-still.on') }));
    await q.setViewportSize({ width: 1280, height: 800 }); await q.waitForTimeout(900); const r3 = await q.evaluate(() => document.documentElement.scrollWidth);
    ok(r1 <= 845 && r2.sw <= 391 && r2.img && r3 <= 1281 && qe.length === 0, `Drehen 390×844 → 844×390 → 390×844 → 1280×800: Layout passt sich an, kein seitliches Scrollen, Stationsbild aktiv, keine JS-Fehler`);
    await q.close();
  }

  // 7 Szene (WebGL)
  {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(() => { window.IR_FORCE_HQ = true; });
    await p.goto(url); await p.waitForFunction(() => window.__jr === true && window.__JR.state().scan.state === 'done', null, { timeout: 150000 });
    const st = await p.evaluate(() => window.__JR.sceneStats());
    ok(st.prebaked === true, 'Lichtdaten passen zur V17.1-Geometrie (Prüfsumme)');
    // schräge Treppenwange: senkrechter Strahl über der Wange trifft sie auf Höhe der Stufenlinie (vorher waagrecht bei 1,13 m)
    const ry = await p.evaluate(() => { const r = []; for (const z of [4.6, 3.4, 2.3]) r.push(window.__JR.rayY ? window.__JR.rayY(-1.76, 3.0, z, -1) : null); return r; });
    const nose = z => Math.min(1.94, Math.max(0.176, 0.176 * (1 + (5.01 - z) / 0.29)));
    const exp = [4.6, 3.4, 2.3].map(z => 0.5 + nose(z) + 0.06);
    ok(ry.every((y, i) => y !== null && Math.abs(y - exp[i]) < 0.03), `Treppenwange folgt der Steigung (Oberkante bei z 4.6/3.4/2.3: ${ry.map(v => v === null ? '–' : v.toFixed(2)).join(' / ')} m; erwartet ${exp.map(v => v.toFixed(2)).join(' / ')} m – vorher waagrecht)`);
    // Horizont: unterhalb der Hügel kein fast schwarzes Band (Dachansicht und Gesamtansicht)
    await p.addStyleTag({ content: '.jr-ui,.jr-tag,.jr-tech,.jr-hot{display:none!important}.jr-stage::after{display:none!important}.hdr,.demo,.mbar{display:none!important}' });
    const dark = [];
    for (const c of [{ q: 0.03, e: [18, 22, 22], t: [0, 13, 0], f: 0.6 }, { q: 0.03, e: [35.647, 16.596, 46.754], t: [-10.402, 4.649, 6.271], f: 0.5744 }]) {
      await p.evaluate(c => { window.__JR.setScale(1, true); window.__JR.jump(c.q); window.__JR.setCamera({ e: c.e, t: c.t, f: c.f }); }, c); await p.waitForTimeout(3500);
      const buf = await p.locator('#reise .jr-stage').screenshot({ clip: undefined });
      fs.writeFileSync(path.join(ROOT, 'shots', '_t20.png'), buf);
      const n = +execFileSync('python3', ['-c', 'import sys;from PIL import Image;im=Image.open(sys.argv[1]).convert("RGB");w,h=im.size;px=im.load();print(sum(1 for x in range(0,w,4) for y in range(0,h//3,4) if sum(px[x,y])<75 and px[x,y][2]>px[x,y][0]))', path.join(ROOT, 'shots', '_t20.png')]).toString();
      dark.push(n);
    }
    try { fs.unlinkSync(path.join(ROOT, 'shots', '_t20.png')); } catch (e) {}
    ok(dark.every(n => n < 40), `Kein schwarzblaues Band am Horizont (dunkle Pixel im oberen Bilddrittel: Dach ${dark[0]}, Gesamt ${dark[1]})`);
    ok(errs.length === 0, 'Szene: keine JS-Fehler ' + errs.join(' | '));
    await p.close();
  }
  await b.close();

  // 8 Stationsbilder gegenüber dem V17-Ausgangsstand neu (Tag v17-ausgang)
  const names = []; RISE.tour.stations.forEach(s => { names.push(s.still); (s.details || []).forEach(d => names.push(d.still)); });
  let same = [], checked = 0;
  for (const n of names) for (const suf of ['', '-hoch']) {
    const f = path.join(ROOT, 'assets/tour', n + suf + '.webp'); if (!fs.existsSync(f)) continue;
    let old = null; try { old = crypto.createHash('sha1').update(execFileSync('git', ['-C', ROOT, 'show', 'v17-ausgang:assets/tour/' + n + suf + '.webp'], { maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'ignore'] })).digest('hex'); checked++; } catch (e) {}
    if (old && old === crypto.createHash('sha1').update(fs.readFileSync(f)).digest('hex')) same.push(n + suf);
  }
  ok(checked > 0 && same.length === 0, `Alle ${names.length * 2} Stationsbilder aus der finalen Szene neu gerendert (gegenüber v17-ausgang verglichen: ${checked})${same.length ? ' – unverändert: ' + same.join(', ') : ''}`);
  console.log(log.join('\n'));
  process.exitCode = log.some(l => l.startsWith('FAIL')) ? 1 : 0;
})();
