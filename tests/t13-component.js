// Tests für die Web Component <immoready-tour> (Ereignisse, Mehrfachinstanzen, Aufräumen, Fallbacks).
// Voraussetzung: python3 -m http.server 8702 --bind 127.0.0.1  (im Repository-Wurzelordner)
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8702/dist/component/';
(async () => {
  const b = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const log = []; const ok = (c, m) => log.push((c ? 'PASS ' : 'FAIL ') + m);
  const LISTEN = () => {
    window.__L = 0; const add = EventTarget.prototype.addEventListener, rem = EventTarget.prototype.removeEventListener;
    EventTarget.prototype.addEventListener = function (t, f, o) { if (this === window || this === document) window.__L++; return add.call(this, t, f, o); };
    EventTarget.prototype.removeEventListener = function (t, f, o) { if (this === window || this === document) window.__L--; return rem.call(this, t, f, o); };
  };
  let p = await b.newPage({ viewport: { width: 1440, height: 900 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(LISTEN);
  await p.goto(BASE + 'demo.html');
  const waitEv = (id, name, pred, ms) => p.waitForFunction(([id, name, pred]) => window.EVENTS.some(e => e.id === id && e.name === name && (!pred || new Function('d', 'return ' + pred)(e.detail))), [id, name, pred], { timeout: ms || 20000 }).then(() => true).catch(() => false);
  ok(await waitEv('t1', 'tour-ready', "d.mode==='webgl'&&d.version==='17'") && await waitEv('t2', 'tour-ready', "d.mode==='webgl'"), 'Zwei Instanzen gleichzeitig: beide melden tour-ready {version:"17", mode:"webgl"}');
  ok(await waitEv('t2', 'station-change', "d.index===2&&d.station==='eingang'"), 'Attribut station="2" beim Start → station-change {station:"eingang", index:2}');
  const onK = id => p.evaluate(id => { const r = document.getElementById(id).shadowRoot; const e = r.querySelector('.jr-st.on'); return e && e.dataset.k; }, id);
  await p.evaluate(() => document.getElementById('t1').setAttribute('station', '4'));
  ok(await waitEv('t1', 'station-change', "d.station==='bad'&&d.index===4&&d.progress===0.73") && await onK('t1') === 'bad' && await onK('t2') === 'eingang', 'setAttribute("station","4") steuert nur Instanz 1 (Bad), Instanz 2 bleibt');
  await p.waitForTimeout(1500);
  const h0 = await p.evaluate(() => location.hash);
  await p.evaluate(() => document.getElementById('t1').shadowRoot.querySelector('.jr-st.on a[data-pre]').click());
  const rq = await p.evaluate(() => window.EVENTS.filter(e => e.name === 'request-quote').pop());
  ok(rq && rq.id === 't1' && JSON.stringify(rq.detail) === JSON.stringify({ service: 'sanitaer', station: 'bad', source: 'tour', version: 1 }) && await p.evaluate(() => location.hash) === h0, 'request-quote {service:"sanitaer", station:"bad", source:"tour", version:1}, keine interne Navigation');
  await p.evaluate(() => { const a = document.getElementById('t1').shadowRoot.querySelector('.jr-st.on a[data-pre]'); a.dataset.pre = 'fremd<script>'; a.click(); });
  const rq2 = await p.evaluate(() => window.EVENTS.filter(e => e.name === 'request-quote').pop());
  ok(rq2.detail.service === '', 'Unbekannte Leistung wird nicht weitergegeben (Whitelist aus rise.json)');
  await p.evaluate(() => document.getElementById('t1').shadowRoot.querySelector('.jr-stepb[data-step="-1"]').click());
  ok(await waitEv('t1', 'station-change', "d.station==='wohnung'"), '«Zurück» in der Komponente → Station Wohnung');
  await p.waitForTimeout(800);
  await p.evaluate(() => { const r = document.getElementById('t1').shadowRoot; r.querySelector('[data-choice="leerstand"]').click(); r.querySelector('.jr-st.on [data-choice-cta]').click(); });
  const rqc = await p.evaluate(() => window.EVENTS.filter(e => e.name === 'request-quote').pop());
  ok(rqc && rqc.detail.service === 'leerstand' && rqc.detail.station === 'wohnung' && await p.evaluate(() => !document.getElementById('t1').shadowRoot.querySelector('[data-choice-text="leerstand"]').hidden), 'Auswahl in der Wohnung (Leerstand) → request-quote {service:"leerstand"}, Beschreibung sichtbar');
  await p.evaluate(() => document.getElementById('t1').shadowRoot.querySelector('[data-choice="reinigung"]').focus()); await p.keyboard.press('ArrowDown');
  ok(await p.evaluate(() => { const r = document.getElementById('t1').shadowRoot; return r.querySelector('[data-choice="raeumung"]').getAttribute('aria-checked') === 'true' && r.activeElement === r.querySelector('[data-choice="raeumung"]') && r.querySelector('.jr-st.on [data-choice-cta]').dataset.pre === 'raeumung'; }), 'Auswahl per Tastatur (Pfeiltaste) – Aktion übernimmt die Leistung');
  await p.evaluate(() => document.getElementById('t1').setAttribute('station', '5')); await waitEv('t1', 'station-change', "d.station==='zurueck'"); await p.waitForTimeout(900);
  const h1 = await p.evaluate(() => location.hash);
  await p.evaluate(() => document.getElementById('t1').shadowRoot.querySelector('.jr-st.on a[data-contact]').click());
  ok(await waitEv('t1', 'request-contact', "d.station==='zurueck'&&d.source==='tour'&&d.version===1", 4000) && await p.evaluate(() => location.hash) === h1, 'Kontakt aufnehmen → request-contact {station:"zurueck", source:"tour", version:1}, keine interne Navigation');
  await p.evaluate(() => document.getElementById('t1').shadowRoot.querySelector('.jr-st.on a[data-primary]').click());
  const rqg = await p.evaluate(() => window.EVENTS.filter(e => e.name === 'request-quote').pop());
  ok(rqg.detail.service === '' && rqg.detail.station === 'zurueck', 'Allgemeine Offertanfrage ohne Leistung → service ""');
  await p.evaluate(() => document.getElementById('t1').setAttribute('station', '4')); await waitEv('t1', 'station-change', "d.station==='bad'", 8000); await p.waitForTimeout(900);
  await p.evaluate(() => document.getElementById('t1').shadowRoot.querySelector('.jr-stepb[data-step="-1"]').click());
  ok(await waitEv('t1', 'station-change', "d.station==='wohnung'&&d.index===3"), '«Zurück» funktioniert erneut nach Stationswechseln');
  await p.evaluate(() => document.getElementById('t1').shadowRoot.querySelector('.jr-nav button[data-go="1"]').focus()); await p.keyboard.press('Enter');
  ok(await waitEv('t1', 'station-change', "d.station==='garten'"), 'Tastatur (Enter auf Stationsknopf) im Shadow DOM');
  ok(await p.evaluate(() => { const i = document.getElementById('t1').shadowRoot.querySelector('.jr-still'); return i.complete && i.naturalWidth === 1440 && /assets\/tour\/station-01-aussen\.webp$/.test(i.src); }), 'Stationsbilder als WebP aus assets/tour/ neben dem Skript');
  // Aufräumen: mehrfach entfernen und einsetzen
  const cyc = async () => { await p.evaluate(() => document.getElementById('toggle').click()); await p.waitForTimeout(150); await p.evaluate(() => document.getElementById('toggle').click()); await p.waitForTimeout(150); };
  const started = async () => { await p.waitForFunction(() => { const t = document.getElementById('t1').tour; return t && t.state().running; }, null, { timeout: 20000 }).catch(() => {}); await p.waitForTimeout(300); };
  await cyc(); await cyc(); await started();
  const L0 = await p.evaluate(() => window.__L);
  for (let k = 0; k < 4; k++) {
    await p.evaluate(() => document.getElementById('toggle').click()); await p.waitForTimeout(150);
    await p.evaluate(() => document.getElementById('toggle').click()); await p.waitForTimeout(150);
  }
  await started();
  const L1 = await p.evaluate(() => window.__L);
  const ready1 = await p.evaluate(() => window.EVENTS.filter(e => e.id === 't1' && e.name === 'tour-ready').length);
  ok(L1 === L0 && ready1 >= 2, `4× entfernt/eingesetzt: keine verwaisten Listener (window/document: ${L0} → ${L1}), Neustart funktioniert`);
  await p.evaluate(() => { window.__el = document.getElementById('t1'); window.__old = window.__el.tour; document.getElementById('toggle').click(); });
  ok(await p.evaluate(() => window.__old.state().destroyed === true && window.__old.state().running === false && window.__old.state().listeners === 0 && window.__el.shadowRoot.childNodes.length === 0 && window.__el.tour === null), 'disconnectedCallback: WebGL gestoppt, Listener entfernt, Shadow DOM geleert');
  await p.evaluate(() => document.getElementById('toggle').click());
  // Kontextverlust an Instanz 2
  await p.evaluate(() => { const c = document.getElementById('t2').shadowRoot.querySelector('canvas'); c.getContext('webgl').getExtension('WEBGL_lose_context').loseContext(); });
  ok(await waitEv('t2', 'tour-error', "d.code==='WEBGL_CONTEXT_LOST'&&d.fallback==='stills'", 8000) && await p.evaluate(() => document.getElementById('t2').shadowRoot.querySelector('#reise').classList.contains('jr-static')), 'Kontextverlust → tour-error {code:"WEBGL_CONTEXT_LOST", fallback:"stills"} und Stationsbilder');
  await p.evaluate(() => document.getElementById('t2').setAttribute('station', '5'));
  ok(await onK('t2') === 'zurueck' && await p.evaluate(() => document.getElementById('t2').shadowRoot.querySelectorAll('.jr-still')[5].classList.contains('on')), 'Nach Kontextverlust: Stationswechsel mit Bild weiterhin möglich');
  ok(errs.length === 0, 'keine JS-Fehler ' + errs.join(' | '));
  await p.close();
  // Ohne WebGL
  p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  await p.addInitScript(() => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, o) { if (/webgl/.test(t)) return null; return g.call(this, t, o); }; });
  await p.goto(BASE + 'demo.html');
  ok(await waitEv('t1', 'tour-error', "d.code==='WEBGL_UNAVAILABLE'", 15000) && await waitEv('t1', 'tour-ready', "d.mode==='stills'", 15000), 'Ohne WebGL: tour-error WEBGL_UNAVAILABLE und tour-ready {mode:"stills"}');
  await p.close();
  // Smartphone
  p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await p.goto(BASE + 'demo.html');
  ok(await waitEv('t1', 'tour-ready', "d.mode==='stills'", 15000) && await p.evaluate(() => !document.getElementById('t1').shadowRoot.querySelector('#reise').classList.contains('jr-ready')), 'Smartphone: Stationsbilder, kein WebGL-Start');
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Smartphone: kein seitliches Scrollen');
  ok(await p.evaluate(() => { const i = document.getElementById('t1').shadowRoot.querySelector('.jr-still'); return /station-01-aussen-hoch\.webp$/.test(i.currentSrc) && i.naturalWidth === 960; }), 'Smartphone: Hochformat-Stationsbild (960×864) aus <picture>');
  await p.close();
  // Reduzierte Bewegung: Stationen springen ohne Kamerafahrt
  p = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await p.goto(BASE + 'demo.html'); await waitEv('t1', 'tour-ready', null, 20000);
  await p.waitForFunction(() => document.getElementById('t1').tour && document.getElementById('t1').tour.state().running, null, { timeout: 20000 }).catch(() => {});
  await p.evaluate(() => document.getElementById('t1').setAttribute('station', '3')); await p.waitForTimeout(1200);
  const rmS = await p.evaluate(() => document.getElementById('t1').tour.state());
  ok(Math.abs(rmS.ps - 0.59) < 0.01 && rmS.scan.count === 0 && rmS.scan.state === 'done', 'Bewegung reduzieren: keine Scan-Kante, Stationswechsel ohne Kamerafahrt (sofort an der Station) ' + JSON.stringify({ ps: rmS.ps, scan: rmS.scan }));
  await p.close();
  // Eine Datei mit eingebetteten Bildern
  p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  await p.setContent('<immoready-tour id="x"></immoready-tour><script src="' + BASE + 'immoready-tour.inline.js"></script>');
  await p.waitForTimeout(3000);
  ok(await p.evaluate(() => { const i = document.getElementById('x').shadowRoot.querySelector('.jr-still'); return i.src.startsWith('data:image/webp') && i.naturalWidth === 1440; }), 'Inline-Bundle: Stationsbilder eingebettet (eine Datei)');
  await p.close();
  console.log(log.join('\n')); await b.close();
})();
