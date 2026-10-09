"""RISE: Laden, Prüfen und Erzeugen aus rise.json (einzige Quelle für Tour-Konfiguration und Inhalte).

Aufruf:  python3 tools/rise.py            -> prüft rise.json (Schema + inhaltliche Regeln), Exit 1 bei Fehlern
Import:  from tools.rise import load, tour_config, tour_markup
"""
import html, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARR = '<svg class="arr" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h13M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>'


def load(path=None):
    path = path or os.path.join(ROOT, 'rise.json')
    with open(path, encoding='utf-8') as f:
        data = json.load(f)
    errors = validate(data)
    if errors:
        raise SystemExit('rise.json ist ungültig:\n  - ' + '\n  - '.join(errors))
    return data


def validate(d):
    """Schema-Prüfung (jsonschema) plus Regeln, die ein Schema nicht ausdrücken kann."""
    errors = []
    try:
        import jsonschema
        with open(os.path.join(ROOT, 'rise.schema.json'), encoding='utf-8') as f:
            schema = json.load(f)
        v = jsonschema.Draft202012Validator(schema)
        for e in sorted(v.iter_errors(d), key=lambda e: list(e.path)):
            errors.append('Schema: %s: %s' % ('/'.join(map(str, e.path)) or '(Wurzel)', e.message))
    except ImportError:
        errors.append('Python-Paket jsonschema fehlt (pip install jsonschema)')
    if errors:
        return errors
    t = d['tour']
    st = t['stations']
    if st[0]['range'][0] != 0 or st[-1]['range'][1] != 1:
        errors.append('Stationen müssen bei 0 beginnen und bei 1 enden')
    for a, b in zip(st, st[1:]):
        if abs(a['range'][1] - b['range'][0]) > 1e-9:
            errors.append('Lücke/Überlappung zwischen %s und %s' % (a['key'], b['key']))
    for s in st:
        lo, hi = s['range']
        if not lo < hi:
            errors.append('Station %s: Bereich nicht aufsteigend' % s['key'])
        if not (lo <= s['hold'] <= hi):
            errors.append('Station %s: hold %.3f liegt nicht im Bereich' % (s['key'], s['hold']))
    keys = [s['key'] for s in st]
    if len(set(keys)) != len(keys):
        errors.append('Stationsschlüssel doppelt')
    kf = t['keyframes']
    ps = [k['p'] for k in kf]
    if ps[0] != 0 or ps[-1] != 1 or any(b <= a for a, b in zip(ps, ps[1:])):
        errors.append('Keyframes müssen streng aufsteigend von 0 bis 1 laufen')
    for door in t['doors']:
        if not (door['open'][0] < door['open'][1] <= door['close'][0] < door['close'][1]):
            errors.append('Tür %s: Zeitfenster nicht geordnet (öffnen vor schliessen)' % door['id'])
    for h in t['highlights']:
        if not (h['in'][0] < h['in'][1] <= h['out'][0] < h['out'][1]):
            errors.append('Hervorhebung %s: Zeitfenster nicht geordnet' % h['id'])
    svc = {s['key'] for s in d['services']}
    for s in st:
        if not s['ctas'] and not s.get('choices'):
            errors.append('Station %s braucht mindestens eine Aktion (ctas oder choices)' % s['key'])
        for c in s['ctas']:
            if c.get('service') and c['service'] not in svc:
                errors.append('CTA "%s" verweist auf unbekannte Leistung %s' % (c['label'], c['service']))
            if 'goTo' in c and not (0 <= c['goTo'] < len(st)):
                errors.append('CTA "%s": goTo ausserhalb' % c['label'])
        for c in s.get('choices', []):
            if c['service'] not in svc:
                errors.append('Auswahl "%s" verweist auf unbekannte Leistung %s' % (c['label'], c['service']))
        prev = s['hold']
        for dt in s.get('details', []):
            if not (s['range'][0] <= dt['q'] < s['range'][1]):
                errors.append('Detail "%s" (Station %s): q liegt nicht im Stationsbereich' % (dt['key'], s['key']))
            if dt['q'] <= prev:
                errors.append('Details der Station %s: q muss nach dem Halt und aufsteigend sein' % s['key'])
            prev = dt['q']
        for h in s.get('hotspots', []):
            if h['service'] not in svc:
                errors.append('Leistungspunkt "%s" verweist auf unbekannte Leistung %s' % (h['label'], h['service']))
            if len(h.get('at', [])) != 3:
                errors.append('Leistungspunkt "%s" braucht at = [x, y, z]' % h['label'])
    if [x['id'] for x in t['doors']] != ['haustuer', 'wohnungstuer', 'terrassentuer']:
        errors.append('Türen müssen haustuer, wohnungstuer, terrassentuer sein (in dieser Reihenfolge)')
    for hl in t['highlights']:
        for lab in hl.get('labels', []):
            if not isinstance(lab, dict):
                errors.append('Hervorhebung %s: Beschriftung braucht name und at' % hl['id'])
    if not any(c.get('contact') for c in st[-1]['ctas']):
        errors.append('Letzte Station braucht eine Kontakt-Aktion')
    if not any(c.get('primary') and not c.get('service') for c in st[-1]['ctas']):
        errors.append('Letzte Station braucht eine allgemeine Offertanfrage ohne Leistung')
    if sorted(x['priority'] for x in d['services']) != list(range(1, len(d['services']) + 1)):
        errors.append('Leistungs-Prioritäten müssen 1..n lückenlos sein')
    if d['services'][0]['key'] != 'hauswartung':
        errors.append('Hauswartung muss die wichtigste Leistung bleiben (Priorität 1)')
    return errors


