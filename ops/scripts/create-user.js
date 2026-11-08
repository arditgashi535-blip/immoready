'use strict';
// Legt einen Benutzer an. Aufruf: node scripts/create-user.js <email> <name> <rollen>
// rollen z. B. "immoready:owner,readystudio:owner". Passwort: READYOPS_PASSWORD oder zufällig erzeugt;
// ein erzeugtes Passwort wird einmalig in data/zugang-<email>.txt (Dateirechte 600, gitignoriert) abgelegt.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { open } = require('../src/db');
const auth = require('../src/auth');

const [email, name, roles] = process.argv.slice(2);
if (!email || !name || !roles) { console.error('Aufruf: create-user.js <email> <name> <tenant:rolle,...>'); process.exit(1); }
const memberships = Object.fromEntries(roles.split(',').map(x => x.split(':')));
const generated = !process.env.READYOPS_PASSWORD;
const password = process.env.READYOPS_PASSWORD || crypto.randomBytes(15).toString('base64url');
const db = open();
if (db.prepare('SELECT 1 FROM users WHERE email=?').get(email.toLowerCase())) { console.log('Benutzer existiert bereits:', email); process.exit(0); }
const id = auth.createUser(db, { email, name, password, memberships });
if (generated) {
  const f = path.join(__dirname, '..', 'data', `zugang-${email.replace(/[^a-z0-9]/gi, '_')}.txt`);
  fs.writeFileSync(f, `ReadyOps Zugang\nE-Mail: ${email}\nPasswort: ${password}\nBitte nach dem ersten Login sicher aufbewahren und diese Datei löschen.\n`, { mode: 0o600 });
  console.log(`Benutzer ${id} angelegt; Passwort in ${f}`);
} else console.log(`Benutzer ${id} angelegt`);
