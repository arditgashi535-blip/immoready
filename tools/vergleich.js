// Vergleichsbilder an festen Kamerapositionen (tools/kameras-vergleich.json) aus einer gebauten Seite rendern.
// Bühne ohne Oberfläche, 1440×900, volle Qualität (IR_FORCE_HQ). Aufruf: node tools/vergleich.js <html> <ausgabeordner> [haupt|nah|alle|abnahme|id-präfixe]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const file = path.resolve(process.argv[2]), out = path.resolve(process.argv[3]), which = process.argv[4] || 'alle';
const K = JSON.parse(fs.readFileSync(path.join(__dirname, 'kameras-vergleich.json'), 'utf8'));
const all = K.ansichten.concat(K.nah), every = all.concat(K.abnahme || []), list = which === 'haupt' ? K.ansichten : which === 'nah' ? K.nah : which === 'alle' ? all : which === 'abnahme' ? (K.abnahme || []) : every.filter(c => which.split(',').some(w => c.id.startsWith(w)));
fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.addInitScript(() => { window.IR_FORCE_HQ = true; });
  await p.goto('file://' + file);
  await p.waitForFunction(() => window.__jr === true && window.__JR.state().scan.state === 'done', null, { timeout: 120000 });
  await p.addStyleTag({ content: '.jr-ui,.jr-tag,.jr-tech,.jr-hot{display:none!important}.jr-stage::after{display:none!important}.hdr,.demo,.mbar{display:none!important}' });
  for (const c of list) {
    await p.evaluate(c => { window.__JR.setScale(1, true); window.__JR.jump(c.q); window.__JR.setCamera({ e: c.e, t: c.t, f: c.f }); }, c);
    await p.waitForTimeout(3500);
    await p.locator('#reise .jr-stage').screenshot({ path: path.join(out, c.id + '.png') });
    console.log(c.id);
  }
  await b.close();
})();
