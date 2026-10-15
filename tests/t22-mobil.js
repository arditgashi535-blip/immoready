// t22 – Handy-Priorität (Fertigstellung): Regeln aus dem Auftrag «MIT PRIORITÄT AUF HANDY», die t7–t21 nicht abdecken.
//  · keine pauschale Überlaufsperre (body/html ohne overflow-x:hidden/clip) – Überbreite wird an der Ursache behoben
//  · lange Begriffe brechen nur an Trennstellen (weiche Trennung), nie mitten im Wort – 320/360/390/430 px, alle Seiten
//  · Leistungsübersicht einspaltig mit Beschreibung in voller Breite, Kontaktseite einspaltig, keine «..»
//  · Rundgang mobil: keine leere Fläche unter der aktiven Station, Überspringen-Zeile ohne zweiten Offert-Knopf,
//    Seitenrand der Station = Seitenrand der Abschnitte
//  · Menü: schliesst und entsperrt beim Wechsel auf Desktopbreite, Scrollposition bleibt
//  · Anker und Skip-Link landen unter dem klebenden Kopf, nicht dahinter
// Aufruf: node tests/t22-mobil.js
const { chromium } = require('playwright');
const path = require('path');
const url = 'file://' + path.resolve(__dirname, '..', 'dist/immoready-vorschau.html');
const log = []; const ok = (c, m) => log.push((c ? 'PASS ' : 'FAIL ') + m);
const ROUTES = ['start', 'leistungen', 'hauswartung', 'sanitaer', 'gartenunterhalt', 'reinigung', 'raeumung', 'leerstand', 'verkauf', 'fotografie', 'verwaltungen', 'ueber', 'kontakt', 'offerte', 'impressum', 'datenschutz'];
const mob = (w, h) => ({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });

/* Wörter ab 12 Zeichen, deren Buchstaben auf verschiedenen Zeilen stehen, ohne dass dazwischen eine weiche Trennstelle liegt.
   Ausnahme: E-Mail-Adressen (dürfen bei sehr grosser Schrift umbrechen). */
function splitWords() {
  const out = [], tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
  while ((n = tw.nextNode())) {
    const el = n.parentElement; if (!el || !el.getClientRects().length || el.closest('[hidden],.sr,script,style,#umsetzungPage')) continue;
    const t = n.data, re = /[^\s­\-–\/·]{12,}/g; let m;
    while ((m = re.exec(t))) {
      if (m[0].indexOf('@') > -1) continue;
      const tops = [];
      for (let i = (t[m.index - 1] === '­' ? 1 : 0); i < m[0].length; i++) { const r = document.createRange(); r.setStart(n, m.index + i); r.setEnd(n, m.index + i + 1); const q = r.getClientRects()[0]; if (q) tops.push(q.top); }
      if (tops.length && Math.max.apply(null, tops) - Math.min.apply(null, tops) > 2) out.push(m[0]);
    }
  }
  return out;
}

