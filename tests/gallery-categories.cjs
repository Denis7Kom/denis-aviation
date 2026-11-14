const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  vm = require('node:vm');
const s = fs.readFileSync('src/main.js', 'utf8'),
  part = s.slice(
    s.indexOf('  function galleryText()'),
    s.indexOf('  // Stage only visible sections;'),
  );
const win = {};
vm.runInNewContext(fs.readFileSync('gallery-data.js', 'utf8'), { window: win });
const gallery = win.DK_GALLERY,
  filters = ['all', 'together', 'atc', 'aircraft', 'views'].map((x) => ({
    dataset: { galleryFilter: x },
    attrs: {},
    addEventListener(k, f) {
      this.click = f;
    },
    setAttribute(k, v) {
      this.attrs[k] = v;
    },
  }));
let frames = [];
const nodes = {};
function node() {
  return {
    hidden: false,
    open: false,
    dataset: {},
    attrs: {},
    children: [],
    addEventListener(k, f) {
      this[k] = f;
    },
    append(x) {
      this.children.push(x);
    },
    querySelector(s) {
      return s === 'img' ? this.children[0] : this.children[1];
    },
    setAttribute(k, v) {
      this.attrs[k] = v;
    },
    removeAttribute(k) {
      delete this.attrs[k];
    },
    showModal() {
      this.open = true;
    },
    close() {
      this.open = false;
    },
    focus() {},
  };
}
for (const id of [
  '#gallery',
  '#gallery-link',
  '#gallery-grid',
  '#gallery-title',
  '#gallery-caption',
  '#gallery-dialog',
  '#gallery-image',
  '#gallery-counter',
  '#gallery-close',
  '#gallery-prev',
  '#gallery-next',
  '.lightbox-caption',
])
  nodes[id] = node();
nodes['#gallery-grid'].append = (x) => frames.push(x);
const context = {
  gallery,
  galleryIndex: 0,
  galleryOpener: null,
  galleryVisible: gallery.map((_, i) => i),
  lang: 'ru',
  document: { createElement: () => node() },
  $: (s) => nodes[s],
  $$: (s) => (s === '[data-gallery-filter]' ? filters : frames),
};
vm.runInNewContext(part, context);
assert.equal(frames.length, 51);
for (const f of filters) {
  f.click();
  const visible = frames.filter((x) => !x.hidden),
    expected = gallery.filter(
      (x) => f.dataset.galleryFilter === 'all' || x.categories.includes(f.dataset.galleryFilter),
    );
  assert.equal(visible.length, expected.length);
  assert(visible.length);
  assert.equal(f.attrs['aria-pressed'], 'true');
  visible[0].click();
  assert.equal(nodes['#gallery-counter'].textContent, `1 / ${visible.length}`);
  nodes['#gallery-next'].click();
  assert.equal(
    nodes['#gallery-counter'].textContent,
    `${visible.length === 1 ? 1 : 2} / ${visible.length}`,
  );
}
console.log('PASS: gallery filters, accessible state, and filtered navigation');
