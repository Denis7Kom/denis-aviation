const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

class Element {
  constructor() {
    this.dataset = {};
    this.children = [];
    this.listeners = {};
    this.value = '';
    this.textContent = '';
  }
  append(...items) {
    this.children.push(...items);
  }
  replaceChildren(...items) {
    this.children = items;
  }
  addEventListener(name, fn) {
    this.listeners[name] = fn;
  }
  setAttribute(name, value) {
    this[name] = value;
  }
  scrollIntoView() {
    this.scrolled = true;
  }
  focus() {
    this.focused = true;
  }
}
const elements = new Map();
const document = {
  documentElement: {},
  querySelector(selector) {
    if (!elements.has(selector)) elements.set(selector, new Element());
    return elements.get(selector);
  },
  querySelectorAll() {
    return [];
  },
  createElement() {
    return new Element();
  },
};
document.querySelector('#form').elements = { timezone: new Element() };
const alerts = [];
class NotificationMock {
  static permission = 'default';
  static async requestPermission() {
    this.permission = 'granted';
    return this.permission;
  }
  constructor(title, options) {
    this.title = title;
    this.options = options;
    alerts.push(this);
  }
  close() {}
}
let callback, onError;
const storage = new Map();
const context = vm.createContext({
  document,
  Intl,
  console,
  URLSearchParams,
  Notification: NotificationMock,
  window: { location: { search: '' }, focus() {} },
  localStorage: {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value),
  },
  fakeCollection: () => 'requests',
  fakeWhere: (...args) => args,
  fakeQuery: (...args) => args,
  fakeOnSnapshot: (_query, options, cb, error) => {
    if (typeof options === 'function' || _query.includes('message-order')) return () => {};
    assert.equal(options.includeMetadataChanges, true);
    callback = cb;
    onError = error;
    return () => {};
  },
});
const source = fs.readFileSync('requests.js', 'utf8').split('async function start()')[0];
vm.runInContext(source, context);
vm.runInContext(
  'db = {}; collection = fakeCollection; where = fakeWhere; query = fakeQuery; onSnapshot = fakeOnSnapshot; orderBy = (_field, direction) => direction === "desc" ? "request-order" : "message-order"; limitToLast = (...args) => args; limit = (...args) => args;',
  context,
);
const request = (id, status = 'new', pending = false, overrides = {}) => ({
  id,
  metadata: { hasPendingWrites: pending },
  data: () => ({
    status,
    type: 'flight',
    network: 'VATSIM',
    date: '2026-11-01',
    time: '12:00',
    timezone: 'UTC',
    callsign: 'TEST',
    route: 'LIRN',
    contact: 'test',
    notes: '',
    ...overrides,
  }),
});
function snapshot(docs, fromCache = false) {
  callback({ docs, empty: !docs.length, metadata: { fromCache } });
}
(async () => {
  const queries = [];
  context.captureQuery = (...args) => {
    queries.push(args);
    return args;
  };
  context.cursor = (item) => ['after', item.id];
  vm.runInContext(
    "serviceConfig={secureApi:true};query=captureQuery;startAfter=cursor;user={uid:'admin',email:'deniska7best@gmail.com',emailVerified:true,providerData:[{providerId:'google.com'}]};subscribe()",
    context,
  );
  assert(
    queries[0].some((part) => Array.isArray(part) && part[0] === 21),
    'Read at most twenty entries plus the next-page sentinel',
  );
  snapshot(
    Array.from({ length: 21 }, (_, i) =>
      request('r' + i, 'new', false, { createdAt: { seconds: 100 - i } }),
    ),
  );
  assert.equal(elements.get('#list').children.length, 20);
  assert.equal(elements.get('#requests-next').disabled, false);
  elements.get('#requests-next').listeners.click();
  assert(
    queries.some((query) =>
      query.some((part) => Array.isArray(part) && part[0] === 'after' && part[1] === 'r19'),
    ),
  );
  snapshot([request('r20')]);
  assert.equal(elements.get('#list').children.length, 1);
  assert.equal(elements.get('#requests-next').disabled, true);
  assert.equal(elements.get('#requests-previous').disabled, false);
  elements.get('#requests-previous').listeners.click();
  snapshot([request('r0')]);
  assert.equal(elements.get('#requests-previous').disabled, true);
  elements.get('#status-filter').value = 'review';
  elements.get('#status-filter').listeners.change();
  assert(
    queries
      .at(-1)
      .some((part) => Array.isArray(part) && part[0] === 'status' && part[2] === 'review'),
    'Status is filtered in Firestore',
  );
  vm.runInContext('serviceConfig={};subscribe()', context);
  assert(
    !queries.at(-1).some((part) => Array.isArray(part) && part[0] === 'status'),
    'Existing installations need no new composite index until activation',
  );
  console.log(
    'PASS: bounded admin reads, page cursors, previous navigation and server status filtering',
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
