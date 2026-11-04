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
let messageError, adminError;
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
  fakeSnapshot: (_query, next, error) => {
    if (_query.some((part) => Array.isArray(part) && part[0] === 'authorRole')) {
      adminListener = next;
      adminError = error;
    } else {
      listener = next;
      messageError = error;
    }
    return () => stopped++;
  },
  fakeAdd: async (ref, payload) => {
    if (fail) throw Error('offline');
    writes.push({ ref, payload });
  },
  fakeStamp: () => 'server-time',
  fakeTimestamp: { fromMillis: (ms) => ({ toMillis: () => ms }) },
});
vm.runInContext(
  fs.readFileSync('requests.js', 'utf8').split('async function start()')[0],
  context,
);
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
  adminListener({ empty: false, docs: [{ data: () => ({ authorRole: 'admin' }) }] });
  let release;
  context.sendBarrier = new Promise((resolve) => {
    release = resolve;
  });
  vm.runInContext('addDoc=async()=>await sendBarrier', context);
  input.value = 'Отправка';
  input.listeners.input();
  const sending = composer.listeners.submit({ preventDefault() {} });
  context.nextCard = new Element();
  vm.runInContext(
    'closeChatSubscriptions();chatViews.clear();attachChat(nextCard,item)',
    context,
  );
  const currentComposer = context.nextCard.children[0].children[1].children[1];
  const currentInput = currentComposer.children[0].children[1];
  assert.equal(currentInput.disabled, true);
  release();
  await sending;
  assert.equal(
    currentInput.disabled,
    false,
    'A recreated textarea unlocks after the pending write',
  );
  assert.equal(currentInput.value, '');
  let reject;
  context.sendBarrier = new Promise((_resolve, fail) => {
    reject = fail;
  });
  currentInput.value = 'Сохранить черновик';
  currentInput.listeners.input();
  const failed = currentComposer.listeners.submit({ preventDefault() {} });
  context.thirdCard = new Element();
  vm.runInContext(
    'closeChatSubscriptions();chatViews.clear();attachChat(thirdCard,item)',
    context,
  );
  reject(Error('offline'));
  await failed;
  const thirdComposer = context.thirdCard.children[0].children[1].children[1];
  assert.equal(thirdComposer.children[0].children[1].disabled, false);
  assert.equal(thirdComposer.children[0].children[1].value, 'Сохранить черновик');
  assert.match(thirdComposer.children[2].textContent, /Не удалось/);

  context.fresh = { id: 'fresh', data: () => ({}) };
  context.freshCard = new Element();
  vm.runInContext('attachChat(freshCard,fresh)', context);
  const freshShell = context.freshCard.children[0],
    freshPanel = freshShell.children[1];
  adminError(Error('offline'));
  assert.equal(freshShell.hidden, false, 'A failed first-reply lookup is visible');
  assert.equal(freshPanel.children[1].hidden, true, 'Failure does not unlock the composer');
  assert.match(freshPanel.children[3].textContent, /Не удалось/);
  freshPanel.children[4].onclick();
  adminListener({ empty: true, docs: [] });
  assert.equal(freshShell.hidden, true, 'Successful empty retry restores the waiting state');
  adminListener({ empty: false, docs: [{ data: () => ({ authorRole: 'admin' }) }] });
  const message = (number) => ({
    id: 'm' + String(number).padStart(3, '0'),
    data: () => ({
      authorUid: 'admin',
      authorRole: 'admin',
      body: 'Message ' + number,
      createdAt: { seconds: number, toDate: () => new Date(number * 1000) },
    }),
  });
  listener({ empty: false, docs: Array.from({ length: 10 }, (_, i) => message(i + 10)) });
  context.olderPage = { docs: Array.from({ length: 10 }, (_, i) => message(i)) };
  vm.runInContext('getDocs=async()=>olderPage;endBefore=(cursor)=>cursor', context);
  await freshPanel.children[2].listeners.click();
  assert.equal(freshPanel.children[0].children.length, 20);
  assert.equal(freshPanel.children[0].children[0].children[1].textContent, 'Message 0');
  listener({ empty: false, docs: Array.from({ length: 10 }, (_, i) => message(i + 11)) });
  assert.equal(
    freshPanel.children[0].children.length,
    21,
    'Live updates retain loaded older history',
  );
  context.olderPage = { docs: [] };
  await freshPanel.children[2].listeners.click();
  assert.equal(freshPanel.children[2].hidden, true);
  messageError(Error('offline'));
  assert.match(freshPanel.children[3].textContent, /Не удалось/);
  freshPanel.children[4].onclick();
  listener({ empty: false, docs: [message(20)] });
  assert.equal(freshPanel.children[4].hidden, true);
  console.log(
    'PASS: sending across rerenders, first-reply error/retry, paginated history and live updates',
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
