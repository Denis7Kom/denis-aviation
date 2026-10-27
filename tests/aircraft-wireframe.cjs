const fs = require('fs'),
  vm = require('vm'),
  assert = require('assert'),
  path = require('path');
const scope = { window: {}, Math, Map, Set, WeakMap, Float64Array };
vm.createContext(scope);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'aircraft-renderer.js'), 'utf8'), scope);
const renderer = scope.window.createAircraftWireframe();
let strokes = 0,
  begins = 0,
  moves = [],
  lines = [],
  transforms = 0,
  reads = 0;
const context = {
  beginPath() {
    begins++;
  },
  moveTo(x, y) {
    moves.push([x, y]);
  },
  lineTo(x, y) {
    lines.push([x, y]);
  },
  stroke() {
    strokes++;
  },
  fill() {
    throw Error('wireframe must not fill faces');
  },
};
const face = (p) => ({
  get p() {
    reads++;
    return p;
  },
});
const faces = [
  face([
    [0, 0, 0],
    [1, 0, 0],
    [1, 1, 0],
    [0, 1, 0],
  ]),
  face([
    [1, 0, 0],
    [2, 0, 0],
    [2, 1, 0],
    [1, 1, 0],
  ]),
];
const options = {
  width: 400,
  height: 300,
  angle: 0,
  pitch: 0.3,
  scale: 5,
  focus: [0, 0, 0],
  gear: 0,
  transform(p) {
    transforms++;
    return p;
  },
};
renderer.draw(context, faces, options);
assert.equal(renderer.stats.vertices, 6, 'shared vertices stored once');
assert.equal(renderer.stats.edges, 7, 'shared edge drawn once');
assert.equal(strokes, 1);
assert.equal(begins, 1);
assert.equal(transforms, 0, 'static vertices need no articulation');
const firstReads = reads,
  first = moves[1].slice();
moves = [];
lines = [];
renderer.draw(context, faces, { ...options, angle: 1 });
assert.equal(reads, firstReads, 'topology is cached between frames');
assert.notDeepEqual(moves[1], first, 'rotation reprojects cached vertices');
const part = { kind: 'mainGear' },
  moving = [
    {
      p: [
        [0, 0, 0],
        [1, 0, 0],
        [0, 1, 0],
      ],
      part,
    },
  ],
  decals = {
    p: [
      [50, 50, 50],
      [51, 50, 50],
      [50, 51, 50],
    ],
    part: { kind: 'decal' },
  };
moves = [];
renderer.draw(
  context,
  [...moving, decals, { p: decals.p, part: { kind: 'glazing', component: 'mask' } }],
  options,
);
assert.equal(moves.length, 0, 'retracted gear, decals and legacy mask joints are omitted');
transforms = 0;
moves = [];
const extended = {
  ...options,
  gear: 1,
  transform(p) {
    transforms++;
    return [p[0] + 3, p[1] - 2, p[2]];
  },
};
renderer.draw(context, moving, extended);
assert.equal(transforms, 3, 'each moving vertex transformed only once');
assert.equal(moves.length, 3);
assert(moves.flat().every(Number.isFinite));
for (const kind of ['spoiler', 'aileron', 'elevator']) {
  transforms = 0;
  renderer.draw(context, [{ p: moving[0].p, part: { kind } }], extended);
  assert.equal(transforms, 3, `${kind} vertices must be animated in wireframe`);
}
// A stationary slat and the wing beneath it must follow exactly the same bank.
const sample = [{ p: moving[0].p }];
moves = [];
renderer.draw(context, sample, { ...options, roll: 0.18 });
const fixedProjection = moves.map((p) => p.slice());
moves = [];
renderer.draw(context, [{ p: moving[0].p, part: { kind: 'slat' } }], { ...options, roll: 0.18 });
assert.deepEqual(moves, fixedProjection, 'bank rotates wing and stowed slat together');
console.log(
  'PASS: shared edges/vertices deduplicated, one stroke, no fill, cached topology, camera rotation, hidden gear/decals, one transform per moving vertex',
);
