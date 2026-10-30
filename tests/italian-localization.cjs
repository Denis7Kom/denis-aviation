const assert = require('node:assert/strict');
const fs = require('node:fs');
for (const path of ['index.html', 'requests.html']) {
  const html = fs.readFileSync(path, 'utf8');
  for (const language of ['ru', 'en', 'it']) {
    assert.match(html, new RegExp(`data-lang="${language}"`), `${path}: missing ${language}`);
  }
  const translated = [...html.matchAll(/<[^>]+\bdata-en="[^"]*"[^>]*>/g)];
  assert(translated.length > 0, `${path}: missing translations`);
  for (const [tag] of translated) assert.match(tag, /\bdata-it="[^"]+"/, `${path}: ${tag}`);
}
console.log('PASS: Italian translation and language controls on both pages');
