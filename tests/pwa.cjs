const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const vm = require('node:vm');

const manifest = JSON.parse(readFileSync('manifest.webmanifest', 'utf8'));
assert.equal(manifest.start_url, './');
assert.equal(manifest.scope, './');
assert.equal(manifest.display, 'standalone');
for (const size of ['192x192', '512x512']) {
  const icon = manifest.icons.find((entry) => entry.sizes === size && entry.type === 'image/png');
  assert(icon && existsSync(icon.src), `Missing ${size} PNG icon`);
  const png = readFileSync(icon.src);
  const [width, height] = size.split('x').map(Number);
  assert.equal(png.readUInt32BE(16), width);
  assert.equal(png.readUInt32BE(20), height);
}

const handlers = {};
const entries = new Map();
let offline = false;
const resolve = (url) =>
  new URL(typeof url === 'string' ? url : url.url, 'https://example.com/denis-aviation/').href;
const response = (body) => ({
  ok: true,
  body,
  clone() {
    return response(this.body);
  },
});
const cache = {
  async addAll(urls) {
    for (const url of urls) entries.set(resolve(url), response(`cached ${url}`));
  },
  async put(url, value) {
    entries.set(resolve(url), value);
  },
};
const caches = {
  async open() {
    return cache;
  },
  async match(url) {
    return entries.get(resolve(url));
  },
  async keys() {
    return ['denis-aviation-old', 'unrelated-app'];
  },
  async delete(key) {
    deleted.push(key);
  },
};
const deleted = [];
const self = {
  location: { origin: 'https://example.com' },
  registration: { scope: 'https://example.com/denis-aviation/' },
  clients: { async claim() {} },
  addEventListener(type, fn) {
    handlers[type] = fn;
  },
};
vm.runInNewContext(readFileSync('sw.js', 'utf8'), {
  self,
  caches,
  URL,
  Response: { error: () => ({ ok: false }) },
  fetch: async () => {
    if (offline) throw new Error('offline');
    return response('network');
  },
});
(async () => {
  let task;
  handlers.install({
    waitUntil(promise) {
      task = promise;
    },
  });
  await task;
  assert(entries.has(resolve('./index.html')), 'Entry page is cached');
  for (const src of ['style.css?v=languages-77', 'app.js?v=italiano-77', 'assets/hero-night.png']) {
    assert(entries.has(resolve(src)), `Missing offline resource ${src}`);
    assert(existsSync(src.split('?')[0]));
  }
  handlers.activate({
    waitUntil(promise) {
      task = promise;
    },
  });
  await task;
  assert.deepEqual(deleted, ['denis-aviation-old']);
  const handle = async (request) => {
    let result;
    handlers.fetch({
      request,
      respondWith(promise) {
        result = promise;
      },
    });
    return result ? await result : undefined;
  };
  const navigation = {
    method: 'GET',
    mode: 'navigate',
    url: resolve('./'),
    destination: 'document',
  };
  assert.equal((await handle(navigation)).body, 'network');
  offline = true;
  assert.equal(
    (await handle(navigation)).body,
    'network',
    'Offline navigation returns the last online page',
  );
  assert.equal(
    (
      await handle({
        method: 'GET',
        mode: 'cors',
        url: resolve('./app.js?v=italiano-77'),
        destination: 'script',
      })
    ).ok,
    true,
  );
  assert.equal(await handle({ ...navigation, method: 'POST' }), undefined);
  assert.equal(await handle({ ...navigation, url: 'https://elsewhere.example/' }), undefined);
  assert.equal(
    await handle({ ...navigation, url: resolve('./assets/Denis-Komarov-Flight-Experience.pdf') }),
    undefined,
  );
  console.log('PASS: PWA manifest, icons, cache lifecycle, online and offline requests');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
