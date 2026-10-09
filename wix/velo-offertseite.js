// Velo-Seitencode für die Offertseite (V17.1) – wählt die Leistung vor, die der Rundgang über
// request-quote → /offerte?leistung=<schluessel> übergibt. Nicht eingebaut; Einbau siehe wix/EINBAU.md.
//
// Voraussetzung: Das Offertformular enthält ein Auswahlfeld (Dropdown oder Optionsfeld) für die Leistung.
// Element-ID im Wix-Editor: leistungFeld  (VOR DEM EINBAU PRÜFEN – je nach Formulartyp anpassen).
// Hinweis: Felder des neuen «Wix Forms»-Elements lassen sich je nach Version nicht per Velo setzen. Dann ein
// eigenes Velo-Formular (Eingabeelemente + Datensammlung) verwenden oder auf die Vorauswahl verzichten.
import wixLocation from 'wix-location';

// Schlüssel exakt wie in rise.json → services[].key; Wert = Beschriftung der Option im Formular (prüfen)
const LEISTUNGEN = {
  hauswartung: 'Hauswartung',
  sanitaer: 'Sanitär & Unterhalt',
  gartenunterhalt: 'Gartenunterhalt',
  reinigung: 'Reinigung',
  raeumung: 'Räumung & Aufbereitung',
  leerstand: 'Leerstandsmanagement',
  verkauf: 'Vermarktung & Vermittlung',
  fotografie: 'Immobilienpräsentation'
};

$w.onReady(function () {
  const key = String(wixLocation.query.leistung || '');
  if (!Object.prototype.hasOwnProperty.call(LEISTUNGEN, key)) return; // unbekannt oder leer → keine Vorauswahl
  const feld = $w('#leistungFeld');
  if (!feld) return;
  // Dropdown/Optionsfeld: Wert setzen, wenn die Option existiert (sonst unverändert lassen)
  const opts = (feld.options || []).map((o) => o.value);
  const wert = opts.includes(key) ? key : LEISTUNGEN[key];
  if (!opts.length || opts.includes(wert)) feld.value = wert;
});
