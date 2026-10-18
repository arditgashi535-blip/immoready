// t29 – Überarbeitung 2: Bühne, Bildausschnitt und Überlagerungen in der echten Website (Scrollmodus, 3D)
//  · Bühne beginnt unter dem sichtbaren Kopf und endet am Fensterrand; Stationstexte überdecken die Bedienleiste nie
//  · Bad: Waschtisch (Armatur, Becken, Schürze), WC (mit Betätigungsplatte) und Übersicht liegen bei 1280×720, 1440×900 und
//    1920×1080 frei zwischen Stationstext, Stationsleiste, Kopf und Bedienleiste; das Motiv behält seine Grösse in Bildpunkten
//    (rise.json → keyframes[].fit), im Hochformat gilt der geplante Bildwinkel
//  · Beschriftungen nur innerhalb der Bühne, ohne Überschneidung mit Text, Stationen, Bedienleiste, Kennzeichnung und untereinander;
//    in der WC-Nahansicht keine Beschriftungen des Waschtischs
//  · Vergleich nur, wo eine Reinigungszone im Bild liegt (WC-Nahansicht ohne Vergleich)
//  · «Details ansehen»: Maus und Tastatur, Titel/Vergleich/Stationen/«Tour überspringen»/«Offerte anfragen» bleiben bedienbar
//  · Handy-Bildmodus: Vergleich direkt am Bild, per Antippen und Tastatur
//  · Demo-Naht: Stationstext blendet aus, solange die Hecke das Bild verdeckt (Wechsel 6 → 1 unsichtbar); Deckkraft aus der Demo-Zeit
//  · Licht: vorab gerechnet mit Sonnensichtbarkeit und Himmel durch Öffnungen; Leistungspunkt Bad weicht der Stationsleiste aus
// Weltpunkte aus src/tour/geometry.part.js (Waschtisch: bcx 3,315 / bcz 0,8 / hx 0,235 / hz 0,31, Oberkante 1,36 m; WC: VX 3,222 / cz −0,38).
// Aufruf: node tests/t29-buehne.js
const { chromium } = require('playwright');
const path = require('path');
const url = 'file://' + path.resolve(__dirname, '../dist/immoready-vorschau.html');
const log = []; const ok = (c, m) => log.push((c ? 'PASS ' : 'FAIL ') + m);
const GPU = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const WT = [[3.08, 1.36, 0.49], [3.55, 1.36, 0.49], [3.55, 1.36, 1.11], [3.08, 1.36, 1.11], [3.13, 1.56, 0.8], [3.55, 1.21, 0.49], [3.55, 1.21, 1.11], [3.512, 1.05, 0.8]];
const WC = [[3.222, 1.61, -0.503], [3.222, 1.61, -0.257], [3.24, 1.38, -0.38], [3.78, 0.93, -0.38], [3.5, 0.93, -0.57], [3.5, 0.93, -0.19], [3.7, 0.68, -0.38]];
const ALL = WT.slice(0, 5).concat([[3.512, 0.88, 0.51], [3.512, 0.88, 1.09], [3.222, 1.61, -0.503], [3.78, 0.93, -0.38], [3.5, 0.93, -0.57], [3.7, 0.68, -0.38]]);
async function open(b, W, H) {
  const p = await b.newPage({ viewport: { width: W, height: H } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url);
  await p.evaluate(() => document.getElementById('reise').scrollIntoView({ block: 'start', behavior: 'instant' }));
  await p.waitForFunction(() => window.__jr === true && window.__JR.state().ready && window.__JR.state().scan.state === 'done', null, { timeout: 180000 });
  p.errs = errs; return p;
}
/* Fortschritt q wie beim Scrollen: Seite an die Stelle, Kamera dorthin, Textüberblendung abwarten */
async function at(p, q) {
  const f0 = await p.evaluate(() => window.__JR.state().frames);
  await p.evaluate(q => { const r = document.getElementById('reise'), top = r.getBoundingClientRect().top + scrollY, span = r.offsetHeight - innerHeight; scrollTo({ top: Math.round(top + q * span), behavior: 'instant' }); window.__JR.jump(q); }, q);
  await p.waitForFunction(f => window.__JR.state().frames > f, f0, { timeout: 120000 }).catch(() => {});
  await p.waitForFunction(() => [...document.querySelectorAll('#reise .jr-st')].every(e => Math.abs(+getComputedStyle(e).opacity - (e.classList.contains('on') ? 1 : 0)) < 0.02), null, { timeout: 20000 }).catch(() => {});
  /* Beschriftungen setzt der Kern beim Zeichnen: ein weiteres Bild abwarten */
  const f1 = await p.evaluate(() => { const t = window.__JR; t.jump(t.state().p); return t.state().frames; });
  await p.waitForFunction(f => window.__JR.state().frames > f, f1, { timeout: 60000 }).catch(() => {});
}
const R = (p, s) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; }, s);
async function frame(p, pts) {
  return p.evaluate(pts => {
    const st = document.querySelector('#reise .jr-stage').getBoundingClientRect(), pn = document.querySelector('#reise .jr-st.on').getBoundingClientRect(),
      nv = document.querySelector('#reise .jr-nav').getBoundingClientRect(), sk = document.querySelector('#reise .jr-skip').getBoundingClientRect();
    const xy = pts.map(v => { const r = window.__JR.project(v); return [st.left + r[0] / 100 * st.width, st.top + r[1] / 100 * st.height]; });
    const x0 = Math.min(...xy.map(a => a[0])), x1 = Math.max(...xy.map(a => a[0])), y0 = Math.min(...xy.map(a => a[1])), y1 = Math.max(...xy.map(a => a[1]));
    return { L: Math.round(x0 - pn.right), R: Math.round(nv.left - x1), T: Math.round(y0 - st.top), B: Math.round(sk.top - y1), w: Math.round(x1 - x0), h: Math.round(y1 - y0) };
  }, pts);
}
const fmt = f => 'Abstand Text ' + f.L + ' · Stationsleiste ' + f.R + ' · Kopf ' + f.T + ' · Bedienleiste ' + f.B + ' px, Motiv ' + f.w + '×' + f.h;
(async () => {
  const b = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: GPU });
  try {
    const size = {};
    for (const [W, H] of [[1280, 720], [1440, 900], [1920, 1080]]) {
      const v = W + '×' + H, p = await open(b, W, H);
      /* 1 Bühne unter dem Kopf, Text über der Bedienleiste */
      await at(p, 0.235);
      const hd = await R(p, '.hdr'), sg = await R(p, '#reise .jr-stage');
      ok(Math.abs(sg.t - hd.b) <= 1.5 && Math.abs(sg.b - H) <= 1.5, v + ': Bühne beginnt am unteren Rand des Kopfs (' + sg.t.toFixed(1) + ' / ' + hd.b.toFixed(1) + ' px) und endet am Fensterrand');
      if (W === 1280) {
        const RT = require('../rise.json').tour, over = [];
        for (const s of RT.stations) for (const q of [s.hold].concat((s.details || []).map(d => d.q))) {
          /* sichtbarer Inhalt des Stationstexts (Vereinigung der Kinder): der Einstieg hat grossen Innenabstand ohne Hintergrund */
          await at(p, q); const pn = await p.evaluate(() => { const rs = [...document.querySelectorAll('#reise .jr-st.on > *')].map(e => e.getBoundingClientRect()).filter(r => r.width > 0 && r.height > 0);
            return { l: Math.min(...rs.map(r => r.left)), t: Math.min(...rs.map(r => r.top)), r: Math.max(...rs.map(r => r.right)), b: Math.max(...rs.map(r => r.bottom)) }; });
          const sk = await R(p, '#reise .jr-skip'), nv = await R(p, '#reise .jr-nav');
          if (!(pn.b <= sk.t - 8 && pn.r <= nv.l - 16 && pn.t >= sg.t + 8)) over.push(s.key + ' ' + q + ' (Text ' + Math.round(pn.t) + '–' + Math.round(pn.b) + ', Leiste ab ' + Math.round(sk.t) + ')');
        }
        ok(!over.length, v + ': Stationstexte aller Stationen und Nahansichten innerhalb der Bühne, über der Bedienleiste und links der Stationsleiste' + (over.length ? ' – ' + over.join('; ') : ''));
      }
      /* 2 Bildausschnitt Bad */
      await at(p, 0.752); const fw = await frame(p, WT);
      ok(fw.L >= 16 && fw.R >= 16 && fw.T >= 16 && fw.B >= 16, v + ' Waschtisch (Armatur, Becken, Schürze) frei: ' + fmt(fw));
      ok(await p.evaluate(() => document.getElementById('reise').classList.contains('jr-close') && getComputedStyle(document.querySelector('#reise .jr-st.on .jr-d')).display === 'none'), v + ' Nahansicht: Absatz ausgeblendet, kompakter Stationstext');
      size[v] = fw.w;
      await at(p, 0.772); const fc = await frame(p, WC);
      ok(fc.L >= 16 && fc.R >= 16 && fc.T >= 16 && fc.B >= 16, v + ' WC mit Betätigungsplatte frei: ' + fmt(fc));
      const cmpWc = await p.evaluate(() => { const g = document.querySelector('#reise .jr-st.on .jr-cmp'); return g ? getComputedStyle(g).display : 'fehlt'; });
      ok(cmpWc === 'none', v + ' WC-Nahansicht ohne Reinigungszone im Bild: kein Vergleich (' + cmpWc + ')');
      await at(p, 0.73); const fo = await frame(p, ALL);
      ok(fo.L >= 8 && fo.R >= 8 && fo.T >= 8 && fo.B >= 8, v + ' Bad-Übersicht: Waschtisch und WC gemeinsam frei: ' + fmt(fo));
      /* 3 Beschriftungen */
      const lab = await p.evaluate(() => {
        const root = document.getElementById('reise'), st = root.querySelector('.jr-stage').getBoundingClientRect(), on = root.querySelector('.jr-st.on').getBoundingClientRect();
        const col = { left: on.left, right: on.right, top: st.top, bottom: st.bottom };
        const blk = [col].concat([...root.querySelectorAll('.jr-nav, .jr-skip, .jr-tag')].map(e => e.getBoundingClientRect()).filter(r => r.width > 0));
        const vis = [...root.querySelectorAll('.jr-tech span, .jr-tech-c')].filter(e => !e.classList.contains('off') && getComputedStyle(e).visibility !== 'hidden' && +getComputedStyle(e).opacity > 0.05 && e.getBoundingClientRect().width > 0);
        const rs = vis.map(e => e.getBoundingClientRect()), hit = (a, c) => a.left < c.right && a.right > c.left && a.top < c.bottom && a.bottom > c.top;
        const bad = [];
        rs.forEach((r, i) => { const n = vis[i].dataset.l || vis[i].textContent.trim() || 'Kennzeichnung';
          if (!(r.left >= st.left + 4 && r.right <= st.right - 4 && r.top >= st.top + 4 && r.bottom <= st.bottom - 4)) bad.push(n + ' ausserhalb');
          blk.forEach(c => { if (hit(r, c)) bad.push(n + ' über Bedienung/Text'); });
          rs.forEach((o, j) => { if (j > i && hit(r, o)) bad.push(n + ' über ' + (vis[j].dataset.l || 'Kennzeichnung')); }); });
        return { n: vis.filter(e => e.dataset.l).length, bad };
      });
      ok(lab.n >= 2 && !lab.bad.length, v + ' Bad-Übersicht: ' + lab.n + ' Beschriftungen sichtbar, alle innerhalb der Bühne ohne Überschneidung' + (lab.bad.length ? ' – ' + lab.bad.join(', ') : ''));
      await at(p, 0.772);
      const wcLab = await p.evaluate(() => [...document.querySelectorAll('#reise .jr-tech span')].filter(e => !e.classList.contains('off') && +getComputedStyle(e).opacity > 0.05).map(e => e.dataset.l));
      ok(!wcLab.length, v + ' WC-Nahansicht: keine Beschriftungen des Waschtischs am Bildrand' + (wcLab.length ? ' – ' + wcLab.join(', ') : ''));
      if (W === 1440) {
        /* Überarbeitung 2: vorab gerechnetes Licht mit Sonne und Himmel durch Öffnungen (4 Kanäle je Eckpunkt), Tageslicht aktiv */
        const ls = await p.evaluate(() => { const s = window.__JR.sceneStats(); return { pre: s.prebaked, k: s.bakeChannels, day: document.getElementById('reise').classList.contains('jr-day') }; });
        ok(ls.pre === true && ls.k === 4 && ls.day, v + ': Licht vorab gerechnet mit Sonnensichtbarkeit und Himmel durch Öffnungen (' + ls.k + ' Kanäle), Tageslicht');
        /* Leistungspunkt Bad: steht an der Übersicht, Beschriftung weicht der Stationsleiste aus (nicht ausgeblendet) */
        await at(p, 0.73);
        const hs = await p.evaluate(() => { const h = [...document.querySelectorAll('#reise .jr-hot')].find(a => a.dataset.pre === 'sanitaer'), nv = document.querySelector('#reise .jr-nav').getBoundingClientRect();
          if (!h) return null; const l = h.querySelector('.jr-hot-l').getBoundingClientRect(); return { on: h.classList.contains('on'), vis: getComputedStyle(h).visibility, free: l.right <= nv.left || l.left >= nv.right || l.bottom <= nv.top || l.top >= nv.bottom }; });
        ok(hs && hs.on && hs.vis === 'visible' && hs.free, v + ' Bad-Übersicht: Leistungspunkt «Sanitär» sichtbar, Beschriftung nicht über der Stationsleiste');
      }
      ok(!p.errs.length, v + ': keine Fehler in der Konsole' + (p.errs.length ? ' – ' + p.errs.slice(0, 2).join(' | ') : ''));
      await p.close();
    }
    const s0 = size['1280×720'];
    ok(Math.abs(size['1440×900'] - s0) <= s0 * 0.03 && Math.abs(size['1920×1080'] - s0) <= s0 * 0.03, 'Waschtisch behält seine Grösse in Bildpunkten (' + Object.entries(size).map(([k, w]) => k + ' ' + w + ' px').join(', ') + ')');

    /* 4 Vergleich im kompakten Stationstext (1280×720): Hinweis auf eigener Zeile, Regler bedienbar */
    let p = await open(b, 1280, 720);
    await at(p, 0.752);
    const cl = await p.evaluate(() => { const g = document.querySelector('#reise .jr-st.on .jr-cmp'), n = g.querySelector('.jr-cmpn').getBoundingClientRect(), r = g.querySelector('[data-cmpr]').getBoundingClientRect(), bt = g.querySelector('[data-cmp]').getBoundingClientRect();
      return { nT: n.top, rB: r.bottom, nW: n.width, row: Math.abs((r.top + r.bottom) / 2 - (bt.top + bt.bottom) / 2) < 6, rW: r.width }; });
    ok(cl.nT >= cl.rB - 1 && cl.nW >= 300 && cl.row && cl.rW >= 100, 'Vergleich kompakt: «Vorher», «Nachher» und Regler in einer Zeile (Regler ' + Math.round(cl.rW) + ' px), Hinweis darunter auf ' + Math.round(cl.nW) + ' px');

    /* 5 «Details ansehen»: Maus */
    await p.click('#reise [data-view]'); await p.waitForTimeout(500);
    const dv = await p.evaluate(() => {
      const root = document.getElementById('reise'), bt = root.querySelector('[data-view]'), on = root.querySelector('.jr-st.on'), vis = e => !!e && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0;
      const free = e => { const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, h = document.elementFromPoint(x, y); return !!h && (h === e || e.contains(h)); };
      const skip = [...root.querySelectorAll('.jr-skip a, .jr-skip button')], tour = skip.find(e => /Tour überspringen/.test(e.textContent)), off = skip.find(e => /Offerte anfragen/.test(e.textContent));
      return { cls: root.classList.contains('jr-clean'), pr: bt.getAttribute('aria-pressed'), tx: bt.textContent.trim(), title: vis(on.querySelector('.jr-t')), cmp: vis(on.querySelector('.jr-cmp')), d: vis(on.querySelector('.jr-d')),
        nav: vis(root.querySelector('.jr-nav')) && free(root.querySelector('.jr-nav button')), tour: !!tour && vis(tour) && free(tour), off: !!off && vis(off) && free(off),
        hot: [...root.querySelectorAll('.jr-hot')].every(e => !vis(e)), tech: [...root.querySelectorAll('.jr-tech span')].every(e => getComputedStyle(e.parentNode).display === 'none' || !vis(e)) };
    });
    ok(dv.cls && dv.pr === 'true' && dv.tx === 'Text einblenden', '«Details ansehen» (Maus): Zustand gesetzt, Knopf heisst «Text einblenden», aria-pressed true');
    ok(dv.title && dv.cmp && !dv.d && dv.hot && dv.tech, '«Details ansehen»: Titel und Vergleich bleiben, Absatz, Leistungspunkte und Beschriftungen treten zurück');
    ok(dv.nav && dv.tour && dv.off, '«Details ansehen»: Stationen, «Tour überspringen» und «Offerte anfragen» sichtbar und nicht verdeckt');
    /* Stationswechsel: Zustand bleibt, Titel der neuen Station sichtbar */
    await p.click('#reise .jr-nav button >> nth=3'); await p.waitForTimeout(400); await at(p, await p.evaluate(() => window.__JR.state().p));
    const dv2 = await p.evaluate(() => { const root = document.getElementById('reise'), on = root.querySelector('.jr-st.on'); return { cls: root.classList.contains('jr-clean'), t: !!on && getComputedStyle(on.querySelector('.jr-t, .jr-big')).display !== 'none' }; });
    ok(dv2.cls && dv2.t, '«Details ansehen» gilt beim Stationswechsel weiter, Titel der neuen Station sichtbar');
    /* Tastatur: Enter und Leertaste */
    await p.focus('#reise [data-view]'); await p.keyboard.press('Enter'); await p.waitForTimeout(250);
    const k1 = await p.evaluate(() => [document.getElementById('reise').classList.contains('jr-clean'), document.querySelector('#reise [data-view]').getAttribute('aria-pressed'), document.querySelector('#reise [data-view]').textContent.trim()]);
    await p.keyboard.press('Space'); await p.waitForTimeout(250);
    const k2 = await p.evaluate(() => [document.getElementById('reise').classList.contains('jr-clean'), document.activeElement === document.querySelector('#reise [data-view]')]);
    await p.keyboard.press('Space'); await p.waitForTimeout(250);
    ok(!k1[0] && k1[1] === 'false' && k1[2] === 'Details ansehen' && k2[0] && k2[1], '«Details ansehen» per Tastatur: Enter blendet den Text wieder ein, Leertaste schaltet erneut, Fokus bleibt auf dem Knopf');
    /* Fokus per Tabulator wie bei Tastaturbedienung: Rahmen als Kontur oder als Ring (box-shadow, wie die übrigen Knöpfe der Leiste) */
    await p.focus('#reise [data-demo="toggle"]'); await p.keyboard.press('Tab');
    const fv = await p.evaluate(() => { const b = document.activeElement, cs = getComputedStyle(b); return { is: b === document.querySelector('#reise [data-view]'), o: (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2) || /rgb/.test(cs.boxShadow), h: b.getBoundingClientRect().height }; });
    ok(fv.is && fv.o && fv.h >= 44, '«Details ansehen»: per Tabulator erreichbar, sichtbarer Fokusrahmen, Höhe ' + Math.round(fv.h) + ' px (≥ 44)');

    /* 6 Demo-Naht: Stationstext neutral, solange die Hecke das Bild verdeckt */
    await p.click('#reise [data-demo="toggle"]'); await p.evaluate(() => window.__JR.demoPause(true));
    const seam = {};
    for (const t of [46.4, 47.5, 0.3, 1.6]) {
      const f0 = await p.evaluate(() => window.__JR.state().frames);
      await p.evaluate(t => window.__JR.demoSeek(t), t);
      await p.waitForFunction(f => window.__JR.state().frames > f, f0, { timeout: 120000 }).catch(() => {});
      await p.waitForTimeout(900);
      seam[t] = await p.evaluate(() => { const r = document.getElementById('reise'), on = r.querySelector('.jr-st.on'); return { seam: r.classList.contains('jr-seam'), op: on ? +getComputedStyle(on).opacity : 0, i: [...r.querySelectorAll('.jr-st')].indexOf(on) }; });
    }
    ok(!seam[46.4].seam && seam[46.4].op > 0.9 && seam[46.4].i === 5, 'Demo 46,4 s: Text der Station 6 sichtbar');
    ok(seam[47.5].seam && seam[47.5].op < 0.05 && seam[0.3].seam && seam[0.3].op < 0.05, 'Demo-Naht (47,5 s und 0,3 s): kein Stationstext, solange die Hecke verdeckt (Deckkraft ' + seam[47.5].op + ' / ' + seam[0.3].op + ')');
    ok(!seam[1.6].seam && seam[1.6].op > 0.9 && seam[1.6].i === 0, 'Demo 1,6 s: Text der Station 1 sichtbar');
    /* Deckkraft aus der Demo-Zeit statt Überblendung in Echtzeit: gilt sofort nach dem Bild, auch bei langsamen Bildern */
    const sq = {};
    for (const t of [46.83, 47.1, 1.12]) {
      const f0 = await p.evaluate(() => window.__JR.state().frames);
      await p.evaluate(t => window.__JR.demoSeek(t), t);
      await p.waitForFunction(f => window.__JR.state().frames > f, f0, { timeout: 120000 }).catch(() => {});
      sq[t] = await p.evaluate(() => { const r = document.getElementById('reise'), on = r.querySelector('.jr-st.on'); return { seam: r.classList.contains('jr-seam'), op: on ? +getComputedStyle(on).opacity : 1, so: +r.style.getPropertyValue('--seam-o') }; });
    }
    ok(sq[47.1].seam && sq[47.1].op < 0.05 && [46.83, 1.12].every(t => sq[t].seam && sq[t].so > 0.3 && sq[t].so < 0.7 && Math.abs(sq[t].op - sq[t].so) < 0.02),
      'Demo-Naht: Deckkraft folgt der Demo-Zeit, ohne Wartezeit (46,83 s ' + sq[46.83].op.toFixed(2) + ' · 47,1 s ' + sq[47.1].op.toFixed(2) + ' · 1,12 s ' + sq[1.12].op.toFixed(2) + ')');
    await p.evaluate(() => window.__JR.demoStop());
    ok(!(await p.evaluate(() => document.getElementById('reise').classList.contains('jr-seam'))), 'Demo beendet: Naht-Zustand aufgehoben');
    ok(!p.errs.length, '1280×720 Bedienung: keine Fehler in der Konsole' + (p.errs.length ? ' – ' + p.errs.slice(0, 2).join(' | ') : ''));
    await p.close();

    /* 7 Handy-Bildmodus: Vergleich direkt am Bild per Touch und Tastatur (Waschtisch-Nahansicht) */
    p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await p.addInitScript(() => { window.IR_NO_PERF_FALLBACK = true; }); await p.goto(url); await p.waitForTimeout(600);
    await p.evaluate(() => document.getElementById('reise').scrollIntoView({ block: 'start', behavior: 'instant' }));
    await p.tap('#reise .jr-nav button >> nth=4'); await p.waitForTimeout(300);
    await p.tap('#reise .jr-st.on [data-det-i="0"]'); await p.waitForTimeout(300);
    const mo = await p.evaluate(() => { const o = document.querySelector('#reise .jr-cmpo'), st = document.querySelector('#reise .jr-stage').getBoundingClientRect(), r = o.getBoundingClientRect();
      return { vis: !o.hidden && getComputedStyle(o).display !== 'none', inImg: r.top >= st.top && r.bottom <= st.bottom && r.left >= st.left && r.right <= st.right, inView: st.top >= 0 && r.bottom <= innerHeight }; });
    await p.tap('#reise .jr-cmpo [data-cmp="0"]'); await p.waitForTimeout(250);
    const t1 = await p.evaluate(() => { const v = document.querySelector('#reise .jr-still-v.on'); return { v: v && v.dataset.v, pr: document.querySelector('#reise .jr-cmpo [data-cmp="0"]').getAttribute('aria-pressed') }; });
    await p.tap('#reise .jr-cmpo [data-cmp="1"]'); await p.waitForTimeout(250);
    const t2 = await p.evaluate(() => !document.querySelector('#reise .jr-still-v.on'));
    ok(mo.vis && mo.inImg && t1.v === 'station-05-bad-waschtisch' && t1.pr === 'true' && t2, 'Handy-Bildmodus, Waschtisch: Vergleich im Bild, per Antippen «Vorher» (' + t1.v + ') und wieder «Nachher»');
    await p.focus('#reise .jr-cmpo [data-cmp="0"]'); await p.keyboard.press('Enter'); await p.waitForTimeout(250);
    const mk1 = await p.evaluate(() => !!document.querySelector('#reise .jr-still-v.on'));
    await p.focus('#reise .jr-cmpo [data-cmp="1"]'); await p.keyboard.press('Enter'); await p.waitForTimeout(250);
    const mk2 = await p.evaluate(() => !document.querySelector('#reise .jr-still-v.on'));
    ok(mk1 && mk2, 'Handy-Bildmodus: Vergleich am Bild per Tastatur (Enter) bedienbar');
    await p.close();

    /* 8 Hochformat (Handy-3D): geplanter Bildwinkel, keine Weitung */
    p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await p.addInitScript(() => { window.IR_NO_PERF_FALLBACK = true; }); await p.goto(url); await p.waitForTimeout(600);
    await p.evaluate(() => document.getElementById('reise').scrollIntoView({ block: 'start', behavior: 'instant' }));
    await p.tap('#reise [data-3d]');
    await p.waitForFunction(() => window.__JR && window.__JR.state().inline3d && window.__JR.state().ready, null, { timeout: 180000 });
    const pr = await p.evaluate(WT => { const t = window.__JR; t.jump(0.752); t.setCamera({ e: [4.4, 1.98, 1.72], t: [3.3, 1.25, 1.08], f: 0.66, fit: 1 }); const a = WT.map(v => t.project(v)); t.setCamera({ e: [4.4, 1.98, 1.72], t: [3.3, 1.25, 1.08], f: 0.66 }); const c = WT.map(v => t.project(v)); t.setCamera(null); return JSON.stringify(a) === JSON.stringify(c); }, WT);
    ok(pr, 'Hochformat: Ausschnittregel greift nicht (gleiche Abbildung mit und ohne fit)');
    await p.close();
  } catch (e) { ok(false, 'Ausnahme: ' + (e && e.message || e)); }
  await b.close();
  console.log(log.join('\n'));
  const f = log.filter(l => l.startsWith('FAIL')).length; console.log('\nt29: ' + (log.length - f) + '/' + log.length + ' bestanden');
  process.exit(f ? 1 : 0);
})();
