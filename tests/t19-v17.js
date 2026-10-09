// V17-Prüfungen «Final Realism, Schweizer Architektur und Mobile Polish»:
// Smartphone 360/390/430 (Kontaktleiste verdeckt nichts, Platz reserviert, Stationsleiste scrollbar mit sichtbarer aktiver Station,
// kein seitliches Scrollen, Original-Logo vollständig und unverzerrt, Hero-Titel sichtbar), Formular bis zum Absenden bedienbar,
// Bad (Beschriftung nur an den Objekten, Bildunterschrift bei den Markierungen), neue Stationsbilder (≠ V16), Lichtdaten passen.
// Aufruf: node tests/t19-v17.js   (WebGL über SwiftShader)
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), crypto = require('crypto'), { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const url = 'file://' + path.join(ROOT, 'dist/immoready-vorschau.html');
const RISE = JSON.parse(fs.readFileSync(path.join(ROOT, 'rise.json'), 'utf8'));
const ST = RISE.tour.stations, BAD = ST.findIndex(s => s.key === 'bad');
const log = []; const ok = (c, m) => log.push((c ? 'PASS ' : 'FAIL ') + m);
const launch = () => chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

(async () => {
  const b = await launch();

  // 1 Smartphone: Kontaktleiste, Kopf, Logo, Hero, Stationsleiste
  for (const [w, h] of [[360, 800], [390, 844], [393, 852], [430, 932]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true }); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(url); await p.waitForTimeout(1200);
    const r = await p.evaluate(() => {
      const R = el => { const q = el.getBoundingClientRect(); return { l: q.left, r: q.right, t: q.top, b: q.bottom, w: q.width, h: q.height }; };
      const bar = document.querySelector('.mbar'), mb = R(bar), h1 = R(document.querySelector('#reise .jr-st.on h1')), nav = document.querySelector('#reise .jr-nav');
      const logo = document.querySelector('.logo img'), lg = R(logo), cs = getComputedStyle(logo);
      const ctrls = Array.from(document.querySelectorAll('.hdr-call,.burger,.mbar a')).map(e => { const q = e.getBoundingClientRect(); return Math.min(q.width, q.height); });
      const btns = Array.from(nav.querySelectorAll('button')).map(R), nr = R(nav);
      return { sw: document.documentElement.scrollWidth, iw: innerWidth, mb, h1, nav: nr, navScroll: nav.scrollWidth > nav.clientWidth + 2, first: btns[0], navH: nr.h,
        logo: { nw: logo.naturalWidth, nh: logo.naturalHeight, ...lg, filter: cs.filter, objFit: cs.objectFit }, ctrls, pb: parseFloat(getComputedStyle(document.body).paddingBottom), hdr: R(document.querySelector('.hdr')), reise: R(document.getElementById('reise')) };
    });
    ok(r.sw <= w + 1 && r.iw === w, `${w} px: kein seitliches Scrollen (Dokument ${r.sw} px, Layout-Viewport ${r.iw} px)`);
    ok(r.mb.h <= 60 && Math.min(...r.ctrls) >= 44, `${w} px: Kontaktleiste flach (${Math.round(r.mb.h)} px), alle Bedienelemente ≥ 44 px (kleinstes ${Math.round(Math.min(...r.ctrls))} px)`);
    ok(r.h1.b <= r.mb.t && r.h1.t >= r.hdr.b, `${w} px: Hero-Titel vollständig sichtbar und nicht unter der Kontaktleiste (Titel ${Math.round(r.h1.t)}–${Math.round(r.h1.b)}, Leiste ab ${Math.round(r.mb.t)})`);
    ok(r.nav.b <= r.mb.t && r.navScroll && r.first.l >= 0, `${w} px: Stationsleiste über der Kontaktleiste, waagrecht scrollbar, Anfang nicht abgeschnitten`);
    ok(r.pb >= r.mb.h - 1, `${w} px: Platz für die Kontaktleiste unten reserviert (padding-bottom ${r.pb} px ≥ Leiste ${Math.round(r.mb.h)} px)`);
    const ratio = r.logo.w / r.logo.h;
    ok(r.logo.nw === 762 && r.logo.nh === 578 && Math.abs(ratio - 762 / 578) < 0.01 && r.logo.l >= 0 && r.logo.r <= r.iw && r.logo.filter === 'none' && r.logo.h >= 96,
      `${w} px: Original-Logo vollständig, unverzerrt (${r.logo.w.toFixed(0)}×${r.logo.h.toFixed(0)} px, Seitenverhältnis ${ratio.toFixed(3)}), ohne Filter`);
    ok(Math.abs(r.reise.t - r.hdr.b) < 2, `${w} px: Rundgangsbild beginnt direkt unter dem Kopf (keine leeren Platzhalter davor)`);
    // Hero-CTA lässt sich ganz über die Kontaktleiste scrollen und ist dort frei klickbar
    const cta = await p.evaluate(() => { const a = document.querySelector('#reise .jr-st.on .btn'), bar = document.querySelector('.mbar'); const q = a.getBoundingClientRect();
      scrollTo({ top: Math.max(0, q.bottom + scrollY - bar.getBoundingClientRect().top + 8), behavior: 'instant' }); const q2 = a.getBoundingClientRect(), e = document.elementFromPoint(q2.left + q2.width / 2, q2.top + q2.height / 2); const okc = e === a || a.contains(e); scrollTo({ top: 0, behavior: 'instant' }); return okc; });
    ok(cta, `${w} px: «Offerte anfragen» im Hero früh erreichbar und frei über der Kontaktleiste`);
    // aktive Station sichtbar: letzte Station wählen
    await p.evaluate(() => document.querySelectorAll('#reise .jr-nav button')[5].click()); await p.waitForTimeout(900);
    const act = await p.evaluate(() => { const nav = document.querySelector('#reise .jr-nav'), n = nav.getBoundingClientRect(), b = nav.querySelector('button.on').getBoundingClientRect(); return { l: b.left - n.left, r: n.right - b.right }; });
    ok(act.l >= -1 && act.r >= -1, `${w} px: aktive Station «${ST[5].nav}» in der Leiste ganz sichtbar (Rand links ${Math.round(act.l)} px, rechts ${Math.round(act.r)} px)`);
    // Ende der Seite: Fusszeile nicht verdeckt
    await p.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })); await p.waitForTimeout(700);
    const end = await p.evaluate(() => { const bar = document.querySelector('.mbar'), vis = getComputedStyle(bar).display !== 'none' && bar.getBoundingClientRect().top < innerHeight - 2;
      const last = document.querySelector('.ftr .base').getBoundingClientRect(); return { vis, lastB: last.bottom, barT: vis ? bar.getBoundingClientRect().top : innerHeight }; });
    ok(end.lastB <= end.barT + 1, `${w} px: Fusszeile am Seitenende nicht verdeckt (letzte Zeile endet ${Math.round(end.lastB)}, Leiste ab ${Math.round(end.barT)})`);
    // Tastatur: Texteingabe fokussiert → Leiste weg
    await p.evaluate(() => { location.hash = '#kontakt'; }); await p.waitForTimeout(300);
    await p.evaluate(() => { location.hash = '#start'; }); await p.waitForTimeout(500);
    const kb = await p.evaluate(() => { const i = document.createElement('input'); i.type = 'text'; i.style.cssText = 'position:fixed;top:0;left:0'; document.body.appendChild(i); i.focus(); const d = getComputedStyle(document.querySelector('.mbar')).display; i.blur(); i.remove(); return d; });
    ok(kb === 'none', `${w} px: Kontaktleiste bei geöffneter Tastatur (Textfeld fokussiert) ausgeblendet`);
    ok(errs.length === 0, `${w} px: keine JS-Fehler ${errs.join(' | ')}`);
    await p.close();
  }

  // 2 Formular auf 360 und 390: Karten, Segmentwahl, bis zum Absenden bedienbar
  for (const [w, h] of [[360, 800], [390, 844]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
    await p.goto(url + '#offerte'); await p.waitForTimeout(900);
    const f = await p.evaluate(() => { const sp = Array.from(document.querySelectorAll('#fs_leistung .opt span'));
      const cols = new Set(sp.map(s => Math.round(s.getBoundingClientRect().left))).size, over = sp.filter(s => s.scrollWidth > s.clientWidth + 1).map(s => s.textContent);
      const seg = Array.from(document.querySelectorAll('.opts.seg .opt span')).map(s => s.getBoundingClientRect().height);
      const ip = document.querySelector('.formwrap'), first = ip.firstElementChild; return { cols, over, seg, formFirst: first.id === 'formSlotPage' || getComputedStyle(first).order === '-1' || document.getElementById('formSlotPage').getBoundingClientRect().top < document.querySelector('.aside-contact').getBoundingClientRect().top }; });
    ok(f.over.length === 0 && f.cols === (w < 375 ? 1 : 2), `${w} px: Leistungskarten ${f.cols}-spaltig, kein Text läuft über${f.over.length ? ' (' + f.over.join(', ') + ')' : ''}`);
    ok(f.seg.length === 2 && Math.min(...f.seg) >= 44 && f.formFirst, `${w} px: «Einmalig / Regelmässig» als Segmentwahl (${f.seg.map(Math.round).join('/')} px), Formular vor den Kontaktangaben`);
    // ganze Karte klickbar (Klick auf den Text), ausgewählter Zustand sichtbar
    await p.locator('#fs_leistung .opt', { hasText: 'Immobilien' }).click({ position: { x: 40, y: 12 } });
    await p.locator('.opts.seg .opt', { hasText: 'Regelmässig' }).click(); await p.waitForTimeout(450);
    const sel = await p.evaluate(() => ({ l: document.querySelector('input[name="leistung"]:checked')?.value, a: document.querySelector('input[name="auftrag"]:checked')?.value,
      bg: getComputedStyle(document.querySelector('input[name="auftrag"]:checked + span')).backgroundColor }));
    ok(sel.l === 'fotografie' && sel.a === 'laufend' && sel.bg !== 'rgba(0, 0, 0, 0)', `${w} px: ganze Fläche wählbar (Leistung ${sel.l}, Art ${sel.a}), Auswahl farbig markiert`);
    await p.fill('#ort', 'Baden'); await p.fill('#beschreibung', 'Fotos und 360-Grad-Rundgang für eine Mietwohnung.'); await p.fill('#name', 'Test Person'); await p.fill('#email', 'test@beispiel.ch');
    await p.evaluate(() => document.activeElement && document.activeElement.blur());
    await p.evaluate(() => { const t = document.getElementById('next').getBoundingClientRect().top + scrollY - innerHeight / 2; scrollTo({ top: t, behavior: 'instant' }); }); await p.waitForTimeout(400);
    const hit = await p.evaluate(() => { const bt = document.getElementById('next'), q = bt.getBoundingClientRect(), el = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); return { top: el === bt || bt.contains(el), mbar: getComputedStyle(document.querySelector('.mbar')).display }; });
    await p.click('#next'); await p.waitForTimeout(500);
    const res = await p.evaluate(() => { const r = document.getElementById('result'); return { shown: !r.hidden, text: r.textContent }; });
    ok(hit.top && res.shown && /Demo-Modus · keine Übermittlung/.test(res.text) && /Es wurde nichts gesendet/.test(res.text),
      `${w} px: Absenden erreichbar (Knopf frei, nicht verdeckt) – Demo-Hinweis «keine Übermittlung», keine falsche Erfolgsmeldung`);
    await p.close();
  }

  // 3 Desktop: Bad – Beschriftung als Attribut, Bildunterschrift bei den Markierungen, ein H1, Szene/Licht
  {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(url);
    await p.waitForFunction(() => window.__jr === true && window.__JR.state().scan.state === 'done', null, { timeout: 120000 });
    const st = await p.evaluate(() => window.__JR.sceneStats());
    ok(st.prebaked === true, 'Vorab gerechnetes Licht passt zur endgültigen Geometrie (Prüfsumme)');
    ok(st.vertices <= 361344 * 1.25, `Geometrie nicht pauschal erhöht: ${st.vertices} Eckpunkte (V16: 361 344, Grenze +25 %)`);
    const tx = await p.evaluate(() => { const t = document.querySelector('.jr-tech'); const body = document.body.innerText; return { empty: t.textContent.trim() === '', labels: Array.from(t.querySelectorAll('[data-l]')).map(e => e.dataset.l), loose: /Eckventil|Siphon und/.test(body) }; });
    ok(tx.empty && tx.labels.length === 4 && !tx.loose, `Bad: Beschriftungen nur als Attribut an den Markierungen (${tx.labels.slice(0, 3).join(' · ')}), kein loser Text im Dokument`);
    const h1 = await p.evaluate(() => Array.from(document.querySelectorAll('h1')).filter(h => h.offsetParent !== null && getComputedStyle(h).visibility !== 'hidden').length);
    ok(h1 === 1, `Genau eine sichtbare Hauptüberschrift (h1) auf der Startseite (${h1})`);
    const hiFar = await p.evaluate(() => document.getElementById('reise').classList.contains('jr-hi'));
    await p.evaluate(i => window.__JR.goStation(i), BAD);
    await p.waitForTimeout(600);
    const hiEarly = await p.evaluate(() => { const s = window.__JR.state(); return { hi: document.getElementById('reise').classList.contains('jr-hi'), ps: s.ps }; });
    ok(!hiFar && !(hiEarly.hi && hiEarly.ps < 0.68), `Bad-Beschriftung erst sichtbar, wenn die Kamera im Bad ist (nicht während der Fahrt; p ${hiEarly.ps.toFixed(2)})`);
    await p.waitForFunction(q => Math.abs(window.__JR.state().ps - q) < 0.003 && document.getElementById('reise').classList.contains('jr-hi'), ST[BAD].hold, { timeout: 90000 }).catch(() => {});
    await p.waitForFunction(() => getComputedStyle(document.querySelector('.jr-tech')).opacity > 0.95, null, { timeout: 10000 }).catch(() => {});
    await p.waitForTimeout(800);
    const cap = await p.evaluate(() => { const c = document.querySelector('.jr-tech-c').getBoundingClientRect(), L = Array.from(document.querySelectorAll('.jr-tech span')).map(s => s.getBoundingClientRect()), st = document.querySelector('#reise .jr-stage').getBoundingClientRect();
      const yMax = Math.max(...L.map(r => r.bottom)), yMin = Math.min(...L.map(r => r.top)), xMin = Math.min(...L.map(r => r.left)), xMax = Math.max(...L.map(r => r.right));
      return { near: (c.top >= yMax - 4 && c.top - yMax < 90) || (c.bottom <= yMin + 4 && yMin - c.bottom < 90), inX: c.right > xMin - 60 && c.left < xMax + 60, inside: L.every(r => r.left >= st.left && r.right <= st.right && r.top >= st.top && r.bottom <= st.bottom) }; });
    ok(cap.near && cap.inX && cap.inside, '«Schematische Kennzeichnung» direkt bei den Markierungen, Markierungen im Bild');
    ok(errs.length === 0, 'Desktop: keine JS-Fehler ' + errs.join(' | '));
    await p.close();
    const p2 = await b.newPage({ viewport: { width: 1440, height: 900 } }); await p2.goto(url + '#offerte'); await p2.waitForTimeout(800);
    const h1o = await p2.evaluate(() => Array.from(document.querySelectorAll('h1')).filter(h => h.offsetParent !== null).length);
    ok(h1o === 1, `Offertseite: genau eine sichtbare h1 (${h1o})`); await p2.close();
  }
  // 4 Menü, Textvergrösserung 200 %, Querformat, Desktopbreiten, IDs, Bilder
  {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); await p.goto(url); await p.waitForTimeout(900);
    const m = [];
    await p.click('#burger'); await p.waitForTimeout(350); m.push(await p.evaluate(() => document.getElementById('mnav').dataset.open === 'true' && document.body.style.overflow === 'hidden'));
    await p.click('#mclose'); await p.waitForTimeout(350); m.push(await p.evaluate(() => document.getElementById('mnav').dataset.open === 'false' && document.body.style.overflow === ''));
    await p.click('#burger'); await p.waitForTimeout(350); await p.keyboard.press('Escape'); await p.waitForTimeout(350); m.push(await p.evaluate(() => document.getElementById('mnav').dataset.open === 'false'));
    await p.click('#burger'); await p.waitForTimeout(350); await p.locator('#mnav a[href="#kontakt"]').first().click(); await p.waitForTimeout(500);
    m.push(await p.evaluate(() => document.getElementById('mnav').dataset.open === 'false' && location.hash === '#kontakt' && document.body.style.overflow === ''));
    const ml = await p.evaluate(() => { const i = document.querySelector('#mnav img'); return i ? Math.abs(i.getBoundingClientRect().width / i.getBoundingClientRect().height - 762 / 578) < 0.01 : true; });
    ok(m.every(Boolean) && ml, `Mobiles Menü: öffnet (Hintergrund gesperrt), schliesst per Knopf, Escape und Link (${m.join('/')}), Logo im Menü unverzerrt`);
    await p.close();
    for (const route of ['', '#offerte', '#leistungen', '#sanitaer']) {
      const q = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); await q.goto(url + route); await q.waitForTimeout(700);
      await q.evaluate(() => { document.documentElement.style.fontSize = '200%'; }); await q.waitForTimeout(400);
      const r = await q.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));
      ok(r.sw <= 391 && r.iw <= 391, `Textvergrösserung 200 % (390 px, ${route || '#start'}): kein seitliches Scrollen, nichts abgeschnitten (Dokument ${r.sw} px)`);
      await q.close();
    }
    const l = await b.newPage({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true }); const le = []; l.on('pageerror', e => le.push(e.message)); await l.goto(url); await l.waitForTimeout(1500);
    const lr = await l.evaluate(() => { const c = Array.from(document.querySelectorAll('.hdr-call,.burger')).filter(e => e.offsetParent).map(e => Math.min(e.getBoundingClientRect().width, e.getBoundingClientRect().height)); return { sw: document.documentElement.scrollWidth, iw: innerWidth, c: c.length ? Math.min(...c) : 44 }; });
    ok(lr.sw <= 845 && lr.iw === 844 && lr.c >= 44 && le.length === 0, `Smartphone quer 844×390: kein seitliches Scrollen, Bedienelemente ≥ 44 px, keine JS-Fehler`);
    await l.close();
  }
  for (const w of [1024, 1280, 1440, 1920, 720]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } }); const pe = []; p.on('pageerror', e => pe.push(e.message));
    const bad = [];
    for (const route of ['#start', '#leistungen', '#hauswartung', '#sanitaer', '#ueber', '#offerte', '#kontakt', '#impressum', '#datenschutz']) {
      await p.goto(url + route); await p.waitForTimeout(500);
      const r = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, lg: Array.from(document.querySelectorAll('.logo img,.ftr img')).filter(i => i.offsetParent).map(i => i.getBoundingClientRect()).every(q => Math.abs(q.width / q.height - 762 / 578) < 0.012) }));
      if (r.sw > r.iw + 1 || !r.lg) bad.push(route + ' ' + r.sw + (r.lg ? '' : ' Logo'));
    }
    ok(bad.length === 0 && pe.length === 0, `${w === 720 ? 'Desktop 1440 bei 200 % Zoom (720 px)' : 'Desktop ' + w + ' px'}: 9 Seiten ohne seitliches Scrollen, Logo unverzerrt${bad.length ? ' – ' + bad.join(', ') : ''}`);
    if (w === 1440) {
      const d = await p.evaluate(() => { const ids = Array.from(document.querySelectorAll('[id]')).map(e => e.id), dup = ids.filter((x, i) => ids.indexOf(x) !== i);
        const imgs = Array.from(document.querySelectorAll('img')), noAlt = imgs.filter(i => !i.hasAttribute('alt')).length, noSrc = imgs.filter(i => !i.getAttribute('src') && !i.closest('picture')).length;
        return { dup: Array.from(new Set(dup)), noAlt, noSrc }; });
      ok(d.dup.length === 0, `Keine doppelten IDs${d.dup.length ? ' – ' + d.dup.join(', ') : ''}`);
      ok(d.noAlt === 0 && d.noSrc === 0, `Alle Bilder mit Alttext und Quelle (ohne Alt: ${d.noAlt}, ohne Quelle: ${d.noSrc})`);
    }
    await p.close();
  }
  // 5 Produktionsform dist/site/ über HTTP (eigener Server): Seite, Rundgang mit Texturen und Lichtdaten aus Dateien, Smartphone-Bild
  {
    const { spawn } = require('child_process');
    const srv = spawn('python3', ['-m', 'http.server', '8704', '--bind', '127.0.0.1'], { cwd: path.join(ROOT, 'dist/site'), stdio: 'ignore' });
    await new Promise(r => setTimeout(r, 1200));
    try {
      const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); const pe = []; p.on('pageerror', e => pe.push(e.message));
      await p.goto('http://127.0.0.1:8704/index.html');
      await p.waitForFunction(() => window.__jr === true && window.__JR.state().scan.state === 'done', null, { timeout: 120000 });
      await p.waitForFunction(() => window.__JR.sceneStats().prebaked === true, null, { timeout: 20000 }).catch(() => {});
      const r = await p.evaluate(() => ({ pre: window.__JR.sceneStats().prebaked, b64: document.documentElement.outerHTML.indexOf('base64,') >= 0, logo: document.querySelector('.logo img').naturalWidth, ph: Array.from(document.querySelectorAll('img')).filter(i => /assets\/img\//.test(i.currentSrc || i.src)).length }));
      ok(r.pre === true && !r.b64 && r.logo === 762 && pe.length === 0, `Produktionsform dist/site/ (HTTP): Rundgang mit Lichtdaten aus licht.json, keine Base64-Daten im Dokument, Logo aus Datei${pe.length ? ' – ' + pe.join(' | ') : ''}`);
      await p.close();
      const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); await m.goto('http://127.0.0.1:8704/index.html'); await m.waitForTimeout(1500);
      const mr = await m.evaluate(() => { const i = document.querySelector('#reise .jr-still.on'); return { src: i.currentSrc, w: i.naturalWidth, h: i.naturalHeight }; });
      ok(/assets\/tour\/station-01-aussen-hoch\.webp$/.test(mr.src) && mr.w === 960 && mr.h === 864, `Produktionsform 390 px: Hochformatbild aus Datei (${mr.w}×${mr.h})`);
      await m.close();
    } finally { srv.kill(); }
  }
  await b.close();

  // 6 Stationsbilder: alle vorhanden, Hochformat 960×864, keine V16-Bilder (Inhalt ≠ Stand v16-stand)
  const names = []; ST.forEach(s => { names.push(s.still); (s.details || []).forEach(d => names.push(d.still)); });
  let missing = [], same = [], size = [];
  for (const n of names) for (const suf of ['', '-hoch']) {
    const f = path.join(ROOT, 'assets/tour', n + suf + '.webp'); if (!fs.existsSync(f)) { missing.push(n + suf); continue; }
    const cur = crypto.createHash('sha1').update(fs.readFileSync(f)).digest('hex');
    let old = null; try { old = crypto.createHash('sha1').update(execFileSync('git', ['-C', ROOT, 'show', 'v16-stand:assets/tour/' + n + suf + '.webp'], { maxBuffer: 1 << 26 })).digest('hex'); } catch (e) {}
    if (old === cur) same.push(n + suf);
    if (suf) { const dim = execFileSync('python3', ['-c', 'import sys;from PIL import Image;print("%dx%d"%Image.open(sys.argv[1]).size)', f]).toString().trim(); if (dim !== '960x864') size.push(n + suf + ' ' + dim); }
  }
  ok(missing.length === 0, `Alle ${names.length * 2} Stations- und Detailbilder vorhanden${missing.length ? ' – fehlen: ' + missing.join(', ') : ''}`);
  ok(same.length === 0, `Keine V16-Bilder im V17-Stand (alle neu gerendert)${same.length ? ' – unverändert: ' + same.join(', ') : ''}`);
  ok(size.length === 0, `Hochformatbilder 960×864 (10:9)${size.length ? ' – abweichend: ' + size.join(', ') : ''}`);
  console.log(log.join('\n'));
})();
