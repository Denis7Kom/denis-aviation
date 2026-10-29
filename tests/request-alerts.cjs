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
const context = vm.createContext({
  document,
  Intl,
  console,
  URLSearchParams,
  Notification: NotificationMock,
  window: { location: { search: '' }, focus() {} },
  localStorage: { getItem: () => 'ru', setItem() {} },
  fakeCollection: () => 'requests',
  fakeWhere: (...args) => args,
  fakeQuery: (...args) => args,
  fakeOnSnapshot: (_query, options, cb, error) => {
    assert.equal(options.includeMetadataChanges, true);
    callback = cb;
    onError = error;
    return () => {};
  },
});
const source = fs.readFileSync('requests.js', 'utf8').split('async function start()')[0];
vm.runInContext(source, context);
vm.runInContext(
  'db = {}; collection = fakeCollection; where = fakeWhere; query = fakeQuery; onSnapshot = fakeOnSnapshot;',
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
  vm.runInContext(
    "user = {uid:'admin',email:'deniska7best@gmail.com',emailVerified:true,providerData:[{providerId:'google.com'}]}; subscribe();",
    context,
  );
  assert.equal(NotificationMock.permission, 'default', 'Permission is not requested on load');
  await elements.get('#enable-browser-alerts').listeners.click();
  assert.equal(NotificationMock.permission, 'granted');
  snapshot([request('old')], true);
  snapshot([
    request('old', 'new', false, { createdAt: { seconds: 1 } }),
    request('older', 'new', false, { createdAt: { seconds: 2 }, callsign: 'LATEST' }),
  ]);
  assert.equal(alerts.length, 0, 'Initial cached and server documents are not new arrivals');
  assert.match(elements.get('#admin-alert-count').textContent, /2/);
  assert.match(
    elements.get('#admin-alert-details').textContent,
    /LATEST/,
    'The most recent new request is shown',
  );
  assert.equal(elements.get('#admin-alert-preview').hidden, false);
  assert.match(document.title, /^\(2\)/);
  snapshot([request('old'), request('older'), request('new')], true);
  assert.equal(alerts.length, 0, 'Cached changes do not trigger notifications');
  snapshot([
    request('old'),
    request('older'),
    request('new', 'new', false, { notes: 'Подробности теста', route: '<test-route>' }),
  ]);
  assert.equal(alerts.length, 1);
  for (const expected of [
    'Совместный полёт',
    'VATSIM',
    '2026-11-01',
    '12:00',
    'UTC',
    'TEST',
    '<test-route>',
    'test',
    'Подробности теста',
  ])
    assert(alerts[0].options.body.includes(expected), `Notification contains ${expected}`);
  assert.match(elements.get('#admin-alert-details').textContent, /Подробности теста/);
  elements.get('#status-filter').value = 'confirmed';
  elements.get('#request-search').value = 'hidden';
  alerts[0].onclick();
  assert.equal(elements.get('#status-filter').value, 'all');
  assert.equal(elements.get('#request-search').value, '');
  assert(
    elements.get('#list').children.find((card) => card.dataset.requestId === 'new').focused,
    'Notification opens the matching request',
  );
  snapshot([request('old', 'review'), request('older'), request('new')]);
  assert.equal(alerts.length, 1, 'Status changes do not trigger another alert');
  snapshot([
    request('old', 'new', true),
    request('older'),
    request('new'),
    request('pending', 'new', true),
  ]);
  snapshot([request('old'), request('older'), request('new'), request('pending')]);
  assert.equal(alerts.length, 2, 'Only the newly confirmed request triggers an alert');
  snapshot([
    request('old'),
    request('older'),
    request('new'),
    request('pending'),
    request('batch-a', 'new', false, { callsign: 'FIRST' }),
    request('batch-b', 'new', false, { callsign: 'SECOND' }),
  ]);
  assert.equal(alerts.length, 4, 'Each simultaneously arriving request gets its own notification');
  assert.match(alerts[2].options.body, /FIRST/);
  assert.match(alerts[3].options.body, /SECOND/);
  elements.get('#request-search').value = 'hidden';
  elements.get('#show-new-requests').listeners.click();
  assert.equal(elements.get('#status-filter').value, 'new');
  assert.equal(elements.get('#request-search').value, '');
  onError();
  assert.match(elements.get('#admin-alert-count').textContent, /Не удалось/);
  assert.equal(elements.get('#admin-alert-details').textContent, '');
  assert.doesNotMatch(document.title, /^\(/);
  vm.runInContext(
    "user = {uid:'visitor',email:'visitor@example.com',emailVerified:true,providerData:[{providerId:'google.com'}]}; adminKnownIds = null; subscribe();",
    context,
  );
  snapshot([request('visitor')]);
  assert.equal(alerts.length, 4, 'Visitor receives no administrator alert');
  assert.equal(elements.get('#admin-alert-count').textContent, '');
  assert.equal(elements.get('#admin-alert-preview').hidden, true);
  console.log(
    'PASS: administrator alerts, cached snapshots, status updates, permissions and visitor isolation',
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
