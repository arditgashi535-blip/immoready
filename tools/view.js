// Schnellansicht für die Entwicklung: rendert Stationen (oder feste Kameras) der laufenden Szene als PNG.
// Aufruf: node tools/view.js <html> <ausgabe-präfix> [breite] [höhe] [liste: s0,s1,… | k:<json>]
const { chromium } = require('playwright');
const path = require('path');
const file = path.resolve(process.argv[2]); const pre = process.argv[3]; const W = +(process.argv[4] || 1280), H = +(process.argv[5] || 800);
const list = (process.argv[6] || 's0,s1,s2,s3,s4,s5');
(async () => {
  const b = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: W, height: H } });
  const errs = []; p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning' || /Rundgang/.test(m.text())) errs.push(m.type() + ': ' + m.text()); }); p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await p.addInitScript(() => { window.IR_FORCE_HQ = true; });
  await p.goto('file://' + file);
  try { await p.evaluate(() => { const r = document.getElementById('reise'); if (r) r.scrollIntoView({ block: 'start', behavior: 'instant' }); }); await p.waitForFunction(() => window.__jr === true && window.__JR.state().scan.state === 'done', null, { timeout: 90000 }); } catch (e) { console.log('NICHT BEREIT', errs.join('\n')); }
  await p.addStyleTag({ content: '.jr-ui,.jr-tag,.jr-tech{display:none!important}.hdr,.demo,.mbar{display:none!important}' });
  await p.evaluate(() => window.__JR.setScale(1, true));
  const st = await p.evaluate(() => { const s = window.__JR.sceneStats(); return s; });
  console.log(JSON.stringify(st));
  const holds = await p.evaluate(() => window.IR_RISE.stations.map(s => s.hold));
  for (const item of list.split(';').join(',').split(',')) {
    if (!item) continue;
    let q = 0, cam = null, name = item;
    if (item[0] === 's') q = holds[+item.slice(1)];
    else if (item[0] === 'p') q = +item.slice(1);
    await p.evaluate(([q]) => { const r = document.getElementById('reise'); const top = r.getBoundingClientRect().top + scrollY; scrollTo({ top: Math.round(top + q * (r.offsetHeight - innerHeight)), behavior: 'instant' }); window.__JR.jump(q); }, [q]);
    await p.waitForTimeout(500);
    await p.evaluate(() => window.__JR.setScale(1, true));
    await p.waitForTimeout(2200);
    await p.locator('#reise .jr-stage').screenshot({ path: `${pre}-${name}.png` });
  }
  console.log(errs.slice(0, 20).join('\n'));
  await b.close();
})();
