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
from tools.rise import load, tour_config, tour_markup, firm_markup, launch_check, careers_markup, photo_credits, videos_markup, video_slots, LIVE_STATUS, seo_head  # noqa: E402

# IR_RISE / IR_DIST nur für Prüfungen (andere Quelldatei, anderer Ausgabeordner); normal: rise.json → dist/
RISE = load(os.environ.get('IR_RISE'))  # bricht bei Schemafehlern ab
RELEASE = '--release' in sys.argv
# Release-Build in einen eigenen Ordner (dist-release/), damit dist/ die private Vorschau für die Prüfungen bleibt
DIST = os.environ.get('IR_DIST', 'dist-release' if RELEASE else 'dist').rstrip('/') + '/'
# Veröffentlichungsstand nur mit ausdrücklicher Freigabe als Einzelunternehmen oder eingetragene GmbH (docs/VEROEFFENTLICHUNG.md).
# Ohne --release entsteht immer die private Vorschau (noindex, Prüfhinweise, Demo-Hinweis).
if RELEASE:
    _open = launch_check(RISE)
    if _open:
        print('Release-Build nicht freigegeben – %d offene Punkte:' % len(_open))
        for _o in _open:
            print('  -', _o)
        sys.exit(1)
    print('Release-Build: Vorschau-Werkzeuge (Demo-Hinweis, Prüfhinweise, Umsetzungsmappe) werden entfernt → %s' % os.environ.get('IR_DIST', 'dist-release'))
CFG = tour_config(RISE)
STATIONS = RISE['tour']['stations']


def b64(path, mime):
    with open(path, 'rb') as f:
        return 'data:%s;base64,%s' % (mime, base64.b64encode(f.read()).decode())


def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def write(p, s):
    if p.startswith('dist/'):
        p = DIST + p[5:]
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
# Realismus-Auftrag: «Vorher»-Bilder derselben Kamera (nur vorhanden, wenn tools/render-stills.js sie erzeugt hat)
VORHER = {}
for _n in STILL_NAMES:
    for _pt in (False, True):
        _f = 'assets/tour/%s-vorher%s.webp' % (_n, '-hoch' if _pt else '')
        if os.path.exists(_f):
            VORHER[(_n, _pt)] = _f
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
# Das Formular sendet nur in der freigegebenen Release-Fassung an Wix Forms; die Vorschau bleibt im Demo-Modus
if not (RELEASE and RISE['firm']['company']['goLiveApproved']):
    CFG['forms'] = None
CFG_JS = json.dumps(CFG, ensure_ascii=False, separators=(',', ':'))

# ---------------- Seite ----------------
PARTS = ['p1.html', 'p2.html', 'p3a.html', 'p3b.html', 'p3c.html', 'p3e.html', 'p3f.html', 'p3g.html', 'p3d.html']
# Konfiguration direkt vor dem Hauptskript (p3a), damit <title> und CSS aus p1 am Anfang bleiben
html = ''.join(read('src/' + p) for p in PARTS[:2]) + '<script>window.IR_RISE={{CFG}};</script>' + ''.join(read('src/' + p) for p in PARTS[2:])
html = html.replace('<!--{{RISE_TOUR}} (erzeugt aus rise.json durch build.py)-->', tour_markup(RISE, lambda i, s, portrait: PORTRAIT_DATA[i] if portrait else STILL_DATA[i],
                    vorher_src=lambda n, pt: b64(VORHER[(n, pt)], 'image/webp') if (n, pt) in VORHER else None))
html = html.replace('/*{{TOUR_CORE}}*/', CORE)
# Unternehmensangaben (GmbH in Gründung bzw. eingetragen) überall aus rise.json → firm.company
FIRM = firm_markup(RISE)
CO = RISE['firm']['company']
LIVE_OK = RELEASE and CO['goLiveApproved'] and CO['status'] in LIVE_STATUS
# Bis zur Freigabe: Suchmaschinen ausschliessen (ersetzt keinen Zugriffsschutz – siehe docs/VEROEFFENTLICHUNG.md)
ROBOTS = '' if LIVE_OK else '<meta name="robots" content="noindex,nofollow,noarchive">'


