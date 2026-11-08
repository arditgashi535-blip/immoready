'use strict';
// CRM-Pipeline als Zustandsautomat. Nur erlaubte Übergänge; jeder Wechsel wird in events protokolliert.
const STAGES = ['neu', 'qualifiziert', 'kontaktentwurf', 'freigabe_ausstehend', 'freigegeben', 'kontaktiert', 'rueckmeldung', 'offerte', 'gewonnen', 'verloren'];
const LABELS = { neu: 'Neuer Lead', qualifiziert: 'Qualifiziert', kontaktentwurf: 'Kontaktentwurf', freigabe_ausstehend: 'Freigabe ausstehend', freigegeben: 'Freigegeben', kontaktiert: 'Kontaktiert', rueckmeldung: 'Rückmeldung', offerte: 'Offerte', gewonnen: 'Gewonnen', verloren: 'Verloren' };
const NEXT = {
  neu: ['qualifiziert', 'verloren'],
  qualifiziert: ['kontaktentwurf', 'verloren'],
  kontaktentwurf: ['freigabe_ausstehend', 'verloren'],
  freigabe_ausstehend: ['freigegeben', 'kontaktentwurf', 'verloren'],
  freigegeben: ['kontaktiert', 'kontaktentwurf', 'freigabe_ausstehend'],
  kontaktiert: ['rueckmeldung', 'verloren'],
  rueckmeldung: ['offerte', 'kontaktentwurf', 'verloren', 'gewonnen'],
  offerte: ['gewonnen', 'verloren', 'rueckmeldung'],
  gewonnen: [],
  verloren: ['qualifiziert']
};
// Übergänge, die nur das System nach einer gültigen Freigabe bzw. Ausführung setzen darf
const SYSTEM_ONLY = { freigegeben: true, kontaktiert: true };
function canMove(from, to) { return (NEXT[from] || []).includes(to); }
module.exports = { STAGES, LABELS, NEXT, SYSTEM_ONLY, canMove };
