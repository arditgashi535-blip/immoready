// Nachgebildeter ReadyOS-Empfänger für Tests (nur im Speicher, nur 127.0.0.1).
// POST /events → 201 neu, 409 bereits verarbeitet (gleicher Idempotency-Key), 400 ungültig, 401 ohne/falschen Schlüssel.
// GET /events → Liste der angenommenen Ereignisse. Mit { failFirst: n } antwortet er die ersten n Male mit 503.
'use strict';
const http = require('http');
const { validate } = require('./readyos-adapter');

function start(opts = {}) {
  const seen = new Map(); let fails = opts.failFirst || 0;
  const srv = http.createServer((q, r) => {
    const send = (s, b) => { r.writeHead(s, { 'Content-Type': 'application/json' }); r.end(JSON.stringify(b || {})); };
    if (q.method === 'GET' && q.url === '/events') return send(200, [...seen.values()]);
    if (q.method !== 'POST' || q.url !== '/events') return send(404);
    if (opts.token && q.headers.authorization !== 'Bearer ' + opts.token) return send(401);
    let body = ''; q.on('data', d => { body += d; }); q.on('end', () => {
      if (fails > 0) { fails--; return send(503); }
      let ev; try { ev = JSON.parse(body); } catch (e) { return send(400, { error: 'json' }); }
      const err = validate(ev); if (err.length) return send(400, { error: err });
      const key = q.headers['idempotency-key'] || ev.idempotencyKey;
      if (seen.has(key)) return send(409, { duplicate: key });
      seen.set(key, ev); send(201, { accepted: key });
    });
  });
  return new Promise(res => srv.listen(0, '127.0.0.1', () => res({ url: 'http://127.0.0.1:' + srv.address().port, seen, close: () => srv.close() })));
}

module.exports = { start };