def firm(h):
    h = h.replace('<!--{{FIRM_IMPRINT}} (Unternehmensangaben aus rise.json → firm.company, erzeugt durch build.py)-->', FIRM['imprint'])
    h = h.replace('<!--{{FIRM_PRIVACY}}-->', FIRM['privacy']).replace('<!--{{FIRM_ADDRESS_NOTE}}-->', FIRM['address_note'])
    h = h.replace('<!--{{FIRM_FOOTER}}-->', FIRM['footer']).replace('{{FIRM_ROLE}}', RISE['firm']['role'])
    h = h.replace('<!--{{CAREERS}}-->', careers_markup(RISE)).replace('<!--{{PHOTO_CREDITS}}-->', photo_credits(RISE))
    h = h.replace('<!--{{TOUR_VIDEOS}}-->', videos_markup(RISE))
    # Terminbuchung bleibt auf der bisherigen Wix-Seite (Wix Bookings); Adresse aus rise.json → contact.bookingSite
    bs = RISE['contact'].get('bookingSite', 'https://www.immoready.ch').rstrip('/')
    h = h.replace('https://www.immoready.ch/book-online', bs + '/book-online').replace('https://www.immoready.ch/booking-calendar', bs + '/booking-calendar')
    if LIVE_OK and '</title>' in h:
        h = h.replace('</title>', '</title>\n' + seo_head(RISE), 1)
    return release_strip(h) if LIVE_OK else h


# ---------------- Release: Vorschau-Werkzeuge entfernen ----------------
# Öffentliche Fassung: kein Demo-Banner, keine Prüfhinweise (auch nicht im Quelltext), keine Umsetzungsmappe,
# Datenschutz ohne offene Markierungen (Entwurf vom Inhaber freigegeben, rise.json → firm.company.approvals).
_D = CO.get('goLiveApprovedOn', '')
RELEASE_TEXT = [
    ('<span class="missing">Datum bei Veröffentlichung</span>', '%s.%s.%s' % (_D[8:10], _D[5:7], _D[:4])),
    (' sowie hochgeladene Fotos (höchstens fünf Bilder, je bis 10 MB)', ''),
    ('      <li><b>Terminbuchungen:</b> Angaben, die Sie bei der Buchung eines Beratungstermins über Wix Bookings machen.</li>\n', ''),
    ('Hosting der Website, Speicherung der Offertanfragen und Fotos, Terminbuchung.', 'Hosting der Website und Speicherung der Offertanfragen (Wix Forms). Wix prüft eingehende Anfragen automatisch auf Spam (auch mit automatisierter Textprüfung) und legt zu einer Anfrage einen Kontakt mit Ihrer E-Mail-Adresse an. Die Terminbuchung läuft über Wix Bookings auf unserer bisherigen Wix-Seite.'),
    (' <span class="missing">Alternative: Schrift selbst hosten – vor der Veröffentlichung entscheiden</span></li>', '</li>\n      <li><b>jsDelivr und GitHub</b> – Gestaltung, Programmcode und Bilder dieser Website werden über das Auslieferungsnetz jsDelivr aus unserem GitHub-Verzeichnis geladen; dabei wird Ihre IP-Adresse an diese Anbieter übermittelt (unter anderem in die USA). Es werden keine Cookies gesetzt.</li>'),
    (' <span class="missing">Garantien gemäss Wix-Vertrag ergänzen</span>', ''),
    ('      <li><span class="missing">Weitere Dienste (z. B. eine Automatisierung) nur aufführen, falls sie tatsächlich eingesetzt werden</span></li>\n', ''),
    ('löschen wir <span class="missing">Frist festlegen, z. B. nach 12 Monaten</span>', 'löschen wir, sobald sie für die Bearbeitung nicht mehr benötigt werden'),
    (' Der Hosting-Anbieter kann technisch notwendige Cookies setzen. <span class="missing">Mit der Cookie-Konfiguration der Wix-Website abgleichen</span>',
     ' Der Hosting-Anbieter Wix setzt technisch notwendige Cookies für den Betrieb der Seite (Sitzungskennungen wie «bSession», «client-session-bind», «server-session-bind») und erfasst dabei technische Nutzungsdaten. Ihr Browser speichert ausserdem eine Anzeige-Einstellung ohne Personenbezug.'),
    (' <span class="missing">Mit der Cookie-Konfiguration der Wix-Website abgleichen</span>', ''),
    ("'datenschutz','umsetzung'];", "'datenschutz'];"),
    # Release ohne Foto-Upload (Wix-Gratisplan): Texte, die den Upload versprechen, anpassen
    ('Ja. Im Anfrageformular können Sie bis zu fünf Fotos hochladen oder sie später per E-Mail nachreichen.', 'Ja, gerne – senden Sie Fotos nach Ihrer Anfrage per E-Mail an info.immoready@gmail.com. Sie helfen uns bei der Einschätzung.'),
    ('Ja. Im Formular können Sie bis zu fünf Fotos hochladen. Ein Foto', 'Ja, gerne per E-Mail an info.immoready@gmail.com nach Ihrer Anfrage. Ein Foto'),
    ('Mit Foto-Upload, rund zwei Minuten', 'Kurzes Formular, rund zwei Minuten'),
]


