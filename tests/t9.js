const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
const url='file://'+require('path').resolve(__dirname,'../dist/immoready-vorschau.html');const log=[];const ok=(c,m)=>log.push((c?'PASS ':'FAIL ')+m);
let p=await b.newPage({viewport:{width:1440,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(url);await p.waitForTimeout(1200);
// Kopfzeile: kein Layoutsprung
const y0=await p.evaluate(()=>{const m=document.querySelector('#ablauf');return m.getBoundingClientRect().top+scrollY});
await p.evaluate(()=>scrollTo(0,300));await p.waitForFunction(()=>document.body.classList.contains('hdr-compact'),null,{timeout:4000,polling:100}).catch(()=>{});
const y1=await p.evaluate(()=>{const m=document.querySelector('#ablauf');return m.getBoundingClientRect().top+scrollY});
ok(y0===y1&&await p.evaluate(()=>document.body.classList.contains('hdr-compact')),`Kopfzeile kompakt ohne Layoutsprung (${y0}/${y1})`);
await p.waitForFunction(()=>{const r=document.querySelector('.hdr').getBoundingClientRect(),l=document.querySelector('.logo img').getBoundingClientRect();return l.top>=0&&l.bottom<=r.bottom;},null,{timeout:3000}).catch(()=>{});
const vis=await p.evaluate(()=>{const r=document.querySelector('.hdr').getBoundingClientRect();const l=document.querySelector('.logo img').getBoundingClientRect();return {hb:r.bottom,lt:l.top,lb:l.bottom,lw:l.width,lh:l.height}});
ok(vis.lt>=0&&vis.lb<=vis.hb&&Math.abs(vis.lw/vis.lh-1.318)<.01,`Logo im kompakten Kopf vollständig sichtbar, Proportion ${(vis.lw/vis.lh).toFixed(3)} ${JSON.stringify(vis)}`);
// Neigung
await p.evaluate(()=>document.querySelector('.hw-media').scrollIntoView({block:'center'}));await p.waitForTimeout(1200);
const bx=await p.locator('.hw-media').boundingBox();await p.mouse.move(bx.x+bx.width*.5,bx.y+bx.height*.5);await p.mouse.move(bx.x+bx.width*.95,bx.y+bx.height*.1,{steps:5});await p.waitForTimeout(200);
const t=await p.evaluate(()=>{const s=document.querySelector('.hw-media').style;return [parseFloat(s.getPropertyValue('--rx')),parseFloat(s.getPropertyValue('--ry'))]});
ok(t[0]>2&&t[0]<=3.01&&t[1]>2&&t[1]<=3.01,`Bildkarte neigt sich max. 3° (rx ${t[0]}, ry ${t[1]})`);
await p.mouse.move(5,5);await p.waitForTimeout(700);
ok(await p.evaluate(()=>getComputedStyle(document.querySelector('.hw-media')).transform.replace(/\s/g,'')),'—');
ok(await p.evaluate(()=>{const m=new DOMMatrix(getComputedStyle(document.querySelector('.hw-media')).transform);return Math.abs(m.m13)<0.001&&Math.abs(m.m23)<0.001}),'Bildkarte kehrt in Ausgangslage zurück');
// V13: kein Magnet-Effekt, kein eigener Cursor – die Schaltfläche bleibt unter dem Zeiger ruhig
await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.waitForTimeout(900);
const hb=await p.locator('.hero3-ctas .btn.sand').boundingBox();await p.mouse.move(hb.x+hb.width/2,hb.y+hb.height/2);await p.mouse.move(hb.x+hb.width-3,hb.y+hb.height/2,{steps:4});await p.waitForTimeout(250);
const bb2=await p.locator('.hero3-ctas .btn.sand').boundingBox();
ok(await p.evaluate(()=>document.querySelectorAll('[data-magnet],.btn-in').length===0)&&Math.abs(bb2.x-hb.x)<.5&&Math.abs(bb2.y-hb.y)<.5,'Kein Magnet-Effekt: Schaltfläche und Beschriftung bleiben unter dem Zeiger stehen');
ok(await p.evaluate(()=>{const els=[document.body,...document.querySelectorAll('a,button,.jr-stage,canvas')];return els.every(e=>getComputedStyle(e).cursor!=='none')}),'Kein eigener Cursor (cursor:none nirgends gesetzt)');
// wandernde Markierung
await p.evaluate(()=>document.querySelector('#svcx').scrollIntoView());await p.waitForTimeout(500);
await p.click('.sx-item[data-i="5"] .sx-head');await p.waitForFunction(()=>{const i=document.querySelector('.sx-ind'),it=document.querySelector('.sx-item[data-i="5"]');return Math.abs(new DOMMatrix(getComputedStyle(i).transform).m42-it.offsetTop)<1&&Math.abs(i.offsetHeight-it.offsetHeight)<1},null,{timeout:6000,polling:150}).catch(()=>{});
const sxm=await p.evaluate(()=>{const i=document.querySelector('.sx-ind'),it=document.querySelector('.sx-item[data-i="5"]');return {m:Math.round(new DOMMatrix(getComputedStyle(i).transform).m42),t:it.offsetTop,ih:i.offsetHeight,h:it.offsetHeight,on:[...document.querySelectorAll('.sx-item.on')].map(e=>e.dataset.i).join()}});
ok(Math.abs(sxm.m-sxm.t)<1&&Math.abs(sxm.ih-sxm.h)<1,'Aktive Markierung wandert zum gewählten Eintrag '+JSON.stringify(sxm));
await p.keyboard.press('ArrowDown');await p.waitForFunction(()=>document.querySelector('.sx-item[data-i="6"]').classList.contains('on'),null,{timeout:4000,polling:100}).catch(()=>{});
const kb=await p.evaluate(()=>({on:[...document.querySelectorAll('.sx-item.on')].map(e=>e.dataset.i).join(),act:(document.activeElement.closest('.sx-item')||{dataset:{}}).dataset.i||document.activeElement.tagName}));
ok(kb.on==='6'&&kb.act==='6','Tastatur: Pfeil ab wählt nächste Leistung '+JSON.stringify(kb));
ok(errs.length===0,'keine JS-Fehler '+errs.join('|'));
await p.close();
// Touch: keine Neigung
p=await b.newPage({viewport:{width:1024,height:800},hasTouch:true,isMobile:true});await p.goto(url);await p.waitForTimeout(800);
await p.evaluate(()=>document.querySelector('.hw-media').scrollIntoView({block:'center'}));await p.waitForTimeout(900);
const tb=await p.locator('.hw-media').boundingBox();await p.touchscreen.tap(tb.x+tb.width*.9,tb.y+20);await p.waitForTimeout(300);
ok(await p.evaluate(()=>{const s=getComputedStyle(document.querySelector('.hw-media')).transform;return s==='none'}),'Touch: Bildkarte bleibt stabil');
await p.close();
// Mobiles Menü: Fokus
p=await b.newPage({viewport:{width:390,height:844}});await p.goto(url);await p.waitForTimeout(600);
await p.focus('#burger');await p.keyboard.press('Enter');await p.waitForTimeout(400);
ok(await p.evaluate(()=>document.activeElement.id==='mclose'),'Menü: Fokus springt auf Schliessen');
await p.keyboard.press('Shift+Tab');ok(await p.evaluate(()=>document.getElementById('mnav').contains(document.activeElement)),'Menü: Fokus bleibt im Menü (Shift+Tab)');
for(let i=0;i<40;i++)await p.keyboard.press('Tab');ok(await p.evaluate(()=>document.getElementById('mnav').contains(document.activeElement)),'Menü: Fokus bleibt im Menü (Tab)');
await p.keyboard.press('Escape');await p.waitForTimeout(350);ok(await p.evaluate(()=>document.activeElement.id==='burger'),'Menü: Esc schliesst, Fokus zurück auf Menübutton');
const y2=await p.evaluate(()=>document.querySelector('#ablauf').getBoundingClientRect().top+scrollY);await p.evaluate(()=>scrollTo(0,400));await p.waitForTimeout(300);
const y3=await p.evaluate(()=>document.querySelector('#ablauf').getBoundingClientRect().top+scrollY);ok(y2===y3,'Smartphone: Kopfzeile kompakt ohne Layoutsprung');
await p.close();
// Reduzierte Bewegung
p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});await p.goto(url);await p.waitForTimeout(300);
await p.evaluate(()=>document.querySelector('.hw-media').scrollIntoView({block:'center'}));await p.waitForTimeout(200);
const rb=await p.locator('.hw-media').boundingBox();await p.mouse.move(rb.x+rb.width/2,rb.y+rb.height/2);await p.mouse.move(rb.x+rb.width-5,rb.y+5,{steps:4});await p.waitForTimeout(200);
ok(await p.evaluate(()=>getComputedStyle(document.querySelector('.hw-media')).transform==='none'),'Reduziert: keine Neigung');
await p.evaluate(()=>scrollTo(0,0));const mb=await p.locator('.hero3-ctas .btn.sand').boundingBox();await p.mouse.move(mb.x+mb.width-3,mb.y+5,{steps:3});await p.mouse.down();await p.waitForTimeout(60);
ok(await p.evaluate(()=>getComputedStyle(document.querySelector('.hero3-ctas .btn.sand')).transform==='none'),'Reduziert: kein Press-Effekt');
await p.mouse.up();
await p.waitForTimeout(1500);ok(await p.evaluate(()=>document.getElementById('reise').classList.contains('jr-static')&&!window.__jr),'Reduziert: keine Kamerafahrt, Stationsbilder');
console.log(log.filter(l=>!l.endsWith('—')).join('\n'));await b.close();})();
