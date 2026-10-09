// Velo-Seitencode für die Startseite – Rundgang als Custom Element <immoready-tour> (V13)
// Bevorzugte Variante laut rise.json; die iFrame-Variante steht in velo-seitencode-startseite.js.
// Einbauanleitung mit allen IDs: wix/EINBAU.md
//
// Element-ID im Wix-Editor (Eigenschaften-Panel → ID): immoreadyTour
// Tag-Name: immoready-tour · Attribute: mode="steps" (empfohlen), assets-base="https://…/tour/" (Hosting offen)
import wixLocation from 'wix-location';

// Schlüssel exakt wie in rise.json → services[].key bzw. tour.stations[].key
const LEISTUNGEN = ['hauswartung', 'sanitaer', 'gartenunterhalt', 'reinigung', 'raeumung', 'leerstand', 'verkauf', 'fotografie'];
const STATIONEN = ['aussen', 'garten', 'eingang', 'wohnung', 'bad', 'zurueck'];
// Zielseiten in Wix – VOR DEM EINBAU PRÜFEN (rise.json → pages.quotePath / pages.contactPath):
const OFFERTE_PFAD = '/offerte';
const KONTAKT_PFAD = '/kontakt'; // Pfad der Kontaktseite ist noch nicht bestätigt (contactPath = [UNSPECIFIED])

// Eingehende Ereignisse streng prüfen: nur bekannte Quelle, Version und Werte aus den Listen
function gueltig(d) { return !!d && typeof d === 'object' && d.source === 'tour' && d.version === 1 && STATIONEN.includes(d.station); }

$w.onReady(function () {
  const tour = $w('#immoreadyTour');

  // «Offerte anfragen» – mit Leistung (z. B. sanitaer) oder allgemein ohne Leistung
  tour.on('request-quote', (event) => {
    const d = event.detail;
    if (!gueltig(d)) return;
    const service = typeof d.service === 'string' && LEISTUNGEN.includes(d.service) ? d.service : '';
    wixLocation.to(OFFERTE_PFAD + (service ? '?leistung=' + encodeURIComponent(service) : ''));
  });

  // «Kontakt aufnehmen» (letzte Station)
  tour.on('request-contact', (event) => {
    if (!gueltig(event.detail)) return;
    wixLocation.to(KONTAKT_PFAD);
  });

  tour.on('station-change', (event) => {
    const d = event.detail || {};
    if (!STATIONEN.includes(d.station)) return;
    // optional: eigene Elemente der Seite passend zur Station ein-/ausblenden
  });

  tour.on('tour-error', (event) => {
    // Der Rundgang zeigt bei WebGL-Problemen selbst die Stationsbilder; hier nur protokollieren
    console.info('immoready-tour:', event.detail && event.detail.code);
  });

  // Beispiel: eigene Knöpfe auf der Wix-Seite steuern die Station (IDs anpassen)
  // $w('#btnSanitaer').onClick(() => tour.setAttribute('station', '4'));
});
