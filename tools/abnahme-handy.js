// Abnahmebilder «Priorität Handy»: Sichtbereich und ganze Seite, aus der gebauten Vorschau.
//   390×844 (Pixeldichte 2, Touch): Start, offenes Menü, sechs Stationen, Leistungsübersicht, Sanitär, Formular leer/mit Fehlern,
//   Footer mit Kontaktleiste, Familienbetrieb, Karriere; 1440×900: Leistungen, Hauswartung, Sanitär, Familienbetrieb, Karriere, Kontakt, Footer; 320×568 Start und Formular; 844×390 quer; 1440×900 Desktop.
//   Ganze Seiten (Pixeldichte 1): Start, Leistungen, Sanitär, Offerte, Kontakt bei 390 px; Start bei 320 px.
// Aufruf: node tools/abnahme-handy.js [html] [ausgabeordner]   → danach python3 tools/abnahme-handy-collage.py
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const file = 'file://' + path.resolve(process.argv[2] || 'dist/immoready-vorschau.html');
const out = path.resolve(process.argv[3] || 'shots/v171-handy'); fs.mkdirSync(out, { recursive: true });
const mob = (w, h, d) => ({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, deviceScaleFactor: d || 2 });
const wait = (p, ms) => p.waitForTimeout(ms);
const shot = async (p, n, full) => { await wait(p, 700); await p.screenshot({ path: path.join(out, n + '.png'), fullPage: !!full }); console.log(n); };
/* Seite einmal durchscrollen, damit verzögert eingeblendete Inhalte sichtbar sind (wie beim echten Lesen) */
const walk = p => p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 60)); } scrollTo({ top: 0, behavior: 'instant' }); });
const toEl = (p, sel, off) => p.evaluate(([s, o]) => { const e = document.querySelector(s); scrollTo({ top: e.getBoundingClientRect().top + scrollY - (o || 0), behavior: 'instant' }); }, [sel, off]);
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  let p = await b.newPage(mob(390, 844)); await p.goto(file); await wait(p, 900);
  await shot(p, 'h01-start-390');
  await p.click('#burger'); await shot(p, 'h02-menue-390'); await p.click('#mclose');
  for (let i = 0; i < 6; i++) {
    await p.evaluate(i => document.querySelectorAll('#reise .jr-nav button')[i].click(), i); await wait(p, 500);
    await toEl(p, '#reise .jr-stage', await p.evaluate(() => document.querySelector('.hdr').getBoundingClientRect().height));
    await shot(p, 'h0' + (3 + i) + '-station-' + (i + 1) + '-390');
  }
  await p.close();
  p = await b.newPage(mob(390, 844)); await p.goto(file + '#leistungen'); await wait(p, 600); await shot(p, 'h09-leistungen-390');
  await p.goto(file + '#sanitaer'); await wait(p, 600); await shot(p, 'h10-sanitaer-390');
  await p.goto(file + '#offerte'); await wait(p, 800); await toEl(p, '#formRoot', 100); await shot(p, 'h11-formular-leer-390');
  await p.fill('#name', 'Test Person'); await toEl(p, '#next', 400); await p.click('#next'); await wait(p, 500);
  await toEl(p, '#errsum', 110); await shot(p, 'h12-formular-fehler-390');
  await p.goto(file + '#leistungen'); await wait(p, 600); await walk(p);
  await p.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })); await shot(p, 'h13-footer-kontaktleiste-390');
  await p.close();
  p = await b.newPage(mob(320, 568)); await p.goto(file); await wait(p, 800); await shot(p, 'h14-start-320');
  await p.goto(file + '#offerte'); await wait(p, 800); await toEl(p, '#formRoot', 90); await shot(p, 'h15-formular-320'); await p.close();
  p = await b.newPage(mob(844, 390)); await p.goto(file); await wait(p, 1500); await shot(p, 'h16-quer-844');
  await p.evaluate(() => scrollTo({ top: 700, behavior: 'instant' })); await shot(p, 'h17-quer-844-station'); await p.close();
  p = await b.newPage({ viewport: { width: 1440, height: 900 } }); await p.goto(file);
  await p.evaluate(() => { const r = document.getElementById('reise'); if (r) r.scrollIntoView({ block: 'start', behavior: 'instant' }); }); await p.waitForFunction(() => window.__jr === true, null, { timeout: 120000 }).catch(() => {}); await wait(p, 3000); await shot(p, 'h18-desktop-1440'); await p.close();
  /* Neue Abschnitte: Familienbetrieb und Karriere (Handy), Desktop-Abschnitte */
  p = await b.newPage(mob(390, 844)); await p.goto(file); await wait(p, 600); await walk(p);
  await toEl(p, '#familienbetrieb', 70); await shot(p, 'h19-familienbetrieb-390');
  await toEl(p, '#karriere', 70); await shot(p, 'h20-karriere-390'); await p.close();
  p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }); await p.goto(file); await wait(p, 1500); await walk(p);
  for (const [sel, n] of [['#leistungswelt', 'd01-leistungen'], ['#leistungen-start', 'd02-hauswartung'], ['#sanitaer-start', 'd03-sanitaer'], ['#familienbetrieb', 'd04-familienbetrieb'], ['#karriere', 'd05-karriere'], ['#anfrage', 'd06-kontakt']]) {
    await toEl(p, sel, 90); await shot(p, n);
  }
  await p.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })); await shot(p, 'd07-footer'); await p.close();
  /* ganze Seiten */
  for (const [w, h, r] of [[390, 844, 'start'], [390, 844, 'leistungen'], [390, 844, 'sanitaer'], [390, 844, 'offerte'], [390, 844, 'kontakt'], [320, 568, 'start']]) {
    p = await b.newPage(mob(w, h, 1)); await p.goto(file + '#' + r); await wait(p, 700); await walk(p); await wait(p, 900);
    await shot(p, 'g-' + r + '-' + w, true); await p.close();
  }
  await b.close();
})();
