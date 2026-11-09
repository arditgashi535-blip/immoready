"""Release-Fassung mit Dateien über ein CDN (jsDelivr aus dem GitHub-Repository).

Wix hostet dann nur die Startdatei index.html; Stil, Skript, Bilder, Texturen und Lichtdaten kommen über
https://cdn.jsdelivr.net/gh/<repo>@<tag>/dist-release/cdn/ (fester Git-Tag → unveränderliche Adressen, CORS erlaubt).

Aufruf (nach python3 build.py --release):
  python3 tools/cdn-release.py <tag>          → dist-release/cdn/ (index.html, site.css, site.js, assets/)
"""
import os, re, shutil, sys

REPO = 'arditgashi535-blip/immoready'
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(HERE, 'dist-release/site')
OUT = os.path.join(HERE, 'dist-release/cdn')


def absolutize(text, base):
    # relative Verweise in Attributen, srcset-Listen, JS-Zeichenketten und CSS url()
    text = re.sub(r'(?<=["\'(,\s])(?:\./)?(assets/[A-Za-z0-9_./-]+)', lambda m: base + m.group(1), text)
    text = re.sub(r'(?<=["\'])(site\.(?:css|js))(?=["\'])', lambda m: base + m.group(1), text)
    return text


def main():
    if len(sys.argv) != 2 or not re.fullmatch(r'[A-Za-z0-9._-]+', sys.argv[1]):
        sys.exit('Aufruf: python3 tools/cdn-release.py <git-tag>')
    base = 'https://cdn.jsdelivr.net/gh/%s@%s/dist-release/cdn/' % (REPO, sys.argv[1])
    assert os.path.exists(os.path.join(SRC, 'index.html')), 'zuerst python3 build.py --release'
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    shutil.copytree(SRC, OUT)
    for name in ('index.html', 'site.js', 'site.css'):
        p = os.path.join(OUT, name)
        with open(p, encoding='utf-8') as f:
            t = absolutize(f.read(), base)
        left = re.findall(r'(?<=["\'(,\s])(?:\./)?assets/[A-Za-z0-9_./-]+', t)
        assert not left, '%s: relative Verweise übrig: %s' % (name, left[:3])
        with open(p, 'w', encoding='utf-8') as f:
            f.write(t)
    refs = set()
    for name in ('index.html', 'site.js', 'site.css'):
        with open(os.path.join(OUT, name), encoding='utf-8') as f:
            refs |= set(re.findall(re.escape(base) + r'([A-Za-z0-9_./-]+)', f.read()))
    missing = [r for r in refs if not os.path.exists(os.path.join(OUT, r))]
    assert not missing, 'Verweise ohne Datei: %s' % missing[:5]
    print('CDN-Fassung: %s (%d Verweise, Basis %s)' % (os.path.relpath(OUT, HERE), len(refs), base))


if __name__ == '__main__':
    main()
