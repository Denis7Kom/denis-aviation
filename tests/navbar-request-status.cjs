const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const dot = {
  dataset: {},
  setAttribute(name, value) {
    this[name] = value;
  },
};
let authChanged,
  received,
  stopped = 0,
  languageChanged;
const root = { lang: 'ru' };
const context = vm.createContext({
  document: { documentElement: root, querySelector: () => dot },
  MutationObserver: class {
    constructor(cb) {
      languageChanged = cb;
    }
    observe() {}
  },
  appSdk: { getApps: () => [], initializeApp: () => ({}) },
  authSdk: {
    getAuth: () => ({}),
    onAuthStateChanged: (_auth, cb) => {
      authChanged = cb;
    },
  },
  fs: {
    getFirestore: () => ({}),
    collection: (...args) => args,
    where: (...args) => args,
    query: (...args) => args,
    onSnapshot: (_query, next) => {
      received = next;
      return () => stopped++;
    },
  },
});
const source = fs
  .readFileSync('request-status.js', 'utf8')
  .replace(
    /const \[appSdk, authSdk, fs\] = await Promise.all\(\[[\s\S]*?\]\);/,
    'const {appSdk,authSdk,fs}=globalThis;',
  );
vm.runInContext(source, context);
const item = (id, status, ms) => ({
  id,
  data: () => ({
    status,
    createdAt: {
      seconds: Math.floor(ms / 1000),
      nanoseconds: (ms % 1000) * 1000000,
      toMillis: () => ms,
    },
  }),
});
assert.equal(dot.dataset.status, 'none');
authChanged({ uid: 'alice' });
const oldCallback = received;
received({
  docs: [item('older', 'new', Date.now() - 1000), item('latest', 'confirmed', Date.now())],
});
assert.equal(dot.dataset.status, 'confirmed');
root.lang = 'it';
languageChanged();
assert.equal(dot['aria-label'], 'Confermata');
received({ docs: [item('expired', 'review', Date.now() - 366 * 86400000)] });
assert.equal(dot.dataset.status, 'none');
authChanged(null);
assert.equal(stopped, 1);
oldCallback({ docs: [item('private', 'declined', Date.now())] });
assert.equal(dot.dataset.status, 'none', 'Stale account snapshot cannot restore private status');
console.log('PASS: navbar newest status, translation, expiry and account isolation');
