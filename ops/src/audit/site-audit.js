'use strict';
// Schonende Website-Prüfung (nur Startseite, wie ein normaler Besucher): robots.txt beachten, eine
// Seitenansicht im Browser (Handy 390 px) + Auswertung des ausgelieferten HTML. Keine Formularübermittlung,
// keine Sicherheits-Scans, keine Last. Jeder Befund trägt einen überprüfbaren Beleg (evidence).
const { politeGet } = require('../research/fetch');

function analyzeHtml(html, { finalUrl } = {}) {
  const h = String(html || '');
  const pick = re => { const m = h.match(re); return m ? m[1].replace(/\s+/g, ' ').trim() : null; };
  const title = pick(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const desc = pick(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i) || pick(/<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const viewport = /<meta[^>]+name=["']viewport["']/i.test(h);
  const lang = pick(/<html[^>]*\slang=["']([^"']+)["']/i);
  const h1 = (h.match(/<h1[\s>]/gi) || []).length;
  const imgs = h.match(/<img\b[^>]*>/gi) || [];
  const imgNoAlt = imgs.filter(t => !/\salt=/i.test(t)).length;
  const forms = (h.match(/<form\b/gi) || []).length;
  const tel = /href=["']tel:/i.test(h), mailto = /href=["']mailto:/i.test(h);
  const impressum = /impressum|imprint|rechtliche|legal/i.test(h), privacy = /datenschutz|privacy/i.test(h);
  const ldjson = /application\/ld\+json/i.test(h);
  const years = (h.match(/(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?(20\d{2})/gi) || []).map(s => Number(s.match(/(20\d{2})/)[1]));
  const generator = pick(/<meta[^>]+name=["']generator["'][^>]*content=["']([^"']*)["']/i);
  const https = finalUrl ? finalUrl.startsWith('https://') : null;
  return { title, desc, viewport, lang, h1, imgs: imgs.length, imgNoAlt, forms, tel, mailto, impressum, privacy, ldjson, copyrightYear: years.length ? Math.max(...years) : null, generator, https };
}

// Befunde nur aus Messwerten; Formulierungen sachlich, ohne Wertung der Firma.
function findingsFrom(a, m, at) {
  const f = [];
  const add = (code, severity, text, evidence) => f.push({ code, severity, text, evidence, measured_at: at });
  if (m && m.overflowPx > 8) add('mobile_overflow', 'hoch', `Auf einem Smartphone (390 px Breite) lässt sich die Seite ${m.overflowPx} px seitlich verschieben; Inhalte ragen über den Bildschirmrand.`, `seitlich scrollbar um ${m.overflowPx} px (scrollWidth − clientWidth, ohne overflow-x:hidden) bei 390 px Ansicht`);
  if (!a.viewport) add('no_viewport', 'hoch', 'Die Seite enthält keine Viewport-Angabe für Mobilgeräte; Smartphones zeigen sie dadurch verkleinert an.', 'kein <meta name="viewport">');
  if (m && m.loadMs > 6000) add('slow_load', m.loadMs > 10000 ? 'hoch' : 'mittel', `Die Startseite brauchte in unserer Messung ${(m.loadMs / 1000).toFixed(1)} s bis zum vollständigen Laden.`, `load-Ereignis nach ${m.loadMs} ms (einmalige Messung, Rechenzentrum)`);
  if (m && m.bytes > 5e6) add('heavy_page', 'mittel', `Die Startseite lädt rund ${(m.bytes / 1e6).toFixed(1)} MB Daten.`, `übertragene Datenmenge ${m.bytes} Bytes`);
  if (!a.forms && !(m && m.formSeen)) add('no_form', 'niedrig', 'Auf der Startseite ist kein Kontakt- oder Anfrageformular vorhanden.', 'kein <form>-Element auf der Startseite');
  if (!a.tel && !(m && m.telSeen)) add('no_tel_link', 'mittel', 'Die Telefonnummer ist auf der Startseite nicht als antippbarer Link hinterlegt.', 'kein tel:-Link auf der Startseite');
  if (!a.title) add('no_title', 'hoch', 'Die Seite hat keinen Titel (wird in Google und im Browser-Tab angezeigt).', 'kein <title>');
  else if (a.title.length < 15 || a.title.length > 70) add('title_length', 'niedrig', `Der Seitentitel ist ${a.title.length} Zeichen lang («${a.title.slice(0, 80)}»); empfehlenswert sind etwa 30–60 Zeichen mit Leistung und Ort.`, `<title> mit ${a.title.length} Zeichen`);
  if (!a.desc) add('no_meta_desc', 'mittel', 'Es fehlt eine Meta-Beschreibung; Google wählt den Vorschautext dann selbst aus.', 'kein <meta name="description">');
  if (a.h1 === 0 && !(m && m.h1 > 0)) add('no_h1', 'mittel', 'Die Startseite hat keine Hauptüberschrift (H1).', '0 <h1>-Elemente');
  if (a.h1 > 1) add('multi_h1', 'niedrig', `Die Startseite hat ${a.h1} Hauptüberschriften (H1).`, `${a.h1} <h1>-Elemente`);
  if (a.imgs >= 3 && a.imgNoAlt / a.imgs >= 0.3) add('img_alt', 'mittel', `${a.imgNoAlt} von ${a.imgs} Bildern haben keinen Alternativtext (wichtig für Barrierefreiheit und Bildersuche).`, `${a.imgNoAlt}/${a.imgs} <img> ohne alt`);
  if (!a.lang) add('no_lang', 'niedrig', 'Die Sprache der Seite ist nicht ausgezeichnet (wichtig für Screenreader).', 'kein lang-Attribut am <html>');
  if (a.https === false) add('no_https', 'hoch', 'Die Seite wird ohne HTTPS ausgeliefert; Browser zeigen dann den Hinweis «Nicht sicher».', 'Endadresse beginnt mit http://');
  if (!a.impressum) add('no_impressum_link', 'mittel', 'Auf der Startseite ist kein Link zum Impressum erkennbar.', 'kein «Impressum» im HTML der Startseite');
  if (!a.privacy) add('no_privacy_link', 'mittel', 'Auf der Startseite ist kein Link zur Datenschutzerklärung erkennbar (revDSG seit 1.9.2023).', 'kein «Datenschutz» im HTML der Startseite');
  if (a.copyrightYear && a.copyrightYear <= new Date().getFullYear() - 3) add('stale_copyright', 'niedrig', `Der Copyright-Hinweis nennt das Jahr ${a.copyrightYear}; Besucher könnten die Seite für nicht mehr gepflegt halten.`, `© ${a.copyrightYear}`);
  if (!a.ldjson) add('no_structured_data', 'info', 'Keine strukturierten Daten (Schema.org) für Google gefunden.', 'kein application/ld+json');
  if (m && m.consoleErrors > 0) add('js_errors', 'niedrig', `Beim Laden traten ${m.consoleErrors} Skriptfehler auf.`, `${m.consoleErrors} Konsolenfehler`);
  return f;
}

function improvementsFrom(findings) {
  const map = {
    mobile_overflow: 'Mobile Darstellung korrigieren, damit nichts seitlich verrutscht', no_viewport: 'Seite für Smartphones optimieren (responsives Layout)',
    slow_load: 'Ladezeit senken (Bilder komprimieren, unnötige Skripte entfernen)', heavy_page: 'Bilder und Videos für das Web verkleinern',
    no_form: 'Einfaches Anfrageformular ergänzen, das direkt im Postfach bzw. CRM landet', no_tel_link: 'Telefonnummer als Klick-zum-Anrufen-Link einbauen',
    no_title: 'Aussagekräftigen Seitentitel mit Leistung und Ort setzen', title_length: 'Seitentitel auf Leistung + Ort zuschneiden', no_meta_desc: 'Meta-Beschreibungen für die wichtigsten Seiten schreiben',
    no_h1: 'Klare Hauptüberschrift mit dem Kernangebot', img_alt: 'Alternativtexte für Bilder ergänzen', no_impressum_link: 'Impressum gut sichtbar verlinken',
    no_privacy_link: 'Datenschutzerklärung nach revDSG ergänzen und verlinken', no_https: 'HTTPS aktivieren', stale_copyright: 'Inhalte und Fusszeile aktualisieren',
    no_structured_data: 'Strukturierte Daten (LocalBusiness) für Google ergänzen', multi_h1: 'Überschriften-Struktur bereinigen', no_lang: 'Sprache im Code auszeichnen', js_errors: 'Skriptfehler beheben'
  };
  const order = { hoch: 0, mittel: 1, niedrig: 2, info: 3 };
  return [...findings].sort((a, b) => order[a.severity] - order[b.severity]).map(x => map[x.code]).filter(Boolean).filter((v, i, s) => s.indexOf(v) === i).slice(0, 3);
}
const SERVICES = {
  mobile_overflow: 'Webdesign / Responsive Relaunch', no_viewport: 'Webdesign / Responsive Relaunch', slow_load: 'Performance-Optimierung', heavy_page: 'Performance-Optimierung',
  no_form: 'Anfrageformular mit CRM-Anbindung', no_tel_link: 'Conversion-Optimierung', no_title: 'SEO-Grundpaket', title_length: 'SEO-Grundpaket', no_meta_desc: 'SEO-Grundpaket', no_h1: 'SEO-Grundpaket',
  img_alt: 'Barrierefreiheit', no_lang: 'Barrierefreiheit', no_impressum_link: 'Rechtliche Seiten (Impressum/Datenschutz)', no_privacy_link: 'Rechtliche Seiten (Impressum/Datenschutz)', no_https: 'Technische Wartung', stale_copyright: 'Website-Pflege', no_structured_data: 'SEO-Grundpaket', js_errors: 'Technische Wartung'
};
function servicesFrom(findings) { return [...new Set(findings.filter(f => f.severity !== 'info').map(f => SERVICES[f.code]).filter(Boolean))]; }

// Browser-Messung (eine Seitenansicht als Smartphone). browser = Playwright-Browser (von aussen, wiederverwendet)
async function measure(browser, url) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, userAgent: require('../research/fetch').UA });
  const page = await ctx.newPage();
  let bytes = 0, consoleErrors = 0;
  page.on('response', async r => { const l = Number(r.headers()['content-length']); if (l) bytes += l; });
  page.on('pageerror', () => { consoleErrors++; });
  const t0 = Date.now();
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    const loadMs = Date.now() - t0;
    await page.waitForTimeout(800);
    const d = await page.evaluate(() => { const de = document.documentElement, ox = e => getComputedStyle(e).overflowX; const clipped = ['hidden', 'clip'].includes(ox(de)) || ['hidden', 'clip'].includes(ox(document.body)); const sx = clipped ? 0 : Math.max(0, de.scrollWidth - de.clientWidth); return { scrollX: sx, scrollWidth: document.documentElement.scrollWidth, formSeen: !!document.querySelector('form, iframe[src*="form"]'), telSeen: !!document.querySelector('a[href^="tel:"]'), h1: document.querySelectorAll('h1').length, html: document.documentElement.outerHTML.slice(0, 2e6) }; });
    return { ok: true, loadMs, bytes, consoleErrors, scrollWidth: d.scrollWidth, overflowPx: d.scrollX, formSeen: d.formSeen, telSeen: d.telSeen, h1: d.h1, renderedHtml: d.html, finalUrl: page.url() };
  } catch (e) {
    return { ok: false, error: String(e.message).slice(0, 200) };
  } finally { await ctx.close(); }
}

async function auditSite(browser, url) {
  const at = new Date().toISOString();
  const raw = await politeGet(url, { delayMs: 1000 }).catch(e => ({ error: e.message }));
  if (raw.skipped) return { url, reachable: null, skipped: 'robots', measured_at: at, findings: [] };
  if (raw.error || !raw.status || raw.status >= 400) return { url, reachable: false, status: raw.status || null, error: raw.error || null, measured_at: at, findings: [] };
  const m = browser ? await measure(browser, raw.url) : null;
  // Viele Baukästen rendern Inhalte erst per Skript: für Struktur-Merkmale das gerenderte HTML verwenden, für Viewport/Title das ausgelieferte
  const a = analyzeHtml(m && m.ok ? m.renderedHtml : raw.body, { finalUrl: raw.url });
  const a0 = analyzeHtml(raw.body, { finalUrl: raw.url });
  a.viewport = a.viewport || a0.viewport;
  const findings = findingsFrom(a, m && m.ok ? m : null, at);
  return {
    url, final_url: raw.url, reachable: true, status: raw.status, measured_at: at, generator: a.generator, title: a.title,
    mobile_ok: m && m.ok ? (m.overflowPx <= 8 && a.viewport) : (a.viewport ? null : false), contact_form: a.forms > 0 || !!(m && m.formSeen), load_ms: m && m.ok ? m.loadMs : null,
    findings, improvements: improvementsFrom(findings), services: servicesFrom(findings), html_text: (m && m.ok ? m.renderedHtml : raw.body)
  };
}
module.exports = { analyzeHtml, findingsFrom, improvementsFrom, servicesFrom, auditSite, measure };
