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
    /* Korrektur 3D-Reise: schlanker Keramikrand (vorne 2,5 cm, seitlich 3 cm, hinten Armaturenbank 9 cm), Becken mit steileren
       Wänden und flachem Boden, Aussenecken knapper gerundet – vorher wirkte der Waschtisch in der Nahansicht wie eine Wanne */
    var bY=FLOOR+0.86,hx=0.235,hz=0.31,bcx=3.08+hx,bcz=0.8,NB=72,icx=bcx+0.03,ihx=hx-0.055,ihz=hz-0.03,bD=0.15;
    MAT=KER;var bc='#f4f3f0';
    /* Aussenkontur mit gerader Rückseite (liegt satt an der Wand), vorne gerundet */
    function bring(y,s){var o=[];for(var j=0;j<NB;j++){var t=j/NB*Math.PI*2,c=Math.cos(t),si=Math.sin(t),e=c<0?0.12:0.3,ex=c<0?0.12:0.3;o.push([bcx+hx*(c<0?1:s)*Math.sign(c)*Math.pow(Math.abs(c),ex)-(c<0?0:0),y,bcz+hz*s*Math.sign(si)*Math.pow(Math.abs(si),e)]);}return o;}
    surf([bring(bY,0.975),bring(bY-0.003,0.995),bring(bY-0.012,1),bring(bY-bD+0.006,1),bring(bY-bD,0.985),bring(bY-bD,0.0001)],bc,0,function(q,n){return dot(n,sub(q,[bcx,bY-0.07,bcz]))<0;});
    surf([bring(bY,0.975),sring(icx,bY,bcz,ihx,ihz,1,NB)],bc,0,function(q,n){return n[1]<0;});
    surf([sring(icx,bY,bcz,ihx,ihz,1,NB),sring(icx,bY-0.004,bcz,ihx,ihz,0.99,NB),sring(icx,bY-0.03,bcz,ihx,ihz,0.975,NB),sring(icx,bY-0.075,bcz,ihx,ihz,0.94,NB),sring(icx,bY-0.108,bcz,ihx,ihz,0.86,NB),sring(icx,bY-0.126,bcz,ihx,ihz,0.66,NB),sring(icx,bY-0.133,bcz,ihx,ihz,0.34,NB),sring(icx,bY-0.136,bcz,ihx,ihz,0.0,NB)],bc,0,function(q,n){return dot(n,sub([icx,bY+0.2,bcz],q))<0;});
    var rimO=bring(bY,0.975),rimI=sring(icx,bY,bcz,ihx,ihz,1,NB);for(var rj=0;rj<NB;rj++){line(rimO[rj],rimO[(rj+1)%NB],0.35);line(rimI[rj],rimI[(rj+1)%NB],0.25);}
    /* Ablaufventil (Chromkappe mit Ring), Überlauf mit Chromblende in der Beckenrückwand, Silikonfuge zur Wand */
    MAT=TEX;cyl(icx,bY-0.1348,bcz,0.0245,0.0012,28,'#3a3836',0,0);MAT=CHR;cyl(icx,bY-0.1345,bcz,0.0225,0.0018,32,ac,0,0);cyl(icx,bY-0.1335,bcz,0.019,0.0035,32,ac,0,-1,0.0165);
    /* Überlauf auf der (jetzt steileren) Beckenrückwand */withBev(0.0015,function(){box(3.1745,bY-0.052,bcz,0.004,0.018,0.046,ac,0,0);});MAT=TEX;box(3.1768,bY-0.047,bcz,0.002,0.008,0.03,'#3d3b39',0,0);
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
