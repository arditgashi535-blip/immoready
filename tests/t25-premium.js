// t25 – Premium-Durchgang «realistische 3D-Gebäudereise»
//  · Einstieg: Überschrift, Beschreibung, «Offerte anfragen» und «Gebäude entdecken» (→ Rundgang), Zürich und Aargau sichtbar
//  · «Gebäude entdecken» startet den 3D-Rundgang erst beim Erreichen (verzögerter Start), das Foto ist sofort da
//  · Aktionen: sichtbare .btn mind. 48 px hoch; dekorative Pfeile aria-hidden; Navigation als Link, Aktion als Button
//  · Hover-Rückmeldung nur mit feinem Zeiger, ohne Verschiebung (kein Magnet-Effekt); bei «Bewegung reduzieren» keine Transformation
//  · Rundgang: sechs Stationen mit Bezeichnung, Text und Leistungsaktion; Eingang mit Hauswartung und Reinigung
//  · Pixelbudget: Zeichenfläche höchstens 2 Mio. Bildpunkte (1920×1080); Grössenänderung passt Zeichenfläche und Seitenverhältnis an
//  · request-quote mit Leistungsschlüssel aus rise.json
// Aufruf: node tests/t25-premium.js
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const url = 'file://' + path.join(ROOT, 'dist/immoready-vorschau.html');
const RISE = JSON.parse(fs.readFileSync(path.join(ROOT, 'rise.json'), 'utf8'));
const KEYS = RISE.services.map(s => s.key);
const log = []; const ok = (c, m) => log.push((c ? 'PASS ' : 'FAIL ') + m);
const GPU = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
(async () => {
  const b = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: GPU });
  try {
    /* 1 Einstieg */
    let p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(url); await p.waitForTimeout(500);
    const h = await p.evaluate(() => {
      const s = document.querySelector('#einstieg'), h1 = s.querySelector('h1'), a = [...s.querySelectorAll('.hero3-ctas a')];
      return { h1: h1.innerText.replace(/­/g, '').replace(/\s+/g, ' ').trim(), sub: s.querySelector('.hero3-sub').textContent.replace(/\u00ad/g, '').replace(/\s+/g, ' ').trim(), a: a.map(x => [x.textContent.trim(), x.getAttribute('href')]),
        img: !!s.querySelector('.hero3-media .ph, .hero3-media img, .hero3-media [style*="background"]') || getComputedStyle(s.querySelector('.hero3-media .illu') || s).backgroundImage !== 'none',
        jr: !!window.__jr, h1n: document.querySelectorAll('[data-page="start"] h1').length, h1all: [...document.querySelectorAll('[data-page]')].map(pg => pg.querySelectorAll('h1').length) };
    });
    ok(/^Ihre Liegenschaft\. Unsere Verantwortung\.$/i.test(h.h1), 'h1 «Ihre Liegenschaft. Unsere Verantwortung.» (' + h.h1 + ')');
    ok(h.sub === 'Ihr Familienbetrieb für Hauswartung, Sanitär und Unterhalt in Zürich und Aargau.', 'Beschreibung wie vorgegeben, Zürich und Aargau im Einstieg');
    ok(h.a.length === 2 && h.a[0][0] === 'Offerte anfragen' && h.a[0][1] === '#offerte' && h.a[1][0] === 'Gebäude entdecken' && h.a[1][1] === '#reise', 'Aktionen «Offerte anfragen» → #offerte, «Gebäude entdecken» → #reise');
    ok(h.h1n === 1 && h.h1all.every(n => n <= 1), 'genau eine h1 auf der Startseite, höchstens eine je Seite');
    ok(!h.jr, 'Rundgang beim Laden noch nicht gestartet (3D erst bei Annäherung)');
    /* 2 Aktionen */
    const btn = await p.evaluate(() => {
      const vis = [...document.querySelectorAll('.btn')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; });
      const small = vis.filter(e => e.getBoundingClientRect().height < 47.5).map(e => e.textContent.trim().slice(0, 30));
      const arrows = [...document.querySelectorAll('i.a')].filter(e => e.getAttribute('aria-hidden') !== 'true').length;
      const navBtn = [...document.querySelectorAll('button[onclick*="location"]')].length;
      return { n: vis.length, small, arrows, navBtn };
    });
    ok(btn.n > 0 && btn.small.length === 0, 'sichtbare Aktionen mind. 48 px hoch (' + btn.n + ')' + (btn.small.length ? ': ' + btn.small.join(' | ') : ''));
    ok(btn.arrows === 0, 'dekorative Pfeile mit aria-hidden="true"');
    ok(btn.navBtn === 0, 'keine Buttons, die nur navigieren');
    const sel = '#einstieg .hero3-ctas .btn.ghost', selS = '#einstieg .hero3-ctas .btn.sand';
    const sh0 = await p.evaluate(s => getComputedStyle(document.querySelector(s)).boxShadow, selS);
    const bb = await p.locator(selS).boundingBox(); await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(450);
    const hv = await p.evaluate(s => { const e = document.querySelector(s); return { tf: getComputedStyle(e).transform, sh: getComputedStyle(e).boxShadow }; }, selS);
    const bb1 = await p.locator(selS).boundingBox();
    ok(hv.sh !== sh0 && hv.tf === 'none' && Math.abs(bb1.y - bb.y) < 0.5, 'Hover mit Maus: Rückmeldung über Schatten, Schaltfläche bleibt unter dem Zeiger stehen');
    /* 3 «Gebäude entdecken» → Rundgang startet */
    await p.click(sel);
    await p.waitForFunction(() => window.__jr === true, null, { timeout: 120000 }).catch(() => {});
    const t = await p.evaluate(() => ({ jr: window.__jr === true, hash: location.hash, top: Math.round(document.getElementById('reise').getBoundingClientRect().top), hdr: Math.round(parseFloat(getComputedStyle(document.getElementById('reise')).scrollMarginTop) || document.querySelector('.hdr').getBoundingClientRect().height) }));
    ok(t.jr && t.hash === '#reise' && t.top >= -2 && t.top <= t.hdr + 4, '«Gebäude entdecken» führt zum Rundgang (Oberkante unter dem Kopf: ' + t.top + ' px, Abstand oben ' + t.hdr + ' px) und startet 3D');
    /* 4 Stationen */
    const st = await p.evaluate(() => [...document.querySelectorAll('#reise .jr-st')].map(s => ({ k: ((s.querySelector('p.mono') || {}).textContent || '').replace(/\u00ad/g, ''), h: (s.querySelector('h2,h3') || {}).textContent || '', p: (s.querySelector('p:not(.mono):not(.jr-kick)') || {}).textContent || '', pre: [...s.querySelectorAll('[data-pre],[data-choice]')].map(a => a.dataset.pre || a.dataset.choice), nav: '' })));
    const nav = await p.evaluate(() => [...document.querySelectorAll('#reise .jr-nav button')].map(b => b.textContent.trim()));
    ok(st.length === 6 && nav.length === 6, '6 Stationen, 6 Navigationspunkte');
    ok(st.every(s => s.h.trim() && s.k.trim()), 'jede Station mit Überzeile und Titel');
    ok(/Gesamtansicht/.test(st[0].k), 'Station 1 als Gesamtansicht bezeichnet');
    ok(st[2].pre.includes('hauswartung') && st[2].pre.includes('reinigung'), 'Eingang/Treppenhaus: Hauswartung und Reinigung anfragbar');
    ok(['reinigung', 'raeumung', 'leerstand'].every(k => st[3].pre.includes(k)), 'Wohnung: Reinigung, Räumung, Leerstand');
    ok(st[4].pre.includes('sanitaer'), 'Bad: Sanitär');
    ok(st.flatMap(s => s.pre).every(k => KEYS.includes(k)), 'alle Vorauswahlen sind Leistungsschlüssel aus rise.json');
    const det = await p.evaluate(() => [...document.querySelectorAll('#reise .jr-st')[4].querySelectorAll('[data-det]')].map(b => b.textContent.trim()));
    ok(det.join('|') === 'Übersicht|Waschtisch|WC', 'Bad: erst Raum, dann Waschtisch und WC (' + det.join(', ') + ')');
    /* 5 Ereignis request-quote */
    const ev = await p.evaluate(async () => {
      const r = document.getElementById('reise'); let got = null; const f = e => { got = e.detail; };
      window.__JR.goStation(2); await new Promise(x => setTimeout(x, 300));
      r.addEventListener('request-quote', f);
      const a = r.querySelectorAll('.jr-st')[2].querySelector('[data-pre="reinigung"]');
      a.addEventListener('click', e => e.preventDefault(), { once: true }); a.click();
      r.removeEventListener('request-quote', f); return got;
    });
    ok(ev && ev.service === 'reinigung' && ev.station === 'eingang' && ev.source === 'tour' && ev.version === 1, 'request-quote: Leistung «reinigung», Station «eingang» (' + JSON.stringify(ev) + ')');
    await p.close();
    /* 6 Pixelbudget 1920×1080 bei Pixeldichte 2 */
    p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
    await p.addInitScript(() => { window.IR_FORCE_HQ = true; });
    await p.goto(url); await p.evaluate(() => document.getElementById('reise').scrollIntoView({ block: 'start', behavior: 'instant' }));
    await p.waitForFunction(() => window.__jr === true, null, { timeout: 120000 }).catch(() => {});
    await p.evaluate(() => window.__JR.setScale && window.__JR.setScale(1, true)); await p.waitForTimeout(800);
    const s1 = await p.evaluate(() => window.__JR.state());
    ok(s1.canvas && s1.canvas[0] * s1.canvas[1] <= 2.0e6 + 4000, 'Zeichenfläche ≤ 2 Mio. Bildpunkte (' + (s1.canvas || []).join('×') + ', dpr ' + s1.dpr + ', Faktor ' + (s1.pxCap || 0).toFixed(3) + ')');
    ok(s1.dpr <= 1.5, 'Pixeldichte höchstens 1,5');
    const a1 = s1.canvas[0] / s1.canvas[1], c1 = s1.css[0] / s1.css[1];
    ok(Math.abs(a1 - c1) < 0.01, 'Seitenverhältnis der Zeichenfläche = Bühne');
    await p.setViewportSize({ width: 900, height: 1000 });
    await p.waitForFunction(w0 => { const s = window.__JR.state(); return s.canvas && s.canvas[0] !== w0; }, s1.canvas[0], { timeout: 20000, polling: 200 }).catch(() => {});
    const s2 = await p.evaluate(() => window.__JR.state());
    ok(s2.canvas && Math.abs(s2.canvas[0] / s2.canvas[1] - s2.css[0] / s2.css[1]) < 0.01 && s2.canvas[0] !== s1.canvas[0], 'nach Grössenänderung: neue Zeichenfläche mit passendem Seitenverhältnis (' + s2.canvas.join('×') + ')');
    await p.close();
    /* 7 Bewegung reduzieren: kein Anheben */
    p = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await p.goto(url); await p.waitForTimeout(400);
    const bb2 = await p.locator(sel).boundingBox(); await p.mouse.move(bb2.x + 10, bb2.y + 10); await p.waitForTimeout(300);
    ok(await p.evaluate(s => getComputedStyle(document.querySelector(s)).transform === 'none', sel), 'Bewegung reduzieren: kein Anheben');
    await p.close();
    /* 8 Touch: kein Anheben (kein Hover) */
    p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await p.goto(url); await p.waitForTimeout(400);
    ok(await p.evaluate(() => !matchMedia('(hover:hover) and (pointer:fine)').matches), 'Touch-Gerät: Hover-Regeln greifen nicht');
    const mb = await p.evaluate(() => [...document.querySelectorAll('.btn, .mbar a')].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.height && r.top < innerHeight * 3; }).filter(e => e.getBoundingClientRect().height < 47.5).map(e => e.textContent.trim().slice(0, 24)));
    ok(mb.length === 0, 'Handy: Aktionen mind. 48 px' + (mb.length ? ': ' + mb.join(' | ') : ''));
    await p.close();
  } catch (e) { ok(false, 'Ausnahme: ' + e.message); }
  await b.close();
  console.log(log.join('\n'));
  const f = log.filter(l => l.startsWith('FAIL')).length; console.log('\nt25: ' + (log.length - f) + '/' + log.length + ' bestanden');
  process.exit(f ? 1 : 0);
})();
