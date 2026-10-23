const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
function fn(name){const start=src.indexOf('function '+name+'(');assert(start>=0,name);let i=src.indexOf('{',start)+1,n=1;while(n){if(src[i]==='{')n++;if(src[i]==='}')n--;i++;}return src.slice(start,i);}
const ctx={Math,D:Math.PI/180,fanAngle:.3,gearPosition:1,flapPosition:0};
vm.createContext(ctx);
vm.runInContext(src.slice(src.indexOf('const fleet='),src.indexOf('const reduced=')),ctx);
for(const name of ['airframe','wingGeometry','fuselageSection','aircraftLightLayout','buildPlane','smoothStep','articulatedPoint'])vm.runInContext(fn(name),ctx);
for(const a of vm.runInContext('fleet',ctx)){
 const spec=ctx.airframe(a),faces=ctx.buildPlane(a);
 assert(faces.length>3000,a.code+' has a detailed surface');
 for(const f of faces){assert(f.p.length>=3);assert(f.p.flat().every(Number.isFinite),a.code+' finite coordinates');if(f.normals)assert(f.normals.flat().every(Number.isFinite),a.code+' finite normals');}
 // Both nose and main wheels must touch the same ground plane when extended.
 for(const kind of ['mainGear','noseGear']){
  const gear=faces.filter(f=>f.part?.kind===kind),points=gear.flatMap(f=>f.p);
  assert(gear.length>0);assert(Math.abs(Math.min(...points.map(p=>p[1]))-spec.ground)<1e-8,a.code+' '+kind+' ground contact');
  for(const f of gear)for(const p of f.p){const down=ctx.articulatedPoint(p,f.part,a,1,0);assert(down.every((v,i)=>Math.abs(v-p[i])<1e-9),'extended gear stays at its fittings');}
 }
 // No main-gear brace endpoint should protrude through the side of the fuselage.
 for(const f of faces.filter(f=>f.part?.kind==='mainGear'))for(const p of f.p){const section=ctx.fuselageSection(a,p[2]);assert(spec.narrow?Math.hypot(p[0],(p[1]-section.center)/section.vertical)>section.radius:Math.abs(p[0])>a.r+.3,a.code+' main gear clears body');}
 // The cabin window row leaves a gap at every emergency/entry door on both sides.
 const windows=faces.filter(f=>f.part?.marking==='window');assert(windows.some(f=>f.part.sign===1)&&windows.some(f=>f.part.sign===-1));
 for(const f of windows)for(const p of f.p)assert(spec.doors.every(d=>Math.abs(p[2]+a.len/2-d)>.65),a.code+' windows clear exits');
 for(const f of faces.filter(f=>f.part?.kind==='glazing'))for(const p of f.p)assert(p[2]+a.len/2<spec.doors[0]-.53,a.code+' flight-deck glazing clears forward exit');
 for(const g of [0,.25,.5,.75,1])for(const f of faces.filter(f=>['mainGear','noseGear','gearDoor','flap','slat'].includes(f.part?.kind)))for(const p of f.p)assert(ctx.articulatedPoint(p,f.part,a,g,g).every(Number.isFinite));
 console.log('PASS '+a.code+': finite mesh, aligned wheels, external main-gear fittings, window/exit clearance, articulation');
}
