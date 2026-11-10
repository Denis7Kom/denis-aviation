const assert = require('node:assert/strict');
(async () => {
  const { buildPlane } = await import('../src/aircraft/geometry.js');
  const { fleet } = await import('../src/data/aircraft.js');
  for (const [code, expectedInk] of [
    ['B77W', '25,69,133'],
    ['A333', '74,84,95'],
    ['A321', '20,21,22'],
  ]) {
    const aircraft = fleet.find((item) => item.code === code);
    const solid = buildPlane(aircraft);
    const markings = solid.filter((face) => face.part?.marking === 'livery');
    assert(
      markings.some((face) => face.part.sign === 1),
      `${code} has right-side livery`,
    );
    assert(
      markings.some((face) => face.part.sign === -1),
      `${code} has left-side livery`,
    );
    assert(
      markings.some((face) => face.color.join(',') === expectedInk),
      `${code} airline colour`,
    );
    assert(!buildPlane(aircraft, true).some((face) => face.part?.marking === 'livery'));
    if (code === 'A321') {
      assert(
        solid.some((face) => face.color.join(',') === '247,210,23'),
        'Spirit yellow body',
      );
      const tail = solid.filter((face) => face.part?.marking === 'tail-livery');
      assert(
        tail.some((face) => face.part.sign === 1),
        'Spirit tail has right-side logo',
      );
      assert(
        tail.some((face) => face.part.sign === -1),
        'Spirit tail has left-side logo',
      );
    }
  }
  console.log('PASS: airline markings on both sides and clean wireframe');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
