'use strict';
// ReadyOps-Server: Freigabeoberfläche + API + öffentlicher Formular-Endpunkt. Nur node:http, keine Abhängigkeiten.
// Standard: bindet an 127.0.0.1 (nicht öffentlich). Für einen späteren Betrieb hinter HTTPS: READYOPS_SECURE=1.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { open, TENANTS } = require('./db');
const auth = require('./auth');
const approvals = require('./approvals');
const { scope, AppError, TENANT_IDS } = require('./repo');
const intake = require('./intake');
const notifyMod = require('./notify');
const { handoffAdapter } = require('./mail/adapter');
const pipeline = require('./pipeline');

const PUBLIC = path.join(__dirname, '..', 'public');
const STATIC = { '/': ['index.html', 'text/html; charset=utf-8'], '/app.js': ['app.js', 'text/javascript; charset=utf-8'], '/app.css': ['app.css', 'text/css; charset=utf-8'] };
const INTAKE_ORIGINS = (process.env.READYOPS_INTAKE_ORIGINS || 'https://www.immoready.ch,https://immoready.ch,https://readystudio.ch,https://www.readystudio.ch').split(',');
const MAX_BODY = 64 * 1024;

function headers(extra) {
  return Object.assign({
    'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
    'Cache-Control': 'no-store'
  }, extra || {});
}
function send(res, status, obj, extra) {
  res.writeHead(status, headers(Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, extra)));
  res.end(JSON.stringify(obj));
}
function cookie(req, name) {
  const m = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : null;
}
function body(req) {
  return new Promise((resolve, reject) => {
    let n = 0; const chunks = [];
    req.on('data', c => { n += c.length; if (n > MAX_BODY) { reject(new AppError('too_large', 'Anfrage zu gross', 413)); req.destroy(); } else chunks.push(c); });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch { reject(new AppError('json', 'Ungültiges JSON', 400)); }
    });
    req.on('error', reject);
  });
}

const intakeHits = new Map();
function intakeLimited(ip) {
  const t = Date.now(), w = intakeHits.get(ip) || [];
  const recent = w.filter(x => t - x < 10 * 60e3); recent.push(t); intakeHits.set(ip, recent);
  return recent.length > 10;
}

