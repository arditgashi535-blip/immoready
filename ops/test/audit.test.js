'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { auditSite, analyzeHtml, findingsFrom } = require('../src/audit/site-audit');
const { parseRobots, robotsAllows } = require('../src/research/fetch');
const { parseSearchCh } = require('../src/research/directory');
const drafts = require('../src/drafts');

test('robots.txt: Disallow/Allow mit Platzhaltern', () => {
  const r = parseRobots('User-agent: *\nDisallow: /tel/detail/\nDisallow: /?q=\nAllow: /?q=plz+\nDisallow: /*?iquery=\n\nUser-agent: Googlebot\nDisallow: /');
  assert.equal(robotsAllows(r, '/tel/baden/liegenschaftsverwaltung'), true);
  assert.equal(robotsAllows(r, '/tel/detail/123'), false);
  assert.equal(robotsAllows(r, '/?q=haus'), false);
  assert.equal(robotsAllows(r, '/?q=plz+5400'), true);
  assert.equal(robotsAllows(r, '/tel/x?iquery=1'), false);
});

test('Verzeichnis-Parser: Felder und Sterneintrag (keine Werbung)', () => {
  const html = '<article class="tel-resultentry"><div class="tel-categories">Liegenschaftsverwaltung</div><h1><a href="/tel/baden/x/muster-ag">Muster AG</a></h1><div class="tel-occupation">Verwaltung</div><div class="tel-address">Weg 1, <span class="tel-zipcity"><span class="postal-code">5400</span> <span class="locality">Baden</span> <span class="region">AG</span></span></div><a href="tel:+41" class="value tel-callable">056 000 00 00</a> <span title="* Wünscht keine Werbung">*</span><a class="tel-result-action sl-icon-website" href="https://muster.example/">Web</a></article>';
  const [e] = parseSearchCh(html);
  assert.equal(e.name, 'Muster AG'); assert.equal(e.zip, '5400'); assert.equal(e.region, 'AG'); assert.equal(e.street, 'Weg 1');
  assert.equal(e.no_advertising, true); assert.equal(e.website, 'https://muster.example/'); assert.equal(e.source, 'https://search.ch/tel/baden/x/muster-ag');
});

test('Statische Analyse: belegte Befunde, keine Befunde bei guter Seite', () => {
  const bad = analyzeHtml(fs.readFileSync(path.join(__dirname, 'fixtures/bad.html'), 'utf8'), { finalUrl: 'http://bad.example/' });
  const codes = findingsFrom(bad, null, 'T').map(f => f.code);
  for (const c of ['no_viewport', 'no_form', 'no_tel_link', 'no_meta_desc', 'no_h1', 'img_alt', 'no_lang', 'no_https', 'no_impressum_link', 'no_privacy_link', 'stale_copyright', 'title_length']) assert.ok(codes.includes(c), c);
  const good = analyzeHtml(fs.readFileSync(path.join(__dirname, 'fixtures/good.html'), 'utf8'), { finalUrl: 'https://good.example/' });
  assert.deepEqual(findingsFrom(good, { overflowPx: 0, loadMs: 900, bytes: 1e5, consoleErrors: 0, formSeen: true, telSeen: true, h1: 1 }, 'T'), []);
  for (const f of findingsFrom(bad, null, 'T')) { assert.ok(f.evidence, 'Beleg fehlt: ' + f.code); assert.deepEqual(drafts.checkClaims(f.text), [], 'wertende Aussage: ' + f.text); }
});

test('Browser-Audit gegen lokale Testseiten (390 px, robots, Fehlerseite)', { timeout: 120000 }, async () => {
  const srv = http.createServer((req, res) => {
    const f = { '/bad': 'bad.html', '/good': 'good.html', '/robots.txt': 'robots.txt', '/privat/x': 'good.html' }[req.url];
    if (!f) { res.writeHead(404); return res.end('nein'); }
    res.writeHead(200, { 'Content-Type': f.endsWith('.txt') ? 'text/plain' : 'text/html; charset=utf-8' }); res.end(fs.readFileSync(path.join(__dirname, 'fixtures', f)));
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  try {
    const bad = await auditSite(browser, base + '/bad');
    assert.equal(bad.reachable, true); assert.equal(bad.mobile_ok, false);
    assert.ok(bad.findings.some(f => f.code === 'mobile_overflow' && /390 px/.test(f.text)));
    assert.equal(bad.improvements.length, 3); assert.ok(bad.services.length >= 2);
    const good = await auditSite(browser, base + '/good');
    assert.equal(good.mobile_ok, true); assert.equal(good.contact_form, true);
    assert.deepEqual(good.findings.filter(f => f.severity !== 'info' && f.code !== 'no_https'), []);
    assert.equal((await auditSite(browser, base + '/privat/x')).skipped, 'robots');
    assert.equal((await auditSite(browser, base + '/gibtsnicht')).reachable, false);
  } finally { await browser.close(); srv.close(); }
});
