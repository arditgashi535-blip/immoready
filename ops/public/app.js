'use strict';
// ReadyOps-Freigabeoberfläche. Alle Daten werden mit textContent eingesetzt (kein innerHTML aus Daten).
(function () {
  const $ = id => document.getElementById(id);
  const S = { me: null, tenant: null, tab: 'drafts', csrf: null };
  const STATUS = { entwurf: 'Entwurf', freigabe_ausstehend: 'Freigabe ausstehend', freigegeben: 'Freigegeben', abgelehnt: 'Abgelehnt', zurueckgestellt: 'Zurückgestellt', ausgefuehrt: 'Ausgeführt', fehler: 'Fehler' };
  const KIND = { email: 'E-Mail', brief: 'Brief', kontaktformular: 'Kontaktformular', offerte: 'Offerte', rechnung: 'Rechnung', mahnung: 'Mahnung' };

  function el(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : v);
    }
    for (const k of kids.flat()) if (k != null && k !== false) e.append(k instanceof Node ? k : document.createTextNode(String(k)));
    return e;
  }
  function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 4000); }
  async function api(path, opts = {}) {
    const r = await fetch(path, { method: opts.method || 'GET', credentials: 'same-origin', headers: Object.assign({ 'Content-Type': 'application/json' }, S.csrf ? { 'X-CSRF-Token': S.csrf } : {}), body: opts.body ? JSON.stringify(opts.body) : undefined });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(j.error || ('Fehler ' + r.status)); e.status = r.status; throw e; }
    return j;
  }
  const T = p => `/api/${S.tenant}/${p}`;
  const role = () => S.me && S.me.memberships[S.tenant];
  const fmt = iso => iso ? new Date(iso).toLocaleString('de-CH') : '–';
  const view = () => $('view');

  async function boot() {
    try { const me = await api('/api/me'); S.me = me; S.csrf = me.csrf; showApp(); }
    catch { $('login').hidden = false; }
  }
  function showApp() {
    $('login').hidden = true; $('topR').hidden = false; $('tabs').hidden = false;
    const sel = $('tenant'); sel.textContent = '';
    for (const t of S.me.tenants) sel.append(el('option', { value: t.id }, t.name));
    S.tenant = S.tenant || (S.me.tenants[0] && S.me.tenants[0].id);
    sel.value = S.tenant;
    $('who').textContent = `${S.me.user.name} · ${role() || ''}`;
    render();
  }
  $('loginForm').addEventListener('submit', async e => {
    e.preventDefault(); $('loginErr').textContent = '';
    const f = new FormData(e.target);
    try { await api('/api/login', { method: 'POST', body: { email: f.get('email'), password: f.get('password') } }); await boot(); }
    catch (err) { $('loginErr').textContent = err.message; }
  });
  $('logout').addEventListener('click', async () => { await api('/api/logout', { method: 'POST' }).catch(() => {}); location.reload(); });
  $('tenant').addEventListener('change', e => { S.tenant = e.target.value; $('who').textContent = `${S.me.user.name} · ${role()}`; render(); });
  $('tabs').addEventListener('click', e => {
    const b = e.target.closest('button[data-tab]'); if (!b) return;
    S.tab = b.dataset.tab;
    for (const x of $('tabs').querySelectorAll('button')) { if (x === b) x.setAttribute('aria-current', 'page'); else x.removeAttribute('aria-current'); }
    render();
  });

  function render() {
    view().textContent = '';
    ({ drafts: renderDrafts, leads: renderLeads, dash: renderDash, inq: renderInq, notif: renderNotif, log: renderLog }[S.tab] || renderDrafts)()
      .catch(e => view().append(el('p', { class: 'alert', role: 'alert' }, 'Fehler: ' + e.message)));
  }

  // ---------- Freigaben ----------
  async function renderDrafts(filters = { status: 'freigabe_ausstehend' }) {
    const box = el('div', { class: 'filters' });
    const st = el('select', { 'aria-label': 'Status' }, el('option', { value: '' }, 'Alle Status'), ...Object.entries(STATUS).map(([k, v]) => el('option', { value: k }, v)));
    st.value = filters.status || '';
    const kd = el('select', { 'aria-label': 'Art' }, el('option', { value: '' }, 'Alle Arten'), ...Object.entries(KIND).map(([k, v]) => el('option', { value: k }, v)));
    kd.value = filters.kind || '';
    const q = el('input', { type: 'search', placeholder: 'Suche: Firma, Empfänger, Betreff, Text', 'aria-label': 'Suche', value: filters.q || '' });
    const go = () => { view().textContent = ''; renderDrafts({ status: st.value, kind: kd.value, q: q.value }); };
    st.addEventListener('change', go); kd.addEventListener('change', go); q.addEventListener('keydown', e => e.key === 'Enter' && go());
    box.append(st, kd, q, el('button', { class: 'btn ghost', type: 'button', onclick: go }, 'Suchen'));
    const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString();
    const rows = await api(T('drafts' + (qs ? '?' + qs : '')));
    const tb = el('tbody');
    for (const d of rows) {
      tb.append(el('tr', { class: 'row', tabindex: '0', 'data-id': d.id, onclick: () => openDraft(d.id), onkeydown: e => e.key === 'Enter' && openDraft(d.id) },
        el('td', { 'data-l': 'Status' }, el('span', { class: 'pill ' + d.status }, STATUS[d.status] || d.status)),
        el('td', { 'data-l': 'Art' }, KIND[d.kind] || d.kind),
        el('td', { 'data-l': 'Firma' }, d.company || '–'),
        el('td', { 'data-l': 'Empfänger' }, d.recipient),
        el('td', { 'data-l': 'Betreff' }, d.subject),
        el('td', { 'data-l': 'Version' }, 'v' + d.current_version),
        el('td', { 'data-l': 'Geändert' }, fmt(d.updated_at))));
    }
    view().append(el('h1', {}, 'Freigaben'), box,
      rows.length ? el('table', { class: 'resp' }, el('thead', {}, el('tr', {}, ...['Status', 'Art', 'Firma', 'Empfänger', 'Betreff', 'Version', 'Geändert'].map(h => el('th', {}, h)))), tb)
        : el('p', { class: 'note' }, 'Keine Einträge für diesen Filter.'));
  }

  async function openDraft(id) {
    const d = await api(T('drafts/' + id));
    const c = d.current;
    view().textContent = '';
    const isOwner = role() === 'owner', canEdit = ['owner', 'editor'].includes(role());
    const back = el('button', { class: 'btn ghost', type: 'button', onclick: () => render() }, '← Zurück zur Liste');
    const warn = [];
    if (d.injection_flags.length) warn.push(el('p', { class: 'alert', role: 'alert' }, 'Achtung: Der Inhalt enthält verdächtige Muster (' + d.injection_flags.join(', ') + '). Externer Text wird nie als Anweisung ausgeführt – bitte genau prüfen.'));
    if (d.suppressed) warn.push(el('p', { class: 'alert', role: 'alert' }, 'Empfänger steht auf der Sperrliste (Widerspruch). Freigabe ist blockiert.'));
    if (d.last_error) warn.push(el('p', { class: 'alert', role: 'alert' }, 'Letzter Fehler: ' + d.last_error));
    if (d.kind !== 'email' && d.action) warn.push(el('p', { class: 'note' }, 'Kanal: ' + (KIND[d.kind] || d.kind) + '. Ausführen legt die Übergabe an (Gmail-Entwurf bzw. Brief zum Ausdrucken) – nichts wird automatisch versendet.'));

    const meta = el('dl', { class: 'kv' },
      el('dt', {}, 'Status'), el('dd', {}, el('span', { class: 'pill ' + d.status }, STATUS[d.status])),
      el('dt', {}, 'Aktion'), el('dd', {}, d.action),
      el('dt', {}, 'Empfänger'), el('dd', { id: 'dRecipient' }, c.recipient),
      el('dt', {}, 'Betreff'), el('dd', {}, c.subject),
      el('dt', {}, 'Version'), el('dd', { id: 'dVersion' }, 'v' + c.version + ' · Hash ' + c.content_hash.slice(0, 12)),
      el('dt', {}, 'Preis/Indikation'), el('dd', {}, c.price_chf ? 'CHF ' + c.price_chf : '–'),
      el('dt', {}, 'Freigabe gültig'), el('dd', { id: 'dValid' }, d.approved_valid ? 'Ja (für diese Version)' : 'Nein'),
      el('dt', {}, 'Anhänge'), el('dd', {}, c.attachments.length ? c.attachments.map(a => el('a', { href: T('documents/' + a.id) }, a.filename)) : '–'));

    const leadBox = d.lead ? el('div', { class: 'card' }, el('h2', {}, 'Lead: ' + d.lead.company.name),
      el('dl', { class: 'kv' },
        el('dt', {}, 'Score'), el('dd', {}, String(d.lead.score ?? '–')),
        el('dt', {}, 'Stufe'), el('dd', {}, S.me.stageLabels[d.lead.stage] || d.lead.stage),
        el('dt', {}, 'Kanal'), el('dd', {}, (d.lead.channel || '–') + (d.lead.channel_reason ? ' – ' + d.lead.channel_reason : '')),
        el('dt', {}, 'Prüfstand'), el('dd', {}, d.lead.verification),
        el('dt', {}, 'Eignung'), el('dd', {}, d.lead.fit_reason || '–'),
        el('dt', {}, 'Quellen'), el('dd', {}, d.lead.sources.map(s => el('div', {}, el('a', { href: s.url, rel: 'noopener noreferrer nofollow', target: '_blank' }, s.url), ' (' + String(s.retrieved_at).slice(0, 10) + ')'))),
        el('dt', {}, 'Befunde'), el('dd', {}, d.lead.findings.length ? d.lead.findings.map(f => el('div', {}, `[${f.severity}] ${f.text}`)) : '–'))) : null;

    const mail = el('div', { class: 'mail', id: 'dBody' }, c.body);
    const actions = el('div', { class: 'actions' });
    const decide = decision => async () => {
      const comment = decision === 'freigegeben' ? '' : (prompt('Kommentar (optional):') || '');
      try { await api(T(`drafts/${d.id}/decide`), { method: 'POST', body: { decision, version: c.version, content_hash: c.content_hash, comment } }); toast(STATUS[decision]); openDraft(d.id); }
      catch (e) { toast(e.message); openDraft(d.id); }
    };
    if (isOwner && ['freigabe_ausstehend', 'zurueckgestellt', 'freigegeben'].includes(d.status) && !d.approved_valid)
      actions.append(el('button', { class: 'btn ok', type: 'button', id: 'bApprove', disabled: d.suppressed, onclick: decide('freigegeben') }, 'Freigeben (v' + c.version + ')'));
    if (isOwner && ['freigabe_ausstehend', 'freigegeben', 'zurueckgestellt'].includes(d.status)) {
      actions.append(el('button', { class: 'btn bad', type: 'button', id: 'bReject', onclick: decide('abgelehnt') }, 'Ablehnen'));
      if (d.status !== 'zurueckgestellt') actions.append(el('button', { class: 'btn warn', type: 'button', id: 'bDefer', onclick: decide('zurueckgestellt') }, 'Zurückstellen'));
    }
    if (isOwner && (d.status === 'freigegeben' || d.status === 'fehler') && d.approved_valid)
      actions.append(el('button', { class: 'btn', type: 'button', id: 'bExec', onclick: async e => {
        e.target.disabled = true;
        try { await api(T(`drafts/${d.id}/execute`), { method: 'POST', body: { retry: d.status === 'fehler' } }); toast('Übergabe angelegt'); } catch (er) { toast(er.message); }
        openDraft(d.id);
      } }, d.status === 'fehler' ? 'Erneut versuchen' : 'Ausführen (Gmail-Entwurf anlegen)'));
    if (isOwner && d.status === 'ausgefuehrt')
      actions.append(el('button', { class: 'btn ghost', type: 'button', id: 'bSent', onclick: async () => { try { await api(T(`drafts/${d.id}/mark-sent`), { method: 'POST' }); toast('Als versendet markiert'); } catch (e) { toast(e.message); } openDraft(d.id); } }, 'Ich habe es selbst versendet'));
    if (canEdit && ['abgelehnt', 'zurueckgestellt', 'entwurf', 'fehler'].includes(d.status))
      actions.append(el('button', { class: 'btn ghost', type: 'button', onclick: async () => { try { await api(T(`drafts/${d.id}/resubmit`), { method: 'POST' }); } catch (e) { toast(e.message); } openDraft(d.id); } }, 'Erneut einreichen'));
    if (canEdit && d.status !== 'ausgefuehrt') actions.append(el('button', { class: 'btn ghost', type: 'button', id: 'bEdit', onclick: () => editForm(d) }, 'Text bearbeiten'));

    const hist = el('div', { class: 'card' }, el('h2', {}, 'Verlauf'),
      el('ul', {}, ...d.versions.map(v => el('li', {}, `v${v.version} · ${fmt(v.created_at)} · Hash ${v.content_hash.slice(0, 12)} · an ${v.recipient}`)),
        ...d.approvals.map(a => el('li', {}, `${STATUS[a.decision]} v${a.version} durch ${a.decided_by_name || a.decided_by} · ${fmt(a.decided_at)}${a.valid ? ' · gültig' : ' · ungültig'}${a.comment ? ' · «' + a.comment + '»' : ''}`)),
        ...d.outbox.map(o => el('li', {}, `Ausführung ${o.adapter}: ${o.status} (Versuche ${o.attempts})${o.error ? ' – ' + o.error : ''}`))));
    view().append(back, el('h1', {}, (KIND[d.kind] || d.kind) + ' #' + d.id), ...warn,
      el('div', { class: 'card' }, meta, el('h2', {}, 'Vollständiger Inhalt'), mail, actions, el('div', { id: 'editBox' })), leadBox, hist);
  }

  function editForm(d) {
    const c = d.current, box = $('editBox'); box.textContent = '';
    const r = el('input', { id: 'eRecipient', value: c.recipient }), s = el('input', { id: 'eSubject', value: c.subject });
    const b = el('textarea', { id: 'eBody' }); b.value = c.body;
    const p = el('input', { id: 'ePrice', value: c.price_chf || '' });
    box.append(el('div', { class: 'note' }, 'Hinweis: Jede Änderung erzeugt eine neue Version. Eine bestehende Freigabe wird dadurch ungültig.'),
      el('label', {}, 'Empfänger', r), el('label', {}, 'Betreff', s), el('label', {}, 'Text', b), el('label', {}, 'Preis/Indikation (CHF)', p),
      el('div', { class: 'actions' }, el('button', { class: 'btn', type: 'button', id: 'bSave', onclick: async () => {
        try { await api(T(`drafts/${d.id}/edit`), { method: 'POST', body: { expectVersion: c.version, changes: { recipient: r.value, subject: s.value, body: b.value, price_chf: p.value } } }); toast('Neue Version gespeichert – Freigabe erforderlich'); }
        catch (e) { toast(e.message); }
        openDraft(d.id);
      } }, 'Speichern als neue Version'), el('button', { class: 'btn ghost', type: 'button', onclick: () => { box.textContent = ''; } }, 'Abbrechen')));
    b.focus();
  }

  // ---------- Leads ----------
  async function renderLeads(f = {}) {
    const st = el('select', { 'aria-label': 'Stufe' }, el('option', { value: '' }, 'Alle Stufen'), ...S.me.stages.map(s => el('option', { value: s }, S.me.stageLabels[s])));
    st.value = f.stage || '';
    const q = el('input', { type: 'search', placeholder: 'Suche: Firma, Ort, Bedarf', 'aria-label': 'Suche', value: f.q || '' });
    const go = () => { view().textContent = ''; renderLeads({ stage: st.value, q: q.value }); };
    st.addEventListener('change', go); q.addEventListener('keydown', e => e.key === 'Enter' && go());
    const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v)).toString();
    const rows = await api(T('leads' + (qs ? '?' + qs : '')));
    const tb = el('tbody', {}, ...rows.map(l => el('tr', { class: 'row', tabindex: '0', onclick: () => openLead(l.id), onkeydown: e => e.key === 'Enter' && openLead(l.id) },
      el('td', { 'data-l': 'Score' }, String(l.score ?? '–')), el('td', { 'data-l': 'Firma' }, l.company), el('td', { 'data-l': 'Ort' }, [l.locality, l.canton].filter(Boolean).join(', ') || '–'),
      el('td', { 'data-l': 'Stufe' }, el('span', { class: 'pill' }, S.me.stageLabels[l.stage])), el('td', { 'data-l': 'Kanal' }, l.channel || '–'), el('td', { 'data-l': 'Prüfstand' }, l.verification))));
    view().append(el('h1', {}, 'Leads'), el('div', { class: 'filters' }, st, q, el('button', { class: 'btn ghost', type: 'button', onclick: go }, 'Suchen')),
      rows.length ? el('table', { class: 'resp' }, el('thead', {}, el('tr', {}, ...['Score', 'Firma', 'Ort', 'Stufe', 'Kanal', 'Prüfstand'].map(h => el('th', {}, h)))), tb) : el('p', { class: 'note' }, 'Keine Leads.'));
  }
  async function openLead(id) {
    const l = await api(T('leads/' + id));
    view().textContent = '';
    const moves = el('div', { class: 'actions' });
    if (['owner', 'editor'].includes(role())) {
      const sel = el('select', { 'aria-label': 'Neue Stufe' }, ...S.me.stages.filter(s => !['freigegeben', 'kontaktiert'].includes(s)).map(s => el('option', { value: s }, S.me.stageLabels[s])));
      moves.append(sel, el('button', { class: 'btn ghost', type: 'button', onclick: async () => {
        const reason = sel.value === 'verloren' ? prompt('Grund (optional):') : null;
        try { await api(T(`leads/${id}/stage`), { method: 'POST', body: { to: sel.value, reason } }); toast('Stufe geändert'); } catch (e) { toast(e.message); }
        openLead(id);
      } }, 'Stufe setzen'));
      const n = el('textarea', { 'aria-label': 'Gesprächsnotiz', style: 'min-height:90px' });
      moves.append(el('div', { style: 'flex-basis:100%' }, el('label', {}, 'Gesprächsnotiz', n), el('button', { class: 'btn ghost', type: 'button', onclick: async () => { if (!n.value.trim()) return; await api(T(`leads/${id}/notes`), { method: 'POST', body: { body: n.value } }); openLead(id); } }, 'Notiz speichern')));
    }
    view().append(el('button', { class: 'btn ghost', type: 'button', onclick: () => render() }, '← Zurück'), el('h1', {}, l.company.name),
      el('div', { class: 'card' }, el('dl', { class: 'kv' },
        el('dt', {}, 'Website'), el('dd', {}, l.company.website ? el('a', { href: l.company.website, rel: 'noopener noreferrer nofollow', target: '_blank' }, l.company.website) : '–'),
        el('dt', {}, 'Standort'), el('dd', {}, [l.company.address, l.company.locality, l.company.canton].filter(Boolean).join(', ') || '–'),
        el('dt', {}, 'Telefon'), el('dd', {}, l.company.phone || '–'),
        el('dt', {}, 'Score'), el('dd', {}, String(l.score ?? '–') + ' (' + l.score_detail.map(x => `${x.code} ${x.pts > 0 ? '+' : ''}${x.pts}`).join(', ') + ')'),
        el('dt', {}, 'Bedarf'), el('dd', {}, l.need || '–'),
        el('dt', {}, 'Eignung'), el('dd', {}, l.fit_reason || '–'),
        el('dt', {}, 'Kanal'), el('dd', {}, (l.channel || '–') + (l.channel_reason ? ' – ' + l.channel_reason : '')),
        el('dt', {}, 'Prüfstand'), el('dd', {}, l.verification + ' · recherchiert ' + String(l.researched_at || '').slice(0, 10)),
        el('dt', {}, 'Stufe'), el('dd', {}, S.me.stageLabels[l.stage]),
        el('dt', {}, 'Quellen'), el('dd', {}, l.sources.map(s => el('div', {}, el('a', { href: s.url, rel: 'noopener noreferrer nofollow', target: '_blank' }, s.url)))),
        el('dt', {}, 'Ansprechpartner'), el('dd', {}, l.contacts.length ? l.contacts.map(c => el('div', {}, `${c.name}${c.role ? ' (' + c.role + ')' : ''}`)) : '–'),
        el('dt', {}, 'Befunde'), el('dd', {}, l.findings.length ? l.findings.map(f => el('div', {}, `[${f.severity}] ${f.text}${f.evidence ? ' – Beleg: ' + f.evidence : ''}`)) : '–')), moves),
      el('div', { class: 'card' }, el('h2', {}, 'Notizen'), l.notes.length ? el('ul', {}, ...l.notes.map(n => el('li', {}, fmt(n.created_at) + ': ' + n.body))) : el('p', {}, '–')),
      el('div', { class: 'card' }, el('h2', {}, 'Historie'), el('ul', {}, ...l.history.map(h => el('li', {}, `${fmt(h.at)} · ${h.type} · ${h.data || ''}`)))));
  }

  async function renderDash() {
    const s = await api(T('stats'));
    const pct = v => v == null ? '–' : Math.round(v * 100) + ' %';
    view().append(el('h1', {}, 'Auswertung'), el('div', { class: 'grid' },
      el('div', { class: 'stat' }, el('b', {}, String(s.total)), 'Leads gesamt'),
      el('div', { class: 'stat' }, el('b', {}, String(s.drafts.freigabe_ausstehend || 0)), 'Offene Freigaben'),
      el('div', { class: 'stat' }, el('b', {}, 'CHF ' + Number(s.potential_chf).toLocaleString('de-CH')), 'Potenzial offen (Indikation)'),
      el('div', { class: 'stat' }, el('b', {}, 'CHF ' + Number(s.won_chf).toLocaleString('de-CH')), 'Gewonnen'),
      el('div', { class: 'stat' }, el('b', {}, pct(s.conversion.kontakt_zu_rueckmeldung)), 'Rückmeldequote'),
      el('div', { class: 'stat' }, el('b', {}, pct(s.conversion.gewonnen_von_kontaktiert)), 'Abschlussquote')),
      el('h2', {}, 'Pipeline'), el('table', {}, el('tbody', {}, ...S.me.stages.map(k => el('tr', {}, el('td', {}, S.me.stageLabels[k]), el('td', {}, String(s.byStage[k] || 0)))))));
  }
  async function renderInq() {
    const rows = await api(T('inquiries'));
    view().append(el('h1', {}, 'Anfragen'), rows.length ? el('table', { class: 'resp' }, el('tbody', {}, ...rows.map(r => {
      const c = JSON.parse(r.classification || '{}'); const fl = JSON.parse(r.injection_flags || '[]');
      return el('tr', {}, el('td', { 'data-l': 'Ref.' }, String(r.id)), el('td', { 'data-l': 'Eingang' }, fmt(r.received_at)), el('td', { 'data-l': 'Leistung' }, c.leistung || '–'),
        el('td', { 'data-l': 'Typ' }, (c.b2b ? 'Geschäftskunde' : 'Privat') + (c.urgent ? ' · dringend' : '')), el('td', { 'data-l': 'Qualifiziert' }, r.qualified ? 'ja' : 'nein'),
        el('td', { 'data-l': 'Warnung' }, fl.length ? fl.join(', ') : '–'));
    }))) : el('p', { class: 'note' }, 'Keine Anfragen.'));
  }
  async function renderNotif() {
    const rows = await api(T('notifications'));
    view().append(el('h1', {}, 'Interne Meldungen'), el('p', { class: 'note' }, 'Meldungen gehen nur an die eigenen Adressen. Zustellung derzeit als Gmail-Entwurf (siehe EMAIL-ROUTING.md).'),
      rows.length ? el('table', { class: 'resp' }, el('tbody', {}, ...rows.map(n => el('tr', {}, el('td', { 'data-l': 'Zeit' }, fmt(n.created_at)), el('td', { 'data-l': 'Art' }, n.kind),
        el('td', { 'data-l': 'Priorität' }, n.priority), el('td', { 'data-l': 'An' }, n.recipient), el('td', { 'data-l': 'Betreff' }, n.subject), el('td', { 'data-l': 'Status' }, n.status + (n.error ? ' – ' + n.error : '')))))) : el('p', {}, 'Keine Meldungen.'));
  }
  async function renderLog() {
    const rows = await api(T('events?limit=200'));
    view().append(el('h1', {}, 'Änderungsprotokoll'), el('table', { class: 'resp' }, el('tbody', {}, ...rows.map(e => el('tr', {}, el('td', { 'data-l': 'Zeit' }, fmt(e.at)), el('td', { 'data-l': 'Wer' }, e.actor),
      el('td', { 'data-l': 'Objekt' }, e.entity + ' ' + (e.entity_id ?? '')), el('td', { 'data-l': 'Ereignis' }, e.type), el('td', { 'data-l': 'Daten' }, e.data || ''))))));
  }
  boot();
})();
