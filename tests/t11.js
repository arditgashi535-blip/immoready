const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const url='file://'+require('path').resolve(__dirname,'../dist/immoready-vorschau.html');const log=[];const ok=(c,m)=>log.push((c?'PASS ':'FAIL ')+m);
let p=await b.newPage({viewport:{width:1440,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.__rafN=0;const r=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=f=>{window.__rafN++;return r(f)};});
await p.goto(url);await p.waitForFunction(()=>{const i=document.querySelector('.jr-still.on');return i&&i.complete&&i.naturalWidth>0},null,{timeout:3000}).catch(()=>{});
const pre=await p.evaluate(()=>[!window.__jr,document.querySelector('.jr-still.on').naturalWidth,getComputedStyle(document.querySelector('.jr-st0')).visibility,document.querySelectorAll('.jr-st').length]);
ok(pre[0]&&pre[1]>0&&pre[2]==='visible'&&pre[3]===6,'Standbild, Überschrift und Aktionen vor der 3D-Szene; alle 6 Stationstexte als HTML '+JSON.stringify(pre));
await p.waitForTimeout(3500);
ok(await p.evaluate(()=>window.__jr===true&&document.getElementById('reise').classList.contains('jr-ready')),'3D-Szene gestartet (WebGL)');
const col=await p.evaluate(()=>__JR.checkRoute(2000));ok(col.length===0,`Kameraroute frei: 2000 Punkte, ${col.length} Wandkontakte (Abstand ≥ 12 cm)`);
const H=await p.evaluate(()=>{const r=document.getElementById('reise');return [r.getBoundingClientRect().top+scrollY,r.offsetHeight-innerHeight]});
async function at(q,wait){await p.evaluate(y=>scrollTo({top:y,behavior:'instant'}),Math.round(H[0]+q*H[1]));await p.waitForTimeout(wait||1000);}
const names=['aussen','garten','eingang','wohnung','bad','zurueck'];const holds=[0.03,0.235,0.44,0.59,0.765,0.995];
async function stIs(k,ms){try{await p.waitForFunction(k=>{const e=document.querySelector('.jr-st.on');return e&&e.dataset.k===k},k,{timeout:ms||8000});return true}catch(e){return false}}
for(let i=0;i<6;i++){await at(holds[i],100);ok(await stIs(names[i]),`Vorwärts: Station ${i+1} (${names[i]}) eingeblendet`);}
for(let i=5;i>=0;i--){await at(holds[i],100);ok(await stIs(names[i]),`Rückwärts: Station ${i+1} (${names[i]}) eingeblendet`);}
const d=await p.evaluate(()=>[__JR.doorAngle(0.2),__JR.doorAngle(0.375),__JR.doorAngle(0.6),__JR.doorAngle(0.85),__JR.doorAngle(0.99),__JR.doorAngle(0.2)]);
const ad=await p.evaluate(()=>[__JR.aptAngle(0.44),__JR.aptAngle(0.51),__JR.aptAngle(0.79),__JR.aptAngle(0.86)]);ok(ad[0]===0&&ad[1]<-1.5&&ad[2]<-1.5&&ad[3]===0,'Wohnungstür: öffnet vor dem Durchfahren, schliesst, wenn die Kamera im Bad ist');
ok(d[0]===0&&d[1]>1.7&&d[2]>1.7&&d[3]<0.01&&d[4]===0&&d[5]===0,'Haustür: zu → offen beim Eintreten → zu, bevor die Rückfahrt beginnt; rückwärts identisch');
const tt=await p.evaluate(()=>[__JR.terSlide(0.8),__JR.terSlide(0.885),__JR.terSlide(0.91),__JR.terSlide(0.97)]);ok(tt[0]===0&&tt[1]>=0.99&&tt[2]>=0.99&&tt[3]===0,'Terrassentür: gleitet vor der Durchfahrt 1,0 m auf, schliesst danach '+JSON.stringify(tt));
await at(0.765,300);let ov=true;try{await p.waitForFunction(()=>document.getElementById('reise').classList.contains('jr-hi')&&getComputedStyle(document.querySelector('.jr-tech')).opacity>0.5,null,{timeout:8000,polling:200})}catch(e){ov=false}ok(ov,'Bad: technisches Overlay sichtbar');
await at(0.44,1500);ok(await p.waitForFunction(()=>!document.getElementById('reise').classList.contains('jr-hi'),null,{timeout:15000,polling:200}).then(()=>true).catch(()=>false),'Overlay ausserhalb des Bads aus');
await p.waitForFunction(()=>{const s=__JR.state();return s.p===s.ps},null,{timeout:30000,polling:200}).catch(()=>{});await p.waitForTimeout(1500);const n0=await p.evaluate(()=>window.__rafN);await p.waitForTimeout(1500);const n1=await p.evaluate(()=>window.__rafN);ok(n1-n0<=2,`Ruhezustand innen ohne Dauerschleife (${n1-n0} Frames)`);
/* Wind (V14): aussen läuft eine leichte Pflanzenbewegung, höchstens maxFps, und endet idleMs nach der letzten Eingabe */
const WI=await p.evaluate(()=>window.IR_RISE.wind);await at(0.03,300);await p.waitForFunction(()=>{const s=__JR.state();return s.p===s.ps},null,{timeout:30000,polling:200}).catch(()=>{});
await p.mouse.move(700,500);await p.mouse.move(720,520);const w0=await p.evaluate(()=>window.__rafN);await p.waitForTimeout(2000);const w1=await p.evaluate(()=>window.__rafN);
ok(w1-w0>=2&&w1-w0<=Math.ceil(2*WI.maxFps*1.1)+2,`Wind aussen aktiv, gedrosselt (${w1-w0} Aufrufe in 2 s, Grenze ${WI.maxFps} Bilder/s)`);
await p.waitForTimeout(WI.idleMs+1500);const i0=await p.evaluate(()=>window.__rafN);await p.waitForTimeout(1500);const i1=await p.evaluate(()=>window.__rafN);ok(i1-i0<=2,`Ruhezustand: ${WI.idleMs/1000} s nach der letzten Eingabe steht auch der Wind still (${i1-i0} Frames)`);
await at(0.02,300);await p.click('.jr-nav button[data-go="4"]');ok(await stIs('bad',15000),'Stationsnavigation (Maus): Sprung zum Bad');await p.waitForTimeout(1500);
await p.focus('.jr-nav button[data-go="1"]');await p.keyboard.press('Enter');ok(await stIs('garten',15000),'Stationsnavigation (Tastatur): Sprung zum Garten');await p.waitForTimeout(1500);
await at(0.02,300);await stIs('aussen');await p.click('.jr-st0 [data-go="1"]');ok(await stIs('garten',15000),'«Gebäude entdecken» startet die Fahrt');await p.waitForTimeout(1500);
await at(0.3,600);await p.click('.jr-skip-a');let sk=true;try{await p.waitForFunction(()=>{const r=document.getElementById('leistungswelt').getBoundingClientRect();return r.top<innerHeight*0.6&&r.bottom>0},null,{timeout:15000})}catch(e){sk=false}ok(sk,'«Direkt zu den Leistungen» überspringt die Fahrt');await p.waitForTimeout(1500);
await at(0.59,100);await stIs('wohnung');await p.waitForTimeout(500);await p.click('.jr-st.on [data-choice="raeumung"]');await p.waitForTimeout(200);await p.click('.jr-st.on .btn[data-pre]');await p.waitForTimeout(500);ok(await p.evaluate(()=>location.hash==='#offerte'&&document.getElementById('leistung_raeumung').checked),'Station «Wohnung» → Anfrage mit vorgewählter Räumung');
await p.evaluate(()=>{location.hash='start'});await p.waitForTimeout(500);
await p.evaluate(()=>scrollTo({top:document.body.scrollHeight,behavior:'instant'}));await p.waitForTimeout(1200);const m0=await p.evaluate(()=>window.__rafN);await p.waitForTimeout(1000);const m1=await p.evaluate(()=>window.__rafN);ok(m1-m0<=2,'Szene pausiert ausserhalb des Sichtbereichs');
ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Desktop: kein seitliches Scrollen');
ok(errs.length===0,'keine JS-Fehler '+errs.join('|'));await p.close();
// Ohne WebGL
p=await b.newPage({viewport:{width:1440,height:900}});await p.addInitScript(()=>{const g=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,o){if(/webgl/.test(t))return null;return g.call(this,t,o)};});
await p.goto(url);await p.waitForTimeout(2500);
ok(await p.evaluate(()=>{const r=document.getElementById('reise');return r.classList.contains('jr-static')&&r.offsetHeight<innerHeight*2.2}),'Ohne WebGL: Stationsbilder, kurzer Abschnitt');
await p.click('.jr-nav button[data-go="4"]');await p.waitForTimeout(500);
ok(await p.evaluate(()=>document.querySelectorAll('.jr-still')[4].classList.contains('on')&&document.querySelector('.jr-st.on').dataset.k==='bad'),'Ohne WebGL: Stationswechsel mit Bild und Text');
await p.close();
// Smartphone
p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});await p.goto(url);await p.waitForTimeout(2000);
ok(await p.evaluate(()=>document.getElementById('reise').classList.contains('jr-static')&&!window.__jr),'Smartphone: keine Pflicht-Kamerafahrt, Stationsbilder');
await p.tap('.jr-nav button[data-go="2"]');await p.waitForTimeout(500);ok(await p.evaluate(()=>document.querySelector('.jr-st.on').dataset.k==='eingang'&&document.querySelectorAll('.jr-still')[2].classList.contains('on')),'Smartphone: kurze Stationswechsel per Berührung');
await p.focus('.jr-nav button[data-go="2"]');await p.keyboard.press('ArrowRight');await p.waitForTimeout(300);ok(await p.evaluate(()=>document.querySelector('.jr-st.on').dataset.k==='wohnung'),'Pfeiltasten wechseln Stationen');
ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Smartphone: kein seitliches Scrollen');
await p.screenshot({path:require('path').resolve(__dirname,'../shots')+'/m-jr.png'});
await p.close();
console.log(log.join('\n'));await b.close();})();
