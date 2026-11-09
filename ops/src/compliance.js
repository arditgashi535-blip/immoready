'use strict';
// Kanalwahl nach Schweizer UWG und DSG (keine Rechtsberatung; Grundlage für die manuelle Freigabe).
// UWG Art. 3 Abs. 1 lit. o: Massenwerbung per E-Mail ohne vorherige Einwilligung ist unlauter; Angabe
// des korrekten Absenders und einer einfachen, kostenlosen Ablehnungsmöglichkeit sind Pflicht.
// Eine öffentlich publizierte E-Mail-Adresse ist KEINE Einwilligung. Daher Standard: Brief oder
// Kontaktformular/Telefon (Erstkontakt individuell, kein Massenversand); E-Mail nur bei Einwilligung
// oder bestehender Kundenbeziehung (Art. 3 Abs. 1 lit. o, Ausnahme für eigene Kunden mit Hinweis).
const OPT_OUT = {
  immoready: 'Falls Sie keine weiteren Nachrichten von ImmoReady wünschen, genügt eine kurze Antwort oder ein Anruf – wir respektieren das ohne Weiteres.',
  readystudio: 'Falls Sie keine weiteren Nachrichten von Ready Studio wünschen, genügt eine kurze Antwort – wir respektieren das ohne Weiteres.'
};

function recommendChannel({ hasConsent = false, existingCustomer = false, hasPostalAddress = false, hasContactForm = false, hasPhone = false, optOut = false }) {
  if (optOut) return { channel: 'keiner', reason: 'Widerspruch/Sperrliste: kein Kontakt.' };
  if (hasConsent || existingCustomer) return { channel: 'email', reason: hasConsent ? 'Einwilligung liegt vor.' : 'Bestehende Kundenbeziehung (UWG Art. 3 Abs. 1 lit. o, mit Ablehnungsmöglichkeit).' };
  if (hasPostalAddress) return { channel: 'brief', reason: 'Keine Einwilligung für E-Mail-Werbung; persönlicher Brief an die Geschäftsadresse ist der zurückhaltendste zulässige Erstkontakt.' };
  if (hasContactForm) return { channel: 'kontaktformular', reason: 'Keine Einwilligung; einzelne, individuelle Anfrage über das Kontaktformular der Firma (kein Massenversand).' };
  if (hasPhone) return { channel: 'telefon', reason: 'Nur Telefon bekannt; vorher Sterneintrag (keine Werbeanrufe) im Verzeichnis prüfen.' };
  return { channel: 'recherche_offen', reason: 'Keine geeignete Kontaktmöglichkeit belegt.' };
}

function isSuppressed(db, tenant, email) {
  if (!email) return false;
  const e = String(email).toLowerCase().trim();
  const dom = e.split('@')[1] || '';
  return !!db.prepare("SELECT 1 FROM suppression WHERE tenant_id=? AND ((kind='email' AND value=?) OR (kind='domain' AND value=?))").get(tenant, e, dom);
}
// Personendaten nicht in Logs: E-Mail und Telefon maskieren
function redact(s) {
  return String(s == null ? '' : s)
    .replace(/([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/g, '$1***@$2')
    .replace(/(\+41|0041|0)\s?\d{2}[\s\d]{6,10}\d/g, '[Telefon]');
}
module.exports = { recommendChannel, isSuppressed, redact, OPT_OUT };
