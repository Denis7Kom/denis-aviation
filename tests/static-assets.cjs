const assert = require('node:assert/strict');
const { existsSync, readFileSync, statSync } = require('node:fs');
const { resolve, relative, sep } = require('node:path');
const vm = require('node:vm');

const root = resolve(__dirname, '..');
const read = (file) => readFileSync(resolve(root, file), 'utf8');
const html = read('index.html');
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
const checked = new Set();

function checkResource(url) {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(url)) return;
  const [path, fragment] = url.split('#');
  if (!path && fragment) {
    assert(ids.has(fragment), `Missing HTML anchor: ${url}`);
    return;
  }
  const file = decodeURIComponent(path.split('?')[0]);
  if (!file) return;
  const target = resolve(root, file);
  assert(!relative(root, target).startsWith(`..${sep}`), `Resource outside project: ${url}`);
  assert(existsSync(target) && statSync(target).isFile(), `Missing local resource: ${url}`);
  checked.add(file);
}

// Published markup uses quoted attributes. Check both links and loaded assets.
for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) checkResource(match[1]);
for (const match of read('style.css').matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g)) {
  checkResource(match[1]);
}

const context = { window: {} };
vm.runInNewContext(read('gallery-data.js'), context, { timeout: 1000 });
assert(Array.isArray(context.window.DK_GALLERY), 'Gallery manifest must be an array');
for (const entry of context.window.DK_GALLERY) {
  assert.equal(typeof entry.src, 'string');
  checkResource(entry.src);
  for (const language of ['ru', 'en']) {
    assert.equal(typeof entry.alt?.[language], 'string');
    assert(entry.alt[language].trim(), `Missing ${language} gallery alt text`);
  }
}

const scripts = [...html.matchAll(/<script\b([^>]*)><\/script>/g)].map((match) => match[1]);
assert.equal(scripts.length, 3, 'Review changes to startup scripts');
for (const [index, file] of ['gallery-data.js', 'aircraft-renderer.js', 'app.js'].entries()) {
  assert(scripts[index].includes(`src="${file}?`), `Unexpected script order: ${file}`);
  assert(/\bdefer\b/.test(scripts[index]), `Missing defer: ${file}`);
}

for (const file of checked) {
  const bytes = readFileSync(resolve(root, file));
  if (file.endsWith('.pdf')) assert.equal(bytes.subarray(0, 5).toString(), '%PDF-');
  if (file.endsWith('.png')) assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  if (file.endsWith('.jpg')) assert.equal(bytes.subarray(0, 3).toString('hex'), 'ffd8ff');
}
console.log(`PASS: ${checked.size} local resources, gallery metadata and startup script order`);
