"""Abnahme Premium-Durchgang: Übersichten aus shots/premium (Einzelbilder bleiben dort)
docs/premium/abnahme-<grösse>.jpg (je Grösse: Einstieg, Stationen 1/3/5, Offerte nebeneinander).
Aufruf: python3 tools/abnahme-premium-collage.py"""
import glob
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'shots', 'premium')
OUT = os.path.join(ROOT, 'docs', 'premium')
os.makedirs(OUT, exist_ok=True)


def font(sz):
    for f in ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/dejavu/DejaVuSans.ttf'):
        if os.path.exists(f):
            return ImageFont.truetype(f, sz)
    return ImageFont.load_default()


F = font(16)
files = sorted(glob.glob(os.path.join(SRC, '*.png')))
sizes = sorted({os.path.basename(f).split('-')[0] for f in files}, key=lambda s: int(s.split('x')[0]))
L = 26
for s in sizes:
    row = sorted(f for f in files if os.path.basename(f).startswith(s + '-'))
    ims = [Image.open(f).convert('RGB') for f in row]
    H = 600 if ims[0].width >= ims[0].height else 760
    ims = [im.resize((int(im.width * H / im.height), H), Image.LANCZOS) for im in ims]
    sheet = Image.new('RGB', (sum(im.width + 12 for im in ims), H + L), '#f3efe9')
    d = ImageDraw.Draw(sheet)
    x = 0
    for f, im in zip(row, ims):
        sheet.paste(im, (x, L)); d.text((x + 4, 4), os.path.basename(f)[:-4], fill='#2b2a29', font=F); x += im.width + 12
    sheet.save(os.path.join(OUT, 'abnahme-' + s + '.jpg'), quality=82)
print('docs/premium: %d Übersichten aus %d Bildern' % (len(sizes), len(files)))
