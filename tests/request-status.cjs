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
  setAttribute(name, value) {
    this[name] = value;
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
document.querySelector('#form').elements = { timezone: new Element() };
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
  fakeOnSnapshot: (_q, _options, cb) => {
    callback = cb;
    return () => {};
  },
  fakeUpdate: async (_doc, payload) => {
    if (updateFails) throw Error('offline');
    updates.push(payload);
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
    contact: status === 'review' ? '@Controller' : 'test',
    ownerEmail: 'pilot@example.invalid',
    adminComment: 'Flight approved',
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
    cards.every((c) =>
      c.children.some(
        (child) => child.className === 'request-status' && child.textContent.includes('Статус'),
      ),
    ),
  );
  assert(
    cards.every((c) => !c.children[1].textContent.includes('pilot@example.invalid')),
    'Visitor does not see account email in the card',
  );
  assert(
    cards.every((c) => c.children.some((child) => child.textContent.includes('Flight approved'))),
    'Owner sees administrator comment',
  );
  vm.runInContext(
    `user = {uid:'admin',email:'deniska7best@gmail.com',emailVerified:true,providerData:[{providerId:'google.com'}]}; subscribe();`,
    context,
  );
  render();
  assert(
    elements
      .get('#list')
      .children.every((c) => c.children[1].textContent.includes('pilot@example.invalid')),
    'Admin sees account email',
  );
  assert.equal(elements.get('#count-new').textContent, '1');
  assert.equal(elements.get('#count-review').textContent, '1');
  assert.equal(elements.get('#count-confirmed').textContent, '1');
  elements.get('#request-search').value = 'lirn';
  elements.get('#request-search').listeners.input();
  assert.equal(elements.get('#list').children.length, 5);
  elements.get('#request-search').value = 'CONTROLLER';
  elements.get('#request-search').listeners.input();
  assert.deepEqual(
    elements.get('#list').children.map((card) => card.dataset.status),
    ['review'],
  );
  elements.get('#status-filter').value = 'confirmed';
  elements.get('#status-filter').listeners.change();
  assert.match(elements.get('#list').children[0].textContent, /условиям/);
  elements.get('#status-filter').value = 'all';
  elements.get('#request-search').value = 'absent';
  elements.get('#request-search').listeners.input();
  assert.match(elements.get('#list').children[0].textContent, /условиям/);
  assert.equal(
    elements.get('#count-new').textContent,
    '1',
    'Counts include all statuses regardless of search',
  );
  elements.get('#request-search').value = '';
  elements.get('#request-search').listeners.input();
  elements.get('#status-filter').value = 'confirmed';
  elements.get('#status-filter').listeners.change();
  render();
  assert.deepEqual(
    elements.get('#list').children.map((card) => card.dataset.status),
    ['confirmed'],
  );
  elements.get('#status-filter').value = 'all';
  elements.get('#status-filter').listeners.change();
  render();
  cards = elements.get('#list').children;
  const editor = cards[0].children[3].children[1];
  const saveComment = cards[0].children[4];
  assert.equal(editor.value, 'Flight approved');
  editor.value = 'Updated message';
  await saveComment.listeners.click();
  assert.equal(updates[0].adminComment, 'Updated message');
  const select = cards[0].children[2].children[1];
  select.value = 'confirmed';
  await select.listeners.change();
  assert.equal(updates[1].status, 'confirmed');
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
