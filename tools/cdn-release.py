"""Release-Fassung mit Dateien über ein CDN (jsDelivr aus dem GitHub-Repository).

Wix hostet dann nur die Startdatei index.html; Stil, Skript, Bilder, Texturen und Lichtdaten kommen über
https://cdn.jsdelivr.net/gh/<repo>@<commit>/ – Commits des schlanken Zweigs «cdn-site», der nur die Website-Dateien enthält
(jsDelivr: Repository-Stand höchstens 50 MB). Feste Commits → unveränderliche Adressen, CORS erlaubt.

Aufruf (nach python3 build.py --release), zweistufig, weil eine Datei nicht ihren eigenen Commit kennen kann:
  python3 tools/cdn-release.py <assets-commit>                  Bilder/Texturen/Lichtdaten aus <assets-commit>
  python3 tools/cdn-release.py <assets-commit> <code-commit>    zusätzlich site.css/site.js aus <code-commit>
  → dist-release/cdn/ (index.html für Wix, site.css, site.js, assets/)
"""
import os, re, shutil, sys

REPO = 'arditgashi535-blip/immoready'
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(HERE, 'dist-release/site')
OUT = os.path.join(HERE, 'dist-release/cdn')


def absolutize(text, base, code_base):
    # relative Verweise in Attributen, srcset-Listen, JS-Zeichenketten und CSS url()
    text = re.sub(r'(?<=["\'(,\s])(?:\./)?(assets/[A-Za-z0-9_./-]+)', lambda m: base + m.group(1), text)
    text = re.sub(r'(?<=["\'])(site\.(?:css|js))(?=["\'])', lambda m: code_base + m.group(1), text)
    return text


def main():
    refs_in = sys.argv[1:]
    refs_in = refs_in[:2]
    if len(refs_in) not in (1, 2) or not all(re.fullmatch(r'[0-9a-f]{40}', r) for r in refs_in):
        sys.exit('Aufruf: python3 tools/cdn-release.py <assets-commit> [<code-commit>]  (volle 40-stellige Commit-IDs)')
    # Pfad der Dateien im Repository zum gepinnten Commit. Standard: eigener schlanker Zweig «cdn-site» mit den Dateien im Wurzelordner
    # (jsDelivr liefert nur aus Repository-Ständen unter 50 MB; der Hauptzweig ist grösser). IR_CDN_PREFIX=dist-release/cdn/ für das alte Schema.
    prefix = os.environ.get('IR_CDN_PREFIX', '')
    url = lambda c: 'https://cdn.jsdelivr.net/gh/%s@%s/%s' % (REPO, c, prefix)
    base, code_base = url(refs_in[0]), url(refs_in[-1])
    assert os.path.exists(os.path.join(SRC, 'index.html')), 'zuerst python3 build.py --release'
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    shutil.copytree(SRC, OUT)
    for name in ('index.html', 'site.js', 'site.css'):
        p = os.path.join(OUT, name)
        with open(p, encoding='utf-8') as f:
            t = absolutize(f.read(), base, code_base)
        left = re.findall(r'(?<=["\'(,\s])(?:\./)?assets/[A-Za-z0-9_./-]+', t)
        assert not left, '%s: relative Verweise übrig: %s' % (name, left[:3])
        with open(p, 'w', encoding='utf-8') as f:
            f.write(t)
    refs = set()
    for name in ('index.html', 'site.js', 'site.css'):
        with open(os.path.join(OUT, name), encoding='utf-8') as f:
            t = f.read()
            refs |= set(re.findall(re.escape(base) + r'([A-Za-z0-9_./-]+)', t)) | set(re.findall(re.escape(code_base) + r'([A-Za-z0-9_./-]+)', t))
    missing = [r for r in refs if not os.path.exists(os.path.join(OUT, r))]
    assert not missing, 'Verweise ohne Datei: %s' % missing[:5]
    print('CDN-Fassung: %s (%d Verweise, Basis %s)' % (os.path.relpath(OUT, HERE), len(refs), base))
    # Startdatei für Wix: lädt die vollständige index.html vom CDN und ersetzt das Dokument damit (Hash-Adressen bleiben).
    # Ab der dritten Stufe (<page-commit> enthält index.html) wird sie mit erzeugt.
    if len(sys.argv) == 4:
        page = url(sys.argv[3]) + 'index.html'
        with open(os.path.join(OUT, 'wix-index.html'), 'w', encoding='utf-8') as f:
            f.write(LOADER.replace('{{PAGE}}', page).replace('{{FAV}}', base + 'assets/fav.png'))
        print('Startdatei für Wix: dist-release/cdn/wix-index.html → %s' % page)


LOADER = '''<!doctype html><html lang="de-CH"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>ImmoReady – Hauswartung, Sanitär &amp; Immobilienservice in Zürich und Aargau</title>
<meta name="description" content="Familienbetrieb für Hauswartung, Sanitär und Unterhalt in Zürich und Aargau – dazu Garten, Reinigung, Räumung und Vermarktung. Persönlich betreut.">
<link rel="icon" type="image/png" href="{{FAV}}">
<style>body{margin:0;background:#FCF8F5;color:#3B3A39;font:16px/1.5 system-ui,sans-serif}.ld{padding:48px 16px;text-align:center}.ld a{color:#7E6343}</style>
</head><body><p class="ld" id="ld">ImmoReady wird geladen …</p>
<noscript><p class="ld">ImmoReady · Hauswartung, Sanitär und Unterhalt in Zürich und Aargau · <a href="tel:+41763404401">076 340 44 01</a> · <a href="mailto:info.immoready@gmail.com">info.immoready@gmail.com</a></p></noscript>
<script>
(function () {
  fetch('{{PAGE}}').then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(function (t) { document.open(); document.write(t); document.close(); })
    .catch(function () { document.getElementById('ld').innerHTML = 'Die Seite konnte nicht geladen werden. Kontakt: <a href="tel:+41763404401">076 340 44 01</a> · <a href="mailto:info.immoready@gmail.com">info.immoready@gmail.com</a>'; });
})();
</script></body></html>
'''


if __name__ == '__main__':
    main()
