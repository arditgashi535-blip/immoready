const { chromium } = require('playwright');
(async()=>{
 const b=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
 const url='file://'+require('path').resolve(__dirname,'../dist/immoready-vorschau.html');const log=[];const ok=(c,m)=>log.push((c?'PASS ':'FAIL ')+m);
 const routes=['start','leistungen','hauswartung','sanitaer','gartenunterhalt','reinigung','raeumung','leerstand','verkauf','fotografie','verwaltungen','ueber','kontakt','offerte','impressum','datenschutz','umsetzung'];
 for (const vp of [{n:'1440',w:1440,h:900},{n:'768',w:768,h:1024},{n:'390',w:390,h:844}]){
  const p=await b.newPage({viewport:{width:vp.w,height:vp.h}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(url);await p.waitForTimeout(150);
  const vis=await p.evaluate(()=>{const h=document.querySelector('.hx-title');return getComputedStyle(h).opacity});
  await p.waitForTimeout(1100);await p.screenshot({path:require("path").resolve(__dirname,"../shots")+`/v5-${vp.n}-hero.png`});
  const L=await p.evaluate(()=>{const i=document.querySelector('.logo img');const r=i.getBoundingClientRect();const b=[...document.querySelectorAll('.burger,.hdr-call,.nav,.btn.top')].filter(e=>e.offsetParent).map(e=>e.getBoundingClientRect());const ov=b.some(q=>q.left<r.right&&q.right>r.left&&q.top<r.bottom&&q.bottom>r.top);return {w:r.width,ratio:(r.width/r.height).toFixed(3),nat:(i.naturalWidth/i.naturalHeight).toFixed(3),nw:i.naturalWidth,ov,l:r.left,r:r.right,vw:innerWidth}});
  ok(L.ratio===L.nat&&!L.ov&&L.l>=0&&L.r<=L.vw&&L.nw>=2*L.w,`${vp.n} Logo: Proportion ${L.ratio}/${L.nat}, ${Math.round(L.w)}px breit, frei, scharf`);
  for(const r of routes){await p.evaluate(r=>location.hash=r,r);await p.waitForTimeout(120);
    const ov=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    const h1=await p.evaluate(()=>[...document.querySelectorAll('[data-page]:not([hidden]) h1')].length);
    if(ov>0||h1!==1) ok(false,`${vp.n} ${r}: overflow=${ov} h1=${h1}`);}
  await p.evaluate(()=>{location.hash='start';});await p.waitForTimeout(200);
  const pre=await p.evaluate(()=>[document.querySelectorAll('.reveal.pre').length,document.querySelector('.hw-media').classList.contains('pre')]);
  ok(pre[0]>0&&pre[1],`${vp.n} Scroll-Reveals warten (${pre[0]}), Bildmaske bereit`);
  const H=await p.evaluate(()=>document.body.scrollHeight);for(let y=0;y<H;y+=500){await p.mouse.wheel(0,500);await p.waitForTimeout(70);}
  await p.waitForTimeout(900);
  const after=await p.evaluate(()=>[document.querySelectorAll('.reveal.pre').length,getComputedStyle(document.querySelector('.hw-media')).clipPath,document.querySelectorAll('[data-page="start"] [data-illu]:empty').length]);
  ok(after[0]===0,`${vp.n} alle Abschnitte nach Scrollen sichtbar`);ok(after[1]==='none'||after[1].includes('inset(0px)'),`${vp.n} Bildenthüllung abgeschlossen (${after[1]})`);
  ok(after[2]===0,`${vp.n} alle Bilder nachgeladen`);
  await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(300);
  await p.screenshot({path:require("path").resolve(__dirname,"../shots")+`/v5-${vp.n}-full.png`,fullPage:true});
  ok(errs.length===0,`${vp.n} keine JS-Fehler ${errs.join('|')}`);
  // Leistungsübersicht
  if(vp.w>900){await p.hover('.sx-item[data-i="3"] .sx-head');await p.waitForTimeout(600);
    ok(await p.evaluate(()=>document.querySelector('.sx-layer[data-i="3"]').classList.contains('on')&&document.querySelector('#sxTag').textContent==='Reinigung'),`${vp.n} Hover wechselt Bild (Reinigung)`);
    await p.focus('.sx-item[data-i="1"] .sx-head');await p.waitForTimeout(400);
    ok(await p.evaluate(()=>document.querySelector('.sx-layer[data-i="1"]').classList.contains('on')),`${vp.n} Tastaturfokus wechselt Bild (Sanitär)`);
    // schnelles Überfahren: kein Flackern, am Ende gilt die zuletzt ruhende Zeile
    await p.mouse.move(0,0);let flips=0;
    await p.evaluate(()=>{window.__flips=0;new MutationObserver(m=>{window.__flips+=m.length}).observe(document.querySelector('.sx-stage'),{attributes:true,subtree:true,attributeFilter:['class']});});
    /* Positionen vorab messen: die Bewegung selbst soll schnell und durchgehend sein (wie eine echte Maus) – sonst hängt ihr Tempo
       von der Messzeit je Zeile ab (mit laufendem Rundgang im Hintergrund > 55 ms Absichtsverzögerung) */
    const bxs=await p.evaluate(()=>[...Array(8).keys()].map(i=>{const r=document.querySelector(`.sx-item[data-i="${i}"] .sx-head`).getBoundingClientRect();return [r.x+60,r.y+r.height/2];}));
    for(const [x,y] of bxs){await p.mouse.move(x,y,{steps:2});}
    await p.waitForTimeout(400);
    ok(await p.evaluate(()=>document.querySelector('.sx-layer[data-i="7"]').classList.contains('on')&&window.__flips<=4),`${vp.n} schnelles Überfahren ohne Bildflackern (Wechsel: ${await p.evaluate(()=>window.__flips)})`);
    // Dropdown
    await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(500);await p.click('#ddBtn');await p.waitForFunction(()=>{const d=document.getElementById('ddLeistungen');return d.classList.contains('open')&&getComputedStyle(d).opacity==='1'},null,{timeout:4000,polling:100}).catch(()=>{});
    ok(await p.evaluate(()=>{const d=document.getElementById('ddLeistungen');return d.classList.contains('open')&&getComputedStyle(d).visibility==='visible'&&getComputedStyle(d).opacity==='1'}),`${vp.n} Dropdown öffnet animiert`);
    await p.keyboard.press('Escape');await p.waitForFunction(()=>getComputedStyle(document.getElementById('ddLeistungen')).visibility==='hidden',null,{timeout:4000,polling:100}).catch(()=>{});
    ok(await p.evaluate(()=>getComputedStyle(document.getElementById('ddLeistungen')).visibility==='hidden'),`${vp.n} Dropdown schliesst (Esc)`);
  } else {
    const vis=await p.evaluate(()=>[...document.querySelectorAll('.sx-mob .sx-card')].map(c=>c.querySelector('p').getBoundingClientRect().height>10&&!!c.querySelector('img')));
    ok(vis.length===8&&vis.every(Boolean),`${vp.n} Leistungen vertikal: 8 Einträge mit Bild und Text sichtbar, nichts versteckt`);
    await p.evaluate(()=>window.scrollTo(0,0));await p.click('#burger');
    ok(await p.waitForFunction(()=>getComputedStyle(document.getElementById('mnav')).visibility==='visible',null,{timeout:6000}).then(()=>true).catch(()=>false),`${vp.n} Menü öffnet mit Übergang`);await p.waitForTimeout(400);
    await p.screenshot({path:require("path").resolve(__dirname,"../shots")+`/v5-${vp.n}-menu.png`});
    await p.keyboard.press('Escape');
    // V15: Software-GPU blockiert den Hauptthread je Bild länger – auf den Endzustand warten statt fester 400 ms
    ok(await p.waitForFunction(()=>getComputedStyle(document.getElementById('mnav')).visibility==='hidden',null,{timeout:6000}).then(()=>true).catch(()=>false),`${vp.n} Menü schliesst`);}
  // Formular
  await p.evaluate(()=>{location.hash='start'});await p.waitForTimeout(100);
  if(vp.w>900){await p.click('.sx-item[data-i="1"] .sx-head');await p.waitForTimeout(400);await p.click('#sxDetail a.btn[data-pre]');}
  else await p.click('.sx-card[data-i="0"] a.btn[data-pre]');
  await p.waitForTimeout(250);
  ok(await p.isChecked(vp.w>900?'#leistung_sanitaer':'#leistung_hauswartung'),`${vp.n} Link aus Leistungsübersicht wählt Leistung vor`);
  await p.click('#next');ok(await p.isVisible('#errsum'),`${vp.n} Fehlermeldungen`);
  ok(await p.evaluate(()=>document.querySelector('#email').closest('.f').classList.contains('shake')||document.querySelector('#fs_leistung').classList.contains('shake')),`${vp.n} Fehlerfelder geben Rückmeldung (Schütteln)`);
  await p.fill('#email','x@beispiel.ch');await p.focus('#name');await p.waitForTimeout(50);
  ok(await p.evaluate(()=>document.querySelector('#email').closest('.f').classList.contains('is-ok')),`${vp.n} gültiges Feld wird bestätigt`);
  ok(await p.evaluate(()=>{const s=getComputedStyle(document.querySelector('#name'));return s.boxShadow!=='none'}),`${vp.n} sichtbarer Fokuszustand`);
  await p.fill('#ort','TEST 5400 Baden');await p.fill('#beschreibung','TEST ImmoReady – Armatur tropft in der Küche.');await p.fill('#name','TEST Person');await p.fill('#email','test@beispiel.ch');
  await p.setInputFiles('#fotos',require('path').resolve(__dirname,'fixtures/TEST-foto.png'));await p.check('#simFail');await p.click('#next');await p.click('#next',{force:true}).catch(()=>{});
  ok(await p.evaluate(()=>document.getElementById('next').getAttribute('aria-busy')==='true'),`${vp.n} Ladezustand und Sperre gegen Doppelklick`);
  await p.waitForTimeout(800);
  ok(await p.isVisible('#failbox')&&(await p.inputValue('#ort'))==='TEST 5400 Baden','Fehlerfall: Eingaben bleiben erhalten');
  await p.uncheck('#simFail');await p.click('#next');ok((await p.textContent('#result')).includes('nichts gesendet'),`${vp.n} kein vorgetäuschter Versand`);
  await p.screenshot({path:require("path").resolve(__dirname,"../shots")+`/v5-${vp.n}-form.png`});
  // Abschluss
  await p.evaluate(()=>{location.hash='start'});await p.waitForTimeout(200);
  await p.evaluate(()=>{const n=document.getElementById('newReq');if(n)n.click();});
  await p.evaluate(()=>document.querySelector('.finale').scrollIntoView());await p.waitForTimeout(700);
  await p.click('.fchip[data-pre="gartenunterhalt"]');await p.waitForTimeout(700);
  ok(await p.isChecked('#leistung_gartenunterhalt')&&await p.evaluate(()=>location.hash==='#start'||location.hash===''),`${vp.n} Abschluss-Chip wählt Leistung im Formular vor`);
  if(vp.w<=760) ok(await p.evaluate(()=>(()=>{const s=getComputedStyle(document.querySelector('.mbar'));return document.body.classList.contains('in-finale')&&(s.display==='none'||s.transform!=='none')})()),`${vp.n} Kontaktleiste weicht dem Abschlussformular`);
  // FAQ
  await p.evaluate(()=>document.querySelector('.faq').scrollIntoView({block:'center'}));await p.waitForTimeout(500);
  await p.click('.faq details:nth-child(2) summary');await p.waitForTimeout(450);
  ok(await p.evaluate(()=>{const d=document.querySelector('.faq details:nth-child(2)'),w=d.querySelector('.faq-body');return d.open&&Math.abs(w.getBoundingClientRect().height-w.scrollHeight)<2&&getComputedStyle(w.querySelector('p')).opacity==='1'}),`${vp.n} FAQ öffnet vollständig (nichts abgeschnitten)`);
  await p.click('.faq details:nth-child(2) summary');await p.waitForTimeout(80);await p.click('.faq details:nth-child(2) summary');await p.waitForTimeout(450);
  ok(await p.evaluate(()=>{const d=document.querySelector('.faq details:nth-child(2)');return d.open&&d.classList.contains('is-open')}),`${vp.n} FAQ unterbrechbar (schnell zu/auf)`);
  await p.close();
 }
 // Einstieg: Kontaktaktionen sofort sichtbar, Sequenz ~1 s, keine Layoutverschiebung
 const q=await b.newPage({viewport:{width:1440,height:900}});
 await q.addInitScript(()=>{window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value}).observe({type:'layout-shift',buffered:true});});
 await q.goto(url);await q.waitForTimeout(60);
 ok(await q.evaluate(()=>+getComputedStyle(document.querySelector('.hx-ctas')).opacity>=.6&&+getComputedStyle(document.querySelector('.hdr-call,.nav a')).opacity===1),'Einstieg: Kontaktaktionen ab Start sichtbar');
 await q.waitForTimeout(1100);
 ok(await q.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running'&&a.effect&&a.effect.target&&a.effect.target.closest&&a.effect.target.closest('.hx')&&!a.effect.target.closest('.hs')).length===0),'Einstieg nach ~1.1 s abgeschlossen');
 ok(await q.evaluate(()=>window.__cls<0.05),'Layoutverschiebung beim Laden < 0.05 (CLS '+(await q.evaluate(()=>window.__cls.toFixed(3)))+')');
 await q.emulateMedia({reducedMotion:'reduce'});const rm0=Date.now();
 /* Medienabfrage-Ereignisse kommen mit dem nächsten Bild; in SwiftShader dauert ein Bild 0,3–0,5 s → auf die Bedingung warten statt fix 100 ms */
 const rmOk=await q.waitForFunction(()=>document.querySelectorAll('.reveal.pre,.mask.pre').length===0,null,{timeout:2000}).then(()=>true).catch(()=>false);
 ok(rmOk,'Bewegung reduzieren während der Nutzung: Inhalte sofort sichtbar (nach '+(Date.now()-rm0)+' ms, nächstes Bild in SwiftShader)');
 await q.hover('.hw-media').catch(()=>{});
 await q.close();
 const rm=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});await rm.goto(url);await rm.waitForTimeout(100);
 ok(await rm.evaluate(()=>getComputedStyle(document.querySelector('.hx-title .ln>span')).transform==='none'&&document.querySelectorAll('.reveal.pre,.mask.pre').length===0),'Reduzierte Bewegung: alles sofort sichtbar');
 console.log(log.join('\n'));await b.close();
})();