def tour_config(d):
    """Kompakte Laufzeit-Konfiguration für window.IR_RISE (nur, was der Code braucht)."""
    t = d['tour']
    return {
        'version': d['metadata']['release'].lstrip('V'),
        'eventsVersion': d['events']['version'],
        'stations': [{'k': s['key'], 'a': s['range'][0], 'b': s['range'][1], 'hold': s['hold'], 'nav': s['nav'], 'ps': s.get('portraitShift', [0, 0]), 'det': [d['q'] for d in s.get('details', [])]} for s in t['stations']],
        'keyframes': [[k['p'], k['pos'], k['lookAt'], k['fovRad']] for k in t['keyframes']],
        'doors': {x['id']: dict({'open': x['open'], 'close': x['close']}, **({'angle': x['angleRad']} if 'angleRad' in x else {'slide': x['slideM']})) for x in t['doors']},
        'highlights': {x['id']: {'in': x['in'], 'out': x['out']} for x in t['highlights']},
        'smoothing': t['smoothing'],
        'routeClearance': t['routeClearance'],
        'wind': {'idleMs': t['wind']['idleMs'], 'maxFps': t['wind']['maxFps']},
        'label': t['scene']['label'],
        'services': [s['key'] for s in d['services']],
        'allowedOrigins': d['wix']['allowedOrigins'],
    }


def _e(s):
    return html.escape(s, quote=True)


def _cta(c, inline_arrow, small):
    a = ARR if inline_arrow else '<i class="a"></i>'
    if 'goTo' in c:
        return '<a class="btn ghost" href="#reise" data-go="%d">%s %s</a>' % (c['goTo'], _e(c['label']), a)
    if c.get('contact'):
        return '<a class="btn ghost" href="#kontakt" data-contact>%s %s</a>' % (_e(c['label']), a)
    cls = 'btn' + ('' if c.get('primary') or not small else ' sm') + (' ghost' if c.get('ghost') else '')
    attrs = ' data-primary' if c.get('primary') else ''
    if c.get('service'):
        attrs += ' data-pre="%s"' % c['service']
    if c.get('mode'):
        attrs += ' data-mode="%s"' % c['mode']
    return '<a class="%s" href="#offerte"%s>%s %s</a>' % (cls, attrs, _e(c['label']), a)


def _title(t):
    """Zwei Sätze → zweiter Satz in heller Schrift (Stationen 2–5)."""
    parts = [p.strip() for p in t.split('. ') if p.strip()]
    if len(parts) < 2:
        return _e(t)
    first = parts[0] + '.'
    return '%s <span>%s</span>' % (_e(first), _e('. '.join(parts[1:])))


def _choices(s, inline_arrow):
    a = ARR if inline_arrow else '<i class="a"></i>'
    ch = s['choices']
    opts = ''.join('<button type="button" role="radio" aria-checked="%s" tabindex="%d" data-choice="%s" data-cta="%s"><span class="jr-rd" aria-hidden="true"></span><span>%s</span></button>'
                   % ('true' if i == 0 else 'false', 0 if i == 0 else -1, c['service'], _e(c['cta']), _e(c['label'])) for i, c in enumerate(ch))
    texts = ''.join('<p class="jr-choice-t" data-choice-text="%s"%s>%s</p>' % (c['service'], '' if i == 0 else ' hidden', _e(c['text'])) for i, c in enumerate(ch))
    return ('<div class="jr-choice"><div class="jr-choice-opts" role="radiogroup" aria-label="Leistung in der Wohnung wählen">%s</div>'
            '<div class="jr-choice-tx" aria-live="polite">%s</div>'
            '<div class="jr-acts"><a class="btn sm" href="#offerte" data-pre="%s" data-choice-cta><span class="jr-cl">%s</span> %s</a></div></div>'
            % (opts, texts, ch[0]['service'], _e(ch[0]['cta']), a))


