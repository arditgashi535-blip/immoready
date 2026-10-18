// Vorab gerechnetes Licht für den Rundgang (V14): Umgebungsverdeckung und weiche Schatten je Eckpunkt.
//
// Ablauf: Die gebaute Seite wird in Chromium geladen, der Rundgang liefert über __JR.bakeKit() die Geometrie
// (Gebäude, Innenräume, Umgebung, Türen geschlossen, Laubkarten) und die Leuchten. Hier in Node wird daraus ein
// BVH gebaut und je Eckpunkt per Raytracing gerechnet:
//   ao  Aussen: Himmelssichtbarkeit (kosinusgewichtet, nach Himmelshelligkeit der blauen Stunde gewichtet)
//       Innen:  Umgebungsverdeckung mit Distanzabfall (Ecken, Kanten, unter Möbeln)
//   lv  Sichtbarkeit der Leuchten, gewichtet nach ihrem Beitrag (weiche Schatten durch Flächen-Abtastung)
//   sv  Überarbeitung 2: Sichtbarkeit der Sonne (Tageslicht, Richtung aus dem Rundgang), Kegel ±1,5° → Schlagschatten aussen,
//       Sonnenflecken innen (Strahlen durch die Fensteröffnungen)
//   ws  Überarbeitung 2: innen Anteil der Himmelsstrahlen, die den Raum durch eine Öffnung verlassen (Lichtabfall vom Fenster)
// Laubkarten verschatten teilweise (Durchlässigkeit 45 %). Ergebnis: assets/bake/licht.json {hash, data}
// (data = zlib/deflate, base64; je Satz G, INT, ENV nacheinander ao-, lv-, sv- und ws-Bytes). Der Rundgang prüft den Hash
// und rechnet ohne passende Daten zur Laufzeit (ohne Schatten).
//
// Aufruf: python3 build.py && node tools/bake-light.js && python3 build.py
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), zlib = require('zlib');
const ROOT = path.resolve(__dirname, '..');
const PAGE = 'file://' + path.join(ROOT, 'dist/immoready-vorschau.html');
const OUT = path.join(ROOT, 'assets/bake/licht.json');
const SKIP = new Set([3, 10, 15, 16, 14]); // Glas fern, Leuchte, Himmel, Türglas, Spiegelfläche (liegt auf dem Schrank): verschatten nicht

