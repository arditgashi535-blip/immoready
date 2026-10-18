"""Überarbeitung 2: Belegtafeln aus genau einem Stand (Aufnahmen in der echten Website, Software-Grafik dieser Umgebung).
   docs/realismus/vergleich-desktop.jpg      Ausgangsstand (r7vorher, Commit ade7f1a) | Endstand – 1280×720, Kundenansicht, alle Punkte
   docs/realismus/vergleich-handy.jpg        dasselbe auf dem Handy 390×844: Bildmodus und 3D
   docs/realismus/uebersicht-desktop.jpg     Endstand 1440×900 (Kundenansicht) und reine Szene, alle Punkte
   docs/realismus/bad-zustaende.jpg          Waschtisch 0 / 25 / 50 / 75 / 100 % (Regler in der Website), Kundenansicht und Ausschnitt 1:1
   docs/realismus/vergleich-3d.jpg           Vorher | Nachher im 3D: Garten, Eingang, Wohnung, Bad (Ausschnitte 1:1 und Kundenansicht)
   docs/realismus/stationen-vorher-nachher.jpg  Stationsbilder (Bildmodus) «Vorher» | «Nachher», quer und hoch
   docs/realismus/details-1zu1.jpg           Ausschnitte 1:1 aus den Stationsbildern (Bereich der Änderung automatisch bestimmt)
Aufruf: python3 tools/ueberarbeitung2-collage.py [etikett-endstand] [etikett-ausgang]"""
import os
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
END = sys.argv[1] if len(sys.argv) > 1 else 'r12'
BASE = sys.argv[2] if len(sys.argv) > 2 else 'r7vorher'
B = os.path.join(ROOT, 'shots/beurteilung')
OUT = os.path.join(ROOT, 'docs/realismus')
os.makedirs(OUT, exist_ok=True)
IVORY, INK, SAND = (252, 248, 245), (59, 58, 57), (126, 99, 67)
NOTE = 'Illustrative Visualisierung · kein Referenzobjekt · Software-Grafik (SwiftShader) dieser Umgebung'
PTS = [('1-aussen', '1 Gesamtansicht'), ('2-garten', '2 Garten'), ('3-eingang', '3 Eingang/Treppenhaus'), ('4-wohnung', '4 Wohnung'),
       ('5-bad', '5 Bad · Übersicht'), ('5-bad-waschtisch', '5 Bad · Waschtisch'), ('5-bad-wc', '5 Bad · WC'), ('6-zurueck', '6 Rückkehr')]


def font(sz, bold=False):
    for f in ('/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf' % ('-Bold' if bold else ''), '/usr/share/fonts/dejavu/DejaVuSans%s.ttf' % ('-Bold' if bold else '')):
        if os.path.exists(f):
            return ImageFont.truetype(f, sz)
    return ImageFont.load_default()


def sheet(rows, cols, cw, ch, title, sub):
    head = 92
    im = Image.new('RGB', (cols * (cw + 16) + 16, head + rows * (ch + 44) + 16), IVORY)
    d = ImageDraw.Draw(im)
    d.text((16, 14), title, fill=INK, font=font(26, True))
    d.text((16, 52), sub, fill=SAND, font=font(15))
    return im, d, head


def grid(rows, cw, ch, title, sub, name, fit='resize'):
    cols = max(len(r) for r in rows)
    im, d, head = sheet(len(rows), cols, cw, ch, title, sub)
    for r, row in enumerate(rows):
        for c, cell in enumerate(row):
            if cell is None:
                continue
            f, cap = cell[0], cell[1]
            x, y = 16 + c * (cw + 16), head + r * (ch + 44)
            d.text((x, y + 6), cap, fill=INK, font=font(14, c % 2 == 1))
            if f is not None and (not isinstance(f, str) or os.path.exists(f)):
                src = f if not isinstance(f, str) else Image.open(f).convert('RGB')
                if fit == 'crop' and (src.width > cw or src.height > ch):
                    src = src.crop((0, 0, min(cw, src.width), min(ch, src.height)))
                elif fit != 'crop':
                    k = min(cw / src.width, ch / src.height)
                    src = src.resize((max(1, int(src.width * k)), max(1, int(src.height * k))), Image.LANCZOS)
                im.paste(src, (x, y + 30))
            else:
                d.rectangle([x, y + 30, x + cw, y + 30 + ch], outline=SAND)
                d.text((x + 12, y + 40), 'fehlt', fill=SAND, font=font(14))
    p = os.path.join(OUT, name)
    im.save(p, quality=84)
    print(os.path.relpath(p, ROOT), im.size)


