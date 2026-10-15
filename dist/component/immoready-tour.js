/*! ImmoReady <immoready-tour> V17 · erzeugt aus rise.json · eigenes WebGL, keine Bibliothek */
(function(){
var CONFIG_TAG="immoready-tour";
var CONFIG={"version":"17","eventsVersion":1,"stations":[{"k":"aussen","a":0,"b":0.15,"hold":0.03,"nav":"Gebäude","ps":[-0.36,0.14],"det":[]},{"k":"garten","a":0.15,"b":0.3,"hold":0.235,"nav":"Garten","ps":[-0.06,0.12],"det":[]},{"k":"eingang","a":0.3,"b":0.47,"hold":0.44,"nav":"Eingang","ps":[-0.22,0.12],"det":[]},{"k":"wohnung","a":0.47,"b":0.63,"hold":0.59,"nav":"Wohnung","ps":[0.0,0.12],"det":[]},{"k":"bad","a":0.63,"b":0.8,"hold":0.73,"nav":"Sanitär","ps":[-0.34,0.16],"det":[0.752,0.772]},{"k":"zurueck","a":0.8,"b":1.0,"hold":1.0,"nav":"Offerte","ps":[-0.36,0.14],"det":[]}],"keyframes":[[0.0,[38,18,50],[-10,4.5,5.5],0.55],[0.1,[24,11,35],[-8,4,5],0.64],[0.18,[-6,4.5,30],[-2,1,12],0.68],[0.235,[1.2,1.95,20.5],[-1.4,0.9,10],0.74],[0.3,[0,1.75,13.5],[0,1.9,5.5],0.78],[0.355,[0,1.95,7.6],[0,2.0,4],0.84],[0.39,[0,2.1,4.7],[0,2.1,2.4],0.88],[0.44,[-0.35,2.1,4.75],[1.6,1.5,1.6],0.9],[0.46,[0.4,2.1,4.3],[2.8,1.8,2.0],0.9],[0.48,[1.5,2.1,3.75],[4.0,2.0,2.9],0.9],[0.5,[2.4,2.1,3.3],[5,2.05,3.3],0.9],[0.535,[4.5,2.1,3.3],[7,2.05,3.3],0.9],[0.59,[5.85,2.0,3.6],[8.0,1.55,0.7],0.9],[0.618,[6.45,2.05,2.75],[5.85,1.7,-0.2],0.9],[0.645,[6.9,2.1,1.9],[5.0,1.8,0.9],0.9],[0.7,[6.0,1.95,1.1],[3.3,1.3,0.85],0.88],[0.715,[5.35,1.75,1.05],[3.3,1.2,0.55],0.9],[0.73,[4.85,1.62,1.62],[3.2,1.0,0.25],0.94],[0.752,[3.95,1.62,1.3],[3.22,1.2,0.8],0.66],[0.772,[4.0,1.32,0.62],[3.3,0.82,-0.38],0.74],[0.79,[4.3,1.7,1.15],[3.3,1.25,0.7],0.82],[0.81,[5.15,1.85,1.05],[3.4,1.35,0.8],0.84],[0.83,[6.55,1.95,0.9],[4.11,1.55,0.01],0.88],[0.855,[7.0,2.0,2.0],[5.6,1.7,0.3],0.9],[0.88,[6.8,2.0,4.3],[6.2,1.5,0.6],0.9],[0.893,[6.82,2.04,5.3],[6.6,1.6,1.0],0.88],[0.905,[6.84,2.12,6.4],[6.5,1.6,1.0],0.88],[0.922,[8.6,3.4,11.0],[4.5,2.3,2.0],0.8],[0.94,[12,5.5,17],[3,2.5,2],0.74],[0.97,[26,11,35],[-6,4,5],0.64],[1.0,[38,18,50],[-10,4.5,5.5],0.55]],"doors":{"haustuer":{"open":[0.31,0.35],"close":[0.8,0.84],"angle":1.75},"wohnungstuer":{"open":[0.455,0.485],"close":[0.8,0.84],"angle":-1.6},"terrassentuer":{"open":[0.845,0.875],"close":[0.93,0.955],"slide":1.0}},"highlights":{"sanitaer":{"in":[0.68,0.725],"out":[0.785,0.815]}},"smoothing":{"tauMs":110,"jumpTauMs":420,"stepsTauMs":520},"routeClearance":0.12,"wind":{"idleMs":15000,"maxFps":30},"label":"Illustrative Visualisierung · kein Referenzobjekt","services":["hauswartung","sanitaer","gartenunterhalt","reinigung","raeumung","leerstand","verkauf","fotografie"],"allowedOrigins":["https://www.immoready.ch","https://immoready.ch"],"formEndpoint":null};
var STILLS=["station-01-aussen", "station-02-garten", "station-03-eingang", "station-04-wohnung", "station-05-bad", "station-06-zurueck", "station-05-bad-waschtisch", "station-05-bad-wc"];
var STILLS_INLINE=null;
var TEX_NAMES={"t1": ["t1-putz", "t1-stein", "t1-rasen", "t1-hecke"], "t2": ["t2-holz", "t2-wandplatten", "t2-bodenplatten", "t2-metall"], "laub": ["laub"]};
var TEX_INLINE=null;
var BAKE_INLINE=null;
var CSS="\n/* Layout: Grautöne und warmes Licht aus dem ImmoReady-Logo; 12-Spalten-Raster, grosszügige Abstände, Graphit-Flächen im Wechsel mit warmem Weiss. */\n:host{\n  --ink:#2B2B2A;      /* Graphit – dunkle Abstufung des Logo-Graus */\n  --ink-2:#363635;    /* Graphit hell */\n  --steel:#727272;    /* Logo-Grau */\n  --steel-d:#5E5E5D;\n  --silver:#AAAAAB;   /* Zweiter Balken im Logo */\n  --ivory:#F4F2EE;    /* Warmes Weiss */\n  --paper:#E9E7E2;    /* Zweite helle Fläche */\n  --lime:#E1D7C7;     /* Warmes Licht aus dem Logo (Aktion auf Dunkel) */\n  --lime-press:#EEE6D8;\n  --glow:rgba(241,230,210,.55);\n  --stone:#5E5E5C;    /* Nebentext auf Hell (AA) */\n  --stone-d:#C3C2BE;  /* Nebentext auf Dunkel (AA) */\n  --line:rgba(43,43,42,.16);\n  --line-d:rgba(244,242,238,.18);\n  --warn:#F2C14E;     /* Prüfhinweise in der Vorschau */\n  --err:#A3261B;\n  --f-display:\"Archivo\",\"Helvetica Neue\",Arial,sans-serif;\n  --f-body:\"Archivo\",\"Helvetica Neue\",Arial,sans-serif;\n  --f-mono:\"Archivo\",\"Helvetica Neue\",Arial,sans-serif;\n  --gut:clamp(16px,4vw,48px);\n  --max:1320px;\n  --ease:cubic-bezier(.2,.7,.2,1);\n  color-scheme:light;\n}\n*,*::before,*::after{box-sizing:border-box}\n[hidden]{display:none!important}\nhtml{scroll-behavior:smooth;-webkit-text-size-adjust:100%}\nbody{margin:0;background:var(--ivory);color:var(--ink);font-family:var(--f-body);font-size:1.0625rem;line-height:1.6;font-stretch:100%}\nimg,svg{max-width:100%;display:block}\na{color:inherit}\nbutton,input,select,textarea{font:inherit;color:inherit}\nh1,h2,h3,h4{font-family:var(--f-display);margin:0;text-wrap:balance;hyphens:auto;-webkit-hyphens:auto;overflow-wrap:break-word}\np{margin:0}\n.wrap{max-width:var(--max);margin-inline:auto;padding-inline:var(--gut)}\n.mono{font-family:var(--f-mono);font-size:.74rem;letter-spacing:.18em;text-transform:uppercase;font-weight:500;font-stretch:115%}\n.sr{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}\n:focus-visible{outline:3px solid var(--ink);outline-offset:3px}\n.dark :focus-visible,.on-dark:focus-visible{outline-color:var(--lime)}\n.skip{position:absolute;left:12px;top:-60px;background:var(--lime);color:var(--ink);padding:10px 14px;z-index:100;font-weight:600}\n.skip:focus{top:12px}\n\n/* ---------- Vorschau-Leiste ---------- */\n.demo{background:#000;color:#E8E6DF;font-size:.8rem}\n.demo .wrap{display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center;padding-block:8px}\n.demo strong{color:var(--warn);font-weight:600}\n.demo a{color:#fff}\n.demo label{display:inline-flex;gap:8px;align-items:center;cursor:pointer}\n.demo input{accent-color:var(--warn);width:16px;height:16px}\n.demo .sp{flex:1}\n\n/* ---------- Header ---------- */\n.hdr{position:sticky;top:env(safe-area-inset-top,0px);z-index:40;background:var(--ink);color:var(--ivory);border-bottom:1px solid var(--line-d)}\n.hdr .wrap{display:flex;align-items:center;gap:24px;min-height:72px}\n.logo{display:inline-flex;align-items:center;gap:10px;text-decoration:none;color:var(--ivory)}\n.logo-mark{width:30px;height:30px;flex:none}\n.logo-word{font-family:var(--f-display);font-size:1.3rem;letter-spacing:-.01em;font-stretch:110%;line-height:1}\n.logo-word b{font-weight:800}.logo-word span{font-weight:400}\n.nav{display:flex;gap:4px;margin-left:auto;align-items:center}\n.nav>a,.nav>div>button{background:none;border:0;color:var(--ivory);text-decoration:none;padding:10px 12px;font-size:.95rem;cursor:pointer;display:inline-flex;gap:6px;align-items:center}\n.nav>a:hover,.nav>div>button:hover,.nav [aria-current=\"page\"]{color:var(--lime)}\n.nav .chev{width:10px;transition:transform .2s var(--ease)}\n.nav button[aria-expanded=\"true\"] .chev{transform:rotate(180deg)}\n.dd{position:relative}\n.dd-panel{position:absolute;top:calc(100% + 14px);left:-16px;width:min(560px,80vw);background:var(--ivory);color:var(--ink);padding:10px;display:grid;grid-template-columns:1fr 1fr;gap:0 10px;border:1px solid var(--line);box-shadow:0 24px 48px -24px rgba(0,0,0,.45)}\n.dd-panel a{display:flex;gap:12px;padding:12px 12px;text-decoration:none;border-bottom:1px solid var(--line);align-items:baseline}\n.dd-panel a:hover{background:var(--paper)}\n.dd-panel .mono{color:var(--stone);min-width:2.2em}\n.dd-panel a span:last-child{font-weight:500}\n.btn{--b:var(--lime);display:inline-flex;align-items:center;gap:12px;background:var(--b);color:var(--ink);border:1px solid var(--b);padding:14px 20px;font-weight:600;font-size:1rem;text-decoration:none;cursor:pointer;border-radius:2px;line-height:1.2;transition:background .2s var(--ease)}\n.btn:hover{background:var(--lime-press)}\n.btn .arr{width:18px;height:18px;transition:transform .25s var(--ease)}\n.btn:hover .arr,.lnk:hover .arr{transform:translateX(4px)}\n.btn.ghost{background:transparent;color:inherit;border-color:currentColor}\n.btn.ghost:hover{background:rgba(127,127,127,.12)}\n.btn.inkb{background:var(--ink);color:var(--ivory);border-color:var(--ink)}\n.btn.inkb:hover{background:#44443F}\n.btn.sm{padding:10px 14px;font-size:.9rem}\n.lnk{display:inline-flex;gap:10px;align-items:center;font-weight:600;text-decoration:none;border-bottom:1px solid currentColor;padding-bottom:3px}\n.lnk .arr{width:16px;height:16px;transition:transform .25s var(--ease)}\n.burger{display:none;margin-left:auto;background:none;border:1px solid var(--line-d);color:var(--ivory);width:46px;height:46px;cursor:pointer;align-items:center;justify-content:center}\n.mnav{display:none}\n@media (max-width:980px){\n  .nav{display:none}\n  .burger{display:inline-flex}\n  .hdr .btn.top{display:none}\n  .mnav[data-open=\"true\"]{display:block;position:fixed;inset:0;top:0;z-index:60;background:var(--ink);color:var(--ivory);overflow-y:auto;padding:calc(env(safe-area-inset-top,0px) + 16px) var(--gut) calc(env(safe-area-inset-bottom,0px) + 24px)}\n  .mnav .mtop{display:flex;justify-content:space-between;align-items:center;min-height:56px}\n  .mnav ul{list-style:none;margin:20px 0;padding:0}\n  .mnav li a{display:flex;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--line-d);text-decoration:none;font-size:1.15rem}\n  .mnav .sub a{font-size:1rem;padding-left:16px;color:#DAD8D0}\n  .mnav .mcontact{margin-top:24px;display:grid;gap:12px}\n}\n\n/* ---------- Gemeinsame Abschnitte ---------- */\n.sec{padding-block:clamp(72px,10vw,140px)}\n.dark{background:var(--ink);color:var(--ivory)}\n.dark .muted{color:var(--stone-d)}\n.muted{color:var(--stone)}\n.paper{background:var(--paper)}\n.eyebrow{display:flex;gap:12px;align-items:center;margin-bottom:22px}\n.eyebrow::before{content:\"\";width:28px;height:1px;background:currentColor;opacity:.6}\n.h2{font-size:clamp(2rem,4.6vw,3.7rem);line-height:1.02;letter-spacing:-.02em;font-weight:780;font-stretch:112%}\n.h3{font-size:clamp(1.25rem,1.8vw,1.55rem);line-height:1.2;font-weight:700;font-stretch:105%;letter-spacing:-.005em}\n.lead{font-size:clamp(1.1rem,1.5vw,1.3rem);line-height:1.5;max-width:38ch}\n.prose{max-width:62ch}\n.prose p+p{margin-top:1em}\n.grid12{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:clamp(16px,2.4vw,32px)}\n.rule{border:0;border-top:1px solid var(--line);margin:0}\n.dark .rule{border-top-color:var(--line-d)}\n.reveal{transition:transform .7s var(--ease)}\n.js .reveal:not(.in){transform:translateY(14px)}\n\n/* Bildrahmen mit Platzhalter-Zeichnung */\n.fig{position:relative;overflow:hidden;background:var(--ink-2);margin:0;isolation:isolate}\n.fig.light{background:var(--paper)}\n.fig .illu{width:100%;height:100%;transition:transform .9s var(--ease)}\na:hover .fig .illu,.fig:hover .illu{transform:scale(1.035)}\n.fig figcaption{position:absolute;left:12px;bottom:12px;right:12px;font-family:var(--f-mono);font-size:.68rem;letter-spacing:.05em;text-transform:uppercase;color:#E9E7DF;background:rgba(43,43,42,.72);padding:6px 9px;width:fit-content;max-width:calc(100% - 24px)}\n.fig.light figcaption{color:var(--ink);background:rgba(244,242,235,.85)}\n\n/* Prüfhinweise (nur Vorschau) */\n.tbc{display:none;font-family:var(--f-mono);font-size:.66rem;letter-spacing:.05em;text-transform:uppercase;background:var(--warn);color:#2A2000;padding:2px 7px;margin-left:8px;vertical-align:middle;white-space:nowrap;font-weight:500}\nbody.review .tbc{display:inline-block}\n.review-only{display:none}\nbody.review .review-only{display:block}\nbody:not(.review) .unconfirmed{display:none!important}\n.placeholder-box{border:1.5px dashed var(--warn);padding:28px;background:rgba(242,193,78,.08)}\n.dark .placeholder-box{background:rgba(242,193,78,.06)}\n\n/* ---------- Hero ---------- */\n.hero{position:relative;background:var(--ink);color:var(--ivory);overflow:hidden}\n.hero-img{position:absolute;inset:0;z-index:0}\n.hero-img .illu{width:100%;height:100%}\n.hero-img::after{content:\"\";position:absolute;inset:0;background:linear-gradient(90deg,rgba(43,43,42,.92) 0%,rgba(43,43,42,.72) 42%,rgba(43,43,42,.15) 100%)}\n.hero .wrap{position:relative;z-index:1;min-height:min(88vh,860px);display:flex;flex-direction:column;justify-content:flex-end;padding-block:clamp(56px,9vw,110px) clamp(40px,6vw,72px)}\n.hero h1{font-size:clamp(2.7rem,8.4vw,7.4rem);line-height:.93;letter-spacing:-.03em;font-weight:820;font-stretch:118%;margin:18px 0 26px;hyphens:manual}\n.hero h1 em{font-style:normal;color:var(--lime)}\n.hero .sub{font-size:clamp(1.08rem,1.6vw,1.35rem);max-width:44ch;color:#E2E0D8}\n.hero .ctas{display:flex;flex-wrap:wrap;gap:12px;margin-top:34px}\n.hero .meta{margin-top:30px;display:flex;flex-wrap:wrap;gap:8px 28px;color:var(--stone-d);border-top:1px solid var(--line-d);padding-top:18px}\n.hero .imgcap{position:absolute;right:var(--gut);top:24px;z-index:1}\n@media (max-width:700px){\n  .hero-img::after{background:linear-gradient(180deg,rgba(43,43,42,.35) 0%,rgba(43,43,42,.86) 45%,rgba(43,43,42,.97) 100%)}\n  .hero h1{font-stretch:108%}\n  .hero .wrap{min-height:auto;padding-top:180px}\n  .hero .ctas .btn{flex:1 1 220px;justify-content:space-between}\n}\n\n/* ---------- Einstieg nach Anliegen ---------- */\n.paths{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--line)}\n.path{display:grid;gap:16px;align-content:start;padding:clamp(28px,4vw,52px) clamp(0px,3vw,40px) clamp(28px,4vw,52px) 0;text-decoration:none;border-bottom:1px solid var(--line);position:relative}\n.path+.path{border-left:1px solid var(--line);padding-left:clamp(20px,3vw,40px)}\n.path .h3{font-size:clamp(1.5rem,2.6vw,2.2rem);font-stretch:110%;font-weight:760}\n.path .go{display:inline-flex;gap:10px;align-items:center;font-weight:600;margin-top:6px}\n.path .go .arr{width:18px;transition:transform .25s var(--ease)}\n.path:hover .go .arr{transform:translateX(5px)}\n.path:hover{background:linear-gradient(var(--paper),var(--paper)) no-repeat;}\n@media (max-width:760px){.paths{grid-template-columns:minmax(0,1fr)}.path+.path{border-left:0;padding-left:0}}\n\n/* ---------- Leistungswelten ---------- */\n.worlds{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:clamp(16px,2vw,28px);margin-top:clamp(40px,6vw,72px)}\n.world{grid-column:span 6;display:flex;flex-direction:column;background:var(--ink-2);color:var(--ivory);min-width:0}\n.world.w-a{grid-column:span 7;grid-row:span 2}\n.world.w-b{grid-column:span 5}\n.world.w-c{grid-column:span 5}\n.world.w-d{grid-column:1/-1;display:grid;grid-template-columns:7fr 5fr}\n.world .fig{aspect-ratio:16/10}\n.world.w-a .fig{aspect-ratio:auto;flex:1;min-height:340px}\n.world.w-d .fig{aspect-ratio:auto;min-height:320px}\n.world .body{padding:clamp(22px,2.6vw,34px);display:grid;gap:14px;align-content:start}\n.world .num{display:flex;justify-content:space-between;color:var(--stone-d)}\n.world .num b{color:var(--lime);font-weight:500}\n.world h3{font-size:clamp(1.5rem,2.4vw,2.1rem);line-height:1.08;font-weight:760;font-stretch:110%;letter-spacing:-.015em}\n.world ul{list-style:none;padding:0;margin:6px 0 0;display:flex;flex-wrap:wrap;gap:8px}\n.world li a{display:inline-block;border:1px solid var(--line-d);padding:7px 12px;text-decoration:none;font-size:.92rem;border-radius:2px}\n.world li a:hover{border-color:var(--lime);color:var(--lime)}\n.world .muted{color:var(--stone-d)}\n.world .tag{justify-self:start;background:var(--lime);color:var(--ink);padding:3px 8px}\n@media (max-width:900px){\n  .world,.world.w-a,.world.w-b,.world.w-c{grid-column:1/-1;grid-row:auto}\n  .world.w-d{grid-template-columns:minmax(0,1fr)}\n  .world.w-a .fig,.world.w-d .fig{min-height:0;aspect-ratio:16/10;flex:none}\n}\n\n/* ---------- Hauswartung Schwerpunkt ---------- */\n.focus .grid12>.l{grid-column:1/span 5}\n.focus .grid12>.r{grid-column:7/span 6}\n.checks{list-style:none;padding:0;margin:0;counter-reset:c}\n.checks li{display:grid;grid-template-columns:3.2rem 1fr;gap:4px 12px;padding:20px 0;border-top:1px solid var(--line-d)}\n.checks li:last-child{border-bottom:1px solid var(--line-d)}\n.checks li::before{counter-increment:c;content:counter(c,decimal-leading-zero);font-family:var(--f-mono);font-size:.78rem;color:var(--lime);padding-top:4px;grid-row:span 2}\n.checks b{font-weight:650;font-size:1.08rem}\n.checks span{color:var(--stone-d);font-size:.98rem}\n.focus .fig{aspect-ratio:4/5;margin-top:36px}\n@media (max-width:900px){.focus .grid12>.l,.focus .grid12>.r{grid-column:1/-1}.focus .fig{aspect-ratio:16/11}}\n\n/* ---------- Sanitär ---------- */\n.sani{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);gap:clamp(24px,5vw,80px);align-items:center}\n.sani .fig{aspect-ratio:1/1}\n.sani blockquote{margin:0;font-size:clamp(1.1rem,1.5vw,1.25rem);max-width:44ch;border-left:2px solid var(--ink);padding-left:18px}\n@media (max-width:860px){.sani{grid-template-columns:minmax(0,1fr)}.sani .fig{aspect-ratio:16/11}}\n\n/* ---------- Person ---------- */\n.person{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,7fr);gap:clamp(24px,5vw,80px)}\n.portrait{aspect-ratio:4/5;background:var(--ink-2);display:grid;place-items:center;color:var(--stone-d);text-align:center;padding:24px;border:1.5px dashed var(--warn)}\n.portrait .ini{font-family:var(--f-display);font-size:4.5rem;font-weight:800;font-stretch:120%;color:var(--ivory);line-height:1}\n.quals{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 32px;margin-top:36px}\n.quals div{padding:18px 0;border-top:1px solid var(--line-d)}\n.quals dt{color:var(--stone-d);margin-bottom:6px}\n.quals dd{margin:0;font-weight:600;font-size:1.06rem}\n@media (max-width:860px){.person{grid-template-columns:minmax(0,1fr)}.portrait{aspect-ratio:16/10}.quals{grid-template-columns:minmax(0,1fr)}}\nbody:not(.review) .portrait{display:none}\nbody:not(.review) .person{grid-template-columns:minmax(0,1fr)}\n\n/* ---------- Ablauf ---------- */\n.steps{list-style:none;padding:0;margin:clamp(36px,5vw,64px) 0 0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid var(--line)}\n.steps li{padding:26px 22px 8px 0;display:grid;gap:10px;align-content:start}\n.steps li+li{padding-left:22px;border-left:1px solid var(--line)}\n.steps .n{font-family:var(--f-display);font-size:3.2rem;font-weight:300;font-stretch:120%;line-height:1;color:var(--stone)}\n.steps b{font-size:1.12rem;font-weight:700}\n@media (max-width:860px){.steps{grid-template-columns:1fr 1fr}.steps li:nth-child(3){padding-left:0;border-left:0}.steps li:nth-child(n+3){border-top:1px solid var(--line)}}\n@media (max-width:520px){.steps{grid-template-columns:minmax(0,1fr)}.steps li,.steps li+li{padding-left:0;border-left:0;border-top:1px solid var(--line)}.steps li:first-child{border-top:0}}\n\n/* ---------- Region ---------- */\n.region{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:24px;align-items:end}\n.region .big{grid-column:1/span 8;font-family:var(--f-display);font-weight:800;font-stretch:122%;font-size:clamp(3rem,10vw,8.6rem);line-height:.88;letter-spacing:-.035em}\n.region .big span{display:block}\n.region .big span:last-child{color:transparent;-webkit-text-stroke:1.5px var(--ink)}\n.region .side{grid-column:9/-1;display:grid;gap:16px}\n.coords{display:grid;gap:6px;color:var(--stone)}\n@media (max-width:860px){.region .big,.region .side{grid-column:1/-1}}\n\n/* ---------- FAQ ---------- */\n.faq{border-top:1px solid var(--line)}\n.faq details{border-bottom:1px solid var(--line)}\n.faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;gap:24px;padding:22px 0;font-weight:650;font-size:1.1rem}\n.faq summary::-webkit-details-marker{display:none}\n.faq summary .pm{flex:none;width:22px;height:22px;position:relative;margin-top:3px}\n.faq summary .pm::before,.faq summary .pm::after{content:\"\";position:absolute;left:3px;right:3px;top:10px;height:1.5px;background:currentColor;transition:transform .25s var(--ease)}\n.faq summary .pm::after{transform:rotate(90deg)}\n.faq details[open] .pm::after{transform:rotate(0)}\n.faq details p{padding:0 0 24px;max-width:62ch;color:var(--stone)}\n.dark .faq,.dark .faq details{border-color:var(--line-d)}\n.dark .faq details p{color:var(--stone-d)}\n.faqwrap{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:clamp(24px,5vw,80px)}\n@media (max-width:860px){.faqwrap{grid-template-columns:minmax(0,1fr)}}\n\n/* ---------- Abschluss ---------- */\n.closing{text-align:left}\n.closing h2{font-size:clamp(2.6rem,8vw,7rem);line-height:.92;letter-spacing:-.03em;font-weight:820;font-stretch:118%;max-width:12ch}\n.closing .row{display:flex;flex-wrap:wrap;justify-content:space-between;gap:32px;align-items:end;margin-top:40px;border-top:1px solid var(--line-d);padding-top:32px}\n.contactline{display:grid;gap:4px}\n.contactline a{font-size:1.25rem;font-weight:600;text-decoration:none}\n.contactline a:hover{color:var(--lime)}\n\n/* ---------- Footer ---------- */\n.ftr{background:#222221;color:#CFCDC5;padding-block:64px calc(40px + env(safe-area-inset-bottom,0px));font-size:.95rem}\n.ftr .cols{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:32px}\n.ftr h4{font-family:var(--f-mono);font-size:.74rem;letter-spacing:.08em;text-transform:uppercase;color:var(--stone-d);font-weight:500;margin-bottom:14px}\n.ftr ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}\n.ftr a{text-decoration:none}.ftr a:hover{color:var(--lime)}\n.ftr .base{margin-top:48px;padding-top:20px;border-top:1px solid var(--line-d);display:flex;flex-wrap:wrap;gap:12px 24px;justify-content:space-between;color:var(--stone-d);font-size:.85rem}\n@media (max-width:860px){.ftr .cols{grid-template-columns:1fr 1fr}}\n@media (max-width:480px){.ftr .cols{grid-template-columns:minmax(0,1fr)}}\n\n/* ---------- Mobile Kontaktleiste ---------- */\n.mbar{display:none}\n@media (max-width:760px){\n  .mbar{display:grid;grid-template-columns:1fr 1fr;position:fixed;left:0;right:0;bottom:0;z-index:50;background:var(--ink);border-top:1px solid var(--line-d);padding:8px 12px calc(8px + env(safe-area-inset-bottom,0px));gap:8px}\n  .mbar a{justify-content:center;padding:13px 10px}\n  body.has-mbar{padding-bottom:calc(68px + env(safe-area-inset-bottom,0px))}\n  body.kb-open .mbar,body.route-offerte .mbar{display:none}\n  body.route-offerte.has-mbar{padding-bottom:0}\n}\n\n/* ---------- Unterseiten ---------- */\n.phead .wrap>*{min-width:0}\n@media (max-width:600px){.hdr .tbc{display:none!important}.h2,.phead h1,.cta-band h2{font-stretch:100%}.phead h1{font-size:2.1rem}}\n.phead{background:var(--ink);color:var(--ivory)}\n.phead .wrap{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(24px,4vw,64px);padding-block:clamp(48px,7vw,96px) clamp(40px,6vw,80px);align-items:end}\n.phead h1{font-size:clamp(2.3rem,5.6vw,4.9rem);line-height:.98;letter-spacing:-.025em;font-weight:800;font-stretch:114%;margin:6px 0 24px}\n.phead .fig{aspect-ratio:4/3}\n.crumbs{color:var(--stone-d);display:flex;flex-wrap:wrap;gap:8px}\n.crumbs a{text-decoration:none}.crumbs a:hover{color:var(--lime)}\n@media (max-width:860px){.phead .wrap{grid-template-columns:minmax(0,1fr)}.phead .fig{aspect-ratio:16/10}}\n.scope{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 clamp(24px,4vw,64px);margin-top:40px}\n.scope div{padding:22px 0;border-top:1px solid var(--line)}\n.scope b{display:block;font-size:1.12rem;margin-bottom:6px;font-weight:680}\n.scope p{color:var(--stone)}\n@media (max-width:760px){.scope{grid-template-columns:minmax(0,1fr)}}\n.side-l{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:clamp(24px,5vw,80px)}\n@media (max-width:860px){.side-l{grid-template-columns:minmax(0,1fr)}}\n.aud{list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:10px}\n.aud li{border:1px solid currentColor;padding:9px 14px;font-weight:500}\n.note{border-left:3px solid var(--ink);padding:14px 18px;background:var(--paper);max-width:70ch}\n.cta-band{display:flex;flex-wrap:wrap;gap:20px 40px;justify-content:space-between;align-items:center}\n.cta-band h2{font-size:clamp(1.8rem,3.6vw,2.9rem);font-weight:780;font-stretch:112%;line-height:1.04;letter-spacing:-.02em;max-width:20ch}\n.cta-band .acts{display:flex;flex-wrap:wrap;gap:12px}\n.related{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid var(--line)}\n.related a{padding:22px 18px 22px 0;text-decoration:none;display:grid;gap:6px;border-bottom:1px solid var(--line)}\n.related a+a{padding-left:18px;border-left:1px solid var(--line)}\n.related a:hover b{text-decoration:underline}\n@media (max-width:760px){.related{grid-template-columns:minmax(0,1fr)}.related a+a{padding-left:0;border-left:0}}\n\n/* ---------- Formular ---------- */\n.formwrap{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:clamp(24px,5vw,80px);align-items:start}\n@media (max-width:900px){.formwrap{grid-template-columns:minmax(0,1fr)}}\n.aside-contact{display:grid;gap:22px;position:sticky;top:100px}\n@media (max-width:900px){.aside-contact{position:static}}\n.copy-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}\n.copy-btn{background:none;border:1px solid var(--line);padding:4px 9px;font-size:.78rem;cursor:pointer;border-radius:2px}\n.copy-btn:hover{background:var(--paper)}\n.demo-flag{background:var(--warn);color:#2A2000;padding:14px 18px;font-size:.95rem;display:grid;gap:4px}\n.demo-flag b{font-weight:700}\n.form{background:#FBFAF6;border:1px solid var(--line);padding:clamp(20px,3.4vw,44px)}\n.progress{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:34px;list-style:none;padding:0}\n.progress li{border-top:3px solid var(--line);padding-top:10px;color:var(--stone);font-size:.9rem}\n.progress li b{display:block;font-family:var(--f-mono);font-size:.72rem;letter-spacing:.06em;font-weight:500}\n.progress li.done{border-top-color:var(--ink);color:var(--ink)}\n.progress li.cur{border-top-color:var(--lime);color:var(--ink);font-weight:600}\n.progress li.cur::after{content:\"\";display:block}\nfieldset{border:0;padding:0;margin:0 0 30px;min-width:0}\nlegend{font-weight:700;font-size:1.08rem;margin-bottom:12px;padding:0}\n.hint{color:var(--stone);font-size:.9rem;margin:-6px 0 12px}\n.opts{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,214px),1fr));gap:8px}\n.opt{position:relative}\n.opt input{position:absolute;opacity:0;inset:0;width:100%;height:100%;margin:0;cursor:pointer}\n.opt span{overflow-wrap:break-word;hyphens:auto;display:flex;gap:10px;align-items:center;border:1px solid var(--line);padding:13px 14px;background:#fff;min-height:52px;line-height:1.25;border-radius:2px;transition:border-color .15s}\n.opt span::before{content:\"\";flex:none;width:16px;height:16px;border:1.5px solid var(--stone);border-radius:50%}\n.opt input[type=checkbox]+span::before{border-radius:2px}\n.opt input:checked+span{border-color:var(--ink);background:var(--ink);color:var(--ivory)}\n.opt input:checked+span::before{background:var(--lime);border-color:var(--lime);box-shadow:inset 0 0 0 3px var(--ink)}\n.opt input:focus-visible+span{outline:3px solid var(--ink);outline-offset:2px}\n.opt:hover span{border-color:var(--ink)}\n.fields{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:18px 16px}\n.f{grid-column:span 6;display:grid;gap:6px;min-width:0}\n.f.s2{grid-column:span 2}.f.s3{grid-column:span 3}.f.s4{grid-column:span 4}\n@media (max-width:620px){.f.s2,.f.s3,.f.s4{grid-column:span 6}}\n.f label,.lbl{font-weight:600;font-size:.95rem}\n.f label small,.lbl small{font-weight:400;color:var(--stone)}\n.f input[type=text],.f input[type=email],.f input[type=tel],.f input[type=number],.f select,.f textarea{width:100%;border:1px solid #9AA19C;background:#fff;padding:12px 13px;border-radius:2px;font-size:1rem;min-height:48px}\n.f textarea{min-height:130px;resize:vertical}\n.f input:focus,.f select:focus,.f textarea:focus{outline:3px solid rgba(43,43,42,.35);outline-offset:0;border-color:var(--ink)}\n.f [aria-invalid=\"true\"]{border-color:var(--err);border-width:2px}\n.err{color:var(--err);font-size:.9rem;font-weight:600}\n.err:empty{display:none}\n.cond{grid-column:1/-1;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:18px 16px;padding:20px;border:1px solid var(--line);background:var(--ivory)}\n.cond .ctitle{grid-column:1/-1;font-family:var(--f-mono);font-size:.74rem;letter-spacing:.06em;text-transform:uppercase;color:var(--stone)}\n.upload{border:1.5px dashed #9AA19C;padding:20px;background:#fff;display:grid;gap:10px;justify-items:start}\n.upload.drag{border-color:var(--ink);background:var(--ivory)}\n.files{list-style:none;padding:0;margin:0;display:grid;gap:6px;width:100%}\n.files li{display:flex;justify-content:space-between;gap:10px;font-size:.9rem;border-bottom:1px solid var(--line);padding:6px 0}\n.files button{background:none;border:0;text-decoration:underline;cursor:pointer;color:var(--err);font-size:.85rem}\n.fnav{display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:center;border-top:1px solid var(--line);padding-top:24px;margin-top:8px}\n.errsum{border:2px solid var(--err);padding:14px 18px;margin-bottom:24px;background:#fff}\n.errsum ul{margin:6px 0 0;padding-left:20px}\n.errsum a{color:var(--err)}\n.privacy{font-size:.9rem;color:var(--stone);max-width:68ch}\n.result{border:1px solid var(--line);background:#fff;padding:clamp(20px,3vw,36px);display:grid;gap:16px}\n.result pre{white-space:pre-wrap;font-family:var(--f-mono);font-size:.8rem;background:var(--ivory);padding:14px;margin:0;max-height:360px;overflow:auto}\n.result .ok{font-size:1.15rem;font-weight:600}\n.failbox{border:2px solid var(--err);padding:14px 18px;background:#fff;margin-bottom:18px}\n\n/* ---------- Umsetzungsmappe / Rechtliches ---------- */\n.doc h2{font-size:clamp(1.6rem,3vw,2.3rem);font-weight:780;font-stretch:110%;margin:64px 0 18px;letter-spacing:-.015em}\n.doc h3{font-size:1.2rem;margin:32px 0 10px;font-weight:700}\n.doc p,.doc li{max-width:72ch}\n.doc p+p{margin-top:.8em}\n.doc ul,.doc ol{padding-left:1.2em}\n.doc li{margin:.35em 0}\n.tbl{overflow-x:auto;border:1px solid var(--line);background:#FBFAF6;margin:16px 0}\n.tbl table{border-collapse:collapse;width:100%;min-width:640px;font-size:.92rem}\n.tbl th,.tbl td{text-align:left;padding:10px 12px;border-bottom:1px solid var(--line);vertical-align:top}\n.tbl th{font-family:var(--f-mono);font-size:.72rem;letter-spacing:.05em;text-transform:uppercase;font-weight:500;color:var(--stone);background:var(--paper)}\n.tbl code,.doc code{font-family:var(--f-mono);font-size:.85em;background:var(--paper);padding:1px 5px}\n.doc pre{background:var(--ink);color:#E6E4DC;padding:18px;overflow-x:auto;font-size:.82rem;line-height:1.55;font-family:var(--f-mono)}\n.status{display:inline-block;font-family:var(--f-mono);font-size:.7rem;letter-spacing:.04em;padding:2px 7px;text-transform:uppercase;white-space:nowrap}\n.st-ok{background:var(--lime);color:var(--ink)}\n.st-open{background:var(--warn);color:#2A2000}\n.st-no{background:#E3C9C5;color:#5B1610}\n.missing{background:var(--warn);color:#2A2000;padding:0 5px;font-family:var(--f-mono);font-size:.85em}\n.toc{display:flex;flex-wrap:wrap;gap:8px;margin-top:24px}\n.toc a{border:1px solid var(--line-d);padding:7px 12px;text-decoration:none;font-size:.9rem}\n.toc a:hover{border-color:var(--lime);color:var(--lime)}\n\n@media (prefers-reduced-motion:reduce){\n  *,*::before,*::after{transition:none!important;animation:none!important;scroll-behavior:auto!important}\n  .js .reveal:not(.in){transform:none}\n  a:hover .fig .illu,.fig:hover .illu{transform:none}\n}\n\n/* ================= V2: Logo-Stil, Effekte ================= */\n.dark{background:var(--ink)}\n.logo{gap:12px}\n.logo-word{font-family:var(--f-display);font-size:1.02rem;letter-spacing:.24em;font-stretch:125%;font-weight:400;line-height:1;text-transform:uppercase;color:var(--ivory)}\n.logo-word b,.logo-word span{font-weight:400}\n.logo-mark{width:22px;height:30px}\n\n/* Header: transparent über dem Startbild, kompakt beim Scrollen */\n.hdr{transition:background .35s var(--ease),border-color .35s var(--ease),box-shadow .35s var(--ease)}\n.hdr .wrap{transition:min-height .35s var(--ease)}\nbody.route-start:not(.hdr-compact) .hdr{background:transparent;border-bottom-color:transparent}\nbody.hdr-compact .hdr{background:rgba(43,43,42,.88);-webkit-backdrop-filter:saturate(1.2) blur(14px);backdrop-filter:saturate(1.2) blur(14px);box-shadow:0 10px 30px -18px rgba(0,0,0,.6)}\nbody.hdr-compact .hdr .wrap{min-height:60px}\n.nav>a,.nav>div>button{position:relative;transition:color .25s var(--ease)}\n.nav>a::after,.nav>div>button::after{content:\"\";position:absolute;left:12px;right:12px;bottom:4px;height:1px;background:currentColor;transform:scaleX(0);transform-origin:left;transition:transform .3s var(--ease)}\n.nav>a:hover::after,.nav>a[aria-current=\"page\"]::after{transform:scaleX(1)}\n.dd-panel{border-radius:4px;box-shadow:0 30px 60px -30px rgba(0,0,0,.55)}\n\n/* Schaltflächen */\n.btn{border-radius:999px;padding:14px 22px 14px 24px;transition:background .25s var(--ease),color .25s var(--ease),box-shadow .3s var(--ease),transform .15s var(--ease),border-color .25s var(--ease);font-weight:600;letter-spacing:.01em}\n.btn:hover{background:var(--lime-press);box-shadow:0 0 0 1px rgba(241,230,210,.6),0 10px 34px -10px var(--glow)}\n.btn:active{transform:scale(.97)}\n.btn:focus-visible{outline:3px solid var(--lime);outline-offset:3px}\n.btn.inkb:hover{background:#44443F;box-shadow:0 12px 30px -14px rgba(0,0,0,.55)}\n.btn.inkb:focus-visible,.btn.ghost:focus-visible{outline-color:var(--ink)}\n.dark .btn.ghost:focus-visible,.hero .btn:focus-visible,.on-dark:focus-visible{outline-color:var(--lime)}\n.btn.ghost:hover{background:rgba(127,127,127,.14);box-shadow:none}\n.btn.sm{padding:10px 16px 10px 18px}\n\n/* Startbild */\n.hero{background:radial-gradient(ellipse 60% 80% at 74% 38%,#9C9B97 0%,#7E7E7C 38%,#6A6A69 68%,#575756 100%);margin-top:-72px}\n.hero::after{content:\"\";position:absolute;left:0;right:0;bottom:0;height:120px;background:linear-gradient(180deg,rgba(244,242,238,0),rgba(244,242,238,.0) 40%,rgba(43,43,42,.18));pointer-events:none}\n.hero-img::after{display:none}\n.hero-logo{position:absolute;right:-6%;top:50%;width:min(52%,860px);transform:translateY(-50%);z-index:0;-webkit-mask-image:radial-gradient(ellipse 50% 50% at 50% 50%,#000 55%,transparent 100%);mask-image:radial-gradient(ellipse 50% 50% at 50% 50%,#000 55%,transparent 100%)}\n.hero-logo img{width:100%;height:auto;display:block}\n.hero-glow{position:absolute;left:47.9%;top:31%;width:24%;height:52%;transform:translate(-50%,-50%);background:radial-gradient(ellipse 50% 50% at 50% 50%,rgba(250,242,226,.75),rgba(250,242,226,0) 70%);pointer-events:none;mix-blend-mode:screen;opacity:0;animation:lightOn 2.4s .4s var(--ease) forwards}\n@keyframes lightOn{0%{opacity:0}45%{opacity:.9}100%{opacity:.55}}\n.hero .wrap{min-height:min(92vh,900px);padding-top:calc(72px + clamp(48px,8vw,100px))}\n.hero h1{font-weight:300;font-stretch:122%;letter-spacing:-.01em;line-height:.98;font-size:clamp(2.5rem,5.1vw,4.8rem);color:#F7F3EB;text-transform:none}\n@media (min-width:901px){.hero .wrap>*{max-width:min(62%,780px)}}\n.hero h1 em{color:#F7F3EB;font-weight:760;display:inline-block}\n.hero .sub{color:#F1EDE5;max-width:42ch}\n.hero .kicker{color:#F1E9DA;letter-spacing:.24em}\n.hero .meta{color:#ECE8E0;border-top-color:rgba(255,255,255,.28)}\n.hero .tagline{font-weight:300;letter-spacing:.32em;font-stretch:120%;color:#ECE6DA;font-size:.95rem}\n.hero .rise{animation:rise .9s var(--ease) both}\n.hero .rise.d1{animation-delay:.08s}.hero .rise.d2{animation-delay:.22s}.hero .rise.d3{animation-delay:.36s}.hero .rise.d4{animation-delay:.5s}.hero .rise.d5{animation-delay:.64s}\n@keyframes rise{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}\n@media (max-width:900px){\n  .hero{background:radial-gradient(ellipse 90% 45% at 50% 22%,#9C9B97 0%,#7E7E7C 45%,#626261 100%)}\n  .hero-logo{position:relative;right:auto;top:auto;transform:none;width:118%;margin:0 -9% -14%;}\n  .hero-glow{display:none}\n  .hero .wrap{min-height:auto;padding-top:24px}\n  .hero-stage{padding-top:72px}\n}\n@media (min-width:901px){.hero-stage{position:absolute;inset:0}}\n\n/* Übergang zwischen Abschnitten */\n.sec.dark+.sec:not(.dark),.dark+.sec:not(.dark){position:relative}\n.fade-in-top{position:relative}\n.fade-in-top::before{content:\"\";position:absolute;left:0;right:0;top:0;height:90px;background:linear-gradient(180deg,rgba(43,43,42,.08),rgba(43,43,42,0));pointer-events:none}\n\n/* Scroll-Einblendung (nur Elemente unterhalb des ersten Bildschirms) */\n.js .reveal.pre{opacity:0;transform:translateY(28px)}\n.reveal{transition:opacity .8s var(--ease),transform .8s var(--ease)}\n.js .reveal:not(.in){transform:none}\n.js .reveal.pre:not(.in){transform:translateY(28px)}\n\n/* Leistungskarten */\n.svc-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:clamp(14px,1.8vw,24px);margin-top:clamp(28px,4vw,48px)}\n.svc{grid-column:span 4;display:flex;flex-direction:column;text-decoration:none;background:#FBFAF7;border:1px solid var(--line);border-radius:6px;overflow:hidden;transition:background .35s var(--ease),border-color .35s var(--ease),box-shadow .4s var(--ease),transform .4s var(--ease);min-width:0}\n.svc:hover,.svc:focus-visible{background:#fff;border-color:rgba(43,43,42,.38);box-shadow:0 24px 50px -32px rgba(0,0,0,.45);transform:translateY(-3px)}\n.svc .fig{aspect-ratio:16/10;border-radius:0}\n.svc .b{padding:22px 24px 24px;display:grid;gap:10px;flex:1;align-content:start}\n.svc .k{color:var(--stone)}\n.svc h3{font-size:clamp(1.25rem,1.7vw,1.5rem);font-weight:650;font-stretch:112%;letter-spacing:-.005em;line-height:1.15}\n.svc p{color:var(--stone);font-size:.98rem}\n.svc .go{margin-top:auto;padding-top:10px;display:inline-flex;gap:10px;align-items:center;font-weight:600}\n.svc .go .arr{width:18px;transition:transform .3s var(--ease)}\n.svc:hover .go .arr,.svc:focus-visible .go .arr{transform:translateX(6px)}\n.svc:hover .fig .illu{transform:scale(1.045)}\n.svc.wide{grid-column:span 8;flex-direction:row}\n.svc.wide .fig{aspect-ratio:auto;flex:0 0 46%}\n@media (max-width:980px){.svc{grid-column:span 6}.svc.wide{grid-column:1/-1}}\n@media (max-width:640px){.svc,.svc.wide{grid-column:1/-1;flex-direction:column}.svc.wide .fig{aspect-ratio:16/10;flex:none}.svc:hover{transform:none}}\n.grp{display:flex;gap:14px;align-items:baseline;margin-top:clamp(40px,5vw,64px);border-top:1px solid var(--line);padding-top:16px}\n.grp b{font-weight:600;letter-spacing:.18em;font-size:.78rem;text-transform:uppercase;font-stretch:115%}\n\n/* Schwerpunkt Hauswartung */\n.feature{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,6fr);gap:0;background:var(--ink);color:var(--ivory);border-radius:6px;overflow:hidden;margin-top:clamp(28px,4vw,48px)}\n.feature .fig{min-height:520px;border-radius:0}\n.feature .b{padding:clamp(28px,4vw,56px);display:grid;gap:18px;align-content:center}\n.feature h3{font-size:clamp(1.9rem,3.4vw,3rem);font-weight:300;font-stretch:118%;line-height:1.04}\n.feature h3 b{font-weight:720}\n.feature .checks li{padding:12px 0}\n@media (max-width:900px){.feature{grid-template-columns:minmax(0,1fr)}.feature .fig{min-height:0;aspect-ratio:16/10}}\n\n/* Überschriften im Logo-Stil */\n.h2{font-weight:300;font-stretch:120%;letter-spacing:-.01em}\n.h2 b{font-weight:720}\n.phead h1{font-weight:300;font-stretch:120%}\n.phead h1 b{font-weight:720}\n.closing h2{font-weight:300;font-stretch:122%}\n.closing h2 b{font-weight:740}\n.region .big{font-weight:300;font-stretch:125%;letter-spacing:.02em;text-transform:uppercase;font-size:clamp(2.6rem,9vw,7.8rem)}\n.region .big span:last-child{-webkit-text-stroke:1.2px var(--ink)}\n.closing{background:radial-gradient(ellipse 50% 70% at 85% 30%,#4A4A48 0%,var(--ink) 70%)}\n\n/* Bildrahmen */\n.fig{border-radius:4px}\n.fig .illu{will-change:transform}\n[data-parallax]{will-change:transform}\n\n/* Vorher-nachher */\n.ba{position:relative;aspect-ratio:16/9;overflow:hidden;border-radius:6px;background:var(--ink-2);user-select:none;--pos:50%}\n.ba .lay{position:absolute;inset:0}\n.ba .lay.after{clip-path:inset(0 0 0 var(--pos))}\n.ba .lab{position:absolute;top:14px;padding:5px 10px;background:rgba(43,43,42,.75);color:#F4F2EE;font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;border-radius:999px}\n.ba .lab.l{left:14px}.ba .lab.r{right:14px}\n.ba .handle{position:absolute;top:0;bottom:0;left:var(--pos);width:2px;background:#F4F2EE;transform:translateX(-1px);pointer-events:none;box-shadow:0 0 18px rgba(241,230,210,.6)}\n.ba .handle::after{content:\"↔\";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:44px;height:44px;border-radius:50%;background:#F4F2EE;color:var(--ink);display:grid;place-items:center;font-weight:700}\n.ba input[type=range]{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:ew-resize;margin:0}\n.ba input[type=range]:focus-visible+.handle::after{outline:3px solid var(--lime);outline-offset:3px}\n\n/* Formular V2 */\n.form{border-radius:6px}\n.opt span{border-radius:6px;transition:border-color .2s,background .2s,color .2s}\n.opt input:checked+span{background:var(--ink);color:var(--ivory)}\n.opt input:checked+span::before{background:var(--lime);border-color:var(--lime);box-shadow:inset 0 0 0 3px var(--ink)}\n.f input[type=text],.f input[type=email],.f input[type=tel],.f select,.f textarea{border-radius:4px}\n.fgroup{display:grid;gap:18px;padding-bottom:28px;margin-bottom:28px;border-bottom:1px solid var(--line)}\n.fgroup>h3{display:flex;gap:12px;align-items:baseline;font-size:1.15rem;font-weight:650;font-stretch:110%}\n.fgroup>h3 span{font-size:.74rem;letter-spacing:.18em;color:var(--stone);font-weight:500}\n.chk{display:flex;gap:10px;align-items:flex-start;cursor:pointer;font-weight:500}\n.chk input{width:20px;height:20px;margin-top:2px;accent-color:var(--ink)}\n\n@media (prefers-reduced-motion:reduce){\n  .hero .rise,.hero-glow{animation:none!important;opacity:1}\n  .hero-glow{opacity:.55}\n  .js .reveal.pre{opacity:1;transform:none}\n  [data-parallax]{transform:none!important}\n  .svc:hover{transform:none}\n}\n\n.light-quals div{border-top-color:var(--line)}\n.light-quals dt{color:var(--stone)}\n.svc.full{grid-column:1/-1;flex-direction:row}\n.svc.full .fig{aspect-ratio:auto;flex:0 0 42%;min-height:300px}\n@media (max-width:640px){.svc.full{flex-direction:column}.svc.full .fig{aspect-ratio:16/10;flex:none;min-height:0}}\n.mnav .logo-word{font-size:.95rem}\n.ftr .logo-word{font-size:1.05rem}\n\n/* ================= V3: Farben und Logo aus den Original-Logodateien ================= */\n:host{\n  --ink:#3B3A39;        /* Text, dunkler als Wortmarke (AA) */\n  --ink-2:#4A4846;\n  --logo-grey:#5E5E5E;  /* Wortmarke IMMOREADY */\n  --steel:#9A9798;      /* grauer Balken */\n  --lime:#DCC5A8;       /* beiger Balken – Akzent */\n  --lime-press:#E7D6C0;\n  --sand-d:#B39674;\n  --ivory:#FCF8F5;      /* Logo-Hintergrund */\n  --paper:#F3EDE6;\n  --stone:#68645F;      /* Nebentext auf Hell (AA) */\n  --stone-d:#D3CCC4;    /* Nebentext auf Dunkel (AA) */\n  --line:rgba(59,58,57,.14);\n  --line-d:rgba(252,248,245,.16);\n  --graphite:#302E2C;\n  --glow:rgba(220,197,168,.55);\n  --shadow:0 1px 2px rgba(59,58,57,.06),0 18px 40px -28px rgba(59,58,57,.35);\n}\nbody{background:var(--ivory);color:var(--ink)}\n.dark,.feature,.closing{background:var(--graphite)}\n.closing{background:radial-gradient(ellipse 55% 70% at 88% 20%,#45413D 0%,var(--graphite) 70%)}\n.paper{background:var(--paper)}\n.muted{color:var(--stone)}\n.dark .muted,.feature .muted{color:var(--stone-d)}\n\n/* Header hell mit Original-Logo */\n.hdr,body.route-start:not(.hdr-compact) .hdr{background:rgba(252,248,245,.96);color:var(--ink);border-bottom:1px solid var(--line)}\nbody.hdr-compact .hdr{background:rgba(252,248,245,.9);box-shadow:0 10px 30px -22px rgba(59,58,57,.5)}\n.hdr .wrap{min-height:112px;gap:28px}\nbody.hdr-compact .hdr .wrap{min-height:74px}\n.logo img{height:96px;width:auto;display:block;transition:height .35s var(--ease)}\nbody.hdr-compact .logo img{height:56px}\n.logo{padding:6px 0}\n.nav>a,.nav>div>button{color:var(--ink);font-weight:500}\n.nav>a:hover,.nav>div>button:hover,.nav [aria-current=\"page\"]{color:var(--ink)}\n.burger{border-color:var(--line);color:var(--ink)}\n.hdr .tbc{display:none!important}\n@media (max-width:980px){.hdr .wrap{min-height:84px}.logo img{height:62px}body.hdr-compact .logo img{height:48px}body.hdr-compact .hdr .wrap{min-height:64px}}\n.mnav[data-open=\"true\"]{background:var(--ivory)!important;color:var(--ink)!important}\n.mnav li a{border-bottom-color:var(--line)!important}\n.mnav .sub a{color:var(--stone)!important}\n.mnav .mtop img{height:56px;width:auto}\n.mnav .burger{color:var(--ink)}\n\n/* Schaltflächen */\n.btn{background:var(--ink);color:var(--ivory);border-color:var(--ink)}\n.btn:hover{background:#262524;box-shadow:0 14px 30px -14px rgba(38,37,36,.6)}\n.btn:focus-visible{outline:3px solid var(--sand-d);outline-offset:3px}\n.btn.ghost{background:transparent;color:var(--ink);border-color:rgba(59,58,57,.45)}\n.btn.ghost:hover{background:rgba(220,197,168,.22);border-color:var(--ink);box-shadow:none}\n.btn.sand,.dark .btn:not(.ghost),.feature .btn:not(.ghost),.closing .btn:not(.ghost){background:var(--lime);color:var(--ink);border-color:var(--lime)}\n.btn.sand:hover,.dark .btn:not(.ghost):hover,.feature .btn:not(.ghost):hover{background:var(--lime-press);box-shadow:0 0 0 1px rgba(220,197,168,.5),0 12px 34px -12px var(--glow)}\n.dark .btn.ghost,.feature .btn.ghost,.closing .btn.ghost{color:var(--ivory);border-color:rgba(252,248,245,.5)}\n.dark .btn.ghost:hover,.feature .btn.ghost:hover{background:rgba(252,248,245,.1)}\n.dark .btn:focus-visible,.feature .btn:focus-visible{outline-color:var(--lime)}\n.btn.inkb{background:var(--ink);color:var(--ivory)}\n.lnk{border-bottom-color:var(--sand-d)}\n\n/* Erster Bildschirm (hell) */\n.hero{background:linear-gradient(180deg,var(--ivory) 0%,var(--paper) 100%);color:var(--ink);margin-top:0;overflow:hidden}\n.hero::after{display:none}\n.hero .wrap{min-height:auto;display:grid;grid-template-columns:minmax(0,6fr) minmax(0,6fr);gap:clamp(28px,4vw,64px);align-items:center;padding-top:clamp(40px,5vw,72px);padding-bottom:clamp(48px,6vw,88px)}\n@media (min-width:901px){.hero .wrap>*{max-width:none}}\n.hero .copy{position:relative;padding-left:34px}\n.hero .bars{position:absolute;left:0;top:6px;width:20px;height:150px}\n.hero .bars i{position:absolute;top:0;width:5px;height:118px;background:var(--lime)}\n.hero .bars i+i{left:13px;top:22px;background:var(--steel)}\n.hero .kicker{color:var(--stone);letter-spacing:.22em}\n.hero h1{color:var(--ink);font-weight:300;font-stretch:118%;font-size:clamp(2.4rem,4.6vw,4.4rem);line-height:1.02;margin:16px 0 22px}\n.hero h1 span.l1{color:var(--logo-grey)}\n.hero h1 em{color:var(--ink);font-weight:720;font-style:normal}\n.hero .sub{color:var(--ink);font-size:clamp(1.05rem,1.4vw,1.25rem);max-width:40ch}\n.hero .ctas{margin-top:30px}\n.hero .meta{color:var(--stone);border-top:1px solid var(--line);margin-top:30px;padding-top:16px;align-items:center}\n.hero .meta a{color:var(--ink)}\n.hero .phone{display:inline-flex;gap:10px;align-items:center;font-weight:600;text-decoration:none;font-size:1.05rem}\n.hero .phone svg{width:18px;height:18px}\n.hero-photo{position:relative;aspect-ratio:5/4;border-radius:4px;overflow:hidden;box-shadow:0 40px 80px -50px rgba(59,58,57,.55)}\n.hero-photo .illu{position:absolute;inset:-6% 0;height:112%}\n.hero-photo figcaption{z-index:2}\n.hero-photo::after{content:\"\";position:absolute;inset:0;border:1px solid rgba(59,58,57,.08);border-radius:4px;pointer-events:none}\n@media (max-width:900px){\n  .hero .wrap{grid-template-columns:minmax(0,1fr);padding-top:28px}\n  .hero .copy{padding-left:22px}\n  .hero .bars{width:14px;height:96px}.hero .bars i{width:4px;height:78px}.hero .bars i+i{left:9px;top:14px}\n  .hero-photo{aspect-ratio:4/3}\n  .hero .ctas .btn{flex:1 1 220px;justify-content:space-between}\n}\n.hero .rise{animation:rise .8s var(--ease) both}\n.hero-photo.rise{animation:riseImg 1.1s .2s var(--ease) both}\n@keyframes riseImg{from{opacity:0;transform:scale(1.02)}to{opacity:1;transform:none}}\n\n/* Leistungen V3 – unterschiedliche Gewichtung */\n.svc{position:relative;background:#FFFDFB;border-color:var(--line);box-shadow:none}\n.svc:hover,.svc:focus-within{background:#fff;border-color:rgba(179,150,116,.7);box-shadow:var(--shadow);transform:translateY(-3px)}\n.svc h3 a{text-decoration:none;color:inherit}\n.svc h3 a::after{content:\"\";position:absolute;inset:0;z-index:1}\n.svc .acts{display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center;margin-top:auto;padding-top:12px}\n.svc .acts a{position:relative;z-index:2}\n.svc .more{display:inline-flex;gap:8px;align-items:center;font-weight:600;text-decoration:none}\n.svc .more .arr{width:18px;transition:transform .3s var(--ease)}\n.svc:hover .more .arr,.svc:focus-within .more .arr{transform:translateX(6px)}\n.svc .ask{font-size:.92rem;color:var(--stone);text-decoration:underline;text-decoration-color:var(--sand-d);text-underline-offset:4px}\n.svc .ask:hover{color:var(--ink)}\n.svc .go{display:none}\n.svc.tall{grid-column:span 7;grid-row:span 2}\n.svc.tall .fig{aspect-ratio:auto;flex:1;min-height:340px}\n.svc.row{grid-column:span 5;flex-direction:row}\n.svc.row .fig{aspect-ratio:auto;flex:0 0 40%;min-height:200px}\n.svc.text{background:var(--graphite);color:var(--ivory);border-color:transparent}\n.svc.text p,.svc.text .k{color:var(--stone-d)}\n.svc.text .ask{color:var(--stone-d)}\n.svc.text:hover{background:#3A3735}\n.svc.text .b{padding:clamp(24px,3vw,36px)}\n@media (max-width:980px){.svc.tall,.svc.row{grid-column:1/-1;grid-row:auto}.svc.tall .fig{min-height:0;aspect-ratio:16/10;flex:none}}\n@media (max-width:640px){.svc.row{flex-direction:column}.svc.row .fig{flex:none;aspect-ratio:16/10;min-height:0}}\n.grp{border-top-color:var(--line)}\n.grp b{color:var(--ink)}\n.fig{background:#46433F}\n\n/* Sanitär hell */\n.sani-band{background:var(--paper)}\n.sani-band .sani{grid-template-columns:minmax(0,6fr) minmax(0,5fr)}\n.sani-band .fig{box-shadow:var(--shadow)}\n@media (max-width:860px){.sani-band .sani{grid-template-columns:minmax(0,1fr)}}\n\n/* Ansprechpartner */\n.brandpic{aspect-ratio:4/5;border-radius:4px;overflow:hidden;position:relative;box-shadow:var(--shadow)}\n.brandpic img{width:100%;height:100%;object-fit:cover;object-position:50% 40%;transition:transform .9s var(--ease)}\n.brandpic:hover img{transform:scale(1.03)}\n.brandpic figcaption{position:absolute;left:12px;bottom:12px;right:12px;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:var(--ink);background:rgba(252,248,245,.88);padding:6px 9px;width:fit-content}\n.quals.two{grid-template-columns:1fr 1fr}\n.quals.two dd{font-size:1.2rem;font-stretch:108%}\n@media (max-width:860px){.brandpic{aspect-ratio:16/10}}\nbody:not(.review) .person{grid-template-columns:minmax(0,4fr) minmax(0,7fr)}\n@media (max-width:860px){body:not(.review) .person{grid-template-columns:minmax(0,1fr)}}\n\n/* Abschluss mit Formular */\n.closing .cgrid{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(28px,5vw,80px);align-items:start;margin-top:40px}\n.closing h2{font-size:clamp(2.3rem,5.4vw,4.6rem);max-width:14ch;line-height:1}\n.closing .form{box-shadow:0 40px 80px -40px rgba(0,0,0,.6);color:var(--ink)}\n.closing .contactline a{color:var(--ivory)}\n.closing .contactline a:hover{color:var(--lime)}\n@media (max-width:900px){.closing .cgrid{grid-template-columns:minmax(0,1fr)}}\n.closing .demo-flag{margin-bottom:16px}\n\n/* Footer hell mit Logo */\n.ftr{background:var(--paper);color:var(--ink);border-top:1px solid var(--line)}\n.ftr h4{color:var(--stone)}\n.ftr a:hover{color:var(--ink);text-decoration:underline;text-decoration-color:var(--sand-d)}\n.ftr .base{border-top-color:var(--line);color:var(--stone)}\n.ftr .flogo{height:120px;width:auto}\n.ftr .review-only{color:var(--stone)!important}\n\n/* Unterseiten-Kopf */\n.phead{background:linear-gradient(180deg,var(--ivory),var(--paper));color:var(--ink);border-bottom:1px solid var(--line)}\n.phead h1{color:var(--ink)}\n.phead .lead,.phead p[style*=\"DAD8D0\"]{color:var(--ink)!important}\n.phead .crumbs{color:var(--stone)}\n.phead .mono[style*=\"var(--lime)\"]{color:var(--stone)!important}\n.phead .fig{box-shadow:var(--shadow)}\n.phead .btn.ghost{color:var(--ink);border-color:rgba(59,58,57,.45)}\n.phead .btn:not(.ghost){background:var(--ink);color:var(--ivory);border-color:var(--ink)}\n\n/* Mobile Leiste */\n@media (max-width:760px){.mbar{background:rgba(252,248,245,.97);border-top:1px solid var(--line)}.mbar .btn.ghost{color:var(--ink)!important;border-color:rgba(59,58,57,.45)}}\n\n/* Kontrast in Prüfhinweisen */\n.checks li{border-top-color:var(--line-d)}\n.checks li::before{color:var(--lime)}\n.opt input:checked+span::before{background:var(--lime);border-color:var(--lime)}\n.result blockquote{border-left-color:var(--lime)!important}\n\n\n.closing{color:var(--ivory)}\n.closing h2{color:var(--ivory)}\n.form .btn.ghost{color:var(--ink)!important;border-color:rgba(59,58,57,.45)!important;background:transparent}\n.form .btn.ghost:hover{background:rgba(220,197,168,.22)!important}\n.form{color:var(--ink)}\n.privacy{grid-column:1/-1}\n.closing .muted{color:var(--stone-d)}\n@media (max-width:620px){.opts{grid-template-columns:repeat(2,minmax(0,1fr))}.opt span{padding:11px 10px;font-size:.93rem;gap:8px}}\n\n/* ================= V4: Original-Logo unverändert, ruhigere Komposition ================= */\n.hdr .wrap{min-height:132px}\n.logo{padding:10px 0;flex:none}\n.logo img{height:112px;width:auto;image-rendering:auto}\nbody.hdr-compact .hdr .wrap{min-height:84px}\nbody.hdr-compact .logo img{height:68px}\n.hdr-call{display:none;width:46px;height:46px;border:1px solid var(--line);border-radius:999px;align-items:center;justify-content:center;color:var(--ink);margin-left:auto;flex:none;transition:background .2s,border-color .2s}\n.hdr-call:hover{background:var(--paper);border-color:var(--ink)}\n.hdr-call svg{width:20px;height:20px}\n@media (max-width:980px){\n  .hdr .wrap{min-height:104px;gap:12px}\n  .logo img{height:88px}\n  body.hdr-compact .hdr .wrap{min-height:74px}\n  body.hdr-compact .logo img{height:60px}\n  .hdr-call{display:inline-flex}\n  .burger{margin-left:0;flex:none}\n}\n@media (max-width:360px){.logo img{height:76px}}\n.mnav .mtop{min-height:96px}\n.mnav .mtop img{height:84px;width:auto}\n.ftr .flogo{height:150px;width:auto;display:block}\n.logo img,.ftr .flogo,.mnav .mtop img{max-width:none}\n\n/* Icons */\n.ico{display:inline-flex;width:22px;height:22px;flex:none}\n.ico svg,i[data-icon] svg{width:100%;height:100%;display:block}\n.k{display:flex;gap:10px;align-items:center}\n.svc .k{color:var(--stone)}\n.svc .k .ico{color:var(--sand-d)}\n.svc.text .k .ico{color:var(--lime)}\n.svc .ask{display:inline-flex;gap:8px;align-items:center;text-decoration:none;font-weight:600;color:var(--ink);font-size:.95rem;border-bottom:1px solid var(--sand-d);padding-bottom:2px}\n.svc .ask .arr{width:16px;transition:transform .3s var(--ease)}\n.svc .ask:hover .arr{transform:translateX(5px)}\n.svc.text .ask{color:var(--ivory);border-bottom-color:var(--lime)}\n.svc .more{color:var(--stone);font-weight:500}\n.sani-band .k .ico,.phead .k .ico{color:var(--sand-d)}\n.phead .k{color:var(--stone)}\n\n/* Erster Bildschirm ruhiger und stärker */\n.hero h1{font-size:clamp(2.5rem,5.2vw,5.2rem);letter-spacing:-.015em}\n.hero h1 em{white-space:nowrap}\n.hero .copy{padding-left:0}\n.hero .sub{max-width:38ch}\n.hero .meta{gap:6px 18px}\n@media (max-width:420px){.hero h1 em{white-space:normal}}\n\n/* Kontaktkarte Ansprechpartner */\n.vcard{background:#FFFDFB;border:1px solid var(--line);border-radius:6px;padding:clamp(24px,3vw,40px);display:grid;gap:10px;align-content:start;box-shadow:var(--shadow);position:relative}\n.vcard::before{content:\"\";position:absolute;left:0;top:28px;bottom:28px;width:3px;background:var(--lime);border-radius:0 2px 2px 0}\n.vcard .vn{font-size:clamp(1.8rem,3vw,2.4rem);font-weight:700;font-stretch:112%;line-height:1.05;margin-top:6px}\n.vq{list-style:none;padding:16px 0;margin:8px 0 4px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);display:grid;gap:10px}\n.vq li{display:flex;gap:10px;align-items:center;font-weight:600}\n.vq i{width:18px;height:18px;color:var(--sand-d);flex:none}\n.vc{display:grid;gap:10px;margin-top:6px}\n.vc a{display:inline-flex;gap:10px;align-items:center;text-decoration:none;font-weight:600;overflow-wrap:anywhere}\n.vc a:hover{text-decoration:underline;text-decoration-color:var(--sand-d)}\n.vc i{width:18px;height:18px;flex:none;color:var(--stone)}\n.vnote{font-size:.85rem;color:var(--stone);border:1px dashed var(--warn);padding:8px 10px;margin-top:8px}\n.person{align-items:start}\n\n.hdr,body.route-start:not(.hdr-compact) .hdr{background:var(--ivory)}\n.hdr-call i{width:20px;height:20px;display:block}\n\n.svc.text .more{color:var(--stone-d)}\n.svc.tall .b{flex:none}\n.grp{flex-wrap:wrap;gap:6px 14px}\n@media (max-width:640px){.grp{flex-direction:column;align-items:flex-start}}\n\n/* ================= V5: Architektur-Inszenierung ================= */\n:host{--e-out:cubic-bezier(.22,.8,.24,1);--t-s:220ms;--t-l:700ms}\n.display{font-family:var(--f-display);font-weight:300;font-stretch:118%;font-size:clamp(2.3rem,5.4vw,4.9rem);line-height:.98;letter-spacing:-.02em;color:var(--ink);text-wrap:balance}\n.display b{font-weight:740}\n.num{display:flex;gap:14px;align-items:baseline;font-size:.78rem;letter-spacing:.2em;text-transform:uppercase;font-weight:500;font-stretch:115%;color:var(--stone);margin-bottom:22px}\n.num span{font-variant-numeric:tabular-nums;color:var(--sand-d);font-weight:600;letter-spacing:.08em;position:relative;padding-right:46px}\n.num span::after{content:\"\";position:absolute;right:8px;top:50%;width:28px;height:1px;background:currentColor}\n.lead{font-size:clamp(1.08rem,1.35vw,1.25rem);line-height:1.6;max-width:46ch}\n.row-ctas{display:flex;flex-wrap:wrap;gap:14px 26px;align-items:center;margin-top:30px}\n.tlink{display:inline-flex;gap:10px;align-items:center;font-weight:600;text-decoration:none;color:var(--ink);position:relative;padding:6px 0}\n.tlink::after{content:\"\";position:absolute;left:0;right:26px;bottom:2px;height:1px;background:var(--sand-d);transform-origin:left;transition:transform var(--t-s) var(--e-out)}\n.tlink:hover::after{transform:scaleX(1.12)}\n.tlink .arr{width:16px;transition:transform var(--t-s) var(--e-out)}\n.tlink:hover .arr{transform:translateX(5px)}\n.tlink.light{color:var(--ivory)}\n.btn{transition:background var(--t-s) var(--e-out),color var(--t-s),box-shadow 300ms var(--e-out),transform 180ms var(--e-out),border-color var(--t-s)}\n.btn .arr{transition:transform var(--t-s) var(--e-out)}\n.btn.big{padding:18px 28px 18px 30px;font-size:1.1rem}\n\n/* --- Erster Bildschirm --- */\n.hx{position:relative;background:var(--ivory);overflow:hidden}\n.hx-grid{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);min-height:min(84vh,860px);max-width:1600px;margin-inline:auto}\n.hx-copy{padding:clamp(40px,6vw,96px) clamp(16px,4vw,64px) clamp(80px,8vw,120px) max(var(--gut),calc((100vw - var(--max))/2 + var(--gut)));display:flex;flex-direction:column;justify-content:center;position:relative;z-index:1}\n@media (min-width:1600px){.hx-copy{padding-left:calc((1600px - var(--max))/2 + var(--gut))}}\n.hx-kicker{color:var(--stone);letter-spacing:.24em;margin-bottom:24px}\n.hx-title{font-weight:300;font-stretch:120%;font-size:clamp(2.6rem,5.6vw,5.6rem);line-height:.98;letter-spacing:-.025em;color:var(--logo-grey);margin:0 0 26px}\n.hx-title b{font-weight:760;color:var(--ink)}\n.ln{display:block;overflow:hidden;padding-bottom:.06em}\n.ln>span{display:inline-block}\n.hx-sub{font-size:clamp(1.1rem,1.5vw,1.3rem);max-width:34ch;line-height:1.55}\n.hx-ctas{display:flex;flex-wrap:wrap;gap:12px;margin-top:34px}\n.hx-call{display:inline-flex;gap:12px;align-items:center;margin-top:34px;padding-top:22px;border-top:1px solid var(--line);text-decoration:none;color:var(--ink);font-weight:650;font-size:1.1rem;align-self:flex-start;min-width:min(100%,320px)}\n.hx-call i{width:20px;height:20px;color:var(--sand-d)}\n.hx-call small{font-weight:400;color:var(--stone);font-size:.85rem;letter-spacing:.14em;text-transform:uppercase}\n.hx-media{position:relative;margin:0;overflow:hidden;background:#E6E0D7}\n.hx-img{position:absolute;inset:0}\n.hx-img .illu{width:100%;height:100%}\n.hx-media figcaption{position:absolute;left:16px;bottom:16px;z-index:2;font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;background:rgba(252,248,245,.9);padding:6px 10px;color:var(--ink);max-width:calc(100% - 32px)}\n.hx-scroll{position:absolute;left:max(var(--gut),calc((100vw - var(--max))/2 + var(--gut)));bottom:26px;display:flex;align-items:center;gap:14px;text-decoration:none;color:var(--stone);z-index:2}\n.hx-scroll i{display:block;width:1px;height:42px;background:linear-gradient(var(--sand-d),transparent);transform-origin:top}\n.hx-scroll:hover{color:var(--ink)}\n/* Einstiegsanimation: total ca. 1 s */\n.js .hx-img{animation:hxZoom 1s var(--e-out) both}\n.js .hx-title .ln>span{animation:lineUp .6s var(--e-out) both;animation-delay:var(--d)}\n.js .hx-in{animation:fadeUp .55s var(--e-out) both;animation-delay:var(--d)}\n.js .hx-scroll i{animation:drawLine .6s .5s var(--e-out) both}\n@keyframes hxZoom{from{transform:scale(1.04)}to{transform:none}}\n@keyframes lineUp{from{transform:translateY(105%)}to{transform:none}}\n@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}\n@keyframes drawLine{from{transform:scaleY(0)}to{transform:none}}\n@media (max-width:900px){\n  .hx-grid{grid-template-columns:minmax(0,1fr);min-height:0}\n  .hx-copy{padding:32px var(--gut) 36px;order:1}\n  .hx-media{order:2;aspect-ratio:4/3.2;margin:0 var(--gut);border-radius:4px}\n  .hx-scroll{display:none}\n  .hx-title{font-size:clamp(2.5rem,10.5vw,3.6rem);font-stretch:112%}\n  .hx-ctas .btn{flex:1 1 220px;justify-content:space-between}\n  .hx{padding-bottom:36px}\n}\n\n/* --- Einordnung --- */\n.intro{padding-block:clamp(72px,9vw,130px)}\n.intro-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:24px clamp(16px,2.4vw,32px)}\n.intro-grid .eyebrow{grid-column:1/span 3}\n.statement{grid-column:4/span 9;font-weight:300;font-stretch:112%;font-size:clamp(1.7rem,3.2vw,2.9rem);line-height:1.15;letter-spacing:-.01em;color:var(--logo-grey)}\n.statement b{color:var(--ink);font-weight:650}\n.entry{grid-column:4/span 9;display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--line);margin-top:24px}\n.entry-a{display:grid;grid-template-columns:auto 1fr auto;gap:18px;align-items:center;padding:26px 24px 26px 0;text-decoration:none;color:var(--ink);border-bottom:1px solid var(--line);transition:background var(--t-s) var(--e-out),padding var(--t-s) var(--e-out)}\n.entry-a+.entry-a{border-left:1px solid var(--line);padding-left:24px}\n.entry-a .mono{width:34px;height:34px;border:1px solid var(--line);border-radius:50%;display:grid;place-items:center;letter-spacing:0;color:var(--sand-d)}\n.entry-a b{display:block;font-size:1.15rem;font-weight:650}\n.entry-a small{color:var(--stone);font-size:.92rem}\n.entry-a .arr{width:20px;transition:transform var(--t-s) var(--e-out)}\n.entry-a:hover{background:linear-gradient(90deg,rgba(220,197,168,.16),transparent)}\n.entry-a:hover .arr{transform:translateX(6px)}\n@media (max-width:900px){.intro-grid .eyebrow,.statement,.entry{grid-column:1/-1}.entry{grid-template-columns:minmax(0,1fr)}.entry-a+.entry-a{border-left:0;padding-left:0}}\n\n/* --- Highlight A: Hauswartung --- */\n.hw{padding-top:clamp(40px,5vw,72px)}\n.hw-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:clamp(20px,3vw,48px);align-items:start}\n.hw-head{grid-column:1/span 6;padding-top:clamp(0px,4vw,60px)}\n.hw-head .display{font-size:clamp(2.8rem,7vw,6.6rem)}\n.hw-media{grid-column:7/-1;grid-row:1/span 2;margin:0;aspect-ratio:4/5;border-radius:4px;overflow:hidden;position:relative;background:#E6E0D7;box-shadow:0 50px 90px -60px rgba(59,58,57,.6)}\n.hw-media figcaption,.sani2-media figcaption,.sx-stage figcaption{position:absolute;left:12px;bottom:12px;z-index:3;font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;background:rgba(252,248,245,.9);padding:5px 9px;color:var(--ink)}\n.mask-in{position:absolute;inset:0}\n.mask-in .illu{width:100%;height:100%}\n.hw-body{grid-column:1/span 5}\n.hw-list{list-style:none;margin:34px 0 0;padding:0;border-top:1px solid var(--line)}\n.hw-list li{display:grid;grid-template-columns:3rem 1fr;gap:2px 10px;padding:18px 0;border-bottom:1px solid var(--line)}\n.hw-list span{grid-row:span 2;font-size:.78rem;color:var(--sand-d);font-weight:600;padding-top:4px;font-variant-numeric:tabular-nums}\n.hw-list b{font-weight:650;font-size:1.08rem}\n.hw-list em{font-style:normal;color:var(--stone);font-size:.96rem}\n/* Maskenenthüllung */\n.js .mask.pre{clip-path:inset(0 0 100% 0)}\n.js .mask.pre .mask-in{transform:scale(1.08)}\n.mask{transition:clip-path 800ms var(--e-out)}\n.mask .mask-in{transition:transform 1000ms var(--e-out)}\n@media (max-width:900px){.hw-head,.hw-media,.hw-body{grid-column:1/-1;grid-row:auto}.hw-media{aspect-ratio:4/4.4}}\n\n/* --- Sanitär --- */\n.sani2{background:var(--graphite);color:var(--ivory);margin-top:clamp(72px,9vw,130px)}\n.sani2-grid{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);max-width:1600px;margin-inline:auto;min-height:620px}\n.sani2-media{position:relative;margin:0;overflow:hidden;background:#3E3B38}\n.sani2-media .illu{position:absolute;inset:-6% 0;height:112%}\n.sani2-copy{padding:clamp(48px,6vw,96px) max(var(--gut),calc((100vw - var(--max))/2 + var(--gut))) clamp(48px,6vw,96px) clamp(28px,4vw,72px);display:flex;flex-direction:column;justify-content:center}\n@media (min-width:1600px){.sani2-copy{padding-right:calc((1600px - var(--max))/2 + var(--gut))}}\n.sani2 .display{color:var(--ivory);font-size:clamp(2.1rem,4.2vw,3.8rem)}\n.sani2 .num{color:var(--stone-d)}.sani2 .num span{color:var(--lime)}\n.sani2 .lead{color:#E9E4DD}\n.sani2 .fine{margin-top:24px;font-size:.9rem;color:var(--stone-d);max-width:46ch}\n@media (max-width:900px){.sani2-grid{grid-template-columns:minmax(0,1fr);min-height:0}.sani2-media{aspect-ratio:16/11}.sani2-copy{padding:44px var(--gut) 56px}}\n\n/* --- Highlight B: Leistungsübersicht --- */\n.sx-top{display:grid;gap:0;margin-bottom:clamp(36px,5vw,64px)}\n.sx-grid{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(24px,4vw,72px);align-items:start}\n.sx-list{list-style:none;margin:0;padding:0;border-top:1px solid var(--line)}\n.sx-item{border-bottom:1px solid var(--line)}\n.sx-head{width:100%;display:grid;grid-template-columns:3rem 26px 1fr 20px;gap:12px;align-items:center;background:none;border:0;padding:20px 4px 20px 0;text-align:left;cursor:pointer;color:var(--stone);font-size:clamp(1.15rem,1.6vw,1.45rem);font-weight:500;font-stretch:108%;transition:color var(--t-s) var(--e-out),padding var(--t-s) var(--e-out)}\n.sx-head .n{font-size:.78rem;color:var(--sand-d);font-weight:600;font-variant-numeric:tabular-nums;font-stretch:100%}\n.sx-head .ico{width:22px;height:22px;color:var(--steel);transition:color var(--t-s)}\n.sx-head .chev{width:18px;height:18px;transition:transform 300ms var(--e-out),opacity var(--t-s);opacity:.35}\n.sx-head:hover,.sx-item.on .sx-head{color:var(--ink)}\n.sx-item.on .sx-head{padding-left:8px}\n.sx-item.on .sx-head .ico{color:var(--sand-d)}\n.sx-item.on .sx-head .chev{transform:rotate(90deg);opacity:1}\n.sx-head:focus-visible{outline:2px solid var(--sand-d);outline-offset:2px}\n.sx-body{display:grid;grid-template-rows:0fr;transition:grid-template-rows 400ms var(--e-out)}\n.sx-item.on .sx-body{grid-template-rows:1fr}\n.sx-body>div{overflow:hidden}\n.sx-inner{padding:0 0 24px calc(3rem + 12px);display:grid;gap:14px;opacity:0;transform:translateY(6px);transition:opacity 300ms var(--e-out),transform 300ms var(--e-out)}\n.sx-item.on .sx-inner{opacity:1;transform:none;transition-delay:80ms}\n.sx-inner p{color:var(--stone);max-width:44ch}\n.sx-inner .acts{display:flex;flex-wrap:wrap;gap:12px 22px;align-items:center}\n.sx-mimg{display:none;aspect-ratio:16/10;border-radius:4px;overflow:hidden;position:relative;background:#E6E0D7}\n.sx-mimg .illu{width:100%;height:100%}\n.sx-stage{position:sticky;top:120px;aspect-ratio:5/4;border-radius:4px;overflow:hidden;background:#E6E0D7;box-shadow:0 50px 90px -60px rgba(59,58,57,.6)}\n.sx-layer{position:absolute;inset:0;opacity:0;transform:scale(1.03);transition:opacity 500ms var(--e-out),transform 800ms var(--e-out)}\n.sx-layer.on{opacity:1;transform:none}\n.sx-layer .illu{width:100%;height:100%}\n.sx-tag{position:absolute;right:16px;top:16px;z-index:3;background:rgba(252,248,245,.92);padding:8px 12px;font-size:.78rem;letter-spacing:.16em;text-transform:uppercase;color:var(--ink);font-weight:600}\n@media (max-width:900px){\n  .sx-grid{grid-template-columns:minmax(0,1fr)}\n  .sx-stage{display:none}\n  .sx-mimg{display:block}\n  .sx-inner{padding-left:0}\n  .sx-head{grid-template-columns:2.4rem 24px 1fr 18px;font-size:1.12rem;padding:18px 0}\n  .sx-item.on .sx-head{padding-left:0}\n}\n\n/* --- Persönlich: vcard Reveal --- */\n.person .display{font-size:clamp(2.1rem,4.4vw,3.8rem)}\n\n/* --- Region --- */\n.region-wrap{border-top:1px solid var(--line)}\n\n/* --- FAQ Animation --- */\n.faq details[open] p{animation:fadeUp .35s var(--e-out)}\n.faq summary{transition:color var(--t-s)}\n.faq summary:hover{color:var(--sand-d)}\n\n/* --- Highlight C: Finale --- */\n.finale{background:radial-gradient(ellipse 60% 70% at 90% 10%,#47423E 0%,var(--graphite) 65%);color:var(--ivory);padding-top:clamp(96px,12vw,180px)}\n.finale-title{font-weight:300;font-stretch:122%;font-size:clamp(min(3rem,13vw),10.5vw,10rem);line-height:.92;letter-spacing:-.035em;color:#D9D3CB;margin:0}\n.finale-title b{font-weight:760;color:var(--ivory)}\n.finale-title .ln>span{transition:transform 800ms var(--e-out)}\n.js .finale-title.pre .ln>span{transform:translateY(105%)}\n.finale-title .ln:nth-child(2)>span{transition-delay:120ms}\n.finale-bar{display:flex;flex-wrap:wrap;gap:16px 34px;align-items:center;margin-top:clamp(36px,4vw,56px);padding-bottom:clamp(40px,5vw,64px);border-bottom:1px solid var(--line-d)}\n.finale-tel,.finale-mail{color:var(--ivory);text-decoration:none;font-weight:600;font-size:clamp(1.1rem,1.6vw,1.35rem);position:relative}\n.finale-tel::after,.finale-mail::after{content:\"\";position:absolute;left:0;right:0;bottom:-4px;height:1px;background:var(--lime);transform:scaleX(0);transform-origin:left;transition:transform 300ms var(--e-out)}\n.finale-tel:hover::after,.finale-mail:hover::after{transform:scaleX(1)}\n.finale .cgrid{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:clamp(28px,5vw,80px);margin-top:clamp(40px,5vw,64px)}\n@media (max-width:900px){.finale .cgrid{grid-template-columns:minmax(0,1fr)}.finale-title{font-stretch:108%}}\n.finale .form{box-shadow:0 40px 80px -40px rgba(0,0,0,.6)}\n\n/* --- Formular verfeinert --- */\n.f input[type=text],.f input[type=email],.f input[type=tel],.f select,.f textarea{border:1px solid #C9C1B7;background:#fff;transition:border-color var(--t-s) var(--e-out),box-shadow var(--t-s) var(--e-out)}\n.f input:hover,.f textarea:hover{border-color:#A79D91}\n.f input:focus,.f select:focus,.f textarea:focus{outline:0;border-color:var(--ink);box-shadow:0 0 0 4px rgba(220,197,168,.45)}\n.f [aria-invalid=\"true\"]{border-color:var(--err)!important;box-shadow:0 0 0 4px rgba(163,38,27,.12)}\n.err:not(:empty){display:flex;gap:8px;align-items:center;animation:fadeUp .25s var(--e-out)}\n.err:not(:empty)::before{content:\"!\";width:18px;height:18px;border-radius:50%;background:var(--err);color:#fff;font-size:.75rem;display:grid;place-items:center;flex:none}\n.opt span{transition:border-color var(--t-s) var(--e-out),background var(--t-s) var(--e-out),color var(--t-s)}\n.opt span::before{transition:background var(--t-s),border-color var(--t-s),box-shadow var(--t-s)}\n.upload{border-radius:6px;transition:border-color var(--t-s),background var(--t-s)}\n.result{border-radius:6px}\n\n/* --- Mobiles Menü mit Übergang --- */\n@media (max-width:980px){\n  .mnav{display:block!important;position:fixed;inset:0;z-index:60;background:var(--ivory);color:var(--ink);overflow-y:auto;padding:calc(env(safe-area-inset-top,0px) + 12px) var(--gut) calc(env(safe-area-inset-bottom,0px) + 24px);visibility:hidden;opacity:0;transform:translateY(-12px);transition:opacity 300ms var(--e-out),transform 300ms var(--e-out),visibility 0s 300ms}\n  .mnav[data-open=\"true\"]{visibility:visible;opacity:1;transform:none;transition:opacity 300ms var(--e-out),transform 300ms var(--e-out),visibility 0s}\n  .mnav li{opacity:0;transform:translateY(8px);transition:opacity 300ms var(--e-out),transform 300ms var(--e-out)}\n  .mnav[data-open=\"true\"] li{opacity:1;transform:none}\n  .mnav[data-open=\"true\"] li:nth-child(n+2){transition-delay:30ms}\n  .mnav[data-open=\"true\"] li:nth-child(n+6){transition-delay:60ms}\n}\n@media (min-width:981px){.mnav{display:none!important}}\n\n/* Bewegung reduzieren */\n@media (prefers-reduced-motion:reduce){\n  .js .hx-img,.js .hx-title .ln>span,.js .hx-in,.js .hx-scroll i{animation:none!important}\n  .js .mask.pre{clip-path:none}.js .mask.pre .mask-in{transform:none}\n  .js .finale-title.pre .ln>span{transform:none}\n  .sx-layer,.sx-body,.sx-inner,.mnav,.mnav li{transition:none!important}\n}\n\n\n.sx-right{position:sticky;top:110px;display:grid;gap:0}\n.sx-right .sx-stage{position:relative;top:auto}\n.sx-detail{background:#FFFDFB;border:1px solid var(--line);border-top:0;padding:24px 28px 26px;display:grid;gap:12px;border-radius:0 0 4px 4px}\n.sx-detail .n{font-size:.78rem;letter-spacing:.16em;text-transform:uppercase;color:var(--sand-d);font-weight:600}\n.sx-detail p{color:var(--stone);max-width:52ch}\n.sx-detail .acts{display:flex;flex-wrap:wrap;gap:12px 22px;align-items:center}\n.sx-detail.show{animation:fadeUp .3s var(--e-out)}\n.sx-stage{border-radius:4px 4px 0 0;box-shadow:none}\n.sx-right{box-shadow:0 50px 90px -60px rgba(59,58,57,.6)}\n@media (min-width:901px){.sx-body{display:none}.sx-head .chev{transform:none!important}}\n@media (max-width:900px){.sx-right{display:none}}\n\n@media (min-width:901px){\n  .hx-grid{grid-template-columns:minmax(0,7fr) minmax(0,5fr)}\n  .hx-title{font-size:clamp(2.8rem,4.3vw,5rem)}\n  .hx-title .ln>span{white-space:nowrap}\n}\n\n.display{overflow-wrap:normal;hyphens:manual}\n.faqwrap .display{font-size:clamp(2rem,3.6vw,3.3rem)}\n@media (min-width:901px){.sani2-grid{grid-template-columns:minmax(0,6fr) minmax(0,6fr)}}\n.sani2 .display{margin-bottom:24px}\n.hw-head .display,.sx-top .display{margin-bottom:0}\n\n/* ================= V6: Fotografie und Lichtakzente ================= */\n.illu{position:relative}\n.ph{display:block;width:100%;height:100%;object-fit:cover;user-select:none}\n.ph-tag{position:absolute;right:10px;top:10px;z-index:2;font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;background:rgba(252,248,245,.82);color:#4a4846;padding:3px 7px;border-radius:2px;pointer-events:none}\n.hx-media .ph-tag{top:auto;bottom:14px;right:14px}\n.fig .illu,.hx-img .illu,.sx-layer .illu,.mask-in .illu,.sani2-media .illu{overflow:hidden}\n/* Licht im Bild: leichte Farbangleichung an die Marke */\n.ph{filter:saturate(.92) contrast(1.02)}\n/* Schaltflächen: einmaliger Lichtstreif beim Hover */\n.btn{position:relative;overflow:hidden;isolation:isolate}\n.btn::after{content:\"\";position:absolute;inset:-2px auto -2px -60%;width:45%;background:linear-gradient(100deg,transparent,rgba(255,244,226,.45),transparent);transform:skewX(-18deg) translateX(0);opacity:0;z-index:-1;transition:transform 600ms var(--e-out,ease),opacity 200ms}\n.btn:hover::after{transform:skewX(-18deg) translateX(420%);opacity:1}\n.btn.sand::after,.dark .btn:not(.ghost)::after{background:linear-gradient(100deg,transparent,rgba(255,255,255,.6),transparent)}\n/* Bildtiefe: Hover-Zoom für Fotos */\n.hw-media:hover .ph,.sani2-media:hover .ph,.svc:hover .ph{transform:scale(1.03)}\n.ph{transition:transform 900ms var(--e-out,ease)}\n@media (max-width:900px){\n  .hx-media .ph{object-position:58% 50%!important}\n  .hw-media .ph{object-position:45% 50%!important}\n}\n@media (prefers-reduced-motion:reduce){.btn::after{display:none}.ph{transition:none}}\nbody.review figure:has(figcaption.review-only) .ph-tag{display:none}\n\n/* ===== V7 Feinschliff (Design-Engineering-Details) ===== */\n:host{--e-out:cubic-bezier(.23,1,.32,1);--e-io:cubic-bezier(.77,0,.175,1);--ease:cubic-bezier(.23,1,.32,1)}\n/* Schnelles, direktes Press-Feedback auf allem Klickbaren */\n.btn,.sx-head,.burger,.hdr-call,.mbar a,.faq summary,.tlink,.vcard a{-webkit-tap-highlight-color:transparent}\n.btn,.burger,.hdr-call,.mbar a{transition-property:background,color,border-color,box-shadow,transform;transition-duration:180ms;transition-timing-function:var(--e-out)}\n.btn:active,.burger:active,.hdr-call:active,.mbar a:active{transform:scale(.97);transition-duration:90ms}\n.sx-head:active{transform:scale(.99);transition:transform 90ms var(--e-out)}\n/* Hover nur mit echter Maus: kein \"klebender\" Hover auf Touchgeräten */\n@media (hover:none){\n  .hw-media:hover .ph,.sani2-media:hover .ph,.svc:hover .ph{transform:none}\n  .btn:hover::after{animation:none}\n}\n/* Popover/Dropdown wachsen aus ihrem Auslöser */\n.dd>ul,.dd .menu,.dd-panel{transform-origin:top left}\n/* Bildwechsel in der Leistungsübersicht: leichter Blur-Übergang verdeckt den Schnitt */\n.sx-layer{filter:blur(6px);transition:opacity 420ms var(--e-out),transform 700ms var(--e-out),filter 420ms var(--e-out)}\n.sx-layer.on{filter:none}\n.sx-detail{transition:opacity 220ms var(--e-out),transform 260ms var(--e-out)}\n.sx-detail:not(.show){opacity:0;transform:translateY(6px)}\n.sx-detail.show{opacity:1;transform:none}\n/* Mobiles Menü: Einträge laufen gestaffelt ein, schliessen ohne Verzögerung */\n@media (max-width:980px){\n  .mnav li{transition:opacity 260ms var(--e-out),transform 260ms var(--e-out)}\n  .mnav[data-open=\"true\"] li{transition-delay:calc(var(--i,0)*28ms + 60ms)}\n  .mnav:not([data-open=\"true\"]) li{transition-duration:120ms;transition-delay:0ms}\n  .mnav:not([data-open=\"true\"]){transition-duration:180ms,180ms,0s;transition-delay:0s,0s,180ms}\n}\n/* Typografische Feinheiten */\nh1,h2,h3,.display{text-wrap:balance}\np,li{text-wrap:pretty}\n.n,.num,.step-n,time,td{font-variant-numeric:tabular-nums}\nbody{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}\n/* Fokus: klar, aber nur bei Tastaturbedienung */\n:focus{outline:none}\n:focus-visible{outline:2px solid var(--ink);outline-offset:3px;border-radius:4px;transition:outline-offset 120ms var(--e-out)}\n/* Fotos: feine Innenkante statt harter Ränder */\n.ph{outline:1px solid rgba(0,0,0,.06);outline-offset:-1px}\n@media (prefers-reduced-motion:reduce){.sx-layer,.sx-detail{transition:none!important;filter:none!important}.btn:active{transform:none}}\n\n/* ===================== V8 · Interaktionssystem & Design-Nachschärfung ===================== */\n:host{--sand-t:#7E6343;--e-drawer:cubic-bezier(.32,.72,0,1);--e-spring:cubic-bezier(.34,1.3,.64,1)}\n\n/* Kontrast: Akzenttext in Sandton erfüllt jetzt WCAG AA (5.3:1 statt 2.6:1) */\n.num span,.sx-head .n,.sx-detail .n,.hw-list span,.entry-a .mono,.hx-call i{color:var(--sand-t)}\n.sani2 .num span,.finale .num span,.dark .num span{color:var(--lime)}\n.finale :focus-visible,.sani2 :focus-visible,.dark :focus-visible{outline-color:var(--lime)}\n\n/* ---------- Schaltflächen & Pfeile ---------- */\n.btn{transition:background 200ms var(--e-out),color 200ms var(--e-out),border-color 200ms var(--e-out),box-shadow 260ms var(--e-out),transform 220ms var(--e-out)}\n.btn:active{transform:scale(.97);transition-duration:80ms}\n.btn .arr,.tlink .arr,.entry-a .arr,.svc .go .arr{transition:transform 240ms var(--e-out)}\n@media (hover:hover) and (pointer:fine){\n  .btn:hover{box-shadow:0 10px 24px -14px rgba(48,46,44,.55)}\n}\n@media (hover:none){\n  .btn:hover .arr,.lnk:hover .arr,.tlink:hover .arr,.entry-a:hover .arr,.svc:hover .go .arr{transform:none}\n  .tlink:hover::after{transform:none}\n  .entry-a:hover{background:none}\n  .faq summary:hover{color:inherit}\n}\n.tlink:focus-visible::after{transform:scaleX(1.12)}\n.tlink:focus-visible .arr,.entry-a:focus-visible .arr{transform:translateX(5px)}\n.tlink:active .arr,.entry-a:active .arr{transform:translateX(8px);transition-duration:90ms}\n@media (pointer:coarse){.tlink{min-height:44px}}\n\n/* ---------- Leistungskarten: Anhebung + abgestimmte Bildbewegung ---------- */\n.svc{transition:transform 320ms var(--e-out),box-shadow 320ms var(--e-out),border-color 200ms var(--e-out),background 200ms var(--e-out)}\n.svc .fig .illu{transform:none!important}\n.svc .ph{transition:transform 700ms var(--e-out)}\n@media (hover:hover) and (pointer:fine){\n  .svc:hover{transform:translateY(-4px)}\n  .svc:hover .ph{transform:scale(1.045) translateY(-1%)}\n}\n.svc:focus-visible,.svc:focus-within{transform:translateY(-4px);box-shadow:var(--shadow)}\n.svc:focus-visible .ph,.svc:focus-within .ph{transform:scale(1.045)}\n.svc:active{transform:translateY(-2px) scale(.995);transition-duration:90ms}\n@media (hover:none){.svc:hover{transform:none;box-shadow:none}.svc:hover .ph{transform:none}}\n\n/* ---------- Dropdown «Leistungen»: wächst aus dem Auslöser ---------- */\n.dd-panel{opacity:0;visibility:hidden;transform:translateY(-6px) scale(.98);transform-origin:top left;transition:opacity 140ms var(--e-out),transform 160ms var(--e-out),visibility 0s 160ms}\n.dd-panel.open{opacity:1;visibility:visible;transform:none;transition:opacity 180ms var(--e-out),transform 240ms var(--e-out),visibility 0s}\n.dd-panel a{transition:background 140ms var(--e-out)}\n.dd-panel a .mono{transition:color 140ms}\n.dd-panel a:hover .mono,.dd-panel a:focus-visible .mono{color:var(--sand-t)}\n#ddBtn .chev{transition:transform 240ms var(--e-out)}\n#ddBtn[aria-expanded=\"true\"] .chev{transform:rotate(180deg)}\n\n/* ---------- Mobiles Menü: Schublade mit iOS-ähnlicher Kurve ---------- */\n@media (max-width:980px){\n  .mnav[data-open=\"true\"]{transition:opacity 240ms var(--e-out),transform 420ms var(--e-drawer),visibility 0s}\n  .mnav:not([data-open=\"true\"]){transform:translateY(-10px);transition:opacity 180ms var(--e-out),transform 220ms var(--e-out),visibility 0s 220ms}\n  .mnav li a{transition:color 140ms}\n  .mnav li a:active{color:var(--sand-t)}\n}\n.mbar{transition:transform 320ms var(--e-drawer)}\nbody.in-finale .mbar{transform:translateY(calc(100% + 2px))}\n\n/* ---------- FAQ-Akkordeon ---------- */\n.faq-body{overflow:hidden}\n.faq details[open] p{animation:none}\n.faq-body>p{opacity:0;transform:translateY(-4px);transition:opacity 180ms var(--e-out),transform 280ms var(--e-out)}\n.faq details.is-open .faq-body>p{opacity:1;transform:none;transition-delay:50ms}\n.faq summary .pm::before,.faq summary .pm::after{transition:transform 300ms var(--e-out)}\n.faq details .pm::after,.faq details[open]:not(.is-open) .pm::after{transform:rotate(90deg)}\n.faq details.is-open .pm::after{transform:rotate(0)}\n.faq summary{transition:color 160ms var(--e-out)}\n@media (hover:hover) and (pointer:fine){.faq summary:hover{color:var(--sand-t)}}\n.faq summary:focus-visible{outline-offset:4px}\n\n/* ---------- Leistungsübersicht Desktop ---------- */\n.sx-item{position:relative}\n.sx-item::after{content:\"\";position:absolute;left:0;right:0;bottom:-1px;height:1px;background:var(--ink);transform:scaleX(0);transform-origin:left;transition:transform 460ms var(--e-out);pointer-events:none}\n.sx-item.on::after{transform:scaleX(1)}\n.sx-item.on .sx-head{padding-left:0}\n.sx-head .t{transition:transform 300ms var(--e-out)}\n.sx-item.on .sx-head .t{transform:translateX(6px)}\n.sx-head .ico{transition:color 200ms var(--e-out),transform 300ms var(--e-out)}\n.sx-item.on .sx-head .ico{transform:scale(1.08)}\n.sx-layer{filter:blur(4px)}\n.sx-layer.on{filter:none}\n.sx-count{position:absolute;right:16px;bottom:16px;z-index:3;background:rgba(252,248,245,.92);padding:6px 10px;font-size:.74rem;letter-spacing:.14em;color:var(--stone);font-variant-numeric:tabular-nums;border-radius:2px}\n.sx-count b{color:var(--ink);font-weight:650}\n.sx-stage .ph-tag{display:none}\n\n/* ---------- Leistungsübersicht Smartphone: ruhige vertikale Liste, alles sichtbar ---------- */\n.sx-mob{display:none}\n@media (max-width:900px){\n  .sx-list,.sx-right{display:none!important}\n  .sx-mob{display:grid;gap:0;list-style:none;margin:0;padding:0;border-top:1px solid var(--line)}\n  .sx-card{display:grid;grid-template-columns:104px minmax(0,1fr);gap:16px;padding:20px 0;border-bottom:1px solid var(--line);align-items:start}\n  .sx-cimg{position:relative;aspect-ratio:1;border-radius:4px;overflow:hidden;background:#E6E0D7}\n  .sx-cimg .illu{width:100%;height:100%}\n  .sx-cimg .ph-tag{display:none}\n  .sx-cb{display:grid;gap:6px;min-width:0}\n  .sx-cb .n{font-size:.72rem;letter-spacing:.14em;color:var(--sand-t);font-weight:600;font-variant-numeric:tabular-nums}\n  .sx-cb h3{display:flex;gap:8px;align-items:center;font-size:1.12rem;font-weight:650;font-stretch:108%;margin:0;line-height:1.2}\n  .sx-cb h3 .ico{width:20px;height:20px;color:var(--sand-d);flex:none}\n  .sx-cb p{color:var(--stone);font-size:.94rem;margin:0;line-height:1.5}\n  .sx-cb .acts{display:flex;flex-wrap:wrap;gap:4px 18px;align-items:center;padding-top:4px}\n  .sx-cb .acts .btn{display:none}\n  /* Hauswartung als Hauptleistung: grosse Karte mit Bild und Aktion */\n  .sx-card:first-child{grid-template-columns:minmax(0,1fr);gap:16px;padding-top:4px}\n  .sx-card:first-child .sx-cimg{aspect-ratio:16/10}\n  .sx-card:first-child .sx-cimg .ph-tag{display:block}\n  .sx-card:first-child h3{font-size:1.45rem}\n  .sx-card:first-child .acts .btn{display:inline-flex}\n  .sx-card:first-child p{font-size:1rem;color:var(--ink)}\n}\n@media (max-width:380px){.sx-card{grid-template-columns:84px minmax(0,1fr)}}\n\n/* ---------- Formular: Fokus, Fehler, Bestätigung ---------- */\n.f label,.f .lbl{transition:color 160ms var(--e-out)}\n.f input[type=text],.f input[type=email],.f input[type=tel],.f textarea{transition:border-color 160ms var(--e-out),box-shadow 220ms var(--e-out),background-color 160ms var(--e-out)}\n.f input:focus,.f textarea:focus,.f select:focus{outline:none;border-color:var(--ink);box-shadow:0 0 0 4px rgba(220,197,168,.6)}\n@media (hover:hover) and (pointer:fine){.f input:hover:not(:focus),.f textarea:hover:not(:focus){border-color:#6F6A64}}\n.f.is-ok input,.f.is-ok textarea{border-color:#557A57;background:#fff url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath d='M5 10.5l3.2 3.2L15 7' fill='none' stroke='%23557A57' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\") no-repeat right 12px center/18px;padding-right:40px}\n.f.is-ok textarea{background-position:right 12px top 12px}\n.f.is-ok input:focus,.f.is-ok textarea:focus{box-shadow:0 0 0 4px rgba(85,122,87,.18)}\n@keyframes fShake{0%,100%{transform:none}20%{transform:translateX(-5px)}40%{transform:translateX(4px)}60%{transform:translateX(-3px)}80%{transform:translateX(1px)}}\n.shake{animation:fShake 340ms var(--e-out)}\n.opt span{transition:background 180ms var(--e-out),border-color 180ms var(--e-out),color 180ms var(--e-out),transform 160ms var(--e-out)}\n.opt span::before{transition:background 180ms var(--e-out),border-color 180ms var(--e-out),box-shadow 220ms var(--e-spring)}\n@media (hover:hover) and (pointer:fine){.opt input:not(:checked):hover+span{border-color:#8D8780}}\n.opt input:active+span{transform:scale(.98);transition-duration:80ms}\n.opt input:focus-visible+span{outline:2px solid var(--ink);outline-offset:2px}\n.finale .opt input:focus-visible+span{outline-color:var(--ink)}\n@keyframes optPulse{0%{box-shadow:0 0 0 0 rgba(220,197,168,.95)}100%{box-shadow:0 0 0 12px rgba(220,197,168,0)}}\n.opt.pulse span{animation:optPulse 600ms var(--e-out)}\n.upload{transition:border-color 180ms var(--e-out),background 180ms var(--e-out)}\n@keyframes resIn{from{opacity:0;transform:translateY(10px) scale(.985)}}\n.result.in{animation:resIn 420ms var(--e-out)}\n.okq{display:flex;gap:14px;align-items:flex-start;margin:0;border-left:3px solid var(--ink);padding:8px 16px;font-size:1.1rem}\n.okmark{width:30px;height:30px;flex:none;fill:none;stroke:#557A57;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}\n.okmark circle{stroke-dasharray:114;stroke-dashoffset:114;animation:draw 600ms 150ms var(--e-out) forwards}\n.okmark path{stroke-dasharray:30;stroke-dashoffset:30;animation:draw 340ms 560ms var(--e-out) forwards}\n@keyframes draw{to{stroke-dashoffset:0}}\n.err:not(:empty){animation:errIn 220ms var(--e-out)}\n@keyframes errIn{from{opacity:0;transform:translateY(-3px)}}\n\n/* ---------- Einstieg ---------- */\n@keyframes hxZoom2{from{transform:scale(1.035);clip-path:inset(0 0 0 12%);opacity:.0}45%{opacity:1}to{transform:none;clip-path:inset(0);opacity:1}}\n.js .hx-img{animation:hxZoom2 1s var(--e-out) both}\n.js .hx-title .ln>span{animation-duration:.62s}\n.js .hx-sub.hx-in{animation-delay:.28s;animation-duration:.5s}\n/* Kontaktaktionen sind ab dem ersten Bild sichtbar und klickbar – nur eine minimale Bewegung */\n@keyframes ctaIn{from{transform:translateY(6px);opacity:.6}}\n.js .hx-ctas.hx-in,.js .hx-call.hx-in{animation:ctaIn .45s var(--e-out) both;animation-delay:.34s}\n\n/* ---------- Abschluss ---------- */\n.fchips{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:clamp(28px,3.5vw,48px)}\n.fchips-l{flex-basis:100%;color:var(--stone-d);font-size:.95rem;margin-bottom:6px;letter-spacing:.01em}\n.fchip{display:inline-flex;align-items:center;min-height:44px;padding:10px 18px;border:1px solid rgba(252,248,245,.3);border-radius:999px;color:var(--ivory);text-decoration:none;font-weight:550;font-size:.98rem;transition:background 180ms var(--e-out),border-color 180ms var(--e-out),color 180ms var(--e-out),transform 180ms var(--e-out)}\n@media (hover:hover) and (pointer:fine){.fchip:hover{background:rgba(252,248,245,.08);border-color:rgba(252,248,245,.7)}}\n.fchip:active{transform:scale(.96);transition-duration:80ms}\n.fchip[aria-pressed=\"true\"]{background:var(--lime);border-color:var(--lime);color:var(--ink)}\n.js .fchips.pre .fchip{opacity:0;transform:translateY(10px)}\n@keyframes chipIn{from{opacity:0;transform:translateY(10px)}}\n.js .fchips:not(.pre) .fchip{animation:chipIn 520ms var(--e-out) both;animation-delay:calc(var(--i) * 35ms + 60ms)}\n.fcta{padding:8px 8px 8px 26px;gap:18px}\n.fcta-c{width:42px;height:42px;border-radius:50%;background:var(--ink);color:var(--ivory);display:grid;place-items:center;transition:transform 320ms var(--e-out)}\n.fcta-c .arr{color:var(--ivory)}\n@media (hover:hover) and (pointer:fine){.fcta:hover .fcta-c{transform:scale(1.07)}.fcta:hover .fcta-c .arr{transform:translateX(3px)}}\n.finale-bar{margin-top:clamp(28px,3vw,40px)}\n\n.finale-lead{max-width:40ch;font-size:clamp(1.15rem,1.6vw,1.45rem);line-height:1.5;color:#E9E3DC;margin:clamp(24px,3vw,40px) 0 0}\n.fcontact{display:grid;gap:6px;margin:0}\n.fcontact a{color:var(--ivory);text-decoration:none;font-weight:600;width:max-content;border-bottom:1px solid rgba(220,197,168,.5);transition:border-color 160ms var(--e-out)}\n.fcontact a:hover{border-color:var(--lime)}\n/* Aktive Navigation: klare Markierung */\n.nav>a[aria-current=\"page\"]{font-weight:650}\n.mnav a[aria-current=\"page\"]{color:var(--ink);font-weight:650}\n.mnav a[aria-current=\"page\"]::before{content:\"\";width:6px;height:6px;border-radius:50%;background:var(--sand-d);align-self:center;margin-right:10px;flex:none;order:-1}\n/* Absenden: Lade- und Sperrzustand */\n.btn[aria-busy=\"true\"]{pointer-events:none;opacity:.85}\n.btn .spin{width:16px;height:16px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:spin .7s linear infinite;display:none}\n.btn[aria-busy=\"true\"] .spin{display:inline-block}\n.btn[aria-busy=\"true\"] .arr{display:none}\n@keyframes spin{to{transform:rotate(360deg)}}\n/* Kleine Geräte: dekorative Bewegung reduziert */\n@media (max-width:700px){\n  .sx-layer{filter:none}\n  .js .hx-img{animation-duration:.8s}\n  .hw-media:hover .ph,.sani2-media:hover .ph{transform:none}\n}\n\n/* Logo: im kompakten Kopf grösser, damit der Zusatz «einfach bereit» lesbar bleibt; keine Effekte am Logo */\nbody.hdr-compact .hdr .wrap{min-height:96px}\nbody.hdr-compact .logo img{height:80px}\n@media (max-width:980px){body.hdr-compact .hdr .wrap{min-height:78px}body.hdr-compact .logo img{height:64px}}\n.logo img{filter:none!important;transform:none!important}\n\n/* Einstieg Smartphone: Bild zuerst und randabfallend – das Motiv ist sofort sichtbar */\n@media (max-width:900px){\n  .hx-media{order:0;margin:0;border-radius:0;aspect-ratio:auto;height:clamp(230px,36svh,380px)}\n  .hx-copy{order:1;padding-top:26px;padding-bottom:30px}\n  .hx-kicker{margin-bottom:14px}\n  .hx-title{margin-bottom:16px}\n  .hx-ctas{margin-top:22px}\n  .hx-call{margin-top:22px;padding-top:16px}\n  .hx-media .ph-tag,.hx-media figcaption{bottom:10px;left:auto;right:10px}\n}\n\n/* ---------- Reduzierte Bewegung ---------- */\n@media (prefers-reduced-motion:reduce){\n  .dd-panel,.dd-panel.open,.mnav,.mnav:not([data-open=\"true\"]),.fchip,.svc,.svc .ph,.faq-body>p,.f input,.f textarea,.opt span,.mbar,.btn,.sx-head .t,.sx-item::after,.fcta-c{transition:none!important}\n  .shake,.result.in,.okmark circle,.okmark path,.js .fchips:not(.pre) .fchip,.err:not(:empty),.opt.pulse span,.js .hx-img,.js .hx-ctas.hx-in,.js .hx-call.hx-in{animation:none!important}\n  .okmark circle,.okmark path{stroke-dashoffset:0}\n  .js .fchips.pre .fchip{opacity:1;transform:none}\n  .faq-body>p{opacity:1;transform:none}\n  .btn:active,.svc:active,.fchip:active,.burger:active,.hdr-call:active,.mbar a:active,.sx-head:active{transform:none!important}\n  .svc:hover,.svc:focus-visible,.svc:focus-within,.svc:hover .ph,.svc:focus-visible .ph,.svc:focus-within .ph,.hw-media:hover .ph,.sani2-media:hover .ph,.fcta:hover .fcta-c{transform:none!important}\n  .btn:hover .arr,.tlink:hover .arr,.entry-a:hover .arr,.tlink:active .arr,.tlink:focus-visible .arr,.fcta:hover .fcta-c .arr{transform:none!important}\n  .opt input:active+span{transform:none}\n  .btn .spin{animation-duration:1.6s}\n}\n\n/* ===================== V9 · Bewegungswerte, Neigung, Kopfzeile ohne Layoutsprung ===================== */\n:host{--ease-out:cubic-bezier(.22,1,.36,1);--ease-ui:cubic-bezier(.2,.8,.2,1);--duration-press:140ms;--duration-ui:240ms;--duration-reveal:650ms;--stagger-step:60ms;--e-out:var(--ease-out)}\n\n/* Scroll-Einblendung: kurze Wege, Gruppen, 650 ms */\n.reveal{transition:opacity var(--duration-reveal) var(--ease-out),transform var(--duration-reveal) var(--ease-out)}\n.js .reveal.pre,.js .reveal.pre:not(.in){transform:translateY(16px)}\n\n/* Kopfzeile: feste Höhe im Fluss (kein Layoutsprung). Beim Scrollen gleitet der obere Teil\n   unter den Rand (sticky mit negativem top), der Inhalt wird per transform zentriert. */\n.hdr{top:calc(env(safe-area-inset-top,0px) - 36px)}\n.hdr .wrap,body.hdr-compact .hdr .wrap{min-height:132px;transition:none}\n.hdr .wrap>*{transition:transform var(--duration-ui) var(--ease-out)}\nbody.hdr-compact .hdr .wrap>*{transform:translateY(18px)}\n.logo img,body.hdr-compact .logo img{height:112px}\n.logo{transform-origin:left center}\nbody.hdr-compact .hdr .wrap>.logo{transform:translateY(18px) scale(.75)}\n@media (max-width:980px){\n  .hdr{top:calc(env(safe-area-inset-top,0px) - 26px)}\n  .hdr .wrap,body.hdr-compact .hdr .wrap{min-height:104px}\n  .logo img,body.hdr-compact .logo img{height:88px}\n  body.hdr-compact .hdr .wrap>*{transform:translateY(13px)}\n  body.hdr-compact .hdr .wrap>.logo{transform:translateY(13px) scale(.75)}\n}\n@media (max-width:360px){.logo img,body.hdr-compact .logo img{height:76px}}\n\n/* Einstieg: Maskenenthüllung + Zoom 1.05 → 1; Tiefenwirkung über Parallax auf separatem Bild-Wrapper */\n@keyframes hxZoom3{from{transform:scale(1.05);clip-path:inset(0 0 0 14%)}to{transform:none;clip-path:inset(0)}}\n.js .hx-img{animation:hxZoom3 .95s var(--ease-out) both}\n.hx-img .illu{position:absolute;inset:-5% 0;height:auto;will-change:auto}\n.hx-copy{position:relative;z-index:2}\n\n/* Leistungsbühne: wandernde aktive Markierung */\n.sx-list{position:relative}\n.sx-item::after{display:none}\n.sx-ind{position:absolute;left:0;right:0;top:0;height:78px;list-style:none;pointer-events:none;z-index:0;border-radius:4px;background:linear-gradient(90deg,rgba(220,197,168,.28),rgba(220,197,168,0) 85%);box-shadow:inset 2px 0 0 var(--sand-d);opacity:0;transition:transform 380ms var(--ease-out),height 380ms var(--ease-out),opacity 200ms}\n.sx-ind.ready{opacity:1}\n.sx-item{z-index:1}\n.sx-item.on .sx-head{padding-left:0}\n.sx-head{padding-left:14px!important}\n.sx-item.on .sx-head .t{transform:translateX(4px)}\n\n/* Räumliche Bildkarten */\n.tilt{transform:perspective(1000px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transition:transform 600ms var(--ease-out),box-shadow 600ms var(--ease-out)}\n.tilt.tilting{transition:transform 120ms linear,box-shadow 300ms var(--ease-out)}\n.tilt-glare{position:absolute;inset:0;z-index:4;pointer-events:none;opacity:0;background:radial-gradient(circle at var(--mx,50%) var(--my,50%),rgba(255,250,240,.28),rgba(255,250,240,0) 55%);mix-blend-mode:soft-light;transition:opacity 400ms var(--ease-out)}\n.tilt.tilting .tilt-glare{opacity:1}\n.svc .fig.tilt{will-change:auto}\n@media not all and (hover:hover) and (pointer:fine){.tilt{transform:none!important}.tilt-glare{display:none}}\n\n/* Schaltflächen: Lichtreflex nur auf Hauptaktionen; Magnet-Label */\n.btn:not([data-primary])::after{display:none}\n.btn-in{display:inline-flex;align-items:center;gap:inherit;transform:translate(var(--tx,0px),var(--ty,0px));transition:transform 320ms var(--ease-out)}\n.btn:active{transition-duration:var(--duration-press)}\n\n.tilt{backface-visibility:hidden;outline:1px solid transparent}\n.js .hx-ctas.hx-in,.js .hx-call.hx-in{animation-delay:.24s;animation-duration:.36s}\n\n/* Reduzierte Bewegung: Neigung, Magnet, Parallax, Hover und Press zuverlässig aus */\n@media (prefers-reduced-motion:reduce){\n  .tilt,.tilt.tilting{transform:none!important;transition:none!important}\n  .tilt-glare{display:none!important}\n  .btn-in{transform:none!important;transition:none!important}\n  .btn::after{display:none!important}\n  .hx-img .illu{transform:none!important}\n  .js .hx-img{animation:none!important}\n  .sx-ind{transition:none!important}\n  .hdr .wrap>*{transition:none!important}\n  .reveal{transition:none!important}\n}\n\n/* ===================== V10 · Futuristische Richtung: dunkle Räume, Konturlinien, interaktives Gebäude ===================== */\n:host{--night:#252321;--night-2:#2d2a27;--glass:rgba(252,248,245,.05);--glass-b:rgba(220,197,168,.2);--glow:rgba(220,197,168,.55)}\n/* Bauplan-Raster als Motiv (fein, maskiert) */\n.blueprint{position:relative;isolation:isolate}\n.blueprint::before{content:\"\";position:absolute;inset:0;z-index:-1;pointer-events:none;background-image:linear-gradient(rgba(220,197,168,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(220,197,168,.07) 1px,transparent 1px);background-size:72px 72px;-webkit-mask-image:radial-gradient(ellipse 70% 70% at 60% 40%,#000 20%,transparent 75%);mask-image:radial-gradient(ellipse 70% 70% at 60% 40%,#000 20%,transparent 75%)}\n\n/* ---------- Einstieg ---------- */\n.hx{background:radial-gradient(ellipse 60% 70% at 72% 45%,#34302c 0%,var(--night) 70%);color:var(--ivory)}\n.hx::before{content:\"\";position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(220,197,168,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(220,197,168,.06) 1px,transparent 1px);background-size:72px 72px;-webkit-mask-image:radial-gradient(ellipse 55% 75% at 30% 50%,#000 10%,transparent 70%);mask-image:radial-gradient(ellipse 55% 75% at 30% 50%,#000 10%,transparent 70%)}\n.hx-grid{grid-template-columns:minmax(0,5fr) minmax(0,6fr);align-items:center;min-height:min(86vh,880px)}\n.hx-title{font-size:clamp(2.5rem,3.7vw,4.6rem)}\n.hx-kicker{color:#BDB5AB}\n.hx-title{color:#CFC8BF}\n.hx-title b{color:var(--ivory)}\n.hx-sub{color:#E3DDD6}\n.hx .btn:not(.ghost){background:var(--lime);border-color:var(--lime);color:var(--ink)}\n.hx .btn.ghost{color:var(--ivory);border-color:rgba(252,248,245,.38);background:transparent}\n.hx-call{color:var(--ivory);border-top-color:rgba(252,248,245,.14)}\n.hx-call small{color:#BDB5AB}\n.hx-call i{color:var(--lime)!important}\n.hx-scroll{color:#BDB5AB}.hx-scroll:hover{color:var(--ivory)}\n.hx-stage{position:relative;aspect-ratio:5/4;width:100%;max-height:min(80vh,820px);justify-self:end;align-self:center;margin:clamp(16px,3vw,40px) 0;-webkit-mask-image:radial-gradient(ellipse 72% 70% at 50% 52%,#000 58%,transparent 100%);mask-image:radial-gradient(ellipse 72% 70% at 50% 52%,#000 58%,transparent 100%)}\n.hx-stage{-webkit-mask-image:none;mask-image:none}\n.b3-poster,.b3-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;object-fit:cover;-webkit-mask-image:radial-gradient(ellipse 50% 50% at 50% 50%,#000 64%,transparent 100%);mask-image:radial-gradient(ellipse 50% 50% at 50% 50%,#000 64%,transparent 100%)}\n.b3-canvas{opacity:0;transition:opacity 500ms var(--ease-out)}\n.hx-stage.b3-ready .b3-canvas{opacity:1}\n.js .hx-stage .b3-poster{animation:b3In .9s var(--ease-out) both}\n@keyframes b3In{from{opacity:0;transform:scale(1.04)}}\n.b3-tag{position:absolute;right:14px;bottom:10px;font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;color:#BDB5AB;background:rgba(37,35,33,.6);padding:4px 8px;border-radius:2px;z-index:3}\n\n/* Markierungen */\n.hs-layer{position:absolute;inset:0;z-index:2;pointer-events:none}\n.hs{position:absolute;left:var(--x,50%);top:var(--y,50%);transform:translate(-50%,-50%);pointer-events:auto;display:flex;align-items:center;justify-content:center;background:none;border:0;padding:14px;cursor:pointer;color:var(--ivory);min-width:44px;min-height:44px}\n.hs-dot{position:relative;width:16px;height:16px;border-radius:50%;background:var(--lime);box-shadow:0 0 0 4px rgba(220,197,168,.22),0 0 18px 2px rgba(220,197,168,.45);flex:none;transition:transform 180ms var(--ease-out),box-shadow 240ms var(--ease-out)}\n.hs-dot::after{content:\"\";position:absolute;inset:-10px;border:1px solid rgba(220,197,168,.55);border-radius:50%;opacity:0;transform:scale(.6)}\n.js .hx-stage:not(.hs-seen) .hs-dot::after{animation:hsPing 1.6s var(--ease-out) 1.1s 2}\n@keyframes hsPing{0%{opacity:.9;transform:scale(.6)}100%{opacity:0;transform:scale(1.5)}}\n.hs-lbl{position:absolute;left:calc(100% - 4px);top:50%;font-size:.8rem;font-weight:600;letter-spacing:.04em;padding:6px 10px;border-radius:999px;background:rgba(37,35,33,.72);border:1px solid var(--glass-b);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);opacity:0;transform:translate(-4px,-50%);transition:opacity 200ms var(--ease-out),transform 240ms var(--ease-out);white-space:nowrap;pointer-events:none}\n.hs:hover .hs-lbl,.hs:focus-visible .hs-lbl,.hs.on .hs-lbl{opacity:1;transform:translate(0,-50%)}\n@media (hover:hover) and (pointer:fine){.hs:hover .hs-dot{transform:scale(1.18)}}\n.hs:active .hs-dot{transform:scale(.9);transition-duration:90ms}\n.hs.on .hs-dot{background:var(--ivory);box-shadow:0 0 0 5px rgba(252,248,245,.25),0 0 24px 4px rgba(220,197,168,.6)}\n.hs:focus-visible{outline:2px solid var(--lime);outline-offset:2px;border-radius:999px}\n.js .hs{opacity:0;animation:hsIn .5s var(--ease-out) both}\n.js .hs:nth-child(1){animation-delay:.7s}.js .hs:nth-child(2){animation-delay:.76s}.js .hs:nth-child(3){animation-delay:.82s}.js .hs:nth-child(4){animation-delay:.88s}\n@keyframes hsIn{from{opacity:0;transform:translate(-50%,-30%)}to{opacity:1;transform:translate(-50%,-50%)}}\n\n/* Infofläche (Glas) */\n.hs-panel{position:absolute;left:clamp(12px,3%,32px);bottom:clamp(12px,4%,40px);z-index:4;width:min(360px,calc(100% - 24px));padding:22px 22px 20px;border-radius:10px;background:rgba(37,35,33,.78);border:1px solid var(--glass-b);-webkit-backdrop-filter:blur(14px) saturate(120%);backdrop-filter:blur(14px) saturate(120%);box-shadow:0 30px 60px -30px rgba(0,0,0,.7);color:var(--ivory);opacity:0;transform:translateY(8px) scale(.985);transform-origin:bottom left;transition:opacity 180ms var(--ease-out),transform 240ms var(--ease-out)}\n.hs-panel.open{opacity:1;transform:none}\n@media (min-width:901px){.hs-panel{left:clamp(10px,2.5%,28px);top:clamp(10px,3%,28px);bottom:auto;width:min(320px,42%);transform-origin:top left;transform:translateY(-8px) scale(.985)}.hs-panel.open{transform:none}}\n.hs-panel::before{content:\"\";position:absolute;left:0;top:18px;bottom:18px;width:2px;background:var(--lime);border-radius:2px}\n.hs-k{font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;color:var(--lime);margin:0 0 6px}\n.hs-t{font-size:1.45rem;font-weight:700;font-stretch:112%;margin:0 0 8px;color:var(--ivory)}\n.hs-d{color:#DCD5CD;font-size:.96rem;line-height:1.55;margin:0 0 16px}\n.hs-acts{display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center}\n.hs-panel .btn{background:var(--lime);border-color:var(--lime);color:var(--ink)}\n.hs-close{position:absolute;right:8px;top:8px;width:40px;height:40px;border-radius:50%;background:none;border:0;color:#CFC8BF;cursor:pointer;display:grid;place-items:center;transition:background 160ms var(--ease-out),color 160ms}\n.hs-close svg{width:16px;height:16px}\n.hs-close:hover{background:rgba(252,248,245,.08);color:var(--ivory)}\n.hs-list{display:none}\n\n/* Beleuchteter Rand auf dunklen Flächen */\n.hx .btn,.sx .btn,.finale .btn,.hs-panel .btn{transition:background 200ms var(--ease-out),color 200ms var(--ease-out),border-color 200ms var(--ease-out),box-shadow 260ms var(--ease-out),transform 220ms var(--ease-out)}\n@media (hover:hover) and (pointer:fine){.hx .btn:hover,.sx .btn:hover,.finale .btn:hover,.hs-panel .btn:hover{box-shadow:0 0 0 1px rgba(252,248,245,.55),0 0 26px -4px var(--glow)}}\n.hx .btn:focus-visible,.sx .btn:focus-visible,.finale .btn:focus-visible,.hs-panel .btn:focus-visible{outline:none;box-shadow:0 0 0 2px var(--lime),0 0 26px -4px var(--glow)}\n\n/* ---------- Leistungswelt (dunkel, schliesst an den Einstieg an) ---------- */\n.sx{background:linear-gradient(180deg,var(--night) 0%,#2a2724 100%);color:var(--ivory);position:relative;isolation:isolate;padding-top:clamp(48px,6vw,96px)}\n.sx::before{content:\"\";position:absolute;inset:0;z-index:-1;pointer-events:none;background-image:linear-gradient(rgba(220,197,168,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(220,197,168,.055) 1px,transparent 1px);background-size:72px 72px;-webkit-mask-image:linear-gradient(180deg,transparent,#000 20%,#000 80%,transparent);mask-image:linear-gradient(180deg,transparent,#000 20%,#000 80%,transparent)}\n.sx .num{color:#BDB5AB}.sx .num span{color:var(--lime)}\n.sx .display{color:#CFC8BF}.sx .display b{color:var(--ivory)}\n.sx-item{border-bottom-color:rgba(252,248,245,.1)}\n.sx-list{border-top:1px solid rgba(252,248,245,.1)}\n.sx-head{color:#A9A29A}\n.sx-head:hover,.sx-item.on .sx-head{color:var(--ivory)}\n.sx-head .n{color:var(--lime)!important}\n.sx-head .ico{color:#8E877F}\n.sx-item.on .sx-head .ico{color:var(--lime)}\n.sx-head .chev{color:var(--ivory)}\n.sx-head:focus-visible{outline-color:var(--lime)}\n.sx-ind{background:linear-gradient(90deg,rgba(220,197,168,.16),rgba(220,197,168,0) 85%);box-shadow:inset 2px 0 0 var(--lime),-8px 0 22px -10px var(--glow)}\n.sx-right{background:none!important;box-shadow:none!important}\n.sx-stage{background:#1c1a18;box-shadow:0 40px 80px -40px rgba(0,0,0,.8);border-radius:8px}\n.sx-stage::after{content:\"\";position:absolute;inset:12px;z-index:3;pointer-events:none;background:linear-gradient(var(--lime),var(--lime)) top left/18px 1px,linear-gradient(var(--lime),var(--lime)) top left/1px 18px,linear-gradient(var(--lime),var(--lime)) top right/18px 1px,linear-gradient(var(--lime),var(--lime)) top right/1px 18px,linear-gradient(var(--lime),var(--lime)) bottom left/18px 1px,linear-gradient(var(--lime),var(--lime)) bottom left/1px 18px,linear-gradient(var(--lime),var(--lime)) bottom right/18px 1px,linear-gradient(var(--lime),var(--lime)) bottom right/1px 18px;background-repeat:no-repeat;opacity:.8}\n.sx-layer .ph{filter:saturate(.92) contrast(1.02)}\n.sx-tag{background:rgba(37,35,33,.75)!important;color:var(--ivory)!important;border:1px solid var(--glass-b);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}\n.sx-count{background:rgba(37,35,33,.75)!important;color:#BDB5AB!important;border:1px solid var(--glass-b)}\n.sx-count b{color:var(--ivory)!important}\n.sx-detail{background:var(--glass)!important;border:1px solid var(--glass-b)!important;border-radius:8px!important;color:var(--ivory);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);margin-top:14px}\n.sx-detail p{color:#DCD5CD!important}\n.sx-detail .n{color:var(--lime)!important}\n.sx-detail .btn{background:var(--lime);border-color:var(--lime);color:var(--ink)}\n.sx .tlink{color:var(--ivory)}\n.sx .tlink::after{background:var(--lime)}\n.sx .figcaption,.sx figcaption{background:rgba(37,35,33,.8)!important;color:#DCD5CD!important}\n@media (max-width:900px){\n  .sx-mob{border-top-color:rgba(252,248,245,.1)}\n  .sx-card{border-bottom-color:rgba(252,248,245,.1)}\n  .sx-cb h3{color:var(--ivory)}\n  .sx-cb p{color:#CFC8BF}\n  .sx-cb .n{color:var(--lime)}\n  .sx-cb h3 .ico{color:var(--lime)}\n  .sx-card:first-child p{color:#E3DDD6}\n  .sx-cimg{box-shadow:0 0 0 1px rgba(220,197,168,.18)}\n}\n\n/* ---------- Navigation: wandernde Markierung ---------- */\n.nav{position:relative}\n.nav-ind{position:absolute;left:0;bottom:-6px;width:100px;height:2px;background:var(--sand-d);transform-origin:left;border-radius:2px;pointer-events:none;opacity:0;transition:transform 320ms var(--ease-out),opacity 200ms var(--ease-out)}\n.nav>a::after{display:none!important}\n\n/* ---------- Über, Kontakt, Footer: dieselbe Bildsprache ---------- */\n.vcard{border-radius:10px}\n.vcard::after{content:\"\";position:absolute;inset:10px;pointer-events:none;background:linear-gradient(var(--sand-d),var(--sand-d)) top right/16px 1px,linear-gradient(var(--sand-d),var(--sand-d)) top right/1px 16px,linear-gradient(var(--sand-d),var(--sand-d)) bottom left/16px 1px,linear-gradient(var(--sand-d),var(--sand-d)) bottom left/1px 16px;background-repeat:no-repeat;opacity:.7}\n.finale::before{content:\"\";position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(220,197,168,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(220,197,168,.05) 1px,transparent 1px);background-size:72px 72px;-webkit-mask-image:radial-gradient(ellipse 60% 60% at 20% 20%,#000 10%,transparent 70%);mask-image:radial-gradient(ellipse 60% 60% at 20% 20%,#000 10%,transparent 70%)}\n.finale{position:relative;isolation:isolate}\n.finale .form{border-radius:10px}\n.ftr{position:relative}\n.ftr::before{content:\"\";position:absolute;left:0;right:0;top:0;height:1px;background:linear-gradient(90deg,transparent,var(--sand-d) 30%,var(--sand-d) 70%,transparent);opacity:.6}\n\n/* ---------- Smartphone: stabile Darstellung, sichtbare Schaltflächen ---------- */\n@media (max-width:900px){\n  .hx-grid{grid-template-columns:minmax(0,1fr);min-height:0}\n  .hx-stage{order:0;margin:0;max-height:none;aspect-ratio:5/4}\n  .hx-copy{order:1}\n  .hs-lbl{opacity:1;transform:translate(0,-50%);font-size:.72rem;padding:4px 8px}\n  .hs-panel{position:relative;left:auto;bottom:auto;width:auto;margin:0}\n  .hx-stage .hs-panel{position:absolute;left:10px;right:10px;bottom:10px;width:auto}\n  .hs-list{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 var(--gut) 28px;position:relative;z-index:1}\n  .hs-list button{display:flex;align-items:center;gap:10px;min-height:48px;padding:10px 12px;border-radius:8px;background:var(--glass);border:1px solid var(--glass-b);color:var(--ivory);font-weight:600;font-size:.9rem;text-align:left;cursor:pointer;transition:background 160ms var(--ease-out),border-color 160ms,transform 140ms var(--ease-out)}\n  .hs-list button:active{transform:scale(.97)}\n  .hs-list button[aria-expanded=\"true\"]{border-color:var(--lime);background:rgba(220,197,168,.12)}\n  .hs-list .hs-dot{width:10px;height:10px;box-shadow:0 0 0 3px rgba(220,197,168,.2)}\n}\n@media (max-width:420px){.hs-lbl{display:none}}\n@media (max-width:900px){.hs-panel.hs-out{position:relative;left:auto;right:auto;bottom:auto;width:auto;margin:0 var(--gut) 28px;transform-origin:top center}}\n.hs-panel.hs-out:not(.open){transform:translateY(-6px)}\n\n/* Reduzierte Bewegung */\n@media (prefers-reduced-motion:reduce){\n  .js .hs,.js .hx-stage .b3-poster{animation:none!important;opacity:1}\n  .hs-dot::after{animation:none!important;display:none}\n  .hs-panel,.hs-lbl,.hs-dot,.nav-ind,.b3-canvas,.hs-list button{transition:none!important}\n  .hs:active .hs-dot,.hs-list button:active{transform:none!important}\n}\n\n/* ===================== V11 · Rundgang durch den Wohnblock ===================== */\n#umsetzungPage p,#umsetzungPage li,#umsetzungPage td{overflow-wrap:anywhere}\n.jr{position:relative;background:var(--night);color:var(--ivory)}\n.jr-live{height:760vh}\n.jr-sticky{position:relative}\n.jr-live .jr-sticky{position:sticky;top:0;height:100vh;height:100svh;overflow:hidden}\n.jr-stage{position:absolute;inset:0;background:radial-gradient(ellipse 70% 70% at 60% 45%,#34302c 0%,var(--night) 75%)}\n.jr-stage::after{content:\"\";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(37,35,33,.55) 0%,rgba(37,35,33,.2) 34%,rgba(37,35,33,0) 55%)}\n.jr-st:not(.jr-st0){background:rgba(37,35,33,.78);border:1px solid var(--glass-b);-webkit-backdrop-filter:blur(14px) saturate(120%);backdrop-filter:blur(14px) saturate(120%);border-radius:12px;padding:28px 30px 26px;box-shadow:0 30px 70px -40px rgba(0,0,0,.8);max-width:480px}\n.jr-st:not(.jr-st0)::before{content:\"\";position:absolute;left:0;top:24px;bottom:24px;width:2px;background:var(--lime);border-radius:2px}\n.jr-still,.jr-canvas{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}\n.jr-still{opacity:0;transition:opacity 420ms var(--ease-out)}\n.jr-still.on{opacity:1}\n.jr-canvas{opacity:0;transition:opacity 500ms var(--ease-out)}\n.jr-live.jr-ready .jr-canvas{opacity:1}\n.jr-live.jr-ready .jr-still{opacity:0!important}\n.jr-tag{position:absolute;left:16px;bottom:14px;z-index:3;font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;color:#BDB5AB;background:rgba(37,35,33,.6);padding:4px 8px;border-radius:2px}\n/* Technisches Overlay im Bad */\n.jr-tech{position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;transition:opacity 300ms var(--ease-out)}\n.jr-live.jr-ready.jr-hi .jr-tech{opacity:1}\n.jr-tech span{position:absolute;left:var(--x);top:var(--y);transform:translate(14px,-50%);font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--ivory);background:rgba(37,35,33,.75);border:1px solid var(--glass-b);padding:5px 9px;border-radius:999px;white-space:nowrap}\n.jr-tech span::before{content:\"\";position:absolute;left:-14px;top:50%;width:8px;height:8px;margin-top:-4px;border-radius:50%;background:var(--lime);box-shadow:0 0 0 4px rgba(220,197,168,.25)}\n/* Texte und Bedienung */\n.jr-ui{position:relative;z-index:4;height:100%;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;padding-top:110px;padding-bottom:40px}\n.jr-st{grid-column:1;grid-row:1;max-width:560px}\n.js .jr-st{opacity:0;transform:translateY(14px);visibility:hidden;transition:opacity 300ms var(--ease-out),transform 420ms var(--ease-out),visibility 0s 300ms}\n.js .jr-st.on{opacity:1;transform:none;visibility:visible;transition:opacity 360ms var(--ease-out) 80ms,transform 520ms var(--ease-out) 80ms,visibility 0s}\n.jr-st0{max-width:700px}\n.jr .hx-title{color:#CFC8BF;font-size:clamp(2.6rem,4.3vw,4.8rem)}\n.jr .hx-title b{color:var(--ivory)}\n.jr .hx-kicker{color:#BDB5AB}\n.jr .hx-sub{color:#E3DDD6;margin-top:18px}\n.jr-k{font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;color:var(--lime);margin:0 0 14px}\n.jr-t{overflow-wrap:normal;word-break:normal;hyphens:manual;font-size:clamp(2rem,3.2vw,3.2rem);font-weight:720;font-stretch:115%;line-height:1;letter-spacing:-.02em;margin:0 0 16px;color:var(--ivory)}\n.jr-d{font-size:clamp(1.05rem,1.4vw,1.25rem);color:#E3DDD6;max-width:34ch;line-height:1.5;margin:0 0 26px}\n.jr-big{overflow-wrap:normal;hyphens:manual;font-size:clamp(2.2rem,3.8vw,3.9rem);font-weight:300;font-stretch:118%;line-height:.98;letter-spacing:-.025em;color:#CFC8BF;margin:0 0 20px}\n.jr-big b{font-weight:760;color:var(--ivory)}\n.jr-q{font-size:clamp(1.15rem,1.6vw,1.45rem);color:var(--ivory);margin:0 0 22px;font-weight:600}\n.jr-acts{display:flex;flex-wrap:wrap;gap:12px 22px;align-items:center}\n.jr .btn:not(.ghost){background:var(--lime);border-color:var(--lime);color:var(--ink)}\n.jr .btn.ghost{color:var(--ivory);border-color:rgba(252,248,245,.4)}\n.jr .tlink{color:var(--ivory)}\n@media (hover:hover) and (pointer:fine){.jr .btn:hover{box-shadow:0 0 0 1px rgba(252,248,245,.55),0 0 26px -4px var(--glow)}}\n.jr .btn:focus-visible{outline:none;box-shadow:0 0 0 2px var(--lime),0 0 26px -4px var(--glow)}\n/* Stationsnavigation */\n.jr-steps{display:none}\n.jr-button .jr-steps{display:flex;gap:10px;position:absolute;left:var(--gut);bottom:28px;z-index:5}\n.jr-stepb{min-height:44px;padding:10px 18px;border-radius:999px;background:rgba(37,35,33,.7);border:1px solid var(--glass-b);color:var(--ivory);font-weight:600;cursor:pointer;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);transition:background 160ms var(--ease-out),transform 140ms var(--ease-out)}\n.jr-stepb:hover{background:rgba(37,35,33,.85)}.jr-stepb:active{transform:scale(.97)}.jr-stepb:focus-visible{outline:2px solid var(--lime);outline-offset:2px}\n.jr-button{height:100vh!important;height:100svh!important}\n.jr-button .jr-bar{display:none}\n.jr-skip-l{}\n.jr-live .jr-nav{background:rgba(37,35,33,.62);border:1px solid rgba(252,248,245,.08);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-radius:14px;padding:10px 10px 10px 6px}\n.jr-live .jr-skip{background:rgba(37,35,33,.62);border:1px solid rgba(252,248,245,.08);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-radius:999px;padding:4px 18px}\n.jr-st.jr-st5{max-width:600px}\n.jr-nav{grid-column:2;grid-row:1;align-self:center;position:relative;display:flex;gap:14px}\n.jr-nav ol{list-style:none;margin:0;padding:0;display:grid;gap:4px}\n.jr-nav button{display:flex;align-items:center;gap:12px;background:none;border:0;color:#A9A29A;cursor:pointer;padding:8px 10px 8px 6px;border-radius:999px;min-height:40px;font-size:.84rem;font-weight:600;transition:color 160ms var(--ease-out),background 160ms var(--ease-out),transform 140ms var(--ease-out)}\n.jr-nav .jr-n{font-variant-numeric:tabular-nums;font-size:.72rem;letter-spacing:.1em;color:#8E877F;transition:color 160ms}\n.jr-nav button:hover,.jr-nav button:focus-visible{color:var(--ivory);background:rgba(252,248,245,.06)}\n.jr-nav button.on{color:var(--ivory)}\n.jr-nav button.on .jr-n{color:var(--lime)}\n.jr-nav button:active{transform:scale(.97)}\n.jr-nav button:focus-visible{outline:2px solid var(--lime);outline-offset:1px}\n.jr-bar{width:2px;background:rgba(252,248,245,.14);border-radius:2px;overflow:hidden}\n.jr-bar i{display:block;width:100%;height:100%;background:var(--lime);transform-origin:top;transform:scaleY(0)}\n.jr-static .jr-bar{display:none}\n.jr-skip{position:absolute;right:var(--gut);bottom:28px;display:flex;gap:18px;align-items:center;z-index:5}\n.jr-skip a{color:#E3DDD6;font-size:.86rem;font-weight:600;text-decoration:none;display:inline-flex;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid rgba(220,197,168,.45);transition:color 160ms,border-color 160ms}\n.jr-skip a:hover,.jr-skip a:focus-visible{color:var(--ivory);border-color:var(--lime)}\n.jr-skip .arr{width:14px}\n/* Statischer Modus (Smartphone, reduzierte Bewegung, ohne WebGL): Stationsbilder mit kurzen Wechseln */\n.jr-static .jr-sticky{display:grid;grid-template-rows:auto auto}\n.jr-static .jr-stage{position:relative;inset:auto;aspect-ratio:16/10;max-height:72vh}\n.jr-static .jr-stage::after{background:linear-gradient(0deg,rgba(37,35,33,.55),rgba(37,35,33,0) 40%)}\n.jr-static .jr-canvas,.jr-static .jr-tech{display:none}\n.jr-static .jr-ui{align-items:start;padding-top:26px;padding-bottom:30px;grid-template-columns:minmax(0,1fr);gap:22px;height:auto}\n.js .jr-static .jr-st{grid-row:1;align-self:start;transition:opacity 260ms var(--ease-out),transform 320ms var(--ease-out),visibility 0s 260ms}\n.jr-static .jr-nav{grid-column:1;grid-row:2;display:block}\n.jr-static .jr-nav ol{grid-template-columns:repeat(6,minmax(0,1fr));gap:6px}\n.jr-static .jr-nav button{flex-direction:column;gap:2px;padding:8px 2px;border-radius:8px;background:rgba(252,248,245,.04);border:1px solid rgba(252,248,245,.08);min-height:52px;width:100%;font-size:.72rem;justify-content:center}\n.jr-static .jr-nav button.on{border-color:var(--lime);background:rgba(220,197,168,.12)}\n.jr-static .jr-skip{position:static;grid-row:3}\n@media (min-width:701px){.jr-static .jr-stage{max-height:none}}\n@media (max-width:980px){.jr-live .jr-ui{grid-template-columns:minmax(0,1fr)}.jr-live .jr-nav{position:absolute;right:var(--gut);top:110px}.jr-live .jr-nav .jr-l{display:none}}\n@media (max-width:700px){\n  .jr .hx-title{font-size:clamp(2.3rem,10vw,3.2rem)}\n  .jr-t{font-size:clamp(1.9rem,8vw,2.6rem)}\n  .jr-static .jr-stage{aspect-ratio:4/3}\n  .jr-static .jr-nav .jr-l{font-size:.66rem}\n  .jr-skip{flex-wrap:wrap}\n}\n@media (prefers-reduced-motion:reduce){\n  .jr-st,.jr-st.on,.jr-still,.jr-canvas,.jr-tech,.jr-nav button{transition:none!important}\n  .jr-nav button:active{transform:none!important}\n}\n.jr-static .jr-still:nth-of-type(1),.jr-static .jr-still:nth-of-type(6){object-position:78% 50%}\n\n/* V12: Kennzeichnung im Stationsmodus oben, damit sie die Bedienknöpfe nicht überdeckt */\n.jr-button .jr-tag{bottom:auto;top:14px}\n\n/* ===================== V13 · «Digital Twin at Dusk» – Rundgang-Oberfläche =====================\n   Ruhige Typografie direkt auf der Szene (Verlauf statt Karten), Stationsnavigation mit Punkten und Namen,\n   kurze Zustandswechsel (140–260 ms), keine Magnet-Effekte, kein eigener Cursor. */\n.jr{background:#1d2129}\n.jr-stage{background:linear-gradient(180deg,#19202d 0%,#283041 36%,#4e4c58 70%,#7d6c66 100%)}\n.jr-stage::after{background:linear-gradient(90deg,rgba(20,22,28,.74) 0%,rgba(20,22,28,.5) 30%,rgba(20,22,28,.12) 52%,rgba(20,22,28,0) 64%),linear-gradient(0deg,rgba(20,22,28,.45) 0%,rgba(20,22,28,0) 22%)}\n.jr-pic{display:contents}\n.jr-st:not(.jr-st0){background:none;border:0;-webkit-backdrop-filter:none;backdrop-filter:none;box-shadow:none;border-radius:0;padding:4px 0 4px 24px;max-width:500px}\n.jr-st:not(.jr-st0)::before{top:8px;bottom:8px;width:2px;opacity:.9}\n.jr-st h1,.jr-st h2,.jr-st p{text-shadow:0 1px 18px rgba(12,13,17,.45)}\n.jr .hx-title{color:#D8D0C6;font-size:clamp(2.4rem,3.5vw,4.1rem);font-stretch:110%}\n.jr .hx-title .ln>span{white-space:normal}\n.jr-st{position:relative}\n.jr-k{color:var(--lime);letter-spacing:.22em}\n.jr-t{font-size:clamp(2rem,3.1vw,3.15rem);font-weight:720;line-height:1.02;margin:0 0 18px;text-wrap:balance}\n.jr-t span{display:block;font-weight:300;color:#DDD5CB;font-stretch:112%}\n.jr-d{color:#E8E2DA;max-width:36ch}\n.jr-big{font-size:clamp(2.1rem,3.4vw,3.6rem);text-wrap:balance}\n.jr-q{font-size:clamp(1.02rem,1.3vw,1.2rem);font-weight:400;color:#E8E2DA;max-width:42ch;line-height:1.5;margin:0 0 26px}\n/* Schaltflächen: direkte Rückmeldung beim Drücken, Pfeil bewegt sich nur bei Zeigergeräten */\n.jr .btn{transition:background 160ms var(--ease-out),border-color 160ms var(--ease-out),color 160ms,box-shadow 200ms var(--ease-out),transform 140ms var(--ease-out)}\n.jr .btn:active{transform:scale(.97)}\n.jr .btn .arr,.jr .btn .a{transition:transform 200ms var(--ease-out)}\n@media (hover:hover) and (pointer:fine){.jr .btn:hover .arr,.jr .btn:hover .a{transform:translateX(3px)}.jr .btn:not(.ghost):hover{background:#E6D3BA;border-color:#E6D3BA}}\n.jr .btn.ghost{background:rgba(20,22,28,.3);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}\n.jr .btn.ghost:hover{border-color:rgba(252,248,245,.75)}\n/* Stationsnavigation: sechs Punkte mit Namen, aktuelle Station hervorgehoben */\n.jr-nav{gap:0}\n.jr-live .jr-nav{background:rgba(20,22,28,.46);border:1px solid rgba(252,248,245,.09);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-radius:18px;padding:8px 8px 8px 6px}\n.jr-nav ol{gap:2px;position:relative;z-index:1}\n.jr-nav button{gap:12px;min-height:42px;padding:6px 16px 6px 10px;color:#CBC3B9;font-size:.86rem;font-weight:600}\n.jr-dot{width:11px;height:11px;border-radius:50%;border:1.5px solid rgba(252,248,245,.62);background:#20232b;flex:none;transition:transform 220ms var(--ease-out),background 220ms var(--ease-out),border-color 220ms}\n.jr-nav button.on{color:var(--ivory)}\n.jr-nav button.on .jr-dot{background:var(--lime);border-color:var(--lime);transform:scale(1.3)}\n.jr-nav button:hover .jr-dot{border-color:var(--ivory)}\n.jr-nav button:focus-visible{outline:2px solid var(--lime);outline-offset:2px;background:rgba(252,248,245,.08)}\n.jr-live .jr-bar{position:absolute;left:21px;top:28px;bottom:28px;width:1px;background:rgba(252,248,245,.2);z-index:0}\n.jr-live .jr-bar i{background:var(--lime)}\n.jr-button .jr-bar{display:none}\n/* Überspringen / Offerte jederzeit erreichbar */\n.jr-live .jr-skip{background:rgba(20,22,28,.5);padding:4px 6px;gap:4px}\n.jr-skip a,.jr-skip button{color:#ECE6DE;font:600 .86rem/1.2 inherit;text-decoration:none;display:inline-flex;gap:8px;align-items:center;min-height:40px;padding:8px 14px;border:0;border-radius:999px;background:none;cursor:pointer;transition:background 160ms var(--ease-out),color 160ms}\n.jr-skip a:hover,.jr-skip button:hover,.jr-skip a:focus-visible,.jr-skip button:focus-visible{background:rgba(252,248,245,.1);color:var(--ivory);outline:none}\n.jr-skip a:focus-visible,.jr-skip button:focus-visible{box-shadow:0 0 0 2px var(--lime)}\n.jr-skip .jr-skip-o{background:rgba(220,197,168,.16);color:var(--ivory)}\n/* Auswahl in der Wohnung: Radiogruppe, Text immer sichtbar (kein Hover nötig) */\n.jr-choice{max-width:440px}\n.jr-choice-opts{display:grid;gap:6px;margin:0 0 14px}\n.jr-choice-opts button{display:flex;align-items:center;gap:12px;min-height:46px;padding:10px 14px;border-radius:10px;border:1px solid rgba(252,248,245,.2);background:rgba(20,22,28,.4);color:#E6DFD6;font:600 .96rem/1.25 inherit;text-align:left;cursor:pointer;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);transition:background 160ms var(--ease-out),border-color 160ms var(--ease-out),color 160ms,transform 140ms var(--ease-out)}\n.jr-choice-opts button:hover{border-color:rgba(252,248,245,.42);color:var(--ivory)}\n.jr-choice-opts button[aria-checked=\"true\"]{border-color:var(--lime);background:rgba(220,197,168,.18);color:var(--ivory)}\n.jr-choice-opts button:active{transform:scale(.98)}\n.jr-choice-opts button:focus-visible{outline:2px solid var(--lime);outline-offset:2px}\n.jr-rd{width:16px;height:16px;border-radius:50%;border:1.5px solid rgba(252,248,245,.6);flex:none;display:grid;place-items:center;transition:border-color 160ms}\n.jr-rd::after{content:\"\";width:8px;height:8px;border-radius:50%;background:var(--lime);transform:scale(0);transition:transform 220ms var(--ease-out)}\n[aria-checked=\"true\"] .jr-rd{border-color:var(--lime)}\n[aria-checked=\"true\"] .jr-rd::after{transform:scale(1)}\n.jr-choice-tx{min-height:3em}\n.jr-choice-t{margin:0 0 18px;color:#E8E2DA;font-size:1rem;line-height:1.5;max-width:40ch;animation:jrChoiceIn 260ms var(--ease-out)}\n@keyframes jrChoiceIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}\n.jr-st[data-k=\"wohnung\"] .jr-d{margin-bottom:14px}\n/* Schematische Kennzeichnung im Bad */\n.jr-tech span{background:rgba(20,22,28,.78)}\n.jr-tech-c{position:absolute;left:50%;top:96px;transform:translateX(-50%);font-style:normal;font-size:.64rem;letter-spacing:.18em;text-transform:uppercase;color:#E3DDD6;background:rgba(20,22,28,.6);border:1px solid rgba(252,248,245,.12);padding:5px 10px;border-radius:999px;white-space:nowrap}\n.jr-button .jr-tech-c{top:16px}\n/* V17: Beschriftungen aus data-l (kein Textknoten), Bildunterschrift direkt bei den Markierungen (Lage aus dem Rundgang) */\n.jr-tech span::after,.jr-tech-c::after{content:attr(data-l)}\n.jr-tech-c{left:var(--cx,50%);top:var(--cy,96px)}\n.jr-tech span.l{transform:translate(calc(-100% - 14px),-50%)}\n.jr-tech span.l::before{left:auto;right:-14px}\n/* Tablet (≤980 px): Stationsleiste waagrecht unten, Namen sichtbar; Hochformat: Text unten, Motiv oben (Bildverschiebung im Kern) */\n@media (max-width:980px){\n  .jr-live .jr-ui{grid-template-columns:minmax(0,1fr)}\n  .jr-live .jr-nav{grid-column:auto;grid-row:auto;position:absolute;left:0;right:0;top:auto;bottom:80px;margin:0 auto;width:max-content;max-width:calc(100% - 24px);overflow-x:auto;z-index:5;padding:5px 6px;border-radius:999px;scrollbar-width:none}\n  .jr-live .jr-nav ol{display:flex;gap:0}\n  .jr-live .jr-nav .jr-l{display:inline}\n  .jr-live .jr-nav button{min-height:44px;padding:6px 12px 6px 10px;gap:8px;white-space:nowrap}\n  .jr-live .jr-bar{display:none}\n  .jr-live .jr-st{max-width:560px}\n}\n@media (max-width:980px) and (orientation:portrait){\n  .jr-live .jr-ui{align-items:end;padding-bottom:146px}\n  .jr-live .jr-stage::after{background:linear-gradient(0deg,rgba(20,22,28,.88) 0%,rgba(20,22,28,.66) 30%,rgba(20,22,28,0) 58%)}\n}\n/* Statischer Modus (Smartphone, reduzierte Bewegung, ohne WebGL): Bild → Stationswahl → Text */\n.jr-static{background:#1d2129}\n.jr-static .jr-stage::after{background:linear-gradient(0deg,rgba(29,33,41,.5),rgba(29,33,41,0) 30%)}\n.jr-static .jr-ui{gap:18px;padding-top:14px}\n.jr-static .jr-nav{grid-row:1;background:none;border:0;padding:0}\n.js .jr-static .jr-st,.jr-static .jr-st{grid-row:2}\n.jr-static .jr-skip{grid-row:3;justify-content:flex-start;flex-wrap:wrap}\n.jr-static .jr-nav ol{grid-template-columns:repeat(6,minmax(0,1fr));gap:4px}\n.jr-static .jr-nav button{flex-direction:column;gap:7px;min-height:58px;padding:9px 2px 8px;border-radius:10px;background:rgba(252,248,245,.05);border:1px solid rgba(252,248,245,.1);font-size:.7rem;justify-content:center;width:100%}\n.jr-static .jr-nav button.on{border-color:var(--lime);background:rgba(220,197,168,.14)}\n.jr-static .jr-st:not(.jr-st0){padding-left:18px}\n.jr-static .jr-st h1,.jr-static .jr-st h2,.jr-static .jr-st p{text-shadow:none}\n@media (max-width:700px){\n  .jr-static .jr-stage{aspect-ratio:8/9;max-height:none}\n  .jr-static .jr-still{object-position:50% 50%!important}\n  .jr-t{font-size:clamp(1.8rem,7.6vw,2.4rem)}\n  .jr-big{font-size:clamp(2rem,8.4vw,2.6rem)}\n  .jr-choice-opts button{min-height:48px}\n  .demo{font-size:.74rem}.demo .wrap{gap:4px 12px;padding-block:6px}\n}\n@media (prefers-reduced-motion:reduce){\n  .jr .btn,.jr .btn .arr,.jr .btn .a,.jr-dot,.jr-choice-opts button,.jr-rd::after,.jr-skip a,.jr-skip button{transition:none!important}\n  .jr-choice-t{animation:none}\n  .jr .btn:active,.jr-choice-opts button:active{transform:none}\n}\n/* V15 · Leistungspunkte im 3D-Bild: erscheinen nur, wenn die Kamera an der Station ruht; zwei ruhige Impulse, danach still.\n   Die Oberfläche lässt Klicks auf leere Flächen zur Szene durch, Karten und Navigation bleiben voll bedienbar. */\n.jr-live .jr-ui{pointer-events:none}\n.jr-live .jr-ui>*{pointer-events:auto}\n.jr-hot{position:absolute;left:var(--x);top:var(--y);z-index:3;display:flex;align-items:center;gap:6px;min-height:44px;margin:-22px 0 0 -22px;padding-right:4px;text-decoration:none;color:var(--ivory);opacity:0;visibility:hidden;transform:translateY(6px);transition:opacity 240ms var(--ease-out),transform 340ms var(--ease-out),visibility 0s 240ms}\n.jr-live.jr-ready .jr-hot.on{opacity:1;visibility:visible;transform:none;transition:opacity 320ms var(--ease-out) 160ms,transform 440ms var(--ease-out) 160ms,visibility 0s}\n.jr-hot.l{flex-direction:row-reverse;transform:translate(calc(-100% + 44px),6px)}\n.jr-live.jr-ready .jr-hot.l.on{transform:translate(calc(-100% + 44px),0)}\n.jr-hot-d{position:relative;width:44px;height:44px;flex:none;display:grid;place-items:center}\n.jr-hot-d::before{content:\"\";width:12px;height:12px;border-radius:50%;background:var(--lime);box-shadow:0 0 0 5px rgba(220,197,168,.24),0 2px 10px rgba(0,0,0,.45);transition:transform 160ms var(--ease-out),box-shadow 200ms var(--ease-out)}\n.jr-hot-d::after{content:\"\";position:absolute;inset:6px;border-radius:50%;border:1px solid rgba(220,197,168,.75);opacity:0}\n.jr-live.jr-ready .jr-hot.on .jr-hot-d::after{animation:jrHot 1.7s var(--ease-out) .35s 2}\n@keyframes jrHot{0%{transform:scale(.45);opacity:.9}100%{transform:scale(1.2);opacity:0}}\n.jr-hot-l{font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;font-weight:650;background:rgba(20,22,28,.74);border:1px solid rgba(252,248,245,.16);padding:6px 11px;border-radius:999px;white-space:nowrap;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);transition:background 160ms var(--ease-out),border-color 160ms var(--ease-out)}\n@media (hover:hover) and (pointer:fine){.jr-hot:hover .jr-hot-l{background:rgba(20,22,28,.92);border-color:var(--lime)}.jr-hot:hover .jr-hot-d::before{transform:scale(1.25);box-shadow:0 0 0 7px rgba(220,197,168,.3),0 2px 10px rgba(0,0,0,.45)}}\n.jr-hot:active .jr-hot-d::before{transform:scale(.82);transition-duration:80ms}\n.jr-hot:focus-visible{outline:none}\n.jr-hot:focus-visible .jr-hot-l{border-color:var(--lime);box-shadow:0 0 0 2px var(--lime)}\n.jr-static .jr-hot{display:none}\n/* V16 · Ansicht wählen (Übersicht · Waschtisch · WC): Segmentschalter, Touchziele ≥ 44 px */\n.jr-det{display:flex;flex-wrap:wrap;gap:6px;margin:-8px 0 20px}\n.jr-detb{min-height:44px;padding:8px 14px;border-radius:999px;border:1px solid rgba(252,248,245,.22);background:rgba(20,22,28,.4);color:#E6DFD6;font:600 .86rem/1.2 inherit;cursor:pointer;transition:background 160ms var(--ease-out),border-color 160ms var(--ease-out),color 160ms,transform 140ms var(--ease-out)}\n.jr-detb[aria-pressed=\"true\"]{background:rgba(220,197,168,.16);border-color:var(--lime);color:var(--ivory)}\n@media (hover:hover) and (pointer:fine){.jr-detb:hover{border-color:rgba(252,248,245,.5);color:var(--ivory)}}\n.jr-detb:active{transform:scale(.97);transition-duration:80ms}\n.jr-detb:focus-visible{outline:2px solid var(--lime);outline-offset:2px}\n@media (prefers-reduced-motion:reduce){.jr-detb{transition:none}.jr-detb:active{transform:none}}\n@media (prefers-reduced-motion:reduce){.jr-hot,.jr-live.jr-ready .jr-hot.on,.jr-live.jr-ready .jr-hot.l.on{transition:none}.jr-live.jr-ready .jr-hot.on .jr-hot-d::after{animation:none}.jr-hot:active .jr-hot-d::before{transform:none}}\n\n/* ===================== V17 · Smartphone-Feinschliff =====================\n   Kontaktleiste flacher und mit reserviertem Platz (Safe Area), Logo grösser bei flacherem Kopf (transparente Ränder des\n   Original-PNG dienen als Innenabstand – nichts beschnitten oder verzerrt), Stationsleiste waagrecht scrollbar mit Einrasten,\n   Bild 10:9 (weniger leerer Himmel), kompaktes Formular. */\n@media (max-width:760px){\n  .demo{font-size:.7rem;line-height:1.35}.demo .wrap{gap:2px 10px;padding-block:5px}.demo label,.demo a{font-size:.7rem}\n  .hdr .wrap{min-height:0;gap:10px}\n  .logo{padding:0;margin-left:-6px}\n  .logo img,body.hdr-compact .logo img{height:104px}\n  body.hdr-compact .hdr .wrap{min-height:0}\n  .hdr-call,.burger{width:46px;height:46px;min-width:46px}\n  .hdr-call{margin-left:auto;margin-right:2px}\n  .mbar{padding:6px 12px calc(6px + env(safe-area-inset-bottom,0px));gap:8px}\n  .mbar a{min-height:44px;padding:9px 10px;font-size:.95rem}\n  body.has-mbar{padding-bottom:calc(56px + env(safe-area-inset-bottom,0px))}\n  body.kb-open .mbar{display:none}\n}\n/* beim Scrollen: wie bisher per Transform (Kopf 26 px nach oben, Logo × 0,75) – keine Layoutverschiebung */\n@media (max-width:380px){.logo img,body.hdr-compact .logo img{height:96px}}\n@media (min-width:420px) and (max-width:760px){.logo img,body.hdr-compact .logo img{height:112px}}\n@media (max-width:700px){\n  .jr-static .jr-stage{aspect-ratio:10/9}\n  .jr-static .jr-ui{gap:14px;padding-top:12px;padding-bottom:22px}\n  .jr-static .jr-nav{margin-inline:calc(var(--gut) * -1);padding:2px var(--gut);overflow-x:auto;overflow-y:hidden;scroll-snap-type:x proximity;scroll-padding-inline:var(--gut);scrollbar-width:none;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}\n  .jr-static .jr-nav::-webkit-scrollbar{display:none}\n  .jr-static .jr-nav ol{display:flex;gap:8px;width:max-content;grid-template-columns:none}\n  .jr-static .jr-nav li{scroll-snap-align:start;flex:none}\n  .jr-static .jr-nav li:last-child{padding-right:var(--gut)}\n  .jr-static .jr-nav button{flex-direction:row;gap:8px;min-height:44px;padding:8px 16px 8px 12px;border-radius:999px;font-size:.86rem;width:auto;white-space:nowrap}\n  .jr-static .jr-nav .jr-l{font-size:.86rem}\n  .jr-static .jr-st h1,.jr-static .jr-st .jr-t,.jr-static .jr-st .jr-big{text-wrap:balance}\n  /* Formular: kompakte Leistungskarten, Silbentrennung nur am weichen Trennstrich («Immobilien-präsentation») */\n  .opts{gap:6px}\n  .opt span{min-height:46px;padding:9px 10px;gap:8px;font-size:.92rem;line-height:1.22;hyphens:manual;-webkit-hyphens:manual}\n  .opt span::before{width:14px;height:14px}\n  .demo-flag{padding:10px 12px;font-size:.88rem;gap:2px}\n  .fgroup{gap:14px;padding-bottom:22px;margin-bottom:22px}\n}\n@media (max-width:700px){\n  .demo .wrap{display:block}.demo .sp{display:none}.demo label{margin-right:12px}\n  .jr-static .hx-title{font-size:clamp(1.6rem,7.6vw,2.3rem);line-height:1.06;margin-bottom:12px}\n  .jr-static .hx-title .ln>span{white-space:normal}\n  .jr-static .hx-kicker{letter-spacing:.12em;margin-bottom:10px}\n  .jr-static .jr-st0{padding-top:4px}\n  .jr-static .hx-sub{margin-top:10px}\n  .jr-static .jr-tag{font-size:.58rem;letter-spacing:.1em;left:12px;bottom:10px;max-width:calc(100% - 24px)}\n}\n\n.opt{display:flex}.opt span{flex:1}\n/* Offertseite (Smartphone): Formular zuerst, Kontaktangaben danach; flacherer Seitenkopf */\n@media (max-width:700px){\n  .formwrap{display:flex;flex-direction:column;gap:36px}\n  #formSlotPage{order:-1}\n  [data-page=\"offerte\"] .phead .wrap{padding-block:22px 18px}\n  [data-page=\"offerte\"] .phead h1{margin:4px 0 10px;font-size:2rem}\n  [data-page=\"offerte\"] .phead .lead{font-size:1rem;line-height:1.45}\n  [data-page=\"offerte\"] .sec{padding-top:22px!important}\n}\n/* Einmalig / Regelmässig: Segmentwahl, ganze Fläche klickbar, Auswahl deutlich */\n.opts.seg{display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid var(--line);border-radius:999px;padding:3px;background:#fff;max-width:420px}\n.opts.seg .opt span{min-height:44px;justify-content:center;border:0;border-radius:999px;background:transparent;padding:8px 12px;font-weight:600}\n.opts.seg .opt span::before{display:none}\n.opts.seg .opt input:checked+span{background:var(--ink);color:var(--ivory)}\n.opts.seg .opt input:focus-visible+span{outline:2px solid var(--ink);outline-offset:2px}\n\n/* V17: robust bei 200 % Textgrösse – Rasterspalten dürfen schrumpfen, lange Wörter und Adressen brechen um */\n.jr-static .jr-ui{grid-template-columns:minmax(0,1fr)}\n.jr-ui>*,.wrap>*,.ftr .wrap *,.formwrap>*,.sx *,.grid12>*{min-width:0}\nh1,h2,h3,h4,p,li,dd,dt,legend,label,.btn{overflow-wrap:break-word}\n@media (max-width:760px){h1,h2,h3,.display,.hx-title,.jr-big,.jr-t{overflow-wrap:break-word;-webkit-hyphens:auto;hyphens:auto}\n  main,footer,.mnav,.sec{overflow-wrap:anywhere}\n  .hw-list li{grid-template-columns:3rem minmax(0,1fr)}\n  .aud li{min-width:0;max-width:100%}\n  .side-l,.side-l>*{min-width:0}.side-l{grid-template-columns:minmax(0,1fr)}\n  .num:not(.world .num){display:block;letter-spacing:.14em}.num:not(.world .num) span{display:inline-block;margin-right:14px}\n  /* Leistungskarten: Spaltenbreite in em – bei normaler Schrift 2 Spalten ab ca. 380 px, bei grosser Schrift automatisch 1 Spalte */\n  .opts:not(.seg){grid-template-columns:repeat(auto-fill,minmax(min(100%,8.9em),1fr))}}\na[href^=\"mailto:\"],.ftr a,.aside-contact a,.copy-row a{overflow-wrap:anywhere}\n\n/* ===================== V17.1 · Release Candidate =====================\n   Kontaktleiste und kompakter Kopf deckend (vorher 97 % bzw. 90 % – Inhalte schienen durch), alle Bedienelemente ≥ 44 px */\n@media (max-width:760px){.mbar{background:var(--ivory)}}\nbody.hdr-compact .hdr{background:var(--ivory)}\n.btn.sm{min-height:44px}\n.jr-nav button{min-height:44px}\n.copy-btn{min-height:44px;min-width:44px;padding:8px 12px}\n/* 320 px bei 200 % Text: Rasterspalten und Knöpfe dürfen schrumpfen und umbrechen */\n.vcard{grid-template-columns:minmax(0,1fr)}.vcard .vc a,.vq li{min-width:0;overflow-wrap:anywhere}\n.mbar{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.mbar a{min-width:0;white-space:normal;text-align:center;overflow-wrap:anywhere}\n.lnk{max-width:100%;flex-wrap:wrap;overflow-wrap:anywhere}.tbc{white-space:normal;max-width:100%}\n.btn{max-width:100%;overflow-wrap:anywhere}.btn>span{min-width:0;overflow-wrap:anywhere}\n.opts.seg{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.opts.seg .opt span{min-width:0;overflow-wrap:anywhere;text-align:center}\n.eyebrow,p.mono{white-space:normal;overflow-wrap:anywhere;max-width:100%}\n.fnav{flex-wrap:wrap}.fnav>*,.fnav label{min-width:0;max-width:100%;white-space:normal;overflow-wrap:anywhere}\n/* V17.1 mobil: Bildmodus – nur die aktive Station belegt Platz (vorher bestimmte die längste Station die Höhe, darunter\n   blieb bei kurzen Stationen eine leere Fläche). Unter 760 px steht «Offerte anfragen» bereits in der Station und in der\n   Kontaktleiste – in der Überspringen-Zeile bleibt nur «Tour überspringen». */\n.jr-static .jr-st:not(.on){display:none}\n@media (max-width:760px){.jr-skip .jr-skip-o{display:none}\n  /* einheitlicher Seitenrand 16 px wie in allen Abschnitten (vorher Station 32 px durch doppelte Innenabstände) */\n  .jr-static .jr-st{padding-left:0;padding-right:0}.jr-static .jr-skip a,.jr-static .jr-skip button{padding-left:0;padding-right:0}}\n/* Kontaktseite: Einsatzgebiet | Termin nebeneinander, schmal untereinander (vorher Inline-Spalten, auch bei 320 px zweispaltig) */\n.k-l{grid-column:1/span 6}.k-r{grid-column:7/span 6}\n@media (max-width:760px){.k-l,.k-r{grid-column:1/-1}.k-r{margin-top:24px}}\n/* V17.1 mobil: Anker, Skip-Link und fokussierte Felder landen nicht unter dem klebenden Kopf bzw. der Kontaktleiste.\n   --hdrh setzt p3b aus der gemessenen Kopfhöhe (Rückfall 90 px).\n   Als scroll-margin nur auf Inhalten, nicht als scroll-padding am Dokument: sonst verschob schon der Fokus auf ein Element im\n   klebenden Kopf (Menüknopf nach dem Schliessen) die Seite. */\n#main,main *,footer *{scroll-margin-top:calc(var(--hdrh,90px) + 12px)}\n@media (max-width:760px){#main,main *,footer *{scroll-margin-bottom:calc(64px + env(safe-area-inset-bottom,0px))}}\n/* Offertseite gestapelt: Formular nimmt die Spaltenbreite ein (vorher «align-items:start» → Breite nach längstem Wort, bei 200 % Text breiter als der Bildschirm) */\n@media (max-width:900px){.formwrap>*{align-self:stretch;min-width:0}}\n/* Formularfelder: Spur ohne Mindestbreite – Eingabefelder haben eine eigene Grundbreite (ca. 20 Zeichen), die bei 200 % Text\n   breiter als der Bildschirm war */\n.f,.fgroup{grid-template-columns:minmax(0,1fr)}\n/* Stationsleiste mobil: weich ausblendende Ränder zeigen, dass die Leiste seitlich weitergeht (Einrasten, aktive Station mittig bleiben) */\n@media (max-width:760px){.jr-static .jr-nav{-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 14px,#000 calc(100% - 28px),transparent 100%);mask-image:linear-gradient(90deg,transparent 0,#000 14px,#000 calc(100% - 28px),transparent 100%)}}\n/* Leistungskarten mobil: Titel als Raster statt Flex (Text darf schmaler als das längste Wort werden und umbrechen),\n   Bildspalte höchstens ein Viertel der Kartenbreite – bei 200 % Text bleibt mehr Platz für den Titel */\n@media (max-width:760px){.sx-cb h3{display:grid;grid-template-columns:20px minmax(0,1fr)}\n  .sx-card:not(:first-child){grid-template-columns:min(104px,25%) minmax(0,1fr)}}\n/* Smartphone quer / niedrige Bildschirme: Stationsbild höchstens 60 % der sichtbaren Höhe, damit Titel und Aktion\n   im ersten Bildschirm beginnen (vh als Rückfall, svh wo unterstützt) */\n@media (max-height:540px) and (min-width:701px){.jr-static .jr-stage{max-height:60vh;max-height:60svh;aspect-ratio:auto;height:60vh;height:60svh}}\n\n/* Komponente */\n:host{display:block;position:relative}:host(:not([mode=\"scroll\"])){height:var(--irt-height,100vh);min-height:480px}.irt{height:100%;font-family:\"Archivo\",system-ui,-apple-system,\"Segoe UI\",sans-serif;color:var(--ink);-webkit-font-smoothing:antialiased;line-height:1.5}.irt *,.irt *::before,.irt *::after{box-sizing:border-box}:host(:not([mode=\"scroll\"])) .jr,:host(:not([mode=\"scroll\"])) .jr-sticky{height:100%!important}:host(:not([mode=\"scroll\"])) .jr.jr-static{overflow:auto}.irt .jr-ui{padding-top:32px!important}";
var MARKUP="<section class=\"jr\" id=\"reise\" aria-labelledby=\"h-hero\" data-st=\"0\">\n<div class=\"jr-sticky\">\n<div class=\"jr-stage\">\n<picture class=\"jr-pic\"><source media=\"(max-width:700px)\" srcset=\"{{STILLP:0}}\"><img class=\"jr-still on\" src=\"{{STILL:0}}\" alt=\"Illustrative Visualisierung: Wohnblock in der blauen Stunde mit Garten – kein Referenzobjekt\" width=\"1440\" height=\"900\" decoding=\"async\"></picture>\n<picture class=\"jr-pic\"><source media=\"(max-width:700px)\" srcset=\"{{STILLP:1}}\"><img class=\"jr-still\" src=\"{{STILL:1}}\" alt=\"Illustrative Visualisierung: Gartenweg mit Beeten, Wegleuchten und Hecken – kein Referenzobjekt\" width=\"1440\" height=\"900\" decoding=\"async\"></picture>\n<picture class=\"jr-pic\"><source media=\"(max-width:700px)\" srcset=\"{{STILLP:2}}\"><img class=\"jr-still\" src=\"{{STILL:2}}\" alt=\"Illustrative Visualisierung: Eingangshalle mit Treppe und Briefkästen – kein Referenzobjekt\" width=\"1440\" height=\"900\" decoding=\"async\"></picture>\n<picture class=\"jr-pic\"><source media=\"(max-width:700px)\" srcset=\"{{STILLP:3}}\"><img class=\"jr-still\" src=\"{{STILL:3}}\" alt=\"Illustrative Visualisierung: Wohnraum mit Küche, Sideboard und Leuchten am Abend – kein Referenzobjekt\" width=\"1440\" height=\"900\" decoding=\"async\"></picture>\n<picture class=\"jr-pic\"><source media=\"(max-width:700px)\" srcset=\"{{STILLP:4}}\"><img class=\"jr-still\" src=\"{{STILL:4}}\" alt=\"Illustrative Visualisierung: Badezimmer mit wandhängendem WC an der Vorwand und Waschtisch auf wandhängendem Unterschrank – kein Referenzobjekt\" width=\"1440\" height=\"900\" decoding=\"async\"></picture>\n<picture class=\"jr-pic\"><source media=\"(max-width:700px)\" srcset=\"{{STILLP:5}}\"><img class=\"jr-still\" src=\"{{STILL:5}}\" alt=\"Illustrative Visualisierung: Wohnblock in der Gesamtansicht am Abend – kein Referenzobjekt\" width=\"1440\" height=\"900\" decoding=\"async\"></picture>\n<picture class=\"jr-pic\"><source media=\"(max-width:700px)\" srcset=\"{{STILLP:6}}\"><img class=\"jr-still jr-still-det\" data-det-still=\"0\" src=\"{{STILL:6}}\" alt=\"Illustrative Visualisierung: Waschtisch mit Armatur, Ablaufventil und Überlauf auf wandhängendem Unterschrank (Siphon und Eckventile verdeckt) – kein Referenzobjekt\" width=\"1440\" height=\"900\" decoding=\"async\" loading=\"lazy\"></picture>\n<picture class=\"jr-pic\"><source media=\"(max-width:700px)\" srcset=\"{{STILLP:7}}\"><img class=\"jr-still jr-still-det\" data-det-still=\"1\" src=\"{{STILL:7}}\" alt=\"Illustrative Visualisierung: Wandhängendes WC mit Brille, geöffnetem Deckel, zwei Scharnieren und Betätigungsplatte mit zwei Tasten – kein Referenzobjekt\" width=\"1440\" height=\"900\" decoding=\"async\" loading=\"lazy\"></picture>\n<canvas class=\"jr-canvas\" aria-hidden=\"true\"></canvas>\n<div class=\"jr-tech\" aria-hidden=\"true\"><span data-w=\"3.17,1.53,0.8\" data-l=\"Armatur\"></span><span data-w=\"3.345,1.235,0.8\" data-l=\"Ablaufventil\"></span><span data-w=\"3.515,1.06,0.8\" data-l=\"Siphon und Eckventile im Unterschrank\"></span><em class=\"jr-tech-c\" data-l=\"Schematische Kennzeichnung\"></em></div>\n<a class=\"jr-hot\" href=\"#offerte\" data-pre=\"gartenunterhalt\" data-hot=\"-1.2,0.6,8.6\" data-st=\"1\" aria-label=\"Gartenunterhalt – Offerte anfragen\"><span class=\"jr-hot-d\" aria-hidden=\"true\"></span><span class=\"jr-hot-l\">Gartenunterhalt</span></a>\n<a class=\"jr-hot\" href=\"#offerte\" data-pre=\"hauswartung\" data-hot=\"1.7,1.55,1.6\" data-st=\"2\" aria-label=\"Hauswartung – Offerte anfragen\"><span class=\"jr-hot-d\" aria-hidden=\"true\"></span><span class=\"jr-hot-l\">Hauswartung</span></a>\n<a class=\"jr-hot\" href=\"#offerte\" data-pre=\"reinigung\" data-hot=\"7.9,0.8,0.6\" data-st=\"3\" aria-label=\"Reinigung – Offerte anfragen\"><span class=\"jr-hot-d\" aria-hidden=\"true\"></span><span class=\"jr-hot-l\">Reinigung</span></a>\n<a class=\"jr-hot\" href=\"#offerte\" data-pre=\"sanitaer\" data-hot=\"3.23,1.5,-0.38\" data-st=\"4\" aria-label=\"Sanitär – Offerte anfragen\"><span class=\"jr-hot-d\" aria-hidden=\"true\"></span><span class=\"jr-hot-l\">Sanitär</span></a>\n<span class=\"jr-tag\">Illustrative Visualisierung · kein Referenzobjekt</span></div>\n<div class=\"jr-ui wrap\">\n<div class=\"jr-st jr-st0 hx-copy on\" data-k=\"aussen\"><p class=\"mono hx-kicker\">Immobilienservice · Zürich &amp; Aargau</p>\n<h2 id=\"h-hero\" class=\"hx-title\"><span class=\"ln\"><span style=\"--d:.1s\">Ihre Immobilie.</span></span><span class=\"ln\"><span style=\"--d:.2s\"><b>Bis ins Detail betreut.</b></span></span></h2>\n<p class=\"hx-sub\">Hauswartung, Sanitär und Unterhalt für Immobilien in Zürich und Aargau.</p>\n<div class=\"hx-ctas hx-in\"><a class=\"btn\" href=\"#offerte\" data-primary>Offerte anfragen <svg class=\"arr\" viewBox=\"0 0 20 20\" aria-hidden=\"true\"><path d=\"M3 10h13M11 5l5 5-5 5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\"/></svg></a><a class=\"btn ghost\" href=\"#reise\" data-go=\"1\">Gebäude entdecken <svg class=\"arr\" viewBox=\"0 0 20 20\" aria-hidden=\"true\"><path d=\"M3 10h13M11 5l5 5-5 5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\"/></svg></a></div></div>\n<div class=\"jr-st\" data-k=\"garten\"><p class=\"jr-k mono\">Station 2 · Garten</p><h2 class=\"jr-t\">Ein gepflegter erster Eindruck.</h2><p class=\"jr-d\">Gartenunterhalt für ein ordentliches und einladendes Umfeld.</p>\n<div class=\"jr-acts\"><a class=\"btn sm\" href=\"#offerte\" data-pre=\"gartenunterhalt\">Gartenunterhalt anfragen <svg class=\"arr\" viewBox=\"0 0 20 20\" aria-hidden=\"true\"><path d=\"M3 10h13M11 5l5 5-5 5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\"/></svg></a></div></div>\n<div class=\"jr-st\" data-k=\"eingang\"><p class=\"jr-k mono\">Station 3 · Eingang &amp; Treppenhaus</p><h2 class=\"jr-t\">Hauswartung, die den Überblick behält.</h2><p class=\"jr-d\">Wir betreuen Ihre Liegenschaft und stimmen die anfallenden Arbeiten mit Ihnen ab.</p>\n<div class=\"jr-acts\"><a class=\"btn sm\" href=\"#offerte\" data-pre=\"hauswartung\" data-mode=\"laufend\">Hauswartung anfragen <svg class=\"arr\" viewBox=\"0 0 20 20\" aria-hidden=\"true\"><path d=\"M3 10h13M11 5l5 5-5 5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\"/></svg></a></div></div>\n<div class=\"jr-st\" data-k=\"wohnung\"><p class=\"jr-k mono\">Station 4 · Wohnung</p><h2 class=\"jr-t\">Bereit für den nächsten Schritt.</h2><p class=\"jr-d\">Wählen Sie, wobei wir Sie unterstützen können:</p>\n<div class=\"jr-choice\"><div class=\"jr-choice-opts\" role=\"radiogroup\" aria-label=\"Leistung in der Wohnung wählen\"><button type=\"button\" role=\"radio\" aria-checked=\"true\" tabindex=\"0\" data-choice=\"reinigung\" data-cta=\"Reinigung anfragen\"><span class=\"jr-rd\" aria-hidden=\"true\"></span><span>Reinigung</span></button><button type=\"button\" role=\"radio\" aria-checked=\"false\" tabindex=\"-1\" data-choice=\"raeumung\" data-cta=\"Räumung anfragen\"><span class=\"jr-rd\" aria-hidden=\"true\"></span><span>Räumung &amp; Aufbereitung</span></button><button type=\"button\" role=\"radio\" aria-checked=\"false\" tabindex=\"-1\" data-choice=\"leerstand\" data-cta=\"Leerstandsbetreuung anfragen\"><span class=\"jr-rd\" aria-hidden=\"true\"></span><span>Leerstandsmanagement</span></button></div><div class=\"jr-choice-tx\" aria-live=\"polite\"><p class=\"jr-choice-t\" data-choice-text=\"reinigung\">Wohnungen vor oder nach einem Umzug, Treppenhäuser und Gemeinschaftsflächen – regelmässig oder einmalig.</p><p class=\"jr-choice-t\" data-choice-text=\"raeumung\" hidden>Wir räumen, entsorgen und bereiten die Räume nach vereinbartem Umfang für die Vermietung oder den Verkauf vor.</p><p class=\"jr-choice-t\" data-choice-text=\"leerstand\" hidden>Vereinbarte Kontrollgänge und Zustandsmeldungen, solange eine Wohnung leer steht.</p></div><div class=\"jr-acts\"><a class=\"btn sm\" href=\"#offerte\" data-pre=\"reinigung\" data-choice-cta><span class=\"jr-cl\">Reinigung anfragen</span> <svg class=\"arr\" viewBox=\"0 0 20 20\" aria-hidden=\"true\"><path d=\"M3 10h13M11 5l5 5-5 5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\"/></svg></a></div></div></div>\n<div class=\"jr-st\" data-k=\"bad\"><p class=\"jr-k mono\">Station 5 · Badezimmer</p><h2 class=\"jr-t\">Sanitär und Unterhalt. <span>Sorgfältig bis ins Detail.</span></h2><p class=\"jr-d\">Beschreiben Sie uns Ihr Anliegen. Wir klären den passenden Leistungsumfang mit Ihnen.</p>\n<div class=\"jr-det\" role=\"group\" aria-label=\"Ansicht wählen\"><button type=\"button\" class=\"jr-detb\" data-det=\"0.73\" data-det-i=\"-1\" aria-pressed=\"true\">Übersicht</button><button type=\"button\" class=\"jr-detb\" data-det=\"0.752\" data-det-i=\"0\" aria-pressed=\"false\">Waschtisch</button><button type=\"button\" class=\"jr-detb\" data-det=\"0.772\" data-det-i=\"1\" aria-pressed=\"false\">WC</button></div>\n<div class=\"jr-acts\"><a class=\"btn sm\" href=\"#offerte\" data-pre=\"sanitaer\">Sanitäranfrage stellen <svg class=\"arr\" viewBox=\"0 0 20 20\" aria-hidden=\"true\"><path d=\"M3 10h13M11 5l5 5-5 5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\"/></svg></a></div></div>\n<div class=\"jr-st jr-st5\" data-k=\"zurueck\"><p class=\"jr-k mono\">Station 6 · Gesamtansicht</p>\n<h2 class=\"jr-big\">Eine Immobilie. Viele Aufgaben. <b>Ein Ansprechpartner.</b></h2><p class=\"jr-q\">Erzählen Sie uns von Ihrem Objekt oder Ihrem Auftrag. Wir besprechen mit Ihnen die passende Unterstützung.</p>\n<div class=\"jr-acts\"><a class=\"btn\" href=\"#offerte\" data-primary>Offerte anfragen <svg class=\"arr\" viewBox=\"0 0 20 20\" aria-hidden=\"true\"><path d=\"M3 10h13M11 5l5 5-5 5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\"/></svg></a><a class=\"btn ghost\" href=\"#kontakt\" data-contact>Kontakt aufnehmen <svg class=\"arr\" viewBox=\"0 0 20 20\" aria-hidden=\"true\"><path d=\"M3 10h13M11 5l5 5-5 5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\"/></svg></a></div></div>\n<nav class=\"jr-nav\" aria-label=\"Stationen des Rundgangs\"><ol><li><button type=\"button\" data-go=\"0\" class=\"on\" aria-current=\"step\"><span class=\"jr-dot\" aria-hidden=\"true\"></span><span class=\"jr-l\">Gebäude</span></button></li><li><button type=\"button\" data-go=\"1\"><span class=\"jr-dot\" aria-hidden=\"true\"></span><span class=\"jr-l\">Garten</span></button></li><li><button type=\"button\" data-go=\"2\"><span class=\"jr-dot\" aria-hidden=\"true\"></span><span class=\"jr-l\">Eingang</span></button></li><li><button type=\"button\" data-go=\"3\"><span class=\"jr-dot\" aria-hidden=\"true\"></span><span class=\"jr-l\">Wohnung</span></button></li><li><button type=\"button\" data-go=\"4\"><span class=\"jr-dot\" aria-hidden=\"true\"></span><span class=\"jr-l\">Sanitär</span></button></li><li><button type=\"button\" data-go=\"5\"><span class=\"jr-dot\" aria-hidden=\"true\"></span><span class=\"jr-l\">Offerte</span></button></li></ol><div class=\"jr-bar\" aria-hidden=\"true\"><i></i></div></nav>\n<div class=\"jr-skip\"><button type=\"button\" class=\"jr-skip-a\" data-skip>Tour überspringen <svg class=\"arr\" viewBox=\"0 0 20 20\" aria-hidden=\"true\"><path d=\"M3 10h13M11 5l5 5-5 5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\"/></svg></button><a href=\"#offerte\" class=\"jr-skip-o\">Offerte anfragen</a></div>\n<div class=\"jr-steps\" role=\"group\" aria-label=\"Rundgang steuern\"><button type=\"button\" class=\"jr-stepb\" data-step=\"-1\" aria-label=\"Vorherige Station\">← Zurück</button><button type=\"button\" class=\"jr-stepb\" data-step=\"1\" aria-label=\"Nächste Station\">Weiter →</button></div>\n</div></div></section>";
/* ===================== ImmoReady-Rundgang · Kern (V14 · realistische Architekturvisualisierung) =====================
   Eigenes WebGL, keine Bibliothek. Mehrfachinstanzfähig: IRTour.create(root, opts) liefert eine Instanz
   mit destroy(). Kamera, Türen, Hervorhebung und Texte werden aus einer Fortschrittsvariable p (0…1)
   berechnet – vorwärts und rückwärts identisch. Konfiguration kommt aus rise.json (window.IR_RISE).
   Zeitbasiert (nicht vom Fortschritt abhängig) sind nur zwei kurze, einmalige Akzente: die Scan-Kante beim
   Start (≈1,2 s) und die Hervorhebung am Waschtisch (≈2,6 s). Beide entfallen bei «Bewegung reduzieren».

   opts.config        Tour-Konfiguration (aus rise.json, siehe tools/rise.py → tour_config)
   opts.mode          'scroll' (Seitenscroll steuert p) | 'steps' (Stationen, «Weiter»/«Zurück»)
   opts.emit(n, d)    Ereignisse: tour-ready, station-change, request-quote, request-contact, tour-error
   opts.interceptQuote(detail) / opts.interceptContact(detail) → true: Klick nicht intern ausführen
   opts.deferStart    3D erst nach dem Laden starten (Standbild + Text sind sofort da)
   opts.textures      {t1:[4 URLs], t2:[4 URLs], laub:URL} – Graustufen-Materialtexturen (werden zu RGBA gepackt) und Laubatlas
   opts.bake          {hash, data} – vorab gerechnetes Licht (Umgebungsverdeckung, weiche Schatten), base64 + deflate
*/
(function (global) {
  if (global.IRTour) return;

  function create(root, opts) {
    opts = opts || {};
    var C = opts.config;
    if (!C || !root) throw new Error('IRTour: config und root erforderlich');
    var ST = C.stations, K = C.keyframes, HL = C.highlights.sanitaer;
    var D_HT = C.doors.haustuer, D_WT = C.doors.wohnungstuer, D_TT = C.doors.terrassentuer;
    var SERVICES = C.services || [];
    var emit = typeof opts.emit === 'function' ? opts.emit : function () {};
    var win = root.ownerDocument.defaultView || window, doc = root.ownerDocument;
    var RMQ = win.matchMedia('(prefers-reduced-motion: reduce)'), SMALL = win.matchMedia('(max-width:700px), (max-height:540px)'); /* V17.1: auch niedrige Bildschirme (Smartphone quer) – Bildmodus mit normalem Scrollen statt klebender 3D-Bühne */
    var reqMode = opts.mode === 'scroll' ? 'scroll' : 'steps';

    /* ---------- Aufräumen ---------- */
    var disposers = [], destroyed = false;
    function on(t, ev, fn, o) { t.addEventListener(ev, fn, o); disposers.push(function () { t.removeEventListener(ev, fn, o); }); }
    function onMQ(q, fn) { if (q.addEventListener) { q.addEventListener('change', fn); disposers.push(function () { q.removeEventListener('change', fn); }); } }

    /* ---------- Zustand ---------- */
    var stage = root.querySelector('.jr-stage'), canvas = stage && stage.querySelector('canvas');
    var gl = null, PM, PL, sets = [], w = 0, h = 0, dpr = 1, running = false, raf = 0, visible = true, ready = false;
    var p = 0, ps = 0, sweep = 1e4, lastSt = -1, capEl = null, labels = [], hots = [], lastT = 0, tau = C.smoothing.tauMs;
    /* Leistungspunkte (Markup aus rise.json, data-hot = Weltpunkt): sichtbar, wenn die Kamera an ihrer Station ruht */
    function hotOn(l, q) { return stationOf(q) === l.st && Math.abs(q - ST[l.st].hold) < 0.03; }
    var started = false, mode = 'static', cur = 0, ro = null, io = null, startTimer = 0, idleId = 0, scrollTick = false;
    var WALLS = [], LIT = [], OCC = [], built = false, camOverride = null;
    /* Scan-Kante beim Start: einmal je Instanz, erst nach dem ersten fertigen Bild */
    var SCAN_MS = 1200, SCAN_DELAY = 420, scan = { state: 'idle', start: 0, end: 0, count: 0 };
    /* Hervorhebung am Waschtisch: kurz einblenden, halten, ausblenden */
    var pulse = { armed: true, t0: 0, last: 0 };
    var buildMs = 0, bakeMs = 0;
    /* Aufbau in Etappen (Geometrieteile, dann Licht je Satz) – beim Start auf Leerlauf-Phasen verteilt.
       Vorab gerechnetes Licht (opts.bake) wird parallel entpackt; die Licht-Etappen warten darauf höchstens 2,5 s. */
    var baked = false, partsDone = 0, bakeQ = null, PB = null, pbState = 'none', pbT0 = 0, pbRaw = null, pbHash = '', pbUsed = false;
    function buildGeo() { var t0 = Date.now(); T = G; SUB = 0; SUBMODE = 'all'; MAT = 0; BUILD_PARTS[partsDone++](); T = G; buildMs += Date.now() - t0; if (partsDone === BUILD_PARTS.length) built = true; }
    /* eine Etappe ausführen; true = alles fertig. noWait: nicht auf das vorab gerechnete Licht warten */
    function buildStep(noWait) {
      if (partsDone < BUILD_PARTS.length) { buildGeo(); return false; }
      if (!bakeQ) {
        if (pbState === 'loading' && !noWait && Date.now() - pbT0 < 2500) return false;
        var t1 = Date.now(); applyBake(); bakeMs += Date.now() - t1;
        bakeQ = [[G], [INT], [ENV], [D, doorM(0), doorM(D_HT.open[1])], [A, aptM(0), aptM(D_WT.open[1])], [TT, terM(0), terM(D_TT.open[1])], [FOL]];
        return false;
      }
      if (bakeQ.length) {
        var t0 = Date.now(), j = bakeQ.shift(), pb = PB && PB[j[0].name];
        /* bewegte Türen: Licht für geschlossen und offen, der Shader mischt nach Öffnungsgrad (keine falschen Schatten) */
        if (j[2]) { bakeSet(j[0], j[2]); var L2 = j[0].L; bakeSet(j[0], j[1]); j[0].L2 = L2; }
        else bakeSet(j[0], j[1], pb && pb.ao, pb && pb.lv);
        bakeMs += Date.now() - t0; if (!bakeQ.length) baked = true; return baked;
      }
      return true;
    }
    function ensureGeo() { while (partsDone < BUILD_PARTS.length) buildGeo(); }
    function ensureBuilt() { while (!buildStep(true)) {} }
    /* Prüfsumme der Geometrie: vorab gerechnetes Licht passt nur zur exakt gleichen Szene */
    function geoHash() {
      ensureGeo(); var hsh = 7;
      [G, INT, ENV].forEach(function (x) { for (var i = 0; i < x.P.length; i += 7) hsh = (hsh * 31 + Math.round(x.P[i] * 1000)) % 2147483647; });
      return 'v14-' + G.P.length / 3 + '-' + INT.P.length / 3 + '-' + ENV.P.length / 3 + '-' + hsh;
    }
    function loadBake() {
      var src = typeof opts.bake === 'function' ? opts.bake() : opts.bake;
      if (!src || !win.DecompressionStream || !win.Response || !win.Blob) { pbState = 'off'; return; }
      pbState = 'loading'; pbT0 = Date.now();
      var j0 = typeof src === 'string' ? win.fetch(src).then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); }) : win.Promise.resolve(src);
      j0.then(function (j) {
        pbHash = j.hash; var bin = win.atob(j.data), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
        return new win.Response(new win.Blob([u]).stream().pipeThrough(new win.DecompressionStream('deflate'))).arrayBuffer();
      }).then(function (buf) { if (destroyed) return; pbRaw = new Uint8Array(buf); pbState = 'ready'; }).catch(function () { pbState = 'off'; });
    }
    function applyBake() {
      PB = null; pbUsed = false; if (pbState !== 'ready' || !pbRaw) return;
      var nG = G.P.length / 3, nI = INT.P.length / 3, nE = ENV.P.length / 3;
      if (pbRaw.length !== 2 * (nG + nI + nE) || pbHash !== geoHash()) { if (win.console) win.console.info('ImmoReady-Rundgang: vorab gerechnetes Licht passt nicht zur Geometrie – Licht wird zur Laufzeit gerechnet.'); return; }
      var o = 0; PB = {};
      [[G, nG], [INT, nI], [ENV, nE]].forEach(function (x) { PB[x[0].name] = { ao: pbRaw.subarray(o, o + x[1]), lv: pbRaw.subarray(o + x[1], o + 2 * x[1]) }; o += 2 * x[1]; });
      pbUsed = true;
    }
    /* ---------- Materialtexturen: 8 Graustufenbilder → 2 RGBA-Texturen (je 4 Kanäle), dazu der Laubatlas ---------- */
    var TX = { state: 'none', t0: 0, imgs: null, t1: null, t2: null, lb: null, n1: null };
    function loadTex() {
      var s0 = typeof opts.textures === 'function' ? opts.textures() : opts.textures;
      if (!s0 || !s0.t1 || !s0.t2 || !s0.laub) { TX.state = 'off'; return; }
      TX.state = 'loading'; TX.t0 = Date.now();
      var list = s0.t1.concat(s0.t2, [s0.laub]), left = list.length, imgs = [];
      list.forEach(function (u, i) {
        var im = new win.Image(); if (!/^data:/.test(u)) im.crossOrigin = 'anonymous';
        im.onload = im.onerror = function (e) { imgs[i] = e.type === 'load' ? im : null; if (--left === 0 && !destroyed) { TX.imgs = imgs; if (gl) uploadTex(); } };
        im.src = u;
      });
    }
    function packTex(imgs, N) {
      var cv = doc.createElement('canvas'); cv.width = cv.height = N; var cx = cv.getContext('2d', { willReadFrequently: true }), out = new Uint8Array(N * N * 4), j, m = N * N;
      for (var k = 0; k < 4; k++) {
        var im = imgs[k]; if (!im) { for (j = 0; j < m; j++) out[j * 4 + k] = 128; continue; }
        cx.clearRect(0, 0, N, N); cx.drawImage(im, 0, 0, N, N); var dd = cx.getImageData(0, 0, N, N).data; for (j = 0; j < m; j++) out[j * 4 + k] = dd[j * 4];
      }
      return out;
    }
    function mkTex(N, data, img) {
      var t = gl.createTexture(); textures.push(t); gl.bindTexture(gl.TEXTURE_2D, t);
      if (img) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img); else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, N, N, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      if (N > 1) { gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, EXT.sw === true ? gl.LINEAR_MIPMAP_NEAREST : gl.LINEAR_MIPMAP_LINEAR); gl.generateMipmap(gl.TEXTURE_2D); if (EXT.an) gl.texParameterf(gl.TEXTURE_2D, EXT.an.TEXTURE_MAX_ANISOTROPY_EXT, EXT.anMax); }
      else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      return t;
    }
    var EXT = { an: null, anMax: 1, der: false, sw: false };
    function uploadTex() {
      if (!gl || !TX.imgs || TX.t1) return;
      try {
        TX.t1 = mkTex(512, packTex(TX.imgs.slice(0, 4), 512)); TX.t2 = mkTex(1024, packTex(TX.imgs.slice(4, 8), 1024));
        if (TX.imgs[8]) TX.lb = mkTex(1024, null, TX.imgs[8]);
        TX.state = 'ready';
      } catch (e) { TX.state = 'off'; TX.t1 = TX.t2 = TX.lb = null; }
      TX.imgs = null; if (running) request();
    }
    var GR = []; function grp(n, set) { if (set) T = set; GR.push([n, T, T.P.length / 3]); }

    /* ---------- Mathe ---------- */
    function persp(f, a, n, fa) { var t = 1 / Math.tan(f / 2), nf = 1 / (n - fa); return [t / a, 0, 0, 0, 0, t, 0, 0, 0, 0, (fa + n) * nf, -1, 0, 0, 2 * fa * n * nf, 0]; }
    function nrm(v) { var l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
    function cr(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
    function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
    function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
    function look(e, c, u) { var z = nrm([e[0] - c[0], e[1] - c[1], e[2] - c[2]]), x = nrm(cr(u, z)), y = cr(z, x); return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1]; }
    function mul(a, b) { var o = new Array(16); for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) { var s = 0; for (var k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; } return o; }
    /* sRGB → linear (Farben werden linear gespeichert und beleuchtet) */
    function lin(v) { v = Math.max(0, Math.min(1, v)); return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
    function lin3(c) { return [lin(c[0]), lin(c[1]), lin(c[2])]; }
    function hex(c) { return [parseInt(c.substr(1, 2), 16) / 255, parseInt(c.substr(3, 2), 16) / 255, parseInt(c.substr(5, 2), 16) / 255]; }
    function sstep(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
    var seed = 20261008; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

    /* ---------- Geometrie (Grundkörper → Dreiecke + Konturlinien) ----------
       Jede Ecke trägt Position, Normale, Farbe, Leuchtkraft und Material (MAT, siehe Shader). */
    function S(name) { return { name: name, P: [], N: [], C: [], E: [], M: [], L: [], SL: [], SC: [], LP: [], LW: [] }; }
    /* Zeichengruppen: BLD = Gebäudehülle + Garten (G), INT = Innenräume, ENV = Wiese und Ferne, D/A/TT = Türen */
    var G = S('BLD'), INT = S('INT'), ENV = S('ENV'), D = S('D'), A = S('A'), TT = S('TT'), SKY = S('SKY'), T = G, MAT = 0, SUB = 0;
    /* V14 – zusätzliche Ströme neben den Flächen-Sätzen:
       GZ  Glasscheiben mit Raumtiefe (Interior Mapping) für Fenster ohne modellierten Raum dahinter
       TG  echtes Glas (durchsichtig, Fresnel-Spiegelung) für Fenster und Türen der modellierten Räume;
           TGD = Glas im Haustürflügel, TGT = Schiebeflügel der Terrassentür (bewegt)
       FOL Laubkarten (Alpha-Test, leichter Wind)   HAL Lichthöfe an Leuchten (additiv, sehr dezent) */
    var GZ = { P: [], N: [], WC: [], WS: [] }, HAL = { P: [], Q: [], C: [] };
    var FOL = { name: 'FOL', P: [], N: [], U: [], C: [], WV: [], M: [], AO: [], L: [], SL: [], SC: [] };
    function TGS(name) { return { name: name, P: [], N: [] }; }
    var TG = TGS('TG'), TGD = TGS('TGD'), TGT = TGS('TGT');
    /* Glasscheibe mit Raumtiefe: c = Bezugspunkt (Fenstermitte in der Glasebene), n = Normale nach aussen,
       Ausschnitt a0…a1 (quer) und b0…b1 (Höhe) relativ zu c; sd = Raumtyp (Zufallswert), yf = Höhe von c über dem
       Raumboden, hw = halbe Fensterbreite (für Vorhänge), lit = Raumlicht 0…1, cu = Vorhanganteil 0…0,45 */
    function pane(c, n, a0, a1, b0, b1, sd, yf, hw, lit, cu) {
      var r = nrm(cr([0, 1, 0], n));
      [[a0, b0], [a1, b0], [a1, b1], [a0, b0], [a1, b1], [a0, b1]].forEach(function (k) {
        GZ.P.push(c[0] + r[0] * k[0], c[1] + k[1], c[2] + r[2] * k[0]); GZ.N.push(n[0], n[1], n[2]);
        GZ.WC.push(c[0], c[1], c[2], sd); GZ.WS.push(hw, yf, lit, cu || 0);
      });
    }
    /* echtes Glas: Rechteck p0 + s·U + t·V (Satz TG, TGD oder TGT) */
    function tglass(set, p0, U, V) {
      var n = nrm(cr(U, V)), q = [p0, [p0[0] + U[0], p0[1] + U[1], p0[2] + U[2]], [p0[0] + U[0] + V[0], p0[1] + U[1] + V[1], p0[2] + U[2] + V[2]], [p0[0] + V[0], p0[1] + V[1], p0[2] + V[2]]];
      [0, 1, 2, 0, 2, 3].forEach(function (i) { set.P.push(q[i][0], q[i][1], q[i][2]); set.N.push(n[0], n[1], n[2]); });
    }
    /* Laubkarte: Fussmitte (x,y,z), Breite, Höhe, Drehung, Atlasfeld (0 Strauch · 1 Gras · 2 Staude · 3 Baumkrone), Tönung.
       o.tilt Neigung zur Kartennormalen · o.cx/o.cz Pflanzenmitte (Lichtnormale nach aussen gewölbt → Volumen)
       o.ao Helligkeit am Fuss (Eigenverschattung) · o.sw Windgewicht · o.ph Phase · o.top Fuss-Windgewicht */
    function card(x, y, z, wd, ht, yaw, tile, tint, o) {
      o = o || {}; var ca = Math.cos(yaw), sa = Math.sin(yaw), tl = o.tilt || 0, st = Math.sin(tl), ct = Math.cos(tl);
      var A = [ca * wd / 2, 0, sa * wd / 2], Vv = [-sa * st * ht, ct * ht, ca * st * ht];
      var u0 = (tile % 2) * 0.5 + 0.004, u1 = (tile % 2) * 0.5 + 0.496, v0 = (tile >> 1) * 0.5 + 0.004, v1 = (tile >> 1) * 0.5 + 0.496;
      var t3 = lin3(typeof tint === 'string' ? hex(tint) : (tint || [1, 1, 1])), ph = o.ph === undefined ? x * 1.7 + z * 2.3 : o.ph;
      var cx = o.cx === undefined ? x : o.cx, cz = o.cz === undefined ? z : o.cz, ao = o.ao === undefined ? 0.55 : o.ao, sw = o.sw === undefined ? 1 : o.sw, wb = o.wb || 0;
      var Q = [[-1, 0, u0, v1], [1, 0, u1, v1], [1, 1, u1, v0], [-1, 1, u0, v0]];
      [0, 1, 2, 0, 2, 3].forEach(function (k) {
        var q = Q[k], px = x + A[0] * q[0] + Vv[0] * q[1], py = y + Vv[1] * q[1], pz = z + A[2] * q[0] + Vv[2] * q[1];
        var dx = px - cx, dz = pz - cz, dl = Math.hypot(dx, dz), ln = dl > 0.01 ? nrm([dx / dl * 0.62, 0.78, dz / dl * 0.62]) : [0, 1, 0];
        FOL.P.push(px, py, pz); FOL.N.push(ln[0], ln[1], ln[2]); FOL.U.push(q[2], q[3]); FOL.C.push(t3[0], t3[1], t3[2]);
        FOL.WV.push((wb + (1 - wb) * q[1]) * sw, ph); FOL.M.push(4); FOL.AO.push(ao + (1 - ao) * q[1]);
      });
    }
    /* Lichthof (Billboard, additiv): Mitte, Grösse in m, Farbe, Stärke */
    function halo(x, y, z, size, col, k) { var c = hex(col); [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]].forEach(function (q) { HAL.P.push(x, y, z); HAL.Q.push(q[0], q[1], size); HAL.C.push(c[0] * k, c[1] * k, c[2] * k); }); }
    function h2(x, y) { var v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return v - Math.floor(v); }
    function n2(x, y) { var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); var a = h2(ix, iy), b = h2(ix + 1, iy), c = h2(ix, iy + 1), d = h2(ix + 1, iy + 1); return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy; }
    function vert(q, n, col, em) {
      /* leichte, glaubwürdige Unregelmässigkeiten je Eckpunkt: Wolken im Putz, Spritzwasserzone am Sockel,
         fleckiger Rasen (trockene Stellen), Farbstreuung bei Stein und Erde */
      var k = 1, c0 = col[0], c1 = col[1], c2 = col[2];
      if (MAT === 4) k = 0.68 + 0.62 * (n2(q[0] * 3.3 + q[1] * 2.1, q[2] * 3.3) * 0.6 + n2(q[0] * 8 + q[2] * 3, q[1] * 8) * 0.4);
      else if (MAT === 0) { k = 0.965 + 0.06 * n2(q[0] * 0.45 + q[2] * 0.45, q[1] * 0.6) + 0.02 * n2(q[0] * 2.1 + q[2] * 2.1, q[1] * 2.3); if (q[1] < 1.3) k *= 1 - 0.075 * Math.pow(1 - q[1] / 1.3, 2); }
      else if (MAT === 5) { var dry = Math.max(0, n2(q[0] * 0.23 + 5.1, q[2] * 0.23) - 0.52) * 1.6; k = 0.86 + 0.26 * n2(q[0] * 0.55, q[2] * 0.55); c0 = c0 + (0.33 - c0) * dry; c1 = c1 + (0.34 - c1) * dry; c2 = c2 + (0.2 - c2) * dry; }
      else if (MAT === 6 || MAT === 17 || MAT === 20) k = 0.93 + 0.12 * n2(q[0] * 1.3 + q[1] * 0.7, q[2] * 1.3 - q[1] * 0.5);
      T.P.push(q[0], q[1], q[2]); T.N.push(n[0], n[1], n[2]); T.C.push(lin(c0 * k), lin(c1 * k), lin(c2 * k)); T.E.push(em); T.M.push(MAT);
    }
    function tri(a, b, c, col, em) { var n = nrm(cr(sub(b, a), sub(c, a))); vert(a, n, col, em); vert(b, n, col, em); vert(c, n, col, em); }
    function triN(a, b, c, na, nb, nc, col, em) { vert(a, na, col, em); vert(b, nb, col, em); vert(c, nc, col, em); }
    function quad(a, b, c, d, col, em) { tri(a, b, c, col, em); tri(a, c, d, col, em); }
    /* Rechteckfläche, bei SUB > 0 in ein Raster zerlegt (für gebackenes Licht: Lichtkegel, Schatten am Boden) */
    function face(a, b, c, d, col, em) {
      if (!SUB) { quad(a, b, c, d, col, em); return; }
      var u = sub(b, a), v = sub(d, a), ny = nrm(cr(u, v))[1];
      if ((SUBMODE === 'v' && Math.abs(ny) > 0.5) || (SUBMODE === 'up' && ny < 0.5) || (SUBMODE === 'down' && ny > -0.5)) { quad(a, b, c, d, col, em); return; }
      var nu = Math.max(1, Math.ceil(Math.hypot(u[0], u[1], u[2]) / SUB)), nv = Math.max(1, Math.ceil(Math.hypot(v[0], v[1], v[2]) / SUB));
      if (nu * nv === 1) { quad(a, b, c, d, col, em); return; }
      /* bilinear über alle vier Ecken (V17.1): Trapeze wie die schräge Treppenbrüstung behalten ihre Form */
      function P(i, j) { var x = i / nu, y = j / nv, k = 0, o = [0, 0, 0]; for (; k < 3; k++) { var ab = a[k] + (b[k] - a[k]) * x, dc = d[k] + (c[k] - d[k]) * x; o[k] = ab + (dc - ab) * y; } return o; }
      for (var i = 0; i < nu; i++) for (var j = 0; j < nv; j++) quad(P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1), col, em);
    }
    /* SUBMODE: 'all' | 'v' (nur senkrechte Flächen) | 'up' (nur Oberseiten) | 'down' (nur Unterseiten, z. B. Decken) */
    var SUBMODE = 'all';
    function withSub(sz, fn, mode) { var o = SUB, om = SUBMODE; SUB = sz; SUBMODE = mode || 'all'; fn(); SUB = o; SUBMODE = om; }
    function line(a, b, wt) { T.LP.push(a[0], a[1], a[2], b[0], b[1], b[2]); T.LW.push(wt, wt); }
    function withMat(m, fn) { var o = MAT; MAT = m; fn(); MAT = o; }
    /* box(x-Mitte, y-Unterkante, z-Mitte, Breite, Höhe, Tiefe, Farbe, Leuchtkraft, Konturstärke; negativ = Sanitär-Hervorhebung)
       Mit BEV > 0 (withBev) erhält der Kasten feine Kantenschrägen: eingerückte Hauptflächen, 12 Fasen, 8 Eckdreiecke –
       die Fasen fangen Licht wie echte gebrochene Kanten (Möbel, Stufen, Randsteine, Platten, Abdeckungen). */
    var BEV = 0;
    function withBev(c, fn) { var o = BEV; BEV = c; fn(); BEV = o; }
    function quadO(a, b, c, d, ctr, col, em) { var n = cr(sub(b, a), sub(d, a)), m = [(a[0] + c[0]) / 2 - ctr[0], (a[1] + c[1]) / 2 - ctr[1], (a[2] + c[2]) / 2 - ctr[2]]; if (dot(n, m) < 0) face(a, d, c, b, col, em); else face(a, b, c, d, col, em); }
    function triO(a, b, c, ctr, col, em) { var n = cr(sub(b, a), sub(c, a)), m = [(a[0] + b[0] + c[0]) / 3 - ctr[0], (a[1] + b[1] + c[1]) / 3 - ctr[1], (a[2] + b[2] + c[2]) / 3 - ctr[2]]; if (dot(n, m) < 0) tri(a, c, b, col, em); else tri(a, b, c, col, em); }
    function box(x, y, z, sx, sy, sz, col, em, ew) {
      col = typeof col === 'string' ? hex(col) : col; em = em || 0;
      var x0 = x - sx / 2, x1 = x + sx / 2, y0 = y, y1 = y + sy, z0 = z - sz / 2, z1 = z + sz / 2;
      var v = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
      var bc = BEV ? Math.min(BEV, sx * 0.3, sy * 0.3, sz * 0.3) : 0;
      if (bc > 0.0015) {
        var X = sx / 2, Y = sy / 2, Z = sz / 2, ctr = [x, y + Y, z];
        var P = function (i, j, k, ax) { return [x + i * (ax === 0 ? X : X - bc), y + Y + j * (ax === 1 ? Y : Y - bc), z + k * (ax === 2 ? Z : Z - bc)]; };
        [-1, 1].forEach(function (s) {
          quadO(P(s, -1, -1, 0), P(s, 1, -1, 0), P(s, 1, 1, 0), P(s, -1, 1, 0), ctr, col, em);
          quadO(P(-1, s, -1, 1), P(1, s, -1, 1), P(1, s, 1, 1), P(-1, s, 1, 1), ctr, col, em);
          quadO(P(-1, -1, s, 2), P(1, -1, s, 2), P(1, 1, s, 2), P(-1, 1, s, 2), ctr, col, em);
          [-1, 1].forEach(function (t) {
            quadO(P(s, t, -1, 0), P(s, t, 1, 0), P(s, t, 1, 1), P(s, t, -1, 1), ctr, col, em);
            quadO(P(s, -1, t, 0), P(s, 1, t, 0), P(s, 1, t, 2), P(s, -1, t, 2), ctr, col, em);
            quadO(P(-1, s, t, 1), P(1, s, t, 1), P(1, s, t, 2), P(-1, s, t, 2), ctr, col, em);
            [-1, 1].forEach(function (u) { triO(P(s, t, u, 0), P(s, t, u, 1), P(s, t, u, 2), ctr, col, em); });
          });
        });
      } else {
        face(v[4], v[5], v[6], v[7], col, em); face(v[1], v[0], v[3], v[2], col, em); face(v[5], v[1], v[2], v[6], col, em);
        face(v[0], v[4], v[7], v[3], col, em); face(v[7], v[6], v[2], v[3], col, em); face(v[0], v[1], v[5], v[4], col, em);
      }
      if (ew) { [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(function (e) { line(v[e[0]], v[e[1]], ew); }); }
    }
    function solid(x0, x1, y0, y1, z0, z1, col, em, ew) { box((x0 + x1) / 2, y0, (z0 + z1) / 2, x1 - x0, y1 - y0, z1 - z0, col, em, ew); WALLS.push([x0, x1, y0, y1, z0, z1]); }
    /* Wand entlang einer Achse mit Öffnungen [von,bis,Höhe] */
    function wall(ax, c, from, to, y0, y1, th, ops, col, ew) {
      ops = (ops || []).slice().sort(function (a, b) { return a[0] - b[0]; }); var s = from;
      function seg(a, b, ya, yb) { if (b - a < 0.01) return; if (ax === 'x') solid(c - th / 2, c + th / 2, ya, yb, a, b, col, 0, ew); else solid(a, b, ya, yb, c - th / 2, c + th / 2, col, 0, ew); }
      ops.forEach(function (o) { seg(s, o[0], y0, y1); seg(o[0], o[1], o[2], y1); s = o[1]; }); seg(s, to, y0, y1);
    }
    /* Rohr zwischen zwei beliebigen Punkten (weiche Normalen), r2 = Radius am Ende */
    function tube(a, b, r, seg, col, em, ew, r2, caps) {
      col = typeof col === 'string' ? hex(col) : col; em = em || 0; r2 = r2 === undefined ? r : r2;
      var ax = nrm(sub(b, a)), up = Math.abs(ax[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0], u = nrm(cr(ax, up)), v = cr(ax, u), ra = [], rb = [], ns = [];
      for (var i = 0; i <= seg; i++) { var t = i / seg * Math.PI * 2, c = Math.cos(t), s = Math.sin(t); var n = [u[0] * c + v[0] * s, u[1] * c + v[1] * s, u[2] * c + v[2] * s]; ns.push(n); ra.push([a[0] + n[0] * r, a[1] + n[1] * r, a[2] + n[2] * r]); rb.push([b[0] + n[0] * r2, b[1] + n[1] * r2, b[2] + n[2] * r2]); }
      for (i = 0; i < seg; i++) { triN(ra[i], rb[i], rb[i + 1], ns[i], ns[i], ns[i + 1], col, em); triN(ra[i], rb[i + 1], ra[i + 1], ns[i], ns[i + 1], ns[i + 1], col, em); }
      if (caps !== false) for (i = 0; i < seg; i++) { tri(b, rb[i + 1], rb[i], col, em); tri(a, ra[i], ra[i + 1], col, em); }
      if (ew) { for (i = 0; i < seg; i += Math.max(1, seg / 8 | 0)) { line(ra[i], ra[Math.min(seg, i + Math.max(1, seg / 8 | 0))], ew); line(rb[i], rb[Math.min(seg, i + Math.max(1, seg / 8 | 0))], ew); } }
    }
    function cyl(x, y, z, r, hgt, seg, col, em, ew, r2) { tube([x, y, z], [x, y + hgt, z], r, seg, col, em, ew, r2); }
    /* Rohr entlang einer Kurve (Ringe mit Parallelverschiebung, gemeinsame Normalen) – knickfreie Bögen für Armaturen */
    function bogen(pts, r0, r1, seg, col, em) {
      col = typeof col === 'string' ? hex(col) : col; em = em || 0;
      var n = pts.length, rings = [], nrs = [], prevU = null;
      for (var i = 0; i < n; i++) {
        var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], tg = nrm(sub(b, a));
        var u = prevU ? nrm(sub(prevU, [tg[0] * dot(prevU, tg), tg[1] * dot(prevU, tg), tg[2] * dot(prevU, tg)])) : nrm(cr(tg, Math.abs(tg[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0]));
        var v = cr(tg, u), r = r0 + (r1 - r0) * i / (n - 1), ring = [], nr = []; prevU = u;
        for (var k = 0; k <= seg; k++) { var t = k / seg * Math.PI * 2, c = Math.cos(t), s = Math.sin(t), d = [u[0] * c + v[0] * s, u[1] * c + v[1] * s, u[2] * c + v[2] * s]; nr.push(d); ring.push([pts[i][0] + d[0] * r, pts[i][1] + d[1] * r, pts[i][2] + d[2] * r]); }
        rings.push(ring); nrs.push(nr);
      }
      for (i = 0; i < n - 1; i++) for (k = 0; k < seg; k++) {
        triN(rings[i][k], rings[i + 1][k], rings[i + 1][k + 1], nrs[i][k], nrs[i + 1][k], nrs[i + 1][k + 1], col, em);
        triN(rings[i][k], rings[i + 1][k + 1], rings[i][k + 1], nrs[i][k], nrs[i + 1][k + 1], nrs[i][k + 1], col, em);
      }
    }
    /* weiche Kugelform (Ikosaeder, einmal unterteilt) – Laub, Keramik, Leuchtkörper */
    var ICO20 = null;
    var ICO = (function () {
      var t = (1 + Math.sqrt(5)) / 2, V = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map(nrm);
      var F = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]], out = [];
      ICO20 = F.map(function (f) { return [V[f[0]], V[f[1]], V[f[2]]]; });
      F.forEach(function (f) { var a = V[f[0]], b = V[f[1]], c = V[f[2]], ab = nrm([a[0] + b[0], a[1] + b[1], a[2] + b[2]]), bc = nrm([b[0] + c[0], b[1] + c[1], b[2] + c[2]]), ca = nrm([c[0] + a[0], c[1] + a[1], c[2] + a[2]]); out.push([a, ab, ca], [ab, b, bc], [ca, bc, c], [ab, bc, ca]); });
      return out;
    })();
    function blob(cx, cy, cz, rx, ry, rz, col, em, jit) {
      col = typeof col === 'string' ? hex(col) : col; em = em || 0; jit = jit || 0;
      var cache = {};
      function P(n) { var k = n.map(function (v) { return v.toFixed(4); }).join(); if (!cache[k]) { var j = 1 + (rnd() - 0.5) * jit; cache[k] = [cx + n[0] * rx * j, cy + n[1] * ry * j, cz + n[2] * rz * j]; } return cache[k]; }
      function Nn(n) { return nrm([n[0] / rx, n[1] / ry, n[2] / rz]); }
      (Math.max(rx, ry, rz) < 0.22 ? ICO20 : ICO).forEach(function (f) { triN(P(f[0]), P(f[1]), P(f[2]), Nn(f[0]), Nn(f[1]), Nn(f[2]), col, em); });
    }
    /* ---------- Licht backen (einmalig, CPU): Umgebungslicht, Abendhimmel, Leuchten je Raum, Bodenschatten ----------
       Statisches Licht pro Eckpunkt statt pro Pixel: gleiche Wirkung bei einem Bruchteil der GPU-Last. */
    function roomOf(q) { if (q[0] > -3.0 && q[0] < -1.6 && q[2] > 1.5 && q[2] < 4.35 && q[1] >= 3.0 && q[1] < 4.8) return 1; /* Treppenauge über der Halle */ if (q[1] < 0.45 || q[1] > 3.2 || q[0] < -3.1 || q[0] > 8.7 || q[2] < -1.1 || q[2] > 5.2) return 0; if (q[0] < 3) return 1; if (q[0] < XW) return q[2] > 2.4 ? 2 : 3; return 4; }
    var KEY = nrm([-0.857, 0.302, 0.423]), FILL = nrm([0.553, 0.623, 0.553]), WINF = nrm([0.6, 0.25, 0.55]);
    function mixv(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
    /* Licht je Eckpunkt. ao = Himmels-/Umgebungssichtbarkeit, lv = Sichtbarkeit der Leuchten (beide 0…1, aus dem
       vorab gerechneten Licht – tools/bake-light.js). Ohne vorab gerechnetes Licht: ao = lv = 1 und eine einfache
       Bodenverschattung unter Körpern (OCC). */
    function bakeOne(q, n, m, spec, ao, lv) {
      var pre = ao !== undefined; if (!pre) { ao = 1; lv = 1; }
      var rm = roomOf(q), t = n[1] * 0.5 + 0.5, k, o0, o1, o2, i, l;
      if (rm) {
        k = (0.74 + 0.26 * sstep(0.5, 1.2, q[1])) * (0.86 + 0.14 * sstep(CEIL, CEIL - 0.6, q[1]));
        /* linear: schwache, neutrale Grundaufhellung; die Leuchten (direkt + indirekt) prägen den Raum */
        o0 = (0.13 + 0.07 * t) * k; o1 = (0.125 + 0.07 * t) * k; o2 = (0.125 + 0.075 * t) * k;
        var wf = Math.max(n[0] * WINF[0] + n[1] * WINF[1] + n[2] * WINF[2], 0) * 0.5; o0 += 0.03 * wf; o1 += 0.045 * wf; o2 += 0.07 * wf;
        o0 *= ao; o1 *= ao; o2 *= ao;
      } else {
        var k1 = Math.max(n[0] * KEY[0] + n[1] * KEY[1] + n[2] * KEY[2], 0) * 0.85, k2 = Math.max(n[0] * FILL[0] + n[1] * FILL[1] + n[2] * FILL[2], 0) * 0.5;
        /* blaue Stunde (linear): kühles Himmelslicht, schwacher warmer Rest am Westhorizont */
        o0 = 0.03 + 0.085 * t + 0.26 * k1 + 0.07 * k2; o1 = 0.035 + 0.11 * t + 0.17 * k1 + 0.09 * k2; o2 = 0.05 + 0.19 * t + 0.11 * k1 + 0.14 * k2;
        var sh = 1;
        if (!pre && q[1] < 0.45) for (i = 0; i < OCC.length; i++) { var c = OCC[i], dx = Math.abs(q[0] - c[0]) - c[2], dz = Math.abs(q[2] - c[1]) - c[3], sd = Math.sqrt(Math.max(dx, 0) * Math.max(dx, 0) + Math.max(dz, 0) * Math.max(dz, 0)) + Math.min(Math.max(dx, dz), 0); sh = Math.min(sh, 0.4 + 0.6 * sstep(-0.08, 0.35 + 0.3 * Math.min(c[2], c[3]), sd)); }
        k = (pre ? ao * (0.9 + 0.1 * sstep(0, 1.2, q[1])) : sh * (0.62 + 0.38 * sstep(0, 1.7, q[1]))); o0 *= k; o1 *= k; o2 *= k;
      }
      var best = -1, bv = 0, a0 = 0, a1 = 0, a2 = 0, ib0 = 0, ib1 = 0, ib2 = 0;
      for (i = 0; i < LIT.length; i++) {
        l = LIT[i]; if (l[7] !== rm) continue;
        var ex = l[0] - q[0], ey = l[1] - q[1], ez = l[2] - q[2], ds = Math.sqrt(ex * ex + ey * ey + ez * ez); if (ds >= l[3]) continue;
        var a = 1 - ds / l[3]; a *= a; var nd = (n[0] * ex + n[1] * ey + n[2] * ez) / (ds || 1); if (m === 4) nd = nd * 0.55 + 0.45;
        if (nd > 0) { nd *= a; a0 += l[4] * nd; a1 += l[5] * nd; a2 += l[6] * nd; }
        /* Innenräume: indirektes Licht der Leuchte (Reflexion an Decke, Wänden, Boden) – richtungsunabhängig, nur durch ao gedämpft */
        if (rm) { var v = a * (l[4] + l[5] + l[6]); if (v > bv) { bv = v; best = i; } ib0 += l[4] * a; ib1 += l[5] * a; ib2 += l[6] * a; }
      }
      var dk = rm ? 1.5 : 1.6;
      o0 += a0 * lv * dk + ib0 * 0.32 * ao; o1 += a1 * lv * dk + ib1 * 0.32 * ao; o2 += a2 * lv * dk + ib2 * 0.32 * ao;
      if (spec) { if (best >= 0) { l = LIT[best]; var sk = 0.35 + 0.65 * lv; spec[0] = l[0]; spec[1] = l[1]; spec[2] = l[2]; spec[3] = l[3]; spec[4] = l[4] * sk; spec[5] = l[5] * sk; spec[6] = l[6] * sk; } else { spec[0] = spec[1] = spec[2] = 0; spec[3] = 1; spec[4] = spec[5] = spec[6] = 0; } }
      return [o0, o1, o2];
    }
    /* Gewichte der Leuchten für einen Eckpunkt (für das Vorabrechnen der weichen Schatten): [[Index, Beitrag], …] */
    function lightW(q, n, m) {
      var rm = roomOf(q), out = [];
      for (var i = 0; i < LIT.length; i++) {
        var l = LIT[i]; if (l[7] !== rm) continue;
        var ex = l[0] - q[0], ey = l[1] - q[1], ez = l[2] - q[2], ds = Math.sqrt(ex * ex + ey * ey + ez * ez); if (ds >= l[3]) continue;
        var a = 1 - ds / l[3]; a *= a; var nd = (n[0] * ex + n[1] * ey + n[2] * ez) / (ds || 1); if (m === 4) nd = nd * 0.55 + 0.45;
        if (nd > 0) out.push([i, nd * a * (l[4] + l[5] + l[6])]);
      }
      return out;
    }
    function bakeSet(Sx, Mx, AOa, LVa) {
      var nv = Sx.P.length / 3, L = new Float32Array(nv * 3), SL = new Float32Array(nv * 4), SC = new Float32Array(nv * 3), sp = [0, 0, 0, 1, 0, 0, 0], q = [0, 0, 0], n = [0, 0, 0];
      Mx = Mx || null;
      for (var v = 0, i = 0; v < nv; v++, i += 3) {
        q[0] = Sx.P[i]; q[1] = Sx.P[i + 1]; q[2] = Sx.P[i + 2]; n[0] = Sx.N[i]; n[1] = Sx.N[i + 1]; n[2] = Sx.N[i + 2];
        if (Mx) { var x = q[0], y = q[1], z = q[2], a = n[0], b = n[1], c = n[2]; q[0] = Mx[0] * x + Mx[4] * y + Mx[8] * z + Mx[12]; q[1] = Mx[1] * x + Mx[5] * y + Mx[9] * z + Mx[13]; q[2] = Mx[2] * x + Mx[6] * y + Mx[10] * z + Mx[14]; n[0] = Mx[0] * a + Mx[4] * b + Mx[8] * c; n[1] = Mx[1] * a + Mx[5] * b + Mx[9] * c; n[2] = Mx[2] * a + Mx[6] * b + Mx[10] * c; }
        var o = AOa ? bakeOne(q, n, Sx.M[v], sp, AOa[v] / 255, LVa[v] / 255) : bakeOne(q, n, Sx.M[v], sp);
        if (Sx.AO) { o[0] *= Sx.AO[v]; o[1] *= Sx.AO[v]; o[2] *= Sx.AO[v]; }
        L[i] = o[0]; L[i + 1] = o[1]; L[i + 2] = o[2];
        SL[v * 4] = sp[0]; SL[v * 4 + 1] = sp[1]; SL[v * 4 + 2] = sp[2]; SL[v * 4 + 3] = sp[3]; SC[i] = sp[4]; SC[i + 1] = sp[5]; SC[i + 2] = sp[6];
      }
      Sx.L = L; Sx.SL = SL; Sx.SC = SC;
    }
    function light(x, y, z, r, col, k, room) { var c = lin3(hex(col)), m = Math.max(c[0], c[1], c[2]) || 1; LIT.push([x, y, z, r, c[0] / m * k, c[1] / m * k, c[2] / m * k, room]); }
    function occ(cx, cz, hx, hz) { OCC.push([cx, cz, hx, hz]); }

  /* ===== Szene V14 · realistische Architekturvisualisierung =====
     Illustrative Visualisierung eines Schweizer Mehrfamilienhauses – kein reales Objekt, keine Kundenreferenz.
     Szeneneinheiten = Meter (Planungsmasse, nicht vermessen). 4 Geschosse à 3,00 m, lichte Raumhöhe 2,60 m,
     Aussenwand 38 cm (Mauerwerk + Wärmedämmung + Putz), Fenster mit Laibungen, Rahmen und Fensterbänken.
     Erdgeschoss: Treppenhalle x[-3,3] z[1.5,5.12] · Flur x[3,5.4] z[2.4,4.2] · Bad x[3,5.4] z[-1,2.4]
     Wohnen/Essen/Küche x[5.4,8.62] z[-1,5.12] */
  var W=18,DEP=11,FH=3,FL=4,FLOOR=0.5,CEIL=3.1,ZF=DEP/2,XS=W/2,ETW=0.38,ZI=ZF-ETW,XI=XS-ETW,XW=5.4,TOP=FLOOR+FL*FH,PAR=TOP+0.8;
  /* Scharniere: Haustür (x, z) und Wohnungstür (x, z) – für die bewegten Sätze */
  var DH=[-0.76,ZF-0.16],AH=[3,3.8];
  var PUTZ=0,KER=1,MET=2,GLA=3,LAUB=4,RAS=5,STE=6,HOLZ=7,WPL=8,BPL=9,LEU=10,TEX=12,STO=13,SPI=14,HIM=15,GTU=16,ERD=17,IPU=18,HEC=19,BET=20,PLA=21,CHR=22,ALM=23,EDS=24,BLA=25,ASP=26;
  var FAC='#e3ddd2',IW='#ebe6de',CW='#f2eee8',FRM='#3a3a39',ALU='#9b9995',SOC='#85817a',BB='#e2ddd4';
  var LEAF=['#8fa078','#7f9470','#97a77e','#86996f','#7b8c66'];
  function C3(c){return typeof c==='string'?hex(c):c;}
  function add3(a,b,k){k=k===undefined?1:k;return [a[0]+b[0]*k,a[1]+b[1]*k,a[2]+b[2]*k];}
  /* Rechteck p + U + V mit gewünschter Normalenrichtung (Wicklung wird passend gewählt) */
  function rect(p,U,V,want,col,em){var n=cr(U,V);if(dot(n,want)<0){var t=U;U=V;V=t;}face(p,add3(p,U),add3(add3(p,U),V),add3(p,V),C3(col),em||0);}
  /* ---- Fassadenebene: F={ax:'z'|'x', c: Lage der Aussenfläche, s: ±1 nach aussen}; u = Lage entlang der Wand, d = Tiefe ---- */
  function FP(F,u,y,d){return F.ax==='z'?[u,y,F.c-F.s*d]:[F.c-F.s*d,y,u];}
  function FU(F){return F.ax==='z'?[1,0,0]:[0,0,1];}
  function FN(F){return F.ax==='z'?[0,0,F.s]:[F.s,0,0];}
  function fbox(F,u0,u1,y0,y1,d0,d1,col,em,ew){var a=FP(F,u0,y0,d0),b=FP(F,u1,y1,d1);box((a[0]+b[0])/2,y0,(a[2]+b[2])/2,Math.abs(b[0]-a[0]),y1-y0,Math.abs(b[2]-a[2]),col,em,ew);}
  /* Wandfläche in Tiefe d mit rechteckigen Öffnungen (übereinanderliegende Öffnungen erlaubt) */
  function holed(F,u0,u1,y0,y1,d,holes,want,col,reg){
    var xs=[u0,u1];holes.forEach(function(h){if(h.u1>u0&&h.u0<u1){xs.push(Math.max(u0,h.u0),Math.min(u1,h.u1));}});
    xs.sort(function(a,b){return a-b;});var U=FU(F);
    for(var i=0;i<xs.length-1;i++){var a=xs[i],b=xs[i+1];if(b-a<0.001)continue;var mid=(a+b)/2;
      var hs=holes.filter(function(h){return h.u0<mid&&h.u1>mid&&h.y1>y0&&h.y0<y1;}).sort(function(p,q){return p.y0-q.y0;}),y=y0;
      var seg=function(ya,yb){if(yb-ya<0.001)return;rect(FP(F,a,ya,d),[U[0]*(b-a),0,U[2]*(b-a)],[0,yb-ya,0],want,col);
        if(reg){var p0=FP(F,a,ya,0),p1=FP(F,b,yb,ETW);WALLS.push([Math.min(p0[0],p1[0]),Math.max(p0[0],p1[0]),ya,yb,Math.min(p0[2],p1[2]),Math.max(p0[2],p1[2])]);}};
      hs.forEach(function(h){seg(y,Math.max(y,h.y0));y=Math.max(y,h.y1);});seg(y,y1);}
  }
  /* Laibung einer Öffnung von Tiefe d0 bis d1 (sk: {b,t,l,r} = Seite auslassen) */
  function reveal(F,h,d0,d1,col,sk){sk=sk||{};var U=FU(F),dv=sub(FP(F,0,0,d1),FP(F,0,0,d0)),hh=h.y1-h.y0,ww=h.u1-h.u0;
    if(!sk.l)rect(FP(F,h.u0,h.y0,d0),dv,[0,hh,0],U,col);
    if(!sk.r)rect(FP(F,h.u1,h.y0,d0),dv,[0,hh,0],[-U[0],0,-U[2]],col);
    if(!sk.t)rect(FP(F,h.u0,h.y1,d0),[U[0]*ww,0,U[2]*ww],dv,[0,-1,0],col);
    if(!sk.b)rect(FP(F,h.u0,h.y0,d0),[U[0]*ww,0,U[2]*ww],dv,[0,1,0],col);}
  /* Fenster / Fenstertür: Blendrahmen, Flügel, Glas, Fensterbank aussen (Alu), Storen-Führungsschienen, Storen.
     o.real: echtes Glas (Raum dahinter modelliert) · sonst Glas mit Raumtiefe (o.lit, o.cu Vorhang, o.fy Raumboden)
     o.door: Fenstertür · o.inner: Innenlaibung und Fensterbank innen · o.blind: Anteil heruntergelassener Lamellenstoren */
  function fwin(F,u,yb,wd,ht,o){
    var h={u0:u-wd/2,u1:u+wd/2,y0:yb,y1:yb+ht},U=FU(F),n=FN(F),fd=0.12,fb=0.2,gd=0.165,fw=0.07,sw=0.05;
    withSub(0.35,function(){reveal(F,h,0,fd,FAC,{b:true});},'all');
    MAT=MET;fbox(F,h.u0,h.u1,h.y1-fw,h.y1,fd,fb,FRM,0,0.25);fbox(F,h.u0,h.u1,h.y0,h.y0+(o.door?0.05:fw),fd,fb,FRM,0,0.25);
    fbox(F,h.u0,h.u0+fw,h.y0,h.y1,fd,fb,FRM,0,0.25);fbox(F,h.u1-fw,h.u1,h.y0,h.y1,fd,fb,FRM,0,0.25);
    var two=wd>0.95,iu0=h.u0+fw,iu1=h.u1-fw,iy0=h.y0+(o.door?0.05:fw),iy1=h.y1-fw,ops=two?[[iu0,u-0.003],[u+0.003,iu1]]:[[iu0,iu1]];
    ops.forEach(function(q){var a=q[0],b=q[1],by=o.door?0.11:sw;
      fbox(F,a,b,iy1-sw,iy1,fd-0.012,fd+0.05,FRM,0,0);fbox(F,a,b,iy0,iy0+by,fd-0.012,fd+0.05,FRM,0,0);fbox(F,a,a+sw,iy0,iy1,fd-0.012,fd+0.05,FRM,0,0);fbox(F,b-sw,b,iy0,iy1,fd-0.012,fd+0.05,FRM,0,0);
      var ga=a+sw,gb=b-sw,gy0=iy0+by,gy1=iy1-sw;
      /* Glasdichtungen: schmale dunkle Gummifugen zwischen Flügelrahmen und Glas */
      MAT=TEX;fbox(F,ga,gb,gy1-0.006,gy1,gd-0.012,gd+0.004,'#191919',0,0);fbox(F,ga,gb,gy0,gy0+0.006,gd-0.012,gd+0.004,'#191919',0,0);fbox(F,ga,ga+0.006,gy0,gy1,gd-0.012,gd+0.004,'#191919',0,0);fbox(F,gb-0.006,gb,gy0,gy1,gd-0.012,gd+0.004,'#191919',0,0);MAT=MET;
      if(o.real)tglass(o.set||TG,FP(F,ga,gy0,gd),[U[0]*(gb-ga),0,U[2]*(gb-ga)],[0,gy1-gy0,0]);
      else{var c=FP(F,u,yb+ht/2,gd),R=nrm(cr([0,1,0],n)),sR=dot(U,R);pane(c,n,(ga-u)*sR,(gb-u)*sR,gy0-(yb+ht/2),gy1-(yb+ht/2),o.sd,yb+ht/2-o.fy,wd/2,o.lit,o.cu);}});
    if(!o.door){MAT=ALM;BEV=0.004;fbox(F,h.u0-0.025,h.u1+0.025,yb-0.035,yb,-0.05,fd+0.01,ALU,0,0.2);BEV=0;fbox(F,h.u0-0.025,h.u1+0.025,yb-0.075,yb-0.035,-0.05,-0.04,ALU,0,0);MAT=MET;
      /* V17: Schmutzfahnen unter den Enden der Fensterbank (Verlauf dunkel → Putzton), ruhig und schmal */
      if(o.streak!==false){MAT=PUTZ;var sl=0.28+0.4*hr(o.sd*1.7+u),sk=hr(o.sd+u*3.1);decal(F,h.u0-0.02,h.u0+0.04+0.02*sk,yb-0.075-sl,yb-0.075,0.94);decal(F,h.u1-0.04-0.02*sk,h.u1+0.02,yb-0.075-sl*(0.7+0.5*sk),yb-0.075,0.945);
        if(sk>0.7)decal(F,u-0.04,u+0.03,yb-0.075-sl*0.5,yb-0.075,0.955);MAT=MET;}}
    else fbox(F,h.u0+fw,h.u1-fw,yb,yb+0.012,fd-0.02,fb,ALU,0,0);
    fbox(F,h.u0,h.u0+0.022,yb,h.y1,0.035,0.085,'#56565a',0,0);fbox(F,h.u1-0.022,h.u1,yb,h.y1,0.035,0.085,'#56565a',0,0);
    /* V17: dunkle Anschlussfuge zwischen Laibung und Blendrahmen (seitlich und oben, 9 mm tief) */
    MAT=TEX;quadN(FP(F,h.u0+0.002,h.y0,fd-0.009),FP(F,h.u0+0.002,h.y1,fd-0.009),FP(F,h.u0+0.002,h.y1,fd),FP(F,h.u0+0.002,h.y0,fd),U,'#2a2826');
    quadN(FP(F,h.u1-0.002,h.y0,fd-0.009),FP(F,h.u1-0.002,h.y1,fd-0.009),FP(F,h.u1-0.002,h.y1,fd),FP(F,h.u1-0.002,h.y0,fd),[-U[0],0,-U[2]],'#2a2826');
    quadN(FP(F,h.u0,h.y1-0.002,fd-0.009),FP(F,h.u1,h.y1-0.002,fd-0.009),FP(F,h.u1,h.y1-0.002,fd),FP(F,h.u0,h.y1-0.002,fd),[0,-1,0],'#2a2826');MAT=MET;
    /* Lamellenstoren (Raffstoren): Lamellen 80 mm im Abstand 72 mm zwischen den Führungsschienen, Neigung o.tilt
       (0 = waagrecht offen, 1,3 = fast geschlossen, Aussenkante unten); hochgezogen bleibt nur die Endschiene im Sturz */
    var gu0=h.u0+0.026,gu1=h.u1-0.026;MAT=MET;
    if(o.blind){var bh=Math.max(0.12,ht*o.blind),ns=Math.max(2,Math.round((bh-0.04)/0.072)),ta=o.tilt||0.5,ca=Math.cos(ta),sa=Math.sin(ta),lw=0.04,slc=C3(SLAT);
      for(var si=0;si<ns;si++){var yy=h.y1-0.035-si*0.072,dm=0.062;
        slat(FP(F,gu0,yy-lw*sa,dm-lw*ca),FP(F,gu1,yy-lw*sa,dm-lw*ca),FP(F,gu1,yy+lw*sa,dm+lw*ca),FP(F,gu0,yy+lw*sa,dm+lw*ca),slc);}
      fbox(F,gu0,gu1,h.y1-0.035-ns*0.072,h.y1-0.035-ns*0.072+0.03,0.03,0.095,'#46474a',0,0);}
    else fbox(F,gu0,gu1,h.y1-0.034,h.y1-0.004,0.03,0.095,'#46474a',0,0);
    MAT=PUTZ;
    if(o.inner){T=INT;MAT=IPU;withSub(0.3,function(){reveal(F,h,fb,ETW,IW,{b:!o.door?false:true});},'all');
      if(!o.door){MAT=STE;withBev(0.006,function(){fbox(F,h.u0-0.02,h.u1+0.02,yb-0.03,yb+0.001,fb,ETW+0.035,'#d6d0c6',0,0.2);});}
      MAT=PUTZ;T=G;}
  }
  /* V17: Verlaufsfläche 3 mm vor der Fassade (oben dunkler, unten Putzton) – Schmutzfahnen ohne harte Unterkante */
  function decal(F,u0,u1,y0,y1,k){var n=FN(F),c=C3(FAC),cd=[c[0]*k,c[1]*k*0.995,c[2]*k*0.985],a=FP(F,u0,y0,-0.003),b=FP(F,u1,y0,-0.003),cc=FP(F,u1,y1,-0.003),d=FP(F,u0,y1,-0.003);
    var nn=nrm(cr(sub(b,a),sub(d,a)));if(dot(nn,n)<0){var t=b;b=a;a=t;t=cc;cc=d;d=t;}vert(a,n,c,0);vert(b,n,c,0);vert(cc,n,cd,0);vert(a,n,c,0);vert(cc,n,cd,0);vert(d,n,cd,0);}
  /* Ziffern/Buchstaben als Striche (erhabene Schrift auf Schildern): Polylinien in Einheiten 0…0,6 × 0…1 */
  var GLY=(function(){function ell(a0,a1,n){var o=[];for(var i=0;i<=n;i++){var a=(a0+(a1-a0)*i/n)*Math.PI/180;o.push([0.3+0.27*Math.cos(a),0.5+0.5*Math.sin(a)]);}return o;}
    return {'1':[[[0.15,0.8],[0.35,1.0],[0.35,0.0]]],'2':[[[0.05,0.78],[0.12,0.93],[0.3,1.0],[0.48,0.93],[0.55,0.76],[0.5,0.6],[0.05,0.0],[0.58,0.0]]],
      '0':[ell(0,360,16)],'E':[[[0.55,1.0],[0.05,1.0],[0.05,0.0],[0.55,0.0]],[[0.05,0.5],[0.45,0.5]]],'G':[ell(40,345,14).concat([[0.57,0.42],[0.34,0.42]])],'3':[[[0.06,0.9],[0.2,1.0],[0.42,1.0],[0.54,0.88],[0.54,0.66],[0.4,0.53],[0.22,0.53]],[[0.4,0.53],[0.56,0.4],[0.56,0.14],[0.42,0.0],[0.18,0.0],[0.04,0.12]]],'Z':[[[0.05,1.0],[0.55,1.0],[0.05,0.0],[0.55,0.0]]],'O':[ell(0,360,16)],'N':[[[0.05,0.0],[0.05,1.0],[0.55,0.0],[0.55,1.0]]]};})();
  function glyphs(txt,o,U,V,sz,r,col,em){var cx=0;txt.split('').forEach(function(ch){(GLY[ch]||[]).forEach(function(pl){for(var i=0;i<pl.length-1;i++){var a=pl[i],b=pl[i+1];
      tube([o[0]+U[0]*(cx+a[0])*sz+V[0]*a[1]*sz,o[1]+U[1]*(cx+a[0])*sz+V[1]*a[1]*sz,o[2]+U[2]*(cx+a[0])*sz+V[2]*a[1]*sz],[o[0]+U[0]*(cx+b[0])*sz+V[0]*b[1]*sz,o[1]+U[1]*(cx+b[0])*sz+V[1]*b[1]*sz,o[2]+U[2]*(cx+b[0])*sz+V[2]*b[1]*sz],r,6,col,em||0,0);}});cx+=0.78;});}
  /* Viereck mit Normalenrichtung «want» (für gebackenes Licht muss die Normale in den Raum zeigen) */
  function quadN(a,b,c,d,want,col){var n=nrm(cr(sub(b,a),sub(d,a)));if(dot(n,want)<0){var t=b;b=d;d=t;}face(a,b,c,d,C3(col),0);}
  /* doppelseitige dünne Fläche (Lamelle) */
  var SLAT='#55575b';
  function slat(a,b,c,d,col){var n=nrm(cr(sub(b,a),sub(d,a))),m=[-n[0],-n[1],-n[2]];triN(a,b,c,n,n,n,col,0);triN(a,c,d,n,n,n,col,0);triN(a,c,b,m,m,m,col,0);triN(a,d,c,m,m,m,col,0);}
  /* ---- Pflanzen aus Laubkarten ---- */
  /* Strauch: viele unterschiedlich grosse Karten auf einer Halbkugel, zufällig gedreht und nach aussen geneigt –
     keine erkennbaren Kreuzflächen, keine identischen Pflanzen */
  function shrubC(x,y,z,r,hgt,tint,n){var t=C3(tint);n=n||Math.round(7+r*12);
    for(var k=0;k<n;k++){var a=rnd()*Math.PI*2,u=rnd(),d=r*(0.15+0.5*Math.sqrt(rnd())),s=0.75+rnd()*0.55,sh=0.88+rnd()*0.24,cc=[t[0]*sh,t[1]*(0.92+rnd()*0.16),t[2]*sh];
      card(x+Math.cos(a)*d,y-0.03+u*hgt*0.28,z+Math.sin(a)*d,r*(1.1+rnd()*0.5)*s,hgt*(0.55+0.35*rnd())*s,a+Math.PI/2+(rnd()-0.5)*1.1,0,cc,{cx:x,cz:z,ao:0.42+0.2*u,sw:0.5,tilt:(rnd()-0.35)*0.6});}
    for(k=0;k<2;k++)card(x+(rnd()-0.5)*r*0.4,y+hgt*(0.5+0.1*k),z+(rnd()-0.5)*r*0.4,r*1.3,r*1.2,rnd()*3,0,t,{cx:x,cz:z,ao:0.85,sw:0.45,wb:0.6,tilt:1.1+rnd()*0.3});occ(x,z,r*0.8,r*0.8);}
  /* Gräser: Horst aus 5–7 schmalen Karten mit leichtem Versatz und Neigung; Spitzen bewegen sich am stärksten */
  function grassC(x,y,z,hgt,tint,n){n=n||5+((rnd()*3)|0);var t=C3(tint);for(var k=0;k<n;k++){var a=rnd()*Math.PI,o=0.03+rnd()*0.04,h=hgt*(0.75+rnd()*0.35);
    card(x+Math.cos(a*2)*o,y-0.02,z+Math.sin(a*2)*o,h*0.85,h,a,1,[t[0]*(0.88+rnd()*0.24),t[1]*(0.9+rnd()*0.2),t[2]],{cx:x,cz:z,ao:0.5,sw:1.0,tilt:(rnd()-0.5)*0.45});}}
  function perC(x,y,z,hgt,tint){var t=C3(tint);for(var k=0;k<4;k++){var a=rnd()*Math.PI,o=rnd()*0.05;card(x+Math.cos(a*2)*o,y-0.02,z+Math.sin(a*2)*o,hgt*(0.9+rnd()*0.3),hgt*(0.85+rnd()*0.3),a,2,t,{cx:x,cz:z,ao:0.5,sw:0.8,tilt:(rnd()-0.5)*0.35});}}
  /* Baum (V17): Stamm mit Wurzelanlauf und leichter Krümmung, 4–5 Hauptäste mit je zwei Zweigen; die Krone besteht aus
     mehreren Kronenteilen an den Zweigenden (verschieden gross und dicht, mehrere Grüntöne und Blattgrössen) statt einer Kugel.
     Gleich viele Karten wie bisher. Stamm, Äste und Ansatz bewegen sich nicht, nur die Kartenspitzen (Wind im Shader). */
  var TLOD=0; /* 1 = ferner Baum: Stamm einfach, Äste mit wenigen Segmenten, keine Zweigrohre (Krone unverändert) */
  function treeC(x,z,s,tint,stems){var t=C3(tint),ch=2.2*s,cr2=1.6*s,bark='#72675b',top;MAT=STE;
    var ENDS=null;
    /* V17.1: mehrstämmig – die Äste wachsen aus den Stämmen selbst (vorher aus einem Punkt zwischen den Stämmen: V-Form mit Querast) */
    if(stems){ENDS=[];stems.forEach(function(o){var e0=[x+o[0]*3.4,ch*0.86,z+o[1]*3.4];tube([x+o[0]*0.45,-0.1,z+o[1]*0.45],e0,0.045*s,9,bark,0,0,0.028*s);ENDS.push(e0);});top=[x,ch*0.86,z];}
    else{var mid=[x+(rnd()-0.5)*0.1*s,ch*0.32,z+(rnd()-0.5)*0.1*s];top=[x+(rnd()-0.5)*0.22*s,ch*0.68,z+(rnd()-0.5)*0.22*s];
      if(TLOD)tube([x,-0.06,z],top,0.12*s,7,bark,0,0,0.075*s,false);else{tube([x,-0.06,z],[x,0.16*s,z],0.19*s,12,bark,0,0,0.115*s,false);tube([x,0.16*s,z],mid,0.115*s,12,bark,0,0,0.098*s,false);tube(mid,top,0.098*s,10,bark,0,0,0.075*s,false);}}
    var NB=4+((rnd()*2)|0),CL=[];
    for(var b=0;b<NB;b++){var a=b/NB*Math.PI*2+rnd()*0.7,L=cr2*(0.42+rnd()*0.22),el=0.55+rnd()*0.45,o0=ENDS?ENDS[b%ENDS.length]:top,e=[o0[0]+Math.cos(a)*L*(ENDS?0.7:1),o0[1]+L*el,o0[2]+Math.sin(a)*L*(ENDS?0.7:1)];
      tube(o0,e,(ENDS?0.03:0.055)*s,TLOD?4:7,bark,0,0,(ENDS?0.018:0.03)*s,false);
      for(var k2=0;k2<2;k2++){var a2=a+(k2?0.55:-0.55)+(rnd()-0.5)*0.4,L2=cr2*(0.22+rnd()*0.18),e2=[e[0]+Math.cos(a2)*L2,e[1]+L2*(0.45+rnd()*0.5),e[2]+Math.sin(a2)*L2];
        if(!TLOD)tube(e,e2,0.028*s,5,bark,0,0,0.012*s,false);CL.push([e2,cr2*(0.36+rnd()*0.2),0.85+rnd()*0.3]);}}
    CL.push([[top[0],top[1]+cr2*1.15,top[2]],cr2*0.5,1.0]);
    MAT=PUTZ;var N=Math.round(26*s*s+10),G3=[[1,1,1],[0.86,0.97,0.8],[1.1,1.06,0.92]],y0c=ch*0.68,y1c=ch*0.68+cr2*1.7;
    for(var k=0;k<N;k++){var c=CL[k%CL.length],cc=c[0],r=c[1],u=rnd()*2-1,ph=rnd()*Math.PI*2,rr=Math.sqrt(1-u*u),dx=rr*Math.cos(ph),dz=rr*Math.sin(ph),dy=u*0.72,d=0.5+rnd()*0.5;
      var sz=s*(0.5+rnd()*0.75)*(r/(cr2*0.45)),px=cc[0]+dx*r*d,py=cc[1]+dy*r*d-sz*0.45,pz=cc[2]+dz*r*d,g=G3[(k+((rnd()*3)|0))%3],sh=(0.84+rnd()*0.28)*c[2];
      var hh=Math.max(0,Math.min(1,(py-y0c)/(y1c-y0c)));
      card(px,py,pz,sz,sz*0.92,Math.atan2(pz-z,px-x)+Math.PI/2+(rnd()-0.5)*0.9,3,[t[0]*sh*g[0],t[1]*sh*g[1],t[2]*sh*g[2]],{cx:x,cz:z,ao:0.5+0.42*hh*(0.6+0.4*d),sw:0.5,wb:0.72,ph:x+z+k*0.37,tilt:(rnd()-0.5)*0.9});}
    occ(x,z,cr2*0.7,cr2*0.7);}
  /* ---- Möbelhilfen ---- */
  /* Stuhl (V17): Sitz 45 cm hoch, Sitzplatte 22 mm, schlanke Beine mit Bodenkontakt, hintere Beine als Rückenstützen, Rückenlehne als Brett */
  function chair(x,z,yaw,col,y0){var c=Math.cos(yaw),s=Math.sin(yaw),Y=y0===undefined?FLOOR:y0;function P(a,b){return [x+c*a-s*b,z+s*a+c*b];}
    MAT=HOLZ;withBev(0.006,function(){var q=P(0,0);box(q[0],Y+0.428,q[1],0.42,0.022,0.42,col,0,0);
    [[-0.18,0.18],[0.18,0.18]].forEach(function(l){var p=P(l[0],l[1]);box(p[0],Y,p[1],0.03,0.43,0.03,col,0,0);});
    [[-0.18,-0.185],[0.18,-0.185]].forEach(function(l){var p=P(l[0],l[1]);box(p[0],Y,p[1],0.03,0.86,0.03,col,0,0);});
    var bq=P(0,-0.19);if(Math.abs(s)>0.5)box(bq[0],Y+0.66,bq[1],0.02,0.17,0.38,col,0,0);else box(bq[0],Y+0.66,bq[1],0.38,0.17,0.02,col,0,0);
    var r1=P(0,0.18),r2=P(0,-0.185);if(Math.abs(s)>0.5){box(r1[0],Y+0.36,r1[1],0.02,0.04,0.34,col,0,0);box(r2[0],Y+0.36,r2[1],0.02,0.04,0.34,col,0,0);}else{box(r1[0],Y+0.36,r1[1],0.34,0.04,0.02,col,0,0);box(r2[0],Y+0.36,r2[1],0.34,0.04,0.02,col,0,0);}});MAT=PUTZ;}
  function curtain(F,u0,u1,y0,y1,d,col){var n=Math.max(6,Math.round((u1-u0)/0.07)),top=[],bot=[];
    for(var i=0;i<=n;i++){var u=u0+(u1-u0)*i/n,o=0.035*Math.sin(i*Math.PI*0.9);top.push(FP(F,u,y1,d+o));bot.push(FP(F,u,y0,d+o));}
    MAT=TEX;for(i=0;i<n;i++){var a=bot[i],b=bot[i+1],c=top[i+1],e=top[i],nn=nrm(cr(sub(b,a),sub(e,a)));var w2=FN(F);if(dot(nn,w2)<0)nn=[-nn[0],-nn[1],-nn[2]];
      var cc=C3(col);triN(a,b,c,nn,nn,nn,cc,0);triN(a,c,e,nn,nn,nn,cc,0);triN(a,c,b,[-nn[0],-nn[1],-nn[2]],[-nn[0],-nn[1],-nn[2]],[-nn[0],-nn[1],-nn[2]],cc,0);triN(a,e,c,[-nn[0],-nn[1],-nn[2]],[-nn[0],-nn[1],-nn[2]],[-nn[0],-nn[1],-nn[2]],cc,0);}MAT=PUTZ;}
  /* Fläche aus Ringen (gleich viele Punkte je Ring), weiche Normalen; out(p,n) → true = Normale umdrehen */
  function surf(rows,col,em,out){col=C3(col);em=em||0;var R=rows.length,Nn=rows[0].length,acc=rows.map(function(r){return r.map(function(){return [0,0,0];});});
    function addn(i,j,n){var a=acc[i][j];a[0]+=n[0];a[1]+=n[1];a[2]+=n[2];}
    for(var i=0;i<R-1;i++)for(var j=0;j<Nn;j++){var j2=(j+1)%Nn,a=rows[i][j],b=rows[i][j2],c=rows[i+1][j2],d=rows[i+1][j];var n=cr(sub(b,a),sub(d,a));if(Math.hypot(n[0],n[1],n[2])<1e-9)n=cr(sub(c,b),sub(a,b));addn(i,j,n);addn(i,j2,n);addn(i+1,j2,n);addn(i+1,j,n);}
    var NN=acc.map(function(r,i){return r.map(function(v,j){var n=nrm(v);if(out&&out(rows[i][j],n))n=[-n[0],-n[1],-n[2]];return n;});});
    for(i=0;i<R-1;i++)for(j=0;j<Nn;j++){j2=(j+1)%Nn;triN(rows[i][j],rows[i][j2],rows[i+1][j2],NN[i][j],NN[i][j2],NN[i+1][j2],col,em);triN(rows[i][j],rows[i+1][j2],rows[i+1][j],NN[i][j],NN[i+1][j2],NN[i+1][j],col,em);}}
  /* V17: Körper mit gerundetem Querschnitt zwischen zwei geschlossenen Konturen (lokal u/v). Profil [a 0…1 innen→aussen, w Höhe,
     nx nach aussen, ny nach oben]; Normalen analytisch – glatte Kanten an Brille, Deckel usw. statt Kasten- oder Scheibenkanten */
  function shellR(inn,out,prof,P,Nf,col){col=C3(col);var J=out.length,d=[],j;
    for(j=0;j<J;j++){var a=out[(j+J-1)%J],b=out[(j+1)%J],nn=[b[1]-a[1],-(b[0]-a[0])],l=Math.hypot(nn[0],nn[1])||1;nn=[nn[0]/l,nn[1]/l];
      if(nn[0]*(out[j][0]-inn[j][0])+nn[1]*(out[j][1]-inn[j][1])<0)nn=[-nn[0],-nn[1]];d.push(nn);}
    var R=prof.map(function(q){return out.map(function(o,j){var i=inn[j];return {p:P(i[0]+(o[0]-i[0])*q[0],i[1]+(o[1]-i[1])*q[0],q[1]),n:Nf(d[j][0]*q[2],d[j][1]*q[2],q[3])};});});
    for(var k=0;k<R.length-1;k++)for(j=0;j<J;j++){var j2=(j+1)%J,A=R[k][j],B=R[k][j2],Cc=R[k+1][j2],D=R[k+1][j];triN(A.p,B.p,Cc.p,A.n,B.n,Cc.n,col,0);triN(A.p,Cc.p,D.p,A.n,Cc.n,D.n,col,0);}}
  function sring(cx,y,cz,hx,hz,s,n){var o=[];for(var j=0;j<n;j++){var t=j/n*Math.PI*2,c=Math.cos(t),si=Math.sin(t);o.push([cx+hx*s*Math.sign(c)*Math.pow(Math.abs(c),0.5),y,cz+hz*s*Math.sign(si)*Math.pow(Math.abs(si),0.5)]);}return o;}
  function plane(x0,x1,z0,z1,y,col){face([x0,y,z1],[x1,y,z1],[x1,y,z0],[x0,y,z0],C3(col),0);}
  function houseplant(x,z,hgt){MAT=STE;cyl(x,FLOOR,z,0.21,0.42,20,'#5f5b56',0,0,0.17);MAT=ERD;cyl(x,FLOOR+0.39,z,0.18,0.02,16,'#3b3028',0,0);MAT=PUTZ;
    /* Zimmerpflanze (Gummibaum-Typ) aus modellierten Blättern statt Laubkarten: Stämmchen, wechselständige Blätter mit
       Mittelrippe, nach aussen geneigt und zur Spitze hin hängend – keine Kugelformen, kein Kartenraster */
    var stems=[[0.0,0.0,1.0],[0.05,0.03,0.82],[-0.04,0.05,0.7],[0.03,-0.05,0.9],[-0.05,-0.03,0.6]];
    stems.forEach(function(sm,si){var top=[x+sm[0]*2.2,FLOOR+0.42+(hgt-0.42)*sm[2],z+sm[1]*2.2];MAT=HOLZ;tube([x+sm[0]*0.3,FLOOR+0.4,z+sm[1]*0.3],top,0.011,7,'#6a5a48',0,0,0.006);
      var nl=7+((si*3)%3);for(var k=0;k<nl;k++){var tt=0.35+0.65*k/(nl-1),bp=[x+sm[0]*0.3+(top[0]-x-sm[0]*0.3)*tt,FLOOR+0.4+(top[1]-FLOOR-0.4)*tt,z+sm[1]*0.3+(top[2]-z-sm[1]*0.3)*tt];
        var hs=si*7.1+k*3.3+x,a=si*1.3+k*2.4,len=0.22+0.09*hr(hs)-0.05*(k===nl-1?1:0),wid=0.085+0.03*hr(hs+1),up=k===nl-1?0.9:0.35+0.25*hr(hs+2);
        MAT=BLA;leaf(bp,[Math.cos(a),up,Math.sin(a)],len,wid,0.04+0.05*hr(hs+3),['#3e5a33','#46633a','#527043','#3a5230'][(si+k)%4]);}});
    MAT=PUTZ;WALLS.push([x-0.25,x+0.25,FLOOR,FLOOR+hgt,z-0.25,z+0.25]);}
  function hr(n){var v=Math.sin(n*12.9898+78.233)*43758.5453;return v-Math.floor(v);}
  function leaf(b,dir,len,wid,droop,col){col=typeof col==="string"?hex(col):col;var f=nrm(dir),s=nrm(cr(f,[0,1,0])),n=cr(s,f),R=[],NR=8;
    for(var i=0;i<=NR;i++){var t=i/NR,w=wid*Math.pow(Math.sin(Math.PI*Math.min(1,0.08+t*0.92)),0.75)*0.5,dd=-droop*t*t,fo=0.008*Math.sin(Math.PI*t);
      var c=[b[0]+f[0]*len*t+n[0]*dd,b[1]+f[1]*len*t+n[1]*dd,b[2]+f[2]*len*t+n[2]*dd];
      R.push([[c[0]-s[0]*w-n[0]*fo,c[1]-s[1]*w-n[1]*fo,c[2]-s[2]*w-n[2]*fo],c,[c[0]+s[0]*w-n[0]*fo,c[1]+s[1]*w-n[1]*fo,c[2]+s[2]*w-n[2]*fo]]);}
    for(i=0;i<NR;i++)for(var j=0;j<2;j++){var a=R[i][j],b2=R[i][j+1],c2=R[i+1][j+1],d=R[i+1][j],nn=nrm(cr(sub(b2,a),sub(d,a)));if(nn[1]<0)nn=[-nn[0],-nn[1],-nn[2]];
      triN(a,b2,c2,nn,nn,nn,col,0);triN(a,c2,d,nn,nn,nn,col,0);}}
  var BUILD_PARTS=[buildEnv,buildGarden,buildShell,buildHall,buildFlat,buildMoving];
  /* V17: jeder Bauteil beginnt mit eigenem Zufallsstartwert – Änderungen in einem Teil verschieben die Zufallsfolge der anderen nicht */
  function build(){BUILD_PARTS.forEach(function(f,i){seed=20261008+i*7919;f();});}
  /* ================= Umgebung: Himmel, Wiese, Strasse, Nachbarschaft, Bäume in der Ferne ================= */
  function buildEnv(){
    T=SKY;MAT=HIM;box(0,-450,0,900,900,900,'#000000',0,0);MAT=PUTZ;T=G;
    grp('Umgebung',ENV);
    MAT=RAS;withSub(1.0,function(){plane(-16,16,-9,-5.5,0.02,'#56663f');plane(-16,-9,-5.5,5.5,0.02,'#56663f');plane(9,16,-5.5,5.5,0.02,'#56663f');plane(-16,-1.62,19.25,19.3,0.02,'#4f5f3b');});
    withSub(18,function(){plane(-90,90,-90,-9,0,'#2e3428');plane(-90,-16,-9,19.3,0,'#2e3428');plane(16,90,-9,19.3,0,'#2e3428');plane(-90,90,28.5,90,0,'#2e3428');});
    /* V17.1: ferner Boden mit Bodenmaterial (vorher Fassadenputz: unbeleuchtet → dunkles Band am Horizont) */
    MAT=RAS;withSub(40,function(){[[-440,440,-440,-90],[-440,440,90,440],[-440,-90,-90,90],[90,440,-90,90]].forEach(function(r){plane(r[0],r[1],r[2],r[3],0,'#2e3428');});});MAT=RAS;
    /* Trottoir, Randstein, Strasse */
    /* V17.1: Strasse und Trottoir laufen bis an den Rand des Quartiers (vorher endeten sie bei ±30 m, dahinter war eine Lücke im Boden) */
    MAT=ASP;withSub(1.2,function(){box(0,-0.1,20.3,60,0.16,2.0,'#6f6c67',0,0);box(0,-0.1,24.95,60,0.12,7.1,'#3a3b3d',0,0);},'up');
    withSub(4,function(){[-1,1].forEach(function(sg){box(sg*46,-0.1,20.3,32,0.16,2.0,'#6f6c67',0,0);box(sg*46,-0.1,24.95,32,0.12,7.1,'#3a3b3d',0,0);});},'up');
    MAT=RAS;withSub(14,function(){plane(-90,-62,19.3,28.5,0,'#2e3428');plane(62,90,19.3,28.5,0,'#2e3428');});
    MAT=STE;BEV=0.012;for(var x=-29.5;x<30;x+=1.0)box(x,-0.12,21.37,0.994,0.2,0.14,'#9a958d',0,0);BEV=0;[-1,1].forEach(function(sg){box(sg*46,-0.12,21.37,32,0.2,0.14,'#9a958d',0,0);});
    MAT=PLA;box(0,0.019,25,124,0.003,0.12,'#d6d2c8',0,0);
    /* Strassenleuchten */
    [[-7.5,21.0],[13.5,21.0],[34,21.0]].forEach(function(s){MAT=MET;cyl(s[0],0,s[1],0.07,5.4,10,'#4a4a4a',0,0,0.05);tube([s[0],5.35,s[1]],[s[0],5.55,s[1]+0.5],0.045,8,'#4a4a4a',0,0);box(s[0],5.42,s[1]+0.62,0.26,0.1,0.5,'#4a4a4a',0,0);
      MAT=LEU;box(s[0],5.41,s[1]+0.62,0.2,0.012,0.42,'#ffe1b8',1.25,0);MAT=PUTZ;light(s[0],5.2,s[1]+0.6,10,'#ffd2a0',0.75,0);halo(s[0],5.36,s[1]+0.62,0.7,'#ffd2a0',0.3);});
    /* V17 Quartier: zurückhaltende Schweizer Mehrfamilienhäuser statt grauer Blöcke – Geschosse à 2,9 m, Fensterachsen auf allen
       Seiten mit Fensterbank, teils Storen unten, wenige helle Fenster, Sockel, Flachdach mit Blechabdeckung oder flaches
       Satteldach, Balkone auf einer Seite; Putztöne leicht verschieden und gedämpft, damit das Haupthaus im Fokus bleibt */
    function nhouse(x,z,w,d,fl,o){var H=0.55+fl*2.9,tone=o.tone,roof=o.roof,sides=o.sides||[0,1,2,3];
      MAT=BET;box(x,0,z,w+0.04,0.55,d+0.04,'#8c877f',0,0);MAT=PUTZ;box(x,0.55,z,w,H-0.55,d,tone,0,0);
      if(roof==='flat'){MAT=ALM;box(x,H,z,w+0.12,0.12,d+0.12,'#77736d',0,0);}
      else{MAT=STE;var ax=w>=d,L=ax?w:d,Bd=(ax?d:w)/2+0.45,rh=Math.min(2.2,Bd*0.55),rc='#5d524b',e0=-L/2-0.35,e1=L/2+0.35;
        function P(u,v,y){return ax?[x+u,y,z+v]:[x+v,y,z+u];}
        [-1,1].forEach(function(sg){quadN(P(e0,sg*Bd,H-0.05),P(e1,sg*Bd,H-0.05),P(e1,0,H+rh),P(e0,0,H+rh),ax?[0,0.6,sg]:[sg,0.6,0],rc);});
        MAT=PUTZ;[-1,1].forEach(function(sg){var a1=P(sg*L/2,-Bd+0.45,H),b1=P(sg*L/2,Bd-0.45,H),c1=P(sg*L/2,0,H+rh*((Bd-0.45)/Bd));tri(a1,b1,c1,hex(tone),0);tri(a1,c1,b1,hex(tone),0);});}
      var lit=o.lit||0.12;
      sides.forEach(function(si){var nz=si<2,sg=si%2?1:-1,Ls=nz?w:d,na=Math.max(2,Math.round(Ls/2.75)),sp=Ls/na,n=nz?[0,0,sg]:[sg,0,0],U=nz?[1,0,0]:[0,0,1],off=(nz?d:w)/2+0.012;
        for(var f=0;f<fl;f++)for(var i=0;i<na;i++){var u=-Ls/2+(i+0.5)*sp,yb=0.55+f*2.9+0.92,ww=Math.min(1.25,sp*0.48),hh=1.38,c=nz?[x+u,yb,z+sg*off]:[x+sg*off,yb,z+u];
          var p0=[c[0]-U[0]*ww/2,yb,c[2]-U[2]*ww/2],r=rnd(),on=r<lit,bl=!on&&r>0.78;
          MAT=GLA;rect(p0,[U[0]*ww,0,U[2]*ww],[0,hh,0],n,on?'#efc690':'#283039',on?0.42+0.3*rnd():0);
          if(bl){MAT=MET;rect([p0[0]+n[0]*0.004,yb+hh*(0.25+0.5*rnd()),p0[2]+n[2]*0.004],[U[0]*ww,0,U[2]*ww],[0,hh*0.75,0],n,'#8b8a86');}
          if(!o.far){MAT=ALM;rect([p0[0]-U[0]*0.03,yb-0.02,p0[2]-U[2]*0.03],[U[0]*(ww+0.06),0,U[2]*(ww+0.06)],[n[0]*0.05,0,n[2]*0.05],[0,1,0],'#b9b6b0');}}
        if(o.bal===si){MAT=BET;for(f=1;f<fl;f++)for(i=0;i<na;i+=2){var u2=-Ls/2+(i+0.5)*sp,by=0.55+f*2.9,bc=nz?[x+u2,by-0.18,z+sg*((nz?d:w)/2+0.65)]:[x+sg*((nz?d:w)/2+0.65),by-0.18,z+u2];
          if(nz)box(bc[0],bc[1],bc[2],2.4,0.18,1.3,'#cfcac2',0,0);else box(bc[0],bc[1],bc[2],1.3,0.18,2.4,'#cfcac2',0,0);
          MAT=MET;var rc2=[bc[0]+n[0]*0.62,by,bc[2]+n[2]*0.62];if(nz)box(rc2[0],rc2[1],rc2[2],2.4,0.95,0.04,'#3f4144',0,0);else box(rc2[0],rc2[1],rc2[2],0.04,0.95,2.4,'#3f4144',0,0);MAT=BET;}}});
      MAT=PUTZ;}
    var NT=['#cfc8bc','#c9c2b4','#d4cdc0','#bfbab0','#c8c0ae','#d0cbc3'];
    [[-46,-40,16,11,4,'flat',1],[-14,-58,20,12,5,'gable',1],[24,-50,14,12,3,'gable',1],[58,-18,12,16,4,'flat',2],[-64,6,11,16,3,'gable',3],[64,30,14,11,4,'flat',2],[-42,46,13,10,3,'gable',0],[-30,38,12,10,3,'flat',0],[30,44,14,11,3,'gable',0],
     [-30,-24,14,11,4,'flat',1],[31,-27,15,10,3,'gable',1],[-27,2,10,14,3,'gable',3]].forEach(function(b,k){
      nhouse(b[0],b[1],b[2],b[3],b[4],{roof:b[5],tone:NT[k%NT.length],bal:b[6],lit:0.1+0.08*((k*5)%3)});});
    /* weitere Nachbarschaft auf Ringen (bricht den Horizont): Satteldächer und Fensterreihen zur Mitte, im Dunst */
    for(var nb=0;nb<26;nb++){var an=nb/26*Math.PI*2+rnd()*0.15,rr=75+rnd()*45,bx2=Math.cos(an)*rr,bz2=Math.sin(an)*rr,bw2=10+rnd()*10,bh2=2+((rnd()*3)|0);
      if(bz2>15&&Math.abs(bx2)<60)continue;var sx=Math.abs(bx2)>Math.abs(bz2);
      nhouse(bx2,bz2,bw2,bw2*0.8,bh2,{roof:rnd()<0.55?'gable':'flat',tone:['#b3ada3','#bbb4a8','#aba69e'][(rnd()*3)|0],sides:[sx?(bx2>0?2:3):(bz2>0?0:1)],lit:0.14,far:true});}
    /* Strasse: Parkfelder der blauen Zone am Trottoir, zwei neutral parkierte Autos (ohne Marke, Schild leer), Signal «Zone 30» */
    MAT=PLA;[[-13.6,-8.4],[3.2,8.4]].forEach(function(pb){box((pb[0]+pb[1])/2,0.0195,23.42,pb[1]-pb[0],0.002,0.1,'#2f5f9e',0,0);[pb[0],pb[1]].forEach(function(xx){box(xx,0.0195,22.48,0.1,0.002,1.98,'#2f5f9e',0,0);});});
    function car(cx,cz,col,flip){var sg=flip?-1:1;function P(u,y,v){return [cx+sg*u,y,cz+v];}
      MAT=MET;withBev(0.11,function(){box(cx,0.26,cz,4.3,0.42,1.78,col,0,0);});withBev(0.09,function(){var hc=P(0.05,0,0);box(hc[0],0.6,cz,4.0,0.27,1.72,col,0,0);});
      MAT=TEX;box(cx,0.2,cz,3.7,0.1,1.6,'#1f1f20',0,0);
      var cb=[[-1.3,0.86,0.84],[1.0,0.86,0.84],[0.42,1.38,0.7],[-0.95,1.38,0.7]];
      quadN(P(-0.95,1.38,-0.7),P(0.42,1.38,-0.7),P(0.42,1.38,0.7),P(-0.95,1.38,0.7),[0,1,0],col);
      MAT=GLA;quadN(P(1.0,0.86,-0.8),P(1.0,0.86,0.8),P(0.42,1.38,0.68),P(0.42,1.38,-0.68),[sg,0.7,0],'#1d232b');quadN(P(-1.3,0.86,-0.8),P(-1.3,0.86,0.8),P(-0.95,1.38,0.68),P(-0.95,1.38,-0.68),[-sg,0.8,0],'#1d232b');
      [-1,1].forEach(function(sv){quadN(P(-1.3,0.86,sv*0.84),P(1.0,0.86,sv*0.84),P(0.42,1.38,sv*0.7),P(-0.95,1.38,sv*0.7),[0,0.15,sv],'#232a33');
        MAT=MET;quadN(P(-0.28,0.86,sv*0.845),P(-0.22,0.86,sv*0.845),P(-0.25,1.38,sv*0.705),P(-0.31,1.38,sv*0.705),[0,0.15,sv],col);MAT=GLA;});
      MAT=TEX;[[-1.38,-0.79],[-1.38,0.79],[1.36,-0.79],[1.36,0.79]].forEach(function(wv){var p=P(wv[0],0.32,wv[1]);tube([p[0],0.32,p[2]-0.11],[p[0],0.32,p[2]+0.11],0.32,18,'#1b1b1c',0,0);MAT=ALM;tube([p[0],0.32,p[2]+(wv[1]>0?0.112:-0.112)],[p[0],0.32,p[2]+(wv[1]>0?0.116:-0.116)],0.15,14,'#5f6062',0,0);MAT=TEX;});
      MAT=LEU;[-0.62,0.62].forEach(function(v){var a1=P(2.151,0.66,v);box(a1[0],0.64,a1[2],0.012,0.1,0.32,'#dfe3e6',0,0);var b1=P(-2.151,0.68,v);box(b1[0],0.66,b1[2],0.012,0.12,0.3,'#5b1a17',0,0);});
      MAT=IPU;var pf=P(2.152,0.4,0),pr=P(-2.152,0.42,0);box(pf[0],0.38,pf[2],0.012,0.11,0.5,'#e9e9e6',0,0);box(pr[0],0.4,pr[2],0.012,0.11,0.3,'#e9e9e6',0,0);
      MAT=PUTZ;occ(cx,cz,2.2,0.95);}
    car(-11.0,22.48,'#5c6672',false);car(5.8,22.48,'#b9bbbc',true);
    /* Signal «Zone 30» am Trottoir (rechteckige Tafel, roter Ring, Ziffern) */
    MAT=MET;tube([16.2,0,20.75],[16.2,2.6,20.75],0.03,10,'#8d8f91',0,0);MAT=IPU;withBev(0.006,function(){box(16.2,1.86,20.73,0.62,0.78,0.02,'#f4f4f2',0,0);});
    MAT=KER;var rg=[];for(var ri=0;ri<=24;ri++){var ra=ri/24*Math.PI*2;rg.push([16.2+Math.cos(ra)*0.2,2.33+Math.sin(ra)*0.2,20.743]);}for(ri=0;ri<24;ri++)tube(rg[ri],rg[ri+1],0.032,6,'#c8282d',0,0);
    glyphs('30',[16.2-0.115,2.255,20.749],[1,0,0],[0,1,0],0.15,0.012,'#1d1d1d');glyphs('ZONE',[16.2-0.125,1.99,20.749],[1,0,0],[0,1,0],0.08,0.007,'#1d1d1d');
    MAT=PUTZ;
    /* Bäume in der Ferne */
    [[-32,-20],[-25,-31],[-11,-36],[5,-35],[19,-30],[31,-15],[-36,-4],[-35,14],[36,4],[40,-6],[-18,-26],[-24,26],[24,31],[-52,10],[50,14],[-8,-55],[22,-62],[-40,-48],[58,-40],[-60,-20]].forEach(function(t){var s=1.6+rnd()*0.9;TLOD=1;treeC(t[0],t[1],s,['#6f8160','#7a8a66','#687a5a'][(rnd()*3)|0]);TLOD=0;});
  }
  /* ================= Garten: Rasen, Weg mit Randsteinen, Beete, Bäume, Hecken, Leuchten, Terrasse ================= */
  function buildGarden(){
    grp('Garten',G);
    /* Rasen vor dem Haus und seitlich: fein gerastert für weiches Licht und Schatten */
    MAT=RAS;withSub(0.5,function(){plane(-16,-0.88,5.95,19.25,0.02,'#56663f');plane(0.88,16,8.8,19.25,0.02,'#56663f');plane(0.88,5.75,5.95,8.8,0.02,'#56663f');plane(9.45,16,5.95,8.8,0.02,'#56663f');plane(9.45,16,-5.5,5.95,0.02,'#56663f');},'up');
    /* Kiesstreifen entlang der Fassade mit Stahlkante */
    MAT=ERD;withSub(0.5,function(){box(-5.19,-0.05,ZF+0.225,7.62,0.08,0.45,'#9b968d',0,0);box(3.69,-0.05,ZF+0.225,4.12,0.08,0.45,'#9b968d',0,0);box(XS+0.225,-0.05,0.225,0.45,0.08,DEP+0.45,'#9b968d',0,0);
      box(0,-0.05,-ZF-0.225,W+0.9,0.08,0.45,'#9b968d',0,0);box(-XS-0.225,-0.05,0.0,0.45,0.08,DEP,'#9b968d',0,0);},'up');
    MAT=MET;box(-5.19,-0.05,ZF+0.453,7.62,0.1,0.006,'#4b4845',0,0);box(3.69,-0.05,ZF+0.453,4.12,0.1,0.006,'#4b4845',0,0);box(XS+0.453,-0.05,0.0,0.006,0.1,DEP,'#4b4845',0,0);MAT=PUTZ;
    /* Gehweg: Betonplatten 50 cm, Granit-Randsteine in 1-m-Stücken */
    MAT=PLA;withSub(0.5,function(){box(0,-0.05,13.45,1.6,0.1,11.6,'#a8a39b',0,0);},'up');
    MAT=STE;BEV=0.01;for(var z=7.65;z<19.25;z+=1.0){var l=Math.min(0.994,19.25-z);box(-0.84,-0.1,z+l/2,0.08,0.18,l,'#a29d95',0,0);box(0.84,-0.1,z+l/2,0.08,0.18,l,'#a29d95',0,0);}BEV=0;
    MAT=PUTZ;
    /* Beete: Erde mit Stahlkante, Pflanzen sitzen in der Erde */
    function bed(x0,x1,z0,z1){MAT=ERD;withSub(0.45,function(){box((x0+x1)/2,-0.05,(z0+z1)/2,x1-x0,0.095,z1-z0,'#6b5947',0,0);},'up');MAT=MET;
      box((x0+x1)/2,-0.05,z0,x1-x0+0.006,0.1,0.006,'#3f3c39',0,0);box((x0+x1)/2,-0.05,z1,x1-x0+0.006,0.1,0.006,'#3f3c39',0,0);box(x0,-0.05,(z0+z1)/2,0.006,0.1,z1-z0,'#3f3c39',0,0);box(x1,-0.05,(z0+z1)/2,0.006,0.1,z1-z0,'#3f3c39',0,0);MAT=PUTZ;}
    bed(-6.2,-1.25,8.3,11.9);bed(1.25,4.9,10.3,13.7);bed(-8.6,-1.6,ZF+0.45,ZF+1.25);bed(1.6,5.6,ZF+0.45,ZF+1.25);
    var Y=0.045;
    /* linkes Beet: Felsenbirne (mehrstämmig), Sträucher, Gräser, Stauden in Gruppen */
    treeC(-3.9,10.1,1.15,'#8a9a72',[[-0.12,0],[0.1,0.08],[0.02,-0.12]]);
    shrubC(-5.4,Y,9.0,0.42,0.75,LEAF[1]);shrubC(-5.6,Y,11.1,0.36,0.62,LEAF[3]);shrubC(-2.0,Y,11.2,0.34,0.55,LEAF[0]);shrubC(-1.85,Y,8.9,0.3,0.5,LEAF[4]);
    [[-4.7,8.75],[-4.4,9.05],[-2.9,8.7],[-2.6,11.4],[-3.1,11.55],[-5.0,11.45],[-1.75,10.1]].forEach(function(g,i){grassC(g[0],Y,g[1],0.55+rnd()*0.3,['#c9bf8a','#b8b480','#cfc394'][i%3]);});
    [[-4.9,10.2],[-4.6,10.6],[-2.4,9.6],[-2.2,10.4],[-3.4,9.2],[-5.3,10.0],[-2.9,10.95]].forEach(function(g){perC(g[0],Y,g[1],0.42+rnd()*0.2,['#b5c19c','#c2c6a2','#adbb94'][(rnd()*3)|0]);});
    /* rechtes Beet */
    shrubC(4.3,Y,10.9,0.4,0.7,LEAF[2]);shrubC(4.35,Y,13.0,0.36,0.6,LEAF[0]);shrubC(1.9,Y,13.15,0.3,0.48,LEAF[3]);
    [[1.8,10.8],[2.2,11.2],[3.1,10.7],[3.5,12.6],[2.6,13.3],[1.75,12.1]].forEach(function(g,i){grassC(g[0],Y,g[1],0.5+rnd()*0.3,['#c9bf8a','#bdb784'][i%2]);});
    [[2.6,11.8],[3.2,11.6],[2.1,12.6],[3.9,12.0],[3.0,12.7]].forEach(function(g){perC(g[0],Y,g[1],0.4+rnd()*0.2,['#b5c19c','#c2c6a2'][(rnd()*2)|0]);});
    /* Pflanzstreifen vor den Fenstern: niedrige, geschnittene Sträucher */
    /* Pflanzstreifen vor den Fenstern: lockere Gruppen aus Kugelsträuchern, Stauden und Gräsern – kein Raster */
    function strip(x0,x1){var px=x0;while(px<x1){var z=ZF+0.62+rnd()*0.38,r=rnd();
      if(r<0.55){var rr=0.2+rnd()*0.12;shrubC(px,Y,z,rr,rr*1.5,LEAF[(rnd()*5)|0]);px+=rr*1.6+rnd()*0.35;}
      else if(r<0.8){perC(px,Y,z,0.32+rnd()*0.2,['#b5c19c','#aebb92'][(rnd()*2)|0]);px+=0.35+rnd()*0.3;}
      else{grassC(px,Y,z,0.4+rnd()*0.2,'#c2bb88');px+=0.3+rnd()*0.3;}}}
    strip(-8.35,-1.85);strip(1.9,4.9);
    /* Grasbüschel am Beetrand und im Rasen (lockert die Kanten auf) */
    for(var k=0;k<70;k++){var gx=-15+rnd()*30,gz=6.2+rnd()*12.8;if(Math.abs(gx)<1.3)continue;if(gx>-6.4&&gx<-1.05&&gz>8.1&&gz<12.1)continue;if(gx>1.05&&gx<5.1&&gz>10.1&&gz<13.9)continue;if(gx>5.6&&gx<9.2&&gz<8.9)continue;
      card(gx,0.0,gz,0.22,0.12,rnd()*3,1,'#9aa070',{ao:0.6,sw:0.4});}
    /* Veloabstellplatz neben dem Weg: Platten, drei Anlehnbügel (Chromstahl), zwei Velos */
    MAT=PLA;withSub(0.5,function(){box(2.55,-0.05,7.75,2.3,0.1,1.5,'#a8a39b',0,0);},'up');
    MAT=EDS;[1.9,2.6,3.3].forEach(function(bx){var pts=[];for(var i=0;i<=16;i++){var t=i/16,z,y;if(t<0.3){z=7.35;y=t/0.3*0.62;}else if(t>0.7){z=8.15;y=(1-t)/0.3*0.62;}else{var a=(t-0.3)/0.4*Math.PI;z=7.75-0.4*Math.cos(a);y=0.62+0.16*Math.sin(a);}pts.push([bx,y+0.05,z]);}
      bogen(pts,0.02,0.02,10,'#a7a8a6',0);WALLS.push([bx-0.05,bx+0.05,0,0.85,7.3,8.2]);});
    function velo(x,z0,col){var P=function(a,u){return [x,0.05+u,z0-a];};MAT=TEX;[[0,0.34],[1.06,0.34]].forEach(function(w){var ring=[],rim=[];for(var i=0;i<=36;i++){var t=i/36*Math.PI*2;ring.push(P(w[0]+0.34*Math.cos(t),w[1]+0.34*Math.sin(t)));rim.push(P(w[0]+0.3*Math.cos(t),w[1]+0.3*Math.sin(t)));}
        bogen(ring,0.019,0.019,8,'#232323',0);MAT=ALM;bogen(rim,0.008,0.008,6,'#9c9c9a',0);for(var k=0;k<12;k++){var t2=k/12*Math.PI*2;tube(P(w[0],w[1]),P(w[0]+0.29*Math.cos(t2),w[1]+0.29*Math.sin(t2)),0.0015,4,'#b8b8b6',0,0);}MAT=TEX;});
      var R=P(0,0.34),F=P(1.06,0.34),B=P(0.44,0.3),S=P(0.34,0.86),Hh=P(0.93,0.9),HB=P(0.96,0.74);MAT=MET;
      [[B,S,0.016],[S,Hh,0.015],[B,HB,0.019],[R,B,0.011],[R,S,0.01],[HB,F,0.013],[Hh,HB,0.02]].forEach(function(t){tube(t[0],t[1],t[2],10,col,0,0);});
      MAT=TEX;tube(P(0.32,0.9),P(0.31,0.98),0.012,8,'#2a2a2a',0,0);box(x,1.03,z0-0.31,0.13,0.05,0.24,'#1f1f1f',0,0);
      MAT=MET;tube(P(0.93,0.9),P(0.9,1.04),0.012,8,'#2a2a2a',0,0);tube([x-0.27,1.09,z0-0.88],[x+0.27,1.09,z0-0.88],0.011,10,'#2a2a2a',0,0);
      MAT=ALM;tube([x-0.06,0.35,z0-0.44],[x+0.06,0.35,z0-0.44],0.03,14,'#8a8a88',0,0);MAT=PUTZ;WALLS.push([x-0.3,x+0.3,0,1.15,z0-1.42,z0+0.36]);}
    velo(2.25,8.55,'#2f4a3b');velo(3.0,8.6,'#6b2a27');
    /* Wegleuchten (Poller) mit warmem Licht */
    [[-1.18,9.2],[1.18,12.2],[-1.18,15.2],[1.18,18.2]].forEach(function(b){MAT=MET;cyl(b[0],0,b[1],0.065,0.62,16,'#363534',0,0);cyl(b[0],0.62,b[1],0.075,0.03,16,'#363534',0,0);
      MAT=LEU;cyl(b[0],0.5,b[1],0.067,0.08,16,'#ffe2b6',1.15,0);MAT=PUTZ;light(b[0],0.52,b[1],2.8,'#ffc98c',0.75,0);halo(b[0],0.54,b[1],0.28,'#ffcf98',0.3);WALLS.push([b[0]-0.08,b[0]+0.08,0,0.65,b[1]-0.08,b[1]+0.08]);});
    /* Bäume am Grundstücksrand */
    treeC(-11.2,13.4,1.75,'#7d8f68');treeC(13.9,2.2,1.5,'#859470');treeC(-12.5,-1.5,1.9,'#74865f');treeC(13.6,-3.5,1.7,'#7d8f68');
    /* Hecken: geschnittener Körper mit Blatttextur, dazu Karten an der Oberkante (keine harte Kastenform) */
    grp('Hecken',G);
    function hedge(x0,x1,z0,z1,hgt){MAT=HEC;withSub(0.6,function(){box((x0+x1)/2,0,(z0+z1)/2,x1-x0,hgt,z1-z0,'#4e5f40',0,0);},'all');MAT=PUTZ;
      var lx=x1-x0,lz=z1-z0,along=lx>lz,L=Math.max(lx,lz),n=Math.round(L/0.45);
      for(var i=0;i<n;i++){var t=(i+0.5)/n,cx=along?x0+lx*t:(x0+x1)/2,cz=along?(z0+z1)/2:z0+lz*t,yaw=along?0:Math.PI/2,th=Math.min(lx,lz)/2;
        [-1,1].forEach(function(sd){var ox=along?0:sd*th,oz=along?sd*th:0;card(cx+ox*0.96+(rnd()-0.5)*0.1,hgt-0.34+rnd()*0.12,cz+oz*0.96+(rnd()-0.5)*0.1,0.55+rnd()*0.25,0.5+rnd()*0.08,yaw+(rnd()-0.5)*0.4,0,'#a3b28c',{cx:(x0+x1)/2,cz:(z0+z1)/2,ao:0.7,sw:0.35,tilt:sd*(along?1:-1)*0.35});});
        /* V17.1: Oberseite aus zwei kleineren, gegeneinander geneigten Karten statt einer flachen Platte (wirkt aus der Nähe gewölbt) */
        [-1,-0.5,0,0.5,1].forEach(function(sd){var ox=along?(rnd()-0.5)*0.3:sd*th*0.55,oz=along?sd*th*0.55:(rnd()-0.5)*0.3;card(cx+ox,hgt-0.12+rnd()*0.06,cz+oz,0.36+rnd()*0.16,0.32+rnd()*0.12,yaw+(rnd()-0.5)*1.2,0,['#a3b28c','#9aab84','#a8b690'][(rnd()*3)|0],{cx:(x0+x1)/2,cz:(z0+z1)/2,ao:0.88,sw:0.35,tilt:(sd||(rnd()<0.5?-1:1))*(along?-1:1)*(0.7+rnd()*0.35)});});
        /* V17: unregelmässige Oberkante – einzelne Triebe ragen 5–15 cm über den Schnitt */
        if(i%2===0)card(cx+(rnd()-0.5)*0.2,hgt-0.18,cz+(rnd()-0.5)*0.2,0.38+rnd()*0.2,0.3+rnd()*0.12,yaw+(rnd()-0.5)*0.8,0,'#9fb087',{cx:(x0+x1)/2,cz:(z0+z1)/2,ao:0.85,sw:0.5,tilt:(rnd()-0.5)*0.5});}
      WALLS.push([x0,x1,0,hgt,z0,z1]);occ((x0+x1)/2,(z0+z1)/2,lx/2,lz/2);}
    hedge(-15.6,-1.62,18.55,19.25,1.3);hedge(1.62,15.6,18.55,19.25,1.3);hedge(-15.6,-14.9,6.0,18.55,1.3);hedge(14.9,15.6,6.0,18.55,1.3);
    /* Terrasse vor dem Wohnraum: grossformatige Platten, Stufe zum Rasen, Pflanzkübel, Wandleuchte */
    grp('Terrasse',G);
    MAT=PLA;withSub(0.45,function(){box(7.37,-0.05,ZF+1.4,3.16,0.49,2.8,'#b3aea5',0,0);box(7.37,-0.05,ZF+2.97,3.16,0.27,0.34,'#aaa59c',0,0);},'up');
    MAT=BET;withBev(0.015,function(){box(8.55,0.44,ZF+2.3,0.7,0.5,0.5,'#8e8a83',0,0.2);});MAT=ERD;box(8.55,0.94,ZF+2.3,0.62,0.01,0.42,'#3d3129',0,0);MAT=PUTZ;
    grassC(8.55,0.95,ZF+2.3,0.7,'#c4bc8a',4);WALLS.push([8.2,8.9,0.44,1.6,ZF+2.05,ZF+2.55]);
    MAT=MET;box(8.75,2.45,ZF+0.04,0.12,0.2,0.08,'#3a3a39',0,0);MAT=LEU;box(8.75,2.44,ZF+0.06,0.09,0.012,0.05,'#ffe2b6',1.2,0);MAT=PUTZ;light(8.7,2.3,ZF+0.35,4.2,'#ffc98c',0.8,0);halo(8.75,2.42,ZF+0.09,0.3,'#ffcf98',0.28);
    /* Aussenwasserhahn (frostsicher) am Sockel neben der Terrasse */
    MAT=CHR;tube([5.95,0.42,ZF],[5.95,0.42,ZF+0.03],0.03,16,'#c9cacb',0,0);tube([5.95,0.42,ZF+0.03],[5.95,0.42,ZF+0.09],0.012,12,'#c9cacb',0,0);tube([5.95,0.42,ZF+0.09],[5.95,0.36,ZF+0.11],0.011,12,'#c9cacb',0,0);tube([5.95,0.45,ZF+0.06],[5.95,0.5,ZF+0.06],0.006,8,'#c9cacb',0,0);tube([5.93,0.5,ZF+0.06],[5.97,0.5,ZF+0.06],0.006,8,'#c9cacb',0,0);MAT=PUTZ;
    /* Lichtschein aus den hellen Öffnungen auf Terrasse, Weg und Rasen */
    light(7.3,1.7,ZF+0.5,4.6,'#ffcf9a',0.55,0);light(XS+0.5,1.9,0.2,3.4,'#ffcf9a',0.38,0);light(XS+0.5,1.9,3.6,3.4,'#ffcf9a',0.38,0);light(0.6,1.6,ZF+0.4,3.0,'#ffcf9a',0.3,0);
  }
  /* ================= Gebäudehülle ================= */
  function buildShell(){
    grp('Gebaeude_Aussen',G);
    var FRONT={ax:'z',c:ZF,s:1},SIDE={ax:'x',c:XS,s:1},BACK={ax:'z',c:-ZF,s:-1},LEFT={ax:'x',c:-XS,s:-1};
    var HF=[],HS=[],k,f;
    /* Öffnungen: Haustür + Seitenlicht, Terrassentür, Fenster je Geschoss; Treppenhausfenster in der Mittelachse */
    HF.push({u0:-0.85,u1:0.85,y0:FLOOR,y1:FLOOR+2.35,door:1},{u0:6.3,u1:8.3,y0:FLOOR,y1:FLOOR+2.4,door:1});
    var WIN=[];
    for(f=0;f<FL;f++){var Fy=FLOOR+f*FH;
      [-7.2,-4.3,4.3,7.2].forEach(function(x){if(f===0&&x===7.2)return;var d=f>0&&Math.abs(x)===7.2;WIN.push({F:FRONT,u:x,y:d?Fy:Fy+0.85,w:d?1.1:1.3,h:d?2.4:1.55,door:d,f:f});});
      if(f>0)WIN.push({F:FRONT,u:0,y:Fy+0.9,w:1.0,h:1.5,f:f,stair:1});
      [-3.6,0.2,3.6].forEach(function(z){WIN.push({F:SIDE,u:z,y:Fy+0.85,w:1.3,h:1.55,f:f});});
      /* Rückfassade (Wohnseite): Fenster je Wohnung, in den Obergeschossen Fenstertüren mit französischem Balkon;
         linke Seitenfassade wie die rechte – das Gebäude hat ringsum bewohnte Fassaden */
      [-7.0,-4.4,-1.6,1.6,4.4,7.0].forEach(function(x){var fr=f>0&&Math.abs(x)===4.4;WIN.push({F:BACK,u:x,y:fr?Fy:Fy+0.85,w:fr?1.1:1.3,h:fr?2.4:1.55,door:fr,frb:fr,f:f});});
      [-3.6,0.2,3.6].forEach(function(z){WIN.push({F:LEFT,u:z,y:Fy+0.85,w:1.3,h:1.55,f:f});});}
    var HB=[],HL=[];
    WIN.forEach(function(o){var hh={u0:o.u-o.w/2,u1:o.u+o.w/2,y0:o.y,y1:o.y+o.h};(o.F===FRONT?HF:o.F===SIDE?HS:o.F===BACK?HB:HL).push(hh);});
    /* Fassadenflächen (WDVS, Abriebputz), fein gerastert für Licht und Umgebungsverdeckung */
    MAT=PUTZ;
    /* V17.1: Vorder- und Seitenfassade (Hauptansichten) feiner gerastert – Balkonschatten ohne schräge Interpolationsfahnen */
    withSub(0.34,function(){holed(FRONT,-XS,XS,FLOOR,PAR,0,HF,[0,0,1],FAC,true);holed(SIDE,-ZI,ZI,FLOOR,PAR,0,HS,[1,0,0],FAC,true);},'v');
    withSub(0.55,function(){
      holed(BACK,-XS,XS,FLOOR,PAR,0,HB,[0,0,-1],FAC,true);holed(LEFT,-ZI,ZI,FLOOR,PAR,0,HL,[-1,0,0],FAC,true);
      /* Wandstirnen an den Ecken (gehören optisch zur Seitenfassade) */
      [[XS,1],[-XS,-1]].forEach(function(e){rect([e[0],FLOOR,ZI],[0,0,ETW],[0,PAR-FLOOR,0],[e[1],0,0],FAC);rect([e[0],FLOOR,-ZF],[0,0,ETW],[0,PAR-FLOOR,0],[e[1],0,0],FAC);});
    },'v');
    /* Unterkante Putz (2 cm Rücksprung zum Sockel) und Sockelprofil */
    [[FRONT,-XS,XS],[SIDE,-ZF,ZF]].forEach(function(e){var F=e[0],U=FU(F);rect(FP(F,e[1],FLOOR,0),[U[0]*(e[2]-e[1]),0,U[2]*(e[2]-e[1])],sub(FP(F,0,0,0.02),FP(F,0,0,0)),[0,-1,0],FAC);MAT=MET;MAT=ALM;fbox(F,e[1],e[2],FLOOR-0.012,FLOOR,-0.004,0.02,'#8d8a85',0,0);MAT=PUTZ;});
    /* Sockel (Sichtbeton, 2 cm zurückgesetzt) */
    /* fein unterteilt: die unterste Eckpunktreihe liegt im Kies (verschattet) – der Übergang bleibt so auf wenige cm begrenzt */
    MAT=BET;withSub(0.12,function(){fbox(FRONT,-XS+0.02,XS-0.02,-0.02,FLOOR,0.02,ETW,SOC,0,0);fbox(SIDE,-ZF+0.02,ZF-0.02,-0.02,FLOOR,0.02,ETW,SOC,0,0);},'v');
    withSub(0.6,function(){fbox(BACK,-XS+0.02,XS-0.02,-0.02,FLOOR,0.02,ETW,SOC,0,0);fbox(LEFT,-ZF+0.02,ZF-0.02,-0.02,FLOOR,0.02,ETW,SOC,0,0);},'v');MAT=PUTZ;
    /* Attika: Innenseite, Dachfläche (Kies), Blechabdeckung mit Überstand */
    MAT=PUTZ;rect([-XI,TOP+0.25,ZI],[2*XI,0,0],[0,PAR-TOP-0.25,0],[0,0,-1],'#cfc8bd');rect([XI,TOP+0.25,-ZI],[0,0,2*ZI],[0,PAR-TOP-0.25,0],[-1,0,0],'#cfc8bd');rect([-XI,TOP+0.25,-ZI],[2*XI,0,0],[0,PAR-TOP-0.25,0],[0,0,1],'#cfc8bd');rect([-XI,TOP+0.25,-ZI],[0,0,2*ZI],[0,PAR-TOP-0.25,0],[1,0,0],'#cfc8bd');
    MAT=ERD;withSub(1.0,function(){box(0,TOP,0,2*XI,0.25,2*ZI,'#8d8a84',0,0);},'up');
    /* extensive Dachbegrünung (Sedum-Matten, wie in Zürich üblich) mit Kiesstreifen am Rand und um die Aufbauten */
    MAT=RAS;var SED=['#6e7748','#7a7a4c','#86704f','#5f6b42','#727a50'];
    for(var rx=-XI+0.55;rx<XI-0.55-0.01;rx+=0.6)for(var rz=-ZI+0.55;rz<ZI-0.55-0.01;rz+=0.6){
      if(rx>-3.4&&rx<-1.3&&rz>1.6&&rz<3.4)continue;if(rx>0.6&&rx<2.9&&rz>-0.1&&rz<1.95)continue;
      var hn=Math.sin(rx*1.7+rz*2.9)*0.5+Math.sin(rx*0.61-rz*1.37)*0.5;plane(rx,Math.min(rx+0.6,XI-0.55),rz,Math.min(rz+0.6,ZI-0.55),TOP+0.253,SED[((hn*0.5+0.5)*4.99)|0]);}
    MAT=EDS;[[-6.8,-4.6],[6.8,-4.6],[-6.8,4.6],[6.8,4.6]].forEach(function(v){cyl(v[0],TOP+0.25,v[1],0.11,0.06,16,'#6c6a66',0,0);});
    MAT=ALM;BEV=0.006;box(0,PAR,ZF-ETW/2,W+0.06,0.05,ETW+0.06,ALU,0,0.4);box(0,PAR,-ZF+ETW/2,W+0.06,0.05,ETW+0.06,ALU,0,0.4);box(XS-ETW/2,PAR,0,ETW+0.06,0.05,DEP-2*ETW,ALU,0,0.4);box(-XS+ETW/2,PAR,0,ETW+0.06,0.05,DEP-2*ETW,ALU,0,0.4);
    BEV=0;box(0,PAR-0.06,ZF+0.025,W+0.06,0.06,0.008,ALU,0,0);box(XS+0.025,PAR-0.06,0,0.008,0.06,DEP+0.06,ALU,0,0);
    /* Dachaufbau Treppenhaus/Lift */
    /* Aufbauten über dem Kern: Liftüberfahrt über dem Liftschacht, Dachausstieg mit Lichtkuppel über der Treppe */
    MAT=PUTZ;box(1.75,TOP+0.25,0.85,1.5,1.1,1.3,FAC,0,0.4);MAT=ALM;box(1.75,TOP+1.35,0.85,1.56,0.05,1.36,ALU,0,0);
    MAT=PUTZ;box(-2.35,TOP+0.25,2.5,1.2,0.5,1.1,FAC,0,0.3);MAT=ALM;box(-2.35,TOP+0.75,2.5,1.24,0.04,1.14,ALU,0,0);MAT=GLA;box(-2.35,TOP+0.79,2.5,0.9,0.12,0.8,'#39424c',0,0);
    MAT=MET;[[3.5,-3.2],[4.6,-1.4],[-5.5,-2.6]].forEach(function(v){cyl(v[0],TOP+0.25,v[1],0.06,0.55,10,'#7c7a77',0,0);});
    MAT=PUTZ;
    /* Fenster und Fenstertüren */
    var seedw=11;
    WIN.forEach(function(o){var real=o.f===0&&o.F===SIDE&&o.u>-1;var lit=o.stair?0.7:(rnd()<0.62?0.5+0.5*rnd():0);seedw+=1;
      var bl=0,tl=0.5;if(!real&&!o.stair&&rnd()<0.42){var br=rnd();bl=br<0.18?1.0:0.22+rnd()*0.5;tl=[0.12,0.55,0.95,1.3][(rnd()*4)|0];}
      fwin(o.F,o.u,o.y,o.w,o.h,{door:o.door,real:real,inner:real,sd:seedw,fy:FLOOR+o.f*FH,lit:lit,cu:o.stair?0:(rnd()<0.6?0.12+rnd()*0.25:0),blind:bl,tilt:tl});
      /* französischer Balkon: Absturzsicherung aus Flachstahl vor der Fenstertür (Rückfassade) */
      if(o.frb){var Fb=o.F,gy=o.y;MAT=MET;fbox(Fb,o.u-o.w/2-0.04,o.u+o.w/2+0.04,gy+0.97,gy+1.0,-0.07,-0.03,'#3b3b3a',0,0.3);fbox(Fb,o.u-o.w/2-0.04,o.u+o.w/2+0.04,gy+0.12,gy+0.15,-0.07,-0.03,'#3b3b3a',0,0);
        for(var fb=0;fb<=9;fb++)fbox(Fb,o.u-o.w/2+fb*(o.w/9)-0.008,o.u-o.w/2+fb*(o.w/9)+0.008,gy+0.15,gy+0.97,-0.06,-0.04,'#3b3b3a',0,0);
        [-1,1].forEach(function(sd){fbox(Fb,o.u+sd*(o.w/2+0.03)-0.02,o.u+sd*(o.w/2+0.03)+0.02,gy+0.1,gy+1.0,-0.07,0.0,'#3b3b3a',0,0);});MAT=PUTZ;}});
    /* Erdgeschoss: Haustür-Laibung und Rahmen mit festem Seitenlicht (echtes Glas) */
    var hd={u0:-0.85,u1:0.85,y0:FLOOR,y1:FLOOR+2.35};
    withSub(0.35,function(){reveal(FRONT,hd,0,0.1,FAC,{b:true});},'all');
    T=INT;MAT=IPU;reveal(FRONT,hd,0.2,ETW,IW,{b:true});T=G;
    MAT=MET;fbox(FRONT,-0.85,0.85,FLOOR+2.27,FLOOR+2.35,0.1,0.2,FRM,0,0.3);solid(-0.85,-0.77,FLOOR,FLOOR+2.35,ZF-0.2,ZF-0.1,FRM,0,0.3);solid(0.77,0.85,FLOOR,FLOOR+2.35,ZF-0.2,ZF-0.1,FRM,0,0.3);
    solid(0.32,0.38,FLOOR,FLOOR+2.27,ZF-0.2,ZF-0.1,FRM,0,0.3);fbox(FRONT,0.38,0.77,FLOOR,FLOOR+0.12,0.1,0.2,FRM,0,0);
    tglass(TG,[0.38,FLOOR+0.12,ZF-0.15],[0.39,0,0],[0,2.15,0]);
    fbox(FRONT,-0.77,0.32,FLOOR,FLOOR+0.015,0.08,0.24,ALU,0,0);MAT=PUTZ;
    /* Terrassentür: Laibung, Rahmen, fester Flügel rechts (echtes Glas); Schiebeflügel siehe buildMoving */
    var ht={u0:6.3,u1:8.3,y0:FLOOR,y1:FLOOR+2.4};
    withSub(0.35,function(){reveal(FRONT,ht,0,0.12,FAC,{b:true});},'all');T=INT;MAT=IPU;reveal(FRONT,ht,0.28,ETW,IW,{b:true});T=G;
    MAT=MET;fbox(FRONT,6.3,8.3,FLOOR+2.33,FLOOR+2.4,0.12,0.28,FRM,0,0.3);solid(6.3,6.37,FLOOR,FLOOR+2.4,ZF-0.28,ZF-0.12,FRM,0,0.3);solid(8.23,8.3,FLOOR,FLOOR+2.4,ZF-0.28,ZF-0.12,FRM,0,0.3);
    fbox(FRONT,6.3,8.3,FLOOR,FLOOR+0.03,0.1,0.3,ALU,0,0);
    fbox(FRONT,7.28,8.23,FLOOR+0.03,FLOOR+0.13,0.12,0.18,FRM,0,0);fbox(FRONT,7.28,8.23,FLOOR+2.26,FLOOR+2.33,0.12,0.18,FRM,0,0);fbox(FRONT,7.28,7.34,FLOOR+0.03,FLOOR+2.33,0.12,0.18,FRM,0,0);
    tglass(TG,[7.34,FLOOR+0.13,ZF-0.15],[0.89,0,0],[0,2.13,0]);MAT=PUTZ;
    /* Balkone: Platte mit Tropfkante, Staketengeländer, Bodenplatten, wenig Möblierung */
    for(f=1;f<FL;f++){[-5.75,5.75].forEach(function(bx,j){var by=FLOOR+f*FH,z0=ZF,z1=ZF+1.6;
      MAT=BET;BEV=0.012;withSub(0.5,function(){box(bx,by-0.24,(z0+z1)/2,4.4,0.2,1.6,'#d9d4cb',0,0.4);},'down');BEV=0;MAT=PLA;box(bx,by-0.04,(z0+z1)/2-0.02,4.3,0.012,1.52,'#9d988f',0,0);
      /* V17: Geländer stirnseitig montiert – Pfosten vor der Plattenstirn mit je zwei Konsolen und Dübeln, Staketen ab Plattenoberkante;
         dunkle Fuge des Wärmedämmelements unter der Platte an der Fassade */
      MAT=MET;var gc='#3b3b3a',gz=z1+0.04;box(bx,by+0.98,gz,4.36,0.045,0.06,gc,0,0.35);box(bx,by-0.02,gz,4.36,0.04,0.04,gc,0,0);
      for(var b2=0;b2<=36;b2++)box(bx-2.16+b2*0.12,by+0.0,gz,0.018,0.98,0.03,gc,0,0);
      [-2.16,-0.72,0.72,2.16].forEach(function(px){box(bx+px,by-0.22,gz,0.05,1.22,0.04,gc,0,0.2);[by-0.205,by-0.105].forEach(function(cy){box(bx+px,cy,z1+0.012,0.09,0.06,0.024,gc,0,0);[-0.028,0.028].forEach(function(dx){tube([bx+px+dx,cy+0.03,z1+0.024],[bx+px+dx,cy+0.03,z1+0.03],0.007,8,'#5a5a58',0,0);});});});
      MAT=TEX;box(bx,by-0.2405,z0+0.015,4.4,0.002,0.03,'#4f4c47',0,0);MAT=MET;
      [-1,1].forEach(function(sd){box(bx+sd*2.16,by+0.98,(z0+z1)/2,0.06,0.045,1.56,gc,0,0);for(var b3=1;b3<=12;b3++)box(bx+sd*2.16,by+0.08,z0+b3*0.12,0.03,0.9,0.018,gc,0,0);});
      box(bx+1.9,by-0.2,z1+0.06,0.06,0.06,0.16,'#77746f',0,0);MAT=PUTZ;
      if(f===1&&j===1){chair(bx-0.6,ZF+0.85,Math.PI/2,'#6f5a46',by-0.03);chair(bx+0.6,ZF+0.85,-Math.PI/2,'#6f5a46',by-0.03);MAT=MET;cyl(bx,by,ZF+0.85,0.3,0.02,18,'#4a4a4a',0,0);box(bx,by,ZF+0.85,0.04,0.7,0.04,'#4a4a4a',0,0);cyl(bx,by+0.7,ZF+0.85,0.3,0.025,18,'#4a4a4a',0,0);MAT=PUTZ;}
      if(f===2&&j===0){MAT=BET;box(bx-1.5,by,ZF+1.25,0.9,0.42,0.38,'#77736c',0,0);MAT=PUTZ;grassC(bx-1.75,by+0.42,ZF+1.25,0.6,'#c4bc8a',3);grassC(bx-1.25,by+0.42,ZF+1.25,0.55,'#b8b480',3);}
      if(f===3&&j===1){MAT=STE;cyl(bx+1.6,by,ZF+1.2,0.2,0.4,16,'#6a5f55',0,0,0.16);MAT=PUTZ;shrubC(bx+1.6,by+0.38,ZF+1.2,0.3,0.6,LEAF[2],4);}
      /* V17: weitere, unterschiedliche Möblierung – Holzbank mit Kissen (1. OG links), zwei Töpfe verschieden gross (3. OG links) */
      if(f===1&&j===0){MAT=HOLZ;withBev(0.008,function(){box(bx+0.9,by+0.4,ZF+0.32,1.2,0.04,0.38,'#8b6c50',0,0);[-0.5,0.5].forEach(function(dx){box(bx+0.9+dx,by-0.03,ZF+0.32,0.05,0.43,0.34,'#7b5f46',0,0);});});
        MAT=TEX;withBev(0.02,function(){box(bx+0.6,by+0.44,ZF+0.3,0.4,0.09,0.34,'#b8a58c',0,0);});MAT=STE;cyl(bx-1.4,by-0.03,ZF+0.35,0.16,0.32,16,'#8a7e71',0,0,0.13);MAT=PUTZ;perC(bx-1.4,by+0.28,ZF+0.35,0.45,'#7f9a63');}
      if(f===3&&j===0){MAT=STE;cyl(bx-1.2,by-0.03,ZF+0.4,0.24,0.46,18,'#5f5a54',0,0,0.2);cyl(bx-0.7,by-0.03,ZF+0.3,0.13,0.26,14,'#a49482',0,0,0.11);MAT=PUTZ;grassC(bx-1.2,by+0.42,ZF+0.4,0.7,'#a9b07a',5);perC(bx-0.7,by+0.22,ZF+0.3,0.32,'#8aa06c');}
      if(f===2&&j===1){MAT=LEU;cyl(bx,by-0.245,ZF+0.8,0.08,0.008,14,'#fff0da',0.9,0);MAT=PUTZ;light(bx,by-0.4,ZF+0.9,3.4,'#ffd2a0',0.55,0);}
    });}
    /* Regenwasser: Fallrohre an beiden Ecken mit Rohrschellen, Standrohr-Bogen in einen Einlaufschacht im Kies,
       Notüberläufe (Speier) in der Attika */
    MAT=MET;[[XS+0.09,ZF-0.14,1],[-XS-0.09,ZF-0.14,-1]].forEach(function(dp){var x=dp[0],z=dp[1];tube([x,0.32,z],[x,PAR-0.12,z],0.05,16,'#8e8b87',0,0);tube([x,PAR-0.12,z],[x-dp[2]*0.09,PAR-0.02,z],0.05,16,'#8e8b87',0,0);
      for(var c2=1;c2<5;c2++){box(x-dp[2]*0.045,c2*2.8,z,0.1,0.03,0.035,'#7b7975',0,0);}tube([x,0.32,z],[x,0.22,z+0.12],0.05,16,'#8e8b87',0,0);MAT=EDS;box(x,0.028,z+0.2,0.24,0.012,0.24,'#5f5d5a',0,0);for(var g=0;g<5;g++)box(x,0.041,z+0.12+g*0.04,0.2,0.002,0.008,'#2d2c2b',0,0);MAT=MET;});
    MAT=MET;[[XS+0.09,-ZF+0.14,1],[-XS-0.09,-ZF+0.14,-1]].forEach(function(dp){var x=dp[0],z=dp[1];tube([x,0.32,z],[x,PAR-0.12,z],0.05,16,'#8e8b87',0,0);tube([x,PAR-0.12,z],[x-dp[2]*0.09,PAR-0.02,z],0.05,16,'#8e8b87',0,0);
      for(var c2=1;c2<5;c2++){box(x-dp[2]*0.045,c2*2.8,z,0.1,0.03,0.035,'#7b7975',0,0);}tube([x,0.32,z],[x,0.22,z-0.12],0.05,16,'#8e8b87',0,0);MAT=EDS;box(x,0.028,z-0.2,0.24,0.012,0.24,'#5f5d5a',0,0);for(var g=0;g<5;g++)box(x,0.041,z-0.12-g*0.04,0.2,0.002,0.008,'#2d2c2b',0,0);MAT=MET;});
    MAT=ALM;[-6.0,6.0].forEach(function(x){box(x,TOP+0.32,ZF+0.06,0.12,0.06,0.16,'#9a9894',0,0);box(x,TOP+0.32,-ZF-0.06,0.12,0.06,0.16,'#9a9894',0,0);});MAT=PUTZ;
    /* V17: unter den Notüberläufen schmale Wasserfahnen, unter der Attika-Abdeckung ein leichter Grauschleier (gerastert) */
    MAT=PUTZ;[-6.0,6.0].forEach(function(x){decal(FRONT,x-0.05,x+0.06,TOP-0.7,TOP+0.29,0.86);decal(BACK,x-0.06,x+0.05,TOP-0.55,TOP+0.29,0.88);});
    [[FRONT,-XS,XS],[BACK,-XS,XS],[SIDE,-ZF,ZF],[LEFT,-ZF,ZF]].forEach(function(e){for(var u=e[1];u<e[2]-0.01;u+=1.0)decal(e[0],u,Math.min(u+1.0,e[2]),PAR-0.42,PAR-0.065,0.94);});
    /* Hauseingang: Podest, drei Stufen, Handlauf, Vordach mit Downlights, Klingeltableau, Hausnummernschild (ohne Nummer) */
    grp('Eingang',G);
    MAT=BET;BEV=0.012;withSub(0.4,function(){box(0,-0.05,ZF+0.75,2.6,FLOOR-0.02+0.05,1.5,'#b8b3aa',0,0.3);box(0,-0.05,ZF+1.66,2.0,0.384,0.32,'#b5b0a7',0,0.3);box(0,-0.05,ZF+1.98,2.0,0.24,0.32,'#b2ada4',0,0.3);},'up');
    BEV=0;MAT=MET;tube([-1.15,1.36,ZF+0.4],[-1.15,1.36,ZF+1.5],0.022,10,'#3d3c3b',0,0);tube([-1.15,1.36,ZF+1.5],[-1.15,0.95,ZF+2.2],0.022,10,'#3d3c3b',0,0);
    [[ZF+0.45],[ZF+1.45],[ZF+2.15]].forEach(function(q,i){var yb=i===2?0.05:FLOOR-0.02;tube([-1.15,yb,q[0]],[-1.15,1.36-(i===2?0.38:0),q[0]],0.018,8,'#3d3c3b',0,0);});
    MAT=BET;BEV=0.012;withSub(0.4,function(){box(0,2.95,ZF+0.8,3.0,0.2,1.6,'#e1dcd3',0,0.5);},'down');MAT=ALM;BEV=0.006;box(0,3.15,ZF+0.8,3.04,0.04,1.64,ALU,0,0.3);BEV=0;
    MAT=LEU;[-0.62,0.62].forEach(function(x){cyl(x,2.938,ZF+0.95,0.07,0.012,16,'#fff1da',1.25,0);halo(x,2.9,ZF+0.95,0.22,'#ffd8a8',0.22);});MAT=PUTZ;
    light(-0.62,2.8,ZF+1.0,4.6,'#ffcf96',0.95,0);light(0.62,2.8,ZF+1.0,4.6,'#ffcf96',0.95,0);
    /* Briefkasten- und Sonnerieanlage (aufgesetzt, anthrazit): 8 Briefkästen (2 × 4) mit Einwurfklappe, Schloss und
       neutralem Namensschild (unlesbar), darüber Sonnerie mit Gegensprechanlage, 8 Klingeltaster mit Schildern */
    var mbx=1.22,mbz=ZF;MAT=MET;withBev(0.006,function(){box(mbx,1.02,mbz+0.05,0.52,1.06,0.1,'#3c3d3f',0,0.3);});
    for(var mc=0;mc<2;mc++)for(var mr=0;mr<4;mr++){var bx2=mbx-0.125+mc*0.25,by2=1.08+mr*0.165;MAT=ALM;box(bx2,by2,mbz+0.101,0.235,0.15,0.006,'#a7a7a5',0,0);
      MAT=TEX;box(bx2,by2+0.11,mbz+0.105,0.17,0.012,0.003,'#1e1f20',0,0);MAT=ALM;box(bx2,by2+0.122,mbz+0.106,0.18,0.016,0.004,'#8f8f8d',0,0);
      MAT=IPU;box(bx2-0.04,by2+0.035,mbz+0.105,0.11,0.03,0.002,'#efece6',0,0);MAT=TEX;box(bx2-0.045,by2+0.046,mbz+0.1062,0.07,0.004,0.001,'#7a7772',0,0);
      MAT=CHR;tube([bx2+0.08,by2+0.05,mbz+0.104],[bx2+0.08,by2+0.05,mbz+0.111],0.008,10,'#c9cacb',0,0);}
    MAT=ALM;box(mbx,1.76,mbz+0.101,0.48,0.3,0.006,'#a7a7a5',0,0);MAT=TEX;for(var gx2=0;gx2<5;gx2++)for(var gy2=0;gy2<4;gy2++)box(mbx-0.19+gx2*0.022,1.94+gy2*0.022,mbz+0.105,0.008,0.008,0.002,'#262626',0,0);
    MAT=GLA;tube([mbx-0.05,1.98,mbz+0.104],[mbx-0.05,1.98,mbz+0.11],0.012,12,'#121417',0,0);
    for(var kc=0;kc<2;kc++)for(var kr=0;kr<4;kr++){var kx=mbx+0.02+kc*0.11,ky=1.79+kr*0.055;MAT=CHR;tube([kx,ky,mbz+0.104],[kx,ky,mbz+0.11],0.009,12,'#d4d5d6',0,0);MAT=IPU;box(kx+0.045,ky-0.008,mbz+0.105,0.06,0.016,0.002,'#efece6',0,0);}
    WALLS.push([mbx-0.27,mbx+0.27,1.0,2.1,mbz,mbz+0.12]);
    /* Hausnummer: emailliertes Schild weiss auf blau (illustrativ, keine reale Adresse) */
    MAT=KER;box(mbx,2.18,mbz+0.008,0.2,0.15,0.012,'#1f4f8f',0,0);MAT=IPU;box(mbx,2.18,mbz+0.0145,0.2,0.006,0.002,'#f4f2ee',0,0);box(mbx,2.324,mbz+0.0145,0.2,0.006,0.002,'#f4f2ee',0,0);box(mbx-0.097,2.18,mbz+0.0145,0.006,0.15,0.002,'#f4f2ee',0,0);box(mbx+0.097,2.18,mbz+0.0145,0.006,0.15,0.002,'#f4f2ee',0,0);
    glyphs('12',[mbx-0.075,2.205,mbz+0.017],[1,0,0],[0,1,0],0.1,0.0055,'#f4f2ee');
    /* Sauberlaufzone vor der Haustür (eingelassene Bürstenmatte mit Alu-Rahmen) */
    MAT=TEX;box(0,0.481,ZF+0.42,1.1,0.004,0.6,'#3a3836',0,0);for(var mr2=0;mr2<14;mr2++)plane(-0.54,0.54,ZF+0.135+mr2*0.042,ZF+0.135+mr2*0.042+0.02,0.4855,'#262422');MAT=ALM;box(0,0.481,ZF+0.12,1.12,0.006,0.012,'#8f8e8b',0,0);box(0,0.481,ZF+0.72,1.12,0.006,0.012,'#8f8e8b',0,0);
    MAT=PUTZ;
  }
  /* ================= Innen: Treppenhalle und Wohnungsflur ================= */
  function buildHall(){
    grp('Eingangshalle_Treppenhaus',INT);
    var FRONT={ax:'z',c:ZF,s:1};
    MAT=BPL;withSub(0.25,function(){box(0,FLOOR-0.02,(1.5+ZI)/2,6,0.02,ZI-1.5,'#a39c92',0,0);},'up');
    MAT=IPU;withSub(0.3,function(){
      wall('x',-3,1.5,ZI,FLOOR,CEIL,0.12,[],IW,0.2);wall('z',1.5,-3.06,3.06,FLOOR,CEIL,0.12,[],IW,0.2);
      wall('x',3,-1,ZI,FLOOR,CEIL,0.12,[[2.86,3.84,FLOOR+2.15]],IW,0.2);
      holed(FRONT,-2.94,2.94,FLOOR,CEIL,ETW,[{u0:-0.85,u1:0.85,y0:FLOOR,y1:FLOOR+2.35}],[0,0,-1],IW);
    },'v');
    /* Decke mit Treppenauge, darüber das nächste Podest (dunkel) */
    /* Treppenauge über dem ganzen Lauf: überall ≥ 2,0 m Kopfhöhe über den Stufenvorderkanten; darüber der Schacht mit
       der Untersicht des nächsten Laufs (2,2 m über der Stufenlinie) */
    var TZ=4.31;function nose(z){return Math.min(1.94,Math.max(0.176,0.176*(1+(5.01-z)/0.29)));}
    MAT=IPU;withSub(0.3,function(){box(0.625,CEIL,(1.56+ZI)/2,4.75,0.04,ZI-1.56,CW,0,0);box(-2.375,CEIL,(TZ+ZI)/2,1.25,0.04,ZI-TZ,CW,0,0);},'down');
    (function(){var x0=-2.94,x1=-1.75,za=TZ,zb=1.82,zc=1.56,ya=FLOOR+nose(za)+2.2,yb=FLOOR+nose(zb)+2.2,SW='#e4dfd7';
      withSub(0.3,function(){quadN([x0,ya,za],[x1,ya,za],[x1,yb,zb],[x0,yb,zb],[0,-1,0],CW);quadN([x0,yb,zb],[x1,yb,zb],[x1,yb,zc],[x0,yb,zc],[0,-1,0],CW);
        [[x1,-1],[x0,1]].forEach(function(w){var x=w[0];quadN([x,CEIL,za],[x,ya,za],[x,yb,zb],[x,CEIL,zb],[w[1],0,0],SW);quadN([x,CEIL,zb],[x,yb,zb],[x,yb,zc],[x,CEIL,zc],[w[1],0,0],SW);});
        quadN([x0,CEIL,za],[x1,CEIL,za],[x1,ya,za],[x0,ya,za],[0,0,-1],SW);quadN([x0,CEIL,zc],[x1,CEIL,zc],[x1,yb,zc],[x0,yb,zc],[0,0,1],SW);},'all');})();
    MAT=LEU;cyl(0.5,CEIL-0.035,3.5,0.22,0.035,24,'#fff2df',1.15,0);cyl(-0.9,CEIL-0.035,2.4,0.16,0.035,20,'#fff2df',1.05,0);MAT=IPU;
    light(0.5,CEIL-0.25,3.5,5.0,'#ffdcae',0.78,1);light(-0.9,CEIL-0.25,2.4,4.0,'#ffdcae',0.52,1);halo(0.5,CEIL-0.06,3.5,0.32,'#ffe6c4',0.08);
    /* Treppe: Kunststeinstufen, Wange, Handlauf */
    MAT=STE;BEV=0.006;for(var s=0;s<11;s++)solid(-2.94,-1.77,FLOOR,FLOOR+0.176*(s+1),4.72-s*0.29,5.01-s*0.29,'#b8b0a5',0,0.3);
    /* V17: Gleitschutzstreifen an den Stufenvorderkanten, dunkle Fuge Stufe/Wand */
    BEV=0;MAT=TEX;for(s=0;s<11;s++){plane(-2.9,-1.81,4.975-s*0.29,4.997-s*0.29,FLOOR+0.176*(s+1)+0.0012,'#5f5a53');}
    for(s=0;s<11;s++)box(-2.937,FLOOR+0.176*(s+1)-0.004,4.865-s*0.29,0.006,0.008,0.29,'#6b655d',0,0);MAT=STE;
    /* V17.1: Wange (verputzt) bis 6 cm über die Stufenkanten, darauf Staketengeländer aus Flachstahl (Abstand < 12 cm), Eichenhandlauf
       0,9 m über den Stufenkanten. Vorher eine 0,95 m hohe Brüstung, die durch einen Unterteilungsfehler waagrecht gezeichnet wurde. */
    BEV=0;MAT=IPU;(function(){var xa=-1.77,xb=-1.65,z0=5.02,z1=1.82,z2=1.72,y0=FLOOR,t0=FLOOR+nose(z0)+0.06,t1=FLOOR+nose(z1)+0.06,PW='#e2ddd4',xm=(xa+xb)/2;
      /* Oberkante mit Knick am Podest (zk), damit sie überall 6 cm über den Stufenkanten liegt */
      var zk=5.01-0.29*(1.94/0.176-1),tk=FLOOR+1.94+0.06,SEG=[[z0,t0,zk,tk],[zk,tk,z1,t1],[z1,t1,z2,t1]];
      withSub(0.3,function(){SEG.forEach(function(g){[[xa,-1],[xb,1]].forEach(function(w){var x=w[0];quadN([x,y0,g[0]],[x,g[1],g[0]],[x,g[3],g[2]],[x,y0,g[2]],[w[1],0,0],PW);});
        quadN([xa,g[1],g[0]],[xb,g[1],g[0]],[xb,g[3],g[2]],[xa,g[3],g[2]],[0,1,0],PW);});
        quadN([xa,y0,z0],[xb,y0,z0],[xb,t0,z0],[xa,t0,z0],[0,0,1],PW);quadN([xa,y0,z2],[xb,y0,z2],[xb,t1,z2],[xa,t1,z2],[0,0,-1],PW);},'all');
      WALLS.push([xa,xb,FLOOR,FLOOR+nose(z1)+0.95,z2,z0]);
      MAT=MET;var ST2='#3b3b3a';for(var zz=z0-0.06;zz>z1+0.02;zz-=0.115){var yb=FLOOR+nose(zz)+0.06;box(xm,yb,zz,0.012,0.84,0.03,ST2,0,0);}
      [[z0-0.03,0],[z1+0.03,0]].forEach(function(q){var yb=FLOOR+nose(q[0])+0.06;box(xm,yb,q[0],0.03,0.86,0.03,ST2,0,0);});
      /* Handlauf folgt der Steigung bis zum Podest (Knick bei zk), dann waagrecht */
      tube([xm,FLOOR+nose(z0-0.03)+0.9,z0-0.03],[xm,FLOOR+1.94+0.9,zk],0.012,6,ST2,0,0);tube([xm,FLOOR+1.94+0.9,zk],[xm,FLOOR+1.94+0.9,z1+0.03],0.012,6,ST2,0,0);
      MAT=HOLZ;tube([xm,FLOOR+nose(5.05)+0.935,5.05],[xm,FLOOR+1.94+0.935,zk],0.024,14,'#a47e57',0,0.3);tube([xm,FLOOR+1.94+0.935,zk],[xm,FLOOR+1.94+0.935,1.82],0.024,14,'#a47e57',0,0);})();
    tube([-2.9,FLOOR+1.0,4.9],[-2.9,FLOOR+2.85,1.7],0.018,8,'#8d8a86',0,0);
    /* Briefkastenanlage, Anschlagbrett, Leuchtband, Pflanze, Fussabtreter, Sockelleisten, Türzargen */
    /* Lift: Schachttür Chromstahl geschliffen (zwei Teleskopflügel), Portal, Schwelle, Ruftaster, Stockwerkanzeige */
    MAT=EDS;withBev(0.003,function(){box(1.475,FLOOR,1.567,0.45,2.1,0.014,'#b9b9b6',0,0.3);box(1.925,FLOOR,1.567,0.45,2.1,0.014,'#b4b4b1',0,0.3);});
    box(1.225,FLOOR,1.57,0.05,2.16,0.02,'#a9a9a6',0,0.2);box(2.175,FLOOR,1.57,0.05,2.16,0.02,'#a9a9a6',0,0.2);box(1.7,FLOOR+2.1,1.57,1.0,0.06,0.02,'#a9a9a6',0,0.2);
    MAT=ALM;box(1.7,FLOOR-0.002,1.6,1.0,0.008,0.08,'#9a9995',0,0);
    MAT=EDS;box(2.42,FLOOR+0.92,1.565,0.08,0.22,0.01,'#b4b4b1',0,0.2);MAT=CHR;tube([2.42,FLOOR+1.03,1.57],[2.42,FLOOR+1.03,1.578],0.017,16,'#d0d1d2',0,0);MAT=LEU;tube([2.42,FLOOR+1.03,1.5785],[2.42,FLOOR+1.03,1.579],0.012,16,'#ffe9c8',0.7,0);
    MAT=GLA;box(1.7,FLOOR+2.2,1.566,0.2,0.09,0.012,'#141518',0,0);MAT=LEU;glyphs('0',[1.678,FLOOR+2.215,1.5735],[1,0,0],[0,1,0],0.06,0.003,'#ffd9a6',0.9);
    WALLS.push([1.2,2.2,FLOOR,FLOOR+2.2,1.5,1.6]);
    /* Etagenkennzeichnung neben der Treppe */
    MAT=MET;box(-1.25,FLOOR+1.62,1.566,0.17,0.11,0.012,'#3c3d3f',0,0);MAT=IPU;glyphs('EG',[-1.31,FLOOR+1.645,1.574],[1,0,0],[0,1,0],0.06,0.0035,'#f1eee8');
    /* Anschlagbrett: Aushänge mit Textzeilen und Nadeln (statt leerer weisser Flächen) */
    MAT=HOLZ;box(0.2,1.45,1.575,0.8,0.62,0.025,'#b59c7c',0,0.3);MAT=IPU;[[0.0,1.55,'#f2eee6'],[0.33,1.6,'#eef0ea'],[0.12,1.78,'#f4ecdc']].forEach(function(q,qi){box(q[0],q[1],1.5905,0.2,0.26,0.004,q[2],0,0);
      MAT=TEX;box(q[0]-0.01,q[1]+0.205,1.5935,0.15,0.014,0.001,'#5d5a55',0,0);for(var ln=0;ln<5;ln++)box(q[0]-0.005+(ln%2)*0.01,q[1]+0.17-ln*0.028,1.5935,0.15-(ln===4?0.06:0),0.006,0.001,'#a19c94',0,0);
      MAT=EDS;tube([q[0],q[1]+0.235,1.5925],[q[0],q[1]+0.235,1.601],0.0055,10,['#b8483c','#3f6c8f','#c9a23a'][qi],0,0);MAT=IPU;});
    /* Leuchtband in Aluminiumprofil (Licht tritt unten aus) */
    MAT=LEU;cyl(1.7,CEIL-0.012,2.25,0.06,0.012,16,'#fff2df',1.15,0);MAT=IPU;light(1.7,CEIL-0.3,2.25,3.0,'#ffdcae',0.5,1);
    houseplant(2.64,1.98,1.45);
    MAT=IPU;withBev(0.003,function(){box(1.05,FLOOR+1.02,ZI-0.006,0.072,0.072,0.012,'#f3f1ec',0,0.15);});MAT=LEU;tube([1.05,FLOOR+1.056,ZI-0.012],[1.05,FLOOR+1.056,ZI-0.0135],0.014,12,'#ffd9a6',0.5,0);MAT=IPU;
    MAT=TEX;box(-0.22,FLOOR,4.7,1.2,0.008,0.75,'#45403b',0,0);withBev(0.004,function(){box(2.66,FLOOR,3.35,0.46,0.012,0.74,'#5d5249',0,0);});box(2.66,FLOOR+0.0125,3.35,0.38,0.0008,0.66,'#4b423b',0,0);MAT=IPU;
    box(-0.9,FLOOR,1.567,4.2,0.07,0.014,BB,0,0);box(2.6,FLOOR,1.567,0.8,0.07,0.014,BB,0,0);box(2.933,FLOOR,2.14,0.014,0.07,1.28,BB,0,0);box(2.933,FLOOR,4.48,0.014,0.07,1.28,BB,0,0);box(-1.88,FLOOR,ZI-0.007,2.06,0.07,0.014,BB,0,0);box(1.9,FLOOR,ZI-0.007,2.08,0.07,0.014,BB,0,0);
    /* Wohnungstür: Umfassungszarge (lichte Breite 0,91 m), Verkleidung beidseitig, Namensschild (unbeschriftet) und Klingeltaster */
    [2.925,3.075].forEach(function(x){box(x,FLOOR,2.835,0.045,2.2,0.05,'#e6e1d8',0,0.2);box(x,FLOOR,3.865,0.045,2.2,0.05,'#e6e1d8',0,0.2);box(x,FLOOR+2.15,3.35,0.045,0.05,1.08,'#e6e1d8',0,0.2);});
    box(3.0,FLOOR,2.8775,0.12,2.15,0.035,'#e6e1d8',0,0);box(3.0,FLOOR,3.8225,0.12,2.15,0.035,'#e6e1d8',0,0);box(3.0,FLOOR+2.115,3.35,0.12,0.035,0.98,'#e6e1d8',0,0);
    WALLS.push([2.94,3.06,FLOOR,FLOOR+2.15,2.86,2.895]);WALLS.push([2.94,3.06,FLOOR,FLOOR+2.15,3.805,3.84]);
    MAT=EDS;box(2.935,FLOOR+1.42,4.06,0.008,0.04,0.11,'#b4b3af',0,0);MAT=TEX;box(2.931,FLOOR+1.437,4.06,0.002,0.005,0.07,'#4a4846',0,0);
    MAT=IPU;box(2.935,FLOOR+1.08,4.06,0.01,0.065,0.065,'#efece6',0,0);MAT=CHR;tube([2.93,FLOOR+1.112,4.06],[2.924,FLOOR+1.112,4.06],0.013,12,'#d0d1d2',0,0);MAT=IPU;
    grp('Wohnungsflur',INT);
    /* Flur x[3,5.4] z[2.4,4.2]: Plattenboden 60×60 (Eingangsbereich), Garderobenschrank, Leuchte */
    MAT=BPL;withSub(0.25,function(){box(4.2,FLOOR-0.02,3.3,2.4,0.02,1.8,'#bdb6aa',0,0);},'up');
    MAT=IPU;withSub(0.3,function(){wall('z',4.2,3.06,XW-0.06,FLOOR,CEIL,0.12,[],IW,0.2);wall('z',2.4,3.06,XW-0.06,FLOOR,CEIL,0.12,[],IW,0.2);
      wall('x',XW,-1.06,ZI,FLOOR,CEIL,0.12,[[0.6,1.45,FLOOR+2.05],[2.75,3.85,FLOOR+2.2]],IW,0.2);},'v');
    withSub(0.3,function(){box(4.2,CEIL,3.3,2.4,0.04,1.8,CW,0,0);},'down');MAT=LEU;cyl(4.3,CEIL-0.03,3.3,0.12,0.03,16,'#fff2df',1.1,0);MAT=IPU;light(4.3,CEIL-0.25,3.3,3.4,'#ffd9aa',0.95,2);
    MAT=IPU;withBev(0.006,function(){solid(3.65,5.1,FLOOR,FLOOR+2.3,2.46,2.98,'#e2ddd3',0,0.3);});MAT=IPU;for(var gd=1;gd<3;gd++)box(3.65+gd*0.483,FLOOR+0.02,2.985,0.004,2.26,0.004,'#9d907c',0,0);
    MAT=EDS;for(gd=0;gd<3;gd++)box(3.65+gd*0.483+0.42,FLOOR+1.0,3.0,0.012,0.22,0.02,'#a8a6a2',0,0);MAT=IPU;
    box(4.2,FLOOR,2.467,2.4,0.07,0.014,BB,0,0);box(4.25,FLOOR,4.133,2.3,0.07,0.014,BB,0,0);
    /* Schwellen: Naturstein an Wohnungs- und Badtür */
    MAT=STE;withBev(0.003,function(){box(3.0,FLOOR-0.004,3.35,0.13,0.012,0.91,'#c9c3b8',0,0);});MAT=STE;withBev(0.003,function(){box(XW,FLOOR-0.004,1.025,0.13,0.012,0.84,'#c9c3b8',0,0);});MAT=IPU;
    /* Durchgang Flur → Wohnraum: verputzte Laibung mit Kantenschutz */
    box(XW,FLOOR+2.2,3.3,0.12,0.004,1.1,IW,0,0);
    SUB=0;SUBMODE='all';
  }
  /* ================= Innen: Wohnen/Essen/Küche und Bad ================= */
  function buildFlat(){
    grp('Wohnung',INT);
    var FRONT={ax:'z',c:ZF,s:1},SIDE={ax:'x',c:XS,s:1};
    MAT=HOLZ;withSub(0.25,function(){box((XW+0.06+XI)/2,FLOOR-0.02,(-0.94+ZI)/2,XI-XW-0.06,0.02,ZI+0.94,'#a47e57',0,0);},'up');
    MAT=IPU;withSub(0.3,function(){wall('z',-1,3,XI+0.01,FLOOR,CEIL,0.12,[],IW,0.2);
      holed(FRONT,XW+0.06,XI,FLOOR,CEIL,ETW,[{u0:6.3,u1:8.3,y0:FLOOR,y1:FLOOR+2.4}],[0,0,-1],IW);
      holed(SIDE,-0.94,ZI,FLOOR,CEIL,ETW,[{u0:0.2-0.65,u1:0.2+0.65,y0:FLOOR+0.85,y1:FLOOR+2.4},{u0:3.6-0.65,u1:3.6+0.65,y0:FLOOR+0.85,y1:FLOOR+2.4}],[-1,0,0],IW);},'v');
    withSub(0.3,function(){box((XW+XI)/2,CEIL,(-0.94+ZI)/2,XI-XW,0.04,ZI+0.94,CW,0,0);},'down');
    /* Deckenspots, Pendelleuchte über dem Esstisch, Stehleuchte */
    MAT=LEU;[[6.2,3.3],[6.2,4.5],[7.6,4.5],[6.3,-0.1],[7.3,-0.1]].forEach(function(q){cyl(q[0],CEIL-0.012,q[1],0.045,0.012,12,'#fff2df',1.2,0);});MAT=IPU;
    light(6.3,CEIL-0.3,-0.1,2.8,'#ffdcae',0.55,4);light(7.3,CEIL-0.3,-0.1,2.8,'#ffdcae',0.55,4);light(6.2,CEIL-0.3,3.3,3.2,'#ffdcae',0.5,4);light(6.2,CEIL-0.3,4.5,3.2,'#ffdcae',0.5,4);light(7.6,CEIL-0.3,4.5,3.2,'#ffdcae',0.5,4);
    MAT=MET;tube([7.8,CEIL,1.0],[7.8,CEIL-0.68,1.0],0.004,4,'#222222',0,0);tube([7.8,CEIL-0.68,1.0],[7.8,CEIL-0.86,1.0],0.03,16,'#2f2e2d',0,0,0.2,false);
    MAT=LEU;cyl(7.8,CEIL-0.865,1.0,0.19,0.006,20,'#ffe6c2',1.05,0);MAT=IPU;light(7.8,CEIL-1.0,1.0,2.4,'#ffcf96',1.0,4);halo(7.8,CEIL-0.88,1.0,0.3,'#ffd8a8',0.08);WALLS.push([7.55,8.05,CEIL-0.9,CEIL,0.75,1.25]);
    /* Küche an der Rückwand: Unterschränke mit Fugen, Arbeitsplatte, Spüle, Kochfeld, Oberschränke, Hochschrank */
    MAT=IPU;var kc='#e7e3db';
    /* V17: Spülenschrank niedriger (Becken sitzt darin), Sockel 5 cm zurückgesetzt, grifflose Fronten mit Griffleiste */
    withBev(0.006,function(){solid(5.52,5.92,FLOOR+0.1,FLOOR+0.86,-0.94,-0.36,kc,0,0.3);solid(5.92,6.38,FLOOR+0.1,FLOOR+0.7,-0.94,-0.36,kc,0,0);solid(6.38,7.62,FLOOR+0.1,FLOOR+0.86,-0.94,-0.36,kc,0,0.3);box(6.15,FLOOR+0.7,-0.367,0.46,0.16,0.014,kc,0,0);box(6.57,FLOOR,-0.655,2.1,0.1,0.47,'#3a3836',0,0);
    for(var dx=5.52;dx<7.6;dx+=0.6){box(Math.min(dx+0.3,7.32),FLOOR+0.1,-0.355,0.003,0.76,0.004,'#9c968c',0,0);}
    box(6.57,FLOOR+0.6,-0.355,2.1,0.003,0.004,'#9c968c',0,0);
    });MAT=ALM;box(6.57,FLOOR+0.8,-0.353,2.1,0.034,0.01,'#6f6d69',0,0);MAT=IPU;
    /* Arbeitsplatte Naturstein 3,6 cm mit Ausschnitt für das unterbaute Becken */
    MAT=STE;withBev(0.005,function(){var wy=FLOOR+0.86,wh=0.036;box((5.51+5.95)/2,wy,-0.645,0.44,wh,0.62,'#4f4b46',0,0.3);box((6.35+7.63)/2,wy,-0.645,1.28,wh,0.62,'#4f4b46',0,0.3);box(6.15,wy,-0.8975,0.4,wh,0.115,'#4f4b46',0,0);box(6.15,wy,-0.4075,0.4,wh,0.145,'#4f4b46',0,0);});
    MAT=EDS;(function(){var y0=FLOOR+0.72,y1=FLOOR+0.896,x0=5.95,x1=6.35,z0=-0.84,z1=-0.48;quadN([x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],[0,1,0],'#a9a7a3');
      quadN([x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[0,0,1],'#b3b1ad');quadN([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[0,0,-1],'#b3b1ad');quadN([x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[1,0,0],'#b3b1ad');quadN([x1,y0,z0],[x1,y0,z1],[x1,y1,z1],[x1,y1,z0],[-1,0,0],'#b3b1ad');
      MAT=TEX;cyl(6.2,y0+0.0005,-0.62,0.042,0.002,20,'#2e2d2b',0,0);MAT=CHR;cyl(6.2,y0+0.001,-0.62,0.032,0.003,20,'#d0d2d4',0,0);})();MAT=CHR;tube([6.15,FLOOR+0.9,-0.9],[6.15,FLOOR+1.2,-0.9],0.013,20,'#e2e4e6',0,0);tube([6.15,FLOOR+1.2,-0.9],[6.15,FLOOR+1.18,-0.72],0.011,20,'#e2e4e6',0,0);
    /* Kochfeld: Glaskeramik (spiegelt den Raum über die Reflexionsaufnahme, nicht den Himmel), Kochzonen dezent */
    MAT=KER;box(7.05,FLOOR+0.896,-0.65,0.58,0.004,0.5,'#161617',0,0);MAT=TEX;[[6.9,-0.78,0.1],[7.2,-0.78,0.08],[6.9,-0.52,0.08],[7.2,-0.52,0.1]].forEach(function(z){cyl(z[0],FLOOR+0.9,z[1],z[2],0.0006,32,'#2b2a29',0,0);cyl(z[0],FLOOR+0.9004,z[1],z[2]-0.006,0.0006,32,'#18181a',0,0);});MAT=HOLZ;
    MAT=WPL;box(6.57,FLOOR+0.895,-0.935,2.1,0.6,0.01,'#dcd7cf',0,0);
    MAT=IPU;withBev(0.006,function(){solid(5.52,7.62,FLOOR+1.5,FLOOR+2.25,-0.94,-0.6,kc,0,0.3);});for(var dx2=5.52;dx2<7.6;dx2+=0.7)box(dx2+0.35,FLOOR+1.5,-0.598,0.003,0.75,0.004,'#9c968c',0,0);
    MAT=ALM;box(6.57,FLOOR+1.5,-0.597,2.1,0.018,0.006,'#8f8c87',0,0);MAT=IPU;
    /* Kochfeld-Bedienleiste (Sensortasten, dezent) */
    MAT=TEX;for(var tk=0;tk<6;tk++)box(6.88+tk*0.034,FLOOR+0.9002,-0.43,0.014,0.0006,0.014,'#6a6a6a',0,0);MAT=IPU;
    MAT=LEU;box(6.57,FLOOR+1.49,-0.68,2.0,0.008,0.03,'#ffe9cc',1.0,0);MAT=IPU;light(6.57,FLOOR+1.35,-0.55,2.0,'#ffd9aa',1.3,4);
    MAT=IPU;withBev(0.006,function(){solid(7.64,8.26,FLOOR,FLOOR+2.25,-0.94,-0.34,kc,0,0.3);});box(7.95,FLOOR+0.9,-0.338,0.003,0.004,0.004,'#9c968c',0,0);box(7.95,FLOOR+0.9,-0.337,0.6,0.003,0.004,'#9c968c',0,0);
    MAT=EDS;box(7.7,FLOOR+0.95,-0.33,0.012,0.5,0.02,'#a8a6a2',0,0);MAT=IPU;
    /* Essplatz am Fenster: Eichentisch, drei Stühle, Sitzbank */
    MAT=HOLZ;withBev(0.008,function(){box(7.8,FLOOR+0.72,1.0,0.9,0.035,1.4,'#a0815f',0,0.3);});[[7.4,0.36],[8.2,0.36],[7.4,1.64],[8.2,1.64]].forEach(function(l){box(l[0],FLOOR,l[1],0.05,0.72,0.05,'#8a6648',0,0);});WALLS.push([7.35,8.25,FLOOR,FLOOR+0.76,0.3,1.7]);
    chair(7.12,0.68,Math.PI/2,'#8d735b');chair(7.12,1.34,Math.PI/2,'#8d735b');chair(7.8,1.98,Math.PI,'#8d735b');
    /* Schale auf dem Tisch, kleiner Kräutertopf auf der Arbeitsplatte */
    MAT=KER;tube([7.85,FLOOR+0.755,0.85],[7.85,FLOOR+0.835,0.85],0.07,24,'#d9d3c8',0,0,0.14,false);tube([7.85,FLOOR+0.765,0.85],[7.85,FLOOR+0.835,0.85],0.062,24,'#e4dfd6',0,0,0.13,false);cyl(7.85,FLOOR+0.765,0.85,0.062,0.002,20,'#cfc8bc',0,0);
    MAT=STE;cyl(5.72,FLOOR+0.896,-0.8,0.06,0.11,14,'#b6a48e',0,0,0.065);MAT=BLA;for(var hk=0;hk<7;hk++){var ha=hk*0.9;leaf([5.72,FLOOR+1.0,-0.8],[Math.cos(ha),1.2,Math.sin(ha)],0.09,0.035,0.012,'#5d7c45');}MAT=IPU;
    /* V17.1: Sitzbank auf vier Beinen mit Zarge (unten offen statt Holzkiste), Sitzkissen */
    withBev(0.006,function(){MAT=HOLZ;box(8.44,FLOOR+0.38,1.0,0.34,0.035,1.3,'#9c7652',0,0.2);box(8.44,FLOOR+0.31,1.0,0.3,0.07,1.22,'#8a6648',0,0);MAT=TEX;box(8.44,FLOOR+0.415,1.0,0.32,0.05,1.26,'#6f7469',0,0);});MAT=HOLZ;[[8.3,0.4],[8.58,0.4],[8.3,1.6],[8.58,1.6]].forEach(function(l){box(l[0],FLOOR,l[1],0.04,0.38,0.04,'#8a6648',0,0);});MAT=IPU;
    /* Wohnbereich: Sofa, Couchtisch, Teppich, Sideboard mit Bild, Stehleuchte, grosse Zimmerpflanze */
    MAT=TEX;var sc='#8b867e';BEV=0.03;box(8.17,FLOOR+0.06,3.0,0.88,0.36,1.9,sc,0,0.2);box(8.48,FLOOR+0.42,3.0,0.26,0.4,1.9,sc,0,0);box(8.12,FLOOR+0.42,2.55,0.6,0.12,0.88,'#938e86',0,0);box(8.12,FLOOR+0.42,3.45,0.6,0.12,0.88,'#938e86',0,0);
    box(8.17,FLOOR+0.06,2.0,0.88,0.56,0.12,sc,0,0);box(8.17,FLOOR+0.06,4.0,0.88,0.56,0.12,sc,0,0);box(8.32,FLOOR+0.55,2.6,0.16,0.32,0.5,'#a19a8f',0,0);box(8.32,FLOOR+0.55,3.35,0.16,0.32,0.5,'#7d7f78',0,0);BEV=0;
    MAT=MET;[[7.8,2.0],[8.55,2.0],[7.8,4.0],[8.55,4.0]].forEach(function(l){box(l[0],FLOOR,l[1],0.03,0.06,0.03,'#2e2d2c',0,0);});WALLS.push([7.72,8.62,FLOOR,FLOOR+0.82,1.94,4.06]);
    MAT=TEX;box(7.35,FLOOR,3.0,2.1,0.006,2.3,'#a49b8e',0,0);
    MAT=HOLZ;withBev(0.008,function(){box(7.05,FLOOR+0.36,3.0,0.62,0.035,0.9,'#9c7652',0,0.2);});[[6.8,2.6],[7.3,2.6],[6.8,3.4],[7.3,3.4]].forEach(function(l){box(l[0],FLOOR,l[1],0.035,0.36,0.035,'#3a3836',0,0);});WALLS.push([6.74,7.36,FLOOR,FLOOR+0.4,2.55,3.45]);
    MAT=KER;cyl(7.15,FLOOR+0.395,3.15,0.07,0.16,14,'#d9d2c5',0,0,0.05);MAT=IPU;
    MAT=HOLZ;withBev(0.008,function(){solid(5.47,5.9,FLOOR+0.1,FLOOR+0.62,1.62,2.65,'#7b5f46',0,0.3);});MAT=MET;box(5.68,FLOOR,1.7,0.03,0.1,0.03,'#2e2d2c',0,0);box(5.68,FLOOR,2.57,0.03,0.1,0.03,'#2e2d2c',0,0);
    MAT=IPU;box(5.475,1.55,2.13,0.02,0.72,0.95,'#cdbfa8',0,0.3);box(5.487,1.6,2.13,0.006,0.62,0.85,'#7d8a8c',0,0);box(5.49,1.75,2.0,0.004,0.3,0.4,'#c49a6c',0,0);
    MAT=KER;cyl(5.7,FLOOR+0.62,2.4,0.06,0.24,14,'#e9e4dc',0,0,0.04);MAT=IPU;
    MAT=MET;tube([8.4,FLOOR,4.75],[8.4,FLOOR+1.45,4.75],0.012,8,'#3d3b39',0,0);cyl(8.4,FLOOR,4.75,0.14,0.02,16,'#3d3b39',0,0);
    MAT=TEX;cyl(8.4,FLOOR+1.42,4.75,0.2,0.28,20,'#efe2cc',0,0,0.16);MAT=LEU;cyl(8.4,FLOOR+1.418,4.75,0.19,0.004,18,'#ffe8c8',0.9,0);MAT=IPU;light(8.4,1.7,4.7,2.6,'#ffcb8f',0.75,4);halo(8.4,FLOOR+1.55,4.75,0.32,'#ffd8a8',0.09);WALLS.push([8.2,8.6,FLOOR,FLOOR+1.75,4.55,4.95]);
    houseplant(5.85,4.72,1.7);
    /* Vorhänge (leichter Stoff) an den Fenstern */
    curtain(SIDE,-0.75,-0.45,FLOOR+0.03,CEIL-0.05,ETW+0.1,'#e9e3d8');curtain(SIDE,0.85,1.15,FLOOR+0.03,CEIL-0.05,ETW+0.1,'#e9e3d8');
    curtain(SIDE,2.65,2.95,FLOOR+0.03,CEIL-0.05,ETW+0.1,'#e9e3d8');curtain(SIDE,4.25,4.55,FLOOR+0.03,CEIL-0.05,ETW+0.1,'#e9e3d8');
    curtain(FRONT,5.9,6.25,FLOOR+0.03,CEIL-0.05,ETW+0.1,'#e9e3d8');
    MAT=ALM;box(XI-0.1,CEIL-0.05,2.0,0.02,0.02,5.9,'#c9c6c0',0,0);MAT=IPU;
    /* Sockelleisten, Zargen der Durchgänge */
    box(XI-0.007,FLOOR,2.09,0.014,0.07,6.06,BB,0,0);box(XW+0.067,FLOOR,-0.18,0.014,0.07,1.52,BB,0,0);box(XW+0.067,FLOOR,2.1,0.014,0.07,1.3,BB,0,0);box(XW+0.067,FLOOR,4.48,0.014,0.07,1.28,BB,0,0);box(6.6,FLOOR,-0.933,2.0,0.07,0.014,BB,0,0);
    box(XW+0.06,FLOOR,0.575,0.025,2.1,0.05,'#e6e1d8',0,0.2);box(XW+0.06,FLOOR,1.475,0.025,2.1,0.05,'#e6e1d8',0,0.2);box(XW+0.06,FLOOR+2.05,1.025,0.025,0.05,0.95,'#e6e1d8',0,0.2);
    /* Badtür 0,82 m (lichte Breite 0,80 m): Röhrenspan weiss, ganz geöffnet nach innen, Bänder, Drücker beidseitig */
    MAT=IPU;box(XW,FLOOR,0.6125,0.13,2.05,0.025,'#e6e1d8',0,0);box(XW,FLOOR,1.4375,0.13,2.05,0.025,'#e6e1d8',0,0);box(XW,FLOOR+2.025,1.025,0.13,0.025,0.85,'#e6e1d8',0,0);
    box(XW-0.075,FLOOR,0.575,0.022,2.1,0.05,'#e6e1d8',0,0.2);box(XW-0.075,FLOOR,1.475,0.022,2.1,0.05,'#e6e1d8',0,0.2);box(XW-0.075,FLOOR+2.05,1.025,0.022,0.05,0.95,'#e6e1d8',0,0.2);
    WALLS.push([XW-0.07,XW+0.07,FLOOR,FLOOR+2.05,0.6,0.625]);WALLS.push([XW-0.07,XW+0.07,FLOOR,FLOOR+2.05,1.425,1.45]);
    withBev(0.004,function(){box(XW-0.5,FLOOR,0.648,0.82,2.02,0.04,'#ebe7df',0,0.4);});WALLS.push([XW-0.91,XW-0.09,FLOOR,FLOOR+2.02,0.628,0.668]);
    MAT=EDS;[0.6,0.696].forEach(function(z){var d=z<0.65?-1:1;tube([XW-0.84,FLOOR+1.02,0.648+d*0.02],[XW-0.84,FLOOR+1.02,0.648+d*0.065],0.009,8,'#a9a7a4',0,0);tube([XW-0.84,FLOOR+1.02,0.648+d*0.065],[XW-0.72,FLOOR+1.02,0.648+d*0.065],0.009,8,'#a9a7a4',0,0);});
    [0.25,1.0,1.8].forEach(function(y){tube([XW-0.088,FLOOR+y,0.625],[XW-0.088,FLOOR+y+0.1,0.625],0.009,10,'#a9a7a4',0,0);});MAT=IPU;
    grp('Badezimmer',INT);
    /* ---- Bad x[3,5.4] z[-1,2.4] (V17): Bodenplatten 60×60 anthrazit, Wandplatten 60×30 weiss raumhoch – Fugen je Pixel ab der
       Raumecke x 3,072 / z −0,928 / Boden (Shader), Dusche bodeneben mit Glaswand ---- */
    MAT=BPL;withSub(0.25,function(){box(4.2,FLOOR-0.02,0.7,2.28,0.02,3.28,'#6f6d6a',0,0);},'up');
    MAT=WPL;withSub(0.1,function(){box(3.066,FLOOR,0.7,0.012,CEIL-FLOOR,3.28,'#efeeea',0,0);},'v');/* V17.1: Wand mit Spiegelschrank fein, übrige Badwände 20 cm */
    withSub(0.2,function(){box(4.2,FLOOR,-0.934,2.28,CEIL-FLOOR,0.012,'#efeeea',0,0);box(4.2,FLOOR,2.334,2.28,CEIL-FLOOR,0.012,'#efeeea',0,0);
      box(XW-0.066,FLOOR,-0.17,0.012,CEIL-FLOOR,1.54,'#efeeea',0,0);box(XW-0.066,FLOOR,1.9,0.012,CEIL-FLOOR,0.88,'#efeeea',0,0);box(XW-0.066,FLOOR+2.05,1.025,0.012,CEIL-FLOOR-2.05,0.85,'#efeeea',0,0);},'v');
    MAT=IPU;withSub(0.3,function(){box(4.2,CEIL,0.7,2.28,0.04,3.28,CW,0,0);},'down');
    /* neutralwarmes Licht (≈ 3500 K) statt gelbbeiger Grundstimmung: zwei Deckenleuchten, Spiegelleuchte */
    MAT=LEU;cyl(4.3,CEIL-0.012,1.4,0.045,0.012,12,'#fff8ee',1.2,0);cyl(4.75,CEIL-0.012,-0.4,0.045,0.012,12,'#fff8ee',1.2,0);MAT=IPU;
    light(4.3,CEIL-0.3,1.4,3.4,'#fff0e0',0.95,3);light(4.75,CEIL-0.3,-0.4,3.3,'#fff0e0',0.88,3);
    /* Silikonfugen Boden/Wand und Duschwanne/Wand (hellgrau, 7 mm) */
    MAT=KER;[[[3.074,FLOOR+0.002,0.25],[3.074,FLOOR+0.002,2.326]],[[3.07,FLOOR+0.002,2.326],[4.43,FLOOR+0.002,2.326]],[[4.15,FLOOR+0.032,-0.926],[5.332,FLOOR+0.032,-0.926]],[[5.332,FLOOR+0.032,-0.926],[5.332,FLOOR+0.032,0.15]]].forEach(function(s){tube(s[0],s[1],0.0035,6,'#d3d1cd',0,0,undefined,false);});
    MAT=MET;for(var tr=0;tr<7;tr++)tube([XW-0.12,FLOOR+0.6+tr*0.2,1.62],[XW-0.12,FLOOR+0.6+tr*0.2,2.2],0.011,8,'#ebe8e3',0,0);tube([XW-0.12,FLOOR+0.5,1.6],[XW-0.12,FLOOR+1.95,1.6],0.016,8,'#ebe8e3',0,0);tube([XW-0.12,FLOOR+0.5,2.22],[XW-0.12,FLOOR+1.95,2.22],0.016,8,'#ebe8e3',0,0);
    WALLS.push([XW-0.16,XW-0.06,FLOOR+0.5,FLOOR+1.95,1.58,2.24]);
    /* Dusche: flache Wanne mit Ablauf, Thermostat, Regenbrause, Glaswand mit Stabilisator */
    MAT=KER;withBev(0.006,function(){box(4.74,FLOOR,-0.39,1.2,0.03,1.1,'#f6f5f2',0,0.3);});MAT=EDS;box(4.74,FLOOR+0.031,-0.39,0.12,0.003,0.12,'#a8a7a4',0,0);MAT=TEX;for(var dr=0;dr<5;dr++)box(4.74,FLOOR+0.0335,-0.43+dr*0.02,0.1,0.0005,0.006,'#2c2b2a',0,0);MAT=CHR;
    tube([4.74,FLOOR+1.05,-0.92],[4.74,FLOOR+2.12,-0.92],0.012,16,'#e4e6e8',0,0);tube([4.74,FLOOR+2.12,-0.925],[4.74,FLOOR+2.14,-0.62],0.012,16,'#e4e6e8',0,0);cyl(4.74,FLOOR+2.115,-0.6,0.12,0.012,40,'#e4e6e8',0,0,0.118);
    withBev(0.008,function(){box(4.74,FLOOR+0.98,-0.906,0.3,0.07,0.05,'#e4e6e8',0,0);});cyl(4.62,FLOOR+1.015,-0.88,0.022,0.03,24,'#e4e6e8',0,0);tube([4.62,FLOOR+1.015,-0.88],[4.62,FLOOR+1.015,-0.85],0.022,24,'#e4e6e8',0,0);tube([4.86,FLOOR+1.015,-0.88],[4.86,FLOOR+1.015,-0.85],0.022,24,'#e4e6e8',0,0);MAT=ALM;
    box(4.89,FLOOR+0.03,0.16,0.9,0.018,0.03,'#b9babc',0,0);tube([4.44,FLOOR+2.0,0.16],[4.44,FLOOR+2.0,-0.94],0.008,8,'#b9babc',0,0);
    tglass(TG,[4.44,FLOOR+0.05,0.16],[0.9,0,0],[0,1.95,0]);line([4.44,FLOOR+0.05,0.16],[5.34,FLOOR+0.05,0.16],0.6);line([4.44,FLOOR+0.05,0.16],[4.44,FLOOR+2.0,0.16],0.6);
    WALLS.push([4.42,5.34,FLOOR,FLOOR+2.0,0.14,0.18]);
    /* Duschablage Edelstahl mit zwei Flaschen */
    MAT=EDS;box(5.13,FLOOR+1.22,-0.86,0.34,0.008,0.12,'#b4b3af',0,0);tube([4.97,FLOOR+1.245,-0.8],[5.29,FLOOR+1.245,-0.8],0.004,8,'#b4b3af',0,0);
    MAT=KER;cyl(5.05,FLOOR+1.228,-0.87,0.028,0.17,16,'#d9dfe2',0,0,0.024);cyl(5.14,FLOOR+1.228,-0.87,0.025,0.14,16,'#e8e2d6',0,0,0.021);
    /* Vorwandinstallation 1,20 m (genau 4 Plattenreihen) mit Steinablage – Unterputzspülkasten, Betätigungsplatte */
    var VX=3.222,ac='#d6d9dc';MAT=WPL;withSub(0.1,function(){box((3.072+VX)/2,FLOOR,-0.339,VX-3.072,1.2,1.178,'#efeeea',0,0);},'v');
    MAT=STE;withBev(0.004,function(){box(3.159,FLOOR+1.2,-0.334,0.174,0.02,1.2,'#dcd8d0',0,0.2);});WALLS.push([3.07,3.25,FLOOR,FLOOR+1.22,-0.93,0.27]);
    MAT=KER;tube([VX+0.002,FLOOR+0.002,-0.926],[VX+0.002,FLOOR+0.002,0.25],0.0035,6,'#d3d1cd',0,0,undefined,false);
    /* Betätigungsplatte 246 × 164 mm (Chrom matt), zwei Tasten (gross/klein, 2,5 mm erhaben), Fuge 10 mm */
    (function(){var pz=-0.38,py=FLOOR+0.95;MAT=EDS;withBev(0.002,function(){box(VX+0.003,py,pz,0.006,0.164,0.246,'#c6c8ca',0,0);});
      MAT=KER;withBev(0.0015,function(){box(VX+0.0065,py+0.017,pz-0.039,0.004,0.13,0.148,'#f6f6f4',0,0);box(VX+0.0065,py+0.017,pz+0.079,0.004,0.13,0.068,'#f6f6f4',0,0);});})();
    /* kleine Ablage: Topf mit Sukkulente, gefaltetes Handtuch */
    MAT=KER;cyl(3.15,FLOOR+1.22,-0.78,0.05,0.08,20,'#d8d2c8',0,0,0.042);MAT=BLA;for(var sk=0;sk<6;sk++){var sa2=sk*1.05;leaf([3.15,FLOOR+1.295,-0.78],[Math.cos(sa2),0.9,Math.sin(sa2)],0.07,0.03,0.01,'#6f8a5a');}
    MAT=TEX;withBev(0.006,function(){box(3.15,FLOOR+1.22,-0.2,0.12,0.05,0.2,'#e3ddd3',0,0);});
    /* WC wandhängend, spülrandlos (V17): Keramik leicht konisch mit zur Wand abfallender Unterseite, tiefe asymmetrische Schüssel
       mit ruhiger Wasserfläche; Brille und Deckel getrennt mit gerundetem Querschnitt, zwei Scharniere, Spalte statt Durchdringungen */
    (function(){var cz=-0.38,cc='#f4f3f0',wh='#fafaf8',NW=64,cen=[VX+0.25,FLOOR+0.28,cz];
      function wr(L,y,W){var o=[],ax=L/2,cx=VX+0.003+ax;for(var j=0;j<NW;j++){var t=j/NW*Math.PI*2,c=Math.cos(t),si=Math.sin(t),e=c<0?0.22:0.8;
        o.push([cx+ax*Math.sign(c)*Math.pow(Math.abs(c),e),FLOOR+y,cz+W*Math.sign(si)*Math.pow(Math.abs(si),e)]);}return o;}
      function ov(cx,y,ax,az,e){var o=[];for(var j=0;j<NW;j++){var t=j/NW*Math.PI*2,c=Math.cos(t),si=Math.sin(t);o.push([cx+ax*Math.sign(c)*Math.pow(Math.abs(c),e),FLOOR+y,cz+az*Math.sign(si)*Math.pow(Math.abs(si),e)]);}return o;}
      function sel(cu,cv,a,b,e){var o=[];for(var j=0;j<NW;j++){var t=j/NW*Math.PI*2,c=Math.cos(t),si=Math.sin(t);o.push([cu+a*Math.sign(c)*Math.pow(Math.abs(c),e),cv+b*Math.sign(si)*Math.pow(Math.abs(si),e)]);}return o;}
      MAT=KER;
      var B=[[0.400,0.530,0.174],[0.397,0.537,0.179],[0.388,0.539,0.181],[0.35,0.537,0.180],[0.30,0.526,0.174],[0.26,0.506,0.165],[0.228,0.474,0.153],[0.205,0.43,0.14],[0.186,0.365,0.127],[0.166,0.285,0.115],[0.146,0.2,0.104],[0.128,0.12,0.09],[0.116,0.05,0.07],[0.112,0.002,0.002]];
      surf(B.map(function(b){return wr(b[1],b[0],b[2]);}),cc,0,function(q,n){return dot(n,sub(q,cen))<0;});
      var bo=ov(VX+0.30,0.400,0.150,0.115,0.85);
      surf([wr(0.530,0.400,0.174),bo],cc,0,function(q,n){return n[1]<0;});
      var BW=[[0.300,0.400,0.150,0.115],[0.298,0.394,0.147,0.113],[0.292,0.370,0.138,0.106],[0.278,0.335,0.120,0.093],[0.262,0.300,0.100,0.080],[0.249,0.268,0.082,0.066],[0.241,0.245,0.068,0.056]];
      surf(BW.map(function(b){return ov(VX+b[0],b[1],b[2],b[3],0.85);}),cc,0,function(q,n){return dot(n,sub([VX+0.27,FLOOR+0.6,cz],q))<0;});
      /* V17.1: Wasserfläche mit weichem Übergang zum Geruchsverschluss (drei Ringe statt einer harten grauen Scheibe) */
      surf([ov(VX+0.241,0.245,0.068,0.056,0.85),ov(VX+0.228,0.245,0.048,0.042,0.88),ov(VX+0.212,0.245,0.034,0.034,0.9)],'#c9d0d1',0,function(q,n){return n[1]<0;});
      surf([ov(VX+0.212,0.245,0.034,0.034,0.9),ov(VX+0.206,0.2452,0.026,0.026,0.9)],'#a9b2b3',0,function(q,n){return n[1]<0;});
      surf([ov(VX+0.206,0.2452,0.026,0.026,0.9),ov(VX+0.205,0.2453,0.0001,0.0001,0.9)],'#7f898a',0,function(q,n){return n[1]<0;});
      /* Brille: Duroplast 21 mm, gerundet, 4,5 mm über dem Rand auf vier Puffern */
      shellR(sel(VX+0.302,cz,0.146,0.113,0.85),sel(VX+0.315,cz,0.205,0.172,0.85),
        [[0.03,0.4045,-0.3,-1],[0.0,0.409,-1,-0.3],[0.0,0.417,-1,0.35],[0.07,0.4233,-0.4,1],[0.3,0.4256,-0.06,1],[0.7,0.4256,0.06,1],[0.93,0.4233,0.4,1],[1.0,0.417,1,0.35],[1.0,0.409,1,-0.3],[0.97,0.4045,0.3,-1],[0.03,0.4045,-0.3,-1]],
        function(u,v,w){return [u,FLOOR+w,v];},function(a,b,c){return nrm([a,c,b]);},wh);
      [[0.45,0.1],[0.45,-0.1],[0.2,0.13],[0.2,-0.13]].forEach(function(b){cyl(VX+b[0],FLOOR+0.4,cz+b[1],0.008,0.0045,10,'#e4e4e2',0,0);});
      /* zwei Scharniere: Fuss auf der Keramik, Achse, Gelenkstücke von Brille und Deckel */
      MAT=CHR;[-0.085,0.085].forEach(function(dz){cyl(VX+0.085,FLOOR+0.4,cz+dz,0.017,0.011,24,ac,0,0,0.015);tube([VX+0.085,FLOOR+0.411,cz+dz],[VX+0.085,FLOOR+0.43,cz+dz],0.0075,12,ac,0,0);
        tube([VX+0.085,FLOOR+0.43,cz+dz-0.023],[VX+0.085,FLOOR+0.43,cz+dz+0.023],0.0105,20,ac,0,0);
        var zi=cz+dz+(dz<0?0.036:-0.036),zo=cz+dz+(dz<0?-0.036:0.036);MAT=KER;tube([VX+0.085,FLOOR+0.43,zi-0.012],[VX+0.085,FLOOR+0.43,zi+0.012],0.0135,18,wh,0,0);box(VX+0.103,FLOOR+0.4125,zi,0.034,0.012,0.022,wh,0,0);
        tube([VX+0.085,FLOOR+0.43,zo-0.012],[VX+0.085,FLOOR+0.43,zo+0.012],0.0135,18,wh,0,0);MAT=CHR;});
      /* Deckel geöffnet (94°), gewölbt, mit umlaufender Schürze: von vorne sieht man die hohle Unterseite – keine zweite Brille */
      var th=94*Math.PI/180,H=[VX+0.085,FLOOR+0.43,cz],dv=[Math.cos(th),Math.sin(th),0],nv=[-Math.sin(th),Math.cos(th),0];
      MAT=KER;shellR(sel(0.228,0,0.0002,0.0002,0.85),sel(0.228,0,0.222,0.182,0.85),
        [[0.0,0.040,0,1],[0.2,0.0396,0.04,1],[0.45,0.037,0.12,1],[0.62,0.034,0.2,1],[0.78,0.030,0.3,1],[0.93,0.020,0.7,0.8],[0.985,0.010,0.97,0.3],[1.0,0.0,1,0],[1.0,-0.016,1,-0.1],[0.993,-0.019,0.3,-1],[0.975,-0.016,-0.7,-0.6],[0.955,0.004,-0.6,-0.8],[0.8,0.017,-0.2,-1],[0.6,0.0205,-0.1,-1],[0.4,0.023,-0.05,-1],[0.2,0.0237,-0.02,-1],[0.0,0.024,0,-1]],
        function(u,v,w){return [H[0]+dv[0]*u+nv[0]*w,H[1]+dv[1]*u+nv[1]*w,H[2]+v];},function(a,b,c){return nrm([dv[0]*a+nv[0]*c,dv[1]*a+nv[1]*c,b]);},wh);
      WALLS.push([VX,VX+0.56,FLOOR+0.1,FLOOR+0.9,cz-0.19,cz+0.19]);})();
    MAT=TEX;box(3.85,FLOOR,0.85,0.6,0.008,0.8,'#d9d6d0',0,0);
    grp('Sanitaer_Waschtisch_Armatur_Siphon_Eckventile',INT);
    /* Möbelwaschtisch (Keramik 62 × 47 cm, Oberkante 0,86 m, Schürze 15 cm) auf wandhängendem Unterschrank (Sand matt);
       Siphon und Eckventile liegen verdeckt im Unterschrank (Schemamarkierung nur an der Front) */
    var bY=FLOOR+0.86,hx=0.235,hz=0.31,bcx=3.08+hx,bcz=0.8,NB=72,icx=bcx+0.03,ihx=hx-0.075,ihz=hz-0.05,bD=0.15;
    MAT=KER;var bc='#f4f3f0';
    /* Aussenkontur mit gerader Rückseite (liegt satt an der Wand), vorne gerundet */
    function bring(y,s){var o=[];for(var j=0;j<NB;j++){var t=j/NB*Math.PI*2,c=Math.cos(t),si=Math.sin(t),e=c<0?0.12:0.5,ex=c<0?0.12:0.5;o.push([bcx+hx*(c<0?1:s)*Math.sign(c)*Math.pow(Math.abs(c),ex)-(c<0?0:0),y,bcz+hz*s*Math.sign(si)*Math.pow(Math.abs(si),e)]);}return o;}
    surf([bring(bY,0.975),bring(bY-0.003,0.995),bring(bY-0.012,1),bring(bY-bD+0.006,1),bring(bY-bD,0.985),bring(bY-bD,0.0001)],bc,0,function(q,n){return dot(n,sub(q,[bcx,bY-0.07,bcz]))<0;});
    surf([bring(bY,0.975),sring(icx,bY,bcz,ihx,ihz,1,NB)],bc,0,function(q,n){return n[1]<0;});
    surf([sring(icx,bY,bcz,ihx,ihz,1,NB),sring(icx,bY-0.005,bcz,ihx,ihz,0.985,NB),sring(icx,bY-0.035,bcz,ihx,ihz,0.95,NB),sring(icx,bY-0.08,bcz,ihx,ihz,0.84,NB),sring(icx,bY-0.112,bcz,ihx,ihz,0.64,NB),sring(icx,bY-0.128,bcz,ihx,ihz,0.42,NB),sring(icx,bY-0.135,bcz,ihx,ihz,0.18,NB),sring(icx,bY-0.136,bcz,ihx,ihz,0.0,NB)],bc,0,function(q,n){return dot(n,sub([icx,bY+0.2,bcz],q))<0;});
    var rimO=bring(bY,0.975),rimI=sring(icx,bY,bcz,ihx,ihz,1,NB);for(var rj=0;rj<NB;rj++){line(rimO[rj],rimO[(rj+1)%NB],0.35);line(rimI[rj],rimI[(rj+1)%NB],0.25);}
    /* Ablaufventil (Chromkappe mit Ring), Überlauf mit Chromblende in der Beckenrückwand, Silikonfuge zur Wand */
    MAT=TEX;cyl(icx,bY-0.1348,bcz,0.0245,0.0012,28,'#3a3836',0,0);MAT=CHR;cyl(icx,bY-0.1345,bcz,0.0225,0.0018,32,ac,0,0);cyl(icx,bY-0.1335,bcz,0.019,0.0035,32,ac,0,-1,0.0165);
    withBev(0.0015,function(){box(3.1965,bY-0.052,bcz,0.004,0.018,0.046,ac,0,0);});MAT=TEX;box(3.199,bY-0.047,bcz,0.002,0.008,0.03,'#3d3b39',0,0);
    MAT=KER;tube([3.0745,bY+0.0008,bcz-hz+0.012],[3.0745,bY+0.0008,bcz+hz-0.012],0.0032,8,'#dcdad6',0,0,undefined,false);
    WALLS.push([3.08,3.56,bY-bD,bY,bcz-hz,bcz+hz]);
    /* Unterschrank: Korpus und Front Sand matt lackiert, Front mit 3 mm Schattenfuge, Griffmulde unter der Keramik, 38 cm Bodenfreiheit */
    var vy0=FLOOR+0.38,vy1=bY-bD,vx1=3.512;
    MAT=MET;withBev(0.003,function(){box((3.074+vx1-0.02)/2,vy0,bcz,vx1-0.02-3.074,vy1-vy0-0.002,0.58,'#c9bcaa',0,0);box(vx1-0.009,vy0,bcz,0.018,vy1-vy0-0.02,0.574,'#d4c8b6',0,-1);});
    /* V17.1: Griffmulde als eloxiertes Aluprofil über die ganze Breite (statt dunkler Lücke zwischen den Korpusseiten), darüber 3 mm Schattenfuge */
    MAT=ALM;withBev(0.002,function(){box(3.494,vy1-0.021,bcz,0.016,0.019,0.58,'#9d9a94',0,0);});MAT=TEX;box(3.5,vy1-0.0025,bcz,0.012,0.0025,0.575,'#3a3632',0,0);
    WALLS.push([3.07,3.52,vy0,vy1,bcz-0.29,bcz+0.29]);
    /* Spiegelschrank: Korpus weiss lackiert, Spiegelfront (planare Spiegelung), Lichtleiste unten */
    MAT=IPU;withBev(0.004,function(){box(3.16,FLOOR+1.14,0.8,0.16,0.72,0.76,'#eceae6',0,0.3);});MAT=SPI;box(3.2445,FLOOR+1.15,0.8,0.011,0.7,0.74,'#e8ecee',0,0);
    MAT=ALM;box(3.24,FLOOR+1.142,0.8,0.012,0.006,0.76,'#b9b8b5',0,0);
    MAT=LEU;box(3.2,FLOOR+1.134,0.8,0.08,0.006,0.7,'#fff6ea',1.0,0);MAT=IPU;light(3.52,FLOOR+1.06,0.8,1.35,'#fff2e4',0.6,3);WALLS.push([3.08,3.25,FLOOR+1.14,FLOOR+1.86,0.42,1.18]);
    /* Einhebelmischer: runde Rosette, Körper, separater Hebel oben nach vorn, Auslauf als Bézierbogen mit 17 cm Ausladung, Strahlregler */
    var fx=3.08+0.05;
    MAT=CHR;
    cyl(fx,bY,bcz,0.027,0.005,32,ac,0,0,0.025);cyl(fx,bY+0.005,bcz,0.0195,0.168,32,ac,0,-1,0.019);cyl(fx,bY+0.173,bcz,0.019,0.006,32,ac,0,0,0.0165);
    cyl(fx,bY+0.179,bcz,0.012,0.012,24,ac,0,-1,0.011);tube([fx+0.004,bY+0.187,bcz],[fx+0.072,bY+0.2,bcz],0.0062,16,ac,0,-1,0.0046);cyl(fx+0.072,bY+0.196,bcz,0.0048,0.008,12,ac,0,0);
    var arc=[];for(var ai=0;ai<=24;ai++){var tb=ai/24,ib=1-tb,P0=[fx-0.004,bY+0.142],P1=[fx+0.11,bY+0.155],P2=[fx+0.17,bY+0.152],P3=[fx+0.17,bY+0.108];
      arc.push([ib*ib*ib*P0[0]+3*ib*ib*tb*P1[0]+3*ib*tb*tb*P2[0]+tb*tb*tb*P3[0],ib*ib*ib*P0[1]+3*ib*ib*tb*P1[1]+3*ib*tb*tb*P2[1]+tb*tb*tb*P3[1],bcz]);}
    bogen(arc,0.0098,0.0094,28,ac,0);
    cyl(fx+0.17,bY+0.1,bcz,0.0102,0.014,24,ac,0,0);MAT=TEX;cyl(fx+0.17,bY+0.0995,bcz,0.0078,0.001,16,'#4a4846',0,0);
    /* zurückhaltende Accessoires: Seifenspender, Handtuch am Heizkörper, Papierhalter an der Vorwand, WC-Bürste */
    MAT=KER;cyl(3.13,bY,bcz+0.235,0.026,0.11,24,'#d6d2cc',0,0,0.024);MAT=CHR;cyl(3.13,bY+0.11,bcz+0.235,0.012,0.022,16,ac,0,0);tube([3.13,bY+0.128,bcz+0.235],[3.17,bY+0.128,bcz+0.235],0.0045,10,ac,0,0);
    MAT=TEX;box(XW-0.15,FLOOR+0.92,1.9,0.022,0.62,0.42,'#ddd6cb',0,0);box(XW-0.095,FLOOR+1.5,1.9,0.09,0.02,0.42,'#ddd6cb',0,0);
    MAT=CHR;tube([VX,FLOOR+0.74,0.04],[VX+0.008,FLOOR+0.74,0.04],0.022,20,ac,0,0);tube([VX+0.004,FLOOR+0.74,0.04],[VX+0.072,FLOOR+0.74,0.04],0.0055,12,ac,0,0);tube([VX+0.072,FLOOR+0.74,0.04],[VX+0.072,FLOOR+0.74,0.17],0.0055,12,ac,0,0);
    MAT=TEX;tube([VX+0.072,FLOOR+0.74,0.05],[VX+0.072,FLOOR+0.74,0.155],0.054,28,'#f4f2ee',0,0);tube([VX+0.072,FLOOR+0.74,0.049],[VX+0.072,FLOOR+0.74,0.156],0.021,14,'#b9a88f',0,0);
    MAT=KER;cyl(3.31,FLOOR,0.16,0.045,0.3,28,'#f2f1ee',0,0,0.043);MAT=CHR;cyl(3.31,FLOOR+0.3,0.16,0.0445,0.012,28,ac,0,0);tube([3.31,FLOOR+0.31,0.16],[3.31,FLOOR+0.43,0.16],0.0055,12,ac,0,0);cyl(3.31,FLOOR+0.43,0.16,0.012,0.01,16,ac,0,0,0.009);
    WALLS.push([3.26,3.36,FLOOR,FLOOR+0.44,0.11,0.21]);
    /* Elektro: Schweizer Steckdosen Typ 13 (drei Kontakte) und Lichtschalter, weiss, auf üblichen Höhen */
    function epl(x,y,z,ax,sg,kind,n){n=n||1;for(var i=0;i<n;i++){var o=i*0.075,px=ax==='x'?x:x+o,pz=ax==='x'?z+o:z,d=function(k){return ax==='x'?[px+sg*k,y,pz]:[px,y,pz+sg*k];};
      var P=d(0.006);MAT=IPU;withBev(0.003,function(){if(ax==='x')box(P[0],y-0.036,pz,0.012,0.072,0.072,'#f3f1ec',0,0.15);else box(px,y-0.036,P[2],0.072,0.072,0.012,'#f3f1ec',0,0.15);});
      if(kind==='S'){var R=d(0.0135);if(ax==='x')box(R[0],y-0.024,pz,0.004,0.048,0.048,'#f8f6f2',0,0.1);else box(px,y-0.024,R[2],0.048,0.048,0.004,'#f8f6f2',0,0.1);}
      else{var Q=d(0.0125);MAT=IPU;if(ax==='x')box(Q[0],y-0.022,pz,0.002,0.044,0.044,'#dedbd5',0,0);else box(px,y-0.022,Q[2],0.044,0.044,0.002,'#dedbd5',0,0);
        MAT=TEX;[[-0.0095,0.0025],[0.0095,0.0025],[0,-0.004]].forEach(function(h){var hp=d(0.0136);if(ax==='x')box(hp[0],y+h[1]-0.003,pz+h[0],0.001,0.006,0.005,'#3a3936',0,0);else box(px+h[0],y+h[1]-0.003,hp[2],0.005,0.006,0.001,'#3a3936',0,0);});}}MAT=IPU;}
    epl(6.0,FLOOR+1.1,-0.93,'z',1,'T',2);epl(7.5,FLOOR+1.1,-0.93,'z',1,'T',1);epl(XI,FLOOR+0.3,4.35,'x',-1,'T',2);
    epl(XW+0.06,FLOOR+1.05,2.58,'x',1,'S',1);epl(XW+0.06,FLOOR+1.05,1.56,'x',1,'S',1);epl(3.06,FLOOR+1.05,2.66,'x',1,'S',1);
    /* Backofen unter dem Kochfeld (Glasfront, Griff, Bedienleiste) */
    MAT=KER;box(7.05,FLOOR+0.16,-0.349,0.58,0.6,0.012,'#1b1b1c',0,0);box(7.05,FLOOR+0.24,-0.342,0.44,0.34,0.002,'#0f0f10',0,0);MAT=LEU;box(7.05,FLOOR+0.69,-0.342,0.07,0.022,0.002,'#ffcf96',0.55,0);
    MAT=EDS;tube([6.82,FLOOR+0.64,-0.322],[7.28,FLOOR+0.64,-0.322],0.009,10,'#b4b3af',0,0);[6.84,7.26].forEach(function(x){tube([x,FLOOR+0.64,-0.343],[x,FLOOR+0.64,-0.322],0.006,8,'#b4b3af',0,0);});
    MAT=PUTZ;SUB=0;SUBMODE='all';T=G;
  }
  /* ---- bewegte Teile: eigene Sätze, je mit Modellmatrix (Scharnier im Ursprung) ---- */
  function buildMoving(){
    /* Haustür 1,08 m: Alu-Rahmentür anthrazit mit grosser Glasfüllung (echtes Glas) und Sockelfeld, Stossgriff aussen,
       Drücker innen, drei Bänder an der Bandseite, Obentürschliesser auf der Innenseite */
    T=D;MAT=MET;var dc=FRM,L=1.08,Hd=2.25;
    withBev(0.004,function(){box(0.055,0,0,0.11,Hd,0.065,dc,0,0.4);box(L-0.06,0,0,0.12,Hd,0.065,dc,0,0.4);box(L/2-0.005,0,0,L-0.23,0.3,0.065,dc,0,0);box(L/2-0.005,Hd-0.12,0,L-0.23,0.12,0.065,dc,0,0);});
    tglass(TGD,[0.11,0.3,0],[L-0.23,0,0],[0,Hd-0.42,0]);
    MAT=TEX;[[0.035],[-0.035]].forEach(function(zz){var z=zz[0];box(L/2-0.005,0.3,z,L-0.23,0.012,0.008,'#1a1a1a',0,0);box(L/2-0.005,Hd-0.132,z,L-0.23,0.012,0.008,'#1a1a1a',0,0);box(0.116,0.3,z,0.012,Hd-0.42,0.008,'#1a1a1a',0,0);box(L-0.126,0.3,z,0.012,Hd-0.42,0.008,'#1a1a1a',0,0);});
    MAT=EDS;tube([1.02,0.8,0.08],[1.02,1.8,0.08],0.015,16,'#b4b2ae',0,0);tube([1.02,0.86,0.032],[1.02,0.86,0.08],0.009,8,'#a9a7a4',0,0);tube([1.02,1.74,0.032],[1.02,1.74,0.08],0.009,8,'#a9a7a4',0,0);
    tube([1.02,1.05,-0.032],[1.02,1.05,-0.075],0.009,8,'#a9a7a4',0,0);tube([1.02,1.05,-0.075],[0.9,1.05,-0.075],0.009,8,'#a9a7a4',0,0);tube([1.02,1.05,-0.032],[1.02,1.05,-0.04],0.022,14,'#a9a7a4',0,0);
    [0.22,1.1,1.98].forEach(function(y){tube([0.0,y,-0.045],[0.0,y+0.12,-0.045],0.012,10,'#9f9e9a',0,0);});
    MAT=ALM;withBev(0.004,function(){box(0.33,Hd-0.1,-0.05,0.36,0.065,0.035,'#8e8d8a',0,0);});
    /* Wohnungstür 0,98 m: weiss lackiert, Drücker beidseitig (Scharnier bei z=3,80, öffnet in die Wohnung) */
    T=A;MAT=IPU;withBev(0.004,function(){box(0,0,-0.47,0.045,2.05,0.94,'#ebe7df',0,0.45);});MAT=EDS;tube([-0.06,1.02,-0.86],[0.06,1.02,-0.86],0.009,8,'#a9a7a4',0,0);tube([0.06,1.02,-0.86],[0.06,1.02,-0.74],0.009,8,'#a9a7a4',0,0);tube([-0.06,1.02,-0.86],[-0.06,1.02,-0.74],0.009,8,'#a9a7a4',0,0);
    tube([-0.0225,1.02,-0.86],[-0.031,1.02,-0.86],0.022,14,'#a9a7a4',0,0);tube([0.0225,1.02,-0.86],[0.031,1.02,-0.86],0.022,14,'#a9a7a4',0,0);MAT=CHR;tube([-0.03,1.5,-0.47],[0.03,1.5,-0.47],0.007,12,'#c6c7c8',0,0);MAT=EDS;[0.25,1.0,1.8].forEach(function(y){tube([0.03,y,-0.005],[0.03,y+0.1,-0.005],0.009,10,'#a9a7a4',0,0);});
    /* Terrassentür: Schiebeflügel innen vor dem festen Flügel, gleitet nach rechts */
    T=TT;MAT=MET;var fc=FRM,z0=ZF-0.26,z1=ZF-0.2;
    box(6.4,FLOOR+0.03,(z0+z1)/2,0.07,2.3,z1-z0,fc,0,0.4);box(7.28,FLOOR+0.03,(z0+z1)/2,0.07,2.3,z1-z0,fc,0,0.4);box(6.84,FLOOR+0.03,(z0+z1)/2,0.95,0.1,z1-z0,fc,0,0.4);box(6.84,FLOOR+2.26,(z0+z1)/2,0.95,0.07,z1-z0,fc,0,0.4);
    box(7.24,FLOOR+0.95,z0-0.015,0.025,0.4,0.03,'#9d9a96',0,0);
    tglass(TGT,[6.435,FLOOR+0.13,(z0+z1)/2],[0.81,0,0],[0,2.13,0]);
    MAT=PUTZ;T=G;
  }


    /* ---------- Kameraroute (aus rise.json): [p, Auge, Blickziel, Bildwinkel rad] ----------
       Position: Catmull-Rom. Blickrichtung: Gier- und Neigungswinkel (stetig abgewickelt) statt Blickziel –
       so dreht die Kamera auf dem kürzesten Weg und ohne Sprung, auch wenn ein Blickziel nahe an der Kamera liegt. */
    var KY = (function () {
      var out = [], prev = null;
      K.forEach(function (k) { var d = sub(k[2], k[1]), y = Math.atan2(d[0], d[2]); if (prev !== null) { while (y - prev > Math.PI) y -= 2 * Math.PI; while (y - prev < -Math.PI) y += 2 * Math.PI; } prev = y; out.push([y, Math.atan2(d[1], Math.hypot(d[0], d[2])), Math.hypot(d[0], d[1], d[2])]); });
      return out;
    })();
    function cat(p0, p1, p2, p3, t) { var t2 = t * t, t3 = t2 * t; return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3); }
    function camAt(q) {
      q = Math.max(0, Math.min(1, q)); var i = 0; while (i < K.length - 2 && q > K[i + 1][0]) i++;
      var ia = Math.max(0, i - 1), id = Math.min(K.length - 1, i + 2), a = K[ia], b = K[i], c = K[i + 1], d = K[id];
      var u = (q - b[0]) / (c[0] - b[0]); u = u * u * (3 - 2 * u) * 0.35 + u * 0.65;
      var e = [0, 1, 2].map(function (j) { return cat(a[1][j], b[1][j], c[1][j], d[1][j], u); });
      var yaw = cat(KY[ia][0], KY[i][0], KY[i + 1][0], KY[id][0], u), pit = cat(KY[ia][1], KY[i][1], KY[i + 1][1], KY[id][1], u), ds = Math.max(0.5, cat(KY[ia][2], KY[i][2], KY[i + 1][2], KY[id][2], u));
      var dir = [Math.sin(yaw) * Math.cos(pit), Math.sin(pit), Math.cos(yaw) * Math.cos(pit)];
      return { e: e, t: [e[0] + dir[0] * ds, e[1] + dir[1] * ds, e[2] + dir[2] * ds], f: b[3] + (c[3] - b[3]) * u, yaw: yaw, pitch: pit };
    }
    function win2(d, q, k) { return k * sstep(d.open[0], d.open[1], q) * (1 - sstep(d.close[0], d.close[1], q)); }
    function doorAngle(q) { return win2(D_HT, q, D_HT.angle); }
    function aptAngle(q) { return win2(D_WT, q, D_WT.angle); }
    function terSlide(q) { return win2(D_TT, q, D_TT.slide); }
    function hiAmt(q) { return sstep(HL['in'][0], HL['in'][1], q) * (1 - sstep(HL.out[0], HL.out[1], q)); }
    /* Kamera im Gebäude? 0 = draussen, 1 = drinnen (weicher Übergang an Haus- und Terrassentür) */
    function insideAmt(e) { if (e[0] < -3.2 || e[0] > 8.9 || e[1] > 3.6 || e[2] < -1.2) return 0; return sstep(-0.7, 0.9, 5.5 - e[2]); }

    /* ---------- Shader (V15: linearer Farbraum, Material pro Pixel) ----------
       Material (MAT): 0 Aussenputz · 1 Keramik · 2 Metall lackiert · 3 Glas fern (leuchtend) · 4 Laub (Körper) · 5 Rasen
       6 Stein/Beton · 7 Holz · 8 Wandplatten · 9 Bodenplatten · 10 Leuchte · 12 Textil · 13 Lamellenstoren
       14 Spiegel · 15 Himmel · 16 Glas in Türen (vereinfacht) · 17 Erde/Kies · 18 Innenanstrich · 19 Hecke
       20 Sichtbeton/Sockel · 21 Gehwegplatten · 22 Chrom · 23 Aluminium · 24 Edelstahl gebürstet
       Farbraum: Farben (sRGB) werden beim Aufbau linearisiert, Licht wird linear gerechnet, Ausgabe einmal über eine
       Filmkurve (ACES-Näherung) und die sRGB-Umwandlung. Texturen T1/T2 sind Daten (Helligkeits- und Höhenfaktor),
       der Laubatlas ist Farbe (sRGB → linear im Shader).
       Pro Eckpunkt: gebackenes diffuses Licht, UV, Dunst. Pro Pixel: Textur, Fugen, Relief (Bump über Ableitungen),
       Glanz mit Rauheit und Fresnel, Spiegelung aus der Reflexionsaufnahme des Raums (Kastenprojektion) bzw. dem
       Himmel, Badspiegel aus einer planaren Spiegelung. Materialwerte (Rauheit, F0, Metall, Relief) aus einer LUT. */
    var SKYF = 'vec3 sky(vec3 d){float t=d.y;vec3 hz=vec3(0.6,0.54,0.53),lo=vec3(0.33,0.39,0.53),zn=vec3(0.075,0.11,0.21);vec3 c=mix(hz,lo,smoothstep(0.0,0.14,t));c=mix(c,zn,smoothstep(0.14,0.8,t));' +
      'float g=pow(max(dot(normalize(d.xz+vec2(0.0001)),vec2(-0.896,0.443)),0.0),3.0);c+=vec3(0.34,0.17,0.04)*g*(1.0-smoothstep(0.0,0.3,t));' +
      'c=mix(c,hz*0.93,smoothstep(0.0,-0.04,t));return c*c;}' + /* V17.1: unter dem Horizont Dunstton statt Dunkelblau (keine schwarzen Flächen hinter fernen Häusern) */
      /* ferner Hügelzug im Dunst (Silhouette am Horizont statt einer geraden Bodenkante) */
      'vec3 hil(vec3 d){return sky(vec3(d.x,0.0,d.z))*0.55;}';
    /* Filmkurve (ACES-Näherung nach Narkowicz) mit weicher Schulter, danach einmalig linear → sRGB */
    var TMF = 'vec3 tm(vec3 x){x=max(x,vec3(0.0));vec3 a=clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.0,1.0);return pow(a,vec3(0.4545));}';
    function PH(der) { return (der ? '#extension GL_OES_standard_derivatives : enable\n' : '') + '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n'; }
    var FOGV = 'float f=clamp(1.0-exp(-pow(dist/220.0,2.0)),0.0,1.0);vec3 fc=sky(vec3(fd.x,max(fd.y,0.0)*0.2,fd.z));';
    var VSM = 'attribute vec3 p;attribute vec3 n;attribute vec3 c;attribute vec2 em;attribute vec3 lt;attribute vec3 lt2;attribute vec4 sl;attribute vec3 sc;' +
      'uniform mat4 m;uniform mat4 mdl;uniform vec3 eye;uniform float ein;uniform float lm;' +
      'varying vec4 vd;varying vec4 vs;varying vec4 vu;varying vec4 vq;varying vec4 vp;varying vec4 vn;varying vec4 vl;varying vec3 va;' + SKYF +
      'bool M(float k){return abs(em.y-k)<0.5;}' +
      'void main(){vec4 wp=mdl*vec4(p,1.0);vec3 N=normalize(mat3(mdl)*n);gl_Position=m*wp;' +
      'vec3 fd=wp.xyz-eye;float dist=max(length(fd),0.001);fd/=dist;' +
      'bool ins=(wp.y>0.45&&wp.y<3.2&&wp.x>-3.1&&wp.x<8.7&&wp.z>-1.1&&wp.z<5.2)||(wp.x>-3.0&&wp.x<-1.6&&wp.z>1.5&&wp.z<4.35&&wp.y>=3.0&&wp.y<4.8);vp=vec4(wp.xyz,ins?0.0:1.0);' +
      'float ch=-1.0,s=1.0,k=1.0;vq=vec4(0.0);' +
      'if(M(0.0)){ch=0.0;k=0.8;if(abs(n.y)<0.5)vq=vec4(2e4,(p.y-0.5)/3.0,0.42,0.005);}' +
      'else if(M(18.0)){ch=0.0;s=1.7;k=0.3;}' +
      'else if(M(6.0)){ch=1.0;}' +
      'else if(M(17.0)){ch=1.0;s=0.45;k=1.5;}' +
      'else if(M(20.0)){ch=1.0;s=2.3;k=0.8;}' +
      'else if(M(5.0)){ch=2.0;s=0.9;}' +
      'else if(M(19.0)){ch=3.0;s=0.8;}' +
      'else if(M(7.0)){ch=4.0;s=1.52;}' +
      /* V17 Platten: Fugen je Pixel in Metern, Raster ab der Raumecke (Bad: x 3,072 / z −0,928, Boden 0,5), Textur nur noch leicht */
      'else if(M(8.0)||M(9.0)){bool bd=p.x>2.9&&p.z<2.45;vec2 o=bd?vec2(3.072,-0.928):vec2(-3.0,1.5);bool wpl=M(8.0);ch=wpl?5.0:6.0;s=1.2;k=wpl?0.16:0.3;' +
      'vq=abs(n.y)>0.5?vec4(p.x-o.x,p.z-o.y,wpl?-0.26:-0.34,0.0028):vec4(abs(n.x)>0.5?p.z-o.y:p.x-o.x,p.y-0.5,-0.24,0.0022);}' +
      'else if(M(21.0)){ch=6.0;s=1.0;k=1.3;}' +
      'else if(M(2.0)||M(23.0)||M(24.0)){ch=7.0;s=0.5;k=M(2.0)?0.25:1.0;}' +
      'else if(M(12.0)){ch=0.0;s=0.3;k=0.6;}' +
      'else if(M(26.0)){ch=1.0;s=0.35;k=1.25;}' +
      'else if(M(13.0)){vq=vec4(2e4,p.y/0.075,0.38,0.2);}' +
      'vec2 uv=abs(n.y)>0.5?p.xz:(abs(n.x)>0.5?p.zy:p.xy);vu=vec4(uv/s,ch,k);' +
      'vec3 L=mix(lt,lt2,lm);vec3 dif=c*L,add=vec3(0.0);vec3 r=reflect(fd,N);' +
      'if(M(10.0)){dif=vec3(0.0);add=c*em.x;}' +
      'else if(M(16.0)){dif=vec3(0.0);add=ein>0.5?mix(vec3(0.16,0.12,0.11),vec3(0.02,0.035,0.09),smoothstep(1.0,2.9,wp.y)):vec3(0.9,0.5,0.22)*0.4+sky(r)*0.1;}' +
      'else if(M(3.0)){float fr=0.12+0.88*pow(1.0-max(dot(N,-fd),0.0),3.0);dif=vec3(0.0);add=em.x>0.0?c*em.x*0.9+sky(r)*fr*0.15:mix(c*0.12,sky(r)*0.8,fr);}' +
      'else add=c*em.x;' +
      'vd=vec4(dif,em.y);vs=vec4(add,0.0);vn=vec4(N,sl.w);vl=vec4(sl.xyz,(sc.x+sc.y+sc.z)*0.3333);va=c;}';
    /* Software-Grafik (lite): Dunst wieder je Eckpunkt (die fernen Bodenflächen sind dafür in 40-m-Felder geteilt) */
    var VSML = VSM.replace('varying vec3 va;', 'varying vec3 va;varying vec4 vf;').replace(/va=c;}$/, 'va=c;' + FOGV +
      'if(wp.y<0.25){float rr=length(wp.xz-vec2(-1.0,5.0));float g=smoothstep(40.0,120.0,rr);vec3 land=mix(fc*0.36,fc*0.58,smoothstep(140.0,430.0,rr));fc=mix(fc,land,g);f=max(f,g);}vf=vec4(fc,f);}');
    /* mode: 0 normal · 1 Reflexionsaufnahme (nur diffus, Ausgabe √linear) · 2 Spiegelbild (ohne Spiegel-Rekursion) */
    /* lite: Software-Grafik ohne IR_FORCE_HQ – ohne Relief und ohne Reflexionsaufnahme (gemessen: Bildzeit ≈ −…%, siehe Testbericht) */
    function FSM(der, lite) {
      return PH(der) + 'varying vec4 vd;varying vec4 vs;varying vec4 vu;varying vec4 vq;varying vec4 vp;varying vec4 vn;varying vec4 vl;varying vec3 va;' + (lite ? 'varying vec4 vf;' : '') +
        'uniform sampler2D t1;uniform sampler2D t2;uniform sampler2D lut;uniform samplerCube pr;uniform sampler2D mr;' +
        'uniform float sw;uniform float expo;uniform vec3 eye;uniform vec4 clip;uniform float mode;uniform float hasPr;uniform vec3 prC;uniform vec3 prA;uniform vec3 prB;uniform vec4 mrv;' + SKYF + TMF +
        'void main(){if(dot(vec4(vp.xyz,1.0),clip)<0.0)discard;' +
        'vec4 a=texture2D(t1,vu.xy),b=texture2D(t2,vu.xy);vec4 c4=vec4(vu.z);vec4 m1=1.0-step(0.5,abs(c4-vec4(0.0,1.0,2.0,3.0))),m2=1.0-step(0.5,abs(c4-vec4(4.0,5.0,6.0,7.0)));' +
        'float tv=dot(a,m1)+dot(b,m2)+0.5*(1.0-dot(m1+m2,vec4(1.0)));float fac=1.0+(tv*2.0-1.0)*vu.w;' +
        /* Fugen ohne Verzweigung (Ableitungen bleiben in gleichförmigem Kontrollfluss): Platten 2D in Metern, Putz und
           Lamellen 1D (vq.x = 2e4 bei Rasterweite 4e4 → keine senkrechten Fugen, im mediump-Bereich) */
        'float t2=step(vq.z,-0.0001);vec2 ts=mix(vec2(4e4,1.0),vec2(0.6,abs(vu.z-6.0)<0.5?0.6:0.3),t2);vec2 tq=vq.xy/ts,gq=fract(tq),dq=min(gq,1.0-gq)*ts;float dj=min(dq.x,dq.y);' +
        (der ? 'float fj=max(fwidth(vq.x),fwidth(vq.y))+0.00001,aj=fj*0.75;' : 'float fj=0.0,aj=mix(0.004,0.0012,t2);') +
        'float gr=(1.0-smoothstep(vq.w*0.5-aj,vq.w*0.5+aj,dj))*abs(vq.z)' + (der ? '*mix(clamp(vq.w/(fj*1.5),0.0,1.0),mix(0.35,1.0,clamp(vq.w/(fj*1.5),0.0,1.0)),t2)' : '') + ';' +
        'vec2 ti=floor(tq);fac*=1.0+(fract((ti.x*0.618034+ti.y*0.414214)*7.31)-0.5)*0.03*t2;' +
        'vec4 mp=texture2D(lut,vec2((vd.a+0.5)/32.0,0.5));' +
        'vec3 P=vp.xyz,V=normalize(eye-P),N=normalize(vn.xyz);if(dot(N,V)<0.0)N=-N;float dist=length(eye-P);' +
        (der ? 'float bh=((tv-0.5)*mp.a*0.004-gr*0.0012)*(1.0-smoothstep(2.5,8.0,dist));vec3 dpx=dFdx(P),dpy=dFdy(P);float hx=dFdx(bh),hy=dFdy(bh);vec3 r1=cross(dpy,N),r2=cross(N,dpx);float det=dot(dpx,r1);' +
          'vec3 Nb=abs(det)>1e-12?normalize(abs(det)*N-sign(det)*(hx*r1+hy*r2)):N;' : 'vec3 Nb=N;') +
        'vec3 Ld,Lc;float ar;if(vp.w<0.5){vec3 l=vl.xyz-P;float d=max(length(l),0.001);Ld=l/d;float q=clamp(1.0-d/max(vn.w,0.01),0.0,1.0);Lc=((P.x>3.0&&P.x<5.45&&P.z>-1.0&&P.z<2.4)?vec3(1.0,0.9,0.8):vec3(1.0,0.74,0.5))*vl.w*q*q;ar=0.05/(d+0.25);}' +
        'else{Ld=normalize(vec3(-0.857,0.302,0.423));Lc=vec3(0.42,0.24,0.12);ar=0.45;}' +
        'float ndl0=max(dot(N,Ld),0.0),ndl=max(dot(Nb,Ld),0.0);float bs=clamp((ndl+0.3)/(ndl0+0.3),0.75,1.25);' +
        'vec3 base=vd.rgb*fac*(1.0-gr)*bs;vec3 col=base;' +
        /* sehr raue, nichtmetallische Flächen (Putz, Anstrich, Rasen, Textil: Rauheit > 0,76) haben keinen sichtbaren Glanz – Rechnung entfällt */
        'if(abs(mode-1.0)>0.5&&mp.g>0.004&&(mp.r<0.76||mp.b>0.5)){float r=max(mp.r,0.05),mt=mp.b,al=r*r,a2=clamp(al+ar,0.0,1.0);vec3 F0=mix(vec3(mp.g),clamp(va,0.0,1.0),mt);' +
        'vec3 H=normalize(Ld+V);float nh=max(dot(Nb,H),0.0),nv=max(dot(Nb,V),0.001);float sp=2.0/max(a2*a2,0.0004)-2.0;float D=min((sp+8.0)*0.0398*pow(nh,sp),40.0);' +
        /* Metall: F0 = Grundfarbe (unbeleuchtet, linear) – Chrom neutral, Aluminium matter, keine Lichtfarbe im Reflex */
        'vec3 Fs=F0+(1.0-F0)*pow(1.0-max(dot(H,V),0.0),5.0);vec3 tint=vec3(1.0);' +
        'vec3 spec=Lc*D*Fs*ndl*tint;vec3 R=reflect(-V,Nb);vec3 env;' +
        (lite ? '' : 'if(hasPr>0.5&&vp.w<0.5){vec3 f1=(prB-P)/R,f2=(prA-P)/R,ff=max(f1,f2);float t=min(min(ff.x,ff.y),ff.z);vec3 e=textureCube(pr,P+R*t-prC,r*7.0).rgb;env=e*e*1.25;}else ') +
        'if(vp.w<0.5)env=vec3(0.18,0.15,0.12);else env=sky(R)*(0.55+0.45*smoothstep(-0.25,0.05,R.y));' +
        'vec3 Fe=F0+(1.0-F0)*pow(1.0-nv,5.0)*(1.0-r)*(1.0-r);' +
        'col=base*(1.0-mt*0.88)*(1.0-Fe*(1.0-mt))+env*Fe*tint+spec;}' +
        'if(mrv.z>0.5&&abs(vd.a-14.0)<0.5){vec3 mc=texture2D(mr,gl_FragCoord.xy*mrv.xy).rgb;float nv2=max(dot(N,V),0.0);gl_FragColor=vec4(mc*(0.9+0.06*(1.0-nv2))+vec3(0.006,0.007,0.008),1.0);return;}' +
        'col+=vs.rgb+vec3(0.95,0.85,0.70)*exp(-pow((P.x*0.55+P.y-sw)/0.85,2.0))*0.14*vp.w;' +
        'if(vp.w>0.5)col+=vec3(0.55,0.3,0.14)*pow(1.0-max(dot(N,V),0.0),4.0)*0.05*max(dot(N,vec3(-0.857,0.1,0.423)),0.0);' +
        'if(mode>0.5&&mode<1.5){gl_FragColor=vec4(sqrt(clamp(col*0.8,0.0,1.0)),1.0);return;}' +
        /* Luftperspektive je Pixel (vorher je Eckpunkt: auf den 350-m-Bodenflächen falsch interpoliert → sichtbare Horizontkante) */
        /* nur rechnen, wo Dunst überhaupt sichtbar ist (innen und im Nahbereich entfällt der Himmelsaufruf) */
        (lite ? 'col=mix(col,vf.rgb,vf.a);gl_FragColor=vec4(tm(col*expo),1.0);}' :
        'vec3 fv=P-eye;float fdi=max(length(fv),0.001);float f=clamp(1.0-exp(-pow(fdi/220.0,2.0)),0.0,1.0),g=0.0,rr=0.0;' +
        'if(P.y<0.25){rr=length(P.xz-vec2(-1.0,5.0));g=smoothstep(40.0,120.0,rr);}float fa=max(f,g);' +
        'if(fa>0.002){vec3 fd=fv/fdi;vec3 fc=sky(vec3(fd.x,max(fd.y,0.0)*0.2,fd.z));vec3 land=mix(fc*0.36,fc*0.58,smoothstep(140.0,430.0,rr));fc=mix(fc,land,g);col=mix(col,fc,fa);}' +
        'gl_FragColor=vec4(tm(col*expo),1.0);}');
    }
    /* Himmel: Verlauf der blauen Stunde + feine, flache Wolkenschleier (nur nahe am Horizont) */
    var VSS = 'attribute vec3 p;uniform mat4 m;varying vec3 vp;void main(){vp=p;gl_Position=m*vec4(p,1.0);}';
    var FSS = PH(false) + 'varying vec3 vp;uniform vec3 eye;uniform float expo;' + SKYF + TMF +
      'float hs(vec2 q){vec3 p3=fract(vec3(q.xyx)*0.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}' +
      'float vn(vec2 q){vec2 i=floor(q),f=fract(q);f=f*f*(3.0-2.0*f);return mix(mix(hs(i),hs(i+vec2(1.0,0.0)),f.x),mix(hs(i+vec2(0.0,1.0)),hs(i+vec2(1.0,1.0)),f.x),f.y);}' +
      'void main(){vec3 d=normalize(vp-eye);vec3 c=sky(d);vec2 hq=normalize(d.xz+vec2(0.0001));float hh=0.004+0.016*(vn(hq*3.0+1.7)*0.65+vn(hq*9.0+4.2)*0.35);float hm=1.0-smoothstep(hh-0.0012,hh+0.0012,d.y);' +
      'if(d.y>0.015){vec2 q=d.xz/(d.y+0.08)*vec2(1.3,3.6);float cl=vn(q)*0.6+vn(q*2.3+3.1)*0.3+vn(q*5.3+7.7)*0.1;' +
      'cl=smoothstep(0.52,0.86,cl)*(1.0-smoothstep(0.22,0.65,d.y))*smoothstep(0.015,0.07,d.y);float g=pow(max(dot(normalize(d.xz),vec2(-0.896,0.443)),0.0),2.0);' +
      'c=mix(c,c*0.75+vec3(0.006,0.0035,0.004)+vec3(0.03,0.01,0.002)*g,cl*0.5);}c=mix(c,hil(d)*(0.92+0.08*smoothstep(hh-0.015,hh,d.y)),hm);gl_FragColor=vec4(tm(c*expo),1.0);}';
    /* Konturlinien: nur noch für die Scan-Kante beim Start und die Sanitär-Hervorhebung (keine Dauerlinien) */
    var VSL = 'attribute vec3 p;attribute float wt;uniform mat4 m;uniform mat4 mdl;uniform vec3 ev;varying float vw;varying vec3 vp;void main(){vec4 wp=mdl*vec4(p,1.0);vw=wt;vp=wp.xyz;vec3 d=ev-wp.xyz;float l=length(d);wp.xyz+=d/max(l,0.001)*min(0.012+l*0.0015,0.25);gl_Position=m*wp;}';
    var FSL = 'precision mediump float;varying float vw;varying vec3 vp;uniform vec3 eye;uniform float sw;uniform float hi;uniform float lb;void main(){float a;vec3 c=vec3(0.93,0.84,0.70);if(vw<0.0){a=hi;c=vec3(1.0,0.88,0.66);}else{float s=exp(-pow((vp.x*0.55+vp.y-sw)/0.7,2.0));a=vw*lb+s*vw*1.15;}a*=1.0-clamp(pow(distance(vp,eye)/150.0,2.0),0.0,1.0);gl_FragColor=vec4(c*a,a);}';
    /* Fenster mit Raumtiefe (Interior Mapping) – Raumfarben linear gerechnet; Mehrfachverglasung spiegelt stärker (F0 ≈ 0,1) */
    var VSG = 'attribute vec3 p;attribute vec3 n;attribute vec4 wc;attribute vec4 ws;uniform mat4 m;uniform vec3 eye;varying vec3 vo;varying vec3 vv;varying vec4 vw;varying vec4 vr;varying vec4 vf;' + SKYF +
      'void main(){gl_Position=m*vec4(p,1.0);vec3 R=normalize(cross(vec3(0.0,1.0,0.0),n));vec3 d=p-wc.xyz;vo=vec3(dot(d,R),d.y,wc.w);' +
      'vec3 v=p-eye;vv=vec3(dot(v,R),v.y,dot(v,n));vw=ws;float dist=max(length(v),0.001);vec3 fd=v/dist;' +
      'float cs=max(dot(-fd,n),0.0);vec3 rf=reflect(fd,n);vr=vec4(mix(vec3(0.05,0.055,0.07),sky(rf),smoothstep(-0.12,0.08,rf.y)),0.1+0.9*pow(1.0-cs,5.0));' + FOGV + 'vf=vec4(fc,f);}';
    var FSG = PH(false) + 'varying vec3 vo;varying vec3 vv;varying vec4 vw;varying vec4 vr;varying vec4 vf;uniform float expo;' + TMF +
      'float h1(float s){return fract(sin(s*78.233)*43758.5453);}' +
      'void main(){float sd=floor(vo.z+0.5),hw=vw.x,yb=vw.y,lit=vw.z,cu=vw.w;' +
      'float rw=2.8+1.6*h1(sd),rd=3.0+1.8*h1(sd+3.1),rh=2.55,ox=(h1(sd+5.7)-0.5)*0.8;' +
      'vec3 o=vec3(vo.x-ox,vo.y+yb,0.0);vec3 d=normalize(vv);d.z=min(d.z,-0.03);d.x=abs(d.x)<0.0001?0.0001:d.x;d.y=abs(d.y)<0.0001?0.0001:d.y;' +
      'float tx=((d.x>0.0?rw*0.5:-rw*0.5)-o.x)/d.x,ty=((d.y>0.0?rh:0.0)-o.y)/d.y,tz=(-rd-o.z)/d.z;float t=min(tx,min(ty,tz));vec3 h=o+d*t;' +
      'vec3 wall=mix(vec3(0.84,0.8,0.74),vec3(0.74,0.73,0.7),h1(sd+1.3));if(h1(sd+14.0)>0.82)wall=vec3(0.62,0.66,0.66);vec3 col=wall;' +
      'if(t==tz){float fx=(h1(sd+7.7)-0.5)*rw*0.45,fw=0.45+0.55*h1(sd+8.8),fh=0.42+0.5*h1(sd+9.9);' +
      'if(abs(h.x-fx)<fw&&h.y<fh)col=mix(vec3(0.24,0.21,0.19),vec3(0.56,0.47,0.38),h1(sd+2.2));' +
      'else if(h1(sd+4.4)>0.45&&abs(h.x-fx)<0.32&&abs(h.y-1.55)<0.22)col=mix(vec3(0.32,0.36,0.4),vec3(0.62,0.5,0.38),h1(sd+15.0));}' +
      'else if(t==ty){col=d.y>0.0?vec3(0.9,0.88,0.85):mix(vec3(0.46,0.34,0.23),vec3(0.6,0.58,0.55),h1(sd+6.6));}' +
      'else{col=wall*0.94;float sx=-h.z/rd;if(h1(sd+16.0)>0.5&&sx>0.35&&sx<0.75&&h.y<1.9)col=mix(vec3(0.3,0.26,0.22),vec3(0.66,0.6,0.52),h1(sd+17.0));}' +
      /* Zimmerpflanze auf der inneren Fensterbank (Silhouette in 22 cm Tiefe, nur bei einem Teil der Fenster) */
      'if(h1(sd+23.0)>0.62){float t2=(-0.22-o.z)/d.z;if(t2>0.0&&t2<t){vec3 q2=o+d*t2;float px=(h1(sd+24.0)-0.5)*hw*1.1,dx=q2.x-px,dy=q2.y-0.87;' +
      'vec2 e=vec2(dx/0.16,(dy-0.3)/0.2);float an=atan(e.y,e.x);' +
      'if(abs(dx)<0.065&&dy>0.0&&dy<0.12)col=vec3(0.36,0.27,0.22);else if(dy>0.1&&length(e)<0.82+0.2*sin(an*5.0+sd)+0.07*sin(an*11.0))col=vec3(0.16,0.24,0.12);}}' +
      'col*=col;vec3 L=vec3((h1(sd+11.0)-0.5)*rw*0.5,rh-0.35,-rd*(0.35+0.35*h1(sd+12.0)));float dl=length(h-L);' +
      /* Lichtfarbe: meist warm, bei einem Teil neutralweiss (LED) – ruhig, ohne Wechsel */
      'vec3 warm=h1(sd+21.0)>0.72?vec3(1.0,0.84,0.68):mix(vec3(1.0,0.58,0.25),vec3(1.0,0.76,0.49),h1(sd+13.0));' +
      'float lt2=max(lit,0.06+0.1*h1(sd+19.0));vec3 li=warm*lt2*(0.3+0.9/(0.45+dl*dl*0.28))+vec3(0.03,0.036,0.05)*(1.0-0.5*lit);' +
      'col*=li*(1.0-0.25*clamp(-h.z/rd,0.0,1.0));' +
      'if(cu>0.0){float cv=smoothstep(1.0-cu,1.0-cu+0.04,abs(vo.x)/hw);float fo=0.95+0.05*sin(vo.x*22.0);col=mix(col,vec3(0.86,0.76,0.6)*(0.012+lit*0.42)*fo,cv*0.86);}' +
      'col=col*0.85*(1.0-vr.a)+vr.rgb*vr.a;col=mix(col,vf.rgb,vf.a);gl_FragColor=vec4(tm(col*expo),1.0);}';
    /* Laubkarten: Alpha-zu-Abdeckung bei Kantenglättung (ruhige Blattkanten), sonst Alpha-Test. Wind: Spitzen stärker als Fuss */
    var VSF = 'attribute vec3 p;attribute vec2 uv;attribute vec3 c;attribute vec2 wv;attribute vec3 lt;uniform mat4 m;uniform vec3 eye;uniform float tw;uniform float wa;varying vec2 vu;varying vec3 vd;varying vec4 vf;' + SKYF +
      'void main(){vec3 q=p;float h=wv.x*wv.x;float s=sin(tw*1.3+wv.y)*0.62+sin(tw*2.17+wv.y*1.71)*0.38;q.x+=s*h*wa*0.032;q.z+=(sin(tw*1.07+wv.y*0.8)*0.6+0.4*s)*h*wa*0.02;q.y-=abs(s)*h*wa*0.006;' +
      'gl_Position=m*vec4(q,1.0);vu=uv;vd=c*lt;vec3 v=q-eye;float dist=max(length(v),0.001);vec3 fd=v/dist;' + FOGV + 'vf=vec4(fc,f);}';
    function FSF(der, a2c) {
      return PH(der) + 'varying vec2 vu;varying vec3 vd;varying vec4 vf;uniform sampler2D tl;uniform float expo;' + TMF +
        'void main(){vec4 t=texture2D(tl,vu);float a=t.a;' + (der ? 'vec2 dx=dFdx(vu*1024.0),dy=dFdy(vu*1024.0);a*=1.0+max(0.5*log2(max(dot(dx,dx),dot(dy,dy))),0.0)*0.22;' : '') +
        (a2c ? 'if(a<0.12)discard;a=clamp((a-0.32)/0.36,0.0,1.0);' : 'if(a<0.5)discard;a=1.0;') +
        'vec3 col=t.rgb*t.rgb*vd*2.6;col=mix(col,vf.rgb,vf.a);gl_FragColor=vec4(tm(col*expo),a);}';
    }
    /* Lichthöfe: kleine, weiche Billboards an Leuchten (additiv, verdeckt durch Geometrie, nah ausgeblendet) */
    var VSH = 'attribute vec3 p;attribute vec3 q;attribute vec3 c;uniform mat4 m;uniform vec3 eye;uniform vec3 cx;uniform vec3 cy;varying vec2 vq;varying vec3 vc;' +
      'void main(){vec3 d=eye-p;float l=max(length(d),0.001);vec3 w=p+d/l*min(0.2,l*0.4)+(cx*q.x+cy*q.y)*q.z;gl_Position=m*vec4(w,1.0);vq=q.xy;vc=c*smoothstep(0.4,1.6,l)*(1.0-smoothstep(60.0,140.0,l));}';
    var FSH = 'precision mediump float;varying vec2 vq;varying vec3 vc;uniform float expo;void main(){float r=dot(vq,vq);float g=(exp(-r*6.0)*0.55+exp(-r*26.0)*0.45)*(1.0-smoothstep(0.7,1.0,r));gl_FragColor=vec4(vc*g*expo,0.0);}';
    /* echtes Glas pro Pixel: Durchsicht + Fresnel-Spiegelung aus derselben Raumaufnahme wie die Materialien (innen)
       bzw. dem Himmel (aussen) – Spiegelung und Durchsicht passen so zusammen */
    var VST = 'attribute vec3 p;attribute vec3 n;uniform mat4 m;uniform mat4 mdl;uniform vec3 eye;varying vec3 vw;varying vec3 vnn;varying vec4 vf;' + SKYF +
      'void main(){vec4 wp=mdl*vec4(p,1.0);vw=wp.xyz;vnn=normalize(mat3(mdl)*n);gl_Position=m*wp;vec3 v=wp.xyz-eye;float dist=max(length(v),0.001);vec3 fd=v/dist;' + FOGV + 'vf=vec4(fc,f);}';
    var FST = PH(false) + 'varying vec3 vw;varying vec3 vnn;varying vec4 vf;uniform vec3 eye;uniform float expo;uniform samplerCube pr;uniform float hasPr;uniform vec3 prC;uniform vec3 prA;uniform vec3 prB;' + SKYF + TMF +
      'void main(){vec3 V=normalize(eye-vw),N=normalize(vnn);if(dot(N,V)<0.0)N=-N;float nv=max(dot(N,V),0.0);float fr=0.08+0.92*pow(1.0-nv,5.0);vec3 R=reflect(-V,N);vec3 env;' +
      'bool ins=vw.y>0.45&&vw.y<3.2&&vw.x>-3.1&&vw.x<8.7&&vw.z>-1.1&&vw.z<5.2&&eye.z<5.3;' +
      'if(ins&&hasPr>0.5){vec3 f1=(prB-vw)/R,f2=(prA-vw)/R,ff=max(f1,f2);float t=min(min(ff.x,ff.y),ff.z);vec3 e=textureCube(pr,vw+R*t-prC,0.5).rgb;env=e*e*1.25;}else env=sky(R)*(0.5+0.5*smoothstep(-0.2,0.05,R.y));' +
      'env=mix(env,vf.rgb,vf.a);gl_FragColor=vec4(tm(env*fr*expo),fr*0.92+0.03);}';
    var shaders = [], buffers = [], textures = [];
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); shaders.push(o); return o; }
    function prog(v, f) { var q = gl.createProgram(); gl.attachShader(q, sh(gl.VERTEX_SHADER, v)); gl.attachShader(q, sh(gl.FRAGMENT_SHADER, f)); gl.linkProgram(q); if (!gl.getProgramParameter(q, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(q)); q.u = {}; progs.push(q); return q; }
    var progs = [];
    function U(q, n) { return q.u[n] || (q.u[n] = gl.getUniformLocation(q, n)); }
    function vbo(arr) { var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, arr instanceof Float32Array ? arr : new Float32Array(arr), gl.STATIC_DRAW); buffers.push(b); return b; }
    /* Attribute: nur die vom aktuellen Programm genutzten Slots aktiv lassen (Programmwechsel) */
    function attr(q, name, b, size) { var k = q.a || (q.a = {}); var l = name in k ? k[name] : (k[name] = gl.getAttribLocation(q, name)); if (l < 0) return; gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, size, gl.FLOAT, false, 0, 0); }
    /* MAX_VERTEX_ATTRIBS nur einmal abfragen: getParameter ist ein synchroner GPU-Aufruf und würde jedes Bild ausbremsen */
    var NATTR = 8;
    function disableAttrs() { for (var i = 0; i < NATTR; i++) gl.disableVertexAttribArray(i); }
    /* V17: statische Sätze räumlich in Blöcke ordnen (Dreiecke nach Schwerpunkt in Würfel der Kantenlänge cs); beim Zeichnen
       werden nur Blöcke im Sichtkegel gezeichnet (Begrenzungsquader gegen die 6 Ebenen der Kameramatrix). Nur die GPU-Kopie
       wird umsortiert – Lichtdaten, Prüfsumme und Prüfhilfen (rayY, checkFrustum) arbeiten weiter auf den Originaldaten. */
    function chunkify(Sx, cs) {
      var flat = cs > 10; /* grosse Zellen (Umgebung): nur nach x/z teilen, jenseits von 90 m acht Sektoren */
      var P = Sx.P, nt = P.length / 9, map = {}, keys = [], t, v, a;
      for (t = 0; t < nt; t++) { var o = t * 9, gx = (P[o] + P[o + 3] + P[o + 6]) / 3, gz = (P[o + 2] + P[o + 5] + P[o + 8]) / 3, k = flat && Math.max(Math.abs(gx), Math.abs(gz)) > 90 ? 'f' + Math.floor((Math.atan2(gz, gx) + Math.PI) / (Math.PI / 4)) : Math.floor(gx / cs) + ',' + (flat ? 0 : Math.floor((P[o + 1] + P[o + 4] + P[o + 7]) / 3 / cs)) + ',' + Math.floor(gz / cs);
        if (!map[k]) { map[k] = []; keys.push(k); } map[k].push(t); }
      var order = new Int32Array(nt), n = 0, ranges = [];
      keys.forEach(function (k) { var L = map[k], s0 = n * 3, mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
        L.forEach(function (tt) { order[n++] = tt; for (v = 0; v < 3; v++) for (a = 0; a < 3; a++) { var x = P[(tt * 3 + v) * 3 + a]; if (x < mn[a]) mn[a] = x; if (x > mx[a]) mx[a] = x; } });
        ranges.push({ s: s0, n: L.length * 3, mn: mn, mx: mx }); });
      function perm(arr, w) { var out = new Float32Array(arr.length); for (var i = 0; i < nt; i++) { var src = order[i] * 3 * w, dst = i * 3 * w; for (var j = 0; j < 3 * w; j++) out[dst + j] = arr[src + j]; } return out; }
      return { perm: perm, ranges: ranges };
    }
    function frustumOf(M) { var pl = []; [[3, 0, 1], [3, 0, -1], [3, 1, 1], [3, 1, -1], [3, 2, 1], [3, 2, -1]].forEach(function (q) { pl.push([M[q[0]] + q[2] * M[q[1]], M[4 + q[0]] + q[2] * M[4 + q[1]], M[8 + q[0]] + q[2] * M[8 + q[1]], M[12 + q[0]] + q[2] * M[12 + q[1]]]); }); return pl; }
    function boxIn(F, mn, mx) { for (var i = 0; i < 6; i++) { var p = F[i]; if (p[0] * (p[0] > 0 ? mx[0] : mn[0]) + p[1] * (p[1] > 0 ? mx[1] : mn[1]) + p[2] * (p[2] > 0 ? mx[2] : mn[2]) + p[3] < 0) return false; } return true; }
    var cullStats = { drawn: 0, total: 0 };
    function upload(Sx, fnM, lmFn, cs) {
      if (!Sx.L.length) bakeSet(Sx); var em = new Float32Array(Sx.E.length * 2); for (var i = 0; i < Sx.E.length; i++) { em[i * 2] = Sx.E[i]; em[i * 2 + 1] = Sx.M[i]; }
      var ck = cs ? chunkify(Sx, cs) : null, pm = ck ? ck.perm : function (x) { return x; };
      var lt = vbo(pm(Sx.L, 3));
      return { name: Sx.name, p: vbo(pm(Sx.P, 3)), n: vbo(pm(Sx.N, 3)), c: vbo(pm(Sx.C, 3)), em: vbo(pm(em, 2)), lt: lt, lt2: Sx.L2 ? vbo(pm(Sx.L2, 3)) : lt, sl: vbo(pm(Sx.SL, 4)), sc: vbo(pm(Sx.SC, 3)), lp: vbo(Sx.LP), lw: vbo(Sx.LW), nm: Sx.P.length / 3, nl: Sx.LP.length / 3, M: fnM, LM: lmFn, ranges: ck ? ck.ranges : null };
    }
    var I4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    function rotY(a, tx, ty, tz) { var c = Math.cos(a), s = Math.sin(a); return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, tx, ty, tz, 1]; }
    function aptM(q) { return rotY(aptAngle(q), AH[0], FLOOR, AH[1]); }
    function doorM(q) { return rotY(doorAngle(q), DH[0], FLOOR, DH[1]); }
    function terM(q) { return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, terSlide(q), 0, 0, 1]; }
    function camNow(q) { if (camOverride) return camOverride; return camAt(q); }
    /* Hochformat (Tablet hochkant): Bildausschnitt je Station verschieben – das Motiv rückt zur Mitte und nach oben,
       weil der Text dort unten steht. Zwischen den Stationen linear übergeblendet; im Querformat ohne Wirkung. */
    function pshift(q) {
      if (q <= ST[0].hold) return ST[0].ps; if (q >= ST[ST.length - 1].hold) return ST[ST.length - 1].ps;
      for (var i = 0; i < ST.length - 1; i++) if (q <= ST[i + 1].hold) { var t = sstep(ST[i].hold, ST[i + 1].hold, q); return [ST[i].ps[0] + (ST[i + 1].ps[0] - ST[i].ps[0]) * t, ST[i].ps[1] + (ST[i + 1].ps[1] - ST[i].ps[1]) * t]; }
      return [0, 0];
    }
    /* Kamera wie in der Architekturfotografie: waagrecht gehalten, die Neigung wird als Objektivverschiebung
       umgesetzt – senkrechte Kanten bleiben senkrecht. Erst bei steilem Blick (> 17°) neigt sich die Kamera anteilig. */
    function matrix(q) {
      var cm = camNow(q), asp = w / h, f = cm.f * (asp < 1 ? 1.25 : 1);
      var dc = Math.hypot(cm.e[0], cm.e[1] - 5, cm.e[2]), near = Math.max(0.05, Math.min(0.5, (dc - 14) * 0.025));
      var P = persp(f, asp, near, 1400), k = camOverride ? 0 : Math.max(0, Math.min(1, (1.15 - asp) / 0.45));
      if (k > 0) { var sh = pshift(q); P[8] = -(sh[0] || 0) * k; P[9] = -(sh[1] || 0) * k; }
      var dx = cm.t[0] - cm.e[0], dy = cm.t[1] - cm.e[1], dz = cm.t[2] - cm.e[2], pit = Math.atan2(dy, Math.hypot(dx, dz)), yaw = Math.atan2(dx, dz);
      var ap = Math.abs(pit), kk = ap <= 0.3 ? 1 : Math.max(0.55, 1 - (ap - 0.3) / 0.25 * 0.45), keep = pit * (1 - kk);
      P[9] += Math.tan(pit * kk) / Math.tan(f / 2);
      var t = [cm.e[0] + Math.sin(yaw) * Math.cos(keep), cm.e[1] + Math.sin(keep), cm.e[2] + Math.cos(yaw) * Math.cos(keep)], Vw = look(cm.e, t, [0, 1, 0]);
      return { m: mul(P, Vw), e: cm.e, ins: insideAmt(cm.e), rx: [Vw[0], Vw[4], Vw[8]], uy: [Vw[1], Vw[5], Vw[9]] };
    }
    function project(Mx, v) { var x = Mx[0] * v[0] + Mx[4] * v[1] + Mx[8] * v[2] + Mx[12], y = Mx[1] * v[0] + Mx[5] * v[1] + Mx[9] * v[2] + Mx[13], ww = Mx[3] * v[0] + Mx[7] * v[1] + Mx[11] * v[2] + Mx[15]; return [(x / ww * 0.5 + 0.5) * 100, (1 - (y / ww * 0.5 + 0.5)) * 100, ww]; }
    var PS = null, PG = null, PF = null, PH_ = null, PT = null, extra = null, LUT = null, CUBE0 = null, TEX0 = null, A2C = false;
    /* Materialwerte je MAT: Rauheit, F0 (Reflexion bei senkrechtem Blick), Metall, Relief – als LUT-Textur (32×1) */
    var MATP = { 0: [0.92, 0.03, 0, 0.22], 1: [0.1, 0.045, 0, 0], 2: [0.42, 0.045, 0, 0], 4: [0.8, 0.03, 0, 0], 5: [0.95, 0.02, 0, 0.35], 6: [0.72, 0.04, 0, 0.45],
      7: [0.48, 0.04, 0, 0.18], 8: [0.24, 0.045, 0, 0.12], 9: [0.5, 0.04, 0, 0.3], 12: [1.0, 0, 0, 0.3], 13: [0.5, 0.04, 0, 0], 14: [0.03, 0.9, 1, 0],
      17: [1.0, 0.02, 0, 0.7], 18: [0.9, 0.03, 0, 0.1], 19: [0.9, 0.03, 0, 0.6], 20: [0.78, 0.04, 0, 0.35], 21: [0.74, 0.04, 0, 0.45],
      22: [0.07, 0.78, 1, 0], 23: [0.3, 0.62, 1, 0], 24: [0.24, 0.6, 1, 0], 25: [0.42, 0.045, 0, 0], 26: [0.9, 0.03, 0, 0.3] };
    function mkLut() {
      var d = new Uint8Array(32 * 4); for (var i = 0; i < 32; i++) { var v = MATP[i] || [1, 0, 0, 0]; for (var k = 0; k < 4; k++) d[i * 4 + k] = Math.round(v[k] * 255); }
      var t = gl.createTexture(); textures.push(t); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 32, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, d);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t;
    }
    function mkCube(N) {
      var t = gl.createTexture(); textures.push(t); gl.bindTexture(gl.TEXTURE_CUBE_MAP, t);
      for (var f = 0; f < 6; f++) gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + f, 0, gl.RGBA, N, N, 0, gl.RGBA, gl.UNSIGNED_BYTE, N === 1 ? new Uint8Array([40, 36, 32, 255]) : null);
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, N === 1 ? gl.NEAREST : gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t;
    }
    /* ---------- Reflexionsaufnahmen (Cubemaps) je Raum, kastenprojiziert; einmalig beim ersten Betreten ---------- */
    var PROBES = [
      { id: 'halle', room: 1, c: [0.4, 1.6, 3.4], a: [-2.94, 0.5, 1.56], b: [2.94, 3.1, 5.12], tex: null },
      { id: 'flur', room: 2, c: [4.2, 1.6, 3.3], a: [3.06, 0.5, 2.46], b: [5.34, 3.1, 4.14], tex: null },
      { id: 'bad', room: 3, c: [4.25, 1.55, 0.75], a: [3.072, 0.5, -0.922], b: [5.33, 3.1, 2.322], tex: null },
      { id: 'wohnen', room: 4, c: [7.0, 1.55, 2.0], a: [5.46, 0.5, -0.94], b: [8.62, 3.1, 5.12], tex: null }
    ], probeFB = null, probeRB = null, probeN = 0, probesDone = 0;
    var CUBEF = [[[1, 0, 0], [0, -1, 0]], [[-1, 0, 0], [0, -1, 0]], [[0, 1, 0], [0, 0, 1]], [[0, -1, 0], [0, 0, -1]], [[0, 0, 1], [0, -1, 0]], [[0, 0, -1], [0, -1, 0]]];
    function probeFor(e) { if (insideAmt(e) < 0.5) return null; var r = roomOf([e[0], Math.min(Math.max(e[1], 0.6), 3.0), e[2]]); for (var i = 0; i < PROBES.length; i++) if (PROBES[i].room === r) return PROBES[i]; return null; }
    function captureProbe(pb) {
      var N = EXT.sw === true ? 64 : 128, t0 = win.performance.now();
      if (!probeFB) { probeFB = gl.createFramebuffer(); probeRB = gl.createRenderbuffer(); }
      if (probeN !== N) { gl.bindRenderbuffer(gl.RENDERBUFFER, probeRB); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, N, N); probeN = N; }
      gl.activeTexture(gl.TEXTURE0); pb.tex = mkCube(N); gl.bindTexture(gl.TEXTURE_CUBE_MAP, null); gl.bindFramebuffer(gl.FRAMEBUFFER, probeFB); gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, probeRB);
      gl.viewport(0, 0, N, N); var P = persp(Math.PI / 2, 1, 0.05, 60), by = {}; sets.forEach(function (o) { by[o.name] = o; });
      for (var f = 0; f < 6; f++) {
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + f, pb.tex, 0);
        gl.clearColor(0.18, 0.21, 0.27, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
        var d = CUBEF[f][0], Mx = mul(P, look(pb.c, [pb.c[0] + d[0], pb.c[1] + d[1], pb.c[2] + d[2]], CUBEF[f][1]));
        ['INT', 'A', 'D', 'TT'].forEach(function (n) { var o = by[n]; drawSet(o, Mx, pb.c, o.M ? o.M(ps) : I4, 1, 1, { mode: 1, lm: o.LM ? o.LM(ps) : 0 }); });
      }
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, pb.tex); gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height); disableAttrs(); probesDone++; probeMs += win.performance.now() - t0;
    }
    var probeMs = 0;
    /* ---------- Badspiegel: planare Spiegelung (Szene am Spiegel gespiegelt in eine Textur), nur wenn sichtbar ---------- */
    var MIR = { x: 3.25, y0: FLOOR + 1.17, y1: FLOOR + 1.83, z0: 0.45, z1: 1.15, fb: null, rb: null, tex: null, w: 0, h: 0, frames: 0 };
    function mirrorVisible(mm) {
      var e = mm.e; if (e[0] < MIR.x + 0.05 || e[0] > XW || e[2] < -0.95 || e[2] > 2.4 || e[1] < 0.5 || e[1] > 3.1) return false;
      var cs = [[MIR.x, MIR.y0, MIR.z0], [MIR.x, MIR.y1, MIR.z0], [MIR.x, MIR.y0, MIR.z1], [MIR.x, MIR.y1, MIR.z1]], inx = false;
      cs.forEach(function (v) { var q = project(mm.m, v); if (q[2] > 0 && q[0] > -10 && q[0] < 110 && q[1] > -10 && q[1] < 110) inx = true; }); return inx;
    }
    function renderMirror(mm, ord, ms, expo) {
      var s = EXT.sw === true ? 0.35 : 0.5, W2 = Math.max(16, Math.round(canvas.width * s)), H2 = Math.max(16, Math.round(canvas.height * s));
      if (!MIR.fb) { MIR.fb = gl.createFramebuffer(); MIR.rb = gl.createRenderbuffer(); }
      if (MIR.w !== W2 || MIR.h !== H2) {
        if (!MIR.tex) { MIR.tex = gl.createTexture(); textures.push(MIR.tex); }
        gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, MIR.tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W2, H2, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); /* Einheit 5, nie Einheit 0 (dort liegt die Materialtextur) */
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindRenderbuffer(gl.RENDERBUFFER, MIR.rb); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, W2, H2); MIR.w = W2; MIR.h = H2;
      }
      gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, TEX0); gl.activeTexture(gl.TEXTURE0); /* keine Rückkopplung: Ziel nicht gleichzeitig als Textur gebunden */
      gl.bindFramebuffer(gl.FRAMEBUFFER, MIR.fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, MIR.tex, 0); gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, MIR.rb);
      gl.viewport(0, 0, W2, H2); gl.clearColor(0.05, 0.05, 0.06, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      var Rm = [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 2 * MIR.x, 0, 0, 1], Mr = mul(mm.m, Rm), ev = [2 * MIR.x - mm.e[0], mm.e[1], mm.e[2]];
      for (var i = 0; i < ord.length; i++) if (ord[i].name !== 'ENV' && ord[i].name !== 'BLD') drawSet(ord[i], Mr, ev, ms[i], expo, 1, { mode: 2, clip: [1, 0, 0, -MIR.x - 0.004], lm: ord[i].LM ? ord[i].LM(ps) : 0 });
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height); disableAttrs(); MIR.frames++;
    }
    function drawSky(o, Mx, e, expo) {
      gl.useProgram(PS); attr(PS, 'p', o.p, 3); gl.uniformMatrix4fv(U(PS, 'm'), false, Mx); gl.uniform3fv(U(PS, 'eye'), e); gl.uniform1f(U(PS, 'expo'), expo);
      gl.disable(gl.BLEND); gl.drawArrays(gl.TRIANGLES, 0, o.nm);
    }
    var curProbe = null, mirOn = false, NOCLIP = [0, 0, 0, 1];
    /* o.x: {mode, clip, lm} – Sonderdurchgänge (Reflexionsaufnahme, Spiegelbild) */
    function drawSet(o, Mx, e, mdl, expo, ein, x) {
      x = x || {}; var mode = x.mode || 0, pb = mode === 1 ? null : curProbe;
      gl.useProgram(PM); attr(PM, 'p', o.p, 3); attr(PM, 'n', o.n, 3); attr(PM, 'c', o.c, 3); attr(PM, 'em', o.em, 2); attr(PM, 'lt', o.lt, 3); attr(PM, 'lt2', o.lt2, 3); attr(PM, 'sl', o.sl, 4); attr(PM, 'sc', o.sc, 3);
      gl.uniformMatrix4fv(U(PM, 'm'), false, Mx); gl.uniformMatrix4fv(U(PM, 'mdl'), false, mdl); gl.uniform3fv(U(PM, 'eye'), e); gl.uniform1f(U(PM, 'sw'), sweep); gl.uniform1f(U(PM, 'expo'), expo); gl.uniform1f(U(PM, 'ein'), ein);
      gl.uniform1f(U(PM, 'lm'), x.lm !== undefined ? x.lm : (o.LM ? o.LM(ps) : 0)); gl.uniform1f(U(PM, 'mode'), mode); gl.uniform4fv(U(PM, 'clip'), x.clip || NOCLIP);
      gl.uniform1i(U(PM, 't1'), 0); gl.uniform1i(U(PM, 't2'), 1); gl.uniform1i(U(PM, 'lut'), 3); gl.uniform1i(U(PM, 'pr'), 4); gl.uniform1i(U(PM, 'mr'), 5);
      gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_CUBE_MAP, pb && pb.tex ? pb.tex : CUBE0); gl.activeTexture(gl.TEXTURE0);
      gl.uniform1f(U(PM, 'hasPr'), pb && pb.tex ? 1 : 0); if (pb) { gl.uniform3fv(U(PM, 'prC'), pb.c); gl.uniform3fv(U(PM, 'prA'), pb.a); gl.uniform3fv(U(PM, 'prB'), pb.b); }
      gl.uniform4f(U(PM, 'mrv'), 1 / canvas.width, 1 / canvas.height, mode === 0 && mirOn ? 1 : 0, 0);
      gl.disable(gl.BLEND); gl.depthMask(true);
      if (o.ranges && !win.IR_NO_CULL) { var F = frustumOf(Mx), st0 = -1, en = -1;
        for (var r = 0; r < o.ranges.length; r++) { var R = o.ranges[r]; if (!boxIn(F, R.mn, R.mx)) continue; cullStats.drawn += R.n;
          if (R.s === en) en += R.n; else { if (st0 >= 0) gl.drawArrays(gl.TRIANGLES, st0, en - st0); st0 = R.s; en = R.s + R.n; } }
        if (st0 >= 0) gl.drawArrays(gl.TRIANGLES, st0, en - st0); cullStats.total += o.nm;
      } else gl.drawArrays(gl.TRIANGLES, 0, o.nm);
    }
    function drawLines(o, Mx, e, mdl, hi) {
      if (!o.nl) return;
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
      gl.useProgram(PL); attr(PL, 'p', o.lp, 3); attr(PL, 'wt', o.lw, 1); gl.uniformMatrix4fv(U(PL, 'm'), false, Mx); gl.uniformMatrix4fv(U(PL, 'mdl'), false, mdl); gl.uniform3fv(U(PL, 'eye'), e); gl.uniform3fv(U(PL, 'ev'), e); gl.uniform1f(U(PL, 'sw'), sweep); gl.uniform1f(U(PL, 'hi'), hi); gl.uniform1f(U(PL, 'lb'), 0);
      gl.drawArrays(gl.LINES, 0, o.nl); gl.depthMask(true); gl.disable(gl.BLEND);
    }
    var hiNow = 0, expoCur = -1, windT = 0;
    /* Reihenfolge gegen Überzeichnen: Nahes zuerst, Wiese/Ferne danach, Himmel zuletzt (nur freie Pixel), dann Glas und Lichthöfe */
    var ORDER_OUT = ['BLD', 'D', 'TT', 'INT', 'A', 'ENV'], ORDER_IN = ['INT', 'A', 'D', 'TT', 'BLD', 'ENV'];
    function bindTex() {
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, TX.t1 || TX.n1);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, TX.t2 || TX.n1);
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, TX.lb || TX.n1);
      gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, LUT);
      gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_CUBE_MAP, CUBE0);
      gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, MIR.tex || TEX0);
      gl.activeTexture(gl.TEXTURE0);
    }
    var drawCount = 0;
    function draw() {
      drawCount++; cullStats.drawn = 0; cullStats.total = 0;
      var mm = matrix(ps), Mx = mm.m, ein = mm.ins > 0.5 ? 1 : 0, expo = expoCur > 0 ? expoCur : expoTarget(mm.ins), q = ps;
      var by = {}; sets.forEach(function (o) { by[o.name] = o; });
      /* Reflexionsaufnahme des Raums, in dem die Kamera steht (einmalig erzeugt) */
      curProbe = camOverride && camOverride.noProbe ? null : probeFor(mm.e); if (curProbe && !curProbe.tex) { bindTex(); captureProbe(curProbe); }
      var ord = (mm.ins > 0.5 ? ORDER_IN : ORDER_OUT).map(function (n) { return by[n]; }), ms = ord.map(function (o) { return o.M ? o.M(q) : I4; });
      bindTex();
      mirOn = mirrorVisible(mm); if (mirOn) { renderMirror(mm, ord, ms, expo); gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, MIR.tex); gl.activeTexture(gl.TEXTURE0); }
      gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
      for (var i = 0; i < ord.length; i++) drawSet(ord[i], Mx, mm.e, ms[i], expo, ein);
      disableAttrs();
      var X = extra;
      if (X.gz.nm) {
        gl.useProgram(PG); attr(PG, 'p', X.gz.p, 3); attr(PG, 'n', X.gz.n, 3); attr(PG, 'wc', X.gz.wc, 4); attr(PG, 'ws', X.gz.ws, 4);
        gl.uniformMatrix4fv(U(PG, 'm'), false, Mx); gl.uniform3fv(U(PG, 'eye'), mm.e); gl.uniform1f(U(PG, 'expo'), expo); gl.drawArrays(gl.TRIANGLES, 0, X.gz.nm); disableAttrs();
      }
      if (X.fol.nm && TX.lb) {
        gl.useProgram(PF); attr(PF, 'p', X.fol.p, 3); attr(PF, 'uv', X.fol.uv, 2); attr(PF, 'c', X.fol.c, 3); attr(PF, 'wv', X.fol.wv, 2); attr(PF, 'lt', X.fol.lt, 3);
        gl.uniformMatrix4fv(U(PF, 'm'), false, Mx); gl.uniform3fv(U(PF, 'eye'), mm.e); gl.uniform1f(U(PF, 'expo'), expo); gl.uniform1f(U(PF, 'tw'), windT); gl.uniform1f(U(PF, 'wa'), RMQ.matches ? 0 : 1); gl.uniform1i(U(PF, 'tl'), 2);
        if (A2C) gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);
        gl.drawArrays(gl.TRIANGLES, 0, X.fol.nm); if (A2C) gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE); disableAttrs();
      }
      gl.depthMask(false); drawSky(by.SKY, Mx, mm.e, expo); disableAttrs();
      /* durchsichtiges Glas nach dem Himmel (sonst überschreibt der Himmel das Glas), ohne Tiefe zu schreiben;
         Scheiben von hinten nach vorn sortiert (keine Sortierfehler bei hintereinanderliegendem Glas) */
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.useProgram(PT);
      gl.uniformMatrix4fv(U(PT, 'm'), false, Mx); gl.uniform3fv(U(PT, 'eye'), mm.e); gl.uniform1f(U(PT, 'expo'), expo); gl.uniform1i(U(PT, 'pr'), 4);
      gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_CUBE_MAP, curProbe && curProbe.tex ? curProbe.tex : CUBE0); gl.activeTexture(gl.TEXTURE0);
      gl.uniform1f(U(PT, 'hasPr'), curProbe && curProbe.tex ? 1 : 0); if (curProbe) { gl.uniform3fv(U(PT, 'prC'), curProbe.c); gl.uniform3fv(U(PT, 'prA'), curProbe.a); gl.uniform3fv(U(PT, 'prB'), curProbe.b); }
      X.tg.forEach(function (g) {
        if (!g.nm) return; attr(PT, 'p', g.p, 3); attr(PT, 'n', g.n, 3); gl.uniformMatrix4fv(U(PT, 'mdl'), false, g.M ? g.M(q) : I4);
        if (g.panes) { g.panes.sort(function (a, b) { return dist2(b.c, mm.e) - dist2(a.c, mm.e); }); g.panes.forEach(function (pn) { gl.drawArrays(gl.TRIANGLES, pn.s, 6); }); }
        else gl.drawArrays(gl.TRIANGLES, 0, g.nm);
      });
      disableAttrs();
      if (X.hal.nm) {
        gl.blendFunc(gl.ONE, gl.ONE); gl.useProgram(PH_); attr(PH_, 'p', X.hal.p, 3); attr(PH_, 'q', X.hal.q, 3); attr(PH_, 'c', X.hal.c, 3);
        gl.uniformMatrix4fv(U(PH_, 'm'), false, Mx); gl.uniform3fv(U(PH_, 'eye'), mm.e); gl.uniform3fv(U(PH_, 'cx'), mm.rx); gl.uniform3fv(U(PH_, 'cy'), mm.uy); gl.uniform1f(U(PH_, 'expo'), expo);
        gl.drawArrays(gl.TRIANGLES, 0, X.hal.nm); disableAttrs();
      }
      gl.disable(gl.BLEND); gl.depthMask(true);
      if (scan.state === 'run' || hiNow > 0.001) { for (i = 0; i < ord.length; i++) drawLines(ord[i], Mx, mm.e, ms[i], hiNow); disableAttrs(); }
      if (labels.length && root.classList.contains('jr-hi')) {
        var lx0 = 100, lx1 = 0, ly0 = 100, ly1 = 0;
        labels.forEach(function (l) { var p3 = project(Mx, l.w); l.el.style.setProperty('--x', p3[0].toFixed(2) + '%'); l.el.style.setProperty('--y', p3[1].toFixed(2) + '%'); l.el.classList.toggle('l', p3[0] > 62);
          lx0 = Math.min(lx0, p3[0]); lx1 = Math.max(lx1, p3[0]); ly0 = Math.min(ly0, p3[1]); ly1 = Math.max(ly1, p3[1]); });
        /* «Schematische Kennzeichnung» direkt unter (oder, wenn unten kein Platz, über) den Markierungen */
        if (capEl) { var cyv = ly1 + 7 < 92 ? ly1 + 7 : Math.max(8, ly0 - 7); capEl.style.setProperty('--cx', Math.max(14, Math.min(86, (lx0 + lx1) / 2)).toFixed(2) + '%'); capEl.style.setProperty('--cy', cyv.toFixed(2) + '%'); }
      }
      /* Leistungspunkte: nie über Stationstext, Navigation oder Bedienknöpfen (sonst ausgeblendet; die CTA bleibt) */
      var blk = null, sr = null;
      hots.forEach(function (l) {
        var p3 = project(Mx, l.w), vis = p3[2] > 0.2 && p3[0] > 2 && p3[0] < 96 && p3[1] > 6 && p3[1] < 94 && hotOn(l, q);
        if (vis) {
          if (!blk) { sr = stage.getBoundingClientRect(); blk = Array.prototype.map.call(root.querySelectorAll('.jr-st.on, .jr-nav, .jr-skip, .jr-steps, .jr-tag'), function (el) { return el.getBoundingClientRect(); }).filter(function (r) { return r.width > 0 && r.height > 0; }); }
          var px = sr.left + p3[0] / 100 * sr.width, py = sr.top + p3[1] / 100 * sr.height, lf = p3[0] > 72, x0 = lf ? px - 190 : px - 30, x1 = lf ? px + 30 : px + 190;
          blk.forEach(function (r) { if (x1 > r.left && x0 < r.right && py + 30 > r.top && py - 30 < r.bottom) vis = false; });
        }
        /* rechts im Bild steht die Beschriftung links vom Punkt (bleibt im Bild) */
        l.el.classList.toggle('l', p3[0] > 72);
        l.el.style.setProperty('--x', p3[0].toFixed(2) + '%'); l.el.style.setProperty('--y', p3[1].toFixed(2) + '%'); l.el.classList.toggle('on', vis);
      });
    }
    function dist2(a, b) { var x = a[0] - b[0], y = a[1] - b[1], z = a[2] - b[2]; return x * x + y * y + z * z; }
    /* Renderauflösung: Gerätepixel begrenzt (max. 1,5), bei langsamen Bildern adaptiv bis 0,5 reduziert */
    var rs = 1, ft = [], rsLock = false;
    function resize() { if (!stage) return; var r = stage.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height); if (canvas) { canvas.width = Math.max(1, Math.round(w * dpr * rs)); canvas.height = Math.max(1, Math.round(h * dpr * rs)); } if (gl) gl.viewport(0, 0, canvas.width, canvas.height); }
    function adapt(dt) {
      if (rsLock) return; ft.push(dt); if (ft.length < 5) return; var avg = ft.reduce(function (a, b) { return a + b; }, 0) / ft.length; ft = [];
      if (avg > 45 && rs > 0.5) { rs = Math.max(0.5, rs * 0.75); resize(); } else if (avg < 20 && rs < 1) { rs = Math.min(1, rs / 0.85); resize(); }
    }
    function easeIO(k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
    /* Belichtung: drinnen (warm, hell beleuchtet) etwas knapper als draussen in der Dämmerung; der Wechsel geschieht
       weich über ≈0,45 s wie bei einer Kamera-Belichtungsautomatik (bei «Bewegung reduzieren» sofort) */
    function expoTarget(ins) { return 1.0 - 0.15 * ins; }
    /* Wind: nur wenn Aussenraum im Bild, nicht bei «Bewegung reduzieren», höchstens 30 Bilder/s und nur bis
       WIND.idleMs nach der letzten Eingabe – danach steht die Szene still und rendert nicht mehr */
    var WIND = C.wind || { idleMs: 15000, maxFps: 30 }, lastInput = 0, lastDraw = 0;
    function windOn(now) { return !!(TX.lb && extra && extra.fol.nm && !RMQ.matches && insideAmt(camNow(ps).e) < 0.5 && now - lastInput < WIND.idleMs); }
    function poke() { lastInput = win.performance.now(); if (running) request(); }
    function step(now) {
      raf = 0; if (!running) return; if (!show()) { lastT = 0; return; } /* V17.1: kein Bild mehr, wenn die Szene inzwischen unsichtbar ist */ var need = dirty, more = false; dirty = false; var d = p - ps; var raw = lastT ? now - lastT : 0, dt = lastT ? Math.min(100, raw) : 16; lastT = now;
      /* Texturen: das erste 3D-Bild höchstens 1,5 s auf die Materialtexturen warten lassen (bis dahin bleibt das Standbild) */
      if (!ready && TX.state === 'loading' && Date.now() - TX.t0 < 1500) { dirty = true; cont(); return; }
      /* zeitbasierte Glättung: unabhängig von der Bildrate, kein langes Hinterherlaufen */
      if (Math.abs(d) > 0.0004) { ps += d * (1 - Math.exp(-dt / tau)); need = true; } else if (d !== 0) { ps = p; need = true; }
      if (Math.abs(p - ps) < 0.002) tau = C.smoothing.tauMs;
      /* Scan-Kante: einmalig, 1,2 s, weich beschleunigt und abgebremst */
      if (scan.state === 'wait' && now >= scan.start) scan.state = 'run';
      if (scan.state === 'wait') more = true;
      if (scan.state === 'run') { var k = (now - scan.start) / SCAN_MS; if (k >= 1) { scan.state = 'done'; scan.end = now; sweep = 1e4; } else { sweep = -8 + easeIO(k) * 30; } need = true; }
      /* Hervorhebung am Waschtisch: 0,28 s ein, 1,4 s halten, 0,9 s aus – bei jedem neuen Betreten des Bads */
      /* V17: Beschriftung nach der tatsächlichen Kameraposition (ps) – nicht schon während der Fahrt durch andere Räume */
      var ha = hiAmt(ps), hOld = hiNow; hiNow = 0; if (mode !== 'static') root.classList.toggle('jr-hi', ha > 0.4);
      if (ha < 0.1) { pulse.armed = true; pulse.t0 = 0; }
      else if (!RMQ.matches) {
        if (pulse.armed && ha > 0.5) { pulse.armed = false; pulse.t0 = now; }
        if (pulse.t0) { var tt = now - pulse.t0, env = tt < 280 ? tt / 280 : tt < 1680 ? 1 : Math.max(0, 1 - (tt - 1680) / 900); hiNow = ha * env * 0.95; pulse.last = hiNow; if (tt < 2600) more = true; }
      }
      if (hiNow !== hOld) need = true;
      /* Belichtung nachführen */
      var et = expoTarget(insideAmt(camNow(ps).e));
      if (expoCur < 0 || RMQ.matches) { if (expoCur !== et) need = true; expoCur = et; }
      else if (Math.abs(et - expoCur) > 0.002) { expoCur += (et - expoCur) * (1 - Math.exp(-(raw ? Math.min(1000, raw) : 16) / 450)); need = true; } /* zeitbasiert auch bei langsamen Bildern (sonst ≈20 Bilder Nachlauf) */ else if (expoCur !== et) { expoCur = et; need = true; }
      var windy = windOn(now);
      if (windy && now - lastDraw >= 1000 / WIND.maxFps - 2) need = true;
      if (need || !ready) {
        if (raw && lastDrew) adapt(raw);
        windT = now / 1000; draw(); lastDraw = now; lastDrew = true;
        if (!ready) { ready = true; root.classList.add('jr-ready'); }
      } else lastDrew = false;
      if (!visible || doc.hidden) { lastT = 0; return; }
      if (need || more) cont();
      /* nur Wind: nächstes Bild erst nach 1/maxFps planen (keine leeren Bildaufrufe dazwischen) */
      else if (windy) { if (!windTimer) windTimer = win.setTimeout(function () { windTimer = 0; cont(); }, Math.max(4, 1000 / WIND.maxFps - (win.performance.now() - lastDraw))); lastT = 0; }
      else lastT = 0;
    }
    var windTimer = 0;
    var lastDrew = false;
    /* request(): von aussen (Grösse, Kamera, Sichtbarkeit, Texturen …) → nächstes Bild sicher zeichnen.
       Die Fortsetzung innerhalb von step() (Glättung, Wind) plant ohne diese Markierung. */
    var dirty = true;
    /* V17.1: ausserhalb des Sichtbereichs bzw. bei verstecktem Tab wird nichts geplant – die Markierung bleibt und das
       nächste Bild entsteht, sobald IntersectionObserver/visibilitychange die Szene wieder sichtbar melden */
    /* zusätzlich synchron die Lage im Fenster prüfen: unabhängig davon, wann der IntersectionObserver meldet (bei langsamer
       Grafik kann das mehrere Bilder dauern) */
    function show() { if (!visible || doc.hidden) return false; var r = root.getBoundingClientRect(), vh = win.innerHeight || doc.documentElement.clientHeight; return r.bottom > 0 && r.top < vh && r.width > 0; }
    function request() { dirty = true; if (!raf && running && show()) raf = win.requestAnimationFrame(step); }
    function cont() { if (!raf && running && show()) raf = win.requestAnimationFrame(step); }

    /* ---------- HTML-Einblendungen und Ereignisse aus dem Fortschritt ---------- */
    function stationOf(q) { for (var i = 0; i < ST.length; i++) if (q < ST[i].b || i === ST.length - 1) return i; return 0; }
    function ui(q) {
      var i = stationOf(q);
      if (i !== lastSt) {
        lastSt = i; cur = i; root.dataset.st = i;
        root.querySelectorAll('.jr-st').forEach(function (el, j) { var on = j === i; el.classList.toggle('on', on); el.setAttribute('aria-hidden', String(!on)); if (on) el.removeAttribute('inert'); else el.setAttribute('inert', ''); });
        root.querySelectorAll('.jr-nav button').forEach(function (b, j) { b.classList.toggle('on', j === i); if (j === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
        /* V17: waagrecht scrollbare Stationsleiste (Smartphone) – aktive Station mittig sichtbar, ohne die Seite zu verschieben */
        var nvEl = root.querySelector('.jr-nav'), onB = root.querySelectorAll('.jr-nav button')[i];
        if (nvEl && onB && nvEl.scrollWidth > nvEl.clientWidth + 2) { var li = onB.parentNode, tl = li.offsetLeft - (nvEl.clientWidth - li.offsetWidth) / 2; try { nvEl.scrollTo({ left: Math.max(0, tl), behavior: RMQ.matches ? 'auto' : 'smooth' }); } catch (e2) { nvEl.scrollLeft = Math.max(0, tl); } }
        if (started) emit('station-change', { station: ST[i].k, index: i, progress: Math.round(q * 1000) / 1000 });
      }
      var bar = root.querySelector('.jr-bar i'); if (bar) bar.style.transform = 'scaleY(' + q.toFixed(4) + ')';
      if (mode !== 'static') syncDet(q);
    }
    function setProgress(q) { if (destroyed) return; q = Math.max(0, Math.min(1, q)); if (Math.abs(q - p) < 0.00001) return; p = q; lastInput = win.performance.now(); ui(q); if (running) request(); }
    function glide(q, ms) { tau = ms || C.smoothing.jumpTauMs; setProgress(q); }

    /* ---------- WebGL-Start, Fehler, Freigabe ---------- */
    function fail(code) {
      emit('tour-error', { code: code, fallback: 'stills' });
      stopGL(); setStatic();
    }
    function initGL() {
      if (!canvas) { return 'WEBGL_UNAVAILABLE'; }
      try { gl = canvas.getContext('webgl', { antialias: true, alpha: false, powerPreference: 'low-power' }); } catch (e) { gl = null; }
      if (!gl) return 'WEBGL_UNAVAILABLE';
      try {
        ensureBuilt();
        EXT.der = !!gl.getExtension('OES_standard_derivatives');
        EXT.an = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
        if (EXT.an) EXT.anMax = Math.min(8, gl.getParameter(EXT.an.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 1);
        /* Software-Grafik (z. B. SwiftShader, llvmpipe – Rechner ohne nutzbare GPU): ohne anisotrope Filterung,
           einfachere Mipmap-Filterung und Start mit 60 % Auflösung. Auf echten GPUs bleibt alles unverändert. */
        var rn = String(gl.getParameter(gl.RENDERER) || '');
        if (/^WebKit WebGL$/.test(rn)) { var dri = gl.getExtension('WEBGL_debug_renderer_info'); if (dri) rn = String(gl.getParameter(dri.UNMASKED_RENDERER_WEBGL) || rn); }
        EXT.sw = /swiftshader|llvmpipe|softpipe|software|basic render/i.test(rn);
        if (EXT.sw && !win.IR_FORCE_HQ) { EXT.an = null; EXT.anMax = 1; if (!rsLock) rs = 0.5; } else EXT.sw = EXT.sw ? 'hq' : false;
        var ca = gl.getContextAttributes(); A2C = !!(ca && ca.antialias) && (gl.getParameter(gl.SAMPLES) || 0) > 1;
        PM = EXT.sw === true ? prog(VSML, FSM(false, true)) : prog(VSM, FSM(EXT.der, false)); PL = prog(VSL, FSL); PS = prog(VSS, FSS); PG = prog(VSG, FSG); PF = prog(VSF, FSF(EXT.der, A2C)); PH_ = prog(VSH, FSH); PT = prog(VST, FST);
        NATTR = Math.min(8, gl.getParameter(gl.MAX_VERTEX_ATTRIBS) || 8);
        TX.n1 = mkTex(1, new Uint8Array([128, 128, 128, 128]));
      } catch (e) { if (win.console) win.console.warn('ImmoReady-Rundgang:', e && e.message); return 'WEBGL_INIT_FAILED'; }
      LUT = mkLut(); CUBE0 = mkCube(1); TEX0 = mkTex(1, new Uint8Array([20, 20, 22, 255]));
      sets = [upload(G, null, null, 4), upload(INT, null, null, 3), upload(ENV, null, null, 30), upload(D, doorM, function (q) { return doorAngle(q) / D_HT.angle; }), upload(A, aptM, function (q) { return aptAngle(q) / D_WT.angle; }), upload(TT, terM, function (q) { return terSlide(q) / D_TT.slide; }), upload(SKY)];
      extra = {
        gz: { p: vbo(GZ.P), n: vbo(GZ.N), wc: vbo(GZ.WC), ws: vbo(GZ.WS), nm: GZ.P.length / 3 },
        fol: { p: vbo(FOL.P), uv: vbo(FOL.U), c: vbo(FOL.C), wv: vbo(FOL.WV), lt: vbo(FOL.L), nm: FOL.P.length / 3 },
        hal: { p: vbo(HAL.P), q: vbo(HAL.Q), c: vbo(HAL.C), nm: HAL.P.length / 3 },
        tg: [[TG, null], [TGD, doorM], [TGT, terM]].map(function (x) {
          var P = x[0].P, panes = []; for (var s0 = 0; s0 < P.length / 3; s0 += 6) { var c = [0, 0, 0]; for (var k = 0; k < 6; k++) { c[0] += P[(s0 + k) * 3] / 6; c[1] += P[(s0 + k) * 3 + 1] / 6; c[2] += P[(s0 + k) * 3 + 2] / 6; } panes.push({ s: s0, c: c }); }
          return { p: vbo(P), n: vbo(x[0].N), nm: P.length / 3, M: x[1], panes: x[1] ? null : panes };
        })
      };
      if (TX.imgs) uploadTex();
      labels = Array.prototype.map.call(stage.querySelectorAll('[data-w]'), function (el) { return { el: el, w: el.dataset.w.split(',').map(Number) }; });
      capEl = stage.querySelector('.jr-tech-c');
      hots = Array.prototype.map.call(stage.querySelectorAll('[data-hot]'), function (el) { return { el: el, w: el.dataset.hot.split(',').map(Number), st: +el.dataset.st }; });
      var weak = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.deviceMemory && navigator.deviceMemory <= 4);
      dpr = Math.min(win.devicePixelRatio || 1, weak ? 1 : 1.5); resize(); running = true; ps = p; expoCur = -1; lastInput = win.performance.now();
      if (win.ResizeObserver) { ro = new win.ResizeObserver(function () { resize(); request(); }); ro.observe(stage); }
      if (win.IntersectionObserver) { io = new win.IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) request(); else if (windTimer) { win.clearTimeout(windTimer); windTimer = 0; } }); io.observe(root); }
      on(doc, 'visibilitychange', function () { if (!doc.hidden) request(); else if (windTimer) { win.clearTimeout(windTimer); windTimer = 0; } });
      on(canvas, 'webglcontextlost', function (e) { e.preventDefault(); if (!destroyed) fail('WEBGL_CONTEXT_LOST'); });
      /* Scan nur beim ersten Start auf der Gesamtansicht und ohne «Bewegung reduzieren» */
      if (scan.count === 0 && !RMQ.matches && p < ST[0].b) { scan.count = 1; scan.state = 'wait'; scan.start = win.performance.now() + SCAN_DELAY; sweep = -8; }
      else { scan.state = 'done'; sweep = 1e4; }
      request();
      return null;
    }
    function stopGL() {
      running = false; if (raf) { win.cancelAnimationFrame(raf); raf = 0; } if (windTimer) { win.clearTimeout(windTimer); windTimer = 0; }
      if (ro) { ro.disconnect(); ro = null; } if (io) { io.disconnect(); io = null; }
      if (gl) {
        try {
          buffers.forEach(function (b) { gl.deleteBuffer(b); }); textures.forEach(function (t) { gl.deleteTexture(t); });
          progs.forEach(function (q) { gl.deleteProgram(q); }); shaders.forEach(function (s) { gl.deleteShader(s); });
          if (probeFB) gl.deleteFramebuffer(probeFB); if (probeRB) gl.deleteRenderbuffer(probeRB); if (MIR.fb) gl.deleteFramebuffer(MIR.fb); if (MIR.rb) gl.deleteRenderbuffer(MIR.rb);
          var ext = gl.getExtension('WEBGL_lose_context'); if (ext && !gl.isContextLost()) ext.loseContext();
        } catch (e) {}
      }
      probeFB = probeRB = null; probeN = 0; PROBES.forEach(function (pb) { pb.tex = null; }); MIR.fb = MIR.rb = MIR.tex = null; MIR.w = MIR.h = 0; LUT = CUBE0 = TEX0 = null; curProbe = null;
      buffers = []; shaders = []; textures = []; progs = []; sets = []; extra = null; gl = null; PM = PL = PS = PG = PF = PH_ = PT = null; TX.t1 = TX.t2 = TX.lb = TX.n1 = null; ready = false; root.classList.remove('jr-ready');
      if (scan.state !== 'done') { scan.state = 'done'; sweep = 1e4; }
    }

    /* ---------- Modi: Standbilder, Stationen, Scroll ---------- */
    function showStill(i) { cur = i; ui(ST[i].hold); root.querySelectorAll('.jr-still').forEach(function (im, j) { im.classList.toggle('on', j === i); }); root.querySelectorAll('.jr-det [data-det]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.detI === '-1')); }); }
    function setStatic() { mode = 'static'; root.classList.add('jr-static'); root.classList.remove('jr-live', 'jr-button'); showStill(cur); }
    function scrollProg() { var r = root.getBoundingClientRect(); var span = root.offsetHeight - win.innerHeight; return span > 0 ? (-r.top) / span : 0; }
    function goStation(i) {
      if (destroyed) return; i = Math.max(0, Math.min(ST.length - 1, i | 0)); var q = ST[i].hold; cur = i;
      if (mode === 'live') { var top = root.getBoundingClientRect().top + win.scrollY; var span = root.offsetHeight - win.innerHeight; glide(q, C.smoothing.jumpTauMs); win.scrollTo({ top: Math.round(top + q * span + (i === ST.length - 1 ? -2 : 0)), behavior: 'instant' }); }
      else if (mode === 'button') { glide(q, RMQ.matches ? 1 : C.smoothing.stepsTauMs); }
      else showStill(i);
    }
    function currentIndex() { return mode === 'static' ? cur : stationOf(p); }
    /* Nahansichten einer Station (rise.json → details): 3D fährt zum Fortschritt q, im Bildmodus wechselt das Bild */
    function goDetail(btn) {
      if (destroyed) return; var q = +btn.dataset.det, k = +btn.dataset.detI, grp = btn.closest('.jr-det');
      if (grp) grp.querySelectorAll('[data-det]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      if (mode === 'live') { var top = root.getBoundingClientRect().top + win.scrollY, span = root.offsetHeight - win.innerHeight; glide(q, C.smoothing.jumpTauMs); win.scrollTo({ top: Math.round(top + q * span), behavior: 'instant' }); }
      else if (mode === 'button') glide(q, RMQ.matches ? 1 : C.smoothing.stepsTauMs);
      else root.querySelectorAll('.jr-still').forEach(function (im, j) { im.classList.toggle('on', k < 0 ? j === cur : im.dataset.detStill === String(k)); });
    }
    function syncDet(q) {
      var best = null, bd = 0.012; root.querySelectorAll('.jr-st.on [data-det]').forEach(function (b) { var d = Math.abs(+b.dataset.det - q); if (d < bd) { bd = d; best = b; } });
      if (best) root.querySelectorAll('.jr-st.on [data-det]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === best)); });
    }
    /* Auswahl in der Wohnung (Reinigung · Räumung · Leerstand): Klick, Tastatur, Touch – Text immer sichtbar */
    function choose(btn, focus) {
      var g = btn.closest('.jr-choice'); if (!g) return; var key = btn.dataset.choice; if (SERVICES.indexOf(key) < 0) return;
      g.querySelectorAll('[data-choice]').forEach(function (b) { var onB = b === btn; b.setAttribute('aria-checked', String(onB)); b.tabIndex = onB ? 0 : -1; b.classList.toggle('on', onB); });
      g.querySelectorAll('[data-choice-text]').forEach(function (t) { t.hidden = t.dataset.choiceText !== key; });
      var cta = g.querySelector('[data-choice-cta]'); if (cta) { cta.dataset.pre = key; var lab = cta.querySelector('.jr-cl'); if (lab) lab.textContent = btn.dataset.cta || lab.textContent; }
      if (focus) btn.focus();
    }
    function skipTour() {
      var r = root.getBoundingClientRect(), y = r.bottom + win.scrollY;
      win.scrollTo({ top: Math.round(y), behavior: RMQ.matches ? 'instant' : 'smooth' });
    }
    on(root, 'click', function (e) {
      var ch = e.target.closest('[data-choice]'); if (ch && root.contains(ch)) { e.preventDefault(); choose(ch, false); return; }
      var dtb = e.target.closest('[data-det]'); if (dtb && root.contains(dtb)) { e.preventDefault(); goDetail(dtb); return; }
      var g = e.target.closest('[data-go]'); if (g && root.contains(g)) { e.preventDefault(); goStation(+g.dataset.go); return; }
      var s = e.target.closest('[data-step]'); if (s && root.contains(s)) { e.preventDefault(); goStation(currentIndex() + (+s.dataset.step)); return; }
      var sk = e.target.closest('[data-skip]'); if (sk && root.contains(sk)) { e.preventDefault(); skipTour(); return; }
      var ct = e.target.closest('a[data-contact]');
      if (ct && root.contains(ct)) {
        var dc = { station: ST[currentIndex()].k, source: 'tour', version: C.eventsVersion };
        emit('request-contact', dc);
        if (opts.interceptContact && opts.interceptContact(dc)) { e.preventDefault(); e.stopPropagation(); }
        return;
      }
      var a = e.target.closest('a[href="#offerte"]');
      if (a && root.contains(a)) {
        var svc = a.dataset.pre || ''; if (svc && SERVICES.indexOf(svc) < 0) svc = '';
        var detail = { service: svc, station: ST[currentIndex()].k, source: 'tour', version: C.eventsVersion };
        emit('request-quote', detail);
        if (opts.interceptQuote && opts.interceptQuote(detail)) { e.preventDefault(); e.stopPropagation(); }
      }
    });
    on(root, 'keydown', function (e) {
      var d = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 0;
      var og = e.target.closest && e.target.closest('.jr-choice-opts');
      if (og && (d || e.key === 'Home' || e.key === 'End')) {
        var bs = Array.prototype.slice.call(og.querySelectorAll('[data-choice]')), k = bs.indexOf(e.target.closest('[data-choice]'));
        var n = e.key === 'Home' ? 0 : e.key === 'End' ? bs.length - 1 : (k + d + bs.length) % bs.length;
        e.preventDefault(); choose(bs[n], true); return;
      }
      if (mode === 'live' || !e.target.closest('.jr-nav') || !d) return;
      e.preventDefault(); goStation(currentIndex() + d); var b = root.querySelectorAll('.jr-nav button')[cur]; if (b) b.focus();
    });
    /* Eingaben halten den Wind kurz am Leben (danach steht die Szene still) */
    ['pointermove', 'pointerdown', 'wheel', 'keydown', 'touchstart'].forEach(function (ev) { on(root, ev, function () { if (running && win.performance.now() - lastInput > 250) poke(); }, { passive: true }); });
    if (reqMode === 'scroll') on(win, 'scroll', function () { /* V17.1: ausserhalb des Sichtbereichs ohne Bildanforderung (Fortschritt bleibt am Rand) */ if (!show()) { if (mode === 'live' && !scrollTick) setProgress(scrollProg()); return; } if (!scrollTick) { scrollTick = true; win.requestAnimationFrame(function () { scrollTick = false; if (mode === 'live') setProgress(scrollProg()); }); } }, { passive: true });
    function prefChange() { if (mode !== 'static' && (SMALL.matches || (RMQ.matches && reqMode === 'scroll'))) { stopGL(); setStatic(); } }
    onMQ(RMQ, prefChange); onMQ(SMALL, prefChange);

    /* Ereignisse erst nach dem Start: Listener (z. B. Velo in $w.onReady) verpassen nichts */
    function ready_(m) { started = true; emit('tour-ready', { version: C.version, mode: m }); var i = currentIndex(); emit('station-change', { station: ST[i].k, index: i, progress: Math.round((mode === 'static' ? ST[i].hold : p) * 1000) / 1000 }); }
    function start() {
      startTimer = 0; idleId = 0; if (destroyed) return;
      if (SMALL.matches || (RMQ.matches && reqMode === 'scroll')) { setStatic(); ready_('stills'); return; }
      /* Texturen und vorab gerechnetes Licht nur laden, wenn 3D wirklich startet (nicht auf Smartphones) */
      if (TX.state === 'none') loadTex();
      if (pbState === 'none') loadBake();
      /* lange Rechenarbeit in Etappen, damit Eingaben zwischendurch verarbeitet werden */
      if (!baked) { if (!buildStep()) { schedule(start); return; } }
      if (reqMode === 'scroll') { root.classList.add('jr-live'); mode = 'live'; } else { root.classList.add('jr-live', 'jr-button'); mode = 'button'; }
      root.classList.remove('jr-static');
      if (mode === 'live') { p = Math.max(0, Math.min(1, scrollProg())); ui(p); } else p = ST[cur].hold;
      var err = initGL();
      if (err) { stopGL(); setStatic(); emit('tour-error', { code: err, fallback: 'stills' }); ready_('stills'); return; }
      ps = p; ui(p);
      ready_('webgl');
    }

    /* Startzustand: Station 1 als Standbild + Text sofort; 3D danach */
    showStill(0);
    root.querySelectorAll('.jr-choice').forEach(function (g) { var f = g.querySelector('[data-choice][aria-checked="true"]') || g.querySelector('[data-choice]'); if (f) choose(f, false); });
    if (SMALL.matches || (RMQ.matches && reqMode === 'scroll')) setStatic();
    else root.classList.add('jr-live'), reqMode === 'steps' && root.classList.add('jr-button');
    function schedule(fn) { if (destroyed) return; if (win.requestIdleCallback) idleId = win.requestIdleCallback(fn, { timeout: 600 }); else startTimer = win.setTimeout(fn, 60); }
    if (opts.deferStart === false) { ensureBuilt(); start(); }
    else {
      var later = function () { schedule(start); };
      if (doc.readyState === 'complete') later(); else on(win, 'load', later, { once: true });
    }

    /* Routenprüfung: Abstand der Kamera zu allen Wänden und Möbeln entlang der ganzen Fahrt (interpoliert) */
    function checkRoute(n) {
      ensureGeo();
      var bad = [], r = C.routeClearance;
      for (var i = 0; i <= n; i++) { var q = i / n, e = camAt(q).e; WALLS.forEach(function (b, j) { if (e[0] > b[0] - r && e[0] < b[1] + r && e[1] > b[2] - r && e[1] < b[3] + r && e[2] > b[4] - r && e[2] < b[5] + r) bad.push([+q.toFixed(3), j]); }); }
      return bad;
    }
    /* Kennzahlen der Fahrt: grösste Drehung (Grad je 1 % Fortschritt), grösster Bildwinkel, Türdurchgänge */
    function routeStats(n) {
      var maxRot = 0, maxRotAt = 0, maxFov = 0, prev = null, passes = [];
      for (var i = 0; i <= n; i++) {
        var q = i / n, c = camAt(q);
        if (prev) {
          var dYaw = Math.abs(c.yaw - prev.yaw), dPit = Math.abs(c.pitch - prev.pitch), rot = Math.hypot(dYaw * Math.cos(c.pitch), dPit) * 180 / Math.PI * (n / 100);
          if (rot > maxRot) { maxRot = rot; maxRotAt = q; }
          var a = prev.e, b = c.e;
          if ((a[2] - 5.5) * (b[2] - 5.5) <= 0 && Math.abs(b[0]) < 1.5) passes.push({ door: 'haustuer', p: +q.toFixed(4), deg: Math.round(doorAngle(q) * 180 / Math.PI) });
          if ((a[0] - 3) * (b[0] - 3) <= 0 && b[2] > 2.3 && b[2] < 4.3) passes.push({ door: 'wohnungstuer', p: +q.toFixed(4), deg: Math.round(aptAngle(q) * 180 / Math.PI) });
          if ((a[2] - 5.5) * (b[2] - 5.5) <= 0 && b[0] > 5.5 && b[0] < 9) passes.push({ door: 'terrassentuer', p: +q.toFixed(4), slide: +terSlide(q).toFixed(3) });
        }
        maxFov = Math.max(maxFov, c.f); prev = c;
      }
      return { maxRotDegPerPercent: +maxRot.toFixed(1), at: +maxRotAt.toFixed(3), maxFovDeg: +(maxFov * 180 / Math.PI).toFixed(1), passes: passes };
    }
    /* Nahebene statt nur Kameramittelpunkt: Ecken und Kantenmitten der Nahebene (aus der inversen Bildmatrix, inkl.
       Objektivverschiebung) gegen alle Kollisionskörper und die bewegten Türflügel (orientierte Box im Türsystem).
       Liefert den kleinsten Abstand der Nahebene zu Geometrie; < 0 hiesse: eine Wand wird angeschnitten. */
    function inv4(m) {
      var a = m, o = new Array(16), b00 = a[0] * a[5] - a[1] * a[4], b01 = a[0] * a[6] - a[2] * a[4], b02 = a[0] * a[7] - a[3] * a[4], b03 = a[1] * a[6] - a[2] * a[5], b04 = a[1] * a[7] - a[3] * a[5], b05 = a[2] * a[7] - a[3] * a[6],
        b06 = a[8] * a[13] - a[9] * a[12], b07 = a[8] * a[14] - a[10] * a[12], b08 = a[8] * a[15] - a[11] * a[12], b09 = a[9] * a[14] - a[10] * a[13], b10 = a[9] * a[15] - a[11] * a[13], b11 = a[10] * a[15] - a[11] * a[14];
      var d = 1 / (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);
      o[0] = (a[5] * b11 - a[6] * b10 + a[7] * b09) * d; o[1] = (a[2] * b10 - a[1] * b11 - a[3] * b09) * d; o[2] = (a[13] * b05 - a[14] * b04 + a[15] * b03) * d; o[3] = (a[10] * b04 - a[9] * b05 - a[11] * b03) * d;
      o[4] = (a[6] * b08 - a[4] * b11 - a[7] * b07) * d; o[5] = (a[0] * b11 - a[2] * b08 + a[3] * b07) * d; o[6] = (a[14] * b02 - a[12] * b05 - a[15] * b01) * d; o[7] = (a[8] * b05 - a[10] * b02 + a[11] * b01) * d;
      o[8] = (a[4] * b10 - a[5] * b08 + a[7] * b06) * d; o[9] = (a[1] * b08 - a[0] * b10 - a[3] * b06) * d; o[10] = (a[12] * b04 - a[13] * b02 + a[15] * b00) * d; o[11] = (a[9] * b02 - a[8] * b04 - a[11] * b00) * d;
      o[12] = (a[5] * b07 - a[4] * b09 - a[6] * b06) * d; o[13] = (a[0] * b09 - a[1] * b07 + a[2] * b06) * d; o[14] = (a[13] * b01 - a[12] * b03 - a[14] * b00) * d; o[15] = (a[8] * b03 - a[9] * b01 + a[10] * b00) * d;
      return o;
    }
    function checkFrustum(n) {
      ensureGeo();
      function aabb(S) { var lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (var i = 0; i < S.P.length; i += 3) for (var k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], S.P[i + k]); hi[k] = Math.max(hi[k], S.P[i + k]); } return [lo, hi]; }
      function bd(p, lo, hi) { var dx = Math.max(lo[0] - p[0], 0, p[0] - hi[0]), dy = Math.max(lo[1] - p[1], 0, p[1] - hi[1]), dz = Math.max(lo[2] - p[2], 0, p[2] - hi[2]); if (dx || dy || dz) return Math.hypot(dx, dy, dz); return -Math.min(p[0] - lo[0], hi[0] - p[0], p[1] - lo[1], hi[1] - p[1], p[2] - lo[2], hi[2] - p[2]); }
      function loc(M, p) { var x = p[0] - M[12], y = p[1] - M[13], z = p[2] - M[14]; return [M[0] * x + M[1] * y + M[2] * z, M[4] * x + M[5] * y + M[6] * z, M[8] * x + M[9] * y + M[10] * z]; }
      var movers = [[D, doorM], [A, aptM], [TT, terM]].map(function (x) { return { b: aabb(x[0]), M: x[1] }; });
      var sw = w, sh = h; if (!w || !h) { w = 1440; h = 900; }
      var min = 1e9, at = 0, what = '', hits = [];
      for (var i = 0; i <= n; i++) {
        var q = i / n, mx = matrix(q), iv = inv4(mx.m), pts = [];
        [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, -1], [0, 1], [-1, 0], [1, 0], [0, 0]].forEach(function (c) { var x = c[0], y = c[1], z = -1; var X = iv[0] * x + iv[4] * y + iv[8] * z + iv[12], Y = iv[1] * x + iv[5] * y + iv[9] * z + iv[13], Z = iv[2] * x + iv[6] * y + iv[10] * z + iv[14], W = iv[3] * x + iv[7] * y + iv[11] * z + iv[15]; pts.push([X / W, Y / W, Z / W]); });
        pts.forEach(function (pt) {
          WALLS.forEach(function (b, j) { var d = bd(pt, [b[0], b[2], b[4]], [b[1], b[3], b[5]]); if (d < min) { min = d; at = q; what = 'Körper ' + j; } if (d < 0.0) hits.push([+q.toFixed(4), 'Körper ' + j]); });
          movers.forEach(function (mv, j) { var M = mv.M(q), d = bd(loc(M, pt), mv.b[0], mv.b[1]); if (d < min) { min = d; at = q; what = ['Haustür', 'Wohnungstür', 'Terrassentür'][j]; } if (d < 0.0) hits.push([+q.toFixed(4), ['Haustür', 'Wohnungstür', 'Terrassentür'][j]]); });
        });
      }
      w = sw; h = sh;
      return { minClearM: +min.toFixed(3), at: +at.toFixed(4), nearest: what, hits: hits.slice(0, 20), samples: n + 1 };
    }
    function destroy() {
      if (destroyed) return; destroyed = true;
      if (idleId && win.cancelIdleCallback) win.cancelIdleCallback(idleId); if (startTimer) win.clearTimeout(startTimer);
      stopGL(); disposers.splice(0).forEach(function (f) { try { f(); } catch (e) {} });
      root.classList.remove('jr-live', 'jr-button', 'jr-static', 'jr-hi', 'jr-ready');
    }

    return {
      goStation: goStation, setProgress: setProgress, glide: glide, destroy: destroy,
      progress: function () { return p; }, mode: function () { return mode; }, station: function () { return currentIndex(); },
      jump: function (q) { p = ps = q; expoCur = -1; if (scan.state !== 'done') { scan.state = 'done'; } sweep = 1e4; ui(q); if (running) request(); },
      ui: ui, stationOf: stationOf, checkRoute: checkRoute, checkFrustum: checkFrustum, routeStats: routeStats, camAt: camAt, doorAngle: doorAngle, aptAngle: aptAngle, terSlide: terSlide,
      /* Messung: n Bilder an Position q synchron zeichnen (readPixels), mittlere Dauer in ms – für den Testbericht */
      bench: function (q, n) { if (!gl) return null; var o = ps; ps = q; var px = new Uint8Array(4); draw(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); var t0 = win.performance.now(); for (var i = 0; i < n; i++) { draw(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); } var ms = (win.performance.now() - t0) / n; ps = o; draw(); return { ms: +ms.toFixed(1), px: canvas.width * canvas.height, scale: rs }; },
      bakeAt: function (q, n, m) { ensureBuilt(); return bakeOne(q, n, m || 0); },
      /* Prüfhilfen: Weltpunkt → Bildschirm in % (aktuelle Kamera inkl. Objektivverschiebung); Bildstatistik des aktuellen Bilds */
      project: function (v) { if (!w || !h) return null; var q = project(matrix(ps).m, v); return [+q[0].toFixed(3), +q[1].toFixed(3)]; },
      frameStats: function () {
        if (!gl) return null; draw(); var W2 = canvas.width, H2 = canvas.height, px = new Uint8Array(W2 * H2 * 4); gl.readPixels(0, 0, W2, H2, gl.RGBA, gl.UNSIGNED_BYTE, px);
        var n = W2 * H2, sum = 0, clip = 0; for (var i = 0; i < n; i++) { var r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2]; sum += 0.2126 * r + 0.7152 * g + 0.0722 * b; if (r >= 253 && g >= 253 && b >= 253) clip++; }
        return { mean: +(sum / n / 255).toFixed(3), clipped: +(clip / n).toFixed(5), w: W2, h: H2 };
      },
      /* Prüfhilfen V15: Mischwert des Türlichts (0 = zu gebacken, 1 = offen gebacken) · Bildstabilität (zwei Bilder bei
         gleicher Kamera und gleicher Windzeit, mittlere absolute Differenz 0…1) · Leuchtenanteil eines Wandpunkts */
      doorLight: function (q) { return Math.max(0, Math.min(1, doorAngle(q) / D_HT.angle)); },
      frameDiff: function () {
        if (!gl) return null; var W2 = canvas.width, H2 = canvas.height, a = new Uint8Array(W2 * H2 * 4), b2 = new Uint8Array(W2 * H2 * 4), t0 = windT;
        draw(); gl.readPixels(0, 0, W2, H2, gl.RGBA, gl.UNSIGNED_BYTE, a); windT = t0; draw(); gl.readPixels(0, 0, W2, H2, gl.RGBA, gl.UNSIGNED_BYTE, b2);
        var s = 0; for (var i = 0; i < a.length; i += 4) s += Math.abs(a[i] - b2[i]) + Math.abs(a[i + 1] - b2[i + 1]) + Math.abs(a[i + 2] - b2[i + 2]); return s / (W2 * H2 * 3 * 255);
      },
      /* Leuchten wirken nur im eigenen Raum (roomOf). Ein Lichtdurchtritt entstünde, wenn eine Wandseite dem falschen Raum
         zugeordnet würde – roomAt prüft genau diese Zuordnung; lightAt liefert das Licht eines Punkts (ohne Vorabdaten). */
      roomAt: function (q) { ensureGeo(); return roomOf(q); },
      lightAt: function (q, n) { ensureGeo(); var s = []; var c = bakeOne(q, n, 0, s); return { rgb: c.map(function (v) { return +v.toFixed(4); }), room: roomOf(q) }; },
      setScale: function (v, lock) { rs = Math.max(0.25, Math.min(1, v)); rsLock = !!lock; resize(); if (running) request(); },
      /* nur für die Bildproduktion (tools/render-stills.js): feste Kamera {e,t,f} oder null */
      setCamera: function (c) { camOverride = c || null; expoCur = -1; if (running) request(); },
      walls: function () { ensureGeo(); return WALLS.slice(); },
      /* Prüfhilfe V16: senkrechter Strahl durch die echte Dreiecksgeometrie (Gebäude, Innenräume, Umgebung) –
         dir = +1 nach oben, −1 nach unten; liefert die Höhe der ersten getroffenen Fläche oder null (Kopfhöhe, WC-Schüssel) */
      rayY: function (x, y, z, dir) {
        ensureGeo(); var best = null;
        [G, INT, ENV].forEach(function (S) { var P = S.P; for (var i = 0; i < P.length; i += 9) {
          var ax = P[i], az = P[i + 2], bx = P[i + 3], bz = P[i + 5], cx = P[i + 6], cz = P[i + 8];
          var d = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz); if (Math.abs(d) < 1e-12) continue;
          var l1 = ((bz - cz) * (x - cx) + (cx - bx) * (z - cz)) / d, l2 = ((cz - az) * (x - cx) + (ax - cx) * (z - cz)) / d, l3 = 1 - l1 - l2;
          if (l1 < 0 || l2 < 0 || l3 < 0) continue; var yy = l1 * P[i + 1] + l2 * P[i + 4] + l3 * P[i + 7];
          if (dir > 0 ? (yy > y + 1e-4 && (best === null || yy < best)) : (yy < y - 1e-4 && (best === null || yy > best))) best = yy; } });
        return best === null ? null : +best.toFixed(4);
      },
      /* Export für das GLB-Modell: Gebäude, Innenräume und Umgebung zu einem Satz G zusammengeführt, Gruppen mit Startindex */
      exportGeo: function () {
        ensureBuilt(); var base = {}, off = 0, M = { P: [], N: [], C: [], E: [], M: [], L: [] };
        [G, INT, ENV].forEach(function (x) { base[x.name] = off; off += x.P.length / 3; ['P', 'N', 'C', 'E', 'M', 'L'].forEach(function (k) { M[k] = M[k].concat(Array.prototype.slice.call(x[k])); }); });
        var gr = GR.map(function (g) { return [g[0], base[g[1].name] + g[2]]; }).sort(function (a, b) { return a[1] - b[1]; });
        function g(x) { return { P: x.P, N: x.N, C: x.C, E: x.E, M: x.M }; }
        return { G: M, D: g(D), A: g(A), TT: g(TT), groups: gr };
      },
      cull: function () { return { drawn: cullStats.drawn, total: cullStats.total, chunks: sets.filter(function (o) { return o.ranges; }).map(function (o) { return o.name + ':' + o.ranges.length; }) }; },
      sceneStats: function () {
        ensureGeo(); var all = [G, INT, ENV, D, A, TT];
        return { vertices: all.reduce(function (a, x) { return a + x.P.length / 3; }, 0) + FOL.P.length / 3 + GZ.P.length / 3 + (TG.P.length + TGD.P.length + TGT.P.length) / 3 + HAL.P.length / 3,
          surfaces: all.reduce(function (a, x) { return a + x.P.length / 3; }, 0), foliage: FOL.P.length / 3, cards: FOL.P.length / 18, panes: GZ.P.length / 18, glass: (TG.P.length + TGD.P.length + TGT.P.length) / 18, halos: HAL.P.length / 18,
          lines: all.reduce(function (a, x) { return a + x.LP.length / 6; }, 0), lights: LIT.length, occluders: OCC.length, colliders: WALLS.length, renderScale: rs, buildMs: buildMs, bakeMs: bakeMs,
          prebaked: pbUsed, bakeState: pbState, textures: TX.state, derivatives: EXT.der, anisotropy: EXT.anMax, softwareGL: EXT.sw,
          probes: PROBES.filter(function (pb) { return !!pb.tex; }).map(function (pb) { return pb.id; }), probeMs: Math.round(probeMs), mirrorFrames: MIR.frames, alphaToCoverage: A2C,
          glResources: { buffers: buffers.length, textures: textures.length, programs: progs.length } };
      },
      /* nur für tools/bake-light.js: Geometrie, Leuchten und Gewichte zum Vorabrechnen von Umgebungsverdeckung und Schatten */
      bakeKit: function () {
        ensureGeo(); function pk(x) { return { name: x.name, P: Array.prototype.slice.call(x.P), N: Array.prototype.slice.call(x.N), M: Array.prototype.slice.call(x.M) }; }
        function mv(x, Mx) { var o = pk(x); for (var i = 0; i < o.P.length; i += 3) { var a = o.P[i], b = o.P[i + 1], c = o.P[i + 2]; o.P[i] = Mx[0] * a + Mx[4] * b + Mx[8] * c + Mx[12]; o.P[i + 1] = Mx[1] * a + Mx[5] * b + Mx[9] * c + Mx[13]; o.P[i + 2] = Mx[2] * a + Mx[6] * b + Mx[10] * c + Mx[14]; } return o; }
        return { hash: geoHash(), sets: [pk(G), pk(INT), pk(ENV)], movers: [mv(D, doorM(0)), mv(A, aptM(0)), mv(TT, terM(0))], foliage: { P: FOL.P.slice() }, lights: LIT.map(function (l) { return l.slice(); }) };
      },
      lightW: function (q, n, m) { return lightW(q, n, m); },
      roomOf: function (q) { return roomOf(q); },
      state: function () { return { frames: drawCount, p: p, ps: ps, ready: ready, running: running, mode: mode, destroyed: destroyed, listeners: disposers.length, expo: expoCur, wind: !!windTimer || (running && windOn(win.performance.now())), scan: { state: scan.state, start: scan.start, end: scan.end, count: scan.count }, hi: hiNow, pulseLast: pulse.last }; }
    };
  }

  global.IRTour = { create: create, version: '14' };
})(window);

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

})();
