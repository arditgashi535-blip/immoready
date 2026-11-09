"""Release-Fassung mit Dateien über ein CDN (jsDelivr aus dem GitHub-Repository).

Wix hostet dann nur die Startdatei index.html; Stil, Skript, Bilder, Texturen und Lichtdaten kommen über
https://cdn.jsdelivr.net/gh/<repo>@<commit>/dist-release/cdn/ (feste Commits → unveränderliche Adressen, CORS erlaubt).

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
    if len(refs_in) not in (1, 2) or not all(re.fullmatch(r'[0-9a-f]{40}', r) for r in refs_in):
        sys.exit('Aufruf: python3 tools/cdn-release.py <assets-commit> [<code-commit>]  (volle 40-stellige Commit-IDs)')
    url = lambda c: 'https://cdn.jsdelivr.net/gh/%s@%s/dist-release/cdn/' % (REPO, c)
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


if __name__ == '__main__':
    main()
