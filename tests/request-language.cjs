const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function boot(values, blocked = false) {
  const storage = new Map(Object.entries(values));
  const element = (dataset = {}) => ({
    dataset,
    textContent: '',
    attributes: {},
    listeners: {},
    addEventListener(type, handler) {
      this.listeners[type] = handler;
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
  });
  const ru = element({ lang: 'ru' }),
    en = element({ lang: 'en' });
  const translated = element({ ru: 'Заявка', en: 'Request' });
  const named = new Map([
    ['#form', { elements: { timezone: {} } }],
    ['#list-title', element()],
    ['#notice', element()],
  ]);
  const document = {
    title: '',
    documentElement: {},
    querySelector: (selector) => named.get(selector),
    querySelectorAll: (selector) =>
      selector === '[data-lang]' ? [ru, en] : selector === '[data-ru]' ? [translated] : [],
  };
  const localStorage = {
    getItem: (key) => {
      if (blocked) throw Error('storage blocked');
      return storage.get(key) || null;
    },
    setItem: (key, value) => {
      if (blocked) throw Error('storage blocked');
      storage.set(key, value);
    },
  };
  const context = vm.createContext({ document, localStorage, Intl });
  const source = fs.readFileSync('requests.js', 'utf8').split('async function start()')[0];
  vm.runInContext(source, context);
  return { document, storage, ru, en, translated, context, named };
}

const test = boot({ 'dk-aviation-lang': 'en', 'requests-language': 'ru' });
assert.equal(test.document.documentElement.lang, 'en');
assert.equal(test.en.attributes['aria-pressed'], 'true');
assert.equal(test.ru.attributes['aria-pressed'], 'false');
assert.equal(test.translated.textContent, 'Request');
vm.runInContext("notice('Сохранено', 'Saved');", test.context);
test.ru.listeners.click();
assert.equal(test.document.documentElement.lang, 'ru');
assert.equal(test.ru.attributes['aria-pressed'], 'true');
assert.equal(test.en.attributes['aria-pressed'], 'false');
assert.equal(test.translated.textContent, 'Заявка');
assert.equal(test.named.get('#notice').textContent, 'Сохранено');
assert.equal(test.storage.get('dk-aviation-lang'), 'ru');
const old = boot({ 'requests-language': 'en' });
assert.equal(old.document.documentElement.lang, 'en');
const restricted = boot({}, true);
restricted.en.listeners.click();
assert.equal(restricted.document.documentElement.lang, 'en');
console.log('PASS: language selection, shared preference, translated feedback and blocked storage');
