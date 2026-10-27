const fs = require('fs'),
  vm = require('vm'),
  assert = require('assert'),
  path = require('path');
let image;
const surface = {
  width: 0,
  height: 0,
  getContext(kind) {
    return kind === '2d'
      ? {
          createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
          putImageData: (data) => {
            image = data.data.slice();
          },
        }
      : null;
  },
};
const ctx = {
  window: {},
  document: { createElement: () => surface },
  Float32Array,
  Uint8ClampedArray,
  Math,
  Set,
  Object,
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'aircraft-renderer.js'), 'utf8'), ctx);
const renderer = ctx.window.createAircraftRenderer();
assert.equal(renderer.mode, 'software-depth');
const red = {
    p: [
      [-10, -10, -10],
      [10, -10, 10],
      [10, 10, 10],
      [-10, 10, -10],
    ],
    color: [255, 0, 0],
  },
  blue = {
    p: [
      [-10, -10, 0],
      [10, -10, 0],
      [10, 10, 0],
      [-10, 10, 0],
    ],
    color: [0, 0, 255],
  };
const options = {
  width: 200,
  height: 160,
  dpr: 1,
  angle: 0,
  pitch: 0,
  scale: 5,
  focus: [0, 0, 0],
  gear: 0,
  transform: (p) => p,
};
assert(renderer.draw({ drawImage() {} }, [red, blue], options));
const sample = (x, y) => Array.from(image.slice((y * 200 + x) * 4, (y * 200 + x) * 4 + 4));
let a = sample(75, 77),
  b = sample(125, 77);
assert(a[0] > a[2] && a[3] === 255, 'left intersection shows nearer red plane');
assert(b[2] > b[0] && b[3] === 255, 'right intersection shows nearer blue plane');
const first = image.slice();
renderer.draw({ drawImage() {} }, [blue, red], options);
assert.deepEqual(image, first, 'depth occlusion is independent of draw order');
assert.equal(sample(0, 0)[3], 0, 'background remains transparent');
for (const kind of ['spoiler', 'aileron', 'elevator']) {
  let calls = 0;
  renderer.draw({ drawImage() {} }, [{ ...red, part: { kind } }], {
    ...options,
    transform: (p) => {
      calls++;
      return p;
    },
  });
  assert(calls > 0, `${kind} must be transformed in software rendering`);
}
const banked = { ...options, roll: 0.18 };
renderer.draw({ drawImage() {} }, [red], banked);
const staticImage = image.slice();
renderer.draw({ drawImage() {} }, [{ ...red, part: { kind: 'slat' } }], banked);
assert.deepEqual(image, staticImage, 'bank moves fixed wing and stationary slat identically');
console.log(
  'PASS: intersecting surfaces occlude per pixel, submission order has no effect, transparent background, WebGL-free fallback',
);