def tour_markup(d, still_src, inline_arrow=False, page=True):
    """Erzeugt die komplette <section id="reise"> aus rise.json.
    still_src(i, station, portrait) -> URL bzw. data-URI des Stationsbildes (quer bzw. hoch).
    page=True: Links auf Seiten der Vorschau (Details, Überspringen); page=False: nur Rundgang (Komponente)."""
    t = d['tour']
    st = t['stations']
    a = ARR if inline_arrow else '<i class="a"></i>'
    routes = {s['key']: s.get('route', '#' + s['key']) for s in d['services']}
    hl = t['highlights'][0]
    out = ['<section class="jr" id="reise" aria-labelledby="h-hero" data-st="0">']
    if page:
        # Modus-Klasse sofort beim Parsen setzen (vor dem Hauptskript) – verhindert eine Layoutverschiebung beim Laden
        out.append('<script>(function(r){try{var s=matchMedia("(max-width:700px)").matches,m=matchMedia("(prefers-reduced-motion: reduce)").matches;'
                   'if(s||(m&&!window.IR_EMBED))r.classList.add("jr-static");else{r.classList.add("jr-live");if(window.IR_EMBED)r.classList.add("jr-button");}}catch(e){}})(document.currentScript.parentNode);</script>')
    out += ['<div class="jr-sticky">', '<div class="jr-stage">']
    for i, s in enumerate(st):
        out.append('<picture class="jr-pic"><source media="(max-width:700px)" srcset="%s"><img class="jr-still%s" src="%s" alt="Illustrative Visualisierung: %s – kein Referenzobjekt" width="1440" height="900" decoding="async"></picture>'
                   % (still_src(i, s, True), ' on' if i == 0 else '', still_src(i, s, False), _e(s['stillAlt'])))
    k = len(st)
    for s in st:
        for j, dt in enumerate(s.get('details', [])):
            out.append('<picture class="jr-pic"><source media="(max-width:700px)" srcset="%s"><img class="jr-still jr-still-det" data-det-still="%d" src="%s" alt="Illustrative Visualisierung: %s – kein Referenzobjekt" width="1440" height="900" decoding="async" loading="lazy"></picture>'
                       % (still_src(k, dt, True), k - len(st), still_src(k, dt, False), _e(dt['stillAlt'])))
            k += 1
    out.append('<canvas class="jr-canvas" aria-hidden="true"></canvas>')
    # V17: Beschriftung nur als Attribut (CSS attr()) – kein loser Text im Dokument, falls Stile fehlen oder Text extrahiert wird;
    # die Bildunterschrift «Schematische Kennzeichnung» setzt der Rundgang direkt unter die Markierungen.
    out.append('<div class="jr-tech" aria-hidden="true">' + ''.join('<span data-w="%s" data-l="%s"></span>' % (','.join('%g' % v for v in l['at']), _e(l['name'])) for l in hl.get('labels', []))
               + '<em class="jr-tech-c" data-l="%s"></em></div>' % _e(hl.get('caption', 'Schematisch')))
    # Leistungspunkte: echte Links zur Offertanfrage (gleiche Ereignisse wie die CTA); unsichtbar = nicht fokussierbar (visibility)
    for i, s in enumerate(st):
        for h in s.get('hotspots', []):
            out.append('<a class="jr-hot" href="#offerte" data-pre="%s" data-hot="%s" data-st="%d" aria-label="%s – Offerte anfragen">'
                       '<span class="jr-hot-d" aria-hidden="true"></span><span class="jr-hot-l">%s</span></a>'
                       % (h['service'], ','.join('%g' % v for v in h['at']), i, _e(h['label']), _e(h['label'])))
    out.append('<span class="jr-tag">%s</span></div>' % _e(t['scene']['label']))
    out.append('<div class="jr-ui wrap">')
    for i, s in enumerate(st):
        if i == 0:
            parts = [p.strip() for p in s['title'].split('. ') if p.strip()]
            l1 = parts[0] + ('.' if not parts[0].endswith('.') else '')
            l2 = ' '.join(parts[1:])
            out.append('<div class="jr-st jr-st0 hx-copy on" data-k="%s"><p class="mono hx-kicker">%s</p>' % (s['key'], _e(s['kicker'])))
            out.append('<h1 id="h-hero" class="hx-title"><span class="ln"><span style="--d:.1s">%s</span></span><span class="ln"><span style="--d:.2s"><b>%s</b></span></span></h1>' % (_e(l1), _e(l2)))
            out.append('<p class="hx-sub">%s</p>' % _e(s['text']))
            out.append('<div class="hx-ctas hx-in">%s</div></div>' % ''.join(_cta(c, inline_arrow, False) for c in s['ctas']))
        elif i == len(st) - 1:
            words = [w.strip() for w in s['title'].split('. ') if w.strip()]
            head = '. '.join(words[:-1]) + '.'
            last = words[-1] if words[-1].endswith('.') else words[-1] + '.'
            out.append('<div class="jr-st jr-st5" data-k="%s"><p class="jr-k mono">%s</p>' % (s['key'], _e(s['kicker'])))
            out.append('<h2 class="jr-big">%s <b>%s</b></h2><p class="jr-q">%s</p>' % (_e(head), _e(last), _e(s['text'])))
            out.append('<div class="jr-acts">%s</div></div>' % ''.join(_cta(c, inline_arrow, False) for c in s['ctas']))
        else:
            out.append('<div class="jr-st" data-k="%s"><p class="jr-k mono">%s</p><h2 class="jr-t">%s</h2><p class="jr-d">%s</p>' % (s['key'], _e(s['kicker']), _title(s['title']), _e(s['text'])))
            if s.get('choices'):
                out.append(_choices(s, inline_arrow) + '</div>')
                continue
            if s.get('details'):
                dk = sum(len(x.get('details', [])) for x in st[:i])
                btns = '<button type="button" class="jr-detb" data-det="%g" data-det-i="-1" aria-pressed="true">Übersicht</button>' % s['hold']
                btns += ''.join('<button type="button" class="jr-detb" data-det="%g" data-det-i="%d" aria-pressed="false">%s</button>' % (dt['q'], dk + j, _e(dt['label'])) for j, dt in enumerate(s['details']))
                out.append('<div class="jr-det" role="group" aria-label="Ansicht wählen">%s</div>' % btns)
            acts = ''.join(_cta(c, inline_arrow, True) for c in s['ctas'])
            if page:
                svc = next((c['service'] for c in s['ctas'] if c.get('service')), None)
                if svc:
                    acts += '<a class="tlink light" href="%s">Details %s</a>' % (routes[svc], a)
            out.append('<div class="jr-acts">%s</div></div>' % acts)
    nav = ''.join('<li><button type="button" data-go="%d"%s><span class="jr-dot" aria-hidden="true"></span><span class="jr-l">%s</span></button></li>'
                  % (i, ' class="on" aria-current="step"' if i == 0 else '', _e(s['nav'])) for i, s in enumerate(st))
    out.append('<nav class="jr-nav" aria-label="Stationen des Rundgangs"><ol>%s</ol><div class="jr-bar" aria-hidden="true"><i></i></div></nav>' % nav)
    if page:
        out.append('<div class="jr-skip"><a href="#leistungswelt" class="jr-skip-a">Tour überspringen %s</a><a href="#offerte" class="jr-skip-o">Offerte anfragen</a></div>' % a)
    else:
        out.append('<div class="jr-skip"><button type="button" class="jr-skip-a" data-skip>Tour überspringen %s</button><a href="#offerte" class="jr-skip-o">Offerte anfragen</a></div>' % a)
    out.append('<div class="jr-steps" role="group" aria-label="Rundgang steuern"><button type="button" class="jr-stepb" data-step="-1" aria-label="Vorherige Station">← Zurück</button><button type="button" class="jr-stepb" data-step="1" aria-label="Nächste Station">Weiter →</button></div>')
    out.append('</div></div></section>')
    if page:
        # V17: Smartphone-Anordnung (Bild → Stationsleiste → Text) schon vor dem Laden des Rundgang-Skripts – keine
        # Layoutverschiebung, wenn der Kern später den Bildmodus setzt (≤ 700 px ist immer Bildmodus)
        out.append("<script>(function(){var r=document.getElementById('reise');if(r&&window.matchMedia&&matchMedia('(max-width:700px)').matches)r.classList.add('jr-static');})();</script>")
    return '\n'.join(out)


if __name__ == '__main__':
    with open(os.path.join(ROOT, 'rise.json'), encoding='utf-8') as f:
        data = json.load(f)
    errs = validate(data)
    if errs:
        print('rise.json: %d Fehler' % len(errs))
        for e in errs:
            print('  -', e)
        sys.exit(1)
    print('rise.json gültig: %d Stationen, %d Keyframes, %d Türen, %d Leistungen' % (
        len(data['tour']['stations']), len(data['tour']['keyframes']), len(data['tour']['doors']), len(data['services'])))
