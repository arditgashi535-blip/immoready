'use strict';
const { open } = require('../src/db');
const auth = require('../src/auth');

const PW = 'Test-Passwort-123!';
function setup() {
  const db = open(':memory:');
  const owner = auth.createUser(db, { email: 'owner@test.invalid', name: 'Owner', password: PW, memberships: { immoready: 'owner', readystudio: 'owner' } });
  const editor = auth.createUser(db, { email: 'editor@test.invalid', name: 'Editor', password: PW, memberships: { immoready: 'editor' } });
  const viewer = auth.createUser(db, { email: 'viewer@test.invalid', name: 'Viewer', password: PW, memberships: { immoready: 'viewer' } });
  const rsOnly = auth.createUser(db, { email: 'rs@test.invalid', name: 'RS Owner', password: PW, memberships: { readystudio: 'owner' } });
  return { db, users: { owner: { id: owner }, editor: { id: editor }, viewer: { id: viewer }, rsOnly: { id: rsOnly } } };
}
const sampleLead = (over = {}) => ({
  company: { name: 'Muster Verwaltung AG', website: 'https://www.muster-verwaltung.example', locality: 'Baden', canton: 'AG', segment: 'immobilienverwaltung', address: 'Teststrasse 1, 5400 Baden' },
  need: 'Hauswartung', fit_reason: 'Testdaten', score: 70, channel: 'brief', verification: 'verifiziert',
  sources: [{ url: 'https://www.muster-verwaltung.example/kontakt' }], ...over
});
const sampleDraft = (lead_id, over = {}) => ({ lead_id, kind: 'email', recipient: 'kontakt@muster-verwaltung.example', subject: 'Test', body: 'Sehr geehrte Damen und Herren, dies ist ein Testentwurf mit genug Text.', ...over });
module.exports = { setup, sampleLead, sampleDraft, PW };
