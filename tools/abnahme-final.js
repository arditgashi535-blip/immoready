// Abnahme V17.1: die 32 verlangten Bilder aus der gebauten Seite.
//   szene  01–20: feste Kameras (tools/kameras-vergleich.json → abnahme_final), Bühne 1440×900, volle Qualität
//   ui     21–32: Smartphone 360/390 (Pixeldichte 2, Touch), Tablet 768, Desktop 1440 – echte Seitenansichten
// Aufruf: node tools/abnahme-final.js <html> <ausgabeordner> [szene|ui|alle]
// Für den Vorher/Nachher-Vergleich dieselben Kameras mit der Ausgangsdatei rendern (Modus «szene»).
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const file = path.resolve(process.argv[2] || 'dist/immoready-vorschau.html'), out = path.resolve(process.argv[3] || 'shots/v171-abnahme'), mode = process.argv[4] || 'alle';
const K = JSON.parse(fs.readFileSync(path.join(__dirname, 'kameras-vergleich.json'), 'utf8')).abnahme_final;
fs.mkdirSync(out, { recursive: true });
const ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const HIDE = '.jr-ui,.jr-tag,.jr-tech,.jr-hot{display:none!important}.jr-stage::after{display:none!important}.hdr,.demo,.mbar{display:none!important}';
(async () => {
  const b = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ARGS });
  if (mode !== 'ui') {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.addInitScript(() => { window.IR_FORCE_HQ = true; });
    await p.goto('file://' + file);
    await p.evaluate(() => { const r = document.getElementById('reise'); if (r) r.scrollIntoView({ block: 'start', behavior: 'instant' }); }); await p.waitForFunction(() => window.__jr === true && window.__JR.state().scan.state === 'done', null, { timeout: 180000 });
    await p.addStyleTag({ content: HIDE });
    for (const c of K) {
      await p.evaluate(c => { window.__JR.setScale(1, true); window.__JR.jump(c.q); window.__JR.setCamera({ e: c.e, t: c.t, f: c.f }); }, c);
      await p.waitForTimeout(3500);
      await p.locator('#reise .jr-stage').screenshot({ path: path.join(out, c.id + '.png') });
      console.log(c.id);
    }
    await p.close();
  }
  if (mode !== 'szene') {
    const mob = w => ({ viewport: { width: w, height: w === 360 ? 800 : 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    const shot = async (p, n) => { await p.waitForTimeout(900); await p.screenshot({ path: path.join(out, n + '.png') }); console.log(n); };
    const station = async (p, re) => { const i = await p.evaluate(re => Array.from(document.querySelectorAll('#reise .jr-nav button')).findIndex(x => new RegExp(re).test(x.textContent)), re); await p.evaluate(i => document.querySelectorAll('#reise .jr-nav button')[i].click(), i); await p.waitForTimeout(1200); };
    const toStage = p => p.evaluate(() => { const r = document.querySelector('#reise .jr-stage').getBoundingClientRect(); scrollTo({ top: r.top + scrollY - document.querySelector('.hdr').getBoundingClientRect().height, behavior: 'instant' }); });
    let p = await b.newPage(mob(360)); await p.goto('file://' + file); await shot(p, '21-gebaeude-360'); await p.close();
    p = await b.newPage(mob(390)); await p.goto('file://' + file); await p.waitForTimeout(800); await shot(p, '22-gebaeude-390');
    await station(p, 'Sanit'); await toStage(p); await shot(p, '23-bad-390');
    await p.evaluate(() => Array.from(document.querySelectorAll('#reise .jr-st.on .jr-detb')).find(x => /WC/.test(x.textContent)).click()); await toStage(p); await shot(p, '24-wc-detail-390');
    await p.evaluate(() => Array.from(document.querySelectorAll('#reise .jr-st.on .jr-detb')).find(x => /Waschtisch/.test(x.textContent)).click()); await toStage(p); await shot(p, '25-waschtisch-detail-390');
    await station(p, 'Wohnung'); await p.evaluate(() => { const r = document.querySelector('#reise .jr-nav').getBoundingClientRect(); scrollTo({ top: r.top + scrollY - 420, behavior: 'instant' }); }); await shot(p, '26-stationsleiste-390');
    await p.evaluate(() => scrollTo(0, 0)); await p.click('#burger'); await shot(p, '27-menue-390'); await p.close();
    p = await b.newPage(mob(390)); await p.goto('file://' + file + '#offerte'); await p.waitForTimeout(900);
    await p.evaluate(() => { const t = document.getElementById('formRoot').getBoundingClientRect().top + scrollY - 110; scrollTo({ top: t, behavior: 'instant' }); }); await shot(p, '28-formular-oben-390');
    await p.evaluate(() => { const t = document.getElementById('next').getBoundingClientRect().bottom + scrollY - innerHeight + 40; scrollTo({ top: t, behavior: 'instant' }); }); await shot(p, '29-formular-unten-390'); await p.close();
    /* 33: Fehlerzustand nach leerem Absenden (Fokus auf erstem Fehlerfeld, Übersicht sichtbar) */
    p = await b.newPage(mob(390)); await p.goto('file://' + file + '#offerte'); await p.waitForTimeout(900);
    await p.fill('#name', 'Test Person'); await p.evaluate(() => { const t = document.getElementById('next').getBoundingClientRect().top + scrollY - innerHeight / 2; scrollTo({ top: t, behavior: 'instant' }); });
    await p.click('#next'); await p.waitForTimeout(600); await p.evaluate(() => { const e = document.getElementById('errsum').getBoundingClientRect().top + scrollY - 120; scrollTo({ top: e, behavior: 'instant' }); }); await shot(p, '33-formular-fehler-390'); await p.close();
    p = await b.newPage(mob(390)); await p.goto('file://' + file + '#leistungen'); await p.waitForTimeout(900);
    await p.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })); await shot(p, '30-kontaktleiste-footer-390'); await p.close();
    p = await b.newPage({ viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }); await p.goto('file://' + file); await p.waitForTimeout(1500); await shot(p, '31-tablet-768'); await p.close();
    p = await b.newPage({ viewport: { width: 1440, height: 900 } }); await p.goto('file://' + file);
    await p.evaluate(() => { const r = document.getElementById('reise'); if (r) r.scrollIntoView({ block: 'start', behavior: 'instant' }); }); await p.waitForFunction(() => window.__jr === true && window.__JR.state().scan.state === 'done', null, { timeout: 180000 }).catch(() => {}); await shot(p, '32-desktop-1440'); await p.close();
  }
  await b.close();
})();
