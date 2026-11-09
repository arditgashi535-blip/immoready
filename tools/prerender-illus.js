// Schreibt die Fotos der Startseite direkt ins HTML der Release-Fassung (dist-release/site/index.html).
// Bisher erzeugte erst site.js die <img>-Elemente: Das Startbild (grösstes Element) konnte erst nach Laden und Ausführen
// des Skripts beginnen zu laden, und ohne JavaScript gab es keine Bilder. Das Skript füllt nur leere Bildflächen
// (paintIllus: «if(!el.firstChild)»), vorgerenderte Flächen bleiben also unverändert.
// Nur Fotos (img.ph) im Abschnitt data-page="start"; das erste (Startbild) mit fetchpriority="high", alle weiteren lazy.
// Aufruf: node tools/prerender-illus.js dist-release/site/index.html   (build.py --release ruft das selbst auf)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');

(async () => {
  const file = path.resolve(process.argv[2] || 'dist-release/site/index.html');
  let html = fs.readFileSync(file, 'utf8');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.route(/^https?:\/\//, r => r.abort());               // keine externen Abrufe (Schriften, Wix) beim Vorrendern
  await p.goto('file://' + file + '#start', { waitUntil: 'load' }); await p.waitForTimeout(800);
  const filled = await p.evaluate(() => [...document.querySelectorAll('[data-page="start"] [data-illu]')].map(el => ({ k: el.getAttribute('data-illu'), h: el.innerHTML })));
  await b.close();
  let n = 0, first = true;
  const seen = {};
  html = html.replace(/<div class="illu" data-illu="([a-z0-9]+)"><\/div>/g, (m, k, off) => {
    const start = html.indexOf('data-page="start"'), end = html.indexOf('data-page="leistung"');
    if (off < start || off > end) return m;                    // nur Startseite
    const i = seen[k] = (seen[k] || 0) + 1;
    const f = filled.filter(x => x.k === k)[i - 1];
    if (!f || !/^<img class="ph"/.test(f.h)) return m;         // nur Fotos, keine Zeichnungen
    n++;
    let img = f.h.replace('<img class="ph"', first ? '<img class="ph" fetchpriority="high"' : '<img class="ph" loading="lazy"');
    // Startbild mit Handy-Variante, sofern build.py sie erzeugt hat
    if (first && /src="assets\/img\/hero\.webp"/.test(img) && fs.existsSync(path.join(path.dirname(file), 'assets/img/hero-800.webp')))
      img = img.replace('src="assets/img/hero.webp"', 'src="assets/img/hero.webp" srcset="assets/img/hero-800.webp 800w, assets/img/hero.webp 1200w" sizes="100vw"');
    first = false;
    return '<div class="illu" data-illu="' + k + '">' + img + '</div>';
  });
  fs.writeFileSync(file, html);
  console.log('prerender-illus: ' + n + ' Fotos der Startseite ins HTML geschrieben (' + path.relative(process.cwd(), file) + ')');
  if (!n) process.exitCode = 1;
})();
