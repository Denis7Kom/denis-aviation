const assert = require('node:assert/strict');
(async () => {
  const { bindModelGestures } = await import('../src/aircraft/model-gestures.js');
  const listeners = new Map();
  const canvas = {
    addEventListener(name, handler) {
      listeners.set(name, handler);
    },
    setPointerCapture() {},
  };
  let state = { angle: 0, pitch: 0, zoom: 1 },
    active = false;
  bindModelGestures(canvas, {
    read: () => state,
    rotate: (angle, pitch) => {
      state.angle = angle;
      state.pitch = pitch;
    },
    zoom: (zoom) => {
      state.zoom = zoom;
    },
    dragging: (value) => {
      active = value;
    },
  });
  const send = (type, id, x, y, extra = {}) =>
    listeners.get(type)({
      pointerId: id,
      clientX: x,
      clientY: y,
      pointerType: 'touch',
      button: 0,
      ...extra,
    });
  send('pointerdown', 1, 0, 0);
  send('pointermove', 1, 20, 10);
  assert(state.angle > 0 && state.pitch > 0 && active, 'one finger rotates in both axes');
  const previous = { ...state };
  send('pointerdown', 2, 120, 10);
  send('pointermove', 2, 220, 10);
  assert.equal(state.zoom, 2, 'pinch scales by the change in finger spacing');
  assert.equal(state.angle, previous.angle, 'pinch does not rotate the aircraft');
  send('pointerup', 2, 220, 10);
  send('pointermove', 1, 20, 10);
  assert.equal(state.angle, previous.angle, 'transition from pinch to drag does not jump');
  send('pointercancel', 1, 20, 10);
  assert.equal(active, false, 'cancel releases interaction');
  let prevented = false;
  listeners.get('wheel')({
    deltaY: -100,
    deltaMode: 0,
    preventDefault() {
      prevented = true;
    },
  });
  assert(prevented && state.zoom > 2, 'wheel zooms and consumes the canvas scroll');
  console.log('PASS: drag, pinch, wheel and gesture transitions');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
