'use strict';
// Schutz vor Prompt-Injection und Markup in externen Inhalten (Kundenanfragen, fremde Websites).
// Grundsatz: Externer Text ist DATEN. Er wird nie als Anweisung ausgeführt, kann keine Aktion,
// keinen Statuswechsel und keinen Versand auslösen. Verdächtige Muster werden markiert und im UI angezeigt.
const PATTERNS = [
  [/ignor(e|iere)[^.\n]{0,40}(previous|vorherig|above|obig|all|alle)[^.\n]{0,20}(instruction|anweisung|regel|prompt)/i, 'ignore_instructions'],
  [/(system\s*prompt|developer\s*message|you are (now )?(chatgpt|claude|an? ai)|du bist (jetzt )?(ein|eine) (ki|assistent))/i, 'role_override'],
  [/(send|sende|schick|forward|leite)[^.\n]{0,60}(e-?mail|mail|nachricht|daten|data|passwort|password|kunden|customer)[^.\n]{0,40}(an|to)\s+\S+@\S+/i, 'exfiltration_request'],
  [/(approve|genehmig|freigeb|freigabe erteil)[^.\n]{0,40}(automatisch|sofort|immediately|all|alle)/i, 'approval_bypass'],
  [/<\s*(script|iframe|object|embed)\b/i, 'markup_script'],
  [/\b(BEGIN|END)\s+(INSTRUCTIONS|PROMPT)\b|\[\[?\s*(system|assistant)\s*\]?\]/i, 'prompt_delimiter'],
  [/(api[_-]?key|access[_-]?token|bearer\s+[a-z0-9._-]{12,})/i, 'secret_probe']
];

function detectInjection(text) {
  const t = String(text || '');
  const flags = [];
  for (const [re, code] of PATTERNS) if (re.test(t)) flags.push(code);
  return flags;
}
// Steuerzeichen und unsichtbare Zeichen entfernen, Länge begrenzen
function cleanText(v, max = 4000) {
  if (typeof v !== 'string') return '';
  return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁠-⁤﻿]/g, '').trim().slice(0, max);
}
function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
// Zitatblock für die Weitergabe an ein Sprachmodell: klar als unvertrauenswürdige Daten abgegrenzt
function quoteUntrusted(text, label = 'externer Inhalt') {
  const t = cleanText(text, 8000).replace(/<\/?untrusted[^>]*>/gi, '');
  return `<untrusted source="${escapeHtml(label)}">\n${t}\n</untrusted>`;
}
module.exports = { detectInjection, cleanText, escapeHtml, quoteUntrusted };
