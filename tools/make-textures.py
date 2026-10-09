"""Erzeugt die Materialtexturen der Szene prozedural (eigene Werke, keine Fremdlizenz nötig).

Graustufen-Texturen speichern einen Helligkeitsfaktor: 128 ≙ 1.0 (der Shader rechnet Faktor = Wert × 2).
Alle Texturen sind nahtlos kachelbar (Rauschen über FFT, Muster periodisch).

  assets/tex/t1-putz.webp        512 px = 1.0 m   Abriebputz, feines Korn (Flecken/Wolken kommen nicht kachelnd aus der Szene)
  assets/tex/t1-stein.webp       512 px = 1.0 m   Granit/Beton: Körnung, Sprenkel
  assets/tex/t1-rasen.webp       512 px = 1.0 m   Rasen: Halme, Flecken
  assets/tex/t1-hecke.webp       512 px = 1.0 m   geschnittene Hecke: Blätter, Lücken
  assets/tex/t2-holz.webp       1024 px = 1.52 m  Eichendielen 19 cm, Maserung, Stösse
  assets/tex/t2-wandplatten.webp 1024 px = 1.2 m  Wandplatten 60×30 cm, Fuge 3 mm
  assets/tex/t2-bodenplatten.webp 1024 px = 1.2 m Bodenplatten 60×60 cm, Fuge 3 mm
  assets/tex/t2-metall.webp     1024 px = 0.5 m   gebürstetes Metall
  assets/tex/laub.webp          1024 px RGBA      Laubkarten 2×2: Strauch, Gras, Staude, Baum
Aufruf: python3 tools/make-textures.py
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'tex')
os.makedirs(OUT, exist_ok=True)


def fbm(n, beta, seed, aniso=1.0):
    """Nahtlos kachelbares 1/f^beta-Rauschen (Mittel 0, Std 1). aniso>1 ergibt Streifen entlang y (Bild-v)."""
    rng = np.random.default_rng(seed)
    f = np.fft.fft2(rng.standard_normal((n, n)))
    ky = np.fft.fftfreq(n)[:, None]
    kx = np.fft.fftfreq(n)[None, :] / aniso
    k = np.sqrt(kx * kx + ky * ky)
    k[0, 0] = 1
    r = np.real(np.fft.ifft2(f / k ** beta))
    r -= r.mean()
    return r / (r.std() + 1e-9)


def relief(h, k):
    """Licht von links oben auf die Höhenkarte (periodisch) – Relief in den Helligkeitsfaktor."""
    dx = np.roll(h, -1, 1) - np.roll(h, 1, 1)
    dy = np.roll(h, -1, 0) - np.roll(h, 1, 0)
    return 1 + k * (-dx * 0.7 - dy * 0.7)


def save_gray(name, fac):
    """fac: Faktor um 1.0 → Wert = fac/2 (0..1)."""
    v = np.clip(fac / 2.0, 0.04, 0.98)
    Image.fromarray((v * 255).astype(np.uint8), 'L').save(os.path.join(OUT, name), 'WEBP', quality=86, method=6)
    print(name, os.path.getsize(os.path.join(OUT, name)), 'Bytes, Mittel %.3f' % fac.mean())


def speckles(n, count, rmax, seed):
    rng = np.random.default_rng(seed)
    m = np.zeros((n, n))
    ys, xs = rng.integers(0, n, count), rng.integers(0, n, count)
    m[ys, xs] = rng.uniform(-1, 1, count)
    k = np.zeros((n, n))
    r = np.arange(-rmax, rmax + 1)
    yy, xx = np.meshgrid(r, r, indexing='ij')
    ker = np.exp(-(xx ** 2 + yy ** 2) / (0.5 * rmax * rmax + 0.5))
    k[np.ix_(r % n, r % n)] = ker
    return np.real(np.fft.ifft2(np.fft.fft2(m) * np.fft.fft2(k)))


# ---------- Putz (Abrieb 1,5 mm), 1 m ----------
n = 512
# nur feines Korn: grossflächige Wolken würden sich bei 1 m Kachelgrösse sichtbar wiederholen (die liefert die Szene je Eckpunkt)
h = 0.6 * fbm(n, 0.35, 1) + 0.5 * speckles(n, 26000, 1, 2) / 0.4
fac = (1 + 0.02 * fbm(n, 0.4, 4)) * relief(h, 0.06)
save_gray('t1-putz.webp', fac)

# ---------- Stein / Beton, 1 m ----------
h = 0.5 * fbm(n, 0.6, 11) + 0.6 * speckles(n, 9000, 2, 12) / 0.5
fac = (1 + 0.05 * fbm(n, 0.55, 13) + 0.05 * speckles(n, 4000, 1, 15) / 0.3) * relief(h, 0.05)
save_gray('t1-stein.webp', fac)

# ---------- Rasen, 1 m: Halme (gestreckt in zufälligen Richtungen) + Flecken ----------
img = Image.new('L', (n * 2, n * 2), 128)
d = ImageDraw.Draw(img)
rng = np.random.default_rng(21)
for _ in range(26000):
    x, y = rng.uniform(0, n * 2, 2)
    a = rng.uniform(0, np.pi)
    ln = rng.uniform(6, 18)
    v = int(rng.normal(128, 34))
    for ox in (-n * 2, 0, n * 2):
        for oy in (-n * 2, 0, n * 2):
            d.line([(x + ox, y + oy), (x + ox + np.cos(a) * ln, y + oy + np.sin(a) * ln)], fill=max(30, min(230, v)), width=2)
g = np.asarray(img.resize((n, n), Image.LANCZOS)).astype(float) / 128.0
fac = (0.68 + 0.32 * g) * (1 + 0.04 * fbm(n, 0.6, 22))
save_gray('t1-rasen.webp', fac)

# ---------- Hecke, 1 m: kleine Blätter, dunkle Lücken ----------
img = Image.new('L', (n * 2, n * 2), 52)
d = ImageDraw.Draw(img)
rng = np.random.default_rng(31)
for _ in range(9000):
    x, y = rng.uniform(0, n * 2, 2)
    a = rng.uniform(0, np.pi)
    lw, lh = rng.uniform(8, 16), rng.uniform(4, 8)
    v = int(rng.normal(150, 32))
    pts = [(x + np.cos(a + t) * lw * (1 if k % 2 == 0 else 0.4) * 0 + np.cos(a) * lw * np.cos(t) - np.sin(a) * lh * np.sin(t),
            y + np.sin(a) * lw * np.cos(t) + np.cos(a) * lh * np.sin(t)) for k, t in enumerate(np.linspace(0, 2 * np.pi, 9))]
    for ox in (-n * 2, 0, n * 2):
        for oy in (-n * 2, 0, n * 2):
            d.polygon([(px + ox, py + oy) for px, py in pts], fill=max(20, min(235, v)))
g = np.asarray(img.resize((256, 256), Image.LANCZOS)).astype(float) / 128.0
fac = (1 + 0.6 * (g - g.mean())) * (1 + 0.04 * fbm(256, 0.6, 32))
save_gray('t1-hecke.webp', fac)

# ---------- Holzdielen (Eiche), 1.52 m = 8 Dielen à 19 cm, Längsrichtung = Bild-v ----------
N = 1024
px = N / 1.52
yy, xx = np.mgrid[0:N, 0:N].astype(float)
fac = np.ones((N, N))
rng = np.random.default_rng(41)
plank_w = 0.19 * px
warp = fbm(N, 1.8, 42) * 6
for i in range(8):
    x0 = i * plank_w
    sel = (xx >= x0) & (xx < x0 + plank_w)
    tone = 1 + rng.normal(0, 0.07)
    streak = fbm(N, 1.1, 43 + i, aniso=30.0)          # lange Linien entlang der Diele
    flame = np.sin((xx - x0) / plank_w * np.pi * rng.uniform(1.5, 3.5) + fbm(N, 2.2, 143 + i) * 1.6 + yy / N * rng.uniform(2, 6)) * 0.5 + 0.5
    fac = np.where(sel, tone * (0.96 + 0.045 * streak + 0.035 * flame), fac)
    # Stösse (Querfugen) versetzt
    off = rng.uniform(0, N)
    for j in range(2):
        yj = (off + j * N / 2) % N
        fac = np.where(sel & (np.abs(yy - yj) < 1.0), fac * 0.62, fac)
    fac = np.where(np.abs(xx - x0) < 1.0, fac * 0.6, fac)
fac *= (1 + 0.035 * fbm(N, 2.0, 49))
save_gray('t2-holz.webp', fac)


def tiles(N, size_m, tw, th, grout_mm, seed, surf):
    pxm = N / size_m
    gw = grout_mm / 1000 * pxm
    yy, xx = np.mgrid[0:N, 0:N].astype(float)
    cw, ch = tw * pxm, th * pxm
    fx = np.mod(xx, cw)
    fy = np.mod(yy, ch)
    dist = np.minimum(np.minimum(fx, cw - fx), np.minimum(fy, ch - fy))
    rng = np.random.default_rng(seed)
    idx = (np.floor(xx / cw) + 17 * np.floor(yy / ch)).astype(int)
    tone = 1 + rng.normal(0, 0.025, idx.max() + 1)[idx]
    bevel = np.clip(dist / (gw * 1.6), 0, 1)
    face = tone * (1 + surf) * (0.9 + 0.1 * bevel)
    return np.where(dist < gw / 2, 0.66 + 0.04 * fbm(N, 0.8, seed + 1), face)


# V17: Fugen und Plattenraster rechnet der Shader je Pixel ab der Raumecke (exakte Fugen, keine Mipmap-Unschärfe);
# die Texturen tragen nur noch die ruhige Oberfläche (glasiert bzw. fein gesprenkelt), keine Flecken.
save_gray('t2-wandplatten.webp', 1 + 0.012 * fbm(N, 1.6, 52))
save_gray('t2-bodenplatten.webp', 1 + 0.02 * fbm(N, 1.4, 62) + 0.01 * speckles(N, 12000, 1, 63) / 0.3)
save_gray('t2-metall.webp', 1 + 0.06 * fbm(256, 0.6, 71, aniso=40) + 0.03 * fbm(256, 1.4, 72))


# ---------- Laubkarten (RGBA), 2×2 Felder à 512 px ----------
def leaf_poly(cx, cy, lw, lh, a, steps=10):
    pts = []
    for t in np.linspace(0, 2 * np.pi, steps, endpoint=False):
        x, y = np.cos(t) * lw, np.sin(t) * lh * (1 - 0.35 * np.cos(t))
        pts.append((cx + x * np.cos(a) - y * np.sin(a), cy + x * np.sin(a) + y * np.cos(a)))
    return pts


def green(rng, base, var=0.12, light=1.0):
    c = np.array(base) * light * (1 + rng.normal(0, var, 3) * np.array([1, 0.7, 1]))
    return tuple(int(v) for v in np.clip(c, 0, 255)) + (255,)


S = 1024  # Zeichenfläche je Feld (2× überabgetastet)
tilesimg = []
rng = np.random.default_rng(81)
# Strauch: runde Wolke aus kleinen Blättern, unten/innen dunkler
im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
for k in range(2600):
    r = S * 0.46 * np.sqrt(rng.uniform(0, 1)); a = rng.uniform(0, 2 * np.pi)
    x, y = S / 2 + np.cos(a) * r, S * 0.52 + np.sin(a) * r * 0.86
    if y > S * 0.97: continue
    shade = 0.55 + 0.6 * (1 - y / S) * (0.6 + 0.4 * r / (S * 0.46))
    base = [(78, 104, 62), (92, 118, 70), (66, 92, 58), (104, 124, 74)][k % 4]
    d.polygon(leaf_poly(x, y, rng.uniform(14, 26), rng.uniform(7, 12), rng.uniform(0, np.pi)), fill=green(rng, base, 0.1, shade))
tilesimg.append(im)
# Gras: fächerförmige Halme von unten
im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
for k in range(260):
    bx = S / 2 + rng.normal(0, S * 0.07); a = rng.normal(0, 0.42); L = rng.uniform(0.55, 0.95) * S; w = rng.uniform(6, 11)
    bend = rng.normal(0, 0.25)
    pts_l, pts_r = [], []
    for t in np.linspace(0, 1, 9):
        ang = a + bend * t * t
        x = bx + np.sin(ang) * L * t; y = S - np.cos(ang) * L * t
        ww = w * (1 - t) + 0.6
        pts_l.append((x - ww, y)); pts_r.append((x + ww, y))
    base = [(148, 150, 96), (126, 136, 84), (160, 154, 104), (110, 124, 76)][k % 4]
    d.polygon(pts_l + pts_r[::-1], fill=green(rng, base, 0.1, rng.uniform(0.75, 1.1)))
tilesimg.append(im)
# Staude: Blätter unten, Stiele, kleine Blüten oben
im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
for k in range(900):
    x = S / 2 + rng.normal(0, S * 0.18); y = S - abs(rng.normal(0, S * 0.22)) - 20
    d.polygon(leaf_poly(x, y, rng.uniform(16, 30), rng.uniform(6, 11), rng.uniform(0, np.pi)), fill=green(rng, (80, 106, 66), 0.1, 0.7 + 0.5 * (1 - y / S)))
for k in range(34):
    x0 = S / 2 + rng.normal(0, S * 0.12); top = S * rng.uniform(0.1, 0.42); tx = x0 + rng.normal(0, 70)
    d.line([(x0, S - 60), ((x0 + tx) / 2 + rng.normal(0, 12), (S - 60 + top) / 2), (tx, top)], fill=(92, 112, 72, 255), width=3, joint='curve')
    col = [(176, 160, 206), (236, 230, 216), (214, 184, 132), (176, 160, 206)][k % 4]
    for j in range(10):
        fx = x0 + rng.normal(0, 18); fy = top + rng.uniform(-10, 60)
        d.ellipse([fx - 7, fy - 7, fx + 7, fy + 7], fill=tuple(int(v * rng.uniform(0.85, 1.05)) for v in col) + (255,))
tilesimg.append(im)
# Baum: lockere Zweigbüschel mit Lücken (Himmel scheint durch), feine Zweige, Blätter unterschiedlich hell
im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
cls = [(S / 2 + rng.normal(0, S * 0.2), S / 2 + rng.normal(0, S * 0.17), S * rng.uniform(0.09, 0.15)) for _ in range(11)]
for cx, cy, cr in cls:
    d.line([(S / 2 + rng.normal(0, 20), S * 0.92), (cx, cy)], fill=(70, 60, 50, 255), width=int(rng.uniform(3, 6)))
for k in range(1100):
    cx, cy, cr = cls[k % len(cls)]
    r = cr * np.sqrt(rng.uniform(0, 1)); a = rng.uniform(0, 2 * np.pi)
    x, y = cx + np.cos(a) * r, cy + np.sin(a) * r * 0.85
    shade = (0.62 + 0.5 * (1 - y / S)) * (0.8 + 0.35 * (1 - r / cr))
    base = [(84, 102, 66), (96, 114, 72), (76, 92, 60), (104, 116, 74)][k % 4]
    d.polygon(leaf_poly(x, y, rng.uniform(13, 24), rng.uniform(7, 12), rng.uniform(0, np.pi)), fill=green(rng, base, 0.12, shade))
tilesimg.append(im)

atlas = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
for i, t in enumerate(tilesimg):
    t = t.resize((512, 512), Image.LANCZOS)
    a = np.asarray(t).astype(float)
    # Randfarbe in transparente Bereiche ausdehnen (keine dunklen Säume in den Mipmaps)
    rgb, al = a[..., :3], a[..., 3:4] / 255.0
    acc, wsum = rgb * al, al.copy()
    blur_rgb, blur_w = acc.copy(), wsum.copy()
    for rad in (2, 4, 8, 16, 32):
        br = np.stack([np.asarray(Image.fromarray(np.clip(blur_rgb[..., c], 0, 255).astype(np.uint8)).filter(ImageFilter.BoxBlur(rad))).astype(float) for c in range(3)], -1)
        bw = np.asarray(Image.fromarray((np.clip(blur_w[..., 0], 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.BoxBlur(rad))).astype(float)[..., None] / 255.0
        blur_rgb, blur_w = br, bw
        fill = np.where(bw > 0.01, br / np.maximum(bw, 1e-3), 0)
        rgb = np.where(al > 0.5, rgb, np.where(wsum < 0.5, fill, rgb))
        wsum = np.maximum(wsum, (bw > 0.01).astype(float))
    out = np.concatenate([np.clip(rgb, 0, 255), a[..., 3:4]], -1).astype(np.uint8)
    atlas.paste(Image.fromarray(out, 'RGBA'), ((i % 2) * 512, (i // 2) * 512))
atlas.save(os.path.join(OUT, 'laub.webp'), 'WEBP', quality=78, alpha_quality=70, method=6)
print('laub.webp', os.path.getsize(os.path.join(OUT, 'laub.webp')), 'Bytes')
open(os.path.join(OUT, 'LIZENZ.txt'), 'w', encoding='utf-8').write(
    'Alle Texturen in diesem Ordner wurden mit tools/make-textures.py prozedural erzeugt (eigenes Werk für ImmoReady).\n'
    'Keine Fotos, keine Fremdtexturen, keine KI-Bildgenerierung. Frei verwendbar im Projekt.\n')
