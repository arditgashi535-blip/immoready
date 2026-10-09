// Prüft den Wix-Adapter (wix/velo-custom-element.js) ohne Wix: $w und wix-location werden nachgebildet.
// Gültige Ereignisse führen zur richtigen Seite, ungültige oder manipulierte Werte werden verworfen.
// Aufruf: node tests/t15-velo.js
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.resolve(__dirname, '../wix/velo-custom-element.js'), 'utf8')
  .replace(/^import wixLocation from 'wix-location';$/m, '');
const log = []; const ok = (c, m) => log.push((c ? 'PASS ' : 'FAIL ') + m);
const handlers = {}, nav = [];
const $w = sel => { if (typeof sel === 'function') { sel(); return; } if (sel !== '#immoreadyTour') throw new Error('unbekannte Element-ID ' + sel); return { on: (ev, fn) => { handlers[ev] = fn; }, setAttribute() {} }; };
$w.onReady = fn => fn();
const wixLocation = { to: u => nav.push(u) };
new Function('$w', 'wixLocation', 'console', src)($w, wixLocation, { info() {}, log() {} });
const fire = (ev, detail) => { nav.length = 0; handlers[ev]({ detail }); return nav.slice(); };
ok(['request-quote', 'request-contact', 'station-change', 'tour-error'].every(e => typeof handlers[e] === 'function'), 'Adapter registriert request-quote, request-contact, station-change, tour-error auf #immoreadyTour');
ok(JSON.stringify(fire('request-quote', { service: 'sanitaer', station: 'bad', source: 'tour', version: 1 })) === '["/offerte?leistung=sanitaer"]', 'Offerte mit Leistung → /offerte?leistung=sanitaer');
ok(JSON.stringify(fire('request-quote', { service: '', station: 'zurueck', source: 'tour', version: 1 })) === '["/offerte"]', 'Allgemeine Offerte ohne Leistung → /offerte');
ok(JSON.stringify(fire('request-quote', { service: 'fremd<script>', station: 'bad', source: 'tour', version: 1 })) === '["/offerte"]', 'Unbekannte Leistung wird verworfen (kein Parameter)');
ok(fire('request-quote', { service: 'sanitaer', station: 'bad', source: 'andere', version: 1 }).length === 0, 'Fremde Quelle → keine Navigation');
ok(fire('request-quote', { service: 'sanitaer', station: 'bad', source: 'tour', version: 2 }).length === 0, 'Falsche Ereignisversion → keine Navigation');
ok(fire('request-quote', { service: 'sanitaer', station: 'keller', source: 'tour', version: 1 }).length === 0, 'Unbekannte Station → keine Navigation');
ok(fire('request-quote', null).length === 0 && fire('request-quote', 'x').length === 0, 'Leere oder falsche Nutzdaten → keine Navigation');
ok(JSON.stringify(fire('request-contact', { station: 'zurueck', source: 'tour', version: 1 })) === '["/kontakt"]', 'Kontakt → Kontaktseite (Pfad vor dem Einbau prüfen)');
ok(fire('request-contact', { station: 'zurueck', source: 'x', version: 1 }).length === 0, 'Kontakt aus fremder Quelle → keine Navigation');
console.log(log.join('\n'));
process.exit(log.some(l => l.startsWith('FAIL')) ? 1 : 0);
