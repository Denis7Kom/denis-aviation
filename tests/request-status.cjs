const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

class Element {
  constructor(tag = 'div') {
    this.tag = tag;
    this.dataset = {};
    this.children = [];
    this.listeners = {};
    this.textContent = '';
    this.value = '';
    this.disabled = false;
  }
  append(...items) {
    this.children.push(...items);
  }
  replaceChildren(...items) {
    this.children = items;
  }
  addEventListener(name, handler) {
    this.listeners[name] = handler;
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
  createElement(tag) {
    return new Element(tag);
  },
};
document.querySelector('#form').elements = { timezone: {} };
const localStorage = { getItem: () => 'ru', setItem() {} };
let callback,
  updateFails = false;
const updates = [];
const context = vm.createContext({
  document,
  localStorage,
  Intl,
  console,
  fakeCollection: () => 'requests',
  fakeWhere: (...args) => args,
  fakeQuery: (...args) => args,
  fakeDoc: (...args) => args,
  fakeOnSnapshot: (_q, cb) => {
    callback = cb;
    return () => {};
  },
  fakeUpdate: async (_doc, payload) => {
    if (updateFails) throw Error('offline');
    updates.push(payload.status);
  },
});
const source = fs.readFileSync('requests.js', 'utf8').split('async function start()')[0];
vm.runInContext(source, context);
vm.runInContext(
  `db = {}; collection = fakeCollection; where = fakeWhere; query = fakeQuery;
  doc = fakeDoc; updateDoc = fakeUpdate; onSnapshot = fakeOnSnapshot;`,
  context,
);
const fakeDoc = (status) => ({
  id: status,
  data: () => ({
    type: 'flight',
    network: 'VATSIM',
    date: '2026-10-29',
    time: '12:00',
    timezone: 'UTC',
    callsign: 'TEST',
    route: 'LIRN',
    contact: 'test',
    notes: '',
    status,
  }),
});
const render = () =>
  callback({
    empty: false,
    docs: ['new', 'review', 'confirmed', 'declined', 'completed'].map(fakeDoc),
  });
(async () => {
  vm.runInContext(
    `user = {uid:'visitor',email:'visitor@example.com',emailVerified:true,providerData:[{providerId:'google.com'}]}; subscribe();`,
    context,
  );
  render();
  let cards = elements.get('#list').children;
  assert.deepEqual(
    cards.map((c) => c.dataset.status),
    ['new', 'review', 'confirmed', 'declined', 'completed'],
  );
  assert(
    cards.every(
      (c) =>
        c.children[2].className === 'request-status' &&
        c.children[2].textContent.includes('Статус'),
    ),
  );
  vm.runInContext(
    `user = {uid:'admin',email:'deniska7best@gmail.com',emailVerified:true,providerData:[{providerId:'google.com'}]}; subscribe();`,
    context,
  );
  render();
  cards = elements.get('#list').children;
  const select = cards[0].children[2].children[1];
  select.value = 'confirmed';
  await select.listeners.change();
  assert.equal(updates[0], 'confirmed');
  assert.equal(cards[0].dataset.status, 'confirmed');
  updateFails = true;
  select.value = 'declined';
  await select.listeners.change();
  assert.equal(cards[0].dataset.status, 'new');
  assert.equal(select.value, 'new');
  console.log(
    'PASS: visitor status labels, administrator status colours, saved and failed updates',
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
