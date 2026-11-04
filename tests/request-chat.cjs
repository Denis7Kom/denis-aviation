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
  adminListener,
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
    if (_query.some((part) => Array.isArray(part) && part[0] === 'authorRole'))
      adminListener = next;
    else listener = next;
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
  `user={uid:'alice',email:'alice@example.invalid'};db={};collection=fakeCollection;query=fakeQuery;orderBy=fakeOrder;limitToLast=fakeOrder;limit=fakeOrder;where=fakeOrder;onSnapshot=fakeSnapshot;addDoc=fakeAdd;serverTimestamp=fakeStamp;Timestamp=fakeTimestamp;`,
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
  assert.equal(shell.hidden, true, 'A new client request has no comment block');
  assert.equal(
    listener,
    undefined,
    'Do not load the full conversation before an administrator replies',
  );
  adminListener({ empty: true, docs: [] });
  assert.equal(shell.hidden, true);
  input.value = 'Too early';
  await composer.listeners.submit({ preventDefault() {} });
  assert.equal(writes.length, 0, 'Hidden composer cannot send before the administrator');
  adminListener({ empty: false, docs: [{ data: () => ({ authorRole: 'admin' }) }] });
  assert.equal(shell.hidden, false, 'First administrator reply reveals the conversation live');
  assert.equal(
    typeof listener,
    'function',
    'History loads automatically after first administrator reply',
  );
  input.value = '';
  input.listeners.input();
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
  assert.equal(stopped, 2);
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
  context.legacyCard = new Element();
  vm.runInContext(
    "attachChat(legacyCard,{id:'legacy',data:()=>({adminComment:'Previously approved'})})",
    context,
  );
  assert.equal(
    context.legacyCard.children[0].hidden,
    false,
    'Legacy administrator comments unlock replies',
  );
  context.adminCard = new Element();
  vm.runInContext(
    "user={uid:'admin',email:'deniska7best@gmail.com',emailVerified:true,providerData:[{providerId:'google.com'}]};attachChat(adminCard,{id:'fresh-admin',data:()=>({})})",
    context,
  );
  assert.equal(
    context.adminCard.children[0].hidden,
    false,
    'Administrator can always start the conversation',
  );
  console.log(
    'PASS: chat replies, safe rendering, failed-send drafts, lifecycle, daily segments and notes counter',
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