def release_strip(h):
    for a, b in RELEASE_TEXT:
        if a in h:
            h = h.replace(a, b)
    demo = re.search(r'<div class="demo" role="region".*?</div>\s*</div>', h, re.S)
    if demo:
        h = h[:demo.start()] + '<input type="checkbox" id="reviewToggle" hidden aria-hidden="true">' + h[demo.end():]
    h = h.replace('<div data-page="umsetzung" hidden id="umsetzungPage"></div>', '<div hidden id="umsetzungPage"></div>')
    # interne Umsetzungsmappe nicht mit ausliefern (nur Vorschau)
    m = re.search(r'function renderUmsetzung\(\)\{.*?var el=document\.getElementById\(\'umsetzungPage\'\);el\.innerHTML=h;\n\}', h, re.S)
    if m:
        h = h[:m.start()] + 'function renderUmsetzung(){}' + h[m.end():]
    h = re.sub(r'<p class="review-only[^"]*"[^>]*>.*?</p>', '', h, flags=re.S)
    h = re.sub(r'<figcaption class="review-only">.*?</figcaption>', '', h, flags=re.S)
    h = re.sub(r'<span class="tbc">[^<]*</span>', '', h)
    h = re.sub(r'<section class="sec review-only[^"]*".*?</section>', '', h, flags=re.S)
    return h


# ---------------- Videos zum Rundgang (rise.json → assets.videos) ----------------
# Einzeldatei: als data-URI (Clips ≤ 4 MB, sonst Abbruch); Produktionsform: Dateien unter assets/videos/.
VIDEOS = video_slots(RISE)


def videos(h, site=False):
    for v in VIDEOS:
        if site:
            src = 'assets/videos/' + os.path.basename(v['file'])
        else:
            assert os.path.getsize(v['file']) <= 4 * 1024 * 1024, 'Video %s grösser als 4 MB – kürzen oder stärker komprimieren' % v['id']
            src = b64(v['file'], 'video/webm' if v['file'].endswith('.webm') else 'video/mp4')
        h = h.replace('{{VSRC:%s}}' % v['id'], src)
        if '{{VPOSTER:%s}}' % v['id'] in h:
            h = h.replace('{{VPOSTER:%s}}' % v['id'], ('assets/videos/' + os.path.basename(v['poster'])) if site else _photo_uri(v['poster']))
    return h


html = firm(html)

# ---------------- Fotos (rise.json → assets.photos) ----------------
# Jede Bildfläche hat eine ID. Liegt ein eigenes oder lizenziertes Foto vor (status eigen/stock, Datei vorhanden), wird es
# verkleinert (max. 1800 px, JPEG 82) eingebettet; sonst bleibt das gekennzeichnete Übergangsbild (interim).
PHOTOS = RISE['assets'].get('photos', {}).get('slots', [])


def _photo_uri(path):
    try:
        from PIL import Image
        import io
        im = Image.open(path).convert('RGB')
        if im.width > 1800:
            im = im.resize((1800, round(im.height * 1800 / im.width)), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, 'JPEG', quality=82, optimize=True, progressive=True)
        return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()
    except ImportError:
        return b64(path, 'image/jpeg')


