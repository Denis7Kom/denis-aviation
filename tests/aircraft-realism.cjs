const fs = require('fs'),
  vm = require('vm'),
  assert = require('assert'),
  path = require('path');
const { functionSource: fn, declarationSource } = require('./helpers/application.cjs');
const ctx = { Math, D: Math.PI / 180, fanAngle: 0, gearPosition: 1, flapPosition: 0 };
vm.createContext(ctx);
vm.runInContext(declarationSource('fleet'), ctx);
for (const n of [
  'airframe',
  'wingGeometry',
  'fuselageSection',
  'aircraftLightLayout',
  'aircraftLightVisible',
  'buildPlane',
  'smoothStep',
  'articulatedPoint',
  'aircraftLampLevels',
])
  vm.runInContext(fn(n), ctx);
for (const a of vm.runInContext('fleet', ctx)) {
  const spec = ctx.airframe(a),
    half = a.len / 2;
  // No joins may introduce a jump in the skin; crown and belly must have
  // a finite cross section through the former common conical nose.
  for (const d of [...spec.nose.map((q) => q[0]), spec.tailStart]) {
    const epsilon = d === 0 ? 1e-8 : 1e-5,
      p = ctx.fuselageSection(a, -half + d - epsilon),
      q = ctx.fuselageSection(a, -half + d + epsilon);
    for (const k of ['radius', 'center'])
      assert(Math.abs(p[k] - q[k]) < 0.001, a.code + ' continuous loft ' + d + ' ' + k);
    assert(
      Math.abs(p.radius * p.vertical - q.radius * q.vertical) < 0.001,
      a.code + ' continuous crown/belly ' + d,
    );
  }
  for (let d = 0; d <= a.len; d += 0.2) {
    const s = ctx.fuselageSection(a, -half + d);
    assert(s.radius > 0 && s.vertical > 0 && Object.values(s).every(Number.isFinite));
  }
  const faces = ctx.buildPlane(a);
  let clearance = Infinity;
  for (const f of faces.filter((f) => f.part?.kind === 'glazing')) {
    for (const weights of [
      [1 / 3, 1 / 3, 1 / 3],
      [0.5, 0.5, 0],
      [0, 0.5, 0.5],
      [0.5, 0, 0.5],
    ]) {
      const p = f.p[0].map((_, i) => f.p.reduce((s, p, k) => s + p[i] * weights[k], 0)),
        s = ctx.fuselageSection(a, p[2]);
      const v = (p[1] - s.center) / (s.radius * s.vertical),
        gap =
          a.code === 'B737' && Math.abs(v) < 1
            ? Math.abs(p[0]) - Math.abs(ctx.fuselageSection(a, p[2], Math.asin(v))[0])
            : Math.hypot(p[0], (p[1] - s.center) / s.vertical) - s.radius;
      clearance = Math.min(clearance, gap);
      assert(gap > 0.003, a.code + ' cockpit glazing above the skin ' + gap);
    }
  }
  const lamps = ctx.aircraftLightLayout(a);
  assert.equal(new Set(lamps.map((l) => l.id)).size, lamps.length);
  for (const group of ['navigation', 'strobe', 'beacon', 'lowerBeacon', 'landing', 'scan', 'taxi'])
    assert(lamps.some((l) => l.group === group));
  assert(lamps.find((l) => l.id === 'nav-left').color.startsWith('#ff'));
  assert(lamps.find((l) => l.id === 'nav-right').color.startsWith('#57'));
  for (const lamp of lamps) {
    assert([...lamp.point, ...lamp.normal].every(Number.isFinite));
    assert(Math.hypot(...lamp.normal) > 0.2);
  }
  // Regress the floating-light bug against rendered wing triangles, not
  // against the mount helper: the lens centre must be within 2 cm of them.
  const wing = faces.filter((f) => !f.part && Math.abs(f.color[0] - 97.5) < 1e-6);
  function distanceToTriangle(p, a, b, c) {
    const sub = (p, q) => p.map((v, i) => v - q[i]),
      dot = (p, q) => p.reduce((s, v, i) => s + v * q[i], 0),
      u = sub(b, a),
      v = sub(c, a),
      n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]],
      nn = dot(n, n);
    if (nn < 1e-12) return Infinity;
    const h = dot(sub(p, a), n) / nn,
      q = p.map((x, i) => x - h * n[i]),
      w = sub(q, a),
      uu = dot(u, u),
      uv = dot(u, v),
      vv = dot(v, v),
      wu = dot(w, u),
      wv = dot(w, v),
      den = uu * vv - uv * uv,
      x = (wu * vv - wv * uv) / den,
      y = (wv * uu - wu * uv) / den;
    return x >= -1e-7 && y >= -1e-7 && x + y <= 1 + 1e-7 ? Math.abs(h) * Math.sqrt(nn) : Infinity;
  }
  for (const lamp of lamps.filter((l) => l.group === 'landing')) {
    const distances = wing.flatMap((f) =>
      f.p.slice(2).map((p, i) => distanceToTriangle(lamp.point, f.p[0], f.p[i + 1], p)),
    );
    assert(
      Math.min(...distances) < 0.0201,
      a.code + ' ' + lamp.id + ' sits on the lower wing, not in open air',
    );
  }
  for (const lamp of lamps.filter((l) => l.part)) {
    const q = ctx.articulatedPoint(lamp.point, lamp.part, a, 1, 0);
    assert(q.every((v, i) => Math.abs(v - lamp.point[i]) < 1e-9));
  }
  assert(
    !ctx.aircraftLightVisible([0, 0, 0], [0, 0, -1], a, [0, 0, -1]),
    'hull occludes a source inside it',
  );
  assert(
    ctx.aircraftLightVisible([0, spec.fin + 1, 0], [0, 1, 0], a, [0, 1, 0]),
    'unobstructed light stays visible',
  );
  console.log(
    'PASS ' +
      a.code +
      ': continuous family loft, glazing clearance ' +
      clearance.toFixed(4) +
      'm, finite lamp fixtures, navigation colours, gear attachment and lamp occlusion',
  );
}
for (let t = 0; t < 5000; t += 10)
  for (const v of Object.values(ctx.aircraftLampLevels(t))) assert(v >= 0 && v <= 1);