def bf(tag, view, pt, kind='kunde'):
    return os.path.join(B, '%s-%s-%s-%s.png' % (tag, view, pt, kind))


# 1 Ausgangsstand | Endstand, Desktop 1280×720
grid([[(bf(BASE, '1280x720', k), 'Ausgangsstand · ' + n), (bf(END, '1280x720', k), 'Endstand · ' + n)] for k, n in PTS], 640, 360,
     'Überarbeitung 2 · Ausgangsstand und Endstand · Desktop 1280×720',
     'Kundenansicht mit Kopf, Text und Bedienung, gleiche Fortschrittswerte. ' + NOTE, 'vergleich-desktop.jpg')
# 2 Handy: Bildmodus und 3D
grid([[(bf(BASE, 'handy', k), 'Ausgang · Bilder · ' + n.split(' ', 1)[1]), (bf(END, 'handy', k), 'Endstand · Bilder'),
       (bf(BASE, 'handy3d', k), 'Ausgang · 3D'), (bf(END, 'handy3d', k), 'Endstand · 3D')] for k, n in PTS], 260, 563,
     'Überarbeitung 2 · Handy 390×844', 'Bildmodus (Stationsbilder) und optionales 3D im Bildrahmen. ' + NOTE, 'vergleich-handy.jpg')
# 3 Übersicht Endstand 1440×900
grid([[(bf(END, '1440x900', k), 'Kundenansicht · ' + n), (bf(END, '1440x900', k, 'szene'), 'reine Szene · ' + n)] for k, n in PTS], 640, 400,
     'Endstand · Desktop 1440×900', 'Links mit Bedienung, rechts nur die Szene (Bedienung ausgeblendet). ' + NOTE, 'uebersicht-desktop.jpg')
# 4 Bad in fünf Zuständen
BZ = os.path.join(ROOT, 'shots/bad-zustaende')
grid([[(os.path.join(BZ, 'bad-%d-kunde.png' % v), '%d %% gereinigt' % v) for v in (0, 25, 50, 75, 100)],
      [(os.path.join(BZ, 'bad-%d-ausschnitt.png' % v), 'Ausschnitt 1:1 · %d %%' % v) for v in (0, 25, 50, 75, 100)]], 512, 330,
     'Bad · Waschtisch in fünf Reinigungszuständen (Regler «Reinigungsfortschritt» in der Website)',
     'Gleiche Kamera, gleiches Licht, gleicher Startwert. Kalk am Armaturenfuss und Strahlregler, Seifenfilm am Ablauf; gewischt vom Rand zum Ablauf. Synthetischer Arbeitsablauf – kein Kundenergebnis.',
     'bad-zustaende.jpg')
# 5 Vorher | Nachher im 3D: Ausschnitt 1:1 dort, wo sich die reine Szene zwischen 0 und 100 % am stärksten ändert
def strongest(a, b, w, h):
    d = (np.abs(np.asarray(a, dtype=float) - np.asarray(b, dtype=float)).sum(2) > 18).astype(np.int64)
    H, W = d.shape
    w, h = min(w, W), min(h, H)
    I = np.pad(d.cumsum(0).cumsum(1), ((1, 0), (1, 0)))
    S = I[h:, w:] - I[:H - h + 1, w:] - I[h:, :W - w + 1] + I[:H - h + 1, :W - w + 1]
    y, x = np.unravel_index(int(np.argmax(S)), S.shape)
    return (int(x), int(y), int(x) + w, int(y) + h), int(S[y, x]) / float(w * h)


