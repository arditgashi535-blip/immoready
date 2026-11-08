'use strict';
// Parser für öffentliche Ergebnislisten von search.ch/tel (Pfad /tel/<ort>/<rubrik>, laut robots.txt erlaubt).
// Sterneintrag («* Wünscht keine Werbung») wird erfasst: solche Firmen werden NICHT angeschrieben (UWG Art. 3 Abs. 1 lit. u).
const dec = s => String(s || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

function parseSearchCh(html, sourceUrl) {
  const out = [];
  const parts = String(html).split('<article class="tel-resultentry').slice(1);
  for (const p of parts) {
    const a = p.slice(0, p.indexOf('</article>') > 0 ? p.indexOf('</article>') : undefined);
    const m = (re) => { const x = a.match(re); return x ? dec(x[1]) : null; };
    const name = m(/<h1><a [^>]*>([\s\S]*?)<\/a><\/h1>/);
    if (!name || /^(gelöscht|geloescht|anonym|unbekannt)$/i.test(name)) continue; // gelöschte/anonymisierte Einträge nie verwenden
    const detail = (a.match(/<h1><a href="([^"]+)"/) || [])[1];
    const web = (a.match(/class="tel-result-action sl-icon-website" href="([^"]+)"/) || [])[1] || null;
    const phone = m(/class="value tel-callable"[^>]*>([^<]+)<\/a>/);
    out.push({
      name, categories: m(/<div class="tel-categories">([\s\S]*?)<\/div>/), occupation: m(/<div class="tel-occupation">([\s\S]*?)<\/div>/),
      street: m(/<div class="tel-address">([^<,]*),/), zip: m(/<span class="postal-code">(\d{4})<\/span>/), locality: m(/<span class="locality">([^<]+)<\/span>/),
      region: m(/<span class="region">([A-Z]{2})<\/span>/), phone, no_advertising: /Wünscht keine Werbung/.test(a),
      website: web && /^https?:\/\//.test(web) ? web : null, source: detail ? 'https://search.ch' + detail : sourceUrl
    });
  }
  return out;
}
module.exports = { parseSearchCh, dec };
