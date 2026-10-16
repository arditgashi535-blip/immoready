// t26 – Videos zum Rundgang (rise.json → assets.videos)
//  · ohne Datei: kein öffentlicher Abschnitt, nur Prüfhinweis mit den offenen Motiven
//  · Regeln: Stockvideo ohne Quelle/ID/Lizenz/Bildnachweis wird abgelehnt; KI-Status nicht zulässig
//  · mit Datei (synthetischer Testclip tests/fixtures/testclip.webm, Testbuild in einem eigenen Ordner):
//    Abschnitt vor dem Rundgang, Kennzeichnung «Symbolvideo», Bildnachweis im Impressum,
//    Video lädt erst im Sichtbereich, stumm und mit Pause-Taste (48 px), «Bewegung reduzieren» → kein Autoplay,
//    «Im Rundgang ansehen» springt zur Station, Anfrage mit Leistungsschlüssel, Produktionsform ohne Base64
// Aufruf: node tests/t26-videos.js
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os'), { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const log = []; const ok = (c, m) => log.push((c ? 'PASS ' : 'FAIL ') + m);
const GPU = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const rules = rise => execFileSync('python3', ['-c', 'import json,sys;sys.path.insert(0,"tools");import rise;print(json.dumps(rise.validate(json.load(open(sys.argv[1])))))', rise], { cwd: ROOT, encoding: 'utf8' });
(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ir-t26-'));
  const R = JSON.parse(fs.readFileSync(path.join(ROOT, 'rise.json'), 'utf8'));
  try {
    /* 1 Standardbuild: keine Datei → nichts Öffentliches */
    const html = fs.readFileSync(path.join(ROOT, 'dist/immoready-vorschau.html'), 'utf8');
    ok(!/id="einblicke"/.test(html) && /vclips-open/.test(html), 'ohne Videodatei: kein öffentlicher Abschnitt, nur Prüfhinweis');
    ok(R.assets.videos.slots.length === 4 && R.assets.videos.slots.every(v => v.status === 'fehlt'), '4 Videoflächen vorbereitet, alle «fehlt» (keine erfundenen Quellen)');
    /* 2 Regeln */
    const bad = JSON.parse(JSON.stringify(R)); Object.assign(bad.assets.videos.slots[0], { status: 'stock', file: 'tests/fixtures/testclip.webm' });
    fs.writeFileSync(path.join(tmp, 'bad.json'), JSON.stringify(bad));
    ok(/Fremdvideo garten: Nachweis fehlt/.test(rules(path.join(tmp, 'bad.json'))), 'Regel: Stockvideo ohne Nachweis abgelehnt');
    bad.assets.videos.slots[0].status = 'ki-video'; fs.writeFileSync(path.join(tmp, 'bad.json'), JSON.stringify(bad));
    ok(/unbekannter Status/.test(rules(path.join(tmp, 'bad.json'))), 'Regel: KI-Video nicht zulässig');
    /* 3 Testbuild mit synthetischem Clip */
    const good = JSON.parse(JSON.stringify(R));
    Object.assign(good.assets.videos.slots[1], { status: 'stock', file: 'tests/fixtures/testclip.webm', source: 'Prüfdatei', sourceId: 'testsrc2', author: 'ffmpeg', license: 'Prüfmuster, nicht veröffentlichen', credit: 'Testmuster' });
    fs.writeFileSync(path.join(tmp, 'good.json'), JSON.stringify(good));
    execFileSync('python3', ['build.py'], { cwd: ROOT, env: { ...process.env, IR_RISE: path.join(tmp, 'good.json'), IR_DIST: path.join(tmp, 'dist') }, stdio: 'pipe' });
    const site = fs.readFileSync(path.join(tmp, 'dist/site/index.html'), 'utf8');
    ok(fs.existsSync(path.join(tmp, 'dist/site/assets/videos/testclip.webm')) && /data-src="assets\/videos\/testclip.webm"/.test(site), 'Produktionsform: Video als Datei, nicht eingebettet');
    const b = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: GPU });
    const url = 'file://' + path.join(tmp, 'dist/immoready-vorschau.html');
    let p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(url); await p.waitForTimeout(500);
    const s0 = await p.evaluate(() => { const s = document.getElementById('einblicke'), r = document.getElementById('reise'), v = s && s.querySelector('video');
      return { s: !!s, before: !!(s && r && (s.compareDocumentPosition(r) & Node.DOCUMENT_POSITION_FOLLOWING)), tag: s && s.querySelector('.ph-tag').textContent, src: v && v.getAttribute('src'), muted: v && v.muted, loop: v && v.loop, pi: v && v.hasAttribute('playsinline'), n: s ? s.querySelectorAll('.vclip').length : 0,
        btn: s && s.querySelector('.vclip-play').getBoundingClientRect().height, pre: s && s.querySelector('[data-pre]').dataset.pre, cred: (document.querySelector('[data-page="impressum"]') || document.body).textContent.includes('Symbolvideo Treppenhaus und Reinigung: Testmuster') };
    });
    ok(s0.s && s0.before && s0.n === 1, 'Abschnitt «Im Alltag» mit einem Clip direkt vor dem Rundgang');
    ok(s0.tag === 'Symbolvideo', 'Stockclip als «Symbolvideo» gekennzeichnet');
    ok(!s0.src, 'Video lädt nicht beim Seitenaufruf (erst im Sichtbereich)');
    ok(s0.muted && s0.loop && s0.pi, 'stumm, Schleife, playsinline');
    ok(s0.btn >= 48, 'Pause-/Abspieltaste mind. 48 px');
    ok(s0.pre === 'reinigung', 'Anfrage mit Leistungsschlüssel «reinigung»');
    ok(s0.cred, 'Bildnachweis im Impressum');
    await p.evaluate(() => document.getElementById('einblicke').scrollIntoView({ block: 'center', behavior: 'instant' }));
    await p.waitForFunction(() => { const v = document.querySelector('#einblicke video'); return v.src && !v.paused; }, null, { timeout: 15000 }).catch(() => {});
    ok(await p.evaluate(() => { const v = document.querySelector('#einblicke video'); return !!v.src && !v.paused && document.querySelector('.vclip').classList.contains('playing'); }), 'im Sichtbereich: lädt und spielt');
    await p.click('#einblicke .vclip-play'); await p.waitForTimeout(200);
    ok(await p.evaluate(() => { const v = document.querySelector('#einblicke video'), b = document.querySelector('.vclip-play'); return v.paused && b.getAttribute('aria-pressed') === 'false' && b.getAttribute('aria-label') === 'Video abspielen'; }), 'Pause-Taste hält an (Zustand für Screenreader)');
    await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await p.waitForTimeout(300);
    await p.evaluate(() => document.getElementById('einblicke').scrollIntoView({ block: 'center', behavior: 'instant' })); await p.waitForTimeout(600);
    ok(await p.evaluate(() => document.querySelector('#einblicke video').paused), 'nach Pause durch Besucher kein erneutes Autoplay');
    await p.click('#einblicke a[data-jr-go]');
    await p.waitForFunction(() => window.__JR && window.__JR.state().p > 0.3, null, { timeout: 120000 }).catch(() => {});
    const st = await p.evaluate(() => ({ p: window.__JR && window.__JR.state().p, on: document.querySelector('#reise .jr-nav button.on') && document.querySelector('#reise .jr-nav button.on').textContent.trim() }));
    ok(st.on === 'Eingang', '«Im Rundgang ansehen» führt zur Station Eingang (' + st.on + ', p ' + (st.p || 0).toFixed(2) + ')');
    await p.close();
    p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    await p.goto(url); await p.waitForTimeout(400);
    await p.evaluate(() => document.getElementById('einblicke').scrollIntoView({ block: 'center', behavior: 'instant' })); await p.waitForTimeout(800);
    const m = await p.evaluate(() => ({ paused: document.querySelector('#einblicke video').paused, ov: document.documentElement.scrollWidth - innerWidth }));
    ok(m.paused, 'Bewegung reduzieren: kein automatisches Abspielen');
    ok(m.ov === 0, 'Handy 390 px: keine Überbreite');
    await p.close(); await b.close();
  } catch (e) { ok(false, 'Ausnahme: ' + e.message); }
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(log.join('\n'));
  const f = log.filter(l => l.startsWith('FAIL')).length; console.log('\nt26: ' + (log.length - f) + '/' + log.length + ' bestanden');
  process.exit(f ? 1 : 0);
})();