V3 = os.path.join(ROOT, 'shots/vergleich-3d')
rows = []
for k, n in (('garten', 'Garten'), ('eingang', 'Eingang/Treppenhaus'), ('wohnung', 'Wohnung'), ('bad', 'Bad · Waschtisch')):
    f0, f1 = os.path.join(V3, '%s-0-szene.png' % k), os.path.join(V3, '%s-100-szene.png' % k)
    a = b = None
    if os.path.exists(f0) and os.path.exists(f1):
        a, b = Image.open(f0).convert('RGB'), Image.open(f1).convert('RGB')
        bx, share = strongest(a, b, 560, 330)
        a, b = a.crop(bx), b.crop(bx)
        print('  Ausschnitt %s: %s, Anteil geänderter Bildpunkte %.1f %%' % (k, bx, share * 100))
    rows.append([(a, 'Vorher (0 %%) · %s · Szene 1:1' % n), (b, 'Nachher (100 %)'),
                 (os.path.join(V3, '%s-0-kunde.png' % k), 'Vorher · Kundenansicht'), (os.path.join(V3, '%s-100-kunde.png' % k), 'Nachher · Kundenansicht')])
grid(rows, 560, 330, 'Vorher und Nachher im 3D (1280×720, Regler in der Website)',
     'Links reine Szene 1:1 im Bereich der grössten Änderung, rechts die Kundenansicht. Gleiche Kamera und gleiches Licht je Station. Synthetischer Arbeitsablauf – kein Kundenergebnis. '
     + NOTE, 'vergleich-3d.jpg')
# 6 Stationsbilder Vorher | Nachher (Bildmodus)
T = os.path.join(ROOT, 'assets/tour')
st = [('station-02-garten', 'Garten'), ('station-03-eingang', 'Eingang'), ('station-04-wohnung', 'Wohnung'), ('station-05-bad-waschtisch', 'Bad · Waschtisch')]
rows, ohne = [], []
for n, c in st:
    if not os.path.exists(os.path.join(T, n + '-vorher.webp')):
        ohne.append(c)
        continue
    rows.append([(os.path.join(T, n + '-vorher.webp'), 'Vorher · ' + c), (os.path.join(T, n + '.webp'), 'Nachher · ' + c),
                 (os.path.join(T, n + '-vorher-hoch.webp'), 'Vorher · hoch'), (os.path.join(T, n + '-hoch.webp'), 'Nachher · hoch')])
grid(rows, 480, 300, 'Stationsbilder «Vorher» und «Nachher» (Bildmodus: Handy, ohne WebGL, Bewegung reduzieren)',
     'Dieselbe Kamera, dieselbe Szene, Tageslicht. Synthetischer Arbeitsablauf – kein Kundenergebnis.' + (' Ohne Vorher-Bild: ' + ', '.join(ohne) + '.' if ohne else ''), 'stationen-vorher-nachher.jpg')


# 7 Ausschnitte 1:1: Bereich der Änderung aus der Differenz Vorher/Nachher
def bbox(a, b, w, h):
    d = np.abs(np.asarray(a, dtype=float) - np.asarray(b, dtype=float)).sum(2)
    ys, xs = np.where(d > 18)
    if not len(xs):
        return (0, 0, w, h)
    cx, cy = int(np.median(xs)), int(np.median(ys))
    x0 = max(0, min(a.width - w, cx - w // 2)); y0 = max(0, min(a.height - h, cy - h // 2))
    return (x0, y0, x0 + w, y0 + h)


rows = []
for n, c in st:
    fv, fn = os.path.join(T, n + '-vorher.webp'), os.path.join(T, n + '.webp')
    if not os.path.exists(fv):
        continue
    a, b2 = Image.open(fv).convert('RGB'), Image.open(fn).convert('RGB')
    bx = bbox(a, b2, 560, 340)
    rows.append([(a.crop(bx), 'Vorher 1:1 · ' + c), (b2.crop(bx), 'Nachher 1:1 · ' + c)])
grid(rows, 560, 340, 'Ausschnitte 1:1 (Stationsbilder 1440×900)', 'Keine Verkleinerung: Fugen, Kanten, Übergänge und Reflexe in Originalgrösse. Bereich aus der Differenz bestimmt.', 'details-1zu1.jpg', fit='crop')
