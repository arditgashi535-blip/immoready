// t23 – GmbH in Gründung und Veröffentlichungssperre
//  · öffentliche Ansicht (Prüfhinweise aus): auf keiner Seite «GmbH» sichtbar, Footer/Impressum mit Marke ohne Rechtsform
//  · Prüfansicht: interner GmbH-Entwurf im Impressum mit allen offenen Registerangaben
//  · Unternehmensangaben in Impressum, Datenschutz und Footer aus derselben Quelle (rise.json → firm.company)
//  · Vorschau und Produktionsform mit noindex, dist/site/robots.txt sperrt alles; --launch meldet offene Punkte
// Aufruf: node tests/t23-gmbh.js
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const url = 'file://' + path.join(ROOT, 'dist/immoready-vorschau.html');
const RISE = JSON.parse(fs.readFileSync(path.join(ROOT, 'rise.json'), 'utf8'));
const log = []; const ok = (c, m) => log.push((c ? 'PASS ' : 'FAIL ') + m);
const ROUTES = ['start', 'leistungen', 'hauswartung', 'sanitaer', 'gartenunterhalt', 'reinigung', 'raeumung', 'leerstand', 'verkauf', 'fotografie', 'verwaltungen', 'ueber', 'kontakt', 'offerte', 'impressum', 'datenschutz'];
const visible = () => document.body.innerText.replace(/­/g, '');
(async () => {
  const co = RISE.firm.company;
  ok(co.status === 'in_gruendung' && !co.foundingConfirmed && !co.goLiveApproved, 'rise.json: GmbH in Gründung, Gründung nicht bestätigt, Livegang nicht freigegeben');
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  for (const [w, h] of [[390, 844], [1280, 800]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.addInitScript(() => { try { localStorage.setItem('ir-review', '0'); } catch (e) {} });
    const hits = [];
    for (const r of ROUTES) {
      await p.goto(url + '#' + r); await p.waitForTimeout(200);
      const t = await p.evaluate(visible);
      if (/GmbH/.test(t)) hits.push(r);
    }
    ok(hits.length === 0, 'öffentliche Ansicht ' + w + ' px: «GmbH» auf keiner der 16 Seiten sichtbar' + (hits.length ? ' (gefunden: ' + hits.join(', ') + ')' : ''));
    await p.goto(url + '#impressum'); await p.waitForTimeout(300);
    const im = await p.evaluate(() => ({ t: document.querySelector('[data-page="impressum"]').innerText.replace(/­/g, ''), foot: document.querySelector('.ftr .base').innerText }));
    ok(/ImmoReady/.test(im.t) && /Ardit Gashi/.test(im.t) && !/Rechtsform/.test(im.t) && /vor der Veröffentlichung ergänzt/.test(im.t), 'Impressum öffentlich: Marke und Ansprechperson, keine Rechtsform, Hinweis auf fehlende Angaben (' + w + ' px)');
    ok(/ImmoReady · Ardit Gashi/.test(im.foot) && !/GmbH/.test(im.foot), 'Footer: Marke ohne Rechtsform');
    await p.close();
  }
  /* Prüfansicht: Entwurf sichtbar, alle Registerangaben offen, nichts erfunden */
  const q = await b.newPage({ viewport: { width: 390, height: 844 } });
  await q.addInitScript(() => { try { localStorage.setItem('ir-review', '1'); } catch (e) {} });
  await q.goto(url + '#impressum'); await q.waitForTimeout(300);
  const dr = await q.evaluate(() => { const d = document.querySelector('[data-company="in_gruendung"]'); return d && d.offsetParent ? { t: d.innerText.replace(/­/g, ''), open: d.querySelectorAll('.missing').length } : null; });
  ok(dr && /GmbH in Gründung/.test(dr.t) && /nicht öffentlich/.test(dr.t) && dr.open === 7, 'Prüfansicht: interner GmbH-Entwurf mit 7 offenen Registerangaben (' + (dr ? dr.open : 'fehlt') + ')');
  ok(dr && !/CHE-\d/.test(dr.t) && !/Handelsregisteramt des Kantons/.test(dr.t), 'Entwurf enthält keine erfundene UID oder Registerangabe');
  await q.goto(url + '#datenschutz'); await q.waitForTimeout(300);
  const ds = await q.evaluate(() => document.querySelector('[data-page="datenschutz"]').innerText.replace(/­/g, ''));
  ok(/ImmoReady, Ardit Gashi, Geschäftsadresse – offen, Schweiz/.test(ds), 'Datenschutz: verantwortliche Stelle aus derselben Quelle (Adresse offen)');
  await q.close();
  await b.close();
  /* Suchmaschinensperre und Startsperre */
  const pv = fs.readFileSync(path.join(ROOT, 'dist/immoready-vorschau.html'), 'utf8'), si = fs.readFileSync(path.join(ROOT, 'dist/site/index.html'), 'utf8');
  ok(/<meta name="robots" content="noindex,nofollow,noarchive">/.test(pv) && /<meta name="robots" content="noindex,nofollow,noarchive">/.test(si), 'Vorschau und Produktionsform: noindex, nofollow, noarchive');
  ok(fs.readFileSync(path.join(ROOT, 'dist/site/robots.txt'), 'utf8').includes('Disallow: /'), 'dist/site/robots.txt sperrt alle Pfade');
  const lc = spawnSync('python3', ['tools/rise.py', '--launch'], { cwd: ROOT, encoding: 'utf8' });
  ok(lc.status === 1 && /Gründung der GmbH nicht bestätigt/.test(lc.stdout) && /Livegang nicht ausdrücklich freigegeben/.test(lc.stdout), 'Startsperre: tools/rise.py --launch verweigert (Exit 1, offene Punkte)');
  const rb = spawnSync('python3', ['build.py', '--release'], { cwd: ROOT, encoding: 'utf8' });
  ok(rb.status !== 0 && /nicht freigegeben|offene Punkte/.test(rb.stdout + rb.stderr), 'Release-Build verweigert, solange offene Punkte bestehen');
  log.forEach(l => console.log(l));
  const f = log.filter(l => l.startsWith('FAIL')).length;
  console.log('\nt23: ' + (log.length - f) + '/' + log.length + ' bestanden');
  process.exitCode = f ? 1 : 0;
})();
