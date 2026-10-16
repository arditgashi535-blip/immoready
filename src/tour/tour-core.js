/* ===================== ImmoReady-Rundgang · Kern (V14 · realistische Architekturvisualisierung) =====================
   Eigenes WebGL, keine Bibliothek. Mehrfachinstanzfähig: IRTour.create(root, opts) liefert eine Instanz
   mit destroy(). Kamera, Türen, Hervorhebung und Texte werden aus einer Fortschrittsvariable p (0…1)
   berechnet – vorwärts und rückwärts identisch. Konfiguration kommt aus rise.json (window.IR_RISE).
   Zeitbasiert (nicht vom Fortschritt abhängig) sind nur zwei kurze, einmalige Akzente: die Scan-Kante beim
   Start (≈1,2 s) und die Hervorhebung am Waschtisch (≈2,6 s). Beide entfallen bei «Bewegung reduzieren».

   opts.config        Tour-Konfiguration (aus rise.json, siehe tools/rise.py → tour_config)
   opts.mode          'scroll' (Seitenscroll steuert p) | 'steps' (Stationen, «Weiter»/«Zurück»)
   opts.emit(n, d)    Ereignisse: tour-ready, station-change, request-quote, request-contact, tour-error
   opts.interceptQuote(detail) / opts.interceptContact(detail) → true: Klick nicht intern ausführen
   opts.deferStart    3D erst nach dem Laden starten (Standbild + Text sind sofort da)
   opts.textures      {t1:[4 URLs], t2:[4 URLs], laub:URL} – Graustufen-Materialtexturen (werden zu RGBA gepackt) und Laubatlas
   opts.bake          {hash, data} – vorab gerechnetes Licht (Umgebungsverdeckung, weiche Schatten), base64 + deflate
*/
(function (global) {
  if (global.IRTour) return;

  function create(root, opts) {
    opts = opts || {};
    var C = opts.config;
    if (!C || !root) throw new Error('IRTour: config und root erforderlich');
    var ST = C.stations, K = C.keyframes, HL = C.highlights.sanitaer;
    var D_HT = C.doors.haustuer, D_WT = C.doors.wohnungstuer, D_TT = C.doors.terrassentuer;
    var SERVICES = C.services || [];
    var emit = typeof opts.emit === 'function' ? opts.emit : function () {};
    var win = root.ownerDocument.defaultView || window, doc = root.ownerDocument;
    var RMQ = win.matchMedia('(prefers-reduced-motion: reduce)'), SMALL = win.matchMedia('(max-width:700px), (max-height:540px)'); /* V17.1: auch niedrige Bildschirme (Smartphone quer) – Bildmodus mit normalem Scrollen statt klebender 3D-Bühne */
    var reqMode = opts.mode === 'scroll' ? 'scroll' : 'steps';

    /* ---------- Aufräumen ---------- */
    var disposers = [], destroyed = false;
    function on(t, ev, fn, o) { t.addEventListener(ev, fn, o); disposers.push(function () { t.removeEventListener(ev, fn, o); }); }
    function onMQ(q, fn) { if (q.addEventListener) { q.addEventListener('change', fn); disposers.push(function () { q.removeEventListener('change', fn); }); } }

    /* ---------- Zustand ---------- */
    var stage = root.querySelector('.jr-stage'), canvas = stage && stage.querySelector('canvas');
    var gl = null, PM, PL, sets = [], w = 0, h = 0, dpr = 1, running = false, raf = 0, visible = true, ready = false;
    var p = 0, ps = 0, sweep = 1e4, lastSt = -1, capEl = null, labels = [], hots = [], lastT = 0, tau = C.smoothing.tauMs;
    /* Leistungspunkte (Markup aus rise.json, data-hot = Weltpunkt): sichtbar, wenn die Kamera an ihrer Station ruht */
    function hotOn(l, q) { return stationOf(q) === l.st && Math.abs(q - ST[l.st].hold) < 0.03; }
    var started = false, mode = 'static', cur = 0, ro = null, io = null, startTimer = 0, idleId = 0, scrollTick = false;
    var WALLS = [], LIT = [], OCC = [], built = false, camOverride = null;
    /* Scan-Kante beim Start: einmal je Instanz, erst nach dem ersten fertigen Bild */
    var SCAN_MS = 1200, SCAN_DELAY = 420, scan = { state: 'idle', start: 0, end: 0, count: 0 };
    /* Hervorhebung am Waschtisch: kurz einblenden, halten, ausblenden */
    var pulse = { armed: true, t0: 0, last: 0 };
    var buildMs = 0, bakeMs = 0;
    /* Aufbau in Etappen (Geometrieteile, dann Licht je Satz) – beim Start auf Leerlauf-Phasen verteilt.
       Vorab gerechnetes Licht (opts.bake) wird parallel entpackt; die Licht-Etappen warten darauf höchstens 2,5 s. */
    var baked = false, partsDone = 0, bakeQ = null, PB = null, pbState = 'none', pbT0 = 0, pbRaw = null, pbHash = '', pbUsed = false;
    function buildGeo() { var t0 = Date.now(); T = G; SUB = 0; SUBMODE = 'all'; MAT = 0; BUILD_PARTS[partsDone++](); T = G; buildMs += Date.now() - t0; if (partsDone === BUILD_PARTS.length) built = true; }
    /* eine Etappe ausführen; true = alles fertig. noWait: nicht auf das vorab gerechnete Licht warten */
    function buildStep(noWait) {
      if (partsDone < BUILD_PARTS.length) { buildGeo(); return false; }
      if (!bakeQ) {
        if (pbState === 'loading' && !noWait && Date.now() - pbT0 < 2500) return false;
        var t1 = Date.now(); applyBake(); bakeMs += Date.now() - t1;
        bakeQ = [[G], [INT], [ENV], [D, doorM(0), doorM(D_HT.open[1])], [A, aptM(0), aptM(D_WT.open[1])], [TT, terM(0), terM(D_TT.open[1])], [FOL]];
        return false;
      }
      if (bakeQ.length) {
        var t0 = Date.now(), j = bakeQ.shift(), pb = PB && PB[j[0].name];
        /* bewegte Türen: Licht für geschlossen und offen, der Shader mischt nach Öffnungsgrad (keine falschen Schatten) */
        if (j[2]) { bakeSet(j[0], j[2]); var L2 = j[0].L; bakeSet(j[0], j[1]); j[0].L2 = L2; }
        else bakeSet(j[0], j[1], pb && pb.ao, pb && pb.lv);
        bakeMs += Date.now() - t0; if (!bakeQ.length) baked = true; return baked;
      }
      return true;
    }
    function ensureGeo() { while (partsDone < BUILD_PARTS.length) buildGeo(); }
    function ensureBuilt() { while (!buildStep(true)) {} }
    /* Prüfsumme der Geometrie: vorab gerechnetes Licht passt nur zur exakt gleichen Szene */
    function geoHash() {
      ensureGeo(); var hsh = 7;
      [G, INT, ENV].forEach(function (x) { for (var i = 0; i < x.P.length; i += 7) hsh = (hsh * 31 + Math.round(x.P[i] * 1000)) % 2147483647; });
      return 'v14-' + G.P.length / 3 + '-' + INT.P.length / 3 + '-' + ENV.P.length / 3 + '-' + hsh;
    }
    function loadBake() {
      var src = typeof opts.bake === 'function' ? opts.bake() : opts.bake;
      if (!src || !win.DecompressionStream || !win.Response || !win.Blob) { pbState = 'off'; return; }
      pbState = 'loading'; pbT0 = Date.now();
      var j0 = typeof src === 'string' ? win.fetch(src).then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); }) : win.Promise.resolve(src);
      j0.then(function (j) {
        pbHash = j.hash; var bin = win.atob(j.data), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
        return new win.Response(new win.Blob([u]).stream().pipeThrough(new win.DecompressionStream('deflate'))).arrayBuffer();
      }).then(function (buf) { if (destroyed) return; pbRaw = new Uint8Array(buf); pbState = 'ready'; }).catch(function () { pbState = 'off'; });
    }
    function applyBake() {
      PB = null; pbUsed = false; if (pbState !== 'ready' || !pbRaw) return;
      var nG = G.P.length / 3, nI = INT.P.length / 3, nE = ENV.P.length / 3;
      if (pbRaw.length !== 2 * (nG + nI + nE) || pbHash !== geoHash()) { if (win.console) win.console.info('ImmoReady-Rundgang: vorab gerechnetes Licht passt nicht zur Geometrie – Licht wird zur Laufzeit gerechnet.'); return; }
      var o = 0; PB = {};
      [[G, nG], [INT, nI], [ENV, nE]].forEach(function (x) { PB[x[0].name] = { ao: pbRaw.subarray(o, o + x[1]), lv: pbRaw.subarray(o + x[1], o + 2 * x[1]) }; o += 2 * x[1]; });
      pbUsed = true;
    }
    /* ---------- Materialtexturen: 8 Graustufenbilder → 2 RGBA-Texturen (je 4 Kanäle), dazu der Laubatlas ---------- */
    var TX = { state: 'none', t0: 0, imgs: null, t1: null, t2: null, lb: null, n1: null };
    function loadTex() {
      var s0 = typeof opts.textures === 'function' ? opts.textures() : opts.textures;
      if (!s0 || !s0.t1 || !s0.t2 || !s0.laub) { TX.state = 'off'; return; }
      TX.state = 'loading'; TX.t0 = Date.now();
      var list = s0.t1.concat(s0.t2, [s0.laub]), left = list.length, imgs = [];
      list.forEach(function (u, i) {
        var im = new win.Image(); if (!/^data:/.test(u)) im.crossOrigin = 'anonymous';
        im.onload = im.onerror = function (e) { imgs[i] = e.type === 'load' ? im : null; if (--left === 0 && !destroyed) { TX.imgs = imgs; if (gl) uploadTex(); } };
        im.src = u;
      });
    }
    function packTex(imgs, N) {
      var cv = doc.createElement('canvas'); cv.width = cv.height = N; var cx = cv.getContext('2d', { willReadFrequently: true }), out = new Uint8Array(N * N * 4), j, m = N * N;
      for (var k = 0; k < 4; k++) {
        var im = imgs[k]; if (!im) { for (j = 0; j < m; j++) out[j * 4 + k] = 128; continue; }
        cx.clearRect(0, 0, N, N); cx.drawImage(im, 0, 0, N, N); var dd = cx.getImageData(0, 0, N, N).data; for (j = 0; j < m; j++) out[j * 4 + k] = dd[j * 4];
      }
      return out;
    }
    function mkTex(N, data, img) {
      var t = gl.createTexture(); textures.push(t); gl.bindTexture(gl.TEXTURE_2D, t);
      if (img) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img); else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, N, N, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      if (N > 1) { gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, EXT.sw === true ? gl.LINEAR_MIPMAP_NEAREST : gl.LINEAR_MIPMAP_LINEAR); gl.generateMipmap(gl.TEXTURE_2D); if (EXT.an) gl.texParameterf(gl.TEXTURE_2D, EXT.an.TEXTURE_MAX_ANISOTROPY_EXT, EXT.anMax); }
      else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      return t;
    }
    var EXT = { an: null, anMax: 1, der: false, sw: false };
    function uploadTex() {
      if (!gl || !TX.imgs || TX.t1) return;
      try {
        TX.t1 = mkTex(512, packTex(TX.imgs.slice(0, 4), 512)); TX.t2 = mkTex(1024, packTex(TX.imgs.slice(4, 8), 1024));
        if (TX.imgs[8]) TX.lb = mkTex(1024, null, TX.imgs[8]);
        TX.state = 'ready';
      } catch (e) { TX.state = 'off'; TX.t1 = TX.t2 = TX.lb = null; }
      TX.imgs = null; if (running) request();
    }
    var GR = []; function grp(n, set) { if (set) T = set; GR.push([n, T, T.P.length / 3]); }

    /* ---------- Mathe ---------- */
    function persp(f, a, n, fa) { var t = 1 / Math.tan(f / 2), nf = 1 / (n - fa); return [t / a, 0, 0, 0, 0, t, 0, 0, 0, 0, (fa + n) * nf, -1, 0, 0, 2 * fa * n * nf, 0]; }
    function nrm(v) { var l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
    function cr(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
    function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
    function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
    function look(e, c, u) { var z = nrm([e[0] - c[0], e[1] - c[1], e[2] - c[2]]), x = nrm(cr(u, z)), y = cr(z, x); return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1]; }
    function mul(a, b) { var o = new Array(16); for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) { var s = 0; for (var k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; } return o; }
    /* sRGB → linear (Farben werden linear gespeichert und beleuchtet) */
    function lin(v) { v = Math.max(0, Math.min(1, v)); return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
    function lin3(c) { return [lin(c[0]), lin(c[1]), lin(c[2])]; }
    function hex(c) { return [parseInt(c.substr(1, 2), 16) / 255, parseInt(c.substr(3, 2), 16) / 255, parseInt(c.substr(5, 2), 16) / 255]; }
    function sstep(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
    var seed = 20261008; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

    /* ---------- Geometrie (Grundkörper → Dreiecke + Konturlinien) ----------
       Jede Ecke trägt Position, Normale, Farbe, Leuchtkraft und Material (MAT, siehe Shader). */
    function S(name) { return { name: name, P: [], N: [], C: [], E: [], M: [], L: [], SL: [], SC: [], LP: [], LW: [] }; }
    /* Zeichengruppen: BLD = Gebäudehülle + Garten (G), INT = Innenräume, ENV = Wiese und Ferne, D/A/TT = Türen */
    var G = S('BLD'), INT = S('INT'), ENV = S('ENV'), D = S('D'), A = S('A'), TT = S('TT'), SKY = S('SKY'), T = G, MAT = 0, SUB = 0;
    /* V14 – zusätzliche Ströme neben den Flächen-Sätzen:
       GZ  Glasscheiben mit Raumtiefe (Interior Mapping) für Fenster ohne modellierten Raum dahinter
       TG  echtes Glas (durchsichtig, Fresnel-Spiegelung) für Fenster und Türen der modellierten Räume;
           TGD = Glas im Haustürflügel, TGT = Schiebeflügel der Terrassentür (bewegt)
       FOL Laubkarten (Alpha-Test, leichter Wind)   HAL Lichthöfe an Leuchten (additiv, sehr dezent) */
    var GZ = { P: [], N: [], WC: [], WS: [] }, HAL = { P: [], Q: [], C: [] };
    var FOL = { name: 'FOL', P: [], N: [], U: [], C: [], WV: [], M: [], AO: [], L: [], SL: [], SC: [] };
    function TGS(name) { return { name: name, P: [], N: [] }; }
    var TG = TGS('TG'), TGD = TGS('TGD'), TGT = TGS('TGT');
    /* Glasscheibe mit Raumtiefe: c = Bezugspunkt (Fenstermitte in der Glasebene), n = Normale nach aussen,
       Ausschnitt a0…a1 (quer) und b0…b1 (Höhe) relativ zu c; sd = Raumtyp (Zufallswert), yf = Höhe von c über dem
       Raumboden, hw = halbe Fensterbreite (für Vorhänge), lit = Raumlicht 0…1, cu = Vorhanganteil 0…0,45 */
    function pane(c, n, a0, a1, b0, b1, sd, yf, hw, lit, cu) {
      var r = nrm(cr([0, 1, 0], n));
      [[a0, b0], [a1, b0], [a1, b1], [a0, b0], [a1, b1], [a0, b1]].forEach(function (k) {
        GZ.P.push(c[0] + r[0] * k[0], c[1] + k[1], c[2] + r[2] * k[0]); GZ.N.push(n[0], n[1], n[2]);
        GZ.WC.push(c[0], c[1], c[2], sd); GZ.WS.push(hw, yf, lit, cu || 0);
      });
    }
    /* echtes Glas: Rechteck p0 + s·U + t·V (Satz TG, TGD oder TGT) */
    function tglass(set, p0, U, V) {
      var n = nrm(cr(U, V)), q = [p0, [p0[0] + U[0], p0[1] + U[1], p0[2] + U[2]], [p0[0] + U[0] + V[0], p0[1] + U[1] + V[1], p0[2] + U[2] + V[2]], [p0[0] + V[0], p0[1] + V[1], p0[2] + V[2]]];
      [0, 1, 2, 0, 2, 3].forEach(function (i) { set.P.push(q[i][0], q[i][1], q[i][2]); set.N.push(n[0], n[1], n[2]); });
    }
    /* Laubkarte: Fussmitte (x,y,z), Breite, Höhe, Drehung, Atlasfeld (0 Strauch · 1 Gras · 2 Staude · 3 Baumkrone), Tönung.
       o.tilt Neigung zur Kartennormalen · o.cx/o.cz Pflanzenmitte (Lichtnormale nach aussen gewölbt → Volumen)
       o.ao Helligkeit am Fuss (Eigenverschattung) · o.sw Windgewicht · o.ph Phase · o.top Fuss-Windgewicht */
    function card(x, y, z, wd, ht, yaw, tile, tint, o) {
      o = o || {}; var ca = Math.cos(yaw), sa = Math.sin(yaw), tl = o.tilt || 0, st = Math.sin(tl), ct = Math.cos(tl);
      var A = [ca * wd / 2, 0, sa * wd / 2], Vv = [-sa * st * ht, ct * ht, ca * st * ht];
      var u0 = (tile % 2) * 0.5 + 0.004, u1 = (tile % 2) * 0.5 + 0.496, v0 = (tile >> 1) * 0.5 + 0.004, v1 = (tile >> 1) * 0.5 + 0.496;
      var t3 = lin3(typeof tint === 'string' ? hex(tint) : (tint || [1, 1, 1])), ph = o.ph === undefined ? x * 1.7 + z * 2.3 : o.ph;
      var cx = o.cx === undefined ? x : o.cx, cz = o.cz === undefined ? z : o.cz, ao = o.ao === undefined ? 0.55 : o.ao, sw = o.sw === undefined ? 1 : o.sw, wb = o.wb || 0;
      var Q = [[-1, 0, u0, v1], [1, 0, u1, v1], [1, 1, u1, v0], [-1, 1, u0, v0]];
      [0, 1, 2, 0, 2, 3].forEach(function (k) {
        var q = Q[k], px = x + A[0] * q[0] + Vv[0] * q[1], py = y + Vv[1] * q[1], pz = z + A[2] * q[0] + Vv[2] * q[1];
        var dx = px - cx, dz = pz - cz, dl = Math.hypot(dx, dz), ln = dl > 0.01 ? nrm([dx / dl * 0.62, 0.78, dz / dl * 0.62]) : [0, 1, 0];
        FOL.P.push(px, py, pz); FOL.N.push(ln[0], ln[1], ln[2]); FOL.U.push(q[2], q[3]); FOL.C.push(t3[0], t3[1], t3[2]);
        FOL.WV.push((wb + (1 - wb) * q[1]) * sw, ph); FOL.M.push(4); FOL.AO.push(ao + (1 - ao) * q[1]);
      });
    }
    /* Lichthof (Billboard, additiv): Mitte, Grösse in m, Farbe, Stärke */
    function halo(x, y, z, size, col, k) { var c = hex(col); [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]].forEach(function (q) { HAL.P.push(x, y, z); HAL.Q.push(q[0], q[1], size); HAL.C.push(c[0] * k, c[1] * k, c[2] * k); }); }
    function h2(x, y) { var v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return v - Math.floor(v); }
    function n2(x, y) { var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); var a = h2(ix, iy), b = h2(ix + 1, iy), c = h2(ix, iy + 1), d = h2(ix + 1, iy + 1); return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy; }
    function vert(q, n, col, em) {
      /* leichte, glaubwürdige Unregelmässigkeiten je Eckpunkt: Wolken im Putz, Spritzwasserzone am Sockel,
         fleckiger Rasen (trockene Stellen), Farbstreuung bei Stein und Erde */
      var k = 1, c0 = col[0], c1 = col[1], c2 = col[2];
      if (MAT === 4) k = 0.68 + 0.62 * (n2(q[0] * 3.3 + q[1] * 2.1, q[2] * 3.3) * 0.6 + n2(q[0] * 8 + q[2] * 3, q[1] * 8) * 0.4);
      else if (MAT === 0) { k = 0.965 + 0.06 * n2(q[0] * 0.45 + q[2] * 0.45, q[1] * 0.6) + 0.02 * n2(q[0] * 2.1 + q[2] * 2.1, q[1] * 2.3); if (q[1] < 1.3) k *= 1 - 0.075 * Math.pow(1 - q[1] / 1.3, 2); }
      else if (MAT === 5) { var dry = Math.max(0, n2(q[0] * 0.23 + 5.1, q[2] * 0.23) - 0.52) * 1.6; k = 0.86 + 0.26 * n2(q[0] * 0.55, q[2] * 0.55); c0 = c0 + (0.33 - c0) * dry; c1 = c1 + (0.34 - c1) * dry; c2 = c2 + (0.2 - c2) * dry; }
      else if (MAT === 6 || MAT === 17 || MAT === 20) k = 0.93 + 0.12 * n2(q[0] * 1.3 + q[1] * 0.7, q[2] * 1.3 - q[1] * 0.5);
      T.P.push(q[0], q[1], q[2]); T.N.push(n[0], n[1], n[2]); T.C.push(lin(c0 * k), lin(c1 * k), lin(c2 * k)); T.E.push(em); T.M.push(MAT);
    }
    function tri(a, b, c, col, em) { var n = nrm(cr(sub(b, a), sub(c, a))); vert(a, n, col, em); vert(b, n, col, em); vert(c, n, col, em); }
    function triN(a, b, c, na, nb, nc, col, em) { vert(a, na, col, em); vert(b, nb, col, em); vert(c, nc, col, em); }
    function quad(a, b, c, d, col, em) { tri(a, b, c, col, em); tri(a, c, d, col, em); }
    /* Rechteckfläche, bei SUB > 0 in ein Raster zerlegt (für gebackenes Licht: Lichtkegel, Schatten am Boden) */
    function face(a, b, c, d, col, em) {
      if (!SUB) { quad(a, b, c, d, col, em); return; }
      var u = sub(b, a), v = sub(d, a), ny = nrm(cr(u, v))[1];
      if ((SUBMODE === 'v' && Math.abs(ny) > 0.5) || (SUBMODE === 'up' && ny < 0.5) || (SUBMODE === 'down' && ny > -0.5)) { quad(a, b, c, d, col, em); return; }
      var nu = Math.max(1, Math.ceil(Math.hypot(u[0], u[1], u[2]) / SUB)), nv = Math.max(1, Math.ceil(Math.hypot(v[0], v[1], v[2]) / SUB));
      if (nu * nv === 1) { quad(a, b, c, d, col, em); return; }
      /* bilinear über alle vier Ecken (V17.1): Trapeze wie die schräge Treppenbrüstung behalten ihre Form */
      function P(i, j) { var x = i / nu, y = j / nv, k = 0, o = [0, 0, 0]; for (; k < 3; k++) { var ab = a[k] + (b[k] - a[k]) * x, dc = d[k] + (c[k] - d[k]) * x; o[k] = ab + (dc - ab) * y; } return o; }
      for (var i = 0; i < nu; i++) for (var j = 0; j < nv; j++) quad(P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1), col, em);
    }
    /* SUBMODE: 'all' | 'v' (nur senkrechte Flächen) | 'up' (nur Oberseiten) | 'down' (nur Unterseiten, z. B. Decken) */
    var SUBMODE = 'all';
    function withSub(sz, fn, mode) { var o = SUB, om = SUBMODE; SUB = sz; SUBMODE = mode || 'all'; fn(); SUB = o; SUBMODE = om; }
    function line(a, b, wt) { T.LP.push(a[0], a[1], a[2], b[0], b[1], b[2]); T.LW.push(wt, wt); }
    function withMat(m, fn) { var o = MAT; MAT = m; fn(); MAT = o; }
    /* box(x-Mitte, y-Unterkante, z-Mitte, Breite, Höhe, Tiefe, Farbe, Leuchtkraft, Konturstärke; negativ = Sanitär-Hervorhebung)
       Mit BEV > 0 (withBev) erhält der Kasten feine Kantenschrägen: eingerückte Hauptflächen, 12 Fasen, 8 Eckdreiecke –
       die Fasen fangen Licht wie echte gebrochene Kanten (Möbel, Stufen, Randsteine, Platten, Abdeckungen). */
    var BEV = 0;
    function withBev(c, fn) { var o = BEV; BEV = c; fn(); BEV = o; }
    function quadO(a, b, c, d, ctr, col, em) { var n = cr(sub(b, a), sub(d, a)), m = [(a[0] + c[0]) / 2 - ctr[0], (a[1] + c[1]) / 2 - ctr[1], (a[2] + c[2]) / 2 - ctr[2]]; if (dot(n, m) < 0) face(a, d, c, b, col, em); else face(a, b, c, d, col, em); }
    function triO(a, b, c, ctr, col, em) { var n = cr(sub(b, a), sub(c, a)), m = [(a[0] + b[0] + c[0]) / 3 - ctr[0], (a[1] + b[1] + c[1]) / 3 - ctr[1], (a[2] + b[2] + c[2]) / 3 - ctr[2]]; if (dot(n, m) < 0) tri(a, c, b, col, em); else tri(a, b, c, col, em); }
    function box(x, y, z, sx, sy, sz, col, em, ew) {
      col = typeof col === 'string' ? hex(col) : col; em = em || 0;
      var x0 = x - sx / 2, x1 = x + sx / 2, y0 = y, y1 = y + sy, z0 = z - sz / 2, z1 = z + sz / 2;
      var v = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
      var bc = BEV ? Math.min(BEV, sx * 0.3, sy * 0.3, sz * 0.3) : 0;
      if (bc > 0.0015) {
        var X = sx / 2, Y = sy / 2, Z = sz / 2, ctr = [x, y + Y, z];
        var P = function (i, j, k, ax) { return [x + i * (ax === 0 ? X : X - bc), y + Y + j * (ax === 1 ? Y : Y - bc), z + k * (ax === 2 ? Z : Z - bc)]; };
        [-1, 1].forEach(function (s) {
          quadO(P(s, -1, -1, 0), P(s, 1, -1, 0), P(s, 1, 1, 0), P(s, -1, 1, 0), ctr, col, em);
          quadO(P(-1, s, -1, 1), P(1, s, -1, 1), P(1, s, 1, 1), P(-1, s, 1, 1), ctr, col, em);
          quadO(P(-1, -1, s, 2), P(1, -1, s, 2), P(1, 1, s, 2), P(-1, 1, s, 2), ctr, col, em);
          [-1, 1].forEach(function (t) {
            quadO(P(s, t, -1, 0), P(s, t, 1, 0), P(s, t, 1, 1), P(s, t, -1, 1), ctr, col, em);
            quadO(P(s, -1, t, 0), P(s, 1, t, 0), P(s, 1, t, 2), P(s, -1, t, 2), ctr, col, em);
            quadO(P(-1, s, t, 1), P(1, s, t, 1), P(1, s, t, 2), P(-1, s, t, 2), ctr, col, em);
            [-1, 1].forEach(function (u) { triO(P(s, t, u, 0), P(s, t, u, 1), P(s, t, u, 2), ctr, col, em); });
          });
        });
      } else {
        face(v[4], v[5], v[6], v[7], col, em); face(v[1], v[0], v[3], v[2], col, em); face(v[5], v[1], v[2], v[6], col, em);
        face(v[0], v[4], v[7], v[3], col, em); face(v[7], v[6], v[2], v[3], col, em); face(v[0], v[1], v[5], v[4], col, em);
      }
      if (ew) { [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(function (e) { line(v[e[0]], v[e[1]], ew); }); }
    }
    function solid(x0, x1, y0, y1, z0, z1, col, em, ew) { box((x0 + x1) / 2, y0, (z0 + z1) / 2, x1 - x0, y1 - y0, z1 - z0, col, em, ew); WALLS.push([x0, x1, y0, y1, z0, z1]); }
    /* Wand entlang einer Achse mit Öffnungen [von,bis,Höhe] */
    function wall(ax, c, from, to, y0, y1, th, ops, col, ew) {
      ops = (ops || []).slice().sort(function (a, b) { return a[0] - b[0]; }); var s = from;
      function seg(a, b, ya, yb) { if (b - a < 0.01) return; if (ax === 'x') solid(c - th / 2, c + th / 2, ya, yb, a, b, col, 0, ew); else solid(a, b, ya, yb, c - th / 2, c + th / 2, col, 0, ew); }
      ops.forEach(function (o) { seg(s, o[0], y0, y1); seg(o[0], o[1], o[2], y1); s = o[1]; }); seg(s, to, y0, y1);
    }
    /* Rohr zwischen zwei beliebigen Punkten (weiche Normalen), r2 = Radius am Ende */
    function tube(a, b, r, seg, col, em, ew, r2, caps) {
      col = typeof col === 'string' ? hex(col) : col; em = em || 0; r2 = r2 === undefined ? r : r2;
      var ax = nrm(sub(b, a)), up = Math.abs(ax[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0], u = nrm(cr(ax, up)), v = cr(ax, u), ra = [], rb = [], ns = [];
      for (var i = 0; i <= seg; i++) { var t = i / seg * Math.PI * 2, c = Math.cos(t), s = Math.sin(t); var n = [u[0] * c + v[0] * s, u[1] * c + v[1] * s, u[2] * c + v[2] * s]; ns.push(n); ra.push([a[0] + n[0] * r, a[1] + n[1] * r, a[2] + n[2] * r]); rb.push([b[0] + n[0] * r2, b[1] + n[1] * r2, b[2] + n[2] * r2]); }
      for (i = 0; i < seg; i++) { triN(ra[i], rb[i], rb[i + 1], ns[i], ns[i], ns[i + 1], col, em); triN(ra[i], rb[i + 1], ra[i + 1], ns[i], ns[i + 1], ns[i + 1], col, em); }
      if (caps !== false) for (i = 0; i < seg; i++) { tri(b, rb[i + 1], rb[i], col, em); tri(a, ra[i], ra[i + 1], col, em); }
      if (ew) { for (i = 0; i < seg; i += Math.max(1, seg / 8 | 0)) { line(ra[i], ra[Math.min(seg, i + Math.max(1, seg / 8 | 0))], ew); line(rb[i], rb[Math.min(seg, i + Math.max(1, seg / 8 | 0))], ew); } }
    }
    function cyl(x, y, z, r, hgt, seg, col, em, ew, r2) { tube([x, y, z], [x, y + hgt, z], r, seg, col, em, ew, r2); }
    /* Rohr entlang einer Kurve (Ringe mit Parallelverschiebung, gemeinsame Normalen) – knickfreie Bögen für Armaturen */
    function bogen(pts, r0, r1, seg, col, em) {
      col = typeof col === 'string' ? hex(col) : col; em = em || 0;
      var n = pts.length, rings = [], nrs = [], prevU = null;
      for (var i = 0; i < n; i++) {
        var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], tg = nrm(sub(b, a));
        var u = prevU ? nrm(sub(prevU, [tg[0] * dot(prevU, tg), tg[1] * dot(prevU, tg), tg[2] * dot(prevU, tg)])) : nrm(cr(tg, Math.abs(tg[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0]));
        var v = cr(tg, u), r = r0 + (r1 - r0) * i / (n - 1), ring = [], nr = []; prevU = u;
        for (var k = 0; k <= seg; k++) { var t = k / seg * Math.PI * 2, c = Math.cos(t), s = Math.sin(t), d = [u[0] * c + v[0] * s, u[1] * c + v[1] * s, u[2] * c + v[2] * s]; nr.push(d); ring.push([pts[i][0] + d[0] * r, pts[i][1] + d[1] * r, pts[i][2] + d[2] * r]); }
        rings.push(ring); nrs.push(nr);
      }
      for (i = 0; i < n - 1; i++) for (k = 0; k < seg; k++) {
        triN(rings[i][k], rings[i + 1][k], rings[i + 1][k + 1], nrs[i][k], nrs[i + 1][k], nrs[i + 1][k + 1], col, em);
        triN(rings[i][k], rings[i + 1][k + 1], rings[i][k + 1], nrs[i][k], nrs[i + 1][k + 1], nrs[i][k + 1], col, em);
      }
    }
    /* weiche Kugelform (Ikosaeder, einmal unterteilt) – Laub, Keramik, Leuchtkörper */
    var ICO20 = null;
    var ICO = (function () {
      var t = (1 + Math.sqrt(5)) / 2, V = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map(nrm);
      var F = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]], out = [];
      ICO20 = F.map(function (f) { return [V[f[0]], V[f[1]], V[f[2]]]; });
      F.forEach(function (f) { var a = V[f[0]], b = V[f[1]], c = V[f[2]], ab = nrm([a[0] + b[0], a[1] + b[1], a[2] + b[2]]), bc = nrm([b[0] + c[0], b[1] + c[1], b[2] + c[2]]), ca = nrm([c[0] + a[0], c[1] + a[1], c[2] + a[2]]); out.push([a, ab, ca], [ab, b, bc], [ca, bc, c], [ab, bc, ca]); });
      return out;
    })();
    function blob(cx, cy, cz, rx, ry, rz, col, em, jit) {
      col = typeof col === 'string' ? hex(col) : col; em = em || 0; jit = jit || 0;
      var cache = {};
      function P(n) { var k = n.map(function (v) { return v.toFixed(4); }).join(); if (!cache[k]) { var j = 1 + (rnd() - 0.5) * jit; cache[k] = [cx + n[0] * rx * j, cy + n[1] * ry * j, cz + n[2] * rz * j]; } return cache[k]; }
      function Nn(n) { return nrm([n[0] / rx, n[1] / ry, n[2] / rz]); }
      (Math.max(rx, ry, rz) < 0.22 ? ICO20 : ICO).forEach(function (f) { triN(P(f[0]), P(f[1]), P(f[2]), Nn(f[0]), Nn(f[1]), Nn(f[2]), col, em); });
    }
    /* ---------- Licht backen (einmalig, CPU): Umgebungslicht, Abendhimmel, Leuchten je Raum, Bodenschatten ----------
       Statisches Licht pro Eckpunkt statt pro Pixel: gleiche Wirkung bei einem Bruchteil der GPU-Last. */
    function roomOf(q) { if (q[0] > -3.0 && q[0] < -1.6 && q[2] > 1.5 && q[2] < 4.35 && q[1] >= 3.0 && q[1] < 4.8) return 1; /* Treppenauge über der Halle */ if (q[1] < 0.45 || q[1] > 3.2 || q[0] < -3.1 || q[0] > 8.7 || q[2] < -1.1 || q[2] > 5.2) return 0; if (q[0] < 3) return 1; if (q[0] < XW) return q[2] > 2.4 ? 2 : 3; return 4; }
    var KEY = nrm([-0.857, 0.302, 0.423]), FILL = nrm([0.553, 0.623, 0.553]), WINF = nrm([0.6, 0.25, 0.55]);
    function mixv(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
    /* Licht je Eckpunkt. ao = Himmels-/Umgebungssichtbarkeit, lv = Sichtbarkeit der Leuchten (beide 0…1, aus dem
       vorab gerechneten Licht – tools/bake-light.js). Ohne vorab gerechnetes Licht: ao = lv = 1 und eine einfache
       Bodenverschattung unter Körpern (OCC). */
    function bakeOne(q, n, m, spec, ao, lv) {
      var pre = ao !== undefined; if (!pre) { ao = 1; lv = 1; }
      var rm = roomOf(q), t = n[1] * 0.5 + 0.5, k, o0, o1, o2, i, l;
      if (rm) {
        k = (0.74 + 0.26 * sstep(0.5, 1.2, q[1])) * (0.86 + 0.14 * sstep(CEIL, CEIL - 0.6, q[1]));
        /* linear: schwache, neutrale Grundaufhellung; die Leuchten (direkt + indirekt) prägen den Raum */
        o0 = (0.13 + 0.07 * t) * k; o1 = (0.125 + 0.07 * t) * k; o2 = (0.125 + 0.075 * t) * k;
        var wf = Math.max(n[0] * WINF[0] + n[1] * WINF[1] + n[2] * WINF[2], 0) * 0.5; o0 += 0.03 * wf; o1 += 0.045 * wf; o2 += 0.07 * wf;
        o0 *= ao; o1 *= ao; o2 *= ao;
      } else {
        var k1 = Math.max(n[0] * KEY[0] + n[1] * KEY[1] + n[2] * KEY[2], 0) * 0.85, k2 = Math.max(n[0] * FILL[0] + n[1] * FILL[1] + n[2] * FILL[2], 0) * 0.5;
        /* blaue Stunde (linear): kühles Himmelslicht, schwacher warmer Rest am Westhorizont */
        o0 = 0.03 + 0.085 * t + 0.26 * k1 + 0.07 * k2; o1 = 0.035 + 0.11 * t + 0.17 * k1 + 0.09 * k2; o2 = 0.05 + 0.19 * t + 0.11 * k1 + 0.14 * k2;
        var sh = 1;
        if (!pre && q[1] < 0.45) for (i = 0; i < OCC.length; i++) { var c = OCC[i], dx = Math.abs(q[0] - c[0]) - c[2], dz = Math.abs(q[2] - c[1]) - c[3], sd = Math.sqrt(Math.max(dx, 0) * Math.max(dx, 0) + Math.max(dz, 0) * Math.max(dz, 0)) + Math.min(Math.max(dx, dz), 0); sh = Math.min(sh, 0.4 + 0.6 * sstep(-0.08, 0.35 + 0.3 * Math.min(c[2], c[3]), sd)); }
        k = (pre ? ao * (0.9 + 0.1 * sstep(0, 1.2, q[1])) : sh * (0.62 + 0.38 * sstep(0, 1.7, q[1]))); o0 *= k; o1 *= k; o2 *= k;
      }
      var best = -1, bv = 0, a0 = 0, a1 = 0, a2 = 0, ib0 = 0, ib1 = 0, ib2 = 0;
      for (i = 0; i < LIT.length; i++) {
        l = LIT[i]; if (l[7] !== rm) continue;
        var ex = l[0] - q[0], ey = l[1] - q[1], ez = l[2] - q[2], ds = Math.sqrt(ex * ex + ey * ey + ez * ez); if (ds >= l[3]) continue;
        var a = 1 - ds / l[3]; a *= a; var nd = (n[0] * ex + n[1] * ey + n[2] * ez) / (ds || 1); if (m === 4) nd = nd * 0.55 + 0.45;
        if (nd > 0) { nd *= a; a0 += l[4] * nd; a1 += l[5] * nd; a2 += l[6] * nd; }
        /* Innenräume: indirektes Licht der Leuchte (Reflexion an Decke, Wänden, Boden) – richtungsunabhängig, nur durch ao gedämpft */
        if (rm) { var v = a * (l[4] + l[5] + l[6]); if (v > bv) { bv = v; best = i; } ib0 += l[4] * a; ib1 += l[5] * a; ib2 += l[6] * a; }
      }
      var dk = rm ? 1.5 : 1.6;
      o0 += a0 * lv * dk + ib0 * 0.32 * ao; o1 += a1 * lv * dk + ib1 * 0.32 * ao; o2 += a2 * lv * dk + ib2 * 0.32 * ao;
      if (spec) { if (best >= 0) { l = LIT[best]; var sk = 0.35 + 0.65 * lv; spec[0] = l[0]; spec[1] = l[1]; spec[2] = l[2]; spec[3] = l[3]; spec[4] = l[4] * sk; spec[5] = l[5] * sk; spec[6] = l[6] * sk; } else { spec[0] = spec[1] = spec[2] = 0; spec[3] = 1; spec[4] = spec[5] = spec[6] = 0; } }
      return [o0, o1, o2];
    }
    /* Gewichte der Leuchten für einen Eckpunkt (für das Vorabrechnen der weichen Schatten): [[Index, Beitrag], …] */
    function lightW(q, n, m) {
      var rm = roomOf(q), out = [];
      for (var i = 0; i < LIT.length; i++) {
        var l = LIT[i]; if (l[7] !== rm) continue;
        var ex = l[0] - q[0], ey = l[1] - q[1], ez = l[2] - q[2], ds = Math.sqrt(ex * ex + ey * ey + ez * ez); if (ds >= l[3]) continue;
        var a = 1 - ds / l[3]; a *= a; var nd = (n[0] * ex + n[1] * ey + n[2] * ez) / (ds || 1); if (m === 4) nd = nd * 0.55 + 0.45;
        if (nd > 0) out.push([i, nd * a * (l[4] + l[5] + l[6])]);
      }
      return out;
    }
    function bakeSet(Sx, Mx, AOa, LVa) {
      var nv = Sx.P.length / 3, L = new Float32Array(nv * 3), SL = new Float32Array(nv * 4), SC = new Float32Array(nv * 3), sp = [0, 0, 0, 1, 0, 0, 0], q = [0, 0, 0], n = [0, 0, 0];
      Mx = Mx || null;
      for (var v = 0, i = 0; v < nv; v++, i += 3) {
        q[0] = Sx.P[i]; q[1] = Sx.P[i + 1]; q[2] = Sx.P[i + 2]; n[0] = Sx.N[i]; n[1] = Sx.N[i + 1]; n[2] = Sx.N[i + 2];
        if (Mx) { var x = q[0], y = q[1], z = q[2], a = n[0], b = n[1], c = n[2]; q[0] = Mx[0] * x + Mx[4] * y + Mx[8] * z + Mx[12]; q[1] = Mx[1] * x + Mx[5] * y + Mx[9] * z + Mx[13]; q[2] = Mx[2] * x + Mx[6] * y + Mx[10] * z + Mx[14]; n[0] = Mx[0] * a + Mx[4] * b + Mx[8] * c; n[1] = Mx[1] * a + Mx[5] * b + Mx[9] * c; n[2] = Mx[2] * a + Mx[6] * b + Mx[10] * c; }
        var o = AOa ? bakeOne(q, n, Sx.M[v], sp, AOa[v] / 255, LVa[v] / 255) : bakeOne(q, n, Sx.M[v], sp);
        if (Sx.AO) { o[0] *= Sx.AO[v]; o[1] *= Sx.AO[v]; o[2] *= Sx.AO[v]; }
        L[i] = o[0]; L[i + 1] = o[1]; L[i + 2] = o[2];
        SL[v * 4] = sp[0]; SL[v * 4 + 1] = sp[1]; SL[v * 4 + 2] = sp[2]; SL[v * 4 + 3] = sp[3]; SC[i] = sp[4]; SC[i + 1] = sp[5]; SC[i + 2] = sp[6];
      }
      Sx.L = L; Sx.SL = SL; Sx.SC = SC;
    }
    function light(x, y, z, r, col, k, room) { var c = lin3(hex(col)), m = Math.max(c[0], c[1], c[2]) || 1; LIT.push([x, y, z, r, c[0] / m * k, c[1] / m * k, c[2] / m * k, room]); }
    function occ(cx, cz, hx, hz) { OCC.push([cx, cz, hx, hz]); }

/*{{GEOMETRY}}*/

    /* ---------- Kameraroute (aus rise.json): [p, Auge, Blickziel, Bildwinkel rad] ----------
       Position: Catmull-Rom. Blickrichtung: Gier- und Neigungswinkel (stetig abgewickelt) statt Blickziel –
       so dreht die Kamera auf dem kürzesten Weg und ohne Sprung, auch wenn ein Blickziel nahe an der Kamera liegt. */
    var KY = (function () {
      var out = [], prev = null;
      K.forEach(function (k) { var d = sub(k[2], k[1]), y = Math.atan2(d[0], d[2]); if (prev !== null) { while (y - prev > Math.PI) y -= 2 * Math.PI; while (y - prev < -Math.PI) y += 2 * Math.PI; } prev = y; out.push([y, Math.atan2(d[1], Math.hypot(d[0], d[2])), Math.hypot(d[0], d[1], d[2])]); });
      return out;
    })();
    function cat(p0, p1, p2, p3, t) { var t2 = t * t, t3 = t2 * t; return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3); }
    function camAt(q) {
      q = Math.max(0, Math.min(1, q)); var i = 0; while (i < K.length - 2 && q > K[i + 1][0]) i++;
      var ia = Math.max(0, i - 1), id = Math.min(K.length - 1, i + 2), a = K[ia], b = K[i], c = K[i + 1], d = K[id];
      var u = (q - b[0]) / (c[0] - b[0]); u = u * u * (3 - 2 * u) * 0.35 + u * 0.65;
      var e = [0, 1, 2].map(function (j) { return cat(a[1][j], b[1][j], c[1][j], d[1][j], u); });
      var yaw = cat(KY[ia][0], KY[i][0], KY[i + 1][0], KY[id][0], u), pit = cat(KY[ia][1], KY[i][1], KY[i + 1][1], KY[id][1], u), ds = Math.max(0.5, cat(KY[ia][2], KY[i][2], KY[i + 1][2], KY[id][2], u));
      var dir = [Math.sin(yaw) * Math.cos(pit), Math.sin(pit), Math.cos(yaw) * Math.cos(pit)];
      return { e: e, t: [e[0] + dir[0] * ds, e[1] + dir[1] * ds, e[2] + dir[2] * ds], f: b[3] + (c[3] - b[3]) * u, yaw: yaw, pitch: pit };
    }
    function win2(d, q, k) { return k * sstep(d.open[0], d.open[1], q) * (1 - sstep(d.close[0], d.close[1], q)); }
    function doorAngle(q) { return win2(D_HT, q, D_HT.angle); }
    function aptAngle(q) { return win2(D_WT, q, D_WT.angle); }
    function terSlide(q) { return win2(D_TT, q, D_TT.slide); }
    function hiAmt(q) { return sstep(HL['in'][0], HL['in'][1], q) * (1 - sstep(HL.out[0], HL.out[1], q)); }
    /* Kamera im Gebäude? 0 = draussen, 1 = drinnen (weicher Übergang an Haus- und Terrassentür) */
    function insideAmt(e) { if (e[0] < -3.2 || e[0] > 8.9 || e[1] > 3.6 || e[2] < -1.2) return 0; return sstep(-0.7, 0.9, 5.5 - e[2]); }

    /* ---------- Shader (V15: linearer Farbraum, Material pro Pixel) ----------
       Material (MAT): 0 Aussenputz · 1 Keramik · 2 Metall lackiert · 3 Glas fern (leuchtend) · 4 Laub (Körper) · 5 Rasen
       6 Stein/Beton · 7 Holz · 8 Wandplatten · 9 Bodenplatten · 10 Leuchte · 12 Textil · 13 Lamellenstoren
       14 Spiegel · 15 Himmel · 16 Glas in Türen (vereinfacht) · 17 Erde/Kies · 18 Innenanstrich · 19 Hecke
       20 Sichtbeton/Sockel · 21 Gehwegplatten · 22 Chrom · 23 Aluminium · 24 Edelstahl gebürstet
       Farbraum: Farben (sRGB) werden beim Aufbau linearisiert, Licht wird linear gerechnet, Ausgabe einmal über eine
       Filmkurve (ACES-Näherung) und die sRGB-Umwandlung. Texturen T1/T2 sind Daten (Helligkeits- und Höhenfaktor),
       der Laubatlas ist Farbe (sRGB → linear im Shader).
       Pro Eckpunkt: gebackenes diffuses Licht, UV, Dunst. Pro Pixel: Textur, Fugen, Relief (Bump über Ableitungen),
       Glanz mit Rauheit und Fresnel, Spiegelung aus der Reflexionsaufnahme des Raums (Kastenprojektion) bzw. dem
       Himmel, Badspiegel aus einer planaren Spiegelung. Materialwerte (Rauheit, F0, Metall, Relief) aus einer LUT. */
    var SKYF = 'vec3 sky(vec3 d){float t=d.y;vec3 hz=vec3(0.6,0.54,0.53),lo=vec3(0.33,0.39,0.53),zn=vec3(0.075,0.11,0.21);vec3 c=mix(hz,lo,smoothstep(0.0,0.14,t));c=mix(c,zn,smoothstep(0.14,0.8,t));' +
      'float g=pow(max(dot(normalize(d.xz+vec2(0.0001)),vec2(-0.896,0.443)),0.0),3.0);c+=vec3(0.34,0.17,0.04)*g*(1.0-smoothstep(0.0,0.3,t));' +
      'c=mix(c,hz*0.93,smoothstep(0.0,-0.04,t));return c*c;}' + /* V17.1: unter dem Horizont Dunstton statt Dunkelblau (keine schwarzen Flächen hinter fernen Häusern) */
      /* ferner Hügelzug im Dunst (Silhouette am Horizont statt einer geraden Bodenkante) */
      'vec3 hil(vec3 d){return sky(vec3(d.x,0.0,d.z))*0.55;}';
    /* Filmkurve (ACES-Näherung nach Narkowicz) mit weicher Schulter, danach einmalig linear → sRGB */
    var TMF = 'vec3 tm(vec3 x){x=max(x,vec3(0.0));vec3 a=clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.0,1.0);return pow(a,vec3(0.4545));}';
    function PH(der) { return (der ? '#extension GL_OES_standard_derivatives : enable\n' : '') + '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n'; }
    var FOGV = 'float f=clamp(1.0-exp(-pow(dist/220.0,2.0)),0.0,1.0);vec3 fc=sky(vec3(fd.x,max(fd.y,0.0)*0.2,fd.z));';
    var VSM = 'attribute vec3 p;attribute vec3 n;attribute vec3 c;attribute vec2 em;attribute vec3 lt;attribute vec3 lt2;attribute vec4 sl;attribute vec3 sc;' +
      'uniform mat4 m;uniform mat4 mdl;uniform vec3 eye;uniform float ein;uniform float lm;' +
      'varying vec4 vd;varying vec4 vs;varying vec4 vu;varying vec4 vq;varying vec4 vp;varying vec4 vn;varying vec4 vl;varying vec3 va;' + SKYF +
      'bool M(float k){return abs(em.y-k)<0.5;}' +
      'void main(){vec4 wp=mdl*vec4(p,1.0);vec3 N=normalize(mat3(mdl)*n);gl_Position=m*wp;' +
      'vec3 fd=wp.xyz-eye;float dist=max(length(fd),0.001);fd/=dist;' +
      'bool ins=(wp.y>0.45&&wp.y<3.2&&wp.x>-3.1&&wp.x<8.7&&wp.z>-1.1&&wp.z<5.2)||(wp.x>-3.0&&wp.x<-1.6&&wp.z>1.5&&wp.z<4.35&&wp.y>=3.0&&wp.y<4.8);vp=vec4(wp.xyz,ins?0.0:1.0);' +
      'float ch=-1.0,s=1.0,k=1.0;vq=vec4(0.0);' +
      'if(M(0.0)){ch=0.0;k=0.8;if(abs(n.y)<0.5)vq=vec4(2e4,(p.y-0.5)/3.0,0.42,0.005);}' +
      'else if(M(18.0)){ch=0.0;s=1.7;k=0.3;}' +
      'else if(M(6.0)){ch=1.0;}' +
      'else if(M(17.0)){ch=1.0;s=0.45;k=1.5;}' +
      'else if(M(20.0)){ch=1.0;s=2.3;k=0.8;}' +
      'else if(M(5.0)){ch=2.0;s=0.9;}' +
      'else if(M(19.0)){ch=3.0;s=0.8;}' +
      'else if(M(7.0)){ch=4.0;s=1.52;}' +
      /* V17 Platten: Fugen je Pixel in Metern, Raster ab der Raumecke (Bad: x 3,072 / z −0,928, Boden 0,5), Textur nur noch leicht */
      'else if(M(8.0)||M(9.0)){bool bd=p.x>2.9&&p.z<2.45;vec2 o=bd?vec2(3.072,-0.928):vec2(-3.0,1.5);bool wpl=M(8.0);ch=wpl?5.0:6.0;s=1.2;k=wpl?0.16:0.3;' +
      'vq=abs(n.y)>0.5?vec4(p.x-o.x,p.z-o.y,wpl?-0.26:-0.34,0.0028):vec4(abs(n.x)>0.5?p.z-o.y:p.x-o.x,p.y-0.5,-0.24,0.0022);}' +
      'else if(M(21.0)){ch=6.0;s=1.0;k=1.3;}' +
      'else if(M(2.0)||M(23.0)||M(24.0)){ch=7.0;s=0.5;k=M(2.0)?0.25:1.0;}' +
      'else if(M(12.0)){ch=0.0;s=0.3;k=0.6;}' +
      'else if(M(26.0)){ch=1.0;s=0.35;k=1.25;}' +
      'else if(M(13.0)){vq=vec4(2e4,p.y/0.075,0.38,0.2);}' +
      'vec2 uv=abs(n.y)>0.5?p.xz:(abs(n.x)>0.5?p.zy:p.xy);vu=vec4(uv/s,ch,k);' +
      'vec3 L=mix(lt,lt2,lm);vec3 dif=c*L,add=vec3(0.0);vec3 r=reflect(fd,N);' +
      'if(M(10.0)){dif=vec3(0.0);add=c*em.x;}' +
      'else if(M(16.0)){dif=vec3(0.0);add=ein>0.5?mix(vec3(0.16,0.12,0.11),vec3(0.02,0.035,0.09),smoothstep(1.0,2.9,wp.y)):vec3(0.9,0.5,0.22)*0.4+sky(r)*0.1;}' +
      'else if(M(3.0)){float fr=0.12+0.88*pow(1.0-max(dot(N,-fd),0.0),3.0);dif=vec3(0.0);add=em.x>0.0?c*em.x*0.9+sky(r)*fr*0.15:mix(c*0.12,sky(r)*0.8,fr);}' +
      'else add=c*em.x;' +
      'vd=vec4(dif,em.y);vs=vec4(add,0.0);vn=vec4(N,sl.w);vl=vec4(sl.xyz,(sc.x+sc.y+sc.z)*0.3333);va=c;}';
    /* Software-Grafik (lite): Dunst wieder je Eckpunkt (die fernen Bodenflächen sind dafür in 40-m-Felder geteilt) */
    var VSML = VSM.replace('varying vec3 va;', 'varying vec3 va;varying vec4 vf;').replace(/va=c;}$/, 'va=c;' + FOGV +
      'if(wp.y<0.25){float rr=length(wp.xz-vec2(-1.0,5.0));float g=smoothstep(40.0,120.0,rr);vec3 land=mix(fc*0.36,fc*0.58,smoothstep(140.0,430.0,rr));fc=mix(fc,land,g);f=max(f,g);}vf=vec4(fc,f);}');
    /* mode: 0 normal · 1 Reflexionsaufnahme (nur diffus, Ausgabe √linear) · 2 Spiegelbild (ohne Spiegel-Rekursion) */
    /* lite: Software-Grafik ohne IR_FORCE_HQ – ohne Relief und ohne Reflexionsaufnahme (gemessen: Bildzeit ≈ −…%, siehe Testbericht) */
    function FSM(der, lite) {
      return PH(der) + 'varying vec4 vd;varying vec4 vs;varying vec4 vu;varying vec4 vq;varying vec4 vp;varying vec4 vn;varying vec4 vl;varying vec3 va;' + (lite ? 'varying vec4 vf;' : '') +
        'uniform sampler2D t1;uniform sampler2D t2;uniform sampler2D lut;uniform samplerCube pr;uniform sampler2D mr;' +
        'uniform float sw;uniform float expo;uniform vec3 eye;uniform vec4 clip;uniform float mode;uniform float hasPr;uniform vec3 prC;uniform vec3 prA;uniform vec3 prB;uniform vec4 mrv;' + SKYF + TMF +
        'void main(){if(dot(vec4(vp.xyz,1.0),clip)<0.0)discard;' +
        'vec4 a=texture2D(t1,vu.xy),b=texture2D(t2,vu.xy);vec4 c4=vec4(vu.z);vec4 m1=1.0-step(0.5,abs(c4-vec4(0.0,1.0,2.0,3.0))),m2=1.0-step(0.5,abs(c4-vec4(4.0,5.0,6.0,7.0)));' +
        'float tv=dot(a,m1)+dot(b,m2)+0.5*(1.0-dot(m1+m2,vec4(1.0)));float fac=1.0+(tv*2.0-1.0)*vu.w;' +
        /* Fugen ohne Verzweigung (Ableitungen bleiben in gleichförmigem Kontrollfluss): Platten 2D in Metern, Putz und
           Lamellen 1D (vq.x = 2e4 bei Rasterweite 4e4 → keine senkrechten Fugen, im mediump-Bereich) */
        'float t2=step(vq.z,-0.0001);vec2 ts=mix(vec2(4e4,1.0),vec2(0.6,abs(vu.z-6.0)<0.5?0.6:0.3),t2);vec2 tq=vq.xy/ts,gq=fract(tq),dq=min(gq,1.0-gq)*ts;float dj=min(dq.x,dq.y);' +
        (der ? 'float fj=max(fwidth(vq.x),fwidth(vq.y))+0.00001,aj=fj*0.75;' : 'float fj=0.0,aj=mix(0.004,0.0012,t2);') +
        'float gr=(1.0-smoothstep(vq.w*0.5-aj,vq.w*0.5+aj,dj))*abs(vq.z)' + (der ? '*mix(clamp(vq.w/(fj*1.5),0.0,1.0),mix(0.35,1.0,clamp(vq.w/(fj*1.5),0.0,1.0)),t2)' : '') + ';' +
        'vec2 ti=floor(tq);fac*=1.0+(fract((ti.x*0.618034+ti.y*0.414214)*7.31)-0.5)*0.03*t2;' +
        'vec4 mp=texture2D(lut,vec2((vd.a+0.5)/32.0,0.5));' +
        'vec3 P=vp.xyz,V=normalize(eye-P),N=normalize(vn.xyz);if(dot(N,V)<0.0)N=-N;float dist=length(eye-P);' +
        (der ? 'float bh=((tv-0.5)*mp.a*0.004-gr*0.0012)*(1.0-smoothstep(2.5,8.0,dist));vec3 dpx=dFdx(P),dpy=dFdy(P);float hx=dFdx(bh),hy=dFdy(bh);vec3 r1=cross(dpy,N),r2=cross(N,dpx);float det=dot(dpx,r1);' +
          'vec3 Nb=abs(det)>1e-12?normalize(abs(det)*N-sign(det)*(hx*r1+hy*r2)):N;' : 'vec3 Nb=N;') +
        'vec3 Ld,Lc;float ar;if(vp.w<0.5){vec3 l=vl.xyz-P;float d=max(length(l),0.001);Ld=l/d;float q=clamp(1.0-d/max(vn.w,0.01),0.0,1.0);Lc=((P.x>3.0&&P.x<5.45&&P.z>-1.0&&P.z<2.4)?vec3(1.0,0.9,0.8):vec3(1.0,0.74,0.5))*vl.w*q*q;ar=0.05/(d+0.25);}' +
        'else{Ld=normalize(vec3(-0.857,0.302,0.423));Lc=vec3(0.42,0.24,0.12);ar=0.45;}' +
        'float ndl0=max(dot(N,Ld),0.0),ndl=max(dot(Nb,Ld),0.0);float bs=clamp((ndl+0.3)/(ndl0+0.3),0.75,1.25);' +
        'vec3 base=vd.rgb*fac*(1.0-gr)*bs;vec3 col=base;' +
        /* sehr raue, nichtmetallische Flächen (Putz, Anstrich, Rasen, Textil: Rauheit > 0,76) haben keinen sichtbaren Glanz – Rechnung entfällt */
        'if(abs(mode-1.0)>0.5&&mp.g>0.004&&(mp.r<0.76||mp.b>0.5)){float r=max(mp.r,0.05),mt=mp.b,al=r*r,a2=clamp(al+ar,0.0,1.0);vec3 F0=mix(vec3(mp.g),clamp(va,0.0,1.0),mt);' +
        'vec3 H=normalize(Ld+V);float nh=max(dot(Nb,H),0.0),nv=max(dot(Nb,V),0.001);float sp=2.0/max(a2*a2,0.0004)-2.0;float D=min((sp+8.0)*0.0398*pow(nh,sp),40.0);' +
        /* Metall: F0 = Grundfarbe (unbeleuchtet, linear) – Chrom neutral, Aluminium matter, keine Lichtfarbe im Reflex */
        'vec3 Fs=F0+(1.0-F0)*pow(1.0-max(dot(H,V),0.0),5.0);vec3 tint=vec3(1.0);' +
        'vec3 spec=Lc*D*Fs*ndl*tint;vec3 R=reflect(-V,Nb);vec3 env;' +
        (lite ? '' : 'if(hasPr>0.5&&vp.w<0.5){vec3 f1=(prB-P)/R,f2=(prA-P)/R,ff=max(f1,f2);float t=min(min(ff.x,ff.y),ff.z);vec3 e=textureCube(pr,P+R*t-prC,r*7.0).rgb;env=e*e*1.25;}else ') +
        'if(vp.w<0.5)env=vec3(0.18,0.15,0.12);else env=sky(R)*(0.55+0.45*smoothstep(-0.25,0.05,R.y));' +
        'vec3 Fe=F0+(1.0-F0)*pow(1.0-nv,5.0)*(1.0-r)*(1.0-r);' +
        'col=base*(1.0-mt*0.88)*(1.0-Fe*(1.0-mt))+env*Fe*tint+spec;}' +
        'if(mrv.z>0.5&&abs(vd.a-14.0)<0.5){vec3 mc=texture2D(mr,gl_FragCoord.xy*mrv.xy).rgb;float nv2=max(dot(N,V),0.0);gl_FragColor=vec4(mc*(0.9+0.06*(1.0-nv2))+vec3(0.006,0.007,0.008),1.0);return;}' +
        'col+=vs.rgb+vec3(0.95,0.85,0.70)*exp(-pow((P.x*0.55+P.y-sw)/0.85,2.0))*0.14*vp.w;' +
        'if(vp.w>0.5)col+=vec3(0.55,0.3,0.14)*pow(1.0-max(dot(N,V),0.0),4.0)*0.05*max(dot(N,vec3(-0.857,0.1,0.423)),0.0);' +
        'if(mode>0.5&&mode<1.5){gl_FragColor=vec4(sqrt(clamp(col*0.8,0.0,1.0)),1.0);return;}' +
        /* Luftperspektive je Pixel (vorher je Eckpunkt: auf den 350-m-Bodenflächen falsch interpoliert → sichtbare Horizontkante) */
        /* nur rechnen, wo Dunst überhaupt sichtbar ist (innen und im Nahbereich entfällt der Himmelsaufruf) */
        (lite ? 'col=mix(col,vf.rgb,vf.a);gl_FragColor=vec4(tm(col*expo),1.0);}' :
        'vec3 fv=P-eye;float fdi=max(length(fv),0.001);float f=clamp(1.0-exp(-pow(fdi/220.0,2.0)),0.0,1.0),g=0.0,rr=0.0;' +
        'if(P.y<0.25){rr=length(P.xz-vec2(-1.0,5.0));g=smoothstep(40.0,120.0,rr);}float fa=max(f,g);' +
        'if(fa>0.002){vec3 fd=fv/fdi;vec3 fc=sky(vec3(fd.x,max(fd.y,0.0)*0.2,fd.z));vec3 land=mix(fc*0.36,fc*0.58,smoothstep(140.0,430.0,rr));fc=mix(fc,land,g);col=mix(col,fc,fa);}' +
        'gl_FragColor=vec4(tm(col*expo),1.0);}');
    }
    /* Himmel: Verlauf der blauen Stunde + feine, flache Wolkenschleier (nur nahe am Horizont) */
    var VSS = 'attribute vec3 p;uniform mat4 m;varying vec3 vp;void main(){vp=p;gl_Position=m*vec4(p,1.0);}';
    var FSS = PH(false) + 'varying vec3 vp;uniform vec3 eye;uniform float expo;' + SKYF + TMF +
      'float hs(vec2 q){vec3 p3=fract(vec3(q.xyx)*0.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}' +
      'float vn(vec2 q){vec2 i=floor(q),f=fract(q);f=f*f*(3.0-2.0*f);return mix(mix(hs(i),hs(i+vec2(1.0,0.0)),f.x),mix(hs(i+vec2(0.0,1.0)),hs(i+vec2(1.0,1.0)),f.x),f.y);}' +
      'void main(){vec3 d=normalize(vp-eye);vec3 c=sky(d);vec2 hq=normalize(d.xz+vec2(0.0001));float hh=0.004+0.016*(vn(hq*3.0+1.7)*0.65+vn(hq*9.0+4.2)*0.35);float hm=1.0-smoothstep(hh-0.0012,hh+0.0012,d.y);' +
      'if(d.y>0.015){vec2 q=d.xz/(d.y+0.08)*vec2(1.3,3.6);float cl=vn(q)*0.6+vn(q*2.3+3.1)*0.3+vn(q*5.3+7.7)*0.1;' +
      'cl=smoothstep(0.52,0.86,cl)*(1.0-smoothstep(0.22,0.65,d.y))*smoothstep(0.015,0.07,d.y);float g=pow(max(dot(normalize(d.xz),vec2(-0.896,0.443)),0.0),2.0);' +
      'c=mix(c,c*0.75+vec3(0.006,0.0035,0.004)+vec3(0.03,0.01,0.002)*g,cl*0.5);}c=mix(c,hil(d)*(0.92+0.08*smoothstep(hh-0.015,hh,d.y)),hm);gl_FragColor=vec4(tm(c*expo),1.0);}';
    /* Konturlinien: nur noch für die Scan-Kante beim Start und die Sanitär-Hervorhebung (keine Dauerlinien) */
    var VSL = 'attribute vec3 p;attribute float wt;uniform mat4 m;uniform mat4 mdl;uniform vec3 ev;varying float vw;varying vec3 vp;void main(){vec4 wp=mdl*vec4(p,1.0);vw=wt;vp=wp.xyz;vec3 d=ev-wp.xyz;float l=length(d);wp.xyz+=d/max(l,0.001)*min(0.012+l*0.0015,0.25);gl_Position=m*wp;}';
    var FSL = 'precision mediump float;varying float vw;varying vec3 vp;uniform vec3 eye;uniform float sw;uniform float hi;uniform float lb;void main(){float a;vec3 c=vec3(0.93,0.84,0.70);if(vw<0.0){a=hi;c=vec3(1.0,0.88,0.66);}else{float s=exp(-pow((vp.x*0.55+vp.y-sw)/0.7,2.0));a=vw*lb+s*vw*1.15;}a*=1.0-clamp(pow(distance(vp,eye)/150.0,2.0),0.0,1.0);gl_FragColor=vec4(c*a,a);}';
    /* Fenster mit Raumtiefe (Interior Mapping) – Raumfarben linear gerechnet; Mehrfachverglasung spiegelt stärker (F0 ≈ 0,1) */
    var VSG = 'attribute vec3 p;attribute vec3 n;attribute vec4 wc;attribute vec4 ws;uniform mat4 m;uniform vec3 eye;varying vec3 vo;varying vec3 vv;varying vec4 vw;varying vec4 vr;varying vec4 vf;' + SKYF +
      'void main(){gl_Position=m*vec4(p,1.0);vec3 R=normalize(cross(vec3(0.0,1.0,0.0),n));vec3 d=p-wc.xyz;vo=vec3(dot(d,R),d.y,wc.w);' +
      'vec3 v=p-eye;vv=vec3(dot(v,R),v.y,dot(v,n));vw=ws;float dist=max(length(v),0.001);vec3 fd=v/dist;' +
      'float cs=max(dot(-fd,n),0.0);vec3 rf=reflect(fd,n);vr=vec4(mix(vec3(0.05,0.055,0.07),sky(rf),smoothstep(-0.12,0.08,rf.y)),0.1+0.9*pow(1.0-cs,5.0));' + FOGV + 'vf=vec4(fc,f);}';
    var FSG = PH(false) + 'varying vec3 vo;varying vec3 vv;varying vec4 vw;varying vec4 vr;varying vec4 vf;uniform float expo;' + TMF +
      'float h1(float s){return fract(sin(s*78.233)*43758.5453);}' +
      'void main(){float sd=floor(vo.z+0.5),hw=vw.x,yb=vw.y,lit=vw.z,cu=vw.w;' +
      'float rw=2.8+1.6*h1(sd),rd=3.0+1.8*h1(sd+3.1),rh=2.55,ox=(h1(sd+5.7)-0.5)*0.8;' +
      'vec3 o=vec3(vo.x-ox,vo.y+yb,0.0);vec3 d=normalize(vv);d.z=min(d.z,-0.03);d.x=abs(d.x)<0.0001?0.0001:d.x;d.y=abs(d.y)<0.0001?0.0001:d.y;' +
      'float tx=((d.x>0.0?rw*0.5:-rw*0.5)-o.x)/d.x,ty=((d.y>0.0?rh:0.0)-o.y)/d.y,tz=(-rd-o.z)/d.z;float t=min(tx,min(ty,tz));vec3 h=o+d*t;' +
      'vec3 wall=mix(vec3(0.84,0.8,0.74),vec3(0.74,0.73,0.7),h1(sd+1.3));if(h1(sd+14.0)>0.82)wall=vec3(0.62,0.66,0.66);vec3 col=wall;' +
      'if(t==tz){float fx=(h1(sd+7.7)-0.5)*rw*0.45,fw=0.45+0.55*h1(sd+8.8),fh=0.42+0.5*h1(sd+9.9);' +
      'if(abs(h.x-fx)<fw&&h.y<fh)col=mix(vec3(0.24,0.21,0.19),vec3(0.56,0.47,0.38),h1(sd+2.2));' +
      'else if(h1(sd+4.4)>0.45&&abs(h.x-fx)<0.32&&abs(h.y-1.55)<0.22)col=mix(vec3(0.32,0.36,0.4),vec3(0.62,0.5,0.38),h1(sd+15.0));}' +
      'else if(t==ty){col=d.y>0.0?vec3(0.9,0.88,0.85):mix(vec3(0.46,0.34,0.23),vec3(0.6,0.58,0.55),h1(sd+6.6));}' +
      'else{col=wall*0.94;float sx=-h.z/rd;if(h1(sd+16.0)>0.5&&sx>0.35&&sx<0.75&&h.y<1.9)col=mix(vec3(0.3,0.26,0.22),vec3(0.66,0.6,0.52),h1(sd+17.0));}' +
      /* Zimmerpflanze auf der inneren Fensterbank (Silhouette in 22 cm Tiefe, nur bei einem Teil der Fenster) */
      'if(h1(sd+23.0)>0.62){float t2=(-0.22-o.z)/d.z;if(t2>0.0&&t2<t){vec3 q2=o+d*t2;float px=(h1(sd+24.0)-0.5)*hw*1.1,dx=q2.x-px,dy=q2.y-0.87;' +
      'vec2 e=vec2(dx/0.16,(dy-0.3)/0.2);float an=atan(e.y,e.x);' +
      'if(abs(dx)<0.065&&dy>0.0&&dy<0.12)col=vec3(0.36,0.27,0.22);else if(dy>0.1&&length(e)<0.82+0.2*sin(an*5.0+sd)+0.07*sin(an*11.0))col=vec3(0.16,0.24,0.12);}}' +
      'col*=col;vec3 L=vec3((h1(sd+11.0)-0.5)*rw*0.5,rh-0.35,-rd*(0.35+0.35*h1(sd+12.0)));float dl=length(h-L);' +
      /* Lichtfarbe: meist warm, bei einem Teil neutralweiss (LED) – ruhig, ohne Wechsel */
      'vec3 warm=h1(sd+21.0)>0.72?vec3(1.0,0.84,0.68):mix(vec3(1.0,0.58,0.25),vec3(1.0,0.76,0.49),h1(sd+13.0));' +
      'float lt2=max(lit,0.06+0.1*h1(sd+19.0));vec3 li=warm*lt2*(0.3+0.9/(0.45+dl*dl*0.28))+vec3(0.03,0.036,0.05)*(1.0-0.5*lit);' +
      'col*=li*(1.0-0.25*clamp(-h.z/rd,0.0,1.0));' +
      'if(cu>0.0){float cv=smoothstep(1.0-cu,1.0-cu+0.04,abs(vo.x)/hw);float fo=0.95+0.05*sin(vo.x*22.0);col=mix(col,vec3(0.86,0.76,0.6)*(0.012+lit*0.42)*fo,cv*0.86);}' +
      'col=col*0.85*(1.0-vr.a)+vr.rgb*vr.a;col=mix(col,vf.rgb,vf.a);gl_FragColor=vec4(tm(col*expo),1.0);}';
    /* Laubkarten: Alpha-zu-Abdeckung bei Kantenglättung (ruhige Blattkanten), sonst Alpha-Test. Wind: Spitzen stärker als Fuss */
    var VSF = 'attribute vec3 p;attribute vec2 uv;attribute vec3 c;attribute vec2 wv;attribute vec3 lt;uniform mat4 m;uniform vec3 eye;uniform float tw;uniform float wa;varying vec2 vu;varying vec3 vd;varying vec4 vf;' + SKYF +
      'void main(){vec3 q=p;float h=wv.x*wv.x;float s=sin(tw*1.3+wv.y)*0.62+sin(tw*2.17+wv.y*1.71)*0.38;q.x+=s*h*wa*0.032;q.z+=(sin(tw*1.07+wv.y*0.8)*0.6+0.4*s)*h*wa*0.02;q.y-=abs(s)*h*wa*0.006;' +
      'gl_Position=m*vec4(q,1.0);vu=uv;vd=c*lt;vec3 v=q-eye;float dist=max(length(v),0.001);vec3 fd=v/dist;' + FOGV + 'vf=vec4(fc,f);}';
    function FSF(der, a2c) {
      return PH(der) + 'varying vec2 vu;varying vec3 vd;varying vec4 vf;uniform sampler2D tl;uniform float expo;' + TMF +
        'void main(){vec4 t=texture2D(tl,vu);float a=t.a;' + (der ? 'vec2 dx=dFdx(vu*1024.0),dy=dFdy(vu*1024.0);a*=1.0+max(0.5*log2(max(dot(dx,dx),dot(dy,dy))),0.0)*0.22;' : '') +
        (a2c ? 'if(a<0.12)discard;a=clamp((a-0.32)/0.36,0.0,1.0);' : 'if(a<0.5)discard;a=1.0;') +
        'vec3 col=t.rgb*t.rgb*vd*2.6;col=mix(col,vf.rgb,vf.a);gl_FragColor=vec4(tm(col*expo),a);}';
    }
    /* Lichthöfe: kleine, weiche Billboards an Leuchten (additiv, verdeckt durch Geometrie, nah ausgeblendet) */
    var VSH = 'attribute vec3 p;attribute vec3 q;attribute vec3 c;uniform mat4 m;uniform vec3 eye;uniform vec3 cx;uniform vec3 cy;varying vec2 vq;varying vec3 vc;' +
      'void main(){vec3 d=eye-p;float l=max(length(d),0.001);vec3 w=p+d/l*min(0.2,l*0.4)+(cx*q.x+cy*q.y)*q.z;gl_Position=m*vec4(w,1.0);vq=q.xy;vc=c*smoothstep(0.4,1.6,l)*(1.0-smoothstep(60.0,140.0,l));}';
    var FSH = 'precision mediump float;varying vec2 vq;varying vec3 vc;uniform float expo;void main(){float r=dot(vq,vq);float g=(exp(-r*6.0)*0.55+exp(-r*26.0)*0.45)*(1.0-smoothstep(0.7,1.0,r));gl_FragColor=vec4(vc*g*expo,0.0);}';
    /* echtes Glas pro Pixel: Durchsicht + Fresnel-Spiegelung aus derselben Raumaufnahme wie die Materialien (innen)
       bzw. dem Himmel (aussen) – Spiegelung und Durchsicht passen so zusammen */
    var VST = 'attribute vec3 p;attribute vec3 n;uniform mat4 m;uniform mat4 mdl;uniform vec3 eye;varying vec3 vw;varying vec3 vnn;varying vec4 vf;' + SKYF +
      'void main(){vec4 wp=mdl*vec4(p,1.0);vw=wp.xyz;vnn=normalize(mat3(mdl)*n);gl_Position=m*wp;vec3 v=wp.xyz-eye;float dist=max(length(v),0.001);vec3 fd=v/dist;' + FOGV + 'vf=vec4(fc,f);}';
    var FST = PH(false) + 'varying vec3 vw;varying vec3 vnn;varying vec4 vf;uniform vec3 eye;uniform float expo;uniform samplerCube pr;uniform float hasPr;uniform vec3 prC;uniform vec3 prA;uniform vec3 prB;' + SKYF + TMF +
      'void main(){vec3 V=normalize(eye-vw),N=normalize(vnn);if(dot(N,V)<0.0)N=-N;float nv=max(dot(N,V),0.0);float fr=0.08+0.92*pow(1.0-nv,5.0);vec3 R=reflect(-V,N);vec3 env;' +
      'bool ins=vw.y>0.45&&vw.y<3.2&&vw.x>-3.1&&vw.x<8.7&&vw.z>-1.1&&vw.z<5.2&&eye.z<5.3;' +
      'if(ins&&hasPr>0.5){vec3 f1=(prB-vw)/R,f2=(prA-vw)/R,ff=max(f1,f2);float t=min(min(ff.x,ff.y),ff.z);vec3 e=textureCube(pr,vw+R*t-prC,0.5).rgb;env=e*e*1.25;}else env=sky(R)*(0.5+0.5*smoothstep(-0.2,0.05,R.y));' +
      'env=mix(env,vf.rgb,vf.a);gl_FragColor=vec4(tm(env*fr*expo),fr*0.92+0.03);}';
    var shaders = [], buffers = [], textures = [];
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); shaders.push(o); return o; }
    function prog(v, f) { var q = gl.createProgram(); gl.attachShader(q, sh(gl.VERTEX_SHADER, v)); gl.attachShader(q, sh(gl.FRAGMENT_SHADER, f)); gl.linkProgram(q); if (!gl.getProgramParameter(q, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(q)); q.u = {}; progs.push(q); return q; }
    var progs = [];
    function U(q, n) { return q.u[n] || (q.u[n] = gl.getUniformLocation(q, n)); }
    function vbo(arr) { var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, arr instanceof Float32Array ? arr : new Float32Array(arr), gl.STATIC_DRAW); buffers.push(b); return b; }
    /* Attribute: nur die vom aktuellen Programm genutzten Slots aktiv lassen (Programmwechsel) */
    function attr(q, name, b, size) { var k = q.a || (q.a = {}); var l = name in k ? k[name] : (k[name] = gl.getAttribLocation(q, name)); if (l < 0) return; gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, size, gl.FLOAT, false, 0, 0); }
    /* MAX_VERTEX_ATTRIBS nur einmal abfragen: getParameter ist ein synchroner GPU-Aufruf und würde jedes Bild ausbremsen */
    var NATTR = 8;
    function disableAttrs() { for (var i = 0; i < NATTR; i++) gl.disableVertexAttribArray(i); }
    /* V17: statische Sätze räumlich in Blöcke ordnen (Dreiecke nach Schwerpunkt in Würfel der Kantenlänge cs); beim Zeichnen
       werden nur Blöcke im Sichtkegel gezeichnet (Begrenzungsquader gegen die 6 Ebenen der Kameramatrix). Nur die GPU-Kopie
       wird umsortiert – Lichtdaten, Prüfsumme und Prüfhilfen (rayY, checkFrustum) arbeiten weiter auf den Originaldaten. */
    function chunkify(Sx, cs) {
      var flat = cs > 10; /* grosse Zellen (Umgebung): nur nach x/z teilen, jenseits von 90 m acht Sektoren */
      var P = Sx.P, nt = P.length / 9, map = {}, keys = [], t, v, a;
      for (t = 0; t < nt; t++) { var o = t * 9, gx = (P[o] + P[o + 3] + P[o + 6]) / 3, gz = (P[o + 2] + P[o + 5] + P[o + 8]) / 3, k = flat && Math.max(Math.abs(gx), Math.abs(gz)) > 90 ? 'f' + Math.floor((Math.atan2(gz, gx) + Math.PI) / (Math.PI / 4)) : Math.floor(gx / cs) + ',' + (flat ? 0 : Math.floor((P[o + 1] + P[o + 4] + P[o + 7]) / 3 / cs)) + ',' + Math.floor(gz / cs);
        if (!map[k]) { map[k] = []; keys.push(k); } map[k].push(t); }
      var order = new Int32Array(nt), n = 0, ranges = [];
      keys.forEach(function (k) { var L = map[k], s0 = n * 3, mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
        L.forEach(function (tt) { order[n++] = tt; for (v = 0; v < 3; v++) for (a = 0; a < 3; a++) { var x = P[(tt * 3 + v) * 3 + a]; if (x < mn[a]) mn[a] = x; if (x > mx[a]) mx[a] = x; } });
        ranges.push({ s: s0, n: L.length * 3, mn: mn, mx: mx }); });
      function perm(arr, w) { var out = new Float32Array(arr.length); for (var i = 0; i < nt; i++) { var src = order[i] * 3 * w, dst = i * 3 * w; for (var j = 0; j < 3 * w; j++) out[dst + j] = arr[src + j]; } return out; }
      return { perm: perm, ranges: ranges };
    }
    function frustumOf(M) { var pl = []; [[3, 0, 1], [3, 0, -1], [3, 1, 1], [3, 1, -1], [3, 2, 1], [3, 2, -1]].forEach(function (q) { pl.push([M[q[0]] + q[2] * M[q[1]], M[4 + q[0]] + q[2] * M[4 + q[1]], M[8 + q[0]] + q[2] * M[8 + q[1]], M[12 + q[0]] + q[2] * M[12 + q[1]]]); }); return pl; }
    function boxIn(F, mn, mx) { for (var i = 0; i < 6; i++) { var p = F[i]; if (p[0] * (p[0] > 0 ? mx[0] : mn[0]) + p[1] * (p[1] > 0 ? mx[1] : mn[1]) + p[2] * (p[2] > 0 ? mx[2] : mn[2]) + p[3] < 0) return false; } return true; }
    var cullStats = { drawn: 0, total: 0 };
    function upload(Sx, fnM, lmFn, cs) {
      if (!Sx.L.length) bakeSet(Sx); var em = new Float32Array(Sx.E.length * 2); for (var i = 0; i < Sx.E.length; i++) { em[i * 2] = Sx.E[i]; em[i * 2 + 1] = Sx.M[i]; }
      var ck = cs ? chunkify(Sx, cs) : null, pm = ck ? ck.perm : function (x) { return x; };
      var lt = vbo(pm(Sx.L, 3));
      return { name: Sx.name, p: vbo(pm(Sx.P, 3)), n: vbo(pm(Sx.N, 3)), c: vbo(pm(Sx.C, 3)), em: vbo(pm(em, 2)), lt: lt, lt2: Sx.L2 ? vbo(pm(Sx.L2, 3)) : lt, sl: vbo(pm(Sx.SL, 4)), sc: vbo(pm(Sx.SC, 3)), lp: vbo(Sx.LP), lw: vbo(Sx.LW), nm: Sx.P.length / 3, nl: Sx.LP.length / 3, M: fnM, LM: lmFn, ranges: ck ? ck.ranges : null };
    }
    var I4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    function rotY(a, tx, ty, tz) { var c = Math.cos(a), s = Math.sin(a); return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, tx, ty, tz, 1]; }
    function aptM(q) { return rotY(aptAngle(q), AH[0], FLOOR, AH[1]); }
    function doorM(q) { return rotY(doorAngle(q), DH[0], FLOOR, DH[1]); }
    function terM(q) { return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, terSlide(q), 0, 0, 1]; }
    function camNow(q) { if (camOverride) return camOverride; return camAt(q); }
    /* Hochformat (Tablet hochkant): Bildausschnitt je Station verschieben – das Motiv rückt zur Mitte und nach oben,
       weil der Text dort unten steht. Zwischen den Stationen linear übergeblendet; im Querformat ohne Wirkung. */
    function pshift(q) {
      if (q <= ST[0].hold) return ST[0].ps; if (q >= ST[ST.length - 1].hold) return ST[ST.length - 1].ps;
      for (var i = 0; i < ST.length - 1; i++) if (q <= ST[i + 1].hold) { var t = sstep(ST[i].hold, ST[i + 1].hold, q); return [ST[i].ps[0] + (ST[i + 1].ps[0] - ST[i].ps[0]) * t, ST[i].ps[1] + (ST[i + 1].ps[1] - ST[i].ps[1]) * t]; }
      return [0, 0];
    }
    /* Kamera wie in der Architekturfotografie: waagrecht gehalten, die Neigung wird als Objektivverschiebung
       umgesetzt – senkrechte Kanten bleiben senkrecht. Erst bei steilem Blick (> 17°) neigt sich die Kamera anteilig. */
    function matrix(q) {
      var cm = camNow(q), asp = w / h, f = cm.f * (asp < 1 ? 1.25 : 1);
      var dc = Math.hypot(cm.e[0], cm.e[1] - 5, cm.e[2]), near = Math.max(0.05, Math.min(0.5, (dc - 14) * 0.025));
      var P = persp(f, asp, near, 1400), k = camOverride ? 0 : Math.max(0, Math.min(1, (1.15 - asp) / 0.45));
      if (k > 0) { var sh = pshift(q); P[8] = -(sh[0] || 0) * k; P[9] = -(sh[1] || 0) * k; }
      var dx = cm.t[0] - cm.e[0], dy = cm.t[1] - cm.e[1], dz = cm.t[2] - cm.e[2], pit = Math.atan2(dy, Math.hypot(dx, dz)), yaw = Math.atan2(dx, dz);
      var ap = Math.abs(pit), kk = ap <= 0.3 ? 1 : Math.max(0.55, 1 - (ap - 0.3) / 0.25 * 0.45), keep = pit * (1 - kk);
      P[9] += Math.tan(pit * kk) / Math.tan(f / 2);
      var t = [cm.e[0] + Math.sin(yaw) * Math.cos(keep), cm.e[1] + Math.sin(keep), cm.e[2] + Math.cos(yaw) * Math.cos(keep)], Vw = look(cm.e, t, [0, 1, 0]);
      return { m: mul(P, Vw), e: cm.e, ins: insideAmt(cm.e), rx: [Vw[0], Vw[4], Vw[8]], uy: [Vw[1], Vw[5], Vw[9]] };
    }
    function project(Mx, v) { var x = Mx[0] * v[0] + Mx[4] * v[1] + Mx[8] * v[2] + Mx[12], y = Mx[1] * v[0] + Mx[5] * v[1] + Mx[9] * v[2] + Mx[13], ww = Mx[3] * v[0] + Mx[7] * v[1] + Mx[11] * v[2] + Mx[15]; return [(x / ww * 0.5 + 0.5) * 100, (1 - (y / ww * 0.5 + 0.5)) * 100, ww]; }
    var PS = null, PG = null, PF = null, PH_ = null, PT = null, extra = null, LUT = null, CUBE0 = null, TEX0 = null, A2C = false;
    /* Materialwerte je MAT: Rauheit, F0 (Reflexion bei senkrechtem Blick), Metall, Relief – als LUT-Textur (32×1) */
    var MATP = { 0: [0.92, 0.03, 0, 0.22], 1: [0.1, 0.045, 0, 0], 2: [0.42, 0.045, 0, 0], 4: [0.8, 0.03, 0, 0], 5: [0.95, 0.02, 0, 0.35], 6: [0.72, 0.04, 0, 0.45],
      7: [0.48, 0.04, 0, 0.18], 8: [0.24, 0.045, 0, 0.12], 9: [0.5, 0.04, 0, 0.3], 12: [1.0, 0, 0, 0.3], 13: [0.5, 0.04, 0, 0], 14: [0.03, 0.9, 1, 0],
      17: [1.0, 0.02, 0, 0.7], 18: [0.9, 0.03, 0, 0.1], 19: [0.9, 0.03, 0, 0.6], 20: [0.78, 0.04, 0, 0.35], 21: [0.74, 0.04, 0, 0.45],
      22: [0.07, 0.78, 1, 0], 23: [0.3, 0.62, 1, 0], 24: [0.24, 0.6, 1, 0], 25: [0.42, 0.045, 0, 0], 26: [0.9, 0.03, 0, 0.3] };
    function mkLut() {
      var d = new Uint8Array(32 * 4); for (var i = 0; i < 32; i++) { var v = MATP[i] || [1, 0, 0, 0]; for (var k = 0; k < 4; k++) d[i * 4 + k] = Math.round(v[k] * 255); }
      var t = gl.createTexture(); textures.push(t); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 32, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, d);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t;
    }
    function mkCube(N) {
      var t = gl.createTexture(); textures.push(t); gl.bindTexture(gl.TEXTURE_CUBE_MAP, t);
      for (var f = 0; f < 6; f++) gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + f, 0, gl.RGBA, N, N, 0, gl.RGBA, gl.UNSIGNED_BYTE, N === 1 ? new Uint8Array([40, 36, 32, 255]) : null);
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, N === 1 ? gl.NEAREST : gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t;
    }
    /* ---------- Reflexionsaufnahmen (Cubemaps) je Raum, kastenprojiziert; einmalig beim ersten Betreten ---------- */
    var PROBES = [
      { id: 'halle', room: 1, c: [0.4, 1.6, 3.4], a: [-2.94, 0.5, 1.56], b: [2.94, 3.1, 5.12], tex: null },
      { id: 'flur', room: 2, c: [4.2, 1.6, 3.3], a: [3.06, 0.5, 2.46], b: [5.34, 3.1, 4.14], tex: null },
      { id: 'bad', room: 3, c: [4.25, 1.55, 0.75], a: [3.072, 0.5, -0.922], b: [5.33, 3.1, 2.322], tex: null },
      { id: 'wohnen', room: 4, c: [7.0, 1.55, 2.0], a: [5.46, 0.5, -0.94], b: [8.62, 3.1, 5.12], tex: null }
    ], probeFB = null, probeRB = null, probeN = 0, probesDone = 0;
    var CUBEF = [[[1, 0, 0], [0, -1, 0]], [[-1, 0, 0], [0, -1, 0]], [[0, 1, 0], [0, 0, 1]], [[0, -1, 0], [0, 0, -1]], [[0, 0, 1], [0, -1, 0]], [[0, 0, -1], [0, -1, 0]]];
    function probeFor(e) { if (insideAmt(e) < 0.5) return null; var r = roomOf([e[0], Math.min(Math.max(e[1], 0.6), 3.0), e[2]]); for (var i = 0; i < PROBES.length; i++) if (PROBES[i].room === r) return PROBES[i]; return null; }
    function captureProbe(pb) {
      var N = EXT.sw === true ? 64 : 128, t0 = win.performance.now();
      if (!probeFB) { probeFB = gl.createFramebuffer(); probeRB = gl.createRenderbuffer(); }
      if (probeN !== N) { gl.bindRenderbuffer(gl.RENDERBUFFER, probeRB); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, N, N); probeN = N; }
      gl.activeTexture(gl.TEXTURE0); pb.tex = mkCube(N); gl.bindTexture(gl.TEXTURE_CUBE_MAP, null); gl.bindFramebuffer(gl.FRAMEBUFFER, probeFB); gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, probeRB);
      gl.viewport(0, 0, N, N); var P = persp(Math.PI / 2, 1, 0.05, 60), by = {}; sets.forEach(function (o) { by[o.name] = o; });
      for (var f = 0; f < 6; f++) {
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + f, pb.tex, 0);
        gl.clearColor(0.18, 0.21, 0.27, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
        var d = CUBEF[f][0], Mx = mul(P, look(pb.c, [pb.c[0] + d[0], pb.c[1] + d[1], pb.c[2] + d[2]], CUBEF[f][1]));
        ['INT', 'A', 'D', 'TT'].forEach(function (n) { var o = by[n]; drawSet(o, Mx, pb.c, o.M ? o.M(ps) : I4, 1, 1, { mode: 1, lm: o.LM ? o.LM(ps) : 0 }); });
      }
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, pb.tex); gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height); disableAttrs(); probesDone++; probeMs += win.performance.now() - t0;
    }
    var probeMs = 0;
    /* ---------- Badspiegel: planare Spiegelung (Szene am Spiegel gespiegelt in eine Textur), nur wenn sichtbar ---------- */
    var MIR = { x: 3.25, y0: FLOOR + 1.17, y1: FLOOR + 1.83, z0: 0.45, z1: 1.15, fb: null, rb: null, tex: null, w: 0, h: 0, frames: 0 };
    function mirrorVisible(mm) {
      var e = mm.e; if (e[0] < MIR.x + 0.05 || e[0] > XW || e[2] < -0.95 || e[2] > 2.4 || e[1] < 0.5 || e[1] > 3.1) return false;
      var cs = [[MIR.x, MIR.y0, MIR.z0], [MIR.x, MIR.y1, MIR.z0], [MIR.x, MIR.y0, MIR.z1], [MIR.x, MIR.y1, MIR.z1]], inx = false;
      cs.forEach(function (v) { var q = project(mm.m, v); if (q[2] > 0 && q[0] > -10 && q[0] < 110 && q[1] > -10 && q[1] < 110) inx = true; }); return inx;
    }
    function renderMirror(mm, ord, ms, expo) {
      var s = EXT.sw === true ? 0.35 : 0.5, W2 = Math.max(16, Math.round(canvas.width * s)), H2 = Math.max(16, Math.round(canvas.height * s));
      if (!MIR.fb) { MIR.fb = gl.createFramebuffer(); MIR.rb = gl.createRenderbuffer(); }
      if (MIR.w !== W2 || MIR.h !== H2) {
        if (!MIR.tex) { MIR.tex = gl.createTexture(); textures.push(MIR.tex); }
        gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, MIR.tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W2, H2, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); /* Einheit 5, nie Einheit 0 (dort liegt die Materialtextur) */
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindRenderbuffer(gl.RENDERBUFFER, MIR.rb); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, W2, H2); MIR.w = W2; MIR.h = H2;
      }
      gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, TEX0); gl.activeTexture(gl.TEXTURE0); /* keine Rückkopplung: Ziel nicht gleichzeitig als Textur gebunden */
      gl.bindFramebuffer(gl.FRAMEBUFFER, MIR.fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, MIR.tex, 0); gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, MIR.rb);
      gl.viewport(0, 0, W2, H2); gl.clearColor(0.05, 0.05, 0.06, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      var Rm = [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 2 * MIR.x, 0, 0, 1], Mr = mul(mm.m, Rm), ev = [2 * MIR.x - mm.e[0], mm.e[1], mm.e[2]];
      for (var i = 0; i < ord.length; i++) if (ord[i].name !== 'ENV' && ord[i].name !== 'BLD') drawSet(ord[i], Mr, ev, ms[i], expo, 1, { mode: 2, clip: [1, 0, 0, -MIR.x - 0.004], lm: ord[i].LM ? ord[i].LM(ps) : 0 });
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height); disableAttrs(); MIR.frames++;
    }
    function drawSky(o, Mx, e, expo) {
      gl.useProgram(PS); attr(PS, 'p', o.p, 3); gl.uniformMatrix4fv(U(PS, 'm'), false, Mx); gl.uniform3fv(U(PS, 'eye'), e); gl.uniform1f(U(PS, 'expo'), expo);
      gl.disable(gl.BLEND); gl.drawArrays(gl.TRIANGLES, 0, o.nm);
    }
    var curProbe = null, mirOn = false, NOCLIP = [0, 0, 0, 1];
    /* o.x: {mode, clip, lm} – Sonderdurchgänge (Reflexionsaufnahme, Spiegelbild) */
    function drawSet(o, Mx, e, mdl, expo, ein, x) {
      x = x || {}; var mode = x.mode || 0, pb = mode === 1 ? null : curProbe;
      gl.useProgram(PM); attr(PM, 'p', o.p, 3); attr(PM, 'n', o.n, 3); attr(PM, 'c', o.c, 3); attr(PM, 'em', o.em, 2); attr(PM, 'lt', o.lt, 3); attr(PM, 'lt2', o.lt2, 3); attr(PM, 'sl', o.sl, 4); attr(PM, 'sc', o.sc, 3);
      gl.uniformMatrix4fv(U(PM, 'm'), false, Mx); gl.uniformMatrix4fv(U(PM, 'mdl'), false, mdl); gl.uniform3fv(U(PM, 'eye'), e); gl.uniform1f(U(PM, 'sw'), sweep); gl.uniform1f(U(PM, 'expo'), expo); gl.uniform1f(U(PM, 'ein'), ein);
      gl.uniform1f(U(PM, 'lm'), x.lm !== undefined ? x.lm : (o.LM ? o.LM(ps) : 0)); gl.uniform1f(U(PM, 'mode'), mode); gl.uniform4fv(U(PM, 'clip'), x.clip || NOCLIP);
      gl.uniform1i(U(PM, 't1'), 0); gl.uniform1i(U(PM, 't2'), 1); gl.uniform1i(U(PM, 'lut'), 3); gl.uniform1i(U(PM, 'pr'), 4); gl.uniform1i(U(PM, 'mr'), 5);
      gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_CUBE_MAP, pb && pb.tex ? pb.tex : CUBE0); gl.activeTexture(gl.TEXTURE0);
      gl.uniform1f(U(PM, 'hasPr'), pb && pb.tex ? 1 : 0); if (pb) { gl.uniform3fv(U(PM, 'prC'), pb.c); gl.uniform3fv(U(PM, 'prA'), pb.a); gl.uniform3fv(U(PM, 'prB'), pb.b); }
      gl.uniform4f(U(PM, 'mrv'), 1 / canvas.width, 1 / canvas.height, mode === 0 && mirOn ? 1 : 0, 0);
      gl.disable(gl.BLEND); gl.depthMask(true);
      if (o.ranges && !win.IR_NO_CULL) { var F = frustumOf(Mx), st0 = -1, en = -1;
        for (var r = 0; r < o.ranges.length; r++) { var R = o.ranges[r]; if (!boxIn(F, R.mn, R.mx)) continue; cullStats.drawn += R.n;
          if (R.s === en) en += R.n; else { if (st0 >= 0) gl.drawArrays(gl.TRIANGLES, st0, en - st0); st0 = R.s; en = R.s + R.n; } }
        if (st0 >= 0) gl.drawArrays(gl.TRIANGLES, st0, en - st0); cullStats.total += o.nm;
      } else gl.drawArrays(gl.TRIANGLES, 0, o.nm);
    }
    function drawLines(o, Mx, e, mdl, hi) {
      if (!o.nl) return;
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
      gl.useProgram(PL); attr(PL, 'p', o.lp, 3); attr(PL, 'wt', o.lw, 1); gl.uniformMatrix4fv(U(PL, 'm'), false, Mx); gl.uniformMatrix4fv(U(PL, 'mdl'), false, mdl); gl.uniform3fv(U(PL, 'eye'), e); gl.uniform3fv(U(PL, 'ev'), e); gl.uniform1f(U(PL, 'sw'), sweep); gl.uniform1f(U(PL, 'hi'), hi); gl.uniform1f(U(PL, 'lb'), 0);
      gl.drawArrays(gl.LINES, 0, o.nl); gl.depthMask(true); gl.disable(gl.BLEND);
    }
    var hiNow = 0, expoCur = -1, windT = 0;
    /* Reihenfolge gegen Überzeichnen: Nahes zuerst, Wiese/Ferne danach, Himmel zuletzt (nur freie Pixel), dann Glas und Lichthöfe */
    var ORDER_OUT = ['BLD', 'D', 'TT', 'INT', 'A', 'ENV'], ORDER_IN = ['INT', 'A', 'D', 'TT', 'BLD', 'ENV'];
    function bindTex() {
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, TX.t1 || TX.n1);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, TX.t2 || TX.n1);
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, TX.lb || TX.n1);
      gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, LUT);
      gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_CUBE_MAP, CUBE0);
      gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, MIR.tex || TEX0);
      gl.activeTexture(gl.TEXTURE0);
    }
    var drawCount = 0;
    function draw() {
      drawCount++; cullStats.drawn = 0; cullStats.total = 0;
      var mm = matrix(ps), Mx = mm.m, ein = mm.ins > 0.5 ? 1 : 0, expo = expoCur > 0 ? expoCur : expoTarget(mm.ins), q = ps;
      var by = {}; sets.forEach(function (o) { by[o.name] = o; });
      /* Reflexionsaufnahme des Raums, in dem die Kamera steht (einmalig erzeugt) */
      curProbe = camOverride && camOverride.noProbe ? null : probeFor(mm.e); if (curProbe && !curProbe.tex) { bindTex(); captureProbe(curProbe); }
      var ord = (mm.ins > 0.5 ? ORDER_IN : ORDER_OUT).map(function (n) { return by[n]; }), ms = ord.map(function (o) { return o.M ? o.M(q) : I4; });
      bindTex();
      mirOn = mirrorVisible(mm); if (mirOn) { renderMirror(mm, ord, ms, expo); gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, MIR.tex); gl.activeTexture(gl.TEXTURE0); }
      gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
      for (var i = 0; i < ord.length; i++) drawSet(ord[i], Mx, mm.e, ms[i], expo, ein);
      disableAttrs();
      var X = extra;
      if (X.gz.nm) {
        gl.useProgram(PG); attr(PG, 'p', X.gz.p, 3); attr(PG, 'n', X.gz.n, 3); attr(PG, 'wc', X.gz.wc, 4); attr(PG, 'ws', X.gz.ws, 4);
        gl.uniformMatrix4fv(U(PG, 'm'), false, Mx); gl.uniform3fv(U(PG, 'eye'), mm.e); gl.uniform1f(U(PG, 'expo'), expo); gl.drawArrays(gl.TRIANGLES, 0, X.gz.nm); disableAttrs();
      }
      if (X.fol.nm && TX.lb) {
        gl.useProgram(PF); attr(PF, 'p', X.fol.p, 3); attr(PF, 'uv', X.fol.uv, 2); attr(PF, 'c', X.fol.c, 3); attr(PF, 'wv', X.fol.wv, 2); attr(PF, 'lt', X.fol.lt, 3);
        gl.uniformMatrix4fv(U(PF, 'm'), false, Mx); gl.uniform3fv(U(PF, 'eye'), mm.e); gl.uniform1f(U(PF, 'expo'), expo); gl.uniform1f(U(PF, 'tw'), windT); gl.uniform1f(U(PF, 'wa'), RMQ.matches ? 0 : 1); gl.uniform1i(U(PF, 'tl'), 2);
        if (A2C) gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);
        gl.drawArrays(gl.TRIANGLES, 0, X.fol.nm); if (A2C) gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE); disableAttrs();
      }
      gl.depthMask(false); drawSky(by.SKY, Mx, mm.e, expo); disableAttrs();
      /* durchsichtiges Glas nach dem Himmel (sonst überschreibt der Himmel das Glas), ohne Tiefe zu schreiben;
         Scheiben von hinten nach vorn sortiert (keine Sortierfehler bei hintereinanderliegendem Glas) */
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.useProgram(PT);
      gl.uniformMatrix4fv(U(PT, 'm'), false, Mx); gl.uniform3fv(U(PT, 'eye'), mm.e); gl.uniform1f(U(PT, 'expo'), expo); gl.uniform1i(U(PT, 'pr'), 4);
      gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_CUBE_MAP, curProbe && curProbe.tex ? curProbe.tex : CUBE0); gl.activeTexture(gl.TEXTURE0);
      gl.uniform1f(U(PT, 'hasPr'), curProbe && curProbe.tex ? 1 : 0); if (curProbe) { gl.uniform3fv(U(PT, 'prC'), curProbe.c); gl.uniform3fv(U(PT, 'prA'), curProbe.a); gl.uniform3fv(U(PT, 'prB'), curProbe.b); }
      X.tg.forEach(function (g) {
        if (!g.nm) return; attr(PT, 'p', g.p, 3); attr(PT, 'n', g.n, 3); gl.uniformMatrix4fv(U(PT, 'mdl'), false, g.M ? g.M(q) : I4);
        if (g.panes) { g.panes.sort(function (a, b) { return dist2(b.c, mm.e) - dist2(a.c, mm.e); }); g.panes.forEach(function (pn) { gl.drawArrays(gl.TRIANGLES, pn.s, 6); }); }
        else gl.drawArrays(gl.TRIANGLES, 0, g.nm);
      });
      disableAttrs();
      if (X.hal.nm) {
        gl.blendFunc(gl.ONE, gl.ONE); gl.useProgram(PH_); attr(PH_, 'p', X.hal.p, 3); attr(PH_, 'q', X.hal.q, 3); attr(PH_, 'c', X.hal.c, 3);
        gl.uniformMatrix4fv(U(PH_, 'm'), false, Mx); gl.uniform3fv(U(PH_, 'eye'), mm.e); gl.uniform3fv(U(PH_, 'cx'), mm.rx); gl.uniform3fv(U(PH_, 'cy'), mm.uy); gl.uniform1f(U(PH_, 'expo'), expo);
        gl.drawArrays(gl.TRIANGLES, 0, X.hal.nm); disableAttrs();
      }
      gl.disable(gl.BLEND); gl.depthMask(true);
      if (scan.state === 'run' || hiNow > 0.001) { for (i = 0; i < ord.length; i++) drawLines(ord[i], Mx, mm.e, ms[i], hiNow); disableAttrs(); }
      if (labels.length && root.classList.contains('jr-hi')) {
        var lx0 = 100, lx1 = 0, ly0 = 100, ly1 = 0;
        labels.forEach(function (l) { var p3 = project(Mx, l.w); l.el.style.setProperty('--x', p3[0].toFixed(2) + '%'); l.el.style.setProperty('--y', p3[1].toFixed(2) + '%'); l.el.classList.toggle('l', p3[0] > 62);
          lx0 = Math.min(lx0, p3[0]); lx1 = Math.max(lx1, p3[0]); ly0 = Math.min(ly0, p3[1]); ly1 = Math.max(ly1, p3[1]); });
        /* «Schematische Kennzeichnung» direkt unter (oder, wenn unten kein Platz, über) den Markierungen */
        if (capEl) { var cyv = ly1 + 7 < 92 ? ly1 + 7 : Math.max(8, ly0 - 7); capEl.style.setProperty('--cx', Math.max(14, Math.min(86, (lx0 + lx1) / 2)).toFixed(2) + '%'); capEl.style.setProperty('--cy', cyv.toFixed(2) + '%'); }
      }
      /* Leistungspunkte: nie über Stationstext, Navigation oder Bedienknöpfen (sonst ausgeblendet; die CTA bleibt) */
      var blk = null, sr = null;
      hots.forEach(function (l) {
        var p3 = project(Mx, l.w), vis = p3[2] > 0.2 && p3[0] > 2 && p3[0] < 96 && p3[1] > 6 && p3[1] < 94 && hotOn(l, q);
        if (vis) {
          if (!blk) { sr = stage.getBoundingClientRect(); blk = Array.prototype.map.call(root.querySelectorAll('.jr-st.on, .jr-nav, .jr-skip, .jr-steps, .jr-tag'), function (el) { return el.getBoundingClientRect(); }).filter(function (r) { return r.width > 0 && r.height > 0; }); }
          var px = sr.left + p3[0] / 100 * sr.width, py = sr.top + p3[1] / 100 * sr.height, lf = p3[0] > 72, x0 = lf ? px - 190 : px - 30, x1 = lf ? px + 30 : px + 190;
          blk.forEach(function (r) { if (x1 > r.left && x0 < r.right && py + 30 > r.top && py - 30 < r.bottom) vis = false; });
        }
        /* rechts im Bild steht die Beschriftung links vom Punkt (bleibt im Bild) */
        l.el.classList.toggle('l', p3[0] > 72);
        l.el.style.setProperty('--x', p3[0].toFixed(2) + '%'); l.el.style.setProperty('--y', p3[1].toFixed(2) + '%'); l.el.classList.toggle('on', vis);
      });
    }
    function dist2(a, b) { var x = a[0] - b[0], y = a[1] - b[1], z = a[2] - b[2]; return x * x + y * y + z * z; }
    /* Renderauflösung: Gerätepixel begrenzt (max. 1,5), bei langsamen Bildern adaptiv bis 0,5 reduziert */
    var rs = 1, ft = [], rsLock = false;
    /* Pixelbudget: höchstens MAXPX Bildpunkte je Bild (grosse Bildschirme, z. B. 1920×1080 bei Pixeldichte 1,5),
       Seitenverhältnis bleibt. Projektion (w/h), Zeichenfläche und Spiegelziel folgen jeder Grössenänderung. */
    var MAXPX = opts.maxPixels || 2e6, pxCap = 1;
    function resize() { if (!stage) return; var r = stage.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height); if (canvas) { var f = dpr * rs; pxCap = Math.min(1, Math.sqrt(MAXPX / Math.max(1, w * h * f * f))); f *= pxCap; var cw = Math.max(1, Math.round(w * f)), ch = Math.max(1, Math.round(h * f)); if (canvas.width !== cw) canvas.width = cw; if (canvas.height !== ch) canvas.height = ch; } if (gl) gl.viewport(0, 0, canvas.width, canvas.height); }
    function adapt(dt) {
      if (rsLock) return; ft.push(dt); if (ft.length < 5) return; var avg = ft.reduce(function (a, b) { return a + b; }, 0) / ft.length; ft = [];
      if (avg > 45 && rs > 0.5) { rs = Math.max(0.5, rs * 0.75); resize(); } else if (avg < 20 && rs < 1) { rs = Math.min(1, rs / 0.85); resize(); }
    }
    function easeIO(k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
    /* Belichtung: drinnen (warm, hell beleuchtet) etwas knapper als draussen in der Dämmerung; der Wechsel geschieht
       weich über ≈0,45 s wie bei einer Kamera-Belichtungsautomatik (bei «Bewegung reduzieren» sofort) */
    function expoTarget(ins) { return 1.0 - 0.15 * ins; }
    /* Wind: nur wenn Aussenraum im Bild, nicht bei «Bewegung reduzieren», höchstens 30 Bilder/s und nur bis
       WIND.idleMs nach der letzten Eingabe – danach steht die Szene still und rendert nicht mehr */
    var WIND = C.wind || { idleMs: 15000, maxFps: 30 }, lastInput = 0, lastDraw = 0;
    function windOn(now) { return !!(TX.lb && extra && extra.fol.nm && !RMQ.matches && insideAmt(camNow(ps).e) < 0.5 && now - lastInput < WIND.idleMs); }
    function poke() { lastInput = win.performance.now(); if (running) request(); }
    function step(now) {
      raf = 0; if (!running) return; if (!show()) { lastT = 0; return; } /* V17.1: kein Bild mehr, wenn die Szene inzwischen unsichtbar ist */ var need = dirty, more = false; dirty = false; var d = p - ps; var raw = lastT ? now - lastT : 0, dt = lastT ? Math.min(100, raw) : 16; lastT = now;
      /* Texturen: das erste 3D-Bild höchstens 1,5 s auf die Materialtexturen warten lassen (bis dahin bleibt das Standbild) */
      if (!ready && TX.state === 'loading' && Date.now() - TX.t0 < 1500) { dirty = true; cont(); return; }
      /* zeitbasierte Glättung: unabhängig von der Bildrate, kein langes Hinterherlaufen */
      if (Math.abs(d) > 0.0004) { ps += d * (1 - Math.exp(-dt / tau)); need = true; } else if (d !== 0) { ps = p; need = true; }
      if (Math.abs(p - ps) < 0.002) tau = C.smoothing.tauMs;
      /* Scan-Kante: einmalig, 1,2 s, weich beschleunigt und abgebremst */
      if (scan.state === 'wait' && now >= scan.start) scan.state = 'run';
      if (scan.state === 'wait') more = true;
      if (scan.state === 'run') { var k = (now - scan.start) / SCAN_MS; if (k >= 1) { scan.state = 'done'; scan.end = now; sweep = 1e4; } else { sweep = -8 + easeIO(k) * 30; } need = true; }
      /* Hervorhebung am Waschtisch: 0,28 s ein, 1,4 s halten, 0,9 s aus – bei jedem neuen Betreten des Bads */
      /* V17: Beschriftung nach der tatsächlichen Kameraposition (ps) – nicht schon während der Fahrt durch andere Räume */
      var ha = hiAmt(ps), hOld = hiNow; hiNow = 0; if (mode !== 'static') root.classList.toggle('jr-hi', ha > 0.4);
      if (ha < 0.1) { pulse.armed = true; pulse.t0 = 0; }
      else if (!RMQ.matches) {
        if (pulse.armed && ha > 0.5) { pulse.armed = false; pulse.t0 = now; }
        if (pulse.t0) { var tt = now - pulse.t0, env = tt < 280 ? tt / 280 : tt < 1680 ? 1 : Math.max(0, 1 - (tt - 1680) / 900); hiNow = ha * env * 0.95; pulse.last = hiNow; if (tt < 2600) more = true; }
      }
      if (hiNow !== hOld) need = true;
      /* Belichtung nachführen */
      var et = expoTarget(insideAmt(camNow(ps).e));
      if (expoCur < 0 || RMQ.matches) { if (expoCur !== et) need = true; expoCur = et; }
      else if (Math.abs(et - expoCur) > 0.002) { expoCur += (et - expoCur) * (1 - Math.exp(-(raw ? Math.min(1000, raw) : 16) / 450)); need = true; } /* zeitbasiert auch bei langsamen Bildern (sonst ≈20 Bilder Nachlauf) */ else if (expoCur !== et) { expoCur = et; need = true; }
      var windy = windOn(now);
      if (windy && now - lastDraw >= 1000 / WIND.maxFps - 2) need = true;
      if (need || !ready) {
        if (raw && lastDrew) adapt(raw);
        windT = now / 1000; draw(); lastDraw = now; lastDrew = true;
        if (!ready) { ready = true; root.classList.add('jr-ready'); }
      } else lastDrew = false;
      if (!visible || doc.hidden) { lastT = 0; return; }
      if (need || more) cont();
      /* nur Wind: nächstes Bild erst nach 1/maxFps planen (keine leeren Bildaufrufe dazwischen) */
      else if (windy) { if (!windTimer) windTimer = win.setTimeout(function () { windTimer = 0; cont(); }, Math.max(4, 1000 / WIND.maxFps - (win.performance.now() - lastDraw))); lastT = 0; }
      else lastT = 0;
    }
    var windTimer = 0;
    var lastDrew = false;
    /* request(): von aussen (Grösse, Kamera, Sichtbarkeit, Texturen …) → nächstes Bild sicher zeichnen.
       Die Fortsetzung innerhalb von step() (Glättung, Wind) plant ohne diese Markierung. */
    var dirty = true;
    /* V17.1: ausserhalb des Sichtbereichs bzw. bei verstecktem Tab wird nichts geplant – die Markierung bleibt und das
       nächste Bild entsteht, sobald IntersectionObserver/visibilitychange die Szene wieder sichtbar melden */
    /* zusätzlich synchron die Lage im Fenster prüfen: unabhängig davon, wann der IntersectionObserver meldet (bei langsamer
       Grafik kann das mehrere Bilder dauern) */
    function show() { if (!visible || doc.hidden) return false; var r = root.getBoundingClientRect(), vh = win.innerHeight || doc.documentElement.clientHeight; return r.bottom > 0 && r.top < vh && r.width > 0; }
    function request() { dirty = true; if (!raf && running && show()) raf = win.requestAnimationFrame(step); }
    function cont() { if (!raf && running && show()) raf = win.requestAnimationFrame(step); }

    /* ---------- HTML-Einblendungen und Ereignisse aus dem Fortschritt ---------- */
    function stationOf(q) { for (var i = 0; i < ST.length; i++) if (q < ST[i].b || i === ST.length - 1) return i; return 0; }
    function ui(q) {
      var i = stationOf(q);
      if (i !== lastSt) {
        lastSt = i; cur = i; root.dataset.st = i;
        root.querySelectorAll('.jr-st').forEach(function (el, j) { var on = j === i; el.classList.toggle('on', on); el.setAttribute('aria-hidden', String(!on)); if (on) el.removeAttribute('inert'); else el.setAttribute('inert', ''); });
        root.querySelectorAll('.jr-nav button').forEach(function (b, j) { b.classList.toggle('on', j === i); if (j === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
        /* V17: waagrecht scrollbare Stationsleiste (Smartphone) – aktive Station mittig sichtbar, ohne die Seite zu verschieben */
        var nvEl = root.querySelector('.jr-nav'), onB = root.querySelectorAll('.jr-nav button')[i];
        if (nvEl && onB && nvEl.scrollWidth > nvEl.clientWidth + 2) { var li = onB.parentNode, tl = li.offsetLeft - (nvEl.clientWidth - li.offsetWidth) / 2; try { nvEl.scrollTo({ left: Math.max(0, tl), behavior: RMQ.matches ? 'auto' : 'smooth' }); } catch (e2) { nvEl.scrollLeft = Math.max(0, tl); } }
        if (started) emit('station-change', { station: ST[i].k, index: i, progress: Math.round(q * 1000) / 1000 });
      }
      var bar = root.querySelector('.jr-bar i'); if (bar) bar.style.transform = 'scaleY(' + q.toFixed(4) + ')';
      if (mode !== 'static') syncDet(q);
    }
    function setProgress(q) { if (destroyed) return; q = Math.max(0, Math.min(1, q)); if (Math.abs(q - p) < 0.00001) return; p = q; lastInput = win.performance.now(); ui(q); if (running) request(); }
    function glide(q, ms) { tau = ms || C.smoothing.jumpTauMs; setProgress(q); }

    /* ---------- WebGL-Start, Fehler, Freigabe ---------- */
    function fail(code) {
      emit('tour-error', { code: code, fallback: 'stills' });
      stopGL(); setStatic();
    }
    function initGL() {
      if (!canvas) { return 'WEBGL_UNAVAILABLE'; }
      try { gl = canvas.getContext('webgl', { antialias: true, alpha: false, powerPreference: 'low-power' }); } catch (e) { gl = null; }
      if (!gl) return 'WEBGL_UNAVAILABLE';
      try {
        ensureBuilt();
        EXT.der = !!gl.getExtension('OES_standard_derivatives');
        EXT.an = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
        if (EXT.an) EXT.anMax = Math.min(8, gl.getParameter(EXT.an.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 1);
        /* Software-Grafik (z. B. SwiftShader, llvmpipe – Rechner ohne nutzbare GPU): ohne anisotrope Filterung,
           einfachere Mipmap-Filterung und Start mit 60 % Auflösung. Auf echten GPUs bleibt alles unverändert. */
        var rn = String(gl.getParameter(gl.RENDERER) || '');
        if (/^WebKit WebGL$/.test(rn)) { var dri = gl.getExtension('WEBGL_debug_renderer_info'); if (dri) rn = String(gl.getParameter(dri.UNMASKED_RENDERER_WEBGL) || rn); }
        EXT.sw = /swiftshader|llvmpipe|softpipe|software|basic render/i.test(rn);
        if (EXT.sw && !win.IR_FORCE_HQ) { EXT.an = null; EXT.anMax = 1; if (!rsLock) rs = 0.5; } else EXT.sw = EXT.sw ? 'hq' : false;
        var ca = gl.getContextAttributes(); A2C = !!(ca && ca.antialias) && (gl.getParameter(gl.SAMPLES) || 0) > 1;
        PM = EXT.sw === true ? prog(VSML, FSM(false, true)) : prog(VSM, FSM(EXT.der, false)); PL = prog(VSL, FSL); PS = prog(VSS, FSS); PG = prog(VSG, FSG); PF = prog(VSF, FSF(EXT.der, A2C)); PH_ = prog(VSH, FSH); PT = prog(VST, FST);
        NATTR = Math.min(8, gl.getParameter(gl.MAX_VERTEX_ATTRIBS) || 8);
        TX.n1 = mkTex(1, new Uint8Array([128, 128, 128, 128]));
      } catch (e) { if (win.console) win.console.warn('ImmoReady-Rundgang:', e && e.message); return 'WEBGL_INIT_FAILED'; }
      LUT = mkLut(); CUBE0 = mkCube(1); TEX0 = mkTex(1, new Uint8Array([20, 20, 22, 255]));
      sets = [upload(G, null, null, 4), upload(INT, null, null, 3), upload(ENV, null, null, 30), upload(D, doorM, function (q) { return doorAngle(q) / D_HT.angle; }), upload(A, aptM, function (q) { return aptAngle(q) / D_WT.angle; }), upload(TT, terM, function (q) { return terSlide(q) / D_TT.slide; }), upload(SKY)];
      extra = {
        gz: { p: vbo(GZ.P), n: vbo(GZ.N), wc: vbo(GZ.WC), ws: vbo(GZ.WS), nm: GZ.P.length / 3 },
        fol: { p: vbo(FOL.P), uv: vbo(FOL.U), c: vbo(FOL.C), wv: vbo(FOL.WV), lt: vbo(FOL.L), nm: FOL.P.length / 3 },
        hal: { p: vbo(HAL.P), q: vbo(HAL.Q), c: vbo(HAL.C), nm: HAL.P.length / 3 },
        tg: [[TG, null], [TGD, doorM], [TGT, terM]].map(function (x) {
          var P = x[0].P, panes = []; for (var s0 = 0; s0 < P.length / 3; s0 += 6) { var c = [0, 0, 0]; for (var k = 0; k < 6; k++) { c[0] += P[(s0 + k) * 3] / 6; c[1] += P[(s0 + k) * 3 + 1] / 6; c[2] += P[(s0 + k) * 3 + 2] / 6; } panes.push({ s: s0, c: c }); }
          return { p: vbo(P), n: vbo(x[0].N), nm: P.length / 3, M: x[1], panes: x[1] ? null : panes };
        })
      };
      if (TX.imgs) uploadTex();
      labels = Array.prototype.map.call(stage.querySelectorAll('[data-w]'), function (el) { return { el: el, w: el.dataset.w.split(',').map(Number) }; });
      capEl = stage.querySelector('.jr-tech-c');
      hots = Array.prototype.map.call(stage.querySelectorAll('[data-hot]'), function (el) { return { el: el, w: el.dataset.hot.split(',').map(Number), st: +el.dataset.st }; });
      var weak = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.deviceMemory && navigator.deviceMemory <= 4);
      dpr = Math.min(win.devicePixelRatio || 1, weak ? 1 : 1.5); resize(); running = true; ps = p; expoCur = -1; lastInput = win.performance.now();
      if (win.ResizeObserver) { ro = new win.ResizeObserver(function () { resize(); request(); }); ro.observe(stage); }
      if (win.IntersectionObserver) { io = new win.IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) request(); else if (windTimer) { win.clearTimeout(windTimer); windTimer = 0; } }); io.observe(root); }
      on(doc, 'visibilitychange', function () { if (!doc.hidden) request(); else if (windTimer) { win.clearTimeout(windTimer); windTimer = 0; } });
      on(canvas, 'webglcontextlost', function (e) { e.preventDefault(); if (!destroyed) fail('WEBGL_CONTEXT_LOST'); });
      /* Scan nur beim ersten Start auf der Gesamtansicht und ohne «Bewegung reduzieren» */
      if (scan.count === 0 && !RMQ.matches && p < ST[0].b) { scan.count = 1; scan.state = 'wait'; scan.start = win.performance.now() + SCAN_DELAY; sweep = -8; }
      else { scan.state = 'done'; sweep = 1e4; }
      request();
      return null;
    }
    function stopGL() {
      running = false; if (raf) { win.cancelAnimationFrame(raf); raf = 0; } if (windTimer) { win.clearTimeout(windTimer); windTimer = 0; }
      if (ro) { ro.disconnect(); ro = null; } if (io) { io.disconnect(); io = null; }
      if (gl) {
        try {
          buffers.forEach(function (b) { gl.deleteBuffer(b); }); textures.forEach(function (t) { gl.deleteTexture(t); });
          progs.forEach(function (q) { gl.deleteProgram(q); }); shaders.forEach(function (s) { gl.deleteShader(s); });
          if (probeFB) gl.deleteFramebuffer(probeFB); if (probeRB) gl.deleteRenderbuffer(probeRB); if (MIR.fb) gl.deleteFramebuffer(MIR.fb); if (MIR.rb) gl.deleteRenderbuffer(MIR.rb);
          var ext = gl.getExtension('WEBGL_lose_context'); if (ext && !gl.isContextLost()) ext.loseContext();
        } catch (e) {}
      }
      probeFB = probeRB = null; probeN = 0; PROBES.forEach(function (pb) { pb.tex = null; }); MIR.fb = MIR.rb = MIR.tex = null; MIR.w = MIR.h = 0; LUT = CUBE0 = TEX0 = null; curProbe = null;
      buffers = []; shaders = []; textures = []; progs = []; sets = []; extra = null; gl = null; PM = PL = PS = PG = PF = PH_ = PT = null; TX.t1 = TX.t2 = TX.lb = TX.n1 = null; ready = false; root.classList.remove('jr-ready');
      if (scan.state !== 'done') { scan.state = 'done'; sweep = 1e4; }
    }

    /* ---------- Modi: Standbilder, Stationen, Scroll ---------- */
    function showStill(i) { cur = i; ui(ST[i].hold); root.querySelectorAll('.jr-still').forEach(function (im, j) { im.classList.toggle('on', j === i); }); root.querySelectorAll('.jr-det [data-det]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.detI === '-1')); }); }
    function setStatic() { mode = 'static'; root.classList.add('jr-static'); root.classList.remove('jr-live', 'jr-button'); showStill(cur); }
    function scrollProg() { var r = root.getBoundingClientRect(); var span = root.offsetHeight - win.innerHeight; return span > 0 ? (-r.top) / span : 0; }
    function goStation(i) {
      if (destroyed) return; i = Math.max(0, Math.min(ST.length - 1, i | 0)); var q = ST[i].hold; cur = i;
      if (mode === 'live') { var top = root.getBoundingClientRect().top + win.scrollY; var span = root.offsetHeight - win.innerHeight; glide(q, C.smoothing.jumpTauMs); win.scrollTo({ top: Math.round(top + q * span + (i === ST.length - 1 ? -2 : 0)), behavior: 'instant' }); }
      else if (mode === 'button') { glide(q, RMQ.matches ? 1 : C.smoothing.stepsTauMs); }
      else showStill(i);
    }
    function currentIndex() { return mode === 'static' ? cur : stationOf(p); }
    /* Nahansichten einer Station (rise.json → details): 3D fährt zum Fortschritt q, im Bildmodus wechselt das Bild */
    function goDetail(btn) {
      if (destroyed) return; var q = +btn.dataset.det, k = +btn.dataset.detI, grp = btn.closest('.jr-det');
      if (grp) grp.querySelectorAll('[data-det]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      if (mode === 'live') { var top = root.getBoundingClientRect().top + win.scrollY, span = root.offsetHeight - win.innerHeight; glide(q, C.smoothing.jumpTauMs); win.scrollTo({ top: Math.round(top + q * span), behavior: 'instant' }); }
      else if (mode === 'button') glide(q, RMQ.matches ? 1 : C.smoothing.stepsTauMs);
      else root.querySelectorAll('.jr-still').forEach(function (im, j) { im.classList.toggle('on', k < 0 ? j === cur : im.dataset.detStill === String(k)); });
    }
    function syncDet(q) {
      var best = null, bd = 0.012; root.querySelectorAll('.jr-st.on [data-det]').forEach(function (b) { var d = Math.abs(+b.dataset.det - q); if (d < bd) { bd = d; best = b; } });
      if (best) root.querySelectorAll('.jr-st.on [data-det]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === best)); });
    }
    /* Auswahl in der Wohnung (Reinigung · Räumung · Leerstand): Klick, Tastatur, Touch – Text immer sichtbar */
    function choose(btn, focus) {
      var g = btn.closest('.jr-choice'); if (!g) return; var key = btn.dataset.choice; if (SERVICES.indexOf(key) < 0) return;
      g.querySelectorAll('[data-choice]').forEach(function (b) { var onB = b === btn; b.setAttribute('aria-checked', String(onB)); b.tabIndex = onB ? 0 : -1; b.classList.toggle('on', onB); });
      g.querySelectorAll('[data-choice-text]').forEach(function (t) { t.hidden = t.dataset.choiceText !== key; });
      var cta = g.querySelector('[data-choice-cta]'); if (cta) { cta.dataset.pre = key; var lab = cta.querySelector('.jr-cl'); if (lab) lab.textContent = btn.dataset.cta || lab.textContent; }
      if (focus) btn.focus();
    }
    function skipTour() {
      var r = root.getBoundingClientRect(), y = r.bottom + win.scrollY;
      win.scrollTo({ top: Math.round(y), behavior: RMQ.matches ? 'instant' : 'smooth' });
    }
    on(root, 'click', function (e) {
      var ch = e.target.closest('[data-choice]'); if (ch && root.contains(ch)) { e.preventDefault(); choose(ch, false); return; }
      var dtb = e.target.closest('[data-det]'); if (dtb && root.contains(dtb)) { e.preventDefault(); goDetail(dtb); return; }
      var g = e.target.closest('[data-go]'); if (g && root.contains(g)) { e.preventDefault(); goStation(+g.dataset.go); return; }
      var s = e.target.closest('[data-step]'); if (s && root.contains(s)) { e.preventDefault(); goStation(currentIndex() + (+s.dataset.step)); return; }
      var sk = e.target.closest('[data-skip]'); if (sk && root.contains(sk)) { e.preventDefault(); skipTour(); return; }
      var ct = e.target.closest('a[data-contact]');
      if (ct && root.contains(ct)) {
        var dc = { station: ST[currentIndex()].k, source: 'tour', version: C.eventsVersion };
        emit('request-contact', dc);
        if (opts.interceptContact && opts.interceptContact(dc)) { e.preventDefault(); e.stopPropagation(); }
        return;
      }
      var a = e.target.closest('a[href="#offerte"]');
      if (a && root.contains(a)) {
        var svc = a.dataset.pre || ''; if (svc && SERVICES.indexOf(svc) < 0) svc = '';
        var detail = { service: svc, station: ST[currentIndex()].k, source: 'tour', version: C.eventsVersion };
        emit('request-quote', detail);
        if (opts.interceptQuote && opts.interceptQuote(detail)) { e.preventDefault(); e.stopPropagation(); }
      }
    });
    on(root, 'keydown', function (e) {
      var d = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 0;
      var og = e.target.closest && e.target.closest('.jr-choice-opts');
      if (og && (d || e.key === 'Home' || e.key === 'End')) {
        var bs = Array.prototype.slice.call(og.querySelectorAll('[data-choice]')), k = bs.indexOf(e.target.closest('[data-choice]'));
        var n = e.key === 'Home' ? 0 : e.key === 'End' ? bs.length - 1 : (k + d + bs.length) % bs.length;
        e.preventDefault(); choose(bs[n], true); return;
      }
      if (mode === 'live' || !e.target.closest('.jr-nav') || !d) return;
      e.preventDefault(); goStation(currentIndex() + d); var b = root.querySelectorAll('.jr-nav button')[cur]; if (b) b.focus();
    });
    /* Eingaben halten den Wind kurz am Leben (danach steht die Szene still) */
    ['pointermove', 'pointerdown', 'wheel', 'keydown', 'touchstart'].forEach(function (ev) { on(root, ev, function () { if (running && win.performance.now() - lastInput > 250) poke(); }, { passive: true }); });
    if (reqMode === 'scroll') on(win, 'scroll', function () { /* V17.1: ausserhalb des Sichtbereichs ohne Bildanforderung (Fortschritt bleibt am Rand) */ if (!show()) { if (mode === 'live' && !scrollTick) setProgress(scrollProg()); return; } if (!scrollTick) { scrollTick = true; win.requestAnimationFrame(function () { scrollTick = false; if (mode === 'live') setProgress(scrollProg()); }); } }, { passive: true });
    function prefChange() { if (mode !== 'static' && (SMALL.matches || (RMQ.matches && reqMode === 'scroll'))) { stopGL(); setStatic(); } }
    onMQ(RMQ, prefChange); onMQ(SMALL, prefChange);

    /* Ereignisse erst nach dem Start: Listener (z. B. Velo in $w.onReady) verpassen nichts */
    function ready_(m) { started = true; emit('tour-ready', { version: C.version, mode: m }); var i = currentIndex(); emit('station-change', { station: ST[i].k, index: i, progress: Math.round((mode === 'static' ? ST[i].hold : p) * 1000) / 1000 }); }
    function start() {
      startTimer = 0; idleId = 0; if (destroyed) return;
      if (SMALL.matches || (RMQ.matches && reqMode === 'scroll')) { setStatic(); ready_('stills'); return; }
      /* Texturen und vorab gerechnetes Licht nur laden, wenn 3D wirklich startet (nicht auf Smartphones) */
      if (TX.state === 'none') loadTex();
      if (pbState === 'none') loadBake();
      /* lange Rechenarbeit in Etappen, damit Eingaben zwischendurch verarbeitet werden */
      if (!baked) { if (!buildStep()) { schedule(start); return; } }
      if (reqMode === 'scroll') { root.classList.add('jr-live'); mode = 'live'; } else { root.classList.add('jr-live', 'jr-button'); mode = 'button'; }
      root.classList.remove('jr-static');
      if (mode === 'live') { p = Math.max(0, Math.min(1, scrollProg())); ui(p); } else p = ST[cur].hold;
      var err = initGL();
      if (err) { stopGL(); setStatic(); emit('tour-error', { code: err, fallback: 'stills' }); ready_('stills'); return; }
      ps = p; ui(p);
      ready_('webgl');
    }

    /* Startzustand: Station 1 als Standbild + Text sofort; 3D danach */
    showStill(0);
    root.querySelectorAll('.jr-choice').forEach(function (g) { var f = g.querySelector('[data-choice][aria-checked="true"]') || g.querySelector('[data-choice]'); if (f) choose(f, false); });
    if (SMALL.matches || (RMQ.matches && reqMode === 'scroll')) setStatic();
    else root.classList.add('jr-live'), reqMode === 'steps' && root.classList.add('jr-button');
    function schedule(fn) { if (destroyed) return; if (win.requestIdleCallback) idleId = win.requestIdleCallback(fn, { timeout: 600 }); else startTimer = win.setTimeout(fn, 60); }
    var later = function () { schedule(start); };
    var startAfterLoad = function () { if (doc.readyState === 'complete') later(); else on(win, 'load', later, { once: true }); };
    if (opts.deferStart === false) { ensureBuilt(); start(); }
    /* Fertigstellung: Auf der Seite steht der Rundgang als optionaler Abschnitt weiter unten. Geometrie, Texturen, Lichtdaten
       und WebGL erst vorbereiten, wenn er in Sichtnähe kommt (1,5 Bildschirmhöhen) – der Seitenstart bleibt frei.
       Bildmodus (Smartphone, Bewegung reduzieren) startet wie bisher sofort, weil er nichts lädt. */
    else if (opts.lazyStart && win.IntersectionObserver && !(SMALL.matches || (RMQ.matches && reqMode === 'scroll'))) {
      var lazyIO = new win.IntersectionObserver(function (es) {
        if (!es[0].isIntersecting || destroyed) return;
        lazyIO.disconnect(); startAfterLoad();
      }, { rootMargin: '150% 0px 150% 0px' });
      lazyIO.observe(root);
      disposers.push(function () { lazyIO.disconnect(); });
    }
    else startAfterLoad();

    /* Routenprüfung: Abstand der Kamera zu allen Wänden und Möbeln entlang der ganzen Fahrt (interpoliert) */
    function checkRoute(n) {
      ensureGeo();
      var bad = [], r = C.routeClearance;
      for (var i = 0; i <= n; i++) { var q = i / n, e = camAt(q).e; WALLS.forEach(function (b, j) { if (e[0] > b[0] - r && e[0] < b[1] + r && e[1] > b[2] - r && e[1] < b[3] + r && e[2] > b[4] - r && e[2] < b[5] + r) bad.push([+q.toFixed(3), j]); }); }
      return bad;
    }
    /* Kennzahlen der Fahrt: grösste Drehung (Grad je 1 % Fortschritt), grösster Bildwinkel, Türdurchgänge */
    function routeStats(n) {
      var maxRot = 0, maxRotAt = 0, maxFov = 0, prev = null, passes = [];
      for (var i = 0; i <= n; i++) {
        var q = i / n, c = camAt(q);
        if (prev) {
          var dYaw = Math.abs(c.yaw - prev.yaw), dPit = Math.abs(c.pitch - prev.pitch), rot = Math.hypot(dYaw * Math.cos(c.pitch), dPit) * 180 / Math.PI * (n / 100);
          if (rot > maxRot) { maxRot = rot; maxRotAt = q; }
          var a = prev.e, b = c.e;
          if ((a[2] - 5.5) * (b[2] - 5.5) <= 0 && Math.abs(b[0]) < 1.5) passes.push({ door: 'haustuer', p: +q.toFixed(4), deg: Math.round(doorAngle(q) * 180 / Math.PI) });
          if ((a[0] - 3) * (b[0] - 3) <= 0 && b[2] > 2.3 && b[2] < 4.3) passes.push({ door: 'wohnungstuer', p: +q.toFixed(4), deg: Math.round(aptAngle(q) * 180 / Math.PI) });
          if ((a[2] - 5.5) * (b[2] - 5.5) <= 0 && b[0] > 5.5 && b[0] < 9) passes.push({ door: 'terrassentuer', p: +q.toFixed(4), slide: +terSlide(q).toFixed(3) });
        }
        maxFov = Math.max(maxFov, c.f); prev = c;
      }
      return { maxRotDegPerPercent: +maxRot.toFixed(1), at: +maxRotAt.toFixed(3), maxFovDeg: +(maxFov * 180 / Math.PI).toFixed(1), passes: passes };
    }
    /* Nahebene statt nur Kameramittelpunkt: Ecken und Kantenmitten der Nahebene (aus der inversen Bildmatrix, inkl.
       Objektivverschiebung) gegen alle Kollisionskörper und die bewegten Türflügel (orientierte Box im Türsystem).
       Liefert den kleinsten Abstand der Nahebene zu Geometrie; < 0 hiesse: eine Wand wird angeschnitten. */
    function inv4(m) {
      var a = m, o = new Array(16), b00 = a[0] * a[5] - a[1] * a[4], b01 = a[0] * a[6] - a[2] * a[4], b02 = a[0] * a[7] - a[3] * a[4], b03 = a[1] * a[6] - a[2] * a[5], b04 = a[1] * a[7] - a[3] * a[5], b05 = a[2] * a[7] - a[3] * a[6],
        b06 = a[8] * a[13] - a[9] * a[12], b07 = a[8] * a[14] - a[10] * a[12], b08 = a[8] * a[15] - a[11] * a[12], b09 = a[9] * a[14] - a[10] * a[13], b10 = a[9] * a[15] - a[11] * a[13], b11 = a[10] * a[15] - a[11] * a[14];
      var d = 1 / (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);
      o[0] = (a[5] * b11 - a[6] * b10 + a[7] * b09) * d; o[1] = (a[2] * b10 - a[1] * b11 - a[3] * b09) * d; o[2] = (a[13] * b05 - a[14] * b04 + a[15] * b03) * d; o[3] = (a[10] * b04 - a[9] * b05 - a[11] * b03) * d;
      o[4] = (a[6] * b08 - a[4] * b11 - a[7] * b07) * d; o[5] = (a[0] * b11 - a[2] * b08 + a[3] * b07) * d; o[6] = (a[14] * b02 - a[12] * b05 - a[15] * b01) * d; o[7] = (a[8] * b05 - a[10] * b02 + a[11] * b01) * d;
      o[8] = (a[4] * b10 - a[5] * b08 + a[7] * b06) * d; o[9] = (a[1] * b08 - a[0] * b10 - a[3] * b06) * d; o[10] = (a[12] * b04 - a[13] * b02 + a[15] * b00) * d; o[11] = (a[9] * b02 - a[8] * b04 - a[11] * b00) * d;
      o[12] = (a[5] * b07 - a[4] * b09 - a[6] * b06) * d; o[13] = (a[0] * b09 - a[1] * b07 + a[2] * b06) * d; o[14] = (a[13] * b01 - a[12] * b03 - a[14] * b00) * d; o[15] = (a[8] * b03 - a[9] * b01 + a[10] * b00) * d;
      return o;
    }
    function checkFrustum(n) {
      ensureGeo();
      function aabb(S) { var lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (var i = 0; i < S.P.length; i += 3) for (var k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], S.P[i + k]); hi[k] = Math.max(hi[k], S.P[i + k]); } return [lo, hi]; }
      function bd(p, lo, hi) { var dx = Math.max(lo[0] - p[0], 0, p[0] - hi[0]), dy = Math.max(lo[1] - p[1], 0, p[1] - hi[1]), dz = Math.max(lo[2] - p[2], 0, p[2] - hi[2]); if (dx || dy || dz) return Math.hypot(dx, dy, dz); return -Math.min(p[0] - lo[0], hi[0] - p[0], p[1] - lo[1], hi[1] - p[1], p[2] - lo[2], hi[2] - p[2]); }
      function loc(M, p) { var x = p[0] - M[12], y = p[1] - M[13], z = p[2] - M[14]; return [M[0] * x + M[1] * y + M[2] * z, M[4] * x + M[5] * y + M[6] * z, M[8] * x + M[9] * y + M[10] * z]; }
      var movers = [[D, doorM], [A, aptM], [TT, terM]].map(function (x) { return { b: aabb(x[0]), M: x[1] }; });
      var sw = w, sh = h; if (!w || !h) { w = 1440; h = 900; }
      var min = 1e9, at = 0, what = '', hits = [];
      for (var i = 0; i <= n; i++) {
        var q = i / n, mx = matrix(q), iv = inv4(mx.m), pts = [];
        [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, -1], [0, 1], [-1, 0], [1, 0], [0, 0]].forEach(function (c) { var x = c[0], y = c[1], z = -1; var X = iv[0] * x + iv[4] * y + iv[8] * z + iv[12], Y = iv[1] * x + iv[5] * y + iv[9] * z + iv[13], Z = iv[2] * x + iv[6] * y + iv[10] * z + iv[14], W = iv[3] * x + iv[7] * y + iv[11] * z + iv[15]; pts.push([X / W, Y / W, Z / W]); });
        pts.forEach(function (pt) {
          WALLS.forEach(function (b, j) { var d = bd(pt, [b[0], b[2], b[4]], [b[1], b[3], b[5]]); if (d < min) { min = d; at = q; what = 'Körper ' + j; } if (d < 0.0) hits.push([+q.toFixed(4), 'Körper ' + j]); });
          movers.forEach(function (mv, j) { var M = mv.M(q), d = bd(loc(M, pt), mv.b[0], mv.b[1]); if (d < min) { min = d; at = q; what = ['Haustür', 'Wohnungstür', 'Terrassentür'][j]; } if (d < 0.0) hits.push([+q.toFixed(4), ['Haustür', 'Wohnungstür', 'Terrassentür'][j]]); });
        });
      }
      w = sw; h = sh;
      return { minClearM: +min.toFixed(3), at: +at.toFixed(4), nearest: what, hits: hits.slice(0, 20), samples: n + 1 };
    }
    function destroy() {
      if (destroyed) return; destroyed = true;
      if (idleId && win.cancelIdleCallback) win.cancelIdleCallback(idleId); if (startTimer) win.clearTimeout(startTimer);
      stopGL(); disposers.splice(0).forEach(function (f) { try { f(); } catch (e) {} });
      root.classList.remove('jr-live', 'jr-button', 'jr-static', 'jr-hi', 'jr-ready');
    }

    return {
      goStation: goStation, setProgress: setProgress, glide: glide, destroy: destroy,
      progress: function () { return p; }, mode: function () { return mode; }, station: function () { return currentIndex(); },
      jump: function (q) { p = ps = q; expoCur = -1; if (scan.state !== 'done') { scan.state = 'done'; } sweep = 1e4; ui(q); if (running) request(); },
      ui: ui, stationOf: stationOf, checkRoute: checkRoute, checkFrustum: checkFrustum, routeStats: routeStats, camAt: camAt, doorAngle: doorAngle, aptAngle: aptAngle, terSlide: terSlide,
      /* Messung: n Bilder an Position q synchron zeichnen (readPixels), mittlere Dauer in ms – für den Testbericht */
      bench: function (q, n) { if (!gl) return null; var o = ps; ps = q; var px = new Uint8Array(4); draw(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); var t0 = win.performance.now(); for (var i = 0; i < n; i++) { draw(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); } var ms = (win.performance.now() - t0) / n; ps = o; draw(); return { ms: +ms.toFixed(1), px: canvas.width * canvas.height, scale: rs }; },
      bakeAt: function (q, n, m) { ensureBuilt(); return bakeOne(q, n, m || 0); },
      /* Prüfhilfen: Weltpunkt → Bildschirm in % (aktuelle Kamera inkl. Objektivverschiebung); Bildstatistik des aktuellen Bilds */
      project: function (v) { if (!w || !h) return null; var q = project(matrix(ps).m, v); return [+q[0].toFixed(3), +q[1].toFixed(3)]; },
      frameStats: function () {
        if (!gl) return null; draw(); var W2 = canvas.width, H2 = canvas.height, px = new Uint8Array(W2 * H2 * 4); gl.readPixels(0, 0, W2, H2, gl.RGBA, gl.UNSIGNED_BYTE, px);
        var n = W2 * H2, sum = 0, clip = 0; for (var i = 0; i < n; i++) { var r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2]; sum += 0.2126 * r + 0.7152 * g + 0.0722 * b; if (r >= 253 && g >= 253 && b >= 253) clip++; }
        return { mean: +(sum / n / 255).toFixed(3), clipped: +(clip / n).toFixed(5), w: W2, h: H2 };
      },
      /* Prüfhilfen V15: Mischwert des Türlichts (0 = zu gebacken, 1 = offen gebacken) · Bildstabilität (zwei Bilder bei
         gleicher Kamera und gleicher Windzeit, mittlere absolute Differenz 0…1) · Leuchtenanteil eines Wandpunkts */
      doorLight: function (q) { return Math.max(0, Math.min(1, doorAngle(q) / D_HT.angle)); },
      frameDiff: function () {
        if (!gl) return null; var W2 = canvas.width, H2 = canvas.height, a = new Uint8Array(W2 * H2 * 4), b2 = new Uint8Array(W2 * H2 * 4), t0 = windT;
        draw(); gl.readPixels(0, 0, W2, H2, gl.RGBA, gl.UNSIGNED_BYTE, a); windT = t0; draw(); gl.readPixels(0, 0, W2, H2, gl.RGBA, gl.UNSIGNED_BYTE, b2);
        var s = 0; for (var i = 0; i < a.length; i += 4) s += Math.abs(a[i] - b2[i]) + Math.abs(a[i + 1] - b2[i + 1]) + Math.abs(a[i + 2] - b2[i + 2]); return s / (W2 * H2 * 3 * 255);
      },
      /* Leuchten wirken nur im eigenen Raum (roomOf). Ein Lichtdurchtritt entstünde, wenn eine Wandseite dem falschen Raum
         zugeordnet würde – roomAt prüft genau diese Zuordnung; lightAt liefert das Licht eines Punkts (ohne Vorabdaten). */
      roomAt: function (q) { ensureGeo(); return roomOf(q); },
      lightAt: function (q, n) { ensureGeo(); var s = []; var c = bakeOne(q, n, 0, s); return { rgb: c.map(function (v) { return +v.toFixed(4); }), room: roomOf(q) }; },
      setScale: function (v, lock) { rs = Math.max(0.25, Math.min(1, v)); rsLock = !!lock; resize(); if (running) request(); },
      /* nur für die Bildproduktion (tools/render-stills.js): feste Kamera {e,t,f} oder null */
      setCamera: function (c) { camOverride = c || null; expoCur = -1; if (running) request(); },
      walls: function () { ensureGeo(); return WALLS.slice(); },
      /* Prüfhilfe V16: senkrechter Strahl durch die echte Dreiecksgeometrie (Gebäude, Innenräume, Umgebung) –
         dir = +1 nach oben, −1 nach unten; liefert die Höhe der ersten getroffenen Fläche oder null (Kopfhöhe, WC-Schüssel) */
      rayY: function (x, y, z, dir) {
        ensureGeo(); var best = null;
        [G, INT, ENV].forEach(function (S) { var P = S.P; for (var i = 0; i < P.length; i += 9) {
          var ax = P[i], az = P[i + 2], bx = P[i + 3], bz = P[i + 5], cx = P[i + 6], cz = P[i + 8];
          var d = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz); if (Math.abs(d) < 1e-12) continue;
          var l1 = ((bz - cz) * (x - cx) + (cx - bx) * (z - cz)) / d, l2 = ((cz - az) * (x - cx) + (ax - cx) * (z - cz)) / d, l3 = 1 - l1 - l2;
          if (l1 < 0 || l2 < 0 || l3 < 0) continue; var yy = l1 * P[i + 1] + l2 * P[i + 4] + l3 * P[i + 7];
          if (dir > 0 ? (yy > y + 1e-4 && (best === null || yy < best)) : (yy < y - 1e-4 && (best === null || yy > best))) best = yy; } });
        return best === null ? null : +best.toFixed(4);
      },
      /* Export für das GLB-Modell: Gebäude, Innenräume und Umgebung zu einem Satz G zusammengeführt, Gruppen mit Startindex */
      exportGeo: function () {
        ensureBuilt(); var base = {}, off = 0, M = { P: [], N: [], C: [], E: [], M: [], L: [] };
        [G, INT, ENV].forEach(function (x) { base[x.name] = off; off += x.P.length / 3; ['P', 'N', 'C', 'E', 'M', 'L'].forEach(function (k) { M[k] = M[k].concat(Array.prototype.slice.call(x[k])); }); });
        var gr = GR.map(function (g) { return [g[0], base[g[1].name] + g[2]]; }).sort(function (a, b) { return a[1] - b[1]; });
        function g(x) { return { P: x.P, N: x.N, C: x.C, E: x.E, M: x.M }; }
        return { G: M, D: g(D), A: g(A), TT: g(TT), groups: gr };
      },
      cull: function () { return { drawn: cullStats.drawn, total: cullStats.total, chunks: sets.filter(function (o) { return o.ranges; }).map(function (o) { return o.name + ':' + o.ranges.length; }) }; },
      sceneStats: function () {
        ensureGeo(); var all = [G, INT, ENV, D, A, TT];
        return { vertices: all.reduce(function (a, x) { return a + x.P.length / 3; }, 0) + FOL.P.length / 3 + GZ.P.length / 3 + (TG.P.length + TGD.P.length + TGT.P.length) / 3 + HAL.P.length / 3,
          surfaces: all.reduce(function (a, x) { return a + x.P.length / 3; }, 0), foliage: FOL.P.length / 3, cards: FOL.P.length / 18, panes: GZ.P.length / 18, glass: (TG.P.length + TGD.P.length + TGT.P.length) / 18, halos: HAL.P.length / 18,
          lines: all.reduce(function (a, x) { return a + x.LP.length / 6; }, 0), lights: LIT.length, occluders: OCC.length, colliders: WALLS.length, renderScale: rs, buildMs: buildMs, bakeMs: bakeMs,
          prebaked: pbUsed, bakeState: pbState, textures: TX.state, derivatives: EXT.der, anisotropy: EXT.anMax, softwareGL: EXT.sw,
          probes: PROBES.filter(function (pb) { return !!pb.tex; }).map(function (pb) { return pb.id; }), probeMs: Math.round(probeMs), mirrorFrames: MIR.frames, alphaToCoverage: A2C,
          glResources: { buffers: buffers.length, textures: textures.length, programs: progs.length } };
      },
      /* nur für tools/bake-light.js: Geometrie, Leuchten und Gewichte zum Vorabrechnen von Umgebungsverdeckung und Schatten */
      bakeKit: function () {
        ensureGeo(); function pk(x) { return { name: x.name, P: Array.prototype.slice.call(x.P), N: Array.prototype.slice.call(x.N), M: Array.prototype.slice.call(x.M) }; }
        function mv(x, Mx) { var o = pk(x); for (var i = 0; i < o.P.length; i += 3) { var a = o.P[i], b = o.P[i + 1], c = o.P[i + 2]; o.P[i] = Mx[0] * a + Mx[4] * b + Mx[8] * c + Mx[12]; o.P[i + 1] = Mx[1] * a + Mx[5] * b + Mx[9] * c + Mx[13]; o.P[i + 2] = Mx[2] * a + Mx[6] * b + Mx[10] * c + Mx[14]; } return o; }
        return { hash: geoHash(), sets: [pk(G), pk(INT), pk(ENV)], movers: [mv(D, doorM(0)), mv(A, aptM(0)), mv(TT, terM(0))], foliage: { P: FOL.P.slice() }, lights: LIT.map(function (l) { return l.slice(); }) };
      },
      lightW: function (q, n, m) { return lightW(q, n, m); },
      roomOf: function (q) { return roomOf(q); },
      state: function () { return { frames: drawCount, p: p, ps: ps, ready: ready, running: running, mode: mode, destroyed: destroyed, listeners: disposers.length, expo: expoCur, wind: !!windTimer || (running && windOn(win.performance.now())), scan: { state: scan.state, start: scan.start, end: scan.end, count: scan.count }, hi: hiNow, pulseLast: pulse.last, canvas: canvas ? [canvas.width, canvas.height] : null, css: [w, h], dpr: dpr, rs: rs, pxCap: pxCap }; }
    };
  }

  global.IRTour = { create: create, version: '14' };
})(window);
