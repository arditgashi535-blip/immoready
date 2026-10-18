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
short = ['Startseite', '1 Gesamtansicht', '2 Garten', '3 Eingang', '4 Wohnung', '5 Bad', '6 Rückkehr']
for dev, cw, ch in (('desktop', 560, 350), ('handy', 260, 563)):
    pairs = []
    for i, n in enumerate(names):
        k = '0-start' if i == 0 else str(i)
        if dev == 'desktop':
            pairs.append([(os.path.join(SRC, 'baseline-%s-%s.png' % (dev, k)), 'Ausgangsstand · ' + n), (os.path.join(SRC, 'final-%s-%s.png' % (dev, k)), 'Endstand · ' + n)])
        else:
            pairs.append([(os.path.join(SRC, 'baseline-%s-%s.png' % (dev, k)), 'Ausgang · ' + short[i]), (os.path.join(SRC, 'final-%s-%s.png' % (dev, k)), 'Endstand · ' + short[i])])
    if dev == 'handy':  # hochformatig: zwei Paare je Zeile
        pairs = [pairs[i] + (pairs[i + 1] if i + 1 < len(pairs) else []) for i in range(0, len(pairs), 2)]
    grid(pairs, [0] * len(pairs[0]), cw, ch, 'Ausgangsstand und Endstand · %s' % ('Desktop 1440×900, 3D' if dev == 'desktop' else 'Handy 390×844'),
         'Gleiche Kameras und Auflösung%s. Illustrative Visualisierung · kein Referenzobjekt. Software-Grafik (SwiftShader).' % ('' if dev == 'desktop' else ', Bildmodus'), os.path.join(OUT, 'vergleich-%s.jpg' % dev))

T = os.path.join(ROOT, 'assets/tour')
st = [('station-02-garten', 'Garten: Laub, Moos, Schmutzfilm'), ('station-03-eingang', 'Eingang: Schuhspuren, Staub an den Wandkanten'), ('station-04-wohnung', 'Wohnung: Staub auf Parkett, Tisch, Sitzflächen'),
      ('station-05-bad', 'Bad: Übersicht'), ('station-05-bad-waschtisch', 'Bad: Waschtisch (Wasserränder, Kalk)'), ('station-05-bad-wc', 'Bad: WC')]
ohne = [c for n, c in st if not os.path.exists(os.path.join(T, n + '-vorher.webp'))]
pairs = [[(os.path.join(T, n + '-vorher.webp'), 'Vorher · ' + c), (os.path.join(T, n + '.webp'), 'Nachher · ' + c)] for n, c in st if os.path.exists(os.path.join(T, n + '-vorher.webp'))]
grid(pairs, [0, 0], 640, 400, 'Stationsbilder «Vorher» und «Nachher» (Bildmodus, Handy und ohne WebGL)',
     'Dieselbe Kamera, dieselbe Szene, Tageslicht. Synthetischer Arbeitsablauf – kein Kundenergebnis.' + (' Ohne Vorher-Bild (kein sichtbarer Unterschied, Vergleich ausgeblendet): ' + ', '.join(ohne) + '.' if ohne else ''),
     os.path.join(OUT, 'stationen-vorher-nachher.jpg'))

# 1:1-Ausschnitte (keine Verkleinerung): Materialdetails, Masken, Kanten
det = [('station-02-garten', (430, 470, 1010, 900), 'Gartenweg: Laub in zwei Grössen, Moos am Rand, Schmutzfilm'),
       ('station-03-eingang', (620, 150, 1200, 750), 'Eingang: Fingerabdrücke und Schlieren an der Lifttür'),
       ('station-04-wohnung', (380, 520, 960, 900), 'Wohnung: Staubfilm auf Tisch und Sitzflächen'),
       ('station-05-bad-waschtisch', (330, 120, 910, 560), 'Waschtisch: Wasserränder, Kalk an Armatur und Strahlregler')]
rows = [[(os.path.join(T, n + '-vorher.webp'), 'Vorher · ' + c, b), (os.path.join(T, n + '.webp'), 'Nachher · ' + c, b)] for n, b, c in det]
cw = max(b[2] - b[0] for _, b, _ in det); ch = max(b[3] - b[1] for _, b, _ in det)
im, d, head = sheet(len(rows), 2, cw, ch, 'Ausschnitte 1:1 (Stationsbilder 1440×900)', 'Keine Verkleinerung: Fugen, Kanten, Maskenübergänge und Reflexe in Originalgrösse.', None)
for r, row in enumerate(rows):
    for c, (fn, cap, b) in enumerate(row):
        x, y = 16 + c * (cw + 16), head + r * (ch + 44)
        d.text((x, y + 6), cap, fill=INK, font=font(15, c == 1))
        im.paste(Image.open(fn).convert('RGB').crop(b), (x, y + 30))
p = os.path.join(OUT, 'details-1zu1.jpg'); im.save(p, quality=88); print(os.path.relpath(p, ROOT), im.size)

bad = [(BAD + '-q0.752-v0.png', 'Vorher (Reinigungsfortschritt 0 %)'), (BAD + '-q0.752-v0.5.png', 'Halb gereinigt (50 %, nasse Wischkante)'), (BAD + '-q0.752-v1.png', 'Nachher (100 %)')]
grid([bad], [0, 0, 0], 600, 307, 'Bad-Prototyp: Waschtisch und Armatur in drei Zuständen',
     'Gleiche Kamera (p 0,752), gleicher Startwert, gleiches Licht. Kalk am Armaturenfuss und Strahlregler, Wasserränder im Becken.', os.path.join(OUT, 'bad-zustaende.jpg'))
