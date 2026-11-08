// ENTWURF – NICHT in Wix eingebaut. Ergänzung für wix/backend/http-functions.js (Velo, Backend).
// Zweck: Nachdem eine Offertanfrage in der Wix-Sammlung «Offertanfragen» gespeichert wurde, wird sie zusätzlich
// an ReadyOps weitergeleitet (CRM, interne Meldung). Schlägt die Weiterleitung fehl, bleibt die Wix-Speicherung gültig;
// der Fehler wird protokolliert und ReadyOps meldet «formular_fehlgeschlagen» nicht (es hat nichts erhalten) –
// deshalb hier zusätzlich ein Wix-Log-Eintrag für die Überwachung.
// Voraussetzungen (Freigabe nötig): ReadyOps öffentlich per HTTPS erreichbar; Adresse als Wix-Secret «READYOPS_INTAKE_URL».
import { getSecret } from 'wix-secrets-backend';
import { fetch } from 'wix-fetch';

export async function anReadyOpsWeiterleiten(daten) {
  try {
    const url = await getSecret('READYOPS_INTAKE_URL'); // z. B. https://<host>/api/intake/immoready
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://www.immoready.ch' },
      body: JSON.stringify({
        leistung: daten.leistung, auftrag: daten.auftrag, ort: daten.ort, beschreibung: daten.beschreibung,
        name: daten.name, email: daten.email, tel: daten.tel, firma: daten.firma || ''
      })
    });
    const j = await r.json().catch(() => ({}));
    return { ok: r.ok && j.ok === true, referenz: j.id || null };
  } catch (e) {
    console.error('ReadyOps-Weiterleitung fehlgeschlagen', e && e.message);
    return { ok: false };
  }
}
// Einbau in post_offerte (nach erfolgreichem items.insert):
//   const fw = await anReadyOpsWeiterleiten(pruefung.daten);
//   // Antwort an den Browser NICHT von fw abhängig machen; «notified» weiterhin nur bei bestätigter Zustellung.
