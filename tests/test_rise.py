"""Prüft rise.json und die Regeln in tools/rise.py (positive und negative Fälle).
Aufruf: python3 tests/test_rise.py"""
import copy, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
from tools.rise import validate, tour_config  # noqa: E402

base = json.load(open(os.path.join(ROOT, 'rise.json'), encoding='utf-8'))
results = []


def check(name, mutate, expect_error):
    d = copy.deepcopy(base)
    if mutate:
        mutate(d)
    errs = validate(d)
    ok = bool(errs) == expect_error
    results.append(('PASS ' if ok else 'FAIL ') + name + ('' if ok else ' → ' + '; '.join(errs[:2])))


check('rise.json ist gültig', None, False)
check('Lücke zwischen Stationen wird erkannt', lambda d: d['tour']['stations'][2]['range'].__setitem__(0, 0.31), True)
check('hold ausserhalb des Bereichs wird erkannt', lambda d: d['tour']['stations'][1].__setitem__('hold', 0.5), True)
check('nicht aufsteigende Keyframes werden erkannt', lambda d: d['tour']['keyframes'][3].__setitem__('p', 0.05), True)
check('Tür schliesst vor dem Öffnen → Fehler', lambda d: d['tour']['doors'][0].__setitem__('close', [0.2, 0.25]), True)
check('unbekannte Leistung im CTA → Fehler', lambda d: d['tour']['stations'][1]['ctas'][0].__setitem__('service', 'garten'), True)
check('«ß» im Text → Fehler', lambda d: d['tour']['stations'][1].__setitem__('text', 'Grünflächen und Strasse groß'), True)
check('Veröffentlichen ohne Freigabe → Fehler', lambda d: d['metadata'].__setitem__('publishWithoutApproval', True), True)
check('Hauswartung nicht Priorität 1 → Fehler', lambda d: d['services'].reverse(), True)
check('Ursprung ohne https → Fehler', lambda d: d['wix']['allowedOrigins'].append('http://immoready.ch'), True)
check('erfundene Qualifikation → Fehler', lambda d: d['firm']['qualifications'].append('Eidg. dipl. Sanitärmeister'), True)
check('Auswahl mit unbekannter Leistung → Fehler', lambda d: d['tour']['stations'][3]['choices'][0].__setitem__('service', 'aufbereitung'), True)
check('Schluss ohne Kontakt-Aktion → Fehler', lambda d: d['tour']['stations'][5].__setitem__('ctas', [c for c in d['tour']['stations'][5]['ctas'] if not c.get('contact')]), True)
check('Schluss ohne allgemeine Offerte → Fehler', lambda d: d['tour']['stations'][5]['ctas'][0].__setitem__('service', 'hauswartung'), True)
check('Scan-Kante länger als 1400 ms → Fehler', lambda d: d['tour']['introScan'].__setitem__('durationMs', 2000), True)
check('Tür ohne Winkel und ohne Schiebeweg → Fehler', lambda d: d['tour']['doors'][2].pop('slideM'), True)
check('Ereignis request-contact fehlt → Fehler', lambda d: d['events'].pop('request-contact'), True)

# Gebaute Seite enthält genau die Konfiguration aus rise.json
page = open(os.path.join(ROOT, 'dist/immoready-vorschau.html'), encoding='utf-8').read()
m = re.search(r'window\.IR_RISE=(\{.*?\});</script>', page)
same = m is not None and json.loads(m.group(1)) == json.loads(json.dumps(tour_config(base)))
results.append(('PASS ' if same else 'FAIL ') + 'gebaute Seite verwendet exakt die Tour-Konfiguration aus rise.json')
comp = open(os.path.join(ROOT, 'dist/component/immoready-tour.js'), encoding='utf-8').read()
results.append(('PASS ' if ('"hold":%s' % json.dumps(base['tour']['stations'][4]['hold'])) in comp and 'Gartenunterhalt anfragen' in comp else 'FAIL ') + 'Komponente enthält Stationen und Texte aus rise.json')
st = base['tour']['stations']
ok_txt = all(s_['title'].split('. ')[0] in page for s_ in st) and 'data-choice="leerstand"' in page and 'data-contact' in page
results.append(('PASS ' if ok_txt else 'FAIL ') + 'gebaute Seite enthält Titel, Wohnungs-Auswahl und Kontakt-Aktion aus rise.json')
results.append(('PASS ' if all(os.path.exists(os.path.join(ROOT, 'assets/tour/%s%s.webp' % (s_['still'], x))) for s_ in st for x in ('', '-hoch')) else 'FAIL ') + 'alle 12 Stationsbilder vorhanden (quer und hoch)')

print('\n'.join(results))
sys.exit(1 if any(r.startswith('FAIL') for r in results) else 0)
