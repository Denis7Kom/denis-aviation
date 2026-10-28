/** Pointer gestures for the aircraft canvas. Page scrolling remains available outside it. */
export function bindModelGestures(canvas, { read, rotate, zoom, dragging }) {
  const pointers = new Map();
  let anchor = null;
  function rebase() {
    const points = [...pointers.values()];
    if (!points.length) {
      anchor = null;
      dragging(false);
      return;
    }
    const state = read();
    dragging(true);
    anchor =
      points.length > 1
        ? {
            distance: Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y) || 1,
            zoom: state.zoom,
          }
        : { x: points[0].x, y: points[0].y, angle: state.angle, pitch: state.pitch };
  }
  canvas.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    canvas.setPointerCapture(event.pointerId);
    rebase();
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!pointers.has(event.pointerId) || !anchor) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = [...pointers.values()];
    if (points.length > 1 && anchor.distance) {
      const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      zoom((anchor.zoom * distance) / anchor.distance);
    } else if (points.length === 1 && anchor.x !== undefined) {
      rotate(
        anchor.angle + (points[0].x - anchor.x) * 0.012,
        anchor.pitch + (points[0].y - anchor.y) * 0.008,
      );
    }
  });
  function finish(event) {
    if (!pointers.delete(event.pointerId)) return;
    rebase();
  }
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture'])
    canvas.addEventListener(name, finish);
  canvas.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1;
      zoom(read().zoom * Math.exp(-event.deltaY * unit * 0.0015));
    },
    { passive: false },
  );
}
