const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
function fn(name){const start=src.indexOf('function '+name+'(');assert(start>=0,name);let i=src.indexOf('{',start)+1,n=1;while(n){if(src[i]==='{')n++;if(src[i]==='}')n--;i++;}return src.slice(start,i);}
const ctx={Math,D:Math.PI/180,fanAngle:0,gearPosition:1,flapPosition:0};vm.createContext(ctx);
vm.runInContext(src.slice(src.indexOf('const fleet='),src.indexOf('const reduced=')),ctx);
for(const n of ['airframe','wingGeometry','fuselageSection','buildPlane','smoothStep','articulatedPoint'])vm.runInContext(fn(n),ctx);
function clearance(a,p){const s=ctx.fuselageSection(a,p[2]);return Math.hypot(p[0],(p[1]-s.center)/s.vertical)-s.radius;}
for(const a of vm.runInContext('fleet',ctx)){
 const faces=ctx.buildPlane(a),fairings=[...new Set(faces.filter(f=>f.part?.component==='fairing').map(f=>f.part))];
 assert.equal(fairings.length,6,a.code+' has three moving fairings per wing');
 for(const fairing of fairings){
  const flap=faces.find(f=>f.part?.kind==='flap'&&!f.part.component&&f.part.sign===fairing.sign&&f.part.hinge===fairing.hinge&&f.part.end===fairing.end);
  assert(flap,a.code+' fairing is attached to an existing flap segment');
  const point=faces.find(f=>f.part===fairing).p[0];
  for(const progress of [0,.25,.5,.75,1]){
   const actual=ctx.articulatedPoint(point,fairing,a,1,progress),expected=ctx.articulatedPoint(point,flap.part,a,1,progress);
   assert(actual.every((v,i)=>Math.abs(v-expected[i])<1e-9),a.code+' fairing follows the flap throughout deployment');
  }
 }
 let minimum=Infinity;
 const panels=faces.filter(f=>f.part?.kind==='decal'&&['exit','cargo'].includes(f.part.marking));assert(panels.some(f=>f.part.marking==='cargo'));
 for(const f of panels){
  const [p,q,r]=f.p;
  // Test triangle interiors, not just the vertices: that is where the old
  // coarse door polygons disappeared beneath the curved fuselage.
  for(const weights of [[1/3,1/3,1/3],[.5,.5,0],[0,.5,.5],[.5,0,.5]]){
   const sample=p.map((v,i)=>v*weights[0]+q[i]*weights[1]+r[i]*weights[2]),gap=clearance(a,sample);minimum=Math.min(minimum,gap);
   assert(gap>.008,a.code+' door/cargo triangle stays above the skin: '+gap);
  }
 }
 for(const f of faces.filter(f=>['mainGear','noseGear'].includes(f.part?.kind)))for(const p of f.p)assert(clearance(a,p)>0,a.code+' extended gear stays outside the hull');
 for(const f of faces.filter(f=>f.part?.kind==='noseGear'))for(const p of f.p)assert(clearance(a,ctx.articulatedPoint(p,f.part,a,0,0))<0,a.code+' retracted nose gear fits inside its bay');
 const wire=ctx.buildPlane(a,true);assert(!wire.some(f=>f.part?.kind==='decal'||f.part?.kind==='glazing'),'wire mesh does not pay for surface tessellation');
 console.log('PASS '+a.code+': fairing/flap motion, complete door/cargo surfaces, external gear mounts; minimum panel clearance '+minimum.toFixed(4)+'m');
}