(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  let p = await b.newPage(mob(390, 844)); await p.goto(url); await p.waitForTimeout(500);

  /* 1 keine pauschale Überlaufsperre */
  const ov = await p.evaluate(() => [getComputedStyle(document.documentElement).overflowX, getComputedStyle(document.body).overflowX]);
  ok(ov.every(v => v === 'visible'), 'keine pauschale Überlaufsperre auf html/body (' + ov.join('/') + ')');

  /* 2 Wortumbrüche */
  const splits = [];
  for (const [w, h] of [[320, 568], [360, 800], [390, 844], [430, 932]]) {
    const q = await b.newPage(mob(w, h));
    for (const r of ROUTES) { await q.goto(url + '#' + r); await q.waitForTimeout(250); (await q.evaluate(splitWords)).forEach(x => splits.push(w + ':' + r + ':' + x)); }
    await q.close();
  }
  ok(splits.length === 0, 'lange Wörter nur an Trennstellen umbrochen (4 Breiten × 16 Seiten)' + (splits.length ? ': ' + splits.slice(0, 6).join(', ') : ''));
  ok(await p.evaluate(() => /Leer­stands/.test(document.body.innerHTML.replace(/&shy;/g, '­')) && document.title.indexOf('­') < 0), 'weiche Trennstellen im sichtbaren Text, nicht im Seitentitel');

  /* 3 Leistungsübersicht, Kontakt */
  const q = await b.newPage(mob(320, 568));
  await q.goto(url + '#leistungen'); await q.waitForTimeout(300);
  const lv = await q.evaluate(() => Array.from(document.querySelectorAll('#overviewList a')).map(a => { const d = a.children[2], r = d.getBoundingClientRect(); return { w: r.width, aw: a.getBoundingClientRect().width, t: d.textContent }; }));
  ok(lv.length === 8 && lv.every(x => x.w > x.aw - 2), 'Leistungsübersicht 320 px: Beschreibung in voller Breite (' + lv.map(x => Math.round(x.w)).join('/') + ')');
  ok(lv.every(x => !/\.\.$/.test(x.t)), 'Leistungsübersicht: kein doppelter Punkt');
  await q.goto(url + '#kontakt'); await q.waitForTimeout(300);
  const kc = await q.evaluate(() => { const r = Array.from(document.querySelectorAll('[data-page="kontakt"] .related a')).map(a => a.getBoundingClientRect()), k = ['.k-l', '.k-r'].map(s => document.querySelector(s).getBoundingClientRect()); return { cols: new Set(r.map(x => Math.round(x.left))).size, k: k[0].top < k[1].top && Math.abs(k[0].left - k[1].left) < 2 }; });
  ok(kc.cols === 1 && kc.k, 'Kontaktseite 320 px einspaltig (Kontaktwege und Einsatzgebiet/Termin)');
  await q.close();

  /* 4 Rundgang mobil */
  await p.goto(url); await p.waitForTimeout(600);
  const tr = await p.evaluate(() => {
    const st = document.querySelector('#reise .jr-st.on'), sk = document.querySelector('#reise .jr-skip'), sec = document.querySelector('#leistungswelt .wrap') || document.querySelector('.sec .wrap');
    const a = st.getBoundingClientRect(), s = sk.getBoundingClientRect(), o = document.querySelector('#reise .jr-skip-o');
    const pad = parseFloat(getComputedStyle(sec).paddingLeft) + sec.getBoundingClientRect().left;
    const h = st.querySelector('h1,h2').getBoundingClientRect().left;
    return { gap: s.top - a.bottom, o: o ? getComputedStyle(o).display : 'none', skipVis: getComputedStyle(sk.querySelector('.jr-skip-a')).display !== 'none', left: Math.abs(h - pad) };
  });
  ok(tr.gap < 80, 'Rundgang 390 px: keine leere Fläche zwischen Station und Überspringen-Zeile (' + Math.round(tr.gap) + ' px)');
  ok(tr.o === 'none' && tr.skipVis, '«Tour überspringen» sichtbar, kein zweiter Offert-Knopf daneben (Offerte in Station und Kontaktleiste)');
  ok(tr.left < 2, 'Station mit demselben Seitenrand wie die Abschnitte (Abweichung ' + tr.left.toFixed(1) + ' px)');
  const gaps = [];
  for (let i = 0; i < 6; i++) {
    await p.evaluate(i => document.querySelectorAll('#reise .jr-nav button')[i].click(), i); await p.waitForTimeout(350);
    gaps.push(await p.evaluate(() => Math.round(document.querySelector('#reise .jr-skip').getBoundingClientRect().top - document.querySelector('#reise .jr-st.on').getBoundingClientRect().bottom)));
  }
  ok(gaps.every(g => g < 80), 'alle sechs Stationen ohne Leerraum darunter (' + gaps.join('/') + ' px)');

  /* 5 Menü und Grössenwechsel */
  await p.evaluate(() => scrollTo({ top: 1500, behavior: 'instant' })); await p.waitForTimeout(800); /* Kopf-Übergang abwarten (sonst scrollt Playwright den Knopf ins Bild) */
  await p.click('#burger'); await p.waitForTimeout(300); await p.click('#mclose'); await p.waitForTimeout(300);
  const y1 = await p.evaluate(() => scrollY);
  ok(Math.abs(y1 - 1500) < 2, 'Menü öffnen/schliessen: Scrollposition bleibt (' + Math.round(y1) + ')');
  await p.click('#burger'); await p.waitForTimeout(300);
  await p.setViewportSize({ width: 1280, height: 800 }); await p.waitForTimeout(400);
  const mr = await p.evaluate(() => ({ open: document.getElementById('mnav').dataset.open, lock: document.body.style.overflow, y: scrollY }));
  ok(mr.open === 'false' && mr.lock === '' && mr.y > 0, 'Menü offen → Desktopbreite: Menü geschlossen, Seite nicht gesperrt');
  await p.close();

  /* 5b Vorauswahl der Leistung aus jeder Station (390 px, Bildmodus): Aktion antippen → Offertformular mit passender Leistung */
  {
    const exp = [['aussen', null], ['garten', 'gartenunterhalt'], ['eingang', 'hauswartung'], ['wohnung:reinigung', 'reinigung'], ['wohnung:raeumung', 'raeumung'], ['wohnung:leerstand', 'leerstand'], ['bad', 'sanitaer'], ['zurueck', null]];
    const res = [];
    for (const [k, want] of exp) {
      const q = await b.newPage(mob(390, 844)); await q.goto(url); await q.waitForTimeout(500);
      const [st, ch] = k.split(':');
      await q.evaluate(st => { const i = Array.from(document.querySelectorAll('#reise .jr-st')).findIndex(e => e.dataset.k === st); document.querySelectorAll('#reise .jr-nav button')[i].click(); }, st); await q.waitForTimeout(300);
      if (ch) { await q.evaluate(ch => document.querySelector('#reise .jr-st.on [data-choice="' + ch + '"]').click(), ch); await q.waitForTimeout(150); }
      const a = q.locator('#reise .jr-st.on a[href="#offerte"]').first(); await a.scrollIntoViewIfNeeded(); await a.click(); await q.waitForTimeout(700);
      const got = await q.evaluate(() => ({ h: location.hash, v: (document.querySelector('#formRoot input[name="leistung"]:checked') || {}).value || null, vis: !!document.getElementById('formRoot').getClientRects().length }));
      res.push(k + '→' + (got.v || '–'));
      ok(got.h === '#offerte' && got.vis && got.v === want, 'Station ' + k + ': Offertformular' + (want ? ' mit Vorauswahl «' + want + '»' : ' ohne Vorauswahl') + ' (' + (got.v || 'keine') + ')');
      await q.close();
    }
  }

  /* 6 Anker und Skip-Link nicht unter dem Kopf */
  p = await b.newPage(mob(390, 844));
  await p.goto(url + '#h-faq'); await p.waitForTimeout(1200);
  const an = await p.evaluate(() => { const h = document.querySelector('.hdr').getBoundingClientRect().bottom, t = document.getElementById('h-faq'); return t ? { t: t.getBoundingClientRect().top, h } : null; });
  ok(an && an.t >= an.h - 1, 'Anker #h-faq beginnt unter dem Kopf (' + (an ? Math.round(an.t) + ' ≥ ' + Math.round(an.h) : 'fehlt') + ')');
  await p.goto(url + '#sanitaer'); await p.waitForTimeout(400); await p.evaluate(() => scrollTo({ top: 900, behavior: 'instant' }));
  await p.keyboard.press('Tab'); await p.keyboard.press('Enter'); await p.waitForTimeout(700);
  const sk = await p.evaluate(() => { const h = document.querySelector('.hdr').getBoundingClientRect().bottom, m = document.getElementById('main'); return { f: document.activeElement === m, t: m.getBoundingClientRect().top, h, y: scrollY }; });
  ok(sk.f && (sk.y < 2 || sk.t >= sk.h - 1), 'Skip-Link: Fokus auf Inhalt, Beginn nicht hinter dem Kopf');
  await p.close();
  await b.close();
  log.forEach(l => console.log(l));
  const f = log.filter(l => l.startsWith('FAIL')).length;
  console.log('\nt22: ' + (log.length - f) + '/' + log.length + ' bestanden');
  process.exitCode = f ? 1 : 0;
})();
