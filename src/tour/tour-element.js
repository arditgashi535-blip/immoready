/* ===================== <immoready-tour> · Web Component (V14) =====================
   Für Wix (Custom Element + Velo) und andere Seiten. Shadow DOM kapselt Gestaltung und Markup.

   Attribute:  mode="steps" (Standard, «Weiter»/«Zurück») | "scroll" (Seitenscroll steuert die Fahrt)
               station="0…5"   springt zur Station (z. B. per Velo: $w('#tour').setAttribute('station','4'))
               assets-base="https://…/tour/"   Ort der Stationsbilder quer + «-hoch», der Materialtexturen und von licht.json
                               (Standard: assets/tour/ neben dieser Skriptdatei; Bilder per CORS freigeben)
   Ereignisse (CustomEvent, bubbles + composed): tour-ready · station-change · request-quote · request-contact · tour-error
   Methoden:   goToStation(i) · setProgress(v) (nur mode="steps")
   Aufräumen:  disconnectedCallback beendet WebGL, Beobachter und alle Listener (mehrfach verbindbar). */
(function () {
  if (!window.customElements || window.customElements.get(CONFIG_TAG)) return;
  var SCRIPT_BASE = (function () { try { var s = document.currentScript && document.currentScript.src; return s ? s.replace(/[^/]*$/, '') + 'assets/tour/' : ''; } catch (e) { return ''; } })();
  var FONT_HREF = 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,200..900&display=swap';
  function ensureFont() {
    if (document.querySelector('link[data-immoready-font]')) return;
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = FONT_HREF; l.setAttribute('data-immoready-font', ''); document.head.appendChild(l);
  }
  /* Materialtexturen und vorab gerechnetes Licht: eingebettet (inline-Variante) oder neben den Stationsbildern */
  function texSet(base) {
    if (!base && TEX_INLINE) return TEX_INLINE;
    var b = base || SCRIPT_BASE, o = {};
    Object.keys(TEX_NAMES).forEach(function (k) { o[k] = TEX_NAMES[k].map(function (n) { return b + n + '.webp'; }); });
    o.laub = o.laub[0]; return o;
  }
  function bakeSrc(base) { if (!base && BAKE_INLINE) return BAKE_INLINE; return (base || SCRIPT_BASE) + 'licht.json'; }
  function stillUrl(base, i, portrait) {
    if (!base && STILLS_INLINE) return STILLS_INLINE[portrait ? 'p' : 'l'][i];
    return (base || SCRIPT_BASE) + STILLS[i] + (portrait ? '-hoch' : '') + '.webp';
  }

  class ImmoreadyTour extends HTMLElement {
    static get observedAttributes() { return ['station', 'mode', 'assets-base']; }
    connectedCallback() { this._mount(); }
    disconnectedCallback() { this._unmount(); }
    attributeChangedCallback(name, oldV, newV) {
      if (!this._tour || oldV === newV) return;
      if (name === 'station') { var i = parseInt(newV, 10); if (String(i) === String(newV).trim() && i >= 0 && i < CONFIG.stations.length) this._tour.goStation(i); }
      else { this._unmount(); this._mount(); }
    }
    goToStation(i) { if (this._tour && Number.isInteger(i)) this._tour.goStation(i); }
    setProgress(v) { if (this._tour && typeof v === 'number' && isFinite(v) && this._tour.mode() === 'button') this._tour.setProgress(v); }
    get station() { return this._tour ? this._tour.station() : 0; }
    get tour() { return this._tour; }
    _mount() {
      if (this._tour) return;
      ensureFont();
      var root = this.shadowRoot || this.attachShadow({ mode: 'open' });
      var base = this.getAttribute('assets-base') || '';
      var html = MARKUP.replace(/\{\{STILL(P?):(\d)\}\}/g, function (_, pt, n) { return stillUrl(base, +n, pt === 'P'); });
      root.innerHTML = '<style>' + CSS + '</style><div class="js irt">' + html + '</div>';
      var section = root.querySelector('#reise');
      var self = this, mode = this.getAttribute('mode') === 'scroll' ? 'scroll' : 'steps';
      this._tour = window.IRTour.create(section, {
        config: CONFIG, mode: mode, deferStart: true, textures: texSet(base), bake: bakeSrc(base),
        emit: function (name, detail) { self.dispatchEvent(new CustomEvent(name, { detail: detail, bubbles: true, composed: true })); },
        interceptQuote: function () { return true; },
        interceptContact: function () { return true; }
      });
      var st = parseInt(this.getAttribute('station'), 10);
      if (st > 0 && st < CONFIG.stations.length) this._tour.goStation(st);
    }
    _unmount() {
      if (this._tour) { this._tour.destroy(); this._tour = null; }
      if (this.shadowRoot) this.shadowRoot.innerHTML = '';
    }
  }
  window.customElements.define(CONFIG_TAG, ImmoreadyTour);
})();
