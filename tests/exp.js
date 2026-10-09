const { chromium } = require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1440,height:900}});await p.goto('file://'+require('path').resolve(__dirname,'../dist/immoready-vorschau.html'));await p.waitForTimeout(3500);
fs.writeFileSync(require('path').resolve(__dirname,'../model/geo.json'),await p.evaluate(()=>JSON.stringify(__JR.exportGeo())));await b.close();})();
