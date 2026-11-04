const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const nodes = new Map();
const node = (key) => {
  if (!nodes.has(key))
    nodes.set(key, {
      dataset: {},
      children: [],
      classList: { toggle() {} },
      setAttribute() {},
      value: '',
      addEventListener() {},
      replaceChildren() {},
      append() {},
    });
  return nodes.get(key);
};
node('#form').elements = { timezone: node('timezone') };
const calls = [];
let resolvePopup, rejectPopup;
class GoogleAuthProvider {
  setCustomParameters(parameters) {
    this.parameters = parameters;
  }
}
const context = vm.createContext({
  document: {
    documentElement: {},
    querySelector: node,
    querySelectorAll: () => [],
    createElement: () => ({}),
  },
  localStorage: { getItem: () => null },
  Intl,
  sdk: {
    GoogleAuthProvider,
    signInWithPopup: (auth, provider) => {
      calls.push({ auth, provider });
      return new Promise((resolve, reject) => {
        resolvePopup = resolve;
        rejectPopup = reject;
      });
    },
  },
});
vm.runInContext(fs.readFileSync('requests.js', 'utf8').split('async function start()')[0], context);
vm.runInContext("authSdk=sdk;auth={};authReady=true;user={uid:'original'};", context);
(async () => {
  const first = vm.runInContext('switchAccount()', context);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].provider.parameters.prompt, 'select_account');
  assert.equal(node('#switch-account').disabled, true);
  await vm.runInContext('switchAccount()', context);
  assert.equal(calls.length, 1, 'Double clicks do not create another popup');
  rejectPopup({ code: 'auth/popup-closed-by-user' });
  await first;
  assert.equal(
    vm.runInContext('user.uid', context),
    'original',
    'Cancel preserves current sign-in',
  );
  assert.equal(node('#switch-account').disabled, false);
  vm.runInContext("chatStates.set('sending',{sending:true})", context);
  await vm.runInContext('switchAccount()', context);
  assert.equal(calls.length, 1, 'Cannot change account during a reply');
  vm.runInContext('chatStates.clear()', context);
  const second = vm.runInContext('switchAccount()', context);
  resolvePopup({ user: { uid: 'next' } });
  await second;
  assert.equal(calls.length, 2);
  assert.equal(vm.runInContext('phase', context), '');
  console.log(
    'PASS: explicit account selection, cancellation preserves sign-in, busy guards and retry',
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
