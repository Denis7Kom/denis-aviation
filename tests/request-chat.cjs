const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
class Element {
  constructor(tag = 'div') {
    Object.assign(this, {
      tag,
      dataset: {},
      children: [],
      listeners: {},
      textContent: '',
      value: '',
      disabled: false,
    });
  }
  append(...items) {
    this.children.push(...items);
  }
  replaceChildren(...items) {
    this.children = items;
    this.textContent = '';
  }
  addEventListener(event, handler) {
    this.listeners[event] = handler;
  }
  setAttribute(key, value) {
    this[key] = value;
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
  createElement(tag) {
    return new Element(tag);
  },
};
document.querySelector('#form').elements = { timezone: new Element(), notes: new Element() };
const bar = document.querySelector('#daily-usage');
bar.append(...Array.from({ length: 5 }, () => new Element()));
const writes = [];
let listener,
  stopped = 0,
  fail = false;
const context = vm.createContext({
  document,
  localStorage: { getItem: () => null, setItem() {} },
  Intl,
  console,
  fakeCollection: (...args) => args,
  fakeQuery: (...args) => args,
  fakeOrder: (...args) => args,
  fakeSnapshot: (_query, next) => {
    listener = next;
    return () => stopped++;
  },
  fakeAdd: async (ref, payload) => {
    if (fail) throw Error('offline');
    writes.push({ ref, payload });
  },
  fakeStamp: () => 'server-time',
  fakeTimestamp: { fromMillis: (ms) => ({ toMillis: () => ms }) },
});
vm.runInContext(fs.readFileSync('requests.js', 'utf8').split('async function start()')[0], context);
vm.runInContext(
  `user={uid:'alice',email:'alice@example.invalid'};db={};collection=fakeCollection;query=fakeQuery;orderBy=fakeOrder;limitToLast=fakeOrder;onSnapshot=fakeSnapshot;addDoc=fakeAdd;serverTimestamp=fakeStamp;Timestamp=fakeTimestamp;`,
  context,
);
const created = Date.now();
context.item = {
  id: 'request-id',
  data: () => ({
    createdAt: { toMillis: () => created },
  }),
};
context.card = new Element();
vm.runInContext('attachChat(card,item)', context);
const [shell] = context.card.children;
const [, panel] = shell.children;
const [history, composer] = panel.children;
const [label, actions, feedback] = composer.children;
const [, input] = label.children;
const [, send] = actions.children;
(async () => {
  assert.notEqual(panel.hidden, true);
  assert.equal(typeof listener, 'function', 'History loads without opening a conversation');
  assert(!shell.children.some((child) => child.className === 'chat-toggle'));
  assert.equal(send.disabled, true);
  const hostile = '<img src=x onerror=alert(1)>';
  listener({
    empty: false,
    docs: [
      {
        data: () => ({
          authorUid: 'admin',
          authorRole: 'admin',
          body: hostile,
          createdAt: { toDate: () => new Date() },
        }),
      },
    ],
  });
  assert.equal(history.children[0].children[1].textContent, hostile, 'Message is text, never HTML');
  assert.equal(history.children[0].dataset.own, 'false');
  input.value = '  Ответ клиента  ';
  input.listeners.input();
  assert.equal(send.disabled, false);
  await composer.listeners.submit({ preventDefault() {} });
  assert.equal(writes.length, 1);
  assert.equal(writes[0].payload.body, 'Ответ клиента');
  assert.equal(writes[0].payload.authorUid, 'alice');
  assert.equal(writes[0].payload.authorRole, 'client');
  assert.equal(input.value, '');
  input.value = 'a'.repeat(150);
  input.listeners.input();
  await composer.listeners.submit({ preventDefault() {} });
  assert.equal(writes.length, 2);
  assert.equal(writes[1].payload.body.length, 150);
  fail = true;
  input.value = 'Не потерять';
  input.listeners.input();
  await composer.listeners.submit({ preventDefault() {} });
  assert.equal(input.value, 'Не потерять');
  assert.match(feedback.textContent, /Не удалось/);
  assert.equal(send.disabled, false);
  fail = false;
  input.value = 'a'.repeat(151);
  await composer.listeners.submit({ preventDefault() {} });
  assert.equal(writes.length, 2);
  vm.runInContext('closeChatSubscriptions()', context);
  assert.equal(stopped, 1);
  context.nextCard = new Element();
  vm.runInContext('attachChat(nextCard,item)', context);
  assert.equal(
    context.nextCard.children[0].children[1].children[1].children[0].children[1].value,
    'Не потерять',
    'Draft survives card rerender',
  );
  vm.runInContext(
    `quotaData={count:3,updatedAt:{toMillis:()=>Date.now()}};renderQuota();`,
    context,
  );
  assert.equal(bar['aria-valuenow'], '3');
  assert.equal(bar.children.filter((x) => x.dataset.filled === 'true').length, 3);
  vm.runInContext(
    `quotaData={count:5,updatedAt:{toMillis:()=>Date.now()-86400000}};renderQuota();`,
    context,
  );
  assert.equal(bar['aria-valuenow'], '0');
  document.querySelector('#form').elements.notes.value = 'a'.repeat(500);
  vm.runInContext('updateNotesCounter()', context);
  assert.equal(document.querySelector('#notes-counter').textContent, '500 / 500');
  console.log(
    'PASS: chat replies, safe rendering, failed-send drafts, lifecycle, daily segments and notes counter',
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