/* ---------- BVH über Dreiecke ---------- */
function buildBVH(tri) {
  const n = tri.length / 9, idx = new Uint32Array(n), cen = new Float32Array(n * 3), bmin = new Float32Array(n * 3), bmax = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    idx[i] = i;
    for (let a = 0; a < 3; a++) {
      const v0 = tri[i * 9 + a], v1 = tri[i * 9 + 3 + a], v2 = tri[i * 9 + 6 + a];
      bmin[i * 3 + a] = Math.min(v0, v1, v2); bmax[i * 3 + a] = Math.max(v0, v1, v2); cen[i * 3 + a] = (bmin[i * 3 + a] + bmax[i * 3 + a]) / 2;
    }
  }
  const nodes = []; // [minx,miny,minz,maxx,maxy,maxz,left|start,right|count,isLeaf]
  function build(s, e) {
    const node = { mn: [1e30, 1e30, 1e30], mx: [-1e30, -1e30, -1e30] }, cmn = [1e30, 1e30, 1e30], cmx = [-1e30, -1e30, -1e30];
    for (let i = s; i < e; i++) { const t = idx[i]; for (let a = 0; a < 3; a++) { node.mn[a] = Math.min(node.mn[a], bmin[t * 3 + a]); node.mx[a] = Math.max(node.mx[a], bmax[t * 3 + a]); cmn[a] = Math.min(cmn[a], cen[t * 3 + a]); cmx[a] = Math.max(cmx[a], cen[t * 3 + a]); } }
    const id = nodes.length; nodes.push(node);
    if (e - s <= 4) { node.leaf = true; node.s = s; node.c = e - s; return id; }
    let ax = 0; for (let a = 1; a < 3; a++) if (cmx[a] - cmn[a] > cmx[ax] - cmn[ax]) ax = a;
    // binned SAH (12 Bins)
    const B = 12, cnt = new Array(B).fill(0), bb = Array.from({ length: B }, () => [1e30, 1e30, 1e30, -1e30, -1e30, -1e30]), ext = cmx[ax] - cmn[ax];
    let mid;
    if (ext < 1e-9) mid = (s + e) >> 1;
    else {
      for (let i = s; i < e; i++) { const t = idx[i]; let b = Math.min(B - 1, Math.floor((cen[t * 3 + ax] - cmn[ax]) / ext * B)); cnt[b]++; const q = bb[b]; for (let a = 0; a < 3; a++) { q[a] = Math.min(q[a], bmin[t * 3 + a]); q[3 + a] = Math.max(q[3 + a], bmax[t * 3 + a]); } }
      const area = q => { const dx = q[3] - q[0], dy = q[4] - q[1], dz = q[5] - q[2]; return dx < 0 ? 0 : 2 * (dx * dy + dy * dz + dz * dx); };
      let best = 1e30, bi = -1;
      for (let k = 1; k < B; k++) {
        const L = [1e30, 1e30, 1e30, -1e30, -1e30, -1e30], R = [1e30, 1e30, 1e30, -1e30, -1e30, -1e30]; let nl = 0, nr = 0;
        for (let j = 0; j < k; j++) { nl += cnt[j]; for (let a = 0; a < 3; a++) { L[a] = Math.min(L[a], bb[j][a]); L[3 + a] = Math.max(L[3 + a], bb[j][3 + a]); } }
        for (let j = k; j < B; j++) { nr += cnt[j]; for (let a = 0; a < 3; a++) { R[a] = Math.min(R[a], bb[j][a]); R[3 + a] = Math.max(R[3 + a], bb[j][3 + a]); } }
        if (!nl || !nr) continue; const c = area(L) * nl + area(R) * nr; if (c < best) { best = c; bi = k; }
      }
      if (bi < 0) mid = (s + e) >> 1;
      else {
        let i = s, j = e - 1;
        while (i <= j) { const t = idx[i]; const b = Math.min(B - 1, Math.floor((cen[t * 3 + ax] - cmn[ax]) / ext * B)); if (b < bi) i++; else { const tmp = idx[i]; idx[i] = idx[j]; idx[j] = tmp; j--; } }
        mid = i; if (mid === s || mid === e) mid = (s + e) >> 1;
      }
    }
    node.l = build(s, mid); node.r = build(mid, e); return id;
  }
  build(0, n);
  const N = nodes.length, F = new Float32Array(N * 6), I = new Int32Array(N * 3);
  nodes.forEach((d, i) => { for (let a = 0; a < 3; a++) { F[i * 6 + a] = d.mn[a]; F[i * 6 + 3 + a] = d.mx[a]; } if (d.leaf) { I[i * 3] = d.s; I[i * 3 + 1] = d.c; I[i * 3 + 2] = 1; } else { I[i * 3] = d.l; I[i * 3 + 1] = d.r; I[i * 3 + 2] = 0; } });
  // Dreiecke in BVH-Reihenfolge, vorab Kanten
  const T = new Float32Array(n * 9);
  for (let i = 0; i < n; i++) { const t = idx[i]; const o = i * 9, p = t * 9; T[o] = tri[p]; T[o + 1] = tri[p + 1]; T[o + 2] = tri[p + 2]; for (let a = 0; a < 3; a++) { T[o + 3 + a] = tri[p + 3 + a] - tri[p + a]; T[o + 6 + a] = tri[p + 6 + a] - tri[p + a]; } }
  return { F, I, T, n };
}
const stack = new Int32Array(256);
/* nächster Treffer (any=true: erster beliebiger) bis tmax; liefert Distanz oder Infinity */
function trace(bvh, ox, oy, oz, dx, dy, dz, tmax, any) {
  const { F, I, T } = bvh, ix = 1 / dx, iy = 1 / dy, iz = 1 / dz; let sp = 0, best = tmax; stack[sp++] = 0;
  while (sp) {
    const nd = stack[--sp], f = nd * 6;
    let t1 = (F[f] - ox) * ix, t2 = (F[f + 3] - ox) * ix, tn = Math.min(t1, t2), tf = Math.max(t1, t2);
    t1 = (F[f + 1] - oy) * iy; t2 = (F[f + 4] - oy) * iy; tn = Math.max(tn, Math.min(t1, t2)); tf = Math.min(tf, Math.max(t1, t2));
    t1 = (F[f + 2] - oz) * iz; t2 = (F[f + 5] - oz) * iz; tn = Math.max(tn, Math.min(t1, t2)); tf = Math.min(tf, Math.max(t1, t2));
    if (tf < Math.max(tn, 0) || tn > best) continue;
    const k = nd * 3;
    if (I[k + 2]) {
      for (let i = I[k], e = I[k] + I[k + 1]; i < e; i++) {
        const o = i * 9, e1x = T[o + 3], e1y = T[o + 4], e1z = T[o + 5], e2x = T[o + 6], e2y = T[o + 7], e2z = T[o + 8];
        const px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x, det = e1x * px + e1y * py + e1z * pz;
        if (det > -1e-9 && det < 1e-9) continue; const inv = 1 / det;
        const sx = ox - T[o], sy = oy - T[o + 1], sz = oz - T[o + 2], u = (sx * px + sy * py + sz * pz) * inv; if (u < 0 || u > 1) continue;
        const qx = sy * e1z - sz * e1y, qy = sz * e1x - sx * e1z, qz = sx * e1y - sy * e1x, v = (dx * qx + dy * qy + dz * qz) * inv; if (v < 0 || u + v > 1) continue;
        const t = (e2x * qx + e2y * qy + e2z * qz) * inv; if (t > 1e-4 && t < best) { best = t; if (any) return t; }
      }
    } else { stack[sp++] = I[k]; stack[sp++] = I[k + 1]; }
  }
  return best;
}

