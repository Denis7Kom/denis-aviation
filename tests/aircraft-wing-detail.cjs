const assert = require('node:assert/strict');
const vm = require('node:vm');
const { functionSource, declarationSource } = require('./helpers/application.cjs');
const ctx = { Math, D: Math.PI / 180, fanAngle: 0, gearPosition: 1, flapPosition: 0 };
vm.createContext(ctx);
vm.runInContext(declarationSource('fleet'), ctx);
for (const name of [
  'airframe',
  'wingGeometry',
  'fuselageSection',
  'aircraftLightLayout',
  'buildPlane',
  'smoothStep',
  'articulatedPoint',
  'aircraftLampLevels',
])
  vm.runInContext(functionSource(name), ctx);
for (const aircraft of vm.runInContext('fleet', ctx)) {
  const mesh = ctx.buildPlane(aircraft),
    wire = ctx.buildPlane(aircraft, true),
    geo = ctx.wingGeometry(aircraft);
  assert.equal(ctx.wingGeometry(aircraft), geo, 'wing profile is cached');
  assert(wire.length < mesh.length * 0.6, 'wire mode omits fine skins and light fixtures');
  const parts = [...new Set(mesh.map((f) => f.part).filter(Boolean))];
  const aft = parts.find((p) => p.component === 'aft-element');
  assert.equal(
    Boolean(aft),
    ['B737', 'A321'].includes(aircraft.code),
    'narrowbody multi-element flaps',
  );
  if (aft) {
    const primary = parts.find(
      (p) => p.kind === 'flap' && !p.component && p.hinge === aft.hinge && p.sign === aft.sign,
    );
    const station = aft.hinge,
      point = geo.point(station, 0.86, aft.sign);
    assert.deepEqual(
      ctx.articulatedPoint(point, aft, aircraft, 1, 0),
      point,
      'secondary flap closes flush',
    );
    const first = ctx.articulatedPoint(point, primary, aircraft, 1, 1),
      second = ctx.articulatedPoint(point, aft, aircraft, 1, 1);
    assert(
      Math.hypot(...first.map((v, i) => v - second[i])) > 0.15,
      'Fowler slot opens between elements',
    );
  }
  for (const part of parts.filter((p) => p.component === 'slat-track')) {
    const slat = parts.find(
      (p) => p.kind === 'slat' && !p.component && p.hinge === part.hinge && p.sign === part.sign,
    );
    const point = mesh.find((f) => f.part === part).p[0];
    for (const progress of [0, 0.3, 0.7, 1])
      assert.deepEqual(
        ctx.articulatedPoint(point, part, aircraft, 1, progress),
        ctx.articulatedPoint(point, slat, aircraft, 1, progress),
        'slat rails stay attached',
      );
  }
  for (const lamp of ctx
    .aircraftLightLayout(aircraft)
    .filter((l) => /^(nav-|rear-nav-|strobe-)/.test(l.id) && !l.id.endsWith('tail'))) {
    const n = lamp.housingNormal;
    assert(n && Math.abs(Math.hypot(...n) - 1) < 1e-9, 'wing lights use a physical surface normal');
  }
  const darkPanels = mesh.filter(
    (f) => f.part?.marking === 'wing-panel' && f.color.join(',') === '82,103,124',
  );
  assert.equal(darkPanels.length, 0, 'remove non-aircraft rectangular wing tiles');
  assert.equal(
    mesh.filter((f) => f.part?.marking === 'wing-panel' && f.color.join(',') === '155,176,197')
      .length,
    0,
    'remove raised square panel fills',
  );
  for (const slat of parts.filter((p) => p.kind === 'slat' && !p.component)) {
    assert.equal(slat.chord, 0.13, 'slat uses a substantial curved leading-edge chord');
    const point = geo.point(slat.hinge, 0, slat.sign);
    const deployed = ctx.articulatedPoint(point, slat, aircraft, 1, 1);
    assert(deployed[2] < point[2] - 0.09, 'slat moves forward');
    assert(deployed[1] < point[1] - 0.09, 'slat rotates down');
    assert(
      ctx
        .articulatedPoint(point, slat, aircraft, 1, 0)
        .every((v, i) => Math.abs(v - point[i]) < 1e-9),
      'slat retracts flush',
    );
  }
  for (const face of mesh.filter(
    (f) => f.part?.marking === 'wing-panel' && f.color.join(',') === '155,176,197',
  )) {
    const centre = [0, 1, 2].map((i) => face.p.reduce((sum, p) => sum + p[i] / face.p.length, 0));
    for (const border of darkPanels)
      for (let j = 2; j < border.p.length; j++) {
        const [a, b, c] = [border.p[0], border.p[j - 1], border.p[j]],
          d = (b[0] - a[0]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[0] - a[0]);
        if (Math.abs(d) < 1e-10) continue;
        const u = ((centre[0] - a[0]) * (c[2] - a[2]) - (centre[2] - a[2]) * (c[0] - a[0])) / d,
          v = ((b[0] - a[0]) * (centre[2] - a[2]) - (b[2] - a[2]) * (centre[0] - a[0])) / d;
        assert(
          !(u > 1e-6 && v > 1e-6 && u + v < 1 - 1e-6),
          'panel fills must not overlap their coplanar borders',
        );
      }
  }
  console.log(
    'PASS ' +
      aircraft.code +
      ': cached wing, closed secondary flaps, opening slots, slat tracks and surface-mounted optics',
  );
}
assert(ctx.aircraftLampLevels(247.5, 'A339').strobe > 0.9, 'Airbus second strobe pulse');
assert.equal(ctx.aircraftLampLevels(247.5, 'B737').strobe, 0, 'Boeing single strobe pulse');
