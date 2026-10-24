const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { createHash } = require('node:crypto');
const { parse } = require('acorn');
const { join } = require('node:path');
const root = join(__dirname, '..');
const read = (path) => readFileSync(join(root, path), 'utf8');
const hash = (value) => createHash('sha256').update(value).digest('hex');
function syntax(node) {
  return JSON.stringify(node, function (key, value) {
    if (['start', 'end', 'raw'].includes(key)) return undefined;
    if (
      key === 'key' &&
      this.type === 'Property' &&
      !this.computed &&
      value.type === 'Identifier'
    ) {
      return { type: 'Literal', value: value.name };
    }
    return Array.isArray(value) ? value.filter((node) => node?.type !== 'EmptyStatement') : value;
  });
}
const contract = JSON.parse(read('tests/fixtures/refactor-contract.json'));
const main = parse(read('src/main.js'), { ecmaVersion: 'latest', sourceType: 'module' });
const shell = main.body.find((node) => node.type === 'ExpressionStatement').expression.callee.body
  .body;
assert.equal(
  hash(syntax(shell)),
  contract.shell,
  'Application shell changed beyond module extraction',
);
const extracted = contract.modules
  .flatMap((file) => {
    const ast = parse(read(file), { ecmaVersion: 'latest', sourceType: 'module' });
    return ast.body.map((node) => hash(syntax(node.declaration))).sort();
  })
  .sort();
assert.deepEqual(extracted, contract.extracted, 'Geometry or reference data changed');
for (const [file, expected] of Object.entries(contract.static)) {
  assert.equal(hash(read(file)), expected, `${file} changed`);
}
assert.equal(
  hash(syntax(parse(read('aircraft-renderer.js'), { ecmaVersion: 'latest' }))),
  contract.renderer,
  'Renderer behaviour or shader text changed',
);
// Compare formatter-normalised baselines so layout-only edits are permitted.
// The hashes were calculated from the original commit, not the formatted files.
async function checkFormattedAssets() {
  const { format } = await import('prettier');
  const options = JSON.parse(read('.prettierrc.json'));
  for (const [file, parser, expected] of [
    ['style.css', 'css', contract.stylesheet],
    ['gallery-data.js', 'babel', contract.gallery],
  ]) {
    assert.equal(
      hash(await format(read(file), { ...options, parser })),
      expected,
      `${file} changed beyond formatting`,
    );
  }
  console.log('PASS: original application statements, data, renderer, HTML and CSS preserved');
}
checkFormattedAssets().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