def photos(h):
    i = h.index('var PH=')
    j = h.index('};', i)
    ph = json.loads(h[i + 7:j + 1])
    alt, pos, tag, src = {}, {}, {}, {}
    for sl in PHOTOS:
        real = sl['status'] in ('eigen', 'stock') and not sl['file'].startswith('[') and os.path.exists(sl['file'])
        if real:
            ph[sl['id']] = _photo_uri(sl['file'])
        elif sl.get('interim'):
            ph[sl['id']] = ph[sl['interim']]
        else:
            continue
        if real:  # Übergangsbilder behalten die Beschreibung des tatsächlich gezeigten Bildes (PHALT im Skript)
            alt[sl['id']] = sl['alt']
            pos[sl['id']] = sl['pos']
        else:
            src[sl['id']] = sl['interim']
        tag[sl['id']] = '' if (real and sl['status'] == 'eigen') else ('Symbolbild' if real else 'Symbolbild (KI)')
    return (h[:i] + 'var PH=' + json.dumps(ph) + ';var PHSLOT=' + json.dumps({'alt': alt, 'pos': pos, 'tag': tag, 'src': src}, ensure_ascii=False) + h[j + 1:])


html = videos(photos(html))
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
os.makedirs(DIST + 'component/assets/tour', exist_ok=True)
for f in sorted(set(STILL_FILES + PORTRAIT_FILES + TEX_FILES)):
    shutil.copy(f, DIST + 'component/assets/tour/')
if BAKE:
    shutil.copy(BAKE_FILE, DIST + 'component/assets/tour/licht.json')
write('dist/component/demo.html', read('src/tour/demo.html'))
print('Komponente:', os.path.getsize(DIST + 'component/immoready-tour.js'), 'Bytes (inline:', os.path.getsize(DIST + 'component/immoready-tour.inline.js'), ')')


# ---------------- Produktionsform: getrennte Dateien (dist/site/) ----------------
# Dieselbe Seite wie die Vorschau, aber ohne eingebettete Base64-Blöcke: HTML, site.css, site.js und assets/
# (Stationsbilder, Texturen und Lichtdaten werden erst bei Bedarf geladen; Fotos als eigene Dateien).
def build_site():
    out = DIST + 'site/'
    if os.path.isdir(out):
        shutil.rmtree(out)
    for d in ('assets/tour', 'assets/tex', 'assets/img', 'assets/bake'):
        os.makedirs(out + d, exist_ok=True)
    h = ''.join(read('src/' + p) for p in PARTS[:2]) + '<script>window.IR_RISE={{CFG}};</script>' + ''.join(read('src/' + p) for p in PARTS[2:])
    h = h.replace('<!--{{RISE_TOUR}} (erzeugt aus rise.json durch build.py)-->',
                  tour_markup(RISE, lambda i, s, portrait: 'assets/tour/' + os.path.basename(PORTRAIT_FILES[i] if portrait else STILL_FILES[i]),
                              vorher_src=lambda n, pt: 'assets/tour/' + os.path.basename(VORHER[(n, pt)]) if (n, pt) in VORHER else None))
    h = videos(photos(firm(h.replace('/*{{TOUR_CORE}}*/', CORE))), site=True).replace('{{LOGOO}}', 'assets/logo_orig.png').replace('{{FAV}}', 'assets/fav.png')
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
    for f in sorted(set(STILL_FILES + PORTRAIT_FILES + list(VORHER.values()))):
        shutil.copy(f, out + 'assets/tour/')
    for f in TEX_FILES:
        shutil.copy(f, out + 'assets/tex/')
    if BAKE:
        shutil.copy(BAKE_FILE, out + 'assets/bake/licht.json')
    for v in VIDEOS:
        os.makedirs(out + 'assets/videos', exist_ok=True)
        shutil.copy(v['file'], out + 'assets/videos/')
        if not v['poster'].startswith('[') and os.path.exists(v['poster']):
            shutil.copy(v['poster'], out + 'assets/videos/')
    shutil.copy('assets/logo_orig.png', out + 'assets/')
    shutil.copy('assets/fav.png', out + 'assets/')
    tot = sum(os.path.getsize(os.path.join(r, x)) for r, _, fs in os.walk(out) for x in fs)
    print('Produktionsform dist/site/: index.html %d Bytes, site.css %d, site.js %d, gesamt %d Bytes' % (
        os.path.getsize(out + 'index.html'), os.path.getsize(out + 'site.css'), os.path.getsize(out + 'site.js'), tot))


build_site()
