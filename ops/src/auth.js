'use strict';
// Authentifizierung: scrypt-Passworthashes, zufällige Sitzungstoken (nur Hash gespeichert),
// Cookie HttpOnly + SameSite=Strict (+ Secure hinter HTTPS), CSRF-Token je Sitzung, Anmeldebremse.
const crypto = require('node:crypto');
const { now } = require('./db');

const SESSION_HOURS = 12;
const SCRYPT = { N: 16384, r: 8, p: 1 };

function hashPassword(pw) {
  if (typeof pw !== 'string' || pw.length < 12) throw new Error('Passwort muss mindestens 12 Zeichen haben');
  const salt = crypto.randomBytes(16);
  const h = crypto.scryptSync(pw, salt, 64, SCRYPT);
  return `scrypt$${salt.toString('hex')}$${h.toString('hex')}`;
}
function verifyPassword(pw, stored) {
  const [alg, s, h] = String(stored || '').split('$');
  if (alg !== 'scrypt' || !s || !h) return false;
  const calc = crypto.scryptSync(String(pw), Buffer.from(s, 'hex'), 64, SCRYPT);
  const exp = Buffer.from(h, 'hex');
  return exp.length === calc.length && crypto.timingSafeEqual(calc, exp);
}
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const DUMMY = hashPassword('dummy-password-for-timing');

function createUser(db, { email, name, password, memberships }) {
  const r = db.prepare('INSERT INTO users (email,name,pw_hash,created_at) VALUES (?,?,?,?)').run(String(email).toLowerCase(), name, hashPassword(password), now());
  const id = Number(r.lastInsertRowid);
  for (const [tenant, role] of Object.entries(memberships || {})) db.prepare('INSERT INTO memberships (user_id,tenant_id,role) VALUES (?,?,?)').run(id, tenant, role);
  return id;
}

const attempts = new Map(); // ip|email → {n, until}
function throttled(key) { const a = attempts.get(key); return !!(a && a.until > Date.now()); }
function fail(key) {
  const a = attempts.get(key) || { n: 0, until: 0 };
  a.n++;
  if (a.n >= 5) { a.until = Date.now() + 15 * 60e3; a.n = 0; }
  attempts.set(key, a);
}

function login(db, email, password, ip = '') {
  const key = ip + '|' + String(email || '').toLowerCase();
  if (throttled(key)) return { error: 'Zu viele Fehlversuche. Bitte 15 Minuten warten.', status: 429 };
  const u = db.prepare('SELECT * FROM users WHERE email=? AND active=1').get(String(email || '').toLowerCase());
  const ok = verifyPassword(password, u ? u.pw_hash : DUMMY) && !!u;
  if (!ok) { fail(key); return { error: 'Anmeldung fehlgeschlagen', status: 401 }; }
  attempts.delete(key);
  const token = crypto.randomBytes(32).toString('base64url');
  const csrf = crypto.randomBytes(24).toString('base64url');
  const exp = new Date(Date.now() + SESSION_HOURS * 3600e3).toISOString();
  db.prepare('INSERT INTO sessions (token_hash,user_id,csrf,created_at,expires_at) VALUES (?,?,?,?,?)').run(sha(token), u.id, csrf, now(), exp);
  return { token, csrf, user: { id: u.id, email: u.email, name: u.name } };
}
function session(db, token) {
  if (!token) return null;
  const s = db.prepare('SELECT s.*, u.email, u.name, u.active FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=?').get(sha(token));
  if (!s || !s.active || s.expires_at < now()) return null;
  const memberships = Object.fromEntries(db.prepare('SELECT tenant_id, role FROM memberships WHERE user_id=?').all(s.user_id).map(m => [m.tenant_id, m.role]));
  return { id: s.user_id, email: s.email, name: s.name, csrf: s.csrf, memberships };
}
function logout(db, token) { if (token) db.prepare('DELETE FROM sessions WHERE token_hash=?').run(sha(token)); }
function csrfOk(sess, header) {
  if (!sess || !header) return false;
  const a = Buffer.from(String(header)), b = Buffer.from(sess.csrf);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
module.exports = { hashPassword, verifyPassword, createUser, login, session, logout, csrfOk };
