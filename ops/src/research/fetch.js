'use strict';
// Schonender Abruf öffentlicher Seiten: robots.txt wird beachtet, je Host höchstens 1 Abruf pro
// `delayMs`, Zeitlimit, Grössenlimit, keine Formularübermittlung, keine Sicherheits-Scans.
const UA = 'Mozilla/5.0 (compatible; ReadyOps-Research/0.1; +https://readystudio.ch)';
const robotsCache = new Map();
const lastHit = new Map();
const sleep = ms => new Promise(r => setTimeout(r, ms));

function parseRobots(txt) {
  // Regeln für «*» (vereinfachter Parser: Gruppen, Allow/Disallow, Platzhalter * und $)
  const groups = []; let cur = null, lastWasAgent = false;
  for (const raw of String(txt).split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim(); if (!line) continue;
    const i = line.indexOf(':'); if (i < 0) continue;
    const k = line.slice(0, i).trim().toLowerCase(), v = line.slice(i + 1).trim();
    if (k === 'user-agent') { if (!lastWasAgent) { cur = { agents: [], rules: [] }; groups.push(cur); } cur.agents.push(v.toLowerCase()); lastWasAgent = true; continue; }
    lastWasAgent = false;
    if (cur && (k === 'allow' || k === 'disallow')) cur.rules.push({ allow: k === 'allow', path: v });
  }
  const mine = groups.filter(g => g.agents.some(a => a.includes('readyops'))); const star = groups.filter(g => g.agents.includes('*'));
  return (mine.length ? mine : star).flatMap(g => g.rules).filter(r => r.path !== '' || r.allow);
}
function robotsAllows(rules, pathq) {
  let best = null;
  for (const r of rules) {
    if (!r.path) continue;
    const re = new RegExp('^' + r.path.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$/, '$'));
    if (re.test(pathq) && (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow))) best = r;
  }
  return !best || best.allow;
}
async function rawGet(url, { timeoutMs = 20000, maxBytes = 3e6 } = {}) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), timeoutMs);
  const t0 = Date.now();
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'de-CH,de;q=0.9' }, redirect: 'follow', signal: ctl.signal });
    const buf = Buffer.from(await r.arrayBuffer());
    return { status: r.status, url: r.url, headers: Object.fromEntries(r.headers), body: buf.subarray(0, maxBytes).toString('utf8'), bytes: buf.length, ms: Date.now() - t0 };
  } finally { clearTimeout(t); }
}
async function robotsFor(origin) {
  if (robotsCache.has(origin)) return robotsCache.get(origin);
  let rules = [];
  try { const r = await rawGet(origin + '/robots.txt', { timeoutMs: 10000, maxBytes: 5e5 }); if (r.status === 200) rules = parseRobots(r.body); } catch { /* keine robots.txt → erlaubt */ }
  robotsCache.set(origin, rules); return rules;
}
async function politeGet(url, { delayMs = 3000, ...opts } = {}) {
  const u = new URL(url);
  const rules = await robotsFor(u.origin);
  if (!robotsAllows(rules, u.pathname + u.search)) return { skipped: 'robots', url };
  const wait = (lastHit.get(u.host) || 0) + delayMs - Date.now(); if (wait > 0) await sleep(wait);
  lastHit.set(u.host, Date.now());
  return rawGet(url, opts);
}
module.exports = { politeGet, rawGet, parseRobots, robotsAllows, UA, sleep };
