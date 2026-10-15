// Velo-Backend für das Offertformular (V17.1) – Datei in Wix: Backend → http-functions.js
// Status: vorbereitet, NICHT in Wix eingefügt, NICHT auf Wix ausgeführt. Einbau nur nach Freigabe (siehe wix/EINBAU.md).
//
// Endpunkte (nach Veröffentlichung der Site, Basis https://www.immoready.ch/_functions):
//   POST /offerteUpload  {name, mime, size}  → {uploadUrl}         Upload-Adresse für ein Foto (Media Manager, Ordner /offerten)
//   POST /offerte        {…Formular, fotos}  → {ok:true, id}      prüft serverseitig und speichert in der Sammlung «Offertanfragen»
//   OPTIONS für beide (CORS nur für die erlaubten Ursprünge aus rise.json → wix.allowedOrigins)
//
// Grundlagen (offizielle Wix-Dokumentation, gelesen am 15.10.2026):
//   HTTP-Funktionen: https://dev.wix.com/docs/develop-websites-sdk/code-your-site/build-a-custom-backend/expose-services/write-an-http-function
//   Upload-Adresse:  https://dev.wix.com/docs/api-reference/assets/media/media-manager/files/generate-file-upload-url?apiView=SDK
//   Upload-Ablauf:   https://dev.wix.com/docs/api-reference/assets/media/media-manager/files/upload-api
// Keine Zugangsdaten im Browser: Die Berechtigungen laufen serverseitig über auth.elevate.
import { ok, badRequest, serverError, forbidden } from 'wix-http-functions';
import { items } from '@wix/data';
import { files } from '@wix/media';
import { auth } from '@wix/essentials';

const ERLAUBT = ['https://www.immoready.ch', 'https://immoready.ch'];
const LEISTUNGEN = ['hauswartung', 'sanitaer', 'gartenunterhalt', 'reinigung', 'raeumung', 'leerstand', 'verkauf', 'fotografie', 'mehrere'];
const SAMMLUNG = 'Offertanfragen';
const MAX_FOTOS = 5, MAX_BYTES = 10 * 1024 * 1024, BILDTYPEN = ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'];

function cors(request) {
  const o = (request.headers && (request.headers.origin || request.headers.Origin)) || '';
  return ERLAUBT.includes(o) ? { 'Access-Control-Allow-Origin': o, 'Vary': 'Origin' } : null;
}
function antwort(fn, request, body) {
  const c = cors(request) || {};
  return fn({ body, headers: Object.assign({ 'Content-Type': 'application/json' }, c) });
}
function vorab(request) {
  const c = cors(request);
  if (!c) return forbidden({ body: { error: 'origin' } });
  return ok({ headers: Object.assign({ 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600' }, c) });
}
export function options_offerte(request) { return vorab(request); }
export function options_offerteUpload(request) { return vorab(request); }

const txt = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/* dieselben Regeln wie im Browser (src/p3c.html → validate), zusätzlich Längen- und Typgrenzen */
function pruefen(b) {
  const f = {};
  const d = {
    leistung: txt(b.leistung, 40), auftrag: txt(b.auftrag, 20), ort: txt(b.ort, 120), beschreibung: txt(b.beschreibung, 4000),
    name: txt(b.name, 120), email: txt(b.email, 200), tel: txt(b.tel, 40)
  };
  if (!LEISTUNGEN.includes(d.leistung)) f.leistung = 'Bitte wählen Sie die gewünschte Leistung.';
  if (d.auftrag && !['einzel', 'laufend'].includes(d.auftrag)) f.auftrag = 'Ungültige Auswahl.';
  if (d.ort.length < 2) f.ort = 'Bitte geben Sie den Ort oder die Postleitzahl an.';
  if (d.beschreibung.length < 15) f.beschreibung = 'Bitte beschreiben Sie Ihr Anliegen in ein paar Worten (mindestens 15 Zeichen).';
  if (d.name.length < 2) f.name = 'Bitte geben Sie Ihren Namen an.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) f.email = 'Bitte prüfen Sie die E-Mail-Adresse, z. B. name@beispiel.ch.';
  const t = d.tel.replace(/[\s\-\/().]/g, '');
  if (t && !/^(\+|00)?\d{9,13}$/.test(t)) f.tel = 'Bitte prüfen Sie die Telefonnummer, z. B. 079 123 45 67.';
  const fotos = Array.isArray(b.fotos) ? b.fotos.slice(0, MAX_FOTOS).map(x => ({ name: txt(x && x.name, 200), ref: txt(x && x.ref, 500) }))
    .filter(x => x.ref === '' || /^https:\/\/[a-z0-9.-]*(wixstatic|wixmp)\.com\//.test(x.ref)) : [];
  return { daten: d, fotos, fehler: f };
}

export async function post_offerte(request) {
  if (!cors(request)) return forbidden({ body: { error: 'origin' } });
  let b;
  try { b = await request.body.json(); } catch (e) { return antwort(badRequest, request, { ok: false, error: 'json' }); }
  if (!b || b.version !== 1) return antwort(badRequest, request, { ok: false, error: 'version' });
  const { daten, fotos, fehler } = pruefen(b);
  if (Object.keys(fehler).length) return antwort(badRequest, request, { ok: false, fields: fehler });
  try {
    const eintrag = await auth.elevate(items.insert)(SAMMLUNG, Object.assign({}, daten, { fotos, quelle: 'website', status: 'neu' }));
    /* Annahme bestätigt (gespeichert). Die Benachrichtigung an info.immoready@gmail.com läuft getrennt über eine
       Wix-Automation «Neuer Eintrag in Offertanfragen → E-Mail» und wird separat geprüft. */
    /* notified: false – die E-Mail läuft über die Automation und wird hier nicht bestätigt; die Seite meldet sie deshalb nicht als zugestellt */
    return antwort(ok, request, { ok: true, id: eintrag._id, notified: false });
  } catch (e) {
    console.error('offerte speichern', e);
    return antwort(serverError, request, { ok: false, error: 'speichern' });
  }
}

export async function post_offerteUpload(request) {
  if (!cors(request)) return forbidden({ body: { error: 'origin' } });
  let b;
  try { b = await request.body.json(); } catch (e) { return antwort(badRequest, request, { error: 'json' }); }
  const mime = txt(b && b.mime, 100).toLowerCase(), name = txt(b && b.name, 200).replace(/[^\w.\- ]/g, '_'), size = Number(b && b.size);
  if (!BILDTYPEN.includes(mime) || !(size > 0 && size <= MAX_BYTES)) return antwort(badRequest, request, { error: 'datei' });
  try {
    const r = await auth.elevate(files.generateFileUploadUrl)(mime, { fileName: name || 'foto', filePath: '/offerten', private: true, labels: ['offertanfrage'] });
    return antwort(ok, request, { uploadUrl: r.uploadUrl });
  } catch (e) {
    console.error('upload-url', e);
    return antwort(serverError, request, { error: 'upload' });
  }
}
