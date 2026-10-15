"""Prüft rise.json und die Regeln in tools/rise.py (positive und negative Fälle).
Aufruf: python3 tests/test_rise.py"""
import copy, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
from tools.rise import validate, tour_config, launch_check, firm_markup  # noqa: E402

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

# GmbH in Gründung: nichts als bestehend darstellen, nichts erfinden, Veröffentlichung gesperrt
co = lambda d: d['firm']['company']
check('GmbH in Gründung mit Livegang-Freigabe → Fehler', lambda d: co(d).__setitem__('goLiveApproved', True), True)
check('«eingetragen» ohne bestätigte Gründung → Fehler', lambda d: co(d).__setitem__('status', 'eingetragen'), True)
check('«eingetragen» mit offenen Registerangaben → Fehler', lambda d: (co(d).__setitem__('status', 'eingetragen'), co(d).__setitem__('foundingConfirmed', True)), True)
check('Firmenname ohne «GmbH» → Fehler', lambda d: co(d).__setitem__('registeredName', 'ImmoReady'), True)
check('UID im falschen Format → Fehler', lambda d: co(d).__setitem__('uid', 'CHE-12345'), True)
check('«GmbH» in öffentlichem Rundgangtext während der Gründung → Fehler', lambda d: d['tour']['stations'][0].__setitem__('text', 'ImmoReady GmbH betreut Ihre Liegenschaft.'), True)
lc = launch_check(base)
results.append(('PASS ' if lc and any('Gründung' in x for x in lc) and any('Livegang' in x for x in lc) else 'FAIL ') + 'Startsperre: --launch meldet %d offene Punkte (Gründung, Registerangaben, Freigabe)' % len(lc))
fx = json.loads(json.dumps(base))  # reine Testdaten, erscheinen nirgends auf der Seite
fx['firm']['company'].update(status='eingetragen', foundingConfirmed=True, goLiveApproved=True, registeredName='Testfirma Muster GmbH', seat='Testort',
                             address='Teststrasse 1, 9999 Testort', uid='CHE-000.000.000', commercialRegister='Testregister', representation='Test Person, Geschäftsführung', vat='Test-MWST')
fx['firm']['role'] = 'Testfunktion'
fm = firm_markup(fx)
results.append(('PASS ' if not validate(fx) and 'Testfirma Muster GmbH' in fm['imprint'] and 'CHE-000.000.000' in fm['imprint'] and 'missing' not in fm['imprint'] and 'review-only' not in fm['imprint'] and fm['footer'] == 'Testfirma Muster GmbH' else 'FAIL ') + 'nach Eintragung: Impressum, Datenschutz und Footer vollständig aus firm.company (Testdaten)')
fb = firm_markup(base)
results.append(('PASS ' if 'GmbH' not in fb['imprint'].split('review-only')[0] and 'GmbH' not in fb['privacy'] and 'GmbH' not in fb['footer'] and 'data-company="in_gruendung"' in fb['imprint'] else 'FAIL ') + 'in Gründung: öffentlicher Teil ohne «GmbH», Entwurf nur als interner Prüfhinweis')

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
