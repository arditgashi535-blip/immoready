// t23 – Livegang als Einzelunternehmen (GmbH geplant) und Veröffentlichungssperre
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
  ok(co.status === 'einzelunternehmen' && !co.foundingConfirmed && co.goLiveApproved, 'rise.json: Einzelunternehmen, GmbH-Gründung nicht bestätigt, Livegang freigegeben');
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
    ok(/ImmoReady Gashi/.test(im.t) && /Ardit Gashi/.test(im.t) && /Ostring 6/.test(im.t) && /8105 Regensdorf/.test(im.t) && /CHE-437\.026\.042/.test(im.t) && /Rechtsform: Einzelunternehmen/.test(im.t),
      'Impressum: Firmenname, Inhaber, Adresse, UID und Rechtsform Einzelunternehmen (' + w + ' px)');
    ok(!/Handelsregister:|MWST:/.test(im.t), 'Impressum: keine erfundenen Handelsregister- oder MWST-Angaben');
    ok(/ImmoReady · Ardit Gashi/.test(im.foot) && !/GmbH/.test(im.foot), 'Footer: Marke ohne Rechtsform');
    await p.close();
  }
  const q = await b.newPage({ viewport: { width: 390, height: 844 } });
  await q.goto(url + '#datenschutz'); await q.waitForTimeout(300);
  const ds = await q.evaluate(() => document.querySelector('[data-page="datenschutz"]').innerText.replace(/­/g, ''));
  ok(/ImmoReady Gashi, Ardit Gashi, Ostring 6, 8105 Regensdorf, Schweiz/.test(ds), 'Datenschutz: verantwortliche Stelle aus derselben Quelle');
  await q.close();
  /* Release-Fassung in einem eigenen Ordner: öffentlich, ohne Vorschau-Werkzeuge */
  const RD = fs.mkdtempSync(path.join(require('os').tmpdir(), 'ir-release-'));
  const rb = spawnSync('python3', ['build.py', '--release'], { cwd: ROOT, encoding: 'utf8', env: Object.assign({}, process.env, { IR_DIST: RD }) });
  const lc = spawnSync('python3', ['tools/rise.py', '--launch'], { cwd: ROOT, encoding: 'utf8' });
  const ready = lc.status === 0;
  if (ready) {
    ok(rb.status === 0, 'Release-Build läuft durch (Freigabe vorhanden)' + (rb.status ? ': ' + (rb.stdout + rb.stderr).slice(-300) : ''));
    const rs = fs.readFileSync(path.join(RD, 'site/index.html'), 'utf8'), rj = fs.readFileSync(path.join(RD, 'site/site.js'), 'utf8');
    ok(!/name="robots"/.test(rs) && !fs.existsSync(path.join(RD, 'site/robots.txt')), 'Release: indexierbar (kein noindex, keine robots.txt-Sperre)');
    ok(!/class="demo"/.test(rs) && !/Prüfhinweise anzeigen/.test(rs) && !/href="#umsetzung"/.test(rs), 'Release: kein Demo-Banner, kein Prüfschalter, kein Link zur Umsetzungsmappe');
    ok(!/class="missing"/.test(rs) && !/<p class="review-only/.test(rs), 'Release: keine offenen Markierungen und keine Prüfhinweise im Quelltext');
    ok(!/'datenschutz','umsetzung'\]/.test(rj), 'Release: Umsetzungsmappe nicht erreichbar');
    const r = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
    const z = await r.newPage({ viewport: { width: 1280, height: 800 } }); const errs = []; z.on('pageerror', e => errs.push(e.message));
    await z.goto('file://' + path.join(RD, 'site/index.html') + '#offerte'); await z.waitForTimeout(600);
    const st = await z.evaluate(() => ({ review: document.body.classList.contains('review'), demo: !!document.querySelector('.demo-flag'), up: !!document.getElementById('fotos'),
      vis: document.body.innerText }));
    ok(!st.review && !st.demo, 'Release: öffentliche Ansicht, kein Demo-Hinweis im Formular');
    ok(!st.up && /per E-Mail an info\.immoready@gmail\.com senden/.test(st.vis), 'Release: kein Foto-Upload (Wix Forms ohne Datei-Upload), Hinweis auf E-Mail');
    await z.goto('file://' + path.join(RD, 'site/index.html') + '#umsetzung'); await z.waitForTimeout(300);
    ok(await z.evaluate(() => !document.querySelector('[data-page="umsetzung"]')), 'Release: #umsetzung zeigt keine interne Mappe');
    ok(errs.length === 0, 'Release: keine JS-Fehler ' + errs.join('|'));
    await r.close();
  } else {
    ok(rb.status !== 0 && /nicht freigegeben|offene Punkte/.test(rb.stdout + rb.stderr), 'Release-Build verweigert, solange offene Punkte bestehen');
  }
  fs.rmSync(RD, { recursive: true, force: true });
  /* Vorschau bleibt privat */
  const pv = fs.readFileSync(path.join(ROOT, 'dist/immoready-vorschau.html'), 'utf8'), si = fs.readFileSync(path.join(ROOT, 'dist/site/index.html'), 'utf8');
  ok(/<meta name="robots" content="noindex,nofollow,noarchive">/.test(pv) && /<meta name="robots" content="noindex,nofollow,noarchive">/.test(si), 'Vorschau (dist/): noindex, nofollow, noarchive');
  ok(fs.readFileSync(path.join(ROOT, 'dist/site/robots.txt'), 'utf8').includes('Disallow: /'), 'Vorschau dist/site/robots.txt sperrt alle Pfade');
  /* Startsperre greift weiterhin: ohne Freigabe kein Release */
  const tmp = path.join(require('os').tmpdir(), 'ir-rise-nogo.json');
  const nogo = JSON.parse(JSON.stringify(RISE)); nogo.firm.company.goLiveApproved = false; fs.writeFileSync(tmp, JSON.stringify(nogo));
  const lc2 = spawnSync('python3', ['-c', 'import json,sys;sys.path.insert(0,".");from tools.rise import launch_check;print("\\n".join(launch_check(json.load(open(sys.argv[1])))))', tmp], { cwd: ROOT, encoding: 'utf8' });
  ok(/Livegang nicht ausdrücklich freigegeben/.test(lc2.stdout), 'Startsperre: ohne goLiveApproved bleibt der Livegang gesperrt');
  fs.rmSync(tmp, { force: true });
  await b.close();
  log.forEach(l => console.log(l));
  const f = log.filter(l => l.startsWith('FAIL')).length;
  console.log('\nt23: ' + (log.length - f) + '/' + log.length + ' bestanden');
  process.exitCode = f ? 1 : 0;
})();
