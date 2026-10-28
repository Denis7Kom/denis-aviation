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
  'flightMotion',
  'articulatedPoint',
  'aircraftLampLevels',
])
  vm.runInContext(functionSource(name), ctx);
for (const aircraft of vm.runInContext('fleet', ctx)) {
  const mesh = ctx.buildPlane(aircraft),
    wire = ctx.buildPlane(aircraft, true),
    geo = ctx.wingGeometry(aircraft);
  assert.equal(ctx.wingGeometry(aircraft), geo, 'wing profile is cached');
  if (aircraft.code === 'A321') {
    const tip = geo.stations.at(-1);
    assert(Math.abs(tip[0] * 2 - 34.1) < 0.01, 'A321 fence wing span');
    for (const sign of [-1, 1]) {
      for (const component of ['upper', 'lower']) {
        const faces = mesh.filter(
          (f) =>
            f.part?.kind === 'wingtip-fence' &&
            f.part.sign === sign &&
            f.part.component === component,
        );
        assert(faces.length >= 4, 'each fence blade has enclosed sides');
        const points = faces.flatMap((f) => f.p);
        assert(
          points.every((p) => Math.abs(Math.abs(p[0]) - tip[0]) < 0.021),
          'fence sits at the outer wingtip',
        );
        assert(
          points.every((p) => p[2] >= tip[2] + tip[3] * 0.47),
          'fence sits on the aft half of the wingtip',
        );
        assert(
          points.some((p) => p[2] > tip[2] + tip[3] * 0.96),
          'fence reaches the trailing edge',
        );
        const ys = faces.flatMap((f) => f.p.map((p) => p[1]));
        assert(
          component === 'upper' ? Math.max(...ys) > tip[1] + 0.6 : Math.min(...ys) < tip[1] - 0.35,
          'fence extends above and below wing',
        );
      }
    }
  }

  assert(wire.length < mesh.length * 0.6, 'wire mode omits fine skins and light fixtures');
  const parts = [...new Set(mesh.map((f) => f.part).filter(Boolean))];
  for (const sign of [-1, 1]) {
    const spoiler = parts.find((p) => p.kind === 'spoiler' && p.sign === sign);
    const aileron = parts.find((p) => p.kind === 'aileron' && p.sign === sign);
    assert(spoiler && aileron, 'each wing has moving spoiler and aileron surfaces');
    const point = geo.point(spoiler.hinge, 0.7, sign);
    ctx.speedbrakePosition = 0;
    const stowed = ctx.articulatedPoint(point, spoiler, aircraft, 1, 0);
    ctx.speedbrakePosition = 0.5;
    const half = ctx.articulatedPoint(point, spoiler, aircraft, 1, 0);
    ctx.speedbrakePosition = 1;
    const full = ctx.articulatedPoint(point, spoiler, aircraft, 1, 0);
    assert(half[1] > stowed[1] && full[1] > half[1], 'spoiler rises through half and full');
  }
  ctx.speedbrakePosition = 0;
  ctx.motion = true;
  ctx.systemsClock = 0;
  const slat = parts.find((p) => p.kind === 'slat' && p.device === 'slat');
  const slatPoint = mesh.find((face) => face.part === slat).p[0];
  const slatAtZero = ctx.articulatedPoint(slatPoint, slat, aircraft, 1, 0);
  ctx.systemsClock = Math.PI * 1200;
  assert.deepEqual(
    ctx.articulatedPoint(slatPoint, slat, aircraft, 1, 0),
    slatAtZero,
    'slat stays retracted while rocking',
  );
  ctx.systemsClock = 0;
  const movements = [-1, 1].map((sign) => {
    const part = parts.find((p) => p.kind === 'aileron' && p.sign === sign);
    const point = geo.point(part.end, 1, sign);
    const moved = ctx.articulatedPoint(point, part, aircraft, 1, 0);
    return moved[1] - point[1];
  });
  assert(movements[0] * movements[1] < 0, 'ailerons move in opposite directions');
  assert(
    movements[0] > 0 && movements[1] < 0,
    'ailerons drive the same direction as increasing bank',
  );
  ctx.systemsClock = Math.PI * 2200;
  for (const sign of [-1, 1]) {
    const part = parts.find((p) => p.kind === 'aileron' && p.sign === sign);
    const point = geo.point(part.end, 1, sign);
    const moved = ctx.articulatedPoint(point, part, aircraft, 1, 0);
    assert(Math.abs(moved[1] - point[1]) < 1e-8, 'ailerons neutral when roll rate is zero');
  }
  assert(
    parts.some((p) => p.kind === 'elevator'),
    'tail elevators are articulated',
  );
  ctx.motion = false;
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
  assert(
    !mesh.some((f) => f.part?.marking === 'wing-panel' && f.color.join(',') === '82,103,124'),
    'decorative spoiler rectangles are absent',
  );
  const leading = parts.filter((p) => p.kind === 'slat' && !p.component && p.sign === 1);
  const count = (kind) => leading.filter((p) => p.device === kind).length;
  if (aircraft.code === 'B737') {
    assert.equal(count('slat'), 4);
    assert.equal(count('krueger'), 2);
  } else if (aircraft.code === 'A321') assert.equal(count('slat'), 5);
  else if (aircraft.code === 'A35K') {
    assert.equal(count('slat'), 6);
    assert.equal(count('droop'), 1);
  } else assert.equal(count('slat'), 7);
  for (const face of mesh.filter(
    (f) => f.part?.device === 'slat' && !f.part.component && f.color.join(',') === '119,139,158',
  ))
    assert(
      Math.abs(face.p[0][1] - face.p[3][1]) < 0.02,
      'slat has a thin trailing lip instead of a wing-box cut',
    );
  for (const device of leading) {
    for (const face of mesh.filter((f) => f.part === device))
      for (const p of face.p) {
        const closed = ctx.articulatedPoint(p, device, aircraft, 1, 0);
        assert(
          closed.every((v, i) => Math.abs(v - p[i]) < 1e-9),
          'leading devices close without offsets',
        );
        for (const progress of [0.2, 0.5, 0.8, 1])
          assert(ctx.articulatedPoint(p, device, aircraft, 1, progress).every(Number.isFinite));
      }
    if (device.device === 'slat') {
      const h = device.hinge,
        p = geo.point(h, 0.075, 1, 1),
        moved = ctx.articulatedPoint(p, device, aircraft, 1, 1);
      assert(moved[2] < p[2] - 0.1, 'slat advances ahead of the fixed leading-edge cove');
      assert(moved[0] > p[0], 'slat track follows the swept wing normal');
    }
    if (device.device === 'krueger') {
      const points = mesh.filter((f) => f.part === device).flatMap((f) => f.p),
        p = points.reduce((a, b) => (a[2] > b[2] ? a : b)),
        moved = ctx.articulatedPoint(p, device, aircraft, 1, 1);
      assert(moved[1] < p[1] - 0.2, 'Krueger panel unfolds below the leading edge');
    }
    if (device.device === 'droop')
      assert.equal(device.extension, 0, 'droop nose rotates without a translating slot');
  }
  console.log(
    'PASS ' +
      aircraft.code +
      ': cached wing, closed secondary flaps, opening slots, slat tracks and surface-mounted optics',
  );
}
assert(ctx.aircraftLampLevels(247.5, 'A339').strobe > 0.9, 'Airbus second strobe pulse');
assert.equal(ctx.aircraftLampLevels(247.5, 'B737').strobe, 0, 'Boeing single strobe pulse');
