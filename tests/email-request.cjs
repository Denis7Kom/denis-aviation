const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('src/main.js', 'utf8');
const block = source.slice(
  source.indexOf("  const requestForm = $('#flight-request');"),
  source.indexOf('  function hudReadouts()'),
);
const elements = new Map();
const $ = (key) => {
  if (!elements.has(key))
    elements.set(key, {
      value: '',
      listeners: {},
      textContent: '',
      addEventListener(name, handler) {
        this.listeners[name] = handler;
      },
    });
  return elements.get(key);
};
$('#flight-request').reportValidity = () => true;
$('#request-type').selectedOptions = [{ textContent: 'Совместный полёт' }];
for (const [id, value] of Object.entries({
  network: 'VATSIM',
  date: '2030-12-31',
  time: '12:00',
  callsign: 'RYR3152',
  route: 'SVO → NAP',
  contact: '@pilot & + friend',
  notes: 'Детали & проверка',
}))
  $('#request-' + id).value = value;
const window = { location: { href: '' } };
const context = vm.createContext({ $, window, Intl, lang: 'ru' });
vm.runInContext(block, context);
$('#request-notes').listeners.input();
assert.equal($('#email-notes-counter').textContent, `${$('#request-notes').value.length} / 500`);
for (const [lang, label] of [
  ['ru', 'Позывной или никнейм:'],
  ['en', 'Callsign or nickname:'],
  ['it', 'Nominativo o nickname:'],
]) {
  context.lang = lang;
  $('#flight-request').listeners.submit({ preventDefault() {} });
  const url = new URL(window.location.href),
    body = url.searchParams.get('body');
  assert(body.includes(label));
  assert(body.includes('31.12.2030'));
  assert(body.includes('@pilot & + friend'));
  assert(body.includes('Детали & проверка'));
}
$('#request-contact').value = '';
$('#flight-request').listeners.submit({ preventDefault() {} });
assert(!new URL(window.location.href).searchParams.get('body').includes('Contatto:'));
const html = fs.readFileSync('index.html', 'utf8');
assert.match(html, /id="request-notes"[^>]*maxlength="500"/);
assert.match(html, /id="request-callsign"[^>]*placeholder="RYR3152"/);
assert.match(
  html,
  /id="request-route"[^>]*placeholder="LIRF → EGLL, SVO → NAP, Los Angeles Airport"/,
);
assert(!/id="request-contact"[^>]*\brequired\b/.test(html));
console.log(
  'PASS: email labels, optional contact, date, safe URL encoding and details counter in RU/EN/IT',
);
