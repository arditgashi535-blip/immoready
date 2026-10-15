"""Baut die ImmoReady-Vorschau und die Rundgang-Komponente aus src/ und rise.json.

Ausgaben (dist/):
  immoready-vorschau.html          ganze Website-Vorschau (vollständiges Dokument)
  immoready-relaunch.html          dieselbe Seite ohne doctype/head/body (für die Veröffentlichung als Claude-Artefakt)
  immoready-rundgang-embed.html    Rundgang allein für ein Wix-HTML-iFrame (Alternative)
  embed-test.html                  wie oben, mit Test-Ursprung für tests/t12.js
  component/immoready-tour.js          Web Component <immoready-tour>, Bilder aus assets-base bzw. ./assets/tour/
  component/immoready-tour.inline.js   dieselbe Komponente mit eingebetteten Stationsbildern (eine Datei)
  component/assets/tour/*.webp     Stationsbilder und Materialtexturen (t1-*, t2-*, laub), licht.json (vorab gerechnetes Licht)
  component/demo.html              Testseite mit zwei Instanzen
"""
import base64, json, os, re, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)
sys.path.insert(0, HERE)
from tools.rise import load, tour_config, tour_markup, firm_markup, launch_check  # noqa: E402

RISE = load()  # bricht bei Schemafehlern ab
# Veröffentlichungsstand nur nach bestätigter GmbH-Eintragung und ausdrücklicher Freigabe (docs/VEROEFFENTLICHUNG.md).
# Ohne --release entsteht immer die private Vorschau (noindex, Prüfhinweise, Demo-Hinweis).
if '--release' in sys.argv:
    _open = launch_check(RISE)
    if _open:
        print('Release-Build nicht freigegeben – %d offene Punkte:' % len(_open))
        for _o in _open:
            print('  -', _o)
        sys.exit(1)
    print('Hinweis: Freigabe vorhanden. Vor dem Hochladen Vorschau-Werkzeuge (Demo-Hinweis, Prüfhinweise, Umsetzungsmappe) entfernen – siehe docs/VEROEFFENTLICHUNG.md.')
CFG = tour_config(RISE)
STATIONS = RISE['tour']['stations']


def b64(path, mime):
    with open(path, 'rb') as f:
        return 'data:%s;base64,%s' % (mime, base64.b64encode(f.read()).decode())


