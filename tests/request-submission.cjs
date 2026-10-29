const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

class Element {
  constructor() {
    this.listeners = {};
    this.children = [];
    this.hidden = false;
    this.disabled = false;
    this.dataset = {};
    this.value = '';
    this.classList = { toggle() {} };
  }
  addEventListener(type, handler) {
    this.listeners[type] = handler;
  }
  replaceChildren(...children) {
    this.children = children;
  }
  append(...children) {
    this.children.push(...children);
  }
  setAttribute() {}
}

function boot(failImports = false, search = '', storage = new Map()) {
  const elements = new Map();
  const get = (selector) => {
    if (!elements.has(selector)) elements.set(selector, new Element());
    return elements.get(selector);
  };
  const form = get('#form');
  form.fields = {
    type: 'flight',
    network: 'VATSIM',
    date: '2099-11-01',
    time: '18:30',
    timezone: 'Europe/Rome',
    callsign: ' TEST01 ',
    route: ' UUEE LIRN ',
    contact: ' @test ',
    notes: ' optional ',
  };
  form.elements = Object.fromEntries(Object.keys(form.fields).map((key) => [key, new Element()]));
  Object.defineProperty(form.elements.timezone, 'options', {
    get: () => form.elements.timezone.children,
  });
  for (const key of Object.keys(form.fields).filter((key) => !['timezone', 'type'].includes(key)))
    Object.defineProperty(form.elements[key], 'value', {
      get: () => form.fields[key],
      set: (value) => {
        form.fields[key] = value;
      },
    });
  Object.defineProperty(form.elements.timezone, 'value', {
    get: () => form.fields.timezone,
    set: (value) => (form.fields.timezone = value),
  });
  Object.defineProperty(form.elements.type, 'value', {
    get: () => form.fields.type,
    set: (value) => (form.fields.type = value),
  });
  form.valid = true;
  form.reportValidity = () => form.valid;
  form.resets = 0;
  form.reset = () => {
    form.resets++;
    for (const key of Object.keys(form.fields)) form.fields[key] = '';
  };
  const document = {
    documentElement: {},
    querySelector: get,
    querySelectorAll: () => [],
    createElement: () => new Element(),
  };
  const auth = { currentUser: null };
  const fakeUser = {
    uid: 'guest-123',
    email: 'guest@example.com',
    emailVerified: true,
    providerData: [{ providerId: 'google.com' }],
  };
  let observer;
  let signInMode = 'success';
  let signInCalls = 0;
  let writes = [];
  let resolveWrite;
  let rejectWrite;
  const appSdk = { initializeApp: () => ({}) };
  const authSdk = {
    getAuth: () => auth,
    GoogleAuthProvider: class {},
    onAuthStateChanged: (_auth, callback) => {
      observer = callback;
      callback(auth.currentUser);
    },
    signInWithPopup: () => {
      signInCalls++;
      if (signInMode === 'cancel') return Promise.reject({ code: 'auth/popup-closed-by-user' });
      if (signInMode === 'mismatch') return Promise.resolve({ user: fakeUser });
      auth.currentUser = fakeUser;
      observer(fakeUser);
      return Promise.resolve({ user: fakeUser });
    },
    signOut: async () => {
      auth.currentUser = null;
      observer(null);
    },
  };
  const fsSdk = {
    getFirestore: () => ({}),
    collection: () => 'requests',
    query: (...args) => args,
    where: (...args) => args,
    onSnapshot: (_query, _options, callback) => {
      callback({ empty: true, docs: [] });
      return () => {};
    },
    addDoc: (_collection, data) => {
      writes.push(data);
      return new Promise((resolve, reject) => {
        resolveWrite = resolve;
        rejectWrite = reject;
      });
    },
    serverTimestamp: () => 'server-time',
    updateDoc: () => {},
    doc: () => {},
  };
  const context = vm.createContext({
    document,
    window: { location: { search } },
    URLSearchParams,
    localStorage: {
      getItem: (key) => storage.get(key) || null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
    Intl,
    FormData: class {
      constructor(currentForm) {
        this.data = Object.entries(currentForm.fields);
      }
      entries() {
        return this.data[Symbol.iterator]();
      }
    },
    fakeAppImport: failImports ? Promise.reject(Error('offline')) : Promise.resolve(appSdk),
    fakeAuthImport: Promise.resolve(authSdk),
    fakeFsImport: Promise.resolve(fsSdk),
  });
  const source = fs
    .readFileSync('requests.js', 'utf8')
    .replace("import('https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js')", 'fakeAppImport')
    .replace(
      "import('https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js')",
      'fakeAuthImport',
    )
    .replace(
      "import('https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js')",
      'fakeFsImport',
    );
  vm.runInContext(source, context);
  const submit = () => {
    let prevented = false;
    const result = form.listeners.submit({
      currentTarget: form,
      preventDefault() {
        prevented = true;
      },
    });
    assert(prevented, 'Every submit is intercepted before any asynchronous operation');
    return result;
  };
  return {
    get,
    form,
    auth,
    fakeUser,
    submit,
    setSignInMode: (value) => (signInMode = value),
    getSignInCalls: () => signInCalls,
    getWrites: () => writes,
    resolveWrite: () => resolveWrite(),
    rejectWrite: () => rejectWrite(Error('offline')),
  };
}
const flush = () => new Promise((resolve) => setImmediate(resolve));

(async () => {
  const atc = boot(false, '?type=atc');
  await flush();
  assert.equal(atc.form.fields.type, 'atc', 'ATC links preselect the requested service');
  const unknown = boot(false, '?type=unknown');
  await flush();
  assert.equal(unknown.form.fields.type, 'flight', 'Ignore unknown request types');
  const storage = new Map();
  const draft = boot(false, '', storage);
  await flush();
  draft.form.listeners.input();
  assert.equal(storage.has('dk-flight-request-draft-v1'), false);
  draft.get('#save-draft').checked = true;
  draft.form.listeners.change();
  assert.equal(JSON.parse(storage.get('dk-flight-request-draft-v1')).contact, ' @test ');
  const restored = boot(false, '', storage);
  await flush();
  assert.equal(restored.form.fields.callsign, ' TEST01 ');
  assert.equal(restored.get('#save-draft').checked, true);
  restored.get('#save-draft').checked = false;
  restored.form.listeners.change();
  assert.equal(storage.has('dk-flight-request-draft-v1'), false);
  const app = boot(false, '', storage);
  assert(app.get('#send').disabled, 'Submission stays disabled while the SDK is loading');
  await app.submit();
  assert.equal(app.getWrites().length, 0);
  await flush();
  assert.equal(app.get('#send').disabled, false);
  assert.equal(app.get('#list-panel').hidden, true);
  assert.match(app.get('#send-label').textContent, /Google/);

  app.form.valid = false;
  await app.submit();
  assert.equal(app.getSignInCalls(), 0, 'Do not sign in for invalid form data');
  app.form.valid = true;
  app.form.fields.contact = '  ';
  await app.submit();
  assert.equal(app.getSignInCalls(), 0, 'Whitespace-only required fields are rejected');
  app.form.fields.contact = ' @test ';

  app.form.fields.date = '2001-01-01';
  await app.submit();
  assert.equal(app.getSignInCalls(), 0);
  assert.match(app.get('#notice').textContent, /прошло/);
  app.form.fields.date = '2099-11-01';
  app.form.fields.timezone = 'Invalid/Zone';
  await app.submit();
  assert.equal(app.getSignInCalls(), 0);
  assert.match(app.get('#notice').textContent, /IANA/);
  app.form.fields.timezone = 'Europe/Rome';
  app.get('#save-draft').checked = true;
  app.form.listeners.input();
  assert(storage.has('dk-flight-request-draft-v1'));
  app.setSignInMode('cancel');
  const cancelled = app.submit();
  assert.equal(app.getSignInCalls(), 1, 'The pop-up is opened in the submit event');
  await cancelled;
  assert.equal(app.getWrites().length, 0);
  assert.equal(app.form.fields.callsign, ' TEST01 ');
  assert.equal(app.form.resets, 0);
  assert.match(app.get('#notice').textContent, /отменён/);
  assert.equal(app.get('#send').disabled, false);

  app.setSignInMode('mismatch');
  await app.submit();
  assert.equal(app.getWrites().length, 0, 'Never write under a changed account');
  assert.equal(app.form.resets, 0);
  assert.match(app.get('#notice').textContent, /Аккаунт изменился/);

  app.setSignInMode('success');
  const submission = app.submit();
  await flush();
  assert.equal(app.get('#list-panel').hidden, false);
  assert.equal(app.get('#send').disabled, true);
  assert.equal(app.getWrites().length, 1);
  assert.equal(app.getWrites()[0].owner, app.fakeUser.uid);
  assert.equal(app.getWrites()[0].callsign, 'TEST01');
  assert.equal(app.getWrites()[0].notes, 'optional');
  assert.equal(app.getWrites()[0].status, 'new');
  await app.submit();
  assert.equal(app.getWrites().length, 1, 'A pending request cannot be submitted twice');
  app.resolveWrite();
  await submission;
  assert.equal(app.form.resets, 1, 'Reset only after the server acknowledges the write');
  assert.equal(storage.has('dk-flight-request-draft-v1'), false);
  assert.equal(app.get('#confirmation').hidden, false);
  assert.equal(app.form.hidden, true);
  assert.match(app.get('#confirmation-summary').textContent, /TEST01/);
  assert.match(app.get('#notice').textContent, /сохранена/);
  app.get('#new-form').listeners.click();
  assert.equal(app.form.hidden, false);
  assert(app.form.fields.timezone);
  assert.equal(app.get('#notice').textContent, '');

  Object.assign(app.form.fields, {
    type: 'atc',
    network: 'Infinite Flight',
    date: '2099-11-01',
    time: '19:00',
    callsign: 'TEST02',
    route: 'LIRN',
    contact: '@test',
    notes: '',
  });
  const signInsBefore = app.getSignInCalls();
  const failedWrite = app.submit();
  await flush();
  assert.equal(
    app.getSignInCalls(),
    signInsBefore,
    'Existing sessions send without another pop-up',
  );
  app.rejectWrite();
  await failedWrite;
  assert.equal(app.form.resets, 1, 'A failed write must preserve the form');
  assert.equal(app.form.fields.callsign, 'TEST02');
  assert.match(app.get('#notice').textContent, /не отправлена/);
  assert.equal(app.get('#send').disabled, false);

  const offline = boot(true);
  await flush();
  await offline.submit();
  assert.equal(offline.get('#send').disabled, true);
  assert.equal(offline.getWrites().length, 0);
  assert.match(offline.get('#notice').textContent, /Не удалось загрузить/);
  console.log(
    'PASS: guest form, sign-in, submission, cancellation, duplicate and failure handling',
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
