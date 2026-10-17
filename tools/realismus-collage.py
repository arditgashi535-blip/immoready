"""Realismus-Auftrag: Belegbilder aus shots/realismus (Ausgangsstand «baseline» und Endstand «final», gleiche Kameras).
   docs/realismus/vergleich-desktop.jpg   Startseite + 6 Stationen, links Ausgangsstand, rechts Endstand (1440×900, 3D)
   docs/realismus/vergleich-handy.jpg     dasselbe auf dem Handy (390×844, Bildmodus)
   docs/realismus/stationen-vorher-nachher.jpg   Stationsbilder «Vorher» | «Nachher» (Garten, Eingang, Wohnung, Bad, Waschtisch, WC)
   docs/realismus/bad-zustaende.jpg       Waschtisch vorher · halb gereinigt · nachher (gleiche Kamera, gleicher Startwert)
Aufruf: python3 tools/realismus-collage.py [ordner] [bad-präfix]"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'shots/realismus')
BAD = sys.argv[2] if len(sys.argv) > 2 else os.path.join(SRC, 'bad')
OUT = os.path.join(ROOT, 'docs/realismus')
os.makedirs(OUT, exist_ok=True)
IVORY, INK, SAND = (252, 248, 245), (59, 58, 57), (126, 99, 67)


def font(sz, bold=False):
    for f in ('/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf' % ('-Bold' if bold else ''), '/usr/share/fonts/dejavu/DejaVuSans%s.ttf' % ('-Bold' if bold else '')):
        if os.path.exists(f):
            return ImageFont.truetype(f, sz)
    return ImageFont.load_default()


def sheet(rows, cols, cw, ch, title, sub, path):
    head = 92
    im = Image.new('RGB', (cols * (cw + 16) + 16, head + rows * (ch + 44) + 16), IVORY)
    d = ImageDraw.Draw(im)
    d.text((16, 14), title, fill=INK, font=font(26, True))
    d.text((16, 52), sub, fill=SAND, font=font(16))
    return im, d, head


def grid(pairs, labels, cw, ch, title, sub, path):
    rows = len(pairs)
    im, d, head = sheet(rows, len(labels), cw, ch, title, sub, path)
    for r, row in enumerate(pairs):
        for c, (f, cap) in enumerate(row):
            x, y = 16 + c * (cw + 16), head + r * (ch + 44)
            d.text((x, y + 6), cap, fill=INK, font=font(15, c == len(row) - 1))
            if f and os.path.exists(f):
                im.paste(Image.open(f).convert('RGB').resize((cw, ch), Image.LANCZOS), (x, y + 30))
            else:
                d.rectangle([x, y + 30, x + cw, y + 30 + ch], outline=SAND)
                d.text((x + 12, y + 40), 'fehlt', fill=SAND, font=font(14))
    im.save(path, quality=84)
    print(os.path.relpath(path, ROOT), im.size)


names = ['Startseite', 'Station 1 · Gesamtansicht', 'Station 2 · Garten', 'Station 3 · Eingang/Treppenhaus', 'Station 4 · Wohnung', 'Station 5 · Bad', 'Station 6 · Rückkehr']
for dev, cw, ch in (('desktop', 560, 350), ('handy', 260, 563)):
    pairs = []
    for i, n in enumerate(names):
        k = '0-start' if i == 0 else str(i)
        pairs.append([(os.path.join(SRC, 'baseline-%s-%s.png' % (dev, k)), 'Ausgangsstand · ' + n), (os.path.join(SRC, 'final-%s-%s.png' % (dev, k)), 'Endstand · ' + n)])
    if dev == 'handy':  # hochformatig: zwei Paare je Zeile
        pairs = [pairs[i] + (pairs[i + 1] if i + 1 < len(pairs) else []) for i in range(0, len(pairs), 2)]
    grid(pairs, [0] * len(pairs[0]), cw, ch, 'Realismus-Auftrag · Ausgangsstand und Endstand (%s)' % ('Desktop 1440×900, 3D' if dev == 'desktop' else 'Handy 390×844, Bildmodus'),
         'Gleiche Kameras und Auflösung. Illustrative Visualisierung · kein Referenzobjekt. Software-Grafik (SwiftShader) dieser Arbeitsumgebung.', os.path.join(OUT, 'vergleich-%s.jpg' % dev))

T = os.path.join(ROOT, 'assets/tour')
st = [('station-02-garten', 'Garten: Laub, Moos, Schmutzfilm'), ('station-03-eingang', 'Eingang: Schuhspuren, Staub an den Wandkanten'), ('station-04-wohnung', 'Wohnung: Staub auf Parkett, Tisch, Sitzflächen'),
      ('station-05-bad', 'Bad: Übersicht'), ('station-05-bad-waschtisch', 'Bad: Waschtisch (Wasserränder, Kalk)'), ('station-05-bad-wc', 'Bad: WC')]
pairs = [[(os.path.join(T, n + '-vorher.webp'), 'Vorher · ' + c), (os.path.join(T, n + '.webp'), 'Nachher · ' + c)] for n, c in st]
grid(pairs, [0, 0], 640, 400, 'Stationsbilder «Vorher» und «Nachher» (Bildmodus, Handy und ohne WebGL)',
     'Dieselbe Kamera, dieselbe Szene, Tageslicht. Synthetischer Arbeitsablauf zur Illustration – kein Kundenergebnis.', os.path.join(OUT, 'stationen-vorher-nachher.jpg'))

bad = [(BAD + '-q0.752-v0.png', 'Vorher (Reinigungsfortschritt 0 %)'), (BAD + '-q0.752-v0.5.png', 'Halb gereinigt (50 %, nasse Wischkante)'), (BAD + '-q0.752-v1.png', 'Nachher (100 %)')]
grid([bad], [0, 0, 0], 600, 307, 'Bad-Prototyp: Waschtisch und Armatur in drei Zuständen',
     'Gleiche Kamera (p 0,752), gleicher Startwert, gleiches Licht. Kalk am Armaturenfuss und Strahlregler, Wasserränder im Becken.', os.path.join(OUT, 'bad-zustaende.jpg'))
