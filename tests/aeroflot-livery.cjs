const assert = require('node:assert/strict');
(async () => {
  const { buildPlane } = await import('../src/aircraft/geometry.js');
  const { fleet } = await import('../src/data/aircraft.js');
  for (const code of ['A339', 'B77W']) {
    const aircraft = fleet.find((item) => item.code === code);
    const faces = buildPlane(aircraft);
    const stripe = faces.filter((face) => face.color.join(',') === '231,73,34');
    assert(stripe.length > 20, `${code}: curved orange fuselage stripe`);
    for (const side of [-1, 1]) {
      const tail = faces.filter(
        (face) => face.part?.marking === 'aeroflot-tail-stripe' && face.part.sign === side,
      );
      for (const color of ['238,239,233', '46,94,151', '201,36,50'])
        assert(
          tail.some((face) => face.color.join(',') === color),
          `${code}: tail colour ${color} on side ${side}`,
        );
      assert(
        faces.some(
          (face) =>
            face.part?.marking === 'livery' &&
            face.part.sign === side &&
            face.color.join(',') === '25,69,133',
        ),
        `${code}: side wordmark`,
      );
    }
    assert(
      faces.some((face) => face.color.join(',') === '232,78,35'),
      `${code}: orange engine collar`,
    );
    assert(
      !buildPlane(aircraft, true).some((face) => face.part?.marking === 'aeroflot-tail-stripe'),
      `${code}: clean wireframe`,
    );
  }
  const a330 = buildPlane(fleet.find((item) => item.code === 'A339'));
  assert(
    a330.some((face) => face.color.join(',') === '225,73,35'),
    'A330 orange wingtip',
  );
  console.log('PASS: Aeroflot paint on both sides, engines and A330 wingtips');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