function createServer({ db = open(), adapter = handoffAdapter(), secure = process.env.READYOPS_SECURE === '1' } = {}) {
  const SESS = 'ro_sess';
  async function handle(req, res) {
    const url = new URL(req.url, 'http://local');
    const p = url.pathname;
    const ip = req.socket.remoteAddress || '';

    if (req.method === 'GET' && STATIC[p]) {
      const [f, type] = STATIC[p];
      res.writeHead(200, headers({ 'Content-Type': type }));
      return res.end(fs.readFileSync(path.join(PUBLIC, f)));
    }

    // ---- Öffentlicher Formular-Endpunkt (ohne Anmeldung) ----
    const im = p.match(/^\/api\/intake\/([a-z]+)$/);
    if (im) {
      const origin = req.headers.origin || '';
      const cors = INTAKE_ORIGINS.includes(origin) ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {};
      if (req.method === 'OPTIONS') {
        if (!cors['Access-Control-Allow-Origin']) return send(res, 403, { error: 'origin' });
        res.writeHead(204, headers(Object.assign({ 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600' }, cors)));
        return res.end();
      }
      if (req.method !== 'POST') return send(res, 405, { error: 'method' });
      if (origin && !cors['Access-Control-Allow-Origin']) return send(res, 403, { error: 'origin' });
      if (intakeLimited(ip)) return send(res, 429, { error: 'Zu viele Anfragen' }, cors);
      if (!TENANT_IDS.includes(im[1])) return send(res, 404, { error: 'not_found' }, cors);
      try {
        const r = intake.receive(db, im[1], await body(req));
        return send(res, r.ok ? 200 : 400, r, cors);
      } catch (e) {
        try { notifyMod.notify(db, im[1], 'formular_fehlgeschlagen', { key: 'intake-' + Date.now(), subject: 'Formularzustellung fehlgeschlagen', body: 'Fehler: ' + String(e.message).slice(0, 300) }); } catch {}
        return send(res, e.status || 500, { ok: false, error: e.status ? e.message : 'Serverfehler' }, cors);
      }
    }

    // ---- Anmeldung ----
    if (p === '/api/login' && req.method === 'POST') {
      const b = await body(req);
      const r = auth.login(db, b.email, b.password, ip);
      if (r.error) return send(res, r.status, { error: r.error });
      return send(res, 200, { user: r.user, csrf: r.csrf }, { 'Set-Cookie': `${SESS}=${encodeURIComponent(r.token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200${secure ? '; Secure' : ''}` });
    }
    const sess = auth.session(db, cookie(req, SESS));
    if (p === '/api/me') {
      if (!sess) return send(res, 401, { error: 'Anmeldung erforderlich' });
      return send(res, 200, { user: { id: sess.id, name: sess.name, email: sess.email }, memberships: sess.memberships, csrf: sess.csrf, tenants: TENANTS.filter(t => sess.memberships[t.id]).map(t => ({ id: t.id, name: t.name })), stages: pipeline.STAGES, stageLabels: pipeline.LABELS });
    }
    if (!p.startsWith('/api/')) return send(res, 404, { error: 'not_found' });
    if (!sess) return send(res, 401, { error: 'Anmeldung erforderlich' });
    if (req.method !== 'GET' && !auth.csrfOk(sess, req.headers['x-csrf-token'])) return send(res, 403, { error: 'CSRF-Prüfung fehlgeschlagen' });
    if (p === '/api/logout' && req.method === 'POST') {
      auth.logout(db, cookie(req, SESS));
      return send(res, 200, { ok: true }, { 'Set-Cookie': `${SESS}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0` });
    }

    const m = p.match(/^\/api\/([a-z]+)\/(.+)$/);
    if (!m) return send(res, 404, { error: 'not_found' });
    const tenant = m[1], rest = m[2];
    if (!TENANT_IDS.includes(tenant)) return send(res, 404, { error: 'not_found' });
    const role = sess.memberships[tenant];
    if (!role) return send(res, 403, { error: 'Kein Zugriff auf diesen Mandanten' });
    const user = { id: sess.id };
    const A = approvals.api(db, tenant, user);
    const R = scope(db, tenant, `user:${sess.id}`);
    const needEdit = () => { if (!['owner', 'editor'].includes(role)) throw new AppError('forbidden', 'Keine Berechtigung', 403); };
    const q = Object.fromEntries(url.searchParams);
    let mm;

    if (req.method === 'GET' && rest === 'drafts') return send(res, 200, A.list(q));
    if (req.method === 'GET' && (mm = rest.match(/^drafts\/(\d+)$/))) return send(res, 200, A.getDraft(mm[1]));
    if (req.method === 'POST' && (mm = rest.match(/^drafts\/(\d+)\/(edit|decide|execute|resubmit|mark-sent)$/))) {
      const b = await body(req);
      const id = mm[1];
      if (mm[2] === 'edit') return send(res, 200, A.edit(id, b.changes || {}, { expectVersion: b.expectVersion }));
      if (mm[2] === 'decide') return send(res, 200, A.decide(id, b));
      if (mm[2] === 'execute') return send(res, 200, await A.execute(id, adapter, { retry: b.retry === true }));
      if (mm[2] === 'resubmit') return send(res, 200, A.resubmit(id));
      if (mm[2] === 'mark-sent') return send(res, 200, A.markSent(id));
    }
    if (req.method === 'GET' && rest === 'leads') return send(res, 200, R.listLeads(q));
    if (req.method === 'GET' && (mm = rest.match(/^leads\/(\d+)$/))) return send(res, 200, R.getLead(mm[1]));
    if (req.method === 'POST' && (mm = rest.match(/^leads\/(\d+)\/stage$/))) { needEdit(); const b = await body(req); return send(res, 200, R.moveLead(mm[1], b.to, { reason: b.reason })); }
    if (req.method === 'POST' && (mm = rest.match(/^leads\/(\d+)\/notes$/))) { needEdit(); const b = await body(req); return send(res, 200, { id: R.addNote(mm[1], b.body, sess.id, b.kind || 'notiz') }); }
    if (req.method === 'POST' && (mm = rest.match(/^leads\/(\d+)\/tasks$/))) { needEdit(); const b = await body(req); return send(res, 200, { id: R.addTask(mm[1], b.title, b.due_at) }); }
    if (req.method === 'GET' && rest === 'stats') return send(res, 200, R.stats());
    if (req.method === 'GET' && rest === 'events') return send(res, 200, R.events(Number(q.limit) || 100));
    if (req.method === 'GET' && rest === 'inquiries') return send(res, 200, db.prepare('SELECT id,channel,classification,qualified,injection_flags,received_at,lead_id FROM inquiries WHERE tenant_id=? ORDER BY id DESC LIMIT 200').all(tenant));
    if (req.method === 'GET' && rest === 'notifications') return send(res, 200, db.prepare('SELECT id,kind,priority,recipient,subject,status,created_at,delivered_at,error FROM notifications WHERE tenant_id=? ORDER BY id DESC LIMIT 200').all(tenant));
    if (req.method === 'GET' && (mm = rest.match(/^documents\/(\d+)$/))) {
      const d = R.mustGet('documents', mm[1]);
      res.writeHead(200, headers({ 'Content-Type': d.mime === 'application/pdf' ? 'application/pdf' : 'text/plain; charset=utf-8', 'Content-Disposition': `attachment; filename="${d.filename.replace(/[^\w.\-]/g, '_')}"` }));
      return res.end(d.mime === 'application/pdf' ? Buffer.from(d.content, 'base64') : d.content);
    }
    return send(res, 404, { error: 'not_found' });
  }

  return http.createServer((req, res) => {
    handle(req, res).catch(e => {
      const status = e.status || 500;
      if (status >= 500 && !(e instanceof AppError)) {
        console.error('Fehler', e && e.message);
        for (const t of TENANT_IDS) { try { notifyMod.notify(db, t, 'kritischer_fehler', { key: 'srv-' + new Date().toISOString().slice(0, 13), subject: 'Kritischer Serverfehler', body: String(e && e.message).slice(0, 300) }); } catch {} }
      }
      if (!res.headersSent) send(res, status, { error: e instanceof AppError ? e.message : 'Serverfehler', code: e.code || 'error' });
    });
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT || 8790);
  const host = process.env.HOST || '127.0.0.1';
  createServer().listen(port, host, () => console.log(`ReadyOps läuft auf http://${host}:${port}`));
}
module.exports = { createServer };