def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def write(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(s)


DETAILS = [d for s in STATIONS for d in s.get('details', [])]
STILL_NAMES = [s['still'] for s in STATIONS] + [d['still'] for d in DETAILS]
STILL_FILES = ['assets/tour/%s.webp' % n for n in STILL_NAMES]
PORTRAIT_FILES = ['assets/tour/%s-hoch.webp' % n for n in STILL_NAMES]
for _i, _f in enumerate(STILL_FILES):
    if not os.path.exists(_f):
        print('Hinweis: Detailbild fehlt, verwende das Stationsbild:', _f)
        STILL_FILES[_i] = STILL_FILES[[s['still'] for s in STATIONS].index('station-05-bad')] if 'station-05-bad' in [s['still'] for s in STATIONS] else STILL_FILES[0]
for _i, _f in enumerate(PORTRAIT_FILES):
    if not os.path.exists(_f):
        print('Hinweis: Hochformat-Bild fehlt, verwende Querformat:', _f)
        PORTRAIT_FILES[_i] = STILL_FILES[_i]
STILL_DATA = [b64(f, 'image/webp') for f in STILL_FILES]
PORTRAIT_DATA = [b64(f, 'image/webp') for f in PORTRAIT_FILES]

# Materialtexturen (prozedural, tools/make-textures.py) und vorab gerechnetes Licht (tools/bake-light.js)
TEX_NAMES = {'t1': ['t1-putz', 't1-stein', 't1-rasen', 't1-hecke'], 't2': ['t2-holz', 't2-wandplatten', 't2-bodenplatten', 't2-metall'], 'laub': ['laub']}
TEX_FILES = ['assets/tex/%s.webp' % n for v in TEX_NAMES.values() for n in v]
TEX_DATA = {k: [b64('assets/tex/%s.webp' % n, 'image/webp') for n in v] for k, v in TEX_NAMES.items()}
TEX_DATA['laub'] = TEX_DATA['laub'][0]
BAKE_FILE = 'assets/bake/licht.json'
BAKE = json.load(open(BAKE_FILE)) if os.path.exists(BAKE_FILE) else None
if not BAKE:
    print('Hinweis: kein vorab gerechnetes Licht (assets/bake/licht.json) – der Rundgang rechnet das Licht zur Laufzeit.')
ASSET_JS = '<script>window.IR_TEX=%s;window.IR_BAKE=%s;</script>' % (json.dumps(TEX_DATA), json.dumps(BAKE) if BAKE else 'null')

# Tour-Kern mit Geometrie zusammensetzen
CORE = read('src/tour/tour-core.js').replace('/*{{GEOMETRY}}*/', read('src/tour/geometry.part.js'))
CFG_JS = json.dumps(CFG, ensure_ascii=False, separators=(',', ':'))

# ---------------- Seite ----------------
PARTS = ['p1.html', 'p2.html', 'p3a.html', 'p3b.html', 'p3c.html', 'p3e.html', 'p3f.html', 'p3g.html', 'p3d.html']
# Konfiguration direkt vor dem Hauptskript (p3a), damit <title> und CSS aus p1 am Anfang bleiben
html = ''.join(read('src/' + p) for p in PARTS[:2]) + '<script>window.IR_RISE={{CFG}};</script>' + ''.join(read('src/' + p) for p in PARTS[2:])
html = html.replace('<!--{{RISE_TOUR}} (erzeugt aus rise.json durch build.py)-->', tour_markup(RISE, lambda i, s, portrait: PORTRAIT_DATA[i] if portrait else STILL_DATA[i]))
html = html.replace('/*{{TOUR_CORE}}*/', CORE)
# Unternehmensangaben (GmbH in Gründung bzw. eingetragen) überall aus rise.json → firm.company
FIRM = firm_markup(RISE)
CO = RISE['firm']['company']
LIVE_OK = CO['goLiveApproved'] and CO['status'] == 'eingetragen'
# Bis zur Freigabe: Suchmaschinen ausschliessen (ersetzt keinen Zugriffsschutz – siehe docs/VEROEFFENTLICHUNG.md)
ROBOTS = '' if LIVE_OK else '<meta name="robots" content="noindex,nofollow,noarchive">'


def firm(h):
    h = h.replace('<!--{{FIRM_IMPRINT}} (Unternehmensangaben aus rise.json → firm.company, erzeugt durch build.py)-->', FIRM['imprint'])
    h = h.replace('<!--{{FIRM_PRIVACY}}-->', FIRM['privacy']).replace('<!--{{FIRM_ADDRESS_NOTE}}-->', FIRM['address_note'])
    h = h.replace('<!--{{FIRM_FOOTER}}-->', FIRM['footer']).replace('{{FIRM_ROLE}}', RISE['firm']['role'])
    return h


html = firm(html)
html = html.replace('{{LOGOO}}', b64('assets/logo_orig.png', 'image/png')).replace('{{FAV}}', b64('assets/fav.png', 'image/png'))
html = html.replace('window.IR_RISE={{CFG}};', 'window.IR_RISE=' + CFG_JS + ';', 1)
assert '{{' not in html, 'Platzhalter übrig: ' + html[html.index('{{'):html.index('{{') + 40]
# Texturen und Lichtdaten ans Ende: Text, Standbild und Bedienung sind vorher vollständig geladen
html += ASSET_JS
write('dist/immoready-relaunch.html', html)
write('dist/immoready-vorschau.html', '<!doctype html><html lang="de-CH"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' + ROBOTS + '</head><body>' + html + '</body></html>')
print('Seite:', len(html), 'Zeichen')

# ---------------- iFrame-Einbettung (Alternative) ----------------
EMB_CSS = "<style>.skip,.demo,.hdr,.mnav,.mbar,.ftr,footer,main>[data-page]:not([data-page=start]),[data-page=start]>*:not(#reise),.jr-skip-a,.jr-skip-l,.jr .tlink{display:none!important}body{background:#252321}.jr-live .jr-sticky{top:0}.jr-ui{padding-top:40px!important}</style>"


def embed(origins, name):
    head = '<script>window.IR_EMBED=1;window.IR_ALLOWED_ORIGINS=' + json.dumps(origins) + ';</script>'
    write('dist/' + name, '<!doctype html><html lang="de-CH"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"></head><body>' + head + EMB_CSS + html + '</body></html>')


embed(RISE['wix']['allowedOrigins'], 'immoready-rundgang-embed.html')
embed(['http://127.0.0.1:8701'], 'embed-test.html')

# ---------------- Web Component ----------------
p1 = read('src/p1.html')
css = p1[p1.index('<style>') + 7:p1.rindex('</style>')]
css = css.replace(':root', ':host')
css += ('\n/* Komponente */\n:host{display:block;position:relative}'
        ':host(:not([mode="scroll"])){height:var(--irt-height,100vh);min-height:480px}'
        '.irt{height:100%;font-family:"Archivo",system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--ink);-webkit-font-smoothing:antialiased;line-height:1.5}'
        '.irt *,.irt *::before,.irt *::after{box-sizing:border-box}'
        ':host(:not([mode="scroll"])) .jr,:host(:not([mode="scroll"])) .jr-sticky{height:100%!important}'
        ':host(:not([mode="scroll"])) .jr.jr-static{overflow:auto}'
        '.irt .jr-ui{padding-top:32px!important}')
markup = tour_markup(RISE, lambda i, s, portrait: ('{{STILLP:%d}}' if portrait else '{{STILL:%d}}') % i, inline_arrow=True, page=False)
markup = markup.replace('<h1 id="h-hero"', '<h2 id="h-hero"').replace('</h1>', '</h2>')
element = read('src/tour/tour-element.js')


def bundle(inline):
    head = ('/*! ImmoReady <immoready-tour> V%s · erzeugt aus rise.json · eigenes WebGL, keine Bibliothek */\n(function(){\n' % CFG['version'])
    head += 'var CONFIG_TAG=%s;\n' % json.dumps(RISE['webcomponent']['tag'])
    head += 'var CONFIG=%s;\n' % CFG_JS
    head += 'var STILLS=%s;\n' % json.dumps(STILL_NAMES)
    head += 'var STILLS_INLINE=%s;\n' % (json.dumps({'l': STILL_DATA, 'p': PORTRAIT_DATA}) if inline else 'null')
    head += 'var TEX_NAMES=%s;\n' % json.dumps(TEX_NAMES)
    head += 'var TEX_INLINE=%s;\n' % (json.dumps(TEX_DATA) if inline else 'null')
    head += 'var BAKE_INLINE=%s;\n' % (json.dumps(BAKE) if (inline and BAKE) else 'null')
    head += 'var CSS=%s;\n' % json.dumps(css, ensure_ascii=False)
    head += 'var MARKUP=%s;\n' % json.dumps(markup, ensure_ascii=False)
    return head + CORE + '\n' + element + '\n})();\n'


write('dist/component/immoready-tour.js', bundle(False))
write('dist/component/immoready-tour.inline.js', bundle(True))
os.makedirs('dist/component/assets/tour', exist_ok=True)
for f in sorted(set(STILL_FILES + PORTRAIT_FILES + TEX_FILES)):
    shutil.copy(f, 'dist/component/assets/tour/')
if BAKE:
    shutil.copy(BAKE_FILE, 'dist/component/assets/tour/licht.json')
write('dist/component/demo.html', read('src/tour/demo.html'))
print('Komponente:', os.path.getsize('dist/component/immoready-tour.js'), 'Bytes (inline:', os.path.getsize('dist/component/immoready-tour.inline.js'), ')')


# ---------------- Produktionsform: getrennte Dateien (dist/site/) ----------------
# Dieselbe Seite wie die Vorschau, aber ohne eingebettete Base64-Blöcke: HTML, site.css, site.js und assets/
# (Stationsbilder, Texturen und Lichtdaten werden erst bei Bedarf geladen; Fotos als eigene Dateien).
def build_site():
    out = 'dist/site/'
    if os.path.isdir(out):
        shutil.rmtree(out)
    for d in ('assets/tour', 'assets/tex', 'assets/img', 'assets/bake'):
        os.makedirs(out + d, exist_ok=True)
    h = ''.join(read('src/' + p) for p in PARTS[:2]) + '<script>window.IR_RISE={{CFG}};</script>' + ''.join(read('src/' + p) for p in PARTS[2:])
    h = h.replace('<!--{{RISE_TOUR}} (erzeugt aus rise.json durch build.py)-->',
                  tour_markup(RISE, lambda i, s, portrait: 'assets/tour/' + os.path.basename(PORTRAIT_FILES[i] if portrait else STILL_FILES[i])))
    h = firm(h.replace('/*{{TOUR_CORE}}*/', CORE)).replace('{{LOGOO}}', 'assets/logo_orig.png').replace('{{FAV}}', 'assets/fav.png')
    h = h.replace('window.IR_RISE={{CFG}};', 'window.IR_RISE=' + CFG_JS + ';', 1)
    i = h.index('var PH=')
    j = h.index('};', i)
    ph = json.loads(h[i + 7:j + 1])
    for k, v in ph.items():
        mime, data = v.split(',', 1)
        ext = 'jpg' if 'jpeg' in mime else ('webp' if 'webp' in mime else 'png')
        with open(out + 'assets/img/%s.%s' % (k, ext), 'wb') as f:
            f.write(base64.b64decode(data))
        ph[k] = 'assets/img/%s.%s' % (k, ext)
    h = h[:i] + 'var PH=' + json.dumps(ph) + h[j + 1:]
    a = h.index('<style>')
    b = h.index('</style>', a)
    write(out + 'site.css', h[a + 7:b])
    head, body = h[:a], h[b + 8:]
    ms = max(re.finditer(r'<script>(.*?)</script>', body, re.S), key=lambda m: len(m.group(1)))
    write(out + 'site.js', ms.group(1))
    body = body[:ms.start()] + '<script src="site.js"></script>' + body[ms.end():]
    assert 'base64,' not in body and 'base64,' not in read(out + 'site.js'), 'Produktionsform enthält noch Base64-Daten'
    assert '{{' not in body
    tex = {k: ['assets/tex/%s.webp' % n for n in v] for k, v in TEX_NAMES.items()}
    tex['laub'] = tex['laub'][0]
    body += '<script>window.IR_TEX=%s;window.IR_BAKE=%s;</script>' % (json.dumps(tex), json.dumps('assets/bake/licht.json' if BAKE else None))
    write(out + 'index.html', '<!doctype html><html lang="de-CH"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
          + ROBOTS + head + '<link rel="stylesheet" href="site.css"></head><body>' + body + '</body></html>')
    if not LIVE_OK:
        write(out + 'robots.txt', 'User-agent: *\nDisallow: /\n')
    for f in sorted(set(STILL_FILES + PORTRAIT_FILES)):
        shutil.copy(f, out + 'assets/tour/')
    for f in TEX_FILES:
        shutil.copy(f, out + 'assets/tex/')
    if BAKE:
        shutil.copy(BAKE_FILE, out + 'assets/bake/licht.json')
    shutil.copy('assets/logo_orig.png', out + 'assets/')
    shutil.copy('assets/fav.png', out + 'assets/')
    tot = sum(os.path.getsize(os.path.join(r, x)) for r, _, fs in os.walk(out) for x in fs)
    print('Produktionsform dist/site/: index.html %d Bytes, site.css %d, site.js %d, gesamt %d Bytes' % (
        os.path.getsize(out + 'index.html'), os.path.getsize(out + 'site.css'), os.path.getsize(out + 'site.js'), tot))


build_site()
