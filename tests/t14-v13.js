// V13/V14-Prüfungen: Scan-Kante, Kamerafahrt (interpoliert), Türen, Hervorhebung, Auswahl, Kontakt,
// Layout bei 390 / 768 / 1440 px (Logo, Überlauf, verdeckte Schaltflächen, abgeschnittene Überschriften).
// Aufruf: node tests/t14-v13.js   (WebGL über SwiftShader – langsam, aber deterministisch)
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const url = 'file://' + path.resolve(__dirname, '../dist/immoready-vorschau.html');
const RISE = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../rise.json'), 'utf8'));
(async () => {
  const b = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const log = []; const ok = (c, m) => log.push((c ? 'PASS ' : 'FAIL ') + m);
  let p = await b.newPage({ viewport: { width: 1440, height: 900 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => {
    window.__readyAt = 0; window.__ctc = [];
    document.addEventListener('request-contact', e => window.__ctc.push(e.detail), true);
    document.addEventListener('DOMContentLoaded', () => { new MutationObserver(() => { const r = document.getElementById('reise'); if (r && r.classList.contains('jr-ready') && !window.__readyAt) window.__readyAt = performance.now(); }).observe(document.getElementById('reise'), { attributes: true, attributeFilter: ['class'] }); });
  });
  await p.goto(url);
  await p.waitForFunction(() => window.__JR && window.__JR.state().scan.state === 'done', null, { timeout: 60000 }).catch(() => {});
  // 1 · Scan-Kante
  const sc = await p.evaluate(() => Object.assign({ readyAt: window.__readyAt }, window.__JR.state().scan));
  const dur = sc.end - sc.start;
  ok(RISE.tour.introScan.durationMs >= 900 && RISE.tour.introScan.durationMs <= 1400, `Scan-Kante: geplante Dauer ${RISE.tour.introScan.durationMs} ms (Vorgabe 900–1400 ms)`);
  ok(sc.count === 1 && sc.readyAt > 0 && sc.start >= sc.readyAt && dur >= RISE.tour.introScan.durationMs && dur < RISE.tour.introScan.durationMs + 1200,
    `Scan-Kante startet erst nach dem ersten fertigen Bild und endet nach ${Math.round(dur)} ms (gemessen in SwiftShader, Bildtakt ≈ 0,3–0,5 s)`);
  // 2 · Fahrt: interpolierte Route, Drehgeschwindigkeit, Bildwinkel, Türdurchgänge
  const rs = await p.evaluate(() => window.__JR.routeStats(4000));
  const col = await p.evaluate(() => window.__JR.checkRoute(4000));
  ok(col.length === 0, `Kameraroute (4000 interpolierte Punkte) ohne Kontakt zu Wänden und Möbeln (Abstand ≥ ${RISE.tour.routeClearance} Szeneneinheiten)`);
  ok(rs.maxRotDegPerPercent <= 35, `Keine abrupten Blickwechsel: max. ${rs.maxRotDegPerPercent}° je 1 % Fortschritt (bei p=${rs.at}; V12: 459°)`);
  ok(rs.maxFovDeg <= 60, `Kein extremer Weitwinkel: max. vertikaler Bildwinkel ${rs.maxFovDeg}°`);
  const ht = rs.passes.filter(x => x.door === 'haustuer'), wt = rs.passes.filter(x => x.door === 'wohnungstuer'), tt = rs.passes.filter(x => x.door === 'terrassentuer');
  ok(ht.length >= 1 && ht.every(x => x.deg >= 90) && wt.length >= 1 && wt.every(x => x.deg <= -90) && tt.length >= 1 && tt.every(x => x.slide >= RISE.tour.doors.find(d => d.id === 'terrassentuer').slideM * 0.99),
    'Türdurchfahrt erst bei ausreichender Öffnung: ' + rs.passes.map(x => x.door + '@' + x.p + (x.deg !== undefined ? ' ' + x.deg + '°' : ' ' + x.slide + ' m')).join(', '));
  ok(await p.evaluate(() => { const c = window.__JR.camAt; for (let i = 0; i <= 1000; i++) { const q = c(i / 1000); if (Math.abs(q.pitch) > 1.2) return false; } return true; }), 'Kein Überschlag: Neigung der Kamera bleibt unter ±69°, Horizont ohne Rollen (Oben-Vektor fest)');
  const back = await p.evaluate(() => { const a = window.__JR.camAt(0.62), b = window.__JR.camAt(0.62); return JSON.stringify(a.e) === JSON.stringify(b.e); });
  ok(back, 'Kamera ist eine reine Funktion des Fortschritts (rückwärts identisch)');
  // keine doppelt belegten Wandflächen (zwei Wände auf derselben Linie mit Überlappung → Flackern)
  const dup = await p.evaluate(() => { const W = window.__JR.walls(), o = []; for (let i = 0; i < W.length; i++) for (let j = i + 1; j < W.length; j++) { const a = W[i], c = W[j]; const ix = Math.min(a[1], c[1]) - Math.max(a[0], c[0]), iy = Math.min(a[3], c[3]) - Math.max(a[2], c[2]), iz = Math.min(a[5], c[5]) - Math.max(a[4], c[4]); if (ix > 1e-3 && iy > 1e-3 && iz > 1e-3) { const sameX = Math.abs(a[0] - c[0]) < 1e-6 && Math.abs(a[1] - c[1]) < 1e-6, sameZ = Math.abs(a[4] - c[4]) < 1e-6 && Math.abs(a[5] - c[5]) < 1e-6; if ((sameX && iz > 0.05) || (sameZ && ix > 0.05)) o.push([i, j]); } } return o; });
  ok(dup.length === 0, 'Keine doppelt belegten Wandflächen (Ursache für flackernde Flächen) ' + JSON.stringify(dup));
  // 3 · Stationen, Hervorhebung, Ruhe
  const H = await p.evaluate(() => { const r = document.getElementById('reise'); return [r.getBoundingClientRect().top + scrollY, r.offsetHeight - innerHeight]; });
  const at = async (q, w) => { await p.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), Math.round(H[0] + q * H[1])); await p.waitForTimeout(w || 800); };
  await at(0.5, 300); await at(0.765, 200);
  /* Puls zeitbasiert (≈2,6 s): beobachten, bis er kam und wieder ausgeblendet ist (SwiftShader-Bildtakt ≈ 0,3–0,8 s) */
  let peak = 0, hiEnd = 1; for (let k = 0; k < 80; k++) { await p.waitForTimeout(200); const h = await p.evaluate(() => window.__JR.state().hi); peak = Math.max(peak, h); if (peak > 0.5 && h < 0.05) { hiEnd = h; break; } }
  ok(peak > 0.5 && hiEnd < 0.05, `Sanitär-Kontur: kurz hervorgehoben (Spitze ${peak.toFixed(2)}), danach ausgeblendet (${hiEnd.toFixed(2)})`);
  ok(await p.evaluate(() => { const t = document.querySelector('.jr-tech'); return getComputedStyle(t).opacity > 0.5 && /Schematische Kennzeichnung/.test(t.querySelector('.jr-tech-c').dataset.l) && t.textContent.trim() === '' && t.querySelectorAll('[data-w]').length === 3; }), 'Bad: drei Beschriftungen, ausdrücklich als «Schematische Kennzeichnung» markiert');
  // 4 · Wohnung: Auswahl mit Maus und Tastatur, Text ohne Hover sichtbar
  await at(0.59, 900);
  ok(await p.waitForFunction(() => { const st = document.querySelector('.jr-st.on'); const t = st && st.querySelector('[data-choice-text]:not([hidden])'); return st && st.dataset.k === 'wohnung' && st.querySelectorAll('[role="radio"]').length === 3 && t && t.getBoundingClientRect().height > 10 && getComputedStyle(t).visibility === 'visible'; }, null, { timeout: 15000, polling: 200 }).then(() => true).catch(() => false), 'Wohnung: drei Leistungen als Auswahl (role=radio), Beschreibung ohne Hover sichtbar');
  await p.click('.jr-st.on [data-choice="leerstand"]'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => { const st = document.querySelector('.jr-st.on'); return st.querySelector('[data-choice="leerstand"]').getAttribute('aria-checked') === 'true' && st.querySelector('[data-choice-cta]').dataset.pre === 'leerstand' && /Leerstand/.test(st.querySelector('[data-choice-cta]').textContent); }), 'Auswahl per Klick: Leerstandsmanagement → Aktion «Leerstandsbetreuung anfragen»');
  await p.focus('.jr-st.on [data-choice="leerstand"]'); await p.keyboard.press('Home'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => document.activeElement.dataset.choice === 'reinigung' && document.activeElement.getAttribute('aria-checked') === 'true'), 'Auswahl per Tastatur (Pos1 → Reinigung, Fokus folgt)');
  ok(await p.evaluate(() => { const s = getComputedStyle(document.activeElement); return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2; }), 'Sichtbarer Tastaturfokus');
  // 5 · Schluss: allgemeine Offerte und Kontakt
  await at(0.995, 300); await p.waitForFunction(() => document.querySelector('.jr-st.on').dataset.k === 'zurueck', null, { timeout: 10000, polling: 200 }).catch(() => {});
  ok(await p.evaluate(() => document.querySelector('.jr-st.on').dataset.k === 'zurueck' && /Eine Immobilie\. Viele Aufgaben\. Ein Ansprechpartner\./.test(document.querySelector('.jr-st.on h2').textContent.replace(/\s+/g, ' ').trim())), 'Abschluss: «Eine Immobilie. Viele Aufgaben. Ein Ansprechpartner.»');
  await p.click('.jr-st.on a[data-contact]'); await p.waitForTimeout(500);
  ok(await p.evaluate(() => location.hash === '#kontakt' && window.__ctc.length === 1 && window.__ctc[0].station === 'zurueck'), '«Kontakt aufnehmen» → Kontaktseite, Ereignis request-contact');
  await p.goBack(); await p.waitForTimeout(800); await at(0.995, 900);
  // V15: rAF der Scroll-Auswertung kommt bei der Software-GPU später – erst klicken, wenn die Schlusskarte steht
  await p.waitForFunction(() => { const s = document.querySelector('.jr-st.on'); return s && s.dataset.k === 'zurueck' && getComputedStyle(s).visibility === 'visible' && +getComputedStyle(s).opacity > 0.99; }, null, { timeout: 20000, polling: 200 }).catch(() => {});
  await p.click('.jr-st.jr-st5.on a[data-primary]'); await p.waitForTimeout(600);
  ok(await p.evaluate(() => location.hash === '#offerte' && document.querySelectorAll('input[id^="leistung_"]:checked').length === 0), 'Allgemeine «Offerte anfragen» ohne vorgewählte Leistung');
  ok(await p.evaluate(() => /Demo|nicht gesendet|Vorschau/i.test(document.body.innerText)), 'Formular bleibt als Demo gekennzeichnet');
  ok(errs.length === 0, 'keine JS-Fehler ' + errs.join(' | '));
  await p.close();
  // 6 · Layout in drei Breiten, je Station
  for (const vp of [{ w: 1440, h: 900 }, { w: 768, h: 1024 }, { w: 390, h: 844, m: true }]) {
    p = await b.newPage({ viewport: { width: vp.w, height: vp.h }, ...(vp.m ? { isMobile: true, hasTouch: true } : {}) });
    await p.goto(url); await p.waitForTimeout(vp.m ? 1500 : 4000);
    const issues = [];
    for (let i = 0; i < 6; i++) {
      await p.evaluate(i => document.querySelectorAll('#reise .jr-nav button')[i].click(), i);
      await p.waitForTimeout(vp.m ? 600 : 2200);
      if (!vp.m) await p.evaluate(() => scrollBy(0, 0));
      /* CSS-Übergänge (Kopfzeile, Texte) abwarten – in SwiftShader laufen sie nur mit dem langsamen Bildtakt weiter */
      await p.waitForFunction(() => document.getAnimations().every(a => a.playState !== 'running'), null, { timeout: 8000, polling: 200 }).catch(() => {});
      const r = await p.evaluate(() => {
        const out = []; const st = document.querySelector('#reise .jr-st.on'); const W = innerWidth;
        if (document.documentElement.scrollWidth > W) out.push('Überlauf ' + document.documentElement.scrollWidth);
        const h = st.querySelector('h1,h2'); const hr = h.getBoundingClientRect();
        if (h.scrollWidth > h.clientWidth + 1 || hr.left < 0 || hr.right > W + 1) out.push('Überschrift abgeschnitten');
        /* V17: sichtbarer Bereich endet an der festen Kontaktleiste (Smartphone) – ein Knopf, dessen Mitte hinter oder unter der Leiste liegt, gilt wie ein Knopf unter dem Bildrand als «noch nicht im Bild» (die Seite reserviert unten Platz, er lässt sich ganz darüber scrollen) */
        const mb = document.querySelector('.mbar'), lim = mb && getComputedStyle(mb).display !== 'none' && mb.getBoundingClientRect().top < innerHeight ? mb.getBoundingClientRect().top : innerHeight;
        st.querySelectorAll('a.btn,button[data-choice]').forEach(a => { const q = a.getBoundingClientRect(); if (q.bottom < 0 || q.top + q.height / 2 > lim) return; const e = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); if (!e || !(e === a || a.contains(e))) out.push('verdeckt: ' + a.textContent.trim().slice(0, 30) + ' von ' + (e ? (e.className || e.nodeName) : 'nichts')); });
        document.querySelectorAll('#reise .jr-nav button').forEach(n => { const q = n.getBoundingClientRect(); if (q.height && q.height < 40) out.push('Stationsknopf zu klein ' + q.height); });
        const lg = document.querySelector('.hdr img, header img'); if (lg) { const q = lg.getBoundingClientRect(); const ratio = q.width / q.height; if (Math.abs(ratio - lg.naturalWidth / lg.naturalHeight) > 0.03 || q.left < 0 || q.top < 0 || q.right > W) out.push('Logo ' + ratio.toFixed(3)); }
        return out;
      });
      r.forEach(x => issues.push(`St.${i + 1}: ${x}`));
    }
    ok(issues.length === 0, `${vp.w} px: alle 6 Stationen – kein Überlauf, Überschriften vollständig, Schaltflächen nicht verdeckt, Stationsknöpfe ≥ 40 px, Logo unverzerrt ${issues.slice(0, 6).join(' | ')}`);
    if (vp.m) ok(await p.evaluate(() => { const i = document.querySelector('#reise .jr-still.on'); return /-hoch\.webp|image\/webp/.test(i.currentSrc) && i.naturalWidth === 960 && i.naturalHeight === 864; }), '390 px: Hochformat-Stationsbild 960×864 (V17: 10:9)');
    if (vp.m) ok(await p.evaluate(() => { const r = document.querySelector('#reise .jr-nav').getBoundingClientRect(), s = document.querySelector('#reise .jr-stage').getBoundingClientRect(); return r.top >= s.bottom - 1; }), '390 px: Stationswahl direkt unter dem Bild (überdeckt keine Bilddetails)');
    if (vp.m) ok(await p.evaluate(() => { const m = document.querySelector('.mbar'); if (!m) return false; const r = m.getBoundingClientRect(); return getComputedStyle(m).display !== 'none' && r.top < innerHeight && /Offerte/.test(m.textContent); }), '390 px: Kontaktleiste (Anrufen / Offerte) ab Seitenstart erreichbar');
    if (!vp.m) ok(await p.evaluate(() => { const s = document.querySelector('#reise .jr-skip-a'); const q = s.getBoundingClientRect(); const e = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); return q.top < innerHeight && q.bottom > 0 && (e === s || s.contains(e)); }), `${vp.w} px: «Tour überspringen» sichtbar und bedienbar`);
    await p.close();
  }
  console.log(log.join('\n')); await b.close();
})();
