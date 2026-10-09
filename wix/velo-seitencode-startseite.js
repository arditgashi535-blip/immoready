// Velo-Seitencode für die Wix-Startseite (Classic Editor, Velo ist aktiviert).
// Voraussetzung: HTML-Element (Einbetten > Code einbetten > HTML-iFrame) mit der ID «rundgang»,
// Modus «Website-Adresse» = öffentliche Adresse von immoready-rundgang-embed.html (Hosting noch offen).
// Nachrichten: SCENE_READY, REQUEST_QUOTE, REQUEST_CONTACT (vom Rundgang) · GO_TO_STATION, SET_PROGRESS (an den Rundgang).
// Hinweis: Ein iFrame kennt den Scrollfortschritt der Wix-Seite nicht – der Rundgang läuft hier im Stationsmodus.
import wixLocation from 'wix-location';

const LEISTUNGEN = ['hauswartung', 'sanitaer', 'gartenunterhalt', 'reinigung', 'raeumung', 'leerstand', 'verkauf', 'fotografie'];

$w.onReady(function () {
  $w('#rundgang').onMessage((event) => {
    const m = event.data;
    if (!m || typeof m !== 'object' || typeof m.type !== 'string') return;
    if (m.type === 'REQUEST_QUOTE') {
      const l = LEISTUNGEN.includes(m.leistung) ? m.leistung : '';
      // Zielseite der Offertanfrage anpassen, falls sie anders heisst:
      wixLocation.to('/offerte' + (l ? '?leistung=' + l : ''));
    } else if (m.type === 'REQUEST_CONTACT') {
      wixLocation.to('/kontakt'); // Pfad der Kontaktseite vor dem Einbau prüfen (rise.json → pages.contactPath)
    }
    // SCENE_READY: optional, z. B. Ladehinweis ausblenden
  });

  // Optional: eigene Stationsknöpfe auf der Wix-Seite (IDs anpassen)
  // $w('#btnGarten').onClick(() => $w('#rundgang').postMessage({ type: 'GO_TO_STATION', index: 1 }));
  // $w('#btnSanitaer').onClick(() => $w('#rundgang').postMessage({ type: 'GO_TO_STATION', index: 4 }));
});
