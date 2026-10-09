"""Abnahme V17.1: 32 Bilder (shots/v171-abnahme) nach docs/v171/abnahme/ kopieren, Übersicht abnahme-32-bilder.jpg
und Vorher/Nachher-Vergleich mit identischen Kameras (Vorher: V17-Ausgangsstand, shots/v171-vorher) erzeugen.
Aufruf: python3 tools/abnahme-final-collage.py"""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
N, V = os.path.join(ROOT, 'shots', 'v171-abnahme'), os.path.join(ROOT, 'shots', 'v171-vorher')
OUT = os.path.join(ROOT, 'docs', 'v171')
os.makedirs(os.path.join(OUT, 'abnahme'), exist_ok=True)
SZENE = [('01-gesamt', 'Gesamtgebäude'), ('02-vorderfassade', 'Vorderfassade'), ('03-rueckfassade', 'Rückfassade'), ('04-seitenfassade', 'Seitenfassade'),
         ('05-dach', 'Dach'), ('06-garten', 'Garten'), ('07-eingang', 'Eingang'), ('08-briefkasten', 'Briefkastenanlage'), ('09-treppenhaus', 'Treppenhaus'),
         ('10-lift', 'Lift'), ('11-wohnung', 'Wohnung'), ('12-kueche', 'Küche'), ('13-bad', 'Badübersicht'), ('14-wc-frontal', 'WC frontal'),
         ('15-wc-seitlich', 'WC seitlich'), ('16-wc-innen', 'WC-Innenform'), ('17-waschtisch-frontal', 'Waschtisch frontal'),
         ('18-waschtisch-unterschrank', 'Waschtisch und Unterschrank'), ('19-armatur', 'Armatur'), ('20-spiegel', 'Spiegel')]
UI = [('21-gebaeude-360', 'Gebäude 360 px'), ('22-gebaeude-390', 'Gebäude 390 px'), ('23-bad-390', 'Bad 390 px'), ('24-wc-detail-390', 'WC-Detail 390 px'),
      ('25-waschtisch-detail-390', 'Waschtisch-Detail 390 px'), ('26-stationsleiste-390', 'Stationsleiste'), ('27-menue-390', 'Mobiles Menü'),
      ('28-formular-oben-390', 'Formular oben'), ('29-formular-unten-390', 'Formular unten'), ('30-kontaktleiste-footer-390', 'Kontaktleiste über dem Footer'),
      ('31-tablet-768', 'Tablet 768 px'), ('32-desktop-1440', 'Desktop 1440 px')]


def font(sz):
    for f in ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/dejavu/DejaVuSans.ttf'):
        if os.path.exists(f):
            return ImageFont.truetype(f, sz)
    return ImageFont.load_default()


F = font(20)
for f, _ in SZENE + UI:
    Image.open(os.path.join(N, f + '.png')).convert('RGB').save(os.path.join(OUT, 'abnahme', f + '.jpg'), quality=88)


def fit(im, w, h):
    im = im.convert('RGB'); r = min(w / im.width, h / im.height)
    return im.resize((max(1, int(im.width * r)), max(1, int(im.height * r))), Image.LANCZOS)


# Übersicht: 20 Szenenbilder 4 × 5 (480 × 300), darunter 12 Seitenansichten 6 × 2 (je 320 × 560)
W, H, L = 480, 300, 30
UW, UH = 320, 560
sheet = Image.new('RGB', (4 * W, 5 * (H + L) + 2 * (UH + L)), '#f3efe9')
dr = ImageDraw.Draw(sheet)
for i, (f, name) in enumerate(SZENE):
    x, y = (i % 4) * W, (i // 4) * (H + L)
    sheet.paste(fit(Image.open(os.path.join(N, f + '.png')), W, H), (x, y + L)); dr.text((x + 8, y + 4), '%s  %s' % (f[:2], name), fill='#2b2a29', font=F)
y0 = 5 * (H + L)
for i, (f, name) in enumerate(UI):
    x, y = (i % 6) * UW, y0 + (i // 6) * (UH + L)
    im = fit(Image.open(os.path.join(N, f + '.png')), UW - 8, UH)
    sheet.paste(im, (x + 4, y + L)); dr.text((x + 8, y + 4), '%s  %s' % (f[:2], name), fill='#2b2a29', font=font(16))
sheet.save(os.path.join(OUT, 'abnahme-32-bilder.jpg'), quality=86)

# Vorher/Nachher: identische Kameras, je 10 Zeilen (vorher links, nachher rechts)
CW, CH = 640, 400
for part, rows in (('1', SZENE[:10]), ('2', SZENE[10:])):
    cmp = Image.new('RGB', (2 * CW, len(rows) * (CH + L) + L), '#f3efe9'); d2 = ImageDraw.Draw(cmp)
    d2.text((8, 4), 'Vorher: V17-Ausgangsstand', fill='#2b2a29', font=F); d2.text((CW + 8, 4), 'Nachher: V17.1 (gleiche Kamera)', fill='#2b2a29', font=F)
    for i, (f, name) in enumerate(rows):
        y = L + i * (CH + L)
        for j, base in enumerate((V, N)):
            p = os.path.join(base, f + '.png')
            if os.path.exists(p):
                cmp.paste(fit(Image.open(p), CW, CH), (j * CW, y + L))
        d2.text((8, y + 4), '%s  %s' % (f[:2], name), fill='#2b2a29', font=F)
    cmp.save(os.path.join(OUT, 'vorher-nachher-%s.jpg' % part), quality=84)
print('docs/v171: %d Abnahmebilder, Übersicht und 2 Vergleichsbilder' % len(SZENE + UI))
