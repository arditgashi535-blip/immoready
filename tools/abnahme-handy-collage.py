"""Abnahme «Priorität Handy»: Bilder aus shots/v171-handy nach docs/v171/handy/ (JPEG) und Übersicht
docs/v171/handy-uebersicht.jpg (Sichtbereiche) sowie handy-ganze-seiten.jpg (ganze Seiten, verkleinert).
Aufruf: python3 tools/abnahme-handy-collage.py"""
import glob
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'shots', 'v171-handy')
OUT = os.path.join(ROOT, 'docs', 'v171')
os.makedirs(os.path.join(OUT, 'handy'), exist_ok=True)


def font(sz):
    for f in ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/dejavu/DejaVuSans.ttf'):
        if os.path.exists(f):
            return ImageFont.truetype(f, sz)
    return ImageFont.load_default()


F = font(16)
views = sorted(glob.glob(os.path.join(SRC, 'h*.png')))
desk = sorted(glob.glob(os.path.join(SRC, 'd*.png')))
fulls = sorted(glob.glob(os.path.join(SRC, 'g-*.png')))
for f in views + desk + fulls:
    im = Image.open(f).convert('RGB')
    if im.height > 12000:  # ganze Seiten: auf lesbare Höhe begrenzen
        r = 12000 / im.height
        im = im.resize((int(im.width * r), 12000), Image.LANCZOS)
    im.save(os.path.join(OUT, 'handy', os.path.basename(f)[:-4] + '.jpg'), quality=86)

# Sichtbereiche: je Zelle 300 px breit, Höhe nach Seitenverhältnis (max 650)
CW, CH, L = 300, 650, 26
cols = 6
rows = (len(views) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (CW + 10), rows * (CH + L + 10)), '#f3efe9')
d = ImageDraw.Draw(sheet)
for i, f in enumerate(views):
    im = Image.open(f).convert('RGB')
    r = min(CW / im.width, CH / im.height)
    im = im.resize((int(im.width * r), int(im.height * r)), Image.LANCZOS)
    x, y = (i % cols) * (CW + 10), (i // cols) * (CH + L + 10)
    sheet.paste(im, (x, y + L))
    d.text((x + 4, y + 4), os.path.basename(f)[:-4], fill='#2b2a29', font=F)
sheet.save(os.path.join(OUT, 'handy-uebersicht.jpg'), quality=84)

# Desktop-Abschnitte 1440 px: 2 Spalten
if desk:
    DW, DH = 900, 563
    dsheet = Image.new('RGB', (2 * (DW + 10), ((len(desk) + 1) // 2) * (DH + L + 10)), '#f3efe9')
    dd = ImageDraw.Draw(dsheet)
    for i, f in enumerate(desk):
        im = Image.open(f).convert('RGB').resize((DW, DH), Image.LANCZOS)
        x, y = (i % 2) * (DW + 10), (i // 2) * (DH + L + 10)
        dsheet.paste(im, (x, y + L)); dd.text((x + 4, y + 4), os.path.basename(f)[:-4], fill='#2b2a29', font=F)
    dsheet.save(os.path.join(OUT, 'desktop-abschnitte.jpg'), quality=84)

# ganze Seiten nebeneinander, gemeinsame Höhe
H = 3000
ims = []
for f in fulls:
    im = Image.open(f).convert('RGB')
    r = H / im.height
    ims.append((os.path.basename(f)[:-4], im.resize((max(1, int(im.width * r)), H), Image.LANCZOS)))
W = sum(im.width + 16 for _, im in ims)
strip = Image.new('RGB', (W, H + L), '#f3efe9')
d = ImageDraw.Draw(strip)
x = 0
for name, im in ims:
    strip.paste(im, (x, L))
    d.text((x + 2, 4), name, fill='#2b2a29', font=font(13))
    x += im.width + 16
strip.save(os.path.join(OUT, 'handy-ganze-seiten.jpg'), quality=84)
print('docs/v171: %d Sichtbereiche, %d Desktop-Abschnitte, %d ganze Seiten' % (len(views), len(desk), len(fulls)))
