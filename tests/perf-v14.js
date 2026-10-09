// Ladeleistung (Testumgebung, keine Garantie für echte Geräte): Seite über lokalen HTTP-Server, Netzwerk und CPU per
// Chrome DevTools Protocol gedrosselt. Misst FCP, LCP, Layoutverschiebung, Ladeende, Start der 3D-Szene, Übertragung.
// Aufruf: (Server: python3 -m http.server 8702 --bind 127.0.0.1) node tests/perf-v14.js [pfad-relativ-zum-repo …]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const pages = process.argv.slice(2).length ? process.argv.slice(2) : ['dist/immoready-vorschau.html'];
const PROFILES = [
  { name: 'Desktop 1440 · 20 Mbit/s · 20 ms', vp: { width: 1440, height: 900 }, down: 20e6 / 8, rtt: 20, cpu: 1 },
  { name: 'Smartphone 390 · 9 Mbit/s · 60 ms · CPU ×4', vp: { width: 390, height: 844 }, mobile: true, down: 9e6 / 8, rtt: 60, cpu: 4 }
];
(async () => {
  const b = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const pg of pages) {
    const file = path.resolve(__dirname, '..', pg), raw = fs.statSync(file).size, gz = zlib.gzipSync(fs.readFileSync(file), { level: 6 }).length;
    console.log(`\n${pg}: ${(raw / 1e6).toFixed(2)} MB unkomprimiert, ${(gz / 1e6).toFixed(2)} MB gzip (Stufe 6, geschätzt)`);
    for (const pr of PROFILES) {
      const ctx = await b.newContext({ viewport: pr.vp, ...(pr.mobile ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {}) });
      const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
      await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: pr.rtt, downloadThroughput: pr.down, uploadThroughput: pr.down / 4 });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: pr.cpu });
      let bytes = 0; cdp.on('Network.loadingFinished', e => { bytes += e.encodedDataLength; });
      await p.addInitScript(() => {
        window.__perf = { lcp: 0, cls: 0 };
        new PerformanceObserver(l => { l.getEntries().forEach(e => { window.__perf.lcp = e.startTime; }); }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver(l => { l.getEntries().forEach(e => { if (!e.hadRecentInput) window.__perf.cls += e.value; }); }).observe({ type: 'layout-shift', buffered: true });
        document.addEventListener('tour-ready', e => { window.__perf.ready = performance.now(); window.__perf.mode = e.detail.mode; }, true);
      });
      const t0 = Date.now();
      await p.goto('http://127.0.0.1:8702/' + pg, { waitUntil: 'load', timeout: 180000 });
      const loadMs = Date.now() - t0;
      await p.waitForFunction(() => window.__perf.ready, null, { timeout: 180000 }).catch(() => {});
      await p.waitForTimeout(1500);
      const r = await p.evaluate(() => { const f = performance.getEntriesByName('first-contentful-paint')[0]; const s = window.__perf.mode === 'webgl' && window.__JR && window.__JR.sceneStats ? window.__JR.sceneStats() : {}; return { fcp: f ? f.startTime : 0, lcp: window.__perf.lcp, cls: window.__perf.cls, ready: window.__perf.ready, mode: window.__perf.mode, build: s.buildMs, bake: s.bakeMs, prebaked: s.prebaked, tex: s.textures }; });
      console.log(`  ${pr.name}: FCP ${Math.round(r.fcp)} ms · LCP ${Math.round(r.lcp)} ms · CLS ${r.cls.toFixed(4)} · Ladeende ${loadMs} ms · Rundgang bereit ${Math.round(r.ready || 0)} ms (${r.mode})` +
        (r.build !== undefined ? ` · Aufbau ${r.build} ms + Licht ${r.bake} ms${r.prebaked ? ' (vorab gerechnet)' : ''} · Texturen ${r.tex}` : '') + ` · übertragen ${(bytes / 1e6).toFixed(2)} MB`);
      await ctx.close();
    }
  }
  await b.close();
})();