(async () => {
  const t0 = Date.now();
  const b = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 400, height: 300 } });
  await p.goto(PAGE);
  await p.waitForFunction(() => window.__JR && window.__JR.bakeKit, null, { timeout: 60000 });
  const kit = await p.evaluate(() => window.__JR.bakeKit());
  await b.close();
  console.log('Geometrie geladen', ((Date.now() - t0) / 1000).toFixed(1), 's · Hash', kit.hash);

  /* Verschatter */
  const opaque = [], leaves = [];
  /* Bewegte Türen verschatten nicht: ihr Schatten wäre fest eingebrannt und beim Öffnen falsch. Die Türblätter selbst
     erhalten im Rundgang Licht für «geschlossen» und «offen», das nach Öffnungsgrad gemischt wird. */
  kit.sets.forEach(S => { for (let v = 0; v < S.M.length; v += 3) { if (SKIP.has(S.M[v])) continue; for (let k = 0; k < 9; k++) opaque.push(S.P[v * 3 + k]); } });
  const FP = kit.foliage.P; for (let i = 0; i < FP.length; i++) leaves.push(FP[i]);
  const BO = buildBVH(Float32Array.from(opaque)), BL = buildBVH(Float32Array.from(leaves));
  console.log('BVH:', BO.n, 'Dreiecke,', BL.n, 'Laubdreiecke ·', ((Date.now() - t0) / 1000).toFixed(1), 's');

  const LIT = kit.lights, KEY = [-0.857, 0.302, 0.423], XW = 5.4, SUN = kit.sund, NSUN = 16, SUNR = Math.tan(1.5 * Math.PI / 180);
  const kl = Math.hypot(...KEY); KEY[0] /= kl; KEY[1] /= kl; KEY[2] /= kl;
  function roomOf(q) { if (q[1] < 0.45 || q[1] > 3.2 || q[0] < -3.1 || q[0] > 8.7 || q[2] < -1.1 || q[2] > 5.2) return 0; if (q[0] < 3) return 1; if (q[0] < XW) return q[2] > 2.4 ? 2 : 3; return 4; }
  function lightW(q, n, m) {
    const rm = roomOf(q), out = [];
    for (let i = 0; i < LIT.length; i++) {
      const l = LIT[i]; if (l[7] !== rm) continue;
      const ex = l[0] - q[0], ey = l[1] - q[1], ez = l[2] - q[2], ds = Math.sqrt(ex * ex + ey * ey + ez * ez); if (ds >= l[3]) continue;
      let a = 1 - ds / l[3]; a *= a; let nd = (n[0] * ex + n[1] * ey + n[2] * ez) / (ds || 1); if (m === 4) nd = nd * 0.55 + 0.45;
      if (nd > 0) out.push([i, nd * a * (l[4] + l[5] + l[6])]);
    }
    return out;
  }
  /* Hemisphärenrichtungen (kosinusgewichtet, Fibonacci) */
  const NS = 40, HS = [], NWS = 192, HW = [];
  for (let i = 0; i < NS; i++) { const u = (i + 0.5) / NS, r = Math.sqrt(u), ph = i * 2.399963; HS.push([r * Math.cos(ph), Math.sqrt(1 - u), r * Math.sin(ph)]); }
  for (let i = 0; i < NWS; i++) { const u = (i + 0.5) / NWS, r = Math.sqrt(u), ph = i * 2.399963; HW.push([r * Math.cos(ph), Math.sqrt(1 - u), r * Math.sin(ph)]); }
  function frame(n) { const a = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]; let t = [n[1] * a[2] - n[2] * a[1], n[2] * a[0] - n[0] * a[2], n[0] * a[1] - n[1] * a[0]]; const tl = Math.hypot(...t); t = t.map(x => x / tl); const bt = [n[1] * t[2] - n[2] * t[1], n[2] * t[0] - n[0] * t[2], n[0] * t[1] - n[1] * t[0]]; return [t, bt]; }
  function hash(i) { let x = Math.imul(i ^ 0x9e3779b9, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16; return (x >>> 0) / 4294967296; }
  function vis(ox, oy, oz, dx, dy, dz, tmax) {
    if (trace(BO, ox, oy, oz, dx, dy, dz, tmax, true) < tmax) return 0;
    return trace(BL, ox, oy, oz, dx, dy, dz, tmax, true) < tmax ? 0.45 : 1;
  }
  function sample(q, n, m, vi) {
    const rm = roomOf(q), [t, bt] = frame(n), rot = hash(vi) * Math.PI * 2, cr = Math.cos(rot), sr = Math.sin(rot);
    const ox = q[0] + n[0] * 0.012, oy = q[1] + n[1] * 0.012, oz = q[2] + n[2] * 0.012;
    let acc = 0, wsum = 0;
    for (let i = 0; i < NS; i++) {
      const h = HS[i], hx = h[0] * cr - h[2] * sr, hz = h[0] * sr + h[2] * cr;
      let dx = t[0] * hx + n[0] * h[1] + bt[0] * hz, dy = t[1] * hx + n[1] * h[1] + bt[1] * hz, dz = t[2] * hx + n[2] * h[1] + bt[2] * hz;
      if (rm) {
        /* innen: nur nahe Verschatter zählen (Ecken, Kanten, unter Möbeln) – das Raumlicht selbst steckt im Grundwert */
        const d = trace(BO, ox, oy, oz, dx, dy, dz, 1.2, false);
        acc += d < 1.2 ? 0.2 + 0.8 * Math.pow(d / 1.2, 0.7) : 1; wsum += 1;
      } else {
        /* aussen: Himmel nach Helligkeit gewichtet; Strahlen nach unten treffen den Boden – der wirft Licht zurück,
           daher zählt dort nur ein naher Treffer anteilig (Kontaktschatten am Fuss von Wänden, Pflanzen, Möbeln) */
        const w = 0.3 + 0.7 * Math.max(dy, 0) + 0.8 * Math.pow(Math.max(dx * KEY[0] + dy * KEY[1] + dz * KEY[2], 0), 2);
        let v;
        if (dy >= -0.05) v = vis(ox, oy, oz, dx, dy, dz, 60);
        else { const d = trace(BO, ox, oy, oz, dx, dy, dz, 3.0, false); v = d < 3.0 ? 0.45 + 0.55 * d / 3.0 : 1; }
        acc += w * v; wsum += w;
      }
    }
    const ao = acc / wsum;
    /* innen: Himmel durch Öffnungen – eigene, dichtere Abtastung (NWS Richtungen, kosinusgewichtet): Fensteröffnungen sind klein
       im Halbraum, mit den 40 Strahlen der Verdeckung blieb der Wert bei der Hälfte der Punkte 0 und wurde fleckig */
    let wsk = 0;
    if (rm) for (let i = 0; i < NWS; i++) {
      const h = HW[i], hx = h[0] * cr - h[2] * sr, hz = h[0] * sr + h[2] * cr;
      const dx = t[0] * hx + n[0] * h[1] + bt[0] * hz, dy = t[1] * hx + n[1] * h[1] + bt[1] * hz, dz = t[2] * hx + n[2] * h[1] + bt[2] * hz;
      if (trace(BO, ox, oy, oz, dx, dy, dz, 40, true) < 40) continue;
      wsk += trace(BL, ox, oy, oz, dx, dy, dz, 40, true) < 40 ? 0.45 : 1;
    }
    /* Leuchten: weiche Schatten (Kugelquelle r ≈ 8 cm, 8 Proben); Treffer in den letzten 15 cm (Leuchtengehäuse) zählen nicht */
    const ws = lightW(q, n, m); let lw = 0, lsum = 0;
    for (const [li, w] of ws) {
      const l = LIT[li]; let v = 0;
      const NLS = rm ? 16 : 8;
      for (let k = 0; k < NLS; k++) {
        const a = hash(vi * 31 + k * 7 + li) * Math.PI * 2, z = hash(vi * 17 + k * 13 + li * 3) * 2 - 1, rr = Math.sqrt(1 - z * z) * 0.08;
        const lx = l[0] + Math.cos(a) * rr, ly = l[1] + z * 0.08, lz = l[2] + Math.sin(a) * rr;
        let dx = lx - ox, dy = ly - oy, dz = lz - oz; const dd = Math.hypot(dx, dy, dz); dx /= dd; dy /= dd; dz /= dd;
        v += vis(ox, oy, oz, dx, dy, dz, Math.max(0.01, dd - 0.15));
      }
      lw += w * v / NLS; lsum += w;
    }
    const lv = lsum > 0 ? lw / lsum : 1;
    /* Sonne: nur für Flächen, die ihr zugewandt sind; Kegel ±1,5° (weiche Schattenkante), Laub lässt 45 % durch */
    let sv = 0; const nl = n[0] * SUN[0] + n[1] * SUN[1] + n[2] * SUN[2];
    if (nl > 0.0) {
      const [st, sb] = frame(SUN);
      for (let k = 0; k < NSUN; k++) {
        const a = (k + hash(vi * 7 + k)) / NSUN * Math.PI * 2, r = Math.sqrt((k + 0.5) / NSUN) * SUNR;
        let dx = SUN[0] + (st[0] * Math.cos(a) + sb[0] * Math.sin(a)) * r, dy = SUN[1] + (st[1] * Math.cos(a) + sb[1] * Math.sin(a)) * r, dz = SUN[2] + (st[2] * Math.cos(a) + sb[2] * Math.sin(a)) * r;
        const dl = Math.hypot(dx, dy, dz); dx /= dl; dy /= dl; dz /= dl;
        sv += vis(ox, oy, oz, dx, dy, dz, 200);
      }
      sv /= NSUN;
    }
    return [ao, lv, sv, rm ? wsk / NWS : 1];
  }

  const parts = [], info = {};
  let vi = 0;
  for (const S of kit.sets) {
    const nv = S.P.length / 3, AO = new Uint8Array(nv), LV = new Uint8Array(nv), SV = new Uint8Array(nv), WS = new Uint8Array(nv), cache = new Map();
    let uniq = 0; const ts = Date.now();
    const U = [], vk = new Array(nv);
    for (let v = 0; v < nv; v++) {
      const q = [S.P[v * 3], S.P[v * 3 + 1], S.P[v * 3 + 2]], n = [S.N[v * 3], S.N[v * 3 + 1], S.N[v * 3 + 2]];
      const key = q.map(x => Math.round(x * 1000)).join(',') + '|' + n.map(x => Math.round(x * 100)).join(',') + '|' + S.M[v];
      let r = cache.get(key);
      if (r === undefined) { const sm = sample(q, n, S.M[v], vi++); r = U.length; U.push({ q, n, ao: sm[0], lv: sm[1], sv: sm[2], ws: sm[3] }); cache.set(key, r); uniq++; }
      vk[v] = r;
    }
    /* V17: Rauschen glätten – Mittel über Nachbarn im Umkreis von 5 cm mit ähnlicher Normale (Abstand und Winkel gewichtet).
       Verhindert Flecken und Fächermuster auf fein unterteilten Nahobjekten (WC-Deckel, Keramik, Platten); grosse Flächen bleiben unverändert. */
    const R = 0.05, cell = new Map(), ck = (x, y, z) => x + ',' + y + ',' + z;
    U.forEach((u, i) => { const k = ck(Math.floor(u.q[0] / R), Math.floor(u.q[1] / R), Math.floor(u.q[2] / R)); if (!cell.has(k)) cell.set(k, []); cell.get(k).push(i); });
    const AOs = new Float32Array(U.length), LVs = new Float32Array(U.length), SVs = new Float32Array(U.length), WSs = new Float32Array(U.length);
    U.forEach((u, i) => {
      const cx = Math.floor(u.q[0] / R), cy = Math.floor(u.q[1] / R), cz = Math.floor(u.q[2] / R); let wa = 0, sa = 0, sl = 0, ss = 0, sw = 0;
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
        const L = cell.get(ck(cx + dx, cy + dy, cz + dz)); if (!L) continue;
        for (const j of L) { const o = U[j], d = Math.hypot(o.q[0] - u.q[0], o.q[1] - u.q[1], o.q[2] - u.q[2]); if (d > R) continue;
          const nd = o.n[0] * u.n[0] + o.n[1] * u.n[1] + o.n[2] * u.n[2]; if (nd < 0.8) continue;
          const w = (1 - d / R) * (nd - 0.8) / 0.2 + (j === i ? 1 : 0); wa += w; sa += w * o.ao; sl += w * o.lv; ss += w * o.sv; sw += w * o.ws; }
      }
      AOs[i] = sa / wa; LVs[i] = sl / wa; SVs[i] = ss / wa; WSs[i] = sw / wa;
    });
    /* ws ändert sich im Raum nur langsam (Fensterlicht): zusätzlich über 35 cm glätten – nur Punkte desselben Raums mit ähnlicher
       Normale (keine Mischung durch Wände hindurch); Kanten der Sonnenflecken (sv) bleiben unberührt */
    const RW = 0.35, cw = new Map(), cwk = (x, y, z) => x + ',' + y + ',' + z, rmU = U.map(u => roomOf(u.q));
    U.forEach((u, i) => { if (!rmU[i]) return; const k = cwk(Math.floor(u.q[0] / RW), Math.floor(u.q[1] / RW), Math.floor(u.q[2] / RW)); if (!cw.has(k)) cw.set(k, []); cw.get(k).push(i); });
    const WS2 = Float32Array.from(WSs);
    U.forEach((u, i) => {
      if (!rmU[i]) return; const cx = Math.floor(u.q[0] / RW), cy = Math.floor(u.q[1] / RW), cz = Math.floor(u.q[2] / RW); let wa = 0, sw = 0;
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
        const L = cw.get(cwk(cx + dx, cy + dy, cz + dz)); if (!L) continue;
        for (const j of L) { if (rmU[j] !== rmU[i]) continue; const o = U[j], d = Math.hypot(o.q[0] - u.q[0], o.q[1] - u.q[1], o.q[2] - u.q[2]); if (d > RW) continue;
          const nd = o.n[0] * u.n[0] + o.n[1] * u.n[1] + o.n[2] * u.n[2]; if (nd < 0.9) continue; const w = 1 - d / RW; wa += w; sw += w * WSs[j]; }
      }
      if (wa > 0) WS2[i] = sw / wa;
    });
    WS2.forEach((v, i) => { WSs[i] = v; });
    const c01 = x => Math.round(Math.max(0, Math.min(1, x)) * 255);
    for (let v = 0; v < nv; v++) { const r = vk[v]; AO[v] = c01(AOs[r]); LV[v] = c01(LVs[r]); SV[v] = c01(SVs[r]); WS[v] = c01(WSs[r]); }
    /* Verteilung von ws innen (zum Abgleich mit WSREF im Rundgang) */
    const wsIn = U.filter(u => u.ws < 1).map(u => u.ws).sort((a, b) => a - b), pc = f => wsIn.length ? +wsIn[Math.floor(f * (wsIn.length - 1))].toFixed(3) : null;
    if (wsIn.length) console.log(S.name, 'ws innen: 10/50/90/99 %', pc(0.1), pc(0.5), pc(0.9), pc(0.99));
    if (process.env.WS_STATS) [1, 2, 3, 4].forEach(r => ['Boden', 'Wand'].forEach(kind => {
      const a = U.map((u, i) => [u, i]).filter(([u, i]) => roomOf(u.q) === r && (kind === 'Boden' ? u.n[1] > 0.7 : Math.abs(u.n[1]) < 0.3)).map(([u, i]) => WSs[i]).sort((x, y) => x - y);
      if (a.length) console.log('  Raum', r, kind, a.length, 'ws 10/50/90 %', +a[Math.floor(0.1 * (a.length - 1))].toFixed(3), +a[Math.floor(0.5 * (a.length - 1))].toFixed(3), +a[Math.floor(0.9 * (a.length - 1))].toFixed(3));
    }));
    parts.push(AO, LV, SV, WS); info[S.name] = { vertices: nv, unique: uniq, s: +((Date.now() - ts) / 1000).toFixed(1) };
    console.log(S.name, info[S.name]);
  }
  const raw = Buffer.concat(parts.map(a => Buffer.from(a.buffer))), z = zlib.deflateSync(raw, { level: 9 });
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ hash: kit.hash, data: z.toString('base64'), info: { rays: 'AO ' + NS + ' je Eckpunkt, innen Himmel durch Öffnungen ' + NWS + ' (geglättet 35 cm im Raum), 8 je Leuchte (innen 16), Sonne ' + NSUN + ' (±1,5°), geglättet r = 5 cm', bytes: raw.length, deflate: z.length, sets: info, created: new Date().toISOString() } }));
  console.log('geschrieben:', path.relative(ROOT, OUT), raw.length, 'Bytes roh,', z.length, 'Bytes komprimiert ·', ((Date.now() - t0) / 1000).toFixed(1), 's');
})();
