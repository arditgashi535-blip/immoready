"""Erzeugt immoready-wohnblock.glb (V13: Dämmerungs-Szene mit Garten, Terrassentür, möbliertem Wohnraum und Bad) aus der Geometrie, die die Website-Szene (p3g / JR.exportGeo) verwendet.
Ein Objekt pro Bereich (Garten, Gebäude, Eingangshalle, Wohnung, Bad, Sanitär-Waschtisch …) und die Haustür
als eigenes, um das Scharnier drehbares Objekt «Eingangstuer». Farben als Vertex-Farben, Leuchtflächen als
eigenes Material. Zum Verfeinern in Blender: Datei > Import > glTF 2.0."""
import json, struct, sys
src, out = sys.argv[1], sys.argv[2]
g = json.load(open(src))
buf = bytearray(); views = []; accs = []; meshes = []; nodes = []
def add(data, fmt, comp, typ, count, target=34962, minmax=None):
    while len(buf) % 4: buf.append(0)
    off = len(buf); buf.extend(struct.pack('<%d%s' % (len(data), fmt), *data))
    views.append({"buffer": 0, "byteOffset": off, "byteLength": len(buf) - off, "target": target})
    a = {"bufferView": len(views) - 1, "componentType": comp, "count": count, "type": typ}
    if minmax: a["min"], a["max"] = minmax
    accs.append(a); return len(accs) - 1
MAT = [{"name": "Oberflaeche", "pbrMetallicRoughness": {"baseColorFactor": [1, 1, 1, 1], "metallicFactor": 0, "roughnessFactor": 0.85}},
       {"name": "Leuchtflaeche", "pbrMetallicRoughness": {"baseColorFactor": [1, 1, 1, 1], "metallicFactor": 0, "roughnessFactor": 0.6}, "emissiveFactor": [1.0, 0.95, 0.85]}]
def prim(P, N, C, idx):
    if not idx: return None
    pos = []; nor = []; col = []
    for i in idx:
        pos += P[i*3:i*3+3]; nor += N[i*3:i*3+3]; col += C[i*3:i*3+3]
    xs, ys, zs = pos[0::3], pos[1::3], pos[2::3]
    a = add(pos, 'f', 5126, 'VEC3', len(idx), minmax=([min(xs), min(ys), min(zs)], [max(xs), max(ys), max(zs)]))
    b = add(nor, 'f', 5126, 'VEC3', len(idx)); c = add(col, 'f', 5126, 'VEC3', len(idx))
    return {"attributes": {"POSITION": a, "NORMAL": b, "COLOR_0": c}}
def mesh(name, S, start, end, translation=None):
    P, N, C, E = S['P'], S['N'], S['C'], S['E']
    norm = [i for i in range(start, end) if E[i] <= 0]; emis = [i for i in range(start, end) if E[i] > 0]
    ps = []
    for m, idx in ((0, norm), (1, emis)):
        pr = prim(P, N, C, idx)
        if pr: pr["material"] = m; ps.append(pr)
    meshes.append({"name": name, "primitives": ps})
    n = {"name": name, "mesh": len(meshes) - 1}
    if translation: n["translation"] = translation
    nodes.append(n)
G = g['G']; total = len(G['P']) // 3; gr = g['groups']
if gr[0][1] > 0: mesh('Basis', G, 0, gr[0][1])
for k, (name, st) in enumerate(gr):
    en = gr[k + 1][1] if k + 1 < len(gr) else total
    if en > st: mesh(name, G, st, en)
mesh('Eingangstuer', g['D'], 0, len(g['D']['P']) // 3, translation=[-0.8, 0.5, 5.35])
if 'A' in g: mesh('Wohnungstuer', g['A'], 0, len(g['A']['P']) // 3, translation=[3.0, 0.5, 3.85])
if 'TT' in g and g['TT']['P']: mesh('Terrassentuer_Schiebefluegel', g['TT'], 0, len(g['TT']['P']) // 3)
gltf = {"asset": {"version": "2.0", "generator": "ImmoReady Szene (eigener Code)"}, "scene": 0,
        "scenes": [{"name": "Wohnblock", "nodes": list(range(len(nodes)))}], "nodes": nodes, "meshes": meshes,
        "materials": MAT, "accessors": accs, "bufferViews": views, "buffers": [{"byteLength": len(buf)}]}
js = json.dumps(gltf, separators=(',', ':')).encode()
while len(js) % 4: js += b' '
while len(buf) % 4: buf.append(0)
glb = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(buf)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(buf), 0x004E4942) + bytes(buf)
open(out, 'wb').write(glb)
print(out, len(glb), 'Bytes,', len(nodes), 'Objekte:', ', '.join(n['name'] for n in nodes))
