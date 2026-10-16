"""Vergleichsbilder der 3D-Reise (vorher | nachher) → docs/reise/vergleich-*.jpg und docs/reise/vergleich-uebersicht.jpg.
Quellen: shots/vergleich-vorher, shots/vergleich-nachher (node tools/route-bilder.js, gleiche Kamerapunkte) sowie
shots/handy-vorher, shots/handy-3d (node tools/handy-3d-bilder.js).
Aufruf: python3 tools/vergleich-reise.py"""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'docs', 'reise')
os.makedirs(OUT, exist_ok=True)


def font(sz):
    for f in ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/dejavu/DejaVuSans.ttf'):
        if os.path.exists(f):
            return ImageFont.truetype(f, sz)
    return ImageFont.load_default()


F, FB = font(18), font(22)
MOTIVE = [('gesamtansicht', '0.030', 'Gesamtansicht'), ('garten', '0.235', 'Garten'), ('treppenhaus', '0.405', 'Eingang → Treppenhaus'),
          ('eingang', '0.440', 'Eingang (Halt)'), ('wohnung', '0.590', 'Wohnung'), ('waschtisch', '0.752', 'Waschtisch'), ('wc', '0.772', 'WC')]


def pair(a, b, title, w=900):
    ia, ib = Image.open(a).convert('RGB'), Image.open(b).convert('RGB')
    h = int(ia.height * w / ia.width)
    ia, ib = ia.resize((w, h), Image.LANCZOS), ib.resize((w, int(ib.height * w / ib.width)), Image.LANCZOS)
    H = max(ia.height, ib.height)
    im = Image.new('RGB', (2 * w + 16, H + 40), '#f3efe9')
    d = ImageDraw.Draw(im)
    d.text((6, 8), title + ' · vorher', fill='#2b2a29', font=FB)
    d.text((w + 22, 8), title + ' · nachher', fill='#2b2a29', font=FB)
    im.paste(ia, (0, 40)); im.paste(ib, (w + 16, 40))
    return im


tiles = []
for key, q, title in MOTIVE:
    a = os.path.join(ROOT, 'shots', 'vergleich-vorher', 'r-%s.png' % q)
    b = os.path.join(ROOT, 'shots', 'vergleich-nachher', 'r-%s.png' % q)
    if os.path.exists(a) and os.path.exists(b):
        im = pair(a, b, title)
        im.save(os.path.join(OUT, 'vergleich-%s.jpg' % key), quality=86)
        tiles.append(im)
# Handy: Wohnung und Bad (vorher Bild, nachher 3D im Bildrahmen)
for n, title in (('4', 'Handy · Wohnung'), ('5', 'Handy · Bad')):
    a = os.path.join(ROOT, 'shots', 'handy-vorher', 'm-bild-%s.png' % n)
    b = os.path.join(ROOT, 'shots', 'handy-3d', 'm-3d-%s.png' % n)
    if os.path.exists(a) and os.path.exists(b):
        im = pair(a, b, title, w=420)  # vorher: Bild, nachher: 3D im Bildrahmen
        im.save(os.path.join(OUT, 'vergleich-handy-%s.jpg' % n), quality=86)
if tiles:
    W = 1100
    rows = [t.resize((W, int(t.height * W / t.width)), Image.LANCZOS) for t in tiles]
    sheet = Image.new('RGB', (W, sum(r.height + 10 for r in rows)), '#f3efe9')
    y = 0
    for r in rows:
        sheet.paste(r, (0, y)); y += r.height + 10
    sheet.save(os.path.join(OUT, 'vergleich-uebersicht.jpg'), quality=82)
print('docs/reise: %d Vergleiche' % len(tiles))
