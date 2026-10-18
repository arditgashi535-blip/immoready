"""RISE: Laden, Prüfen und Erzeugen aus rise.json (einzige Quelle für Tour-Konfiguration und Inhalte).

Aufruf:  python3 tools/rise.py            -> prüft rise.json (Schema + inhaltliche Regeln), Exit 1 bei Fehlern
         python3 tools/rise.py --launch   -> zusätzlich: offene Punkte vor der Veröffentlichung (GmbH, Recht, Formular, Freigabe)
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
    errors += _company_rules(d)
    errors += _photo_career_rules(d)
    errors += _demo_rules(t)
    return errors


def _demo_rules(t):
    """Realismus-Auftrag: Reinigungszonen und Demo-Rundlauf (lückenloser Zeitplan, Naht an beiden Enden, Reinigung nur im Halt)."""
    errors = []
    keys = [s['key'] for s in t['stations']]
    zones = (t.get('cleaning') or {}).get('zones', [])
    if len(zones) > 6:
        errors.append('Reinigung: höchstens 6 Zonen (Shader-Grenze)')
    for z in zones:
        if z.get('st') not in keys:
            errors.append('Reinigungszone %s: unbekannte Station' % z.get('id'))
        if z.get('type') not in ('kalk', 'wasser', 'staub', 'laub', 'schlieren'):
            errors.append('Reinigungszone %s: Art muss kalk|wasser|staub|laub|schlieren sein' % z.get('id'))
        lo, hi = z.get('box', [[0, 0, 0], [0, 0, 0]])
        if not all(a < b for a, b in zip(lo, hi)):
            errors.append('Reinigungszone %s: Box nicht aufsteigend' % z.get('id'))
        if not (0 <= z['p'][0] < z['p'][1] <= 1):
            errors.append('Reinigungszone %s: Fortschrittsbereich ungültig' % z.get('id'))
        if any(len(w) != 4 for w in z.get('walk', [])) or len(z.get('walk', [])) > 2:
            errors.append('Reinigungszone %s: walk = höchstens 2 Laufwege [x0, z0, x1, z1]' % z.get('id'))
        if 'entry' in z and len(z['entry']) != 2:
            errors.append('Reinigungszone %s: entry = [x, z]' % z.get('id'))
    if t.get('light', 'tag') not in ('tag', 'nacht'):
        errors.append('tour.light muss tag oder nacht sein')
    dm = t.get('demo')
    if not dm:
        return errors
    T, sg = dm['duration'], dm['segments']
    if not 30 <= T <= 90:
        errors.append('Demo: Dauer %s s ausserhalb 30–90 s' % T)
    if sg[0]['t'][0] != 0 or abs(sg[-1]['t'][1] - T) > 1e-9:
        errors.append('Demo: Zeitplan muss bei 0 beginnen und bei der Dauer enden')
    for a, b in zip(sg, sg[1:]):
        if abs(a['t'][1] - b['t'][0]) > 1e-9:
            errors.append('Demo: Lücke/Überlappung bei %s s' % a['t'][1])
    if sg[0].get('seam') != 'out' or sg[-1].get('seam') != 'in' or any(s.get('seam') for s in sg[1:-1]):
        errors.append('Demo: Naht nur am Anfang (out) und am Ende (in)')
    mid = sg[1:-1]
    if mid and (mid[0]['p'][0] != 0 or not 0.85 <= mid[-1]['p'][1] <= 1):
        errors.append('Demo: Fahrt muss bei p 0 beginnen (Anschluss an die Naht «out») und nach der Terrasse enden (p 0,85–1, Anschluss «in»)')
    for a, b in zip(mid, mid[1:]):
        if abs(a['p'][1] - b['p'][0]) > 1e-9:
            errors.append('Demo: Fortschritt springt bei %s s' % a['t'][1])
    zst = {z['st'] for z in zones}
    for k, w in (dm.get('clean') or {}).items():
        if k not in zst:
            errors.append('Demo: Reinigung für %s ohne Zone' % k)
        if not sg[0]['t'][1] <= w[0] < w[1] <= sg[-1]['t'][0]:
            errors.append('Demo: Reinigungsfenster %s muss zwischen den Nahtabschnitten liegen (Rücksprung nur verdeckt)' % k)
    return errors


def _photo_career_rules(d):
    e = []
    for sl in d['assets'].get('photos', {}).get('slots', []):
        st = sl['status']
        if st not in ('ki-symbolbild', 'eigen', 'stock', 'fehlt'):
            e.append('Foto %s: unbekannter Status %s' % (sl['id'], st))
        if st == 'stock':
            miss = [k for k in ('file', 'source', 'sourceId', 'license', 'credit') if UNSPEC(sl.get(k, '[UNSPECIFIED]'))]
            if miss:
                e.append('Fremdbild %s: Nachweis fehlt (%s)' % (sl['id'], ', '.join(miss)))
        if st == 'eigen' and UNSPEC(sl.get('file', '[UNSPECIFIED]')):
            e.append('Eigenes Foto %s: Datei fehlt' % sl['id'])
        if sl['id'] == 'portraet' and st not in ('eigen', 'fehlt'):
            e.append('Porträt nur als eigenes Foto (kein Stock- oder KI-Bild)')
    for v in d['assets'].get('videos', {}).get('slots', []):
        st = v['status']
        if st not in ('fehlt', 'stock', 'eigen'):
            e.append('Video %s: unbekannter Status %s (KI-Videos sind nicht vorgesehen)' % (v['id'], st))
        if st == 'stock':
            miss = [k for k in ('file', 'source', 'sourceId', 'license', 'credit') if UNSPEC(v.get(k, '[UNSPECIFIED]'))]
            if miss:
                e.append('Fremdvideo %s: Nachweis fehlt (%s)' % (v['id'], ', '.join(miss)))
        if st in ('stock', 'eigen') and UNSPEC(v.get('file', '[UNSPECIFIED]')):
            e.append('Video %s: Datei fehlt' % v['id'])
        if v.get('service') and v['service'] not in [x['key'] for x in d['services']]:
            e.append('Video %s: unbekannte Leistung %s' % (v['id'], v['service']))
        if not (0 < int(v.get('station', 0)) < len(d['tour']['stations'])):
            e.append('Video %s: Station ausserhalb des Rundgangs' % v['id'])
    c = d.get('careers', {})
    if c.get('vacancies'):
        e.append('Keine Stellen ohne Bestätigung des Inhabers eintragen (careers.vacancies)')
    if c.get('upload'):
        e.append('Kein Lebenslauf-Upload ohne sichere Speicherung und Zugriffsschutz (careers.upload)')
    if any('WSF' in q or 'Facility Services' in q for q in d['firm']['qualifications']):
        e.append('WSF-Qualifikation nicht mehr aufführen')
    return e


UNSPEC = lambda v: isinstance(v, str) and v.startswith('[UNSPECIFIED')
COMPANY_FIELDS = [('registeredName', 'Eingetragener Firmenname'), ('seat', 'Sitz'), ('address', 'Geschäftsadresse'),
                  ('uid', 'UID (CHE-…)'), ('commercialRegister', 'Handelsregister (Kanton, Eintrag)'),
                  ('representation', 'Zeichnungsberechtigte Person(en) und Funktion'), ('vat', 'MWST-Nummer oder «nicht MWST-pflichtig»')]


def _company_rules(d):
    """GmbH in Gründung: Die Seite darf die GmbH nicht als bestehend darstellen; nichts erfinden."""
    e, c = [], d['firm']['company']
    if c['status'] == 'in_gruendung':
        if c['foundingConfirmed'] or c['goLiveApproved']:
            e.append('GmbH in Gründung: foundingConfirmed und goLiveApproved müssen false bleiben, bis die Eintragung bestätigt ist')
        public = json.dumps([d['tour'], d['services'], d['pages']], ensure_ascii=False)
        if 'GmbH' in public:
            e.append('GmbH in Gründung: «GmbH» darf in öffentlichen Texten (Rundgang, Leistungen, Seiten) noch nicht vorkommen')
    else:
        if not c['foundingConfirmed']:
            e.append('Status «eingetragen» nur mit foundingConfirmed = true (Gründung vom Inhaber bestätigt)')
        miss = [n for k, n in COMPANY_FIELDS if UNSPEC(c[k])]
        if miss:
            e.append('Status «eingetragen», aber offen: ' + ', '.join(miss))
    if c['goLiveApproved'] and c['status'] != 'eingetragen':
        e.append('Livegang-Freigabe ohne eingetragene GmbH ist nicht zulässig')
    if not UNSPEC(c['registeredName']) and 'GmbH' not in c['registeredName']:
        e.append('Firmenname einer GmbH muss die Rechtsform enthalten (z. B. «… GmbH»)')
    return e


def launch_check(d):
    """Offene Punkte vor der Veröffentlichung (python3 tools/rise.py --launch). Leere Liste = bereit."""
    c, o = d['firm']['company'], []
    if c['status'] != 'eingetragen' or not c['foundingConfirmed']:
        o.append('Gründung der GmbH nicht bestätigt (firm.company.status / foundingConfirmed)')
    o += ['Unternehmensangabe fehlt: ' + n for k, n in COMPANY_FIELDS if UNSPEC(c[k])]
    for k, n in (('imprint', 'Impressum: endgültiger Text'), ('privacy', 'Datenschutzerklärung: endgültiger Text'), ('hosting', 'Hosting/Auftragsbearbeiter')):
        if UNSPEC(d['legal'].get(k, '[UNSPECIFIED]')):
            o.append(n + ' (legal.%s)' % k)
    if UNSPEC(d['wix'].get('formEndpoint', '[UNSPECIFIED]')):
        o.append('Formular nicht angeschlossen (wix.formEndpoint) – Demo-Modus')
    if c['status'] != 'eingetragen' or d['firm']['role'] == 'Inhaber':
        o.append('Funktion von %s in der GmbH bestätigen und als Bezeichnung auf der Website setzen (firm.role, heute «%s»)' % (d['firm']['contactPerson'], d['firm']['role']))
    for sl in d['assets'].get('photos', {}).get('slots', []):
        if sl['status'] in ('ki-symbolbild', 'fehlt'):
            o.append('Foto «%s»: %s (assets.photos)' % (sl['id'], 'KI-Übergangsbild durch eigenes oder lizenziertes Foto ersetzen' if sl['status'] == 'ki-symbolbild' else 'eigenes Foto fehlt'))
    if not c['goLiveApproved']:
        o.append('Livegang nicht ausdrücklich freigegeben (firm.company.goLiveApproved)')
    return o


def _miss(t):
    return '<span class="missing">%s</span>' % _e(t)


def photo_credits(d):
    """Bildnachweis im Impressum aus rise.json → assets.photos (Fremdbilder mit Quelle, Urheber und Nutzungsgrundlage)."""
    slots = d['assets'].get('photos', {}).get('slots', [])
    stock = [x for x in slots if x['status'] == 'stock']
    own = any(x['status'] == 'eigen' for x in slots)
    ki = [x for x in slots if x['status'] == 'ki-symbolbild']
    parts = ['Logo: ImmoReady.']
    if own:
        parts.append('Eigene Fotos: ImmoReady.')
    for x in stock:
        parts.append('%s: %s, %s (%s).' % (_e(x['motive'].split(' (')[0]), _e(x['credit']), _e(x['source']), _e(x['license'])))
    if ki:
        parts.append('Symbolbilder: mit Canva erstellt (KI-generiert) – sie zeigen keine realen Objekte, Kundenliegenschaften oder Mitarbeitenden.')
    for v in video_slots(d):
        if v['status'] == 'stock':
            parts.append('Symbolvideo %s: %s, %s (%s).' % (_e(v['title']), _e(v['credit']), _e(v['source']), _e(v['license'])))
    parts.append('3D-Rundgang: illustrative Visualisierung, eigene Erstellung, kein Referenzobjekt.')
    h = '<p>%s</p>' % ' '.join(parts)
    if ki:
        h += ('<p class="review-only placeholder-box" style="margin-top:16px">Offen: %d Bildflächen zeigen noch KI-Übergangsbilder (%s). '
              'Ersetzen durch eigene oder nachweislich lizenzierte Fotos (rise.json → assets.photos); Nutzungsbedingungen der Canva-Bilder prüfen, solange sie verwendet werden.</p>') % (
            len(ki), ', '.join(x['id'] for x in ki))
    return h


def video_slots(d, exists=None):
    """Videoflächen mit vorhandener Datei (status stock/eigen). exists: Prüffunktion für den Dateipfad (Build)."""
    import os
    ex = exists or os.path.exists
    return [v for v in d['assets'].get('videos', {}).get('slots', [])
            if v['status'] in ('stock', 'eigen') and not UNSPEC(v.get('file', '[UNSPECIFIED]')) and ex(v['file'])]


def videos_markup(d):
    """Abschnitt «Im Alltag» direkt vor dem Rundgang: kurze Clips je Station (stumm, Endlosschleife, mit Pause),
    «Im Rundgang ansehen» springt zur Station, «… anfragen» mit Leistungsschlüssel. Ohne Datei: nur Prüfhinweis.
    Platzhalter im Markup: {{VSRC:id}} und {{VPOSTER:id}} (vom Build ersetzt)."""
    slots = d['assets'].get('videos', {}).get('slots', [])
    real = video_slots(d)
    st = d['tour']['stations']
    lab = {x['key']: x['label'] for x in d['services']}
    if not real:
        rows = ''.join('<li><b>%s</b> (Station %d · %s): %s</li>' % (_e(v['id']), v['station'] + 1, _e(st[v['station']]['nav']), _e(v['motive'])) for v in slots)
        return ('<section class="sec review-only vclips-open" aria-label="Offene Videoflächen"><div class="wrap"><div class="placeholder-box">'
                '<p class="mono">Prüfhinweis · nicht öffentlich</p><p><b>Videos zum Rundgang vorbereitet, noch keine Datei.</b> '
                'Stockvideos konnten in dieser Arbeitsumgebung nicht geladen werden (Videoquellen gesperrt). '
                'Datei unter <code>assets/videos/&lt;id&gt;.mp4</code> ablegen und Quelle, ID, Lizenz und Bildnachweis in '
                '<code>rise.json → assets.videos</code> eintragen. Motive:</p><ul>%s</ul></div></div></section>') % rows
    cards = []
    for v in real:
        tag = 'Symbolvideo' if v['status'] == 'stock' else 'Eigenes Video'
        cred = ('<span class="vclip-cred">%s · %s</span>' % (_e(v['credit']), _e(v['source']))) if v['status'] == 'stock' else ''
        poster = ' poster="{{VPOSTER:%s}}"' % v['id'] if not UNSPEC(v.get('poster', '[UNSPECIFIED]')) else ''
        cards.append(
            '<figure class="vclip reveal" data-vid="%s">'
            '<div class="vclip-media"><video muted loop playsinline preload="none"%s data-src="{{VSRC:%s}}" aria-label="%s"></video>'
            '<span class="ph-tag">%s</span>'
            '<button type="button" class="vclip-play" aria-pressed="false" aria-label="Video abspielen"><span aria-hidden="true"></span></button></div>'
            '<figcaption><p class="mono">Station %d · %s</p><h3>%s</h3>%s'
            '<div class="vclip-acts"><a class="btn sm ghost" href="#reise" data-jr-go="%d">Im Rundgang ansehen</a>'
            '<a class="btn sm" href="#offerte" data-pre="%s">%s anfragen</a></div></figcaption></figure>' % (
                _e(v['id']), poster, _e(v['id']), _e(v['alt']), tag, v['station'] + 1, _e(st[v['station']]['nav']), _e(v['title']), cred,
                v['station'], _e(v['service']), _e(lab.get(v['service'], v['title']).split(' (')[0])))
    return ('<section class="sec dark vclips" id="einblicke" aria-labelledby="h-vclips"><div class="wrap">'
            '<p class="num reveal"><span>Im Alltag</span>Kurze Einblicke zu den Stationen des Rundgangs</p>'
            '<h2 class="display reveal" id="h-vclips">Was an den Stationen <b>anfällt.</b></h2>'
            '<p class="lead reveal">%s</p>'
            '<div class="vclips-grid">%s</div></div></section>') % (
        'Symbolvideos zeigen typische Arbeiten. Sie stammen nicht aus unseren Aufträgen und zeigen keine Mitarbeitenden von ImmoReady.'
        if any(v['status'] == 'stock' for v in real) else 'Kurze Einblicke in typische Arbeiten an den Stationen des Rundgangs.', ''.join(cards))


def careers_markup(d):
    """Karrierebereich: Initiativbewerbung per E-Mail (kein Formular, kein Upload, keine erfundenen Stellen)."""
    import urllib.parse
    c = d['careers']
    href = 'mailto:%s?subject=%s' % (c['email'], urllib.parse.quote(c['subject']))
    return ('<section class="sec career" id="karriere" aria-labelledby="h-career">'
            '<div class="wrap career-grid">'
            '<figure class="career-media mask"><div class="mask-in"><div class="illu" data-illu="career"></div></div></figure>'
            '<div class="career-copy"><p class="num reveal"><span>06</span>%s</p>'
            '<h2 class="display reveal" id="h-career">%s</h2>'
            '<p class="lead reveal">%s</p>'
            '<div class="row-ctas reveal"><a class="btn sand" href="%s" data-career>%s <i class="a" aria-hidden="true"></i></a></div>'
            '<p class="fine reveal" id="career-hint">Der Knopf öffnet Ihr E-Mail-Programm mit dem Betreff «%s». '
            'Sie erreichen uns auch direkt unter <a href="%s">%s</a>. Lebenslauf und Zeugnisse können Sie als Anhang mitsenden.</p>'
            '</div></div></section>') % (_e(c['kicker']), _e(c['headline']), _e(c['text']), href, _e(c['cta']), _e(c['subject']),
                                         href, _e(c['email']).replace('@', '<wbr>@'))


def firm_markup(d):
    """Unternehmensangaben für Impressum, Datenschutz, Kontakt und Footer – überall aus derselben Quelle.
    In Gründung: öffentlich nur die Marke ohne Rechtsform; der GmbH-Entwurf erscheint nur mit «Prüfhinweise anzeigen»."""
    f, c, k = d['firm'], d['firm']['company'], d['contact']
    tel, mail = k['phone'].replace(' ', ''), k['email']
    reach = '<p>Telefon: <a href="tel:%s">%s</a><br>E-Mail: <a href="mailto:%s">%s</a></p>' % (tel, _e(k['phone']), mail, _e(mail).replace('@', '<wbr>@'))
    val = lambda key, label: _miss(label + ' – offen') if UNSPEC(c[key]) else _e(c[key])
    addr = lambda: _miss('Geschäftsadresse – offen') if UNSPEC(c['address']) else '<br>'.join(_e(x.strip()) for x in c['address'].split(','))
    if c['status'] == 'eingetragen':
        name = _e(c['registeredName'])
        imprint = ('<h2>Verantwortlich für den Inhalt</h2><p>%s<br>%s<br>Schweiz</p>%s<h2>Unternehmensangaben</h2>'
                   '<p>Rechtsform: Gesellschaft mit beschränkter Haftung (GmbH)<br>Sitz: %s<br>Handelsregister: %s<br>UID: %s<br>'
                   'Vertretungsberechtigt: %s<br>MWST: %s</p>') % (name, addr(), reach, val('seat', 'Sitz'), val('commercialRegister', 'Handelsregister'),
                                                                 val('uid', 'UID'), val('representation', 'Vertretung'), val('vat', 'MWST'))
        resp = '%s, %s, Schweiz' % (name, addr().replace('<br>', ', '))
        foot = name
    else:
        rows = ''.join('<div><dt>%s</dt><dd>%s</dd></div>' % (_e(n), _miss('offen') if UNSPEC(c[key]) else _e(c[key])) for key, n in COMPANY_FIELDS)
        imprint = ('<h2>Verantwortlich für den Inhalt</h2><p>%s<br>%s: %s<br>%s<br>Schweiz</p>%s'
                   '<h2>Unternehmensangaben</h2><p>%s</p>'
                   '<div class="review-only placeholder-box co-draft" data-company="in_gruendung" style="margin:24px 0">'
                   '<p><b>Intern · Entwurf für den späteren Auftritt als GmbH – nicht öffentlich</b></p>'
                   '<p>Status: GmbH in Gründung. Die Website nennt öffentlich noch keine Rechtsform. Vor der Veröffentlichung müssen die '
                   'folgenden Angaben bestätigt und in <code>rise.json → firm.company</code> eingetragen sein; Impressum, Datenschutz, '
                   'Kontakt und Footer übernehmen sie automatisch.</p>'
                   '<dl class="co-list"><div><dt>Rechtsform (geplant)</dt><dd>Gesellschaft mit beschränkter Haftung (GmbH)</dd></div>%s</dl>'
                   '<p class="muted">Prüfung vor dem Livegang: <code>python3 tools/rise.py --launch</code></p></div>') % (
            _e(f['brand']), _e(f['role']), _e(f['contactPerson']), addr(), reach,
            _miss('Unternehmensangaben werden vor der Veröffentlichung ergänzt'), rows)
        resp = '%s, %s, %s, Schweiz' % (_e(f['brand']), _e(f['contactPerson']), addr().replace('<br>', ', '))
        foot = '%s · %s' % (_e(f['brand']), _e(f['contactPerson']))
    privacy = '<p>%s · <a href="mailto:%s">%s</a> · %s</p>' % (resp, mail, _e(mail).replace('@', '<wbr>@'), _e(k['phone']))
    address_note = '' if not UNSPEC(c['address']) else '<p class="review-only" style="margin-top:16px">%s</p>' % _miss('Geschäftsadresse: nach Bestätigung ergänzen')
    return {'imprint': imprint, 'privacy': privacy, 'footer': foot, 'address_note': address_note}


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
        'light': t.get('light', 'tag'),
        'demo': t.get('demo'),
        'cleaning': {'zones': [{k: z[k] for k in ('id', 'st', 'type', 'label', 'box', 'dir', 'edge', 'mat', 'strength', 'seed', 'p', 'walk', 'entry', 'range') if k in z} for z in t.get('cleaning', {}).get('zones', [])]},
        'routeClearance': t['routeClearance'],
        'wind': {'idleMs': t['wind']['idleMs'], 'maxFps': t['wind']['maxFps']},
        'label': t['scene']['label'],
        'services': [s['key'] for s in d['services']],
        'allowedOrigins': d['wix']['allowedOrigins'],
        'formEndpoint': None if d['wix'].get('formEndpoint', '[UNSPECIFIED]') == '[UNSPECIFIED]' else d['wix']['formEndpoint'],
    }


def _e(s):
    return html.escape(s, quote=True)


def _cta(c, inline_arrow, small):
    a = ARR if inline_arrow else '<i class="a" aria-hidden="true"></i>'
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


def _cmp(s, t):
    """Vergleich «Vorher / Nachher» und Regler «Reinigungsfortschritt» (Tastatur und Touch, kein Autoplay)."""
    lab = ', '.join(z['label'] for z in t['cleaning']['zones'] if z['st'] == s['key'])
    return ('<div class="jr-cmp" role="group" aria-label="Reinigung vergleichen: %s">'
            '<button type="button" class="jr-cmpb" data-cmp="0" aria-pressed="false">Vorher</button>'
            '<button type="button" class="jr-cmpb" data-cmp="1" aria-pressed="false">Nachher</button>'
            '<label class="jr-cmpr"><span>Reinigungsfortschritt</span><input type="range" min="0" max="100" step="5" value="100" data-cmpr></label>'
            '<p class="jr-cmpn">Illustration eines Arbeitsablaufs, kein Kundenergebnis.</p></div>') % _e(lab)


def _title(t):
    """Zwei Sätze → zweiter Satz in heller Schrift (Stationen 2–5)."""
    parts = [p.strip() for p in t.split('. ') if p.strip()]
    if len(parts) < 2:
        return _e(t)
    first = parts[0] + '.'
    return '%s <span>%s</span>' % (_e(first), _e('. '.join(parts[1:])))


def _choices(s, inline_arrow):
    a = ARR if inline_arrow else '<i class="a" aria-hidden="true"></i>'
    ch = s['choices']
    opts = ''.join('<button type="button" role="radio" aria-checked="%s" tabindex="%d" data-choice="%s" data-cta="%s"><span class="jr-rd" aria-hidden="true"></span><span>%s</span></button>'
                   % ('true' if i == 0 else 'false', 0 if i == 0 else -1, c['service'], _e(c['cta']), _e(c['label'])) for i, c in enumerate(ch))
    texts = ''.join('<p class="jr-choice-t" data-choice-text="%s"%s>%s</p>' % (c['service'], '' if i == 0 else ' hidden', _e(c['text'])) for i, c in enumerate(ch))
    return ('<div class="jr-choice"><div class="jr-choice-opts" role="radiogroup" aria-label="Leistung in der Wohnung wählen">%s</div>'
            '<div class="jr-choice-tx" aria-live="polite">%s</div>'
            '<div class="jr-acts"><a class="btn sm" href="#offerte" data-pre="%s" data-choice-cta><span class="jr-cl">%s</span> %s</a></div></div>'
            % (opts, texts, ch[0]['service'], _e(ch[0]['cta']), a))


def tour_markup(d, still_src, inline_arrow=False, page=True, vorher_src=None):
    """Erzeugt die komplette <section id="reise"> aus rise.json.
    still_src(i, station, portrait) -> URL bzw. data-URI des Stationsbildes (quer bzw. hoch).
    page=True: Links auf Seiten der Vorschau (Details, Überspringen); page=False: nur Rundgang (Komponente)."""
    t = d['tour']
    st = t['stations']
    a = ARR if inline_arrow else '<i class="a" aria-hidden="true"></i>'
    routes = {s['key']: s.get('route', '#' + s['key']) for s in d['services']}
    hl = t['highlights'][0]
    clean_st = {z['st'] for z in t.get('cleaning', {}).get('zones', [])}
    out = ['<section class="jr" id="reise" aria-labelledby="h-hero" data-st="0">']
    if page:
        # Modus-Klasse sofort beim Parsen setzen (vor dem Hauptskript) – verhindert eine Layoutverschiebung beim Laden
        out.append('<script>(function(r){try{var s=matchMedia("(max-width:700px)").matches,m=matchMedia("(prefers-reduced-motion: reduce)").matches;'
                   'if(s||(m&&!window.IR_EMBED))r.classList.add("jr-static");else{r.classList.add("jr-live");if(window.IR_EMBED)r.classList.add("jr-button");}}catch(e){}})(document.currentScript.parentNode);</script>')
    out += ['<div class="jr-sticky">', '<div class="jr-stage">']
    for i, s in enumerate(st):
        out.append('<picture class="jr-pic"><source media="(max-width:700px)" srcset="%s"><img class="jr-still%s" data-n="%s" src="%s" alt="Illustrative Visualisierung: %s – kein Referenzobjekt" width="1440" height="900" decoding="async"></picture>'
                   % (still_src(i, s, True), ' on' if i == 0 else '', _e(s['still']), still_src(i, s, False), _e(s['stillAlt'])))
    k = len(st)
    for s in st:
        for j, dt in enumerate(s.get('details', [])):
            out.append('<picture class="jr-pic"><source media="(max-width:700px)" srcset="%s"><img class="jr-still jr-still-det" data-det-still="%d" data-n="%s" src="%s" alt="Illustrative Visualisierung: %s – kein Referenzobjekt" width="1440" height="900" decoding="async" loading="lazy"></picture>'
                       % (still_src(k, dt, True), k - len(st), _e(dt['still']), still_src(k, dt, False), _e(dt['stillAlt'])))
            k += 1
    # Realismus-Auftrag: Bilder «Vorher» derselben Kamera (nur Bildmodus; im 3D steuert der Vergleich die Schmutzschicht)
    if vorher_src:
        for s in st:
            if s['key'] not in clean_st:
                continue
            for n, alt in [(s['still'], s['stillAlt'])] + [(dt['still'], dt['stillAlt']) for dt in s.get('details', [])]:
                l, pt = vorher_src(n, False), vorher_src(n, True)
                if l:
                    out.append('<picture class="jr-pic"><source media="(max-width:700px)" srcset="%s"><img class="jr-still jr-still-v" data-v="%s" src="%s" alt="Illustrative Visualisierung: %s, Zustand vorher – kein Referenzobjekt" width="1440" height="900" decoding="async" loading="lazy"></picture>'
                               % (pt or l, _e(n), l, _e(alt)))
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
            # Rundgang ist ein optionaler Abschnitt der Seite (Abschnitt 6) – die Seitenüberschrift h1 steht im Foto-Einstieg
            l2h = '<span class="ln"><span style="--d:.2s"><b>%s</b></span></span>' % _e(l2) if l2 else ''
            out.append('<h2 id="h-hero" class="hx-title"><span class="ln"><span style="--d:.1s">%s</span></span>%s</h2>' % (_e(l1), l2h))
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
            if s['key'] in clean_st:
                out.append(_cmp(s, t))
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
        out.append('<p class="jr-3d-note" role="status" hidden></p>')
        out.append('<div class="jr-skip"><div class="jr-demo" role="group" aria-label="Demo-Rundlauf"><button type="button" class="jr-db" data-demo="toggle" aria-pressed="false"><span>Demo-Rundlauf starten</span></button><button type="button" class="jr-db" data-demo="stop" hidden>Beenden</button></div><div class="jr-light" role="group" aria-label="Licht der Visualisierung"><button type="button" class="jr-lb" data-light="tag" aria-pressed="true">Tageslicht</button><button type="button" class="jr-lb" data-light="nacht" aria-pressed="false">Dämmerung</button></div><button type="button" class="jr-3d-btn" data-3d hidden aria-pressed="false"><span>3D-Ansicht starten</span></button><a href="#ablauf" class="jr-skip-a">Tour überspringen %s</a><a href="#offerte" class="jr-skip-o">Offerte anfragen</a></div>' % a)
    else:
        out.append('<p class="jr-3d-note" role="status" hidden></p>')
        out.append('<div class="jr-skip"><div class="jr-demo" role="group" aria-label="Demo-Rundlauf"><button type="button" class="jr-db" data-demo="toggle" aria-pressed="false"><span>Demo-Rundlauf starten</span></button><button type="button" class="jr-db" data-demo="stop" hidden>Beenden</button></div><div class="jr-light" role="group" aria-label="Licht der Visualisierung"><button type="button" class="jr-lb" data-light="tag" aria-pressed="true">Tageslicht</button><button type="button" class="jr-lb" data-light="nacht" aria-pressed="false">Dämmerung</button></div><button type="button" class="jr-3d-btn" data-3d hidden aria-pressed="false"><span>3D-Ansicht starten</span></button><button type="button" class="jr-skip-a" data-skip>Tour überspringen %s</button><a href="#offerte" class="jr-skip-o">Offerte anfragen</a></div>' % a)
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
    if '--launch' in sys.argv:
        open_points = launch_check(data)
        if open_points:
            print('Nicht bereit für die Veröffentlichung – %d offene Punkte:' % len(open_points))
            for o in open_points:
                print('  -', o)
            sys.exit(1)
        print('Bereit für die Veröffentlichung (alle Unternehmensangaben bestätigt, Livegang freigegeben).')
        sys.exit(0)
    print('rise.json gültig: %d Stationen, %d Keyframes, %d Türen, %d Leistungen' % (
        len(data['tour']['stations']), len(data['tour']['keyframes']), len(data['tour']['doors']), len(data['services'])))
