"""Abnahme V17: die 22 verlangten Bilder (Szene aus shots/v17-nachher, Smartphone aus shots/v17-mobil) nach docs/v17/abnahme/
kopieren, eine Übersicht abnahme-22-bilder.jpg und den V16/V17-Vergleich (gleiche Kameras) erzeugen.
Aufruf: python3 tools/abnahme-collage.py"""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
N, V, M = (os.path.join(ROOT, 'shots', d) for d in ('v17-nachher', 'v17-vorher', 'v17-mobil'))
OUT = os.path.join(ROOT, 'docs', 'v17')
os.makedirs(os.path.join(OUT, 'abnahme'), exist_ok=True)
LISTE = [
    ('01', 'Gesamtes Schweizer Mehrfamilienhaus', N, 'a01-gesamt'), ('02', 'Fassade mit Fenstern, Storen und Balkonen', N, 'a02-fassade'),
    ('03', 'Rückfassade', N, 'r-rueckseite'), ('04', 'Seitenfassade', N, 'r-seite'), ('05', 'Garten und Weg', N, 'a03-garten'),
    ('06', 'Hauseingang', N, 'a04-hauseingang'), ('07', 'Briefkästen und Klingel', N, 'a13-briefkasten'), ('08', 'Treppenhaus', N, 'a05-treppenhaus'),
    ('09', 'Wohnung', N, 'a06-wohnung'), ('10', 'Küche', N, 'a12-kueche'), ('11', 'Badezimmer, Gesamtansicht', N, 'a07-bad'),
    ('12', 'WC, Dreiviertelansicht', N, 'a08-wc'), ('13', 'WC, Seitenansicht', N, 'a14-wc-seite'), ('14', 'Waschtisch frontal', N, 'a15-waschtisch-frontal'),
    ('15', 'Unterschrank', N, 'a16-unterschrank'), ('16', 'Armatur, Nahaufnahme', N, 'a17-armatur'),
    ('17', 'Smartphone 390: Gebäude', M, '17-gebaeude-390'), ('18', 'Smartphone 390: Bad', M, '18-bad-390'),
    ('19', 'Smartphone 390: Stationsleiste', M, '19-stationsleiste-390'), ('20', 'Smartphone 390: Formular oben', M, '20-formular-oben-390'),
    ('21', 'Smartphone 390: Formular unten', M, '21-formular-unten-390'), ('22', 'Smartphone 390: mit Kontaktleiste', M, '22-kontaktleiste-390'),
]


def font(sz):
    for f in ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/dejavu/DejaVuSans.ttf'):
        if os.path.exists(f):
            return ImageFont.truetype(f, sz)
    return ImageFont.load_default()


F = font(20)
for nr, name, d, f in LISTE:
    im = Image.open(os.path.join(d, f + '.png')).convert('RGB')
    im.save(os.path.join(OUT, 'abnahme', '%s-%s.jpg' % (nr, f)), quality=88)

# Übersicht: 16 Szenenbilder 4 × 4 (480 × 300), darunter 6 Smartphone-Bilder (je 260 × 563)
W, H = 480, 300
sheet = Image.new('RGB', (4 * W, 4 * (H + 30) + 563 + 30), '#f3efe9')
dr = ImageDraw.Draw(sheet)
for i, (nr, name, d, f) in enumerate(LISTE[:16]):
    x, y = (i % 4) * W, (i // 4) * (H + 30)
    sheet.paste(Image.open(os.path.join(d, f + '.png')).convert('RGB').resize((W, H), Image.LANCZOS), (x, y + 30))
    dr.text((x + 8, y + 5), nr + '  ' + name, fill='#2b2b2a', font=F)
y0 = 4 * (H + 30)
for i, (nr, name, d, f) in enumerate(LISTE[16:]):
    im = Image.open(os.path.join(d, f + '.png')).convert('RGB')
    im = im.resize((260, int(im.size[1] * 260 / im.size[0])), Image.LANCZOS).crop((0, 0, 260, 563))
    x = 30 + i * 315
    sheet.paste(im, (x, y0 + 30))
    dr.text((x, y0 + 5), nr + '  ' + name.replace('Smartphone 390: ', ''), fill='#2b2b2a', font=F)
sheet.save(os.path.join(OUT, 'abnahme-22-bilder.jpg'), quality=86)

# V16 | V17 mit identischen Kameras (tools/kameras-vergleich.json → abnahme)
VGL = [('aussen', ['a01-gesamt', 'a02-fassade', 'a11-balkon', 'a10-strasse', 'r-rueckseite', 'r-seite', 'r-dach', 'a03-garten', 'a04-hauseingang', 'a13-briefkasten']),
       ('innen', ['a05-treppenhaus', 'r-treppe', 'a06-wohnung', 'a12-kueche', 'a07-bad', 'a08-wc', 'a14-wc-seite', 'a09-waschtisch', 'a15-waschtisch-frontal', 'a16-unterschrank', 'a17-armatur'])]
W, H = 640, 400
for teil, ids in VGL:
    img = Image.new('RGB', (2 * W + 10, len(ids) * (H + 30) + 40), '#f3efe9')
    dr = ImageDraw.Draw(img)
    dr.text((8, 10), 'V16 (Tag v16-stand)', fill='#2b2b2a', font=F)
    dr.text((W + 18, 10), 'V17 (gleiche Kamera)', fill='#2b2b2a', font=F)
    for r, f in enumerate(ids):
        y = 40 + r * (H + 30)
        dr.text((8, y + 4), f, fill='#5e5e5c', font=F)
        img.paste(Image.open(os.path.join(V, f + '.png')).convert('RGB').resize((W, H), Image.LANCZOS), (0, y + 28))
        img.paste(Image.open(os.path.join(N, f + '.png')).convert('RGB').resize((W, H), Image.LANCZOS), (W + 10, y + 28))
    img.save(os.path.join(OUT, 'vorher-nachher-v16-v17-%s.jpg' % teil), quality=84)
print('docs/v17:', sorted(os.listdir(OUT)))
