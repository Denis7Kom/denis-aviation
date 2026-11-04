const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
class Element {
  constructor() {
    Object.assign(this, {
      dataset: {},
      children: [],
      listeners: {},
      value: '',
      textContent: '',
      hidden: false,
    });
  }
  append(...items) {
    this.children.push(...items);
  }
  replaceChildren(...items) {
    this.children = items;
  }
  setAttribute(name, value) {
    this[name] = value;
  }
  addEventListener(name, cb) {
    this.listeners[name] = cb;
  }
}
const elements = new Map();
const document = {
  documentElement: {},
  querySelector(key) {
    if (!elements.has(key)) elements.set(key, new Element());
    return elements.get(key);
  },
  querySelectorAll() {
    return [];
  },
  createElement() {
    return new Element();
  },
};
document.querySelector('#form').elements = { timezone: new Element() };
const subscriptions = [],
  alerts = [],
  opened = [];
class Notification {
  static permission = 'granted';
  static requestPermission() {}
  constructor(title, options) {
    this.title = title;
    this.options = options;
    alerts.push(this);
  }
  close() {}
}
const context = vm.createContext({
  document,
  localStorage: { getItem: () => null, setItem() {} },
  Intl,
  Notification,
  fakeCollection: (...args) => args,
  fakeQuery: (...args) => args,
  fakeOrder: (...args) => args,
  fakeSubscribe: (_query, _options, cb) => {
    if (typeof _options === 'function') return () => {};
    const entry = { cb, stopped: false };
    subscriptions.push(entry);
    return () => {
      entry.stopped = true;
    };
  },
  fakeOpen: (id) => opened.push(id),
});
vm.runInContext(fs.readFileSync('requests.js', 'utf8').split('async function start()')[0], context);
vm.runInContext(
  `db={};collection=fakeCollection;query=fakeQuery;orderBy=fakeOrder;limitToLast=fakeOrder;onSnapshot=fakeSubscribe;user={uid:'alice'};openRequestFromAlert=fakeOpen;`,
  context,
);
const requests = {
  docs: [
    {
      id: 'one',
      data: () => ({
        owner: 'alice',
        callsign: 'RYR3152',
        route: 'SVO → NAP',
        contact: 'SECRET_CONTACT',
        notes: 'SECRET_NOTES',
      }),
    },
  ],
};
context.requests = requests;
context.card = new Element();
vm.runInContext('attachChat(card, requests.docs[0])', context);
assert.equal(
  context.card.children[0].children[1].children[1].children[0].children[1].maxLength,
  150,
);
const snapshot = (id, author = 'admin', metadata = {}, docMetadata = {}) => ({
  metadata,
  docs: id
    ? [
        {
          id,
          metadata: docMetadata,
          data: () => ({
            authorUid: author,
            authorRole: author === 'admin' ? 'admin' : 'client',
            body: 'Ответ',
          }),
        },
      ]
    : [],
});
vm.runInContext('syncMessageWatchers(requests)', context);
assert.equal(subscriptions.length, 1);
subscriptions[0].cb(snapshot('old'));
assert.equal(alerts.length, 0, 'History is not a new message');
vm.runInContext('syncMessageWatchers(requests)', context);
assert.equal(subscriptions.length, 1, 'Rerendering does not duplicate watchers');
subscriptions[0].cb(snapshot('new'));
assert.equal(alerts.length, 1);
assert(!alerts[0].options.body.includes('SECRET_CONTACT'));
assert(!alerts[0].options.body.includes('SECRET_NOTES'));
assert.equal(context.card.children[0].dataset.unread, 'true');
assert.equal(document.querySelector('#message-alert').hidden, false);
assert.match(document.querySelector('#message-alert-body').textContent, /RYR3152/);
subscriptions[0].cb(snapshot('new'));
assert.equal(alerts.length, 1, 'Repeated snapshot is not a duplicate alert');
alerts[0].onclick();
assert.deepEqual(opened, ['one']);
assert.equal(document.querySelector('#message-alert').hidden, true);
assert.equal(vm.runInContext("messageAlerts.has('one')", context), false);
subscriptions[0].cb(snapshot('own', 'alice'));
assert.equal(alerts.length, 1);
subscriptions[0].cb(snapshot('cached', 'admin', { fromCache: true }));
assert.equal(alerts.length, 1);
subscriptions[0].cb(snapshot('pending', 'admin', {}, { hasPendingWrites: true }));
assert.equal(alerts.length, 1);
subscriptions[0].cb(snapshot('pending'));
assert.equal(alerts.length, 2, 'Server-confirmed reply alerts once');
Notification.permission = 'denied';
subscriptions[0].cb(snapshot('onsite'));
assert.equal(alerts.length, 2);
assert.equal(
  document.querySelector('#message-alert').hidden,
  false,
  'On-site alerts work without browser permission',
);
vm.runInContext('clearMessageWatchers()', context);
assert(subscriptions[0].stopped);
subscriptions[0].cb(snapshot('stale'));
assert.equal(
  document.querySelector('#message-alert').hidden,
  true,
  'Detached listeners cannot restore private messages',
);
Notification.permission = 'granted';
vm.runInContext(
  "user={uid:'admin',email:'deniska7best@gmail.com',emailVerified:true,providerData:[{providerId:'google.com'}]};syncMessageWatchers(requests)",
  context,
);
subscriptions[1].cb(snapshot(null));
subscriptions[1].cb(snapshot('client-reply', 'alice'));
assert.equal(alerts.length, 3, 'Administrator receives client reply');
subscriptions[1].cb(snapshot('admin-own', 'admin'));
assert.equal(alerts.length, 3);
vm.runInContext('syncMessageWatchers({docs:[]})', context);
assert(subscriptions[1].stopped, 'Removed requests stop message subscriptions');
console.log(
  'PASS: client/admin message alerts, deduplication, history/cache/pending suppression, own messages, permissions and account cleanup',
);
